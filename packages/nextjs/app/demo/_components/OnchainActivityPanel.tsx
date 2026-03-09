"use client";

import React, { useEffect, useRef, useState } from "react";
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
const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

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
  const issuerCursorRef = useRef<bigint | null>(null);
  const issuerProfilesRef = useRef<Map<string, string>>(new Map());
  const issuerProfilesLoadedRef = useRef(false);
  const issuerHydratedRef = useRef(false);
  const issuerPersistenceReadyRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const refreshBlock = async () => {
      try {
        const bn = await baseSepoliaPublicClient.getBlockNumber();
        if (!cancelled) setLatestBlock(bn);
      } catch {
        // Keep last known block number.
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
    if (role !== "issuer") return;
    if (typeof window === "undefined") return;
    issuerHydratedRef.current = false;
    issuerPersistenceReadyRef.current = false;
    try {
      const raw = window.localStorage.getItem("citysync:demo:issuer:activity:v1");
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        cursor?: string;
        items?: Array<{ hash: `0x${string}`; label: string; blockNumber: string; timestamp?: string | null }>;
      };
      if (parsed.cursor) issuerCursorRef.current = BigInt(parsed.cursor);
      if (Array.isArray(parsed.items)) {
        setItems(
          parsed.items.slice(0, 12).map(item => ({
            hash: item.hash,
            label: item.label,
            blockNumber: BigInt(item.blockNumber),
            timestamp: item.timestamp ? BigInt(item.timestamp) : undefined,
          })),
        );
      }
    } catch {
      // Ignore hydration failures.
    } finally {
      issuerHydratedRef.current = true;
    }
  }, [role]);

  useEffect(() => {
    if (role !== "issuer") return;
    if (typeof window === "undefined") return;
    if (!issuerHydratedRef.current) return;
    if (!issuerPersistenceReadyRef.current) {
      issuerPersistenceReadyRef.current = true;
      return;
    }
    try {
      window.localStorage.setItem(
        "citysync:demo:issuer:activity:v1",
        JSON.stringify({
          cursor: issuerCursorRef.current?.toString() ?? null,
          items: items.map(item => ({
            hash: item.hash,
            label: item.label,
            blockNumber: item.blockNumber.toString(),
            timestamp: item.timestamp ? item.timestamp.toString() : null,
          })),
        }),
      );
    } catch {
      // Ignore persistence failures.
    }
  }, [items, role]);

  useEffect(() => {
    const run = async () => {
      if (latestBlock === null) return;

      if (role === "issuer") {
        if (!issuerProfilesLoadedRef.current) {
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
                  // fallback below
                }
                return [issuer.toLowerCase(), `${issuer.slice(0, 6)}...${issuer.slice(-4)}`] as const;
              }),
            );

            profiles.forEach(([addr, name]) => issuerProfilesRef.current.set(addr, name));
          } catch {
            // Non-fatal; fallback labels will still render.
          } finally {
            issuerProfilesLoadedRef.current = true;
          }
        }

        if (issuerCursorRef.current === null) {
          issuerCursorRef.current = latestBlock > 4_000n ? latestBlock - 4_000n : 0n;
        }

        let from = issuerCursorRef.current + 1n;
        if (from > latestBlock) return;

        const newItems: ActivityItem[] = [];
        const seen = new Set<string>();
        const chunk = 400n;

        while (from <= latestBlock) {
          const to = from + chunk > latestBlock ? latestBlock : from + chunk;
          const logs = await baseSepoliaPublicClient
            .getLogs({
              address: BASE_SEPOLIA_CONTRACTS.OpportunityManager.address,
              fromBlock: from,
              toBlock: to,
            } as any)
            .catch(() => []);

          for (const log of logs as any[]) {
            const hash = log.transactionHash as `0x${string}` | undefined;
            const bn = log.blockNumber as bigint | undefined;
            if (!hash || bn === undefined) continue;

            let eventName = "";
            let issuerAddress: string | undefined;
            try {
              const decoded = decodeEventLog({
                abi: BASE_SEPOLIA_CONTRACTS.OpportunityManager.abi as any,
                topics: [...(log.topics as readonly `0x${string}`[])] as any,
                data: log.data,
              }) as { eventName: string; args: Record<string, unknown> };
              eventName = decoded.eventName;
              if (eventName === "OpportunityCreated" && typeof decoded.args.issuer === "string") {
                issuerAddress = decoded.args.issuer;
              }
            } catch {
              continue;
            }

            if (eventName !== "OpportunityCreated" && eventName !== "CompletionVerified") continue;

            let actorLabel = "Issuer Network";
            if (issuerAddress && issuerAddress.toLowerCase() !== ZERO_ADDR) {
              actorLabel =
                issuerProfilesRef.current.get(issuerAddress.toLowerCase()) ??
                `${issuerAddress.slice(0, 6)}...${issuerAddress.slice(-4)}`;
            }

            if (eventName === "CompletionVerified" && actorLabel === "Issuer Network") {
              try {
                const tx = await baseSepoliaPublicClient.getTransaction({ hash });
                const fromAddr = tx.from.toLowerCase();
                actorLabel = issuerProfilesRef.current.get(fromAddr) ?? `${tx.from.slice(0, 6)}...${tx.from.slice(-4)}`;
              } catch {
                // leave fallback label
              }
            }

            const action = eventName === "OpportunityCreated" ? "createOpportunity" : "verifyCompletion";
            const key = `${hash}:${action}`;
            if (seen.has(key)) continue;
            seen.add(key);

            newItems.push({
              hash,
              blockNumber: bn,
              label: `${actorLabel} · ${action}`,
            });
          }

          from = to + 1n;
        }

        issuerCursorRef.current = latestBlock;
        if (newItems.length === 0) return;

        const uniqueBlocks = Array.from(new Set(newItems.map(item => item.blockNumber.toString()))).map(v => BigInt(v));
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

        setItems(prev => {
          const merged = [
            ...newItems.map(item => ({ ...item, timestamp: blockTimeMap.get(item.blockNumber.toString()) })),
            ...prev,
          ];
          const dedup = new Map<string, ActivityItem>();
          merged.forEach(item => {
            const key = `${item.hash}:${item.label}`;
            if (!dedup.has(key)) dedup.set(key, item);
          });
          return Array.from(dedup.values())
            .sort((a, b) => Number(b.blockNumber - a.blockNumber))
            .slice(0, 12);
        });

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
