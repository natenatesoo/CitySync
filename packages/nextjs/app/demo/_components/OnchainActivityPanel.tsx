"use client";

import React, { useEffect, useState } from "react";
import { decodeEventLog } from "viem";
import { baseSepoliaPublicClient } from "../_config/baseSepoliaClient";
import { BASE_SEPOLIA_CONTRACTS } from "../_config/baseSepoliaContracts";

type ActivityRole = "participant" | "issuer" | "redeemer";

type ActivityItem = {
  hash: `0x${string}`;
  label: string;
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

const ACTION_BY_EVENT: Record<string, string> = {
  IssuerRegistered: "register",
  OpportunityCreated: "createOpportunity",
  CompletionSubmitted: "submitCompletion",
  CompletionVerified: "verifyCompletion",
  OpportunityClaimed: "claimOpportunity",
  OpportunityUnclaimed: "unclaimOpportunity",
  OpportunityStatusSet: "setOpportunityActive",
};

const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

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

      if (role === "issuer") {
        const issuerProfiles = new Map<string, string>();
        try {
          const issuers = (await baseSepoliaPublicClient.readContract({
            address: BASE_SEPOLIA_CONTRACTS.IssuerRegistryDemo.address,
            abi: BASE_SEPOLIA_CONTRACTS.IssuerRegistryDemo.abi,
            functionName: "getAllIssuers",
            args: [],
          })) as `0x${string}`[];

          const profiles = await Promise.all(
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
                // Ignore profile read failures and fallback to short address.
              }
              return [issuer.toLowerCase(), `${issuer.slice(0, 6)}...${issuer.slice(-4)}`] as const;
            }),
          );
          profiles.forEach(([addr, name]) => issuerProfiles.set(addr, name));
        } catch {
          // Continue with address fallback labels.
        }
        const candidate: ActivityItem[] = [];
        const seenTx = new Set<string>();
        const roleAddresses = new Set([
          BASE_SEPOLIA_CONTRACTS.IssuerRegistryDemo.address.toLowerCase(),
          BASE_SEPOLIA_CONTRACTS.OpportunityManager.address.toLowerCase(),
        ]);

        for (let offset = 0n; offset < 220n && candidate.length < 24; offset++) {
          const bn = latestBlock - offset;
          if (bn < 0n) break;
          try {
            const block = await baseSepoliaPublicClient.getBlock({ blockNumber: bn });
            for (const hash of block.transactions) {
              if (candidate.length >= 24) break;
              if (seenTx.has(hash)) continue;
              seenTx.add(hash);
              try {
                const receipt = await baseSepoliaPublicClient.getTransactionReceipt({ hash });
                const roleLog = receipt.logs.find(log => roleAddresses.has(log.address.toLowerCase()));
                if (!roleLog) continue;

                let eventName = "onchainEvent";
                let actorAddress: string | undefined;
                try {
                  if (
                    roleLog.address.toLowerCase() === BASE_SEPOLIA_CONTRACTS.OpportunityManager.address.toLowerCase()
                  ) {
                    const decoded = decodeEventLog({
                      abi: BASE_SEPOLIA_CONTRACTS.OpportunityManager.abi as any,
                      topics: roleLog.topics,
                      data: roleLog.data,
                    }) as { eventName: string; args: Record<string, unknown> };
                    eventName = String(decoded.eventName);
                    const args = decoded.args as Record<string, unknown>;
                    actorAddress =
                      typeof args.issuer === "string"
                        ? args.issuer
                        : typeof args.citizen === "string"
                          ? args.citizen
                          : undefined;
                  } else {
                    const decoded = decodeEventLog({
                      abi: BASE_SEPOLIA_CONTRACTS.IssuerRegistryDemo.abi as any,
                      topics: roleLog.topics,
                      data: roleLog.data,
                    }) as { eventName: string; args: Record<string, unknown> };
                    eventName = String(decoded.eventName);
                    const args = decoded.args as Record<string, unknown>;
                    actorAddress = typeof args.issuer === "string" ? args.issuer : undefined;
                  }
                } catch {
                  // Keep fallback event label.
                }

                if (!actorAddress || actorAddress.toLowerCase() === ZERO_ADDR) {
                  try {
                    const tx = await baseSepoliaPublicClient.getTransaction({ hash });
                    actorAddress = tx.from;
                  } catch {
                    // Keep unknown actor fallback.
                  }
                }

                const actor = actorAddress
                  ? (issuerProfiles.get(actorAddress.toLowerCase()) ??
                    `${actorAddress.slice(0, 6)}...${actorAddress.slice(-4)}`)
                  : "Unknown issuer";
                const action = ACTION_BY_EVENT[eventName] ?? eventName;

                candidate.push({
                  hash,
                  blockNumber: bn,
                  timestamp: block.timestamp,
                  label: `${actor} · ${action}`,
                });
              } catch {
                // Ignore failed receipt reads.
              }
            }
          } catch {
            // Ignore failed block reads.
          }
        }

        if (candidate.length > 0) {
          candidate.sort((a, b) => Number(b.blockNumber - a.blockNumber));
          setItems(candidate.slice(0, 12));
        }
        // Keep last successful items if scan returned nothing.
        return;
      }

      const roleContracts =
        role === "participant"
          ? [
              { address: BASE_SEPOLIA_CONTRACTS.OpportunityManager.address, label: "Participant Task Activity" },
              { address: BASE_SEPOLIA_CONTRACTS.Redemption.address, label: "Participant Redemption Activity" },
              { address: BASE_SEPOLIA_CONTRACTS.MCERedemption.address, label: "Participant MCE Activity" },
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

      const hydrated = top.map(item => ({
        ...item,
        timestamp: blockTimeMap.get(item.blockNumber.toString()),
      }));
      if (hydrated.length > 0) setItems(hydrated);
      // Keep previous state on empty responses to avoid panel flicker.
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
