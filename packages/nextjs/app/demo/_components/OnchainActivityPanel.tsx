"use client";

import React, { useEffect, useState } from "react";
import { decodeFunctionData } from "viem";
import { baseSepoliaPublicClient } from "../_config/baseSepoliaClient";
import { BASE_SEPOLIA_CONTRACTS } from "../_config/baseSepoliaContracts";

type ActivityRole = "participant" | "issuer" | "redeemer";

type ActivityItem = {
  hash: `0x${string}`;
  label: string;
  actor?: string;
  action?: string;
  blockNumber: bigint;
  timestamp?: bigint;
};

const EXPLORER_TX = "https://sepolia.basescan.org/tx/";

const shortHash = (hash: string) => `${hash.slice(0, 8)}...${hash.slice(-6)}`;

const formatTimestamp = (timestamp?: bigint) => {
  if (!timestamp) return "Pending";
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

function toItems(
  label: string,
  logs: Array<{ transactionHash?: `0x${string}`; blockNumber?: bigint }>,
): ActivityItem[] {
  return logs
    .map(log => {
      if (!log.transactionHash || log.blockNumber === undefined) return null;
      return {
        hash: log.transactionHash,
        label,
        blockNumber: log.blockNumber,
      };
    })
    .filter(Boolean) as ActivityItem[];
}

export function OnchainActivityPanel({ role, accent }: { role: ActivityRole; accent: string }) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [latestBlock, setLatestBlock] = useState<bigint | null>(null);

  useEffect(() => {
    let cancelled = false;
    const refreshBlock = async () => {
      try {
        const bn = await baseSepoliaPublicClient.getBlockNumber();
        if (!cancelled) setLatestBlock(bn);
      } catch {
        // no-op: keep last known block
      }
    };

    void refreshBlock();
    const id = window.setInterval(() => void refreshBlock(), 7000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  useEffect(() => {
    const run = async () => {
      if (latestBlock === null) return;

      const roleContracts =
        role === "participant"
          ? [
              { address: BASE_SEPOLIA_CONTRACTS.OpportunityManager.address, label: "Participant Task Activity" },
              { address: BASE_SEPOLIA_CONTRACTS.Redemption.address, label: "Participant Redemption Activity" },
              { address: BASE_SEPOLIA_CONTRACTS.MCERedemption.address, label: "Participant MCE Activity" },
            ]
          : role === "issuer"
            ? [
                { address: BASE_SEPOLIA_CONTRACTS.IssuerRegistryDemo.address, label: "Issuer Registration Activity" },
                { address: BASE_SEPOLIA_CONTRACTS.OpportunityManager.address, label: "Issuer Task Activity" },
              ]
            : [
                { address: BASE_SEPOLIA_CONTRACTS.DemoRedeemerRegistry.address, label: "Redeemer Registry Activity" },
                { address: BASE_SEPOLIA_CONTRACTS.Redemption.address, label: "Redeemer Redemption Activity" },
                { address: BASE_SEPOLIA_CONTRACTS.MCERedemption.address, label: "Redeemer MCE Activity" },
              ];

      const fetchLogsBackwards = async (address: `0x${string}`) => {
        const collected: Array<{ transactionHash?: `0x${string}`; blockNumber?: bigint }> = [];
        let cursor = latestBlock;
        let step = 2_000n;

        for (let i = 0; i < 12 && cursor >= 0n && collected.length < 24; i++) {
          const fromBlock = cursor > step ? cursor - step : 0n;
          try {
            const logs = await baseSepoliaPublicClient.getLogs({
              address,
              fromBlock,
              toBlock: cursor,
            } as any);
            collected.push(...logs);
            if (fromBlock === 0n) break;
            cursor = fromBlock - 1n;
          } catch {
            if (step > 250n) {
              step = step / 2n;
              continue;
            }
            break;
          }
        }

        return collected;
      };

      const settled = await Promise.allSettled(roleContracts.map(c => fetchLogsBackwards(c.address)));

      const next: ActivityItem[] = [];
      settled.forEach((s, i) => {
        if (s.status === "fulfilled") next.push(...toItems(roleContracts[i].label, s.value || []));
      });

      if (role === "issuer") {
        const uniqueByHash = new Map<string, ActivityItem>();
        next.forEach(item => {
          if (!uniqueByHash.has(item.hash)) uniqueByHash.set(item.hash, item);
        });

        if (uniqueByHash.size === 0) {
          for (let offset = 0n; offset < 160n; offset++) {
            const bn = latestBlock - offset;
            if (bn < 0n) break;
            try {
              const block = await baseSepoliaPublicClient.getBlock({ blockNumber: bn, includeTransactions: true });
              for (const tx of block.transactions) {
                const to = tx.to?.toLowerCase();
                if (
                  to === BASE_SEPOLIA_CONTRACTS.OpportunityManager.address.toLowerCase() ||
                  to === BASE_SEPOLIA_CONTRACTS.IssuerRegistryDemo.address.toLowerCase()
                ) {
                  uniqueByHash.set(tx.hash, {
                    hash: tx.hash,
                    label: "Issuer Activity",
                    blockNumber: bn,
                    timestamp: block.timestamp,
                  });
                }
              }
              if (uniqueByHash.size >= 24) break;
            } catch {
              // continue scanning
            }
          }
        }

        const issuerProfiles = new Map<string, string>();
        try {
          const issuers = (await baseSepoliaPublicClient.readContract({
            address: BASE_SEPOLIA_CONTRACTS.IssuerRegistryDemo.address,
            abi: BASE_SEPOLIA_CONTRACTS.IssuerRegistryDemo.abi,
            functionName: "getAllIssuers",
            args: [],
          })) as `0x${string}`[];
          const profileEntries = await Promise.all(
            issuers.map(async issuer => {
              try {
                const p = (await baseSepoliaPublicClient.readContract({
                  address: BASE_SEPOLIA_CONTRACTS.IssuerRegistryDemo.address,
                  abi: BASE_SEPOLIA_CONTRACTS.IssuerRegistryDemo.abi,
                  functionName: "getProfile",
                  args: [issuer],
                })) as { orgName: string; active: boolean; registeredAt: bigint };
                if (p.active && p.registeredAt > 0n && p.orgName) return [issuer.toLowerCase(), p.orgName] as const;
              } catch {
                // ignore profile read failures
              }
              return [issuer.toLowerCase(), `${issuer.slice(0, 6)}...${issuer.slice(-4)}`] as const;
            }),
          );
          profileEntries.forEach(([k, v]) => issuerProfiles.set(k, v));
        } catch {
          // continue with address fallback
        }

        const decodeIssuerAction = (to: string | null, input: string) => {
          if (!to || input === "0x") return "unknownCall";
          try {
            if (to.toLowerCase() === BASE_SEPOLIA_CONTRACTS.OpportunityManager.address.toLowerCase()) {
              const d = decodeFunctionData({
                abi: BASE_SEPOLIA_CONTRACTS.OpportunityManager.abi as any,
                data: input as `0x${string}`,
              });
              return String(d.functionName);
            }
            if (to.toLowerCase() === BASE_SEPOLIA_CONTRACTS.IssuerRegistryDemo.address.toLowerCase()) {
              const d = decodeFunctionData({
                abi: BASE_SEPOLIA_CONTRACTS.IssuerRegistryDemo.abi as any,
                data: input as `0x${string}`,
              });
              return String(d.functionName);
            }
          } catch {
            // fallback below
          }
          return `${input.slice(0, 10)}...`;
        };

        const txDetails = await Promise.all(
          Array.from(uniqueByHash.values()).map(async item => {
            try {
              const tx = await baseSepoliaPublicClient.getTransaction({ hash: item.hash });
              const actorAddress = tx.from?.toLowerCase();
              const actorName = actorAddress
                ? (issuerProfiles.get(actorAddress) ?? `${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`)
                : "Unknown issuer";
              const action = decodeIssuerAction(tx.to, tx.input);
              return {
                ...item,
                actor: actorName,
                action,
                label: `${actorName} · ${action}`,
              };
            } catch {
              return item;
            }
          }),
        );

        txDetails.sort((a, b) => Number(b.blockNumber - a.blockNumber));
        const topIssuer = txDetails.slice(0, 12);

        const uniqueBlocks = Array.from(new Set(topIssuer.map(item => item.blockNumber.toString()))).map(v =>
          BigInt(v),
        );
        const blockPairs = await Promise.all(
          uniqueBlocks.map(async bn => {
            try {
              const block = await baseSepoliaPublicClient.getBlock({ blockNumber: bn });
              return [bn.toString(), block.timestamp] as const;
            } catch {
              return [bn.toString(), undefined] as const;
            }
          }),
        );
        const blockTimeMap = new Map<string, bigint | undefined>(blockPairs);

        setItems(
          topIssuer.map(item => ({
            ...item,
            timestamp: blockTimeMap.get(item.blockNumber.toString()),
          })),
        );
        return;
      }

      next.sort((a, b) => Number(b.blockNumber - a.blockNumber));
      const top = next.slice(0, 12);

      const uniqueBlocks = Array.from(new Set(top.map(item => item.blockNumber.toString()))).map(v => BigInt(v));
      const blockPairs = await Promise.all(
        uniqueBlocks.map(async bn => {
          try {
            const block = await baseSepoliaPublicClient.getBlock({ blockNumber: bn });
            return [bn.toString(), block.timestamp] as const;
          } catch {
            return [bn.toString(), undefined] as const;
          }
        }),
      );
      const blockTimeMap = new Map<string, bigint | undefined>(blockPairs);

      setItems(
        top.map(item => ({
          ...item,
          timestamp: blockTimeMap.get(item.blockNumber.toString()),
        })),
      );
    };

    void run();
  }, [latestBlock, role]);

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16,
        padding: "14px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: accent,
          marginBottom: 10,
        }}
      >
        {role === "issuer" ? "Issuer Onchain Activity (Global)" : "Recent Onchain Activity"}
      </div>

      {items.length === 0 ? (
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>No recent transactions detected yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((item, idx) => (
            <a
              key={`${item.hash}-${idx}`}
              href={`${EXPLORER_TX}${item.hash}`}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10,
                padding: "10px 12px",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: accent }}>{item.label}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "monospace" }}>
                  {shortHash(item.hash)}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                  Block {item.blockNumber.toString()} · {formatTimestamp(item.timestamp)}
                </div>
              </div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap" }}>View Tx ↗</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
