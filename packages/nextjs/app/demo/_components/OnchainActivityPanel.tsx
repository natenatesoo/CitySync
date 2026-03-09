"use client";

import React, { useEffect, useMemo, useState } from "react";
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

export function OnchainActivityPanel({ role, accent }: { role: ActivityRole; accent: string }) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [latestBlock, setLatestBlock] = useState<bigint | null>(null);

  const fromBlock = useMemo(() => {
    if (!latestBlock) return 0n;
    return latestBlock > 80_000n ? latestBlock - 80_000n : 0n;
  }, [latestBlock]);

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

      const fetchLogs = async (address: `0x${string}`, startBlock: bigint) => {
        try {
          return await baseSepoliaPublicClient.getLogs({
            address,
            fromBlock: startBlock,
            toBlock: latestBlock,
          } as any);
        } catch {
          const tighterStart = latestBlock > 8_000n ? latestBlock - 8_000n : 0n;
          try {
            return await baseSepoliaPublicClient.getLogs({
              address,
              fromBlock: tighterStart,
              toBlock: latestBlock,
            } as any);
          } catch {
            return [];
          }
        }
      };

      const settled = await Promise.allSettled(roleContracts.map(c => fetchLogs(c.address, fromBlock)));

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

      setItems(
        top.map(item => ({
          ...item,
          timestamp: blockTimeMap.get(item.blockNumber.toString()),
        })),
      );
    };

    void run();
  }, [fromBlock, latestBlock, role]);

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
        Recent Onchain Activity
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
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", whiteSpace: "nowrap" }}>Open ↗</div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
