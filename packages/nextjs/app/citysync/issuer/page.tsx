"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ContractAddresses } from "../_components/ContractAddresses";
import { Section } from "../_components/Section";
import { Address } from "@scaffold-ui/components";
import { decodeEventLog, formatUnits, parseUnits } from "viem";
import { useAccount, useBlockNumber, usePublicClient, useReadContracts } from "wagmi";
import {
  useDeployedContractInfo,
  useScaffoldReadContract,
  useScaffoldWriteContract,
  useTargetNetwork,
} from "~~/hooks/scaffold-eth";

type OppMetadata = {
  description?: string;
  date?: string;
  time?: string;
};

function parseOppMetadata(metadataURI: string | undefined): OppMetadata {
  if (!metadataURI) return {};
  const s = metadataURI.trim();
  if (!s.startsWith("{")) return { description: s };
  try {
    const parsed = JSON.parse(s);
    return { description: parsed?.description, date: parsed?.date, time: parsed?.time };
  } catch {
    return { description: metadataURI };
  }
}

function completionStatusLabel(status?: bigint): string {
  if (status === undefined) return "Unknown";
  if (status === 0n) return "Unclaimed";
  if (status === 1n) return "Pending";
  if (status === 2n) return "Completed";
  if (status === 3n) return "Invalidated";
  return "Unknown";
}

export default function IssuerJourney() {
  const { address } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const publicClient = usePublicClient();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  const { data: mgrInfo } = useDeployedContractInfo({ contractName: "OpportunityManager" });

  const { data: nextOpp } = useScaffoldReadContract({
    contractName: "OpportunityManager",
    functionName: "nextOpportunityId",
  } as any);

  const oppIds = useMemo(() => {
    const n = Number(nextOpp ?? 1n);
    const cap = 50;
    const count = Math.max(0, Math.min(n - 1, cap));
    return Array.from({ length: count }, (_v, i) => BigInt(i + 1));
  }, [nextOpp]);

  const canBatchRead = !!mgrInfo?.address && !!mgrInfo?.abi && oppIds.length > 0;

  const { data: oppReads } = useReadContracts({
    contracts: canBatchRead
      ? oppIds.map(id => ({
          address: mgrInfo!.address as `0x${string}`,
          abi: mgrInfo!.abi,
          functionName: "opportunities",
          args: [id],
        }))
      : [],
    query: { enabled: canBatchRead },
  });

  const { data: claimReads } = useReadContracts({
    contracts: canBatchRead
      ? oppIds.map(id => ({
          address: mgrInfo!.address as `0x${string}`,
          abi: mgrInfo!.abi,
          functionName: "claimedBy",
          args: [id],
        }))
      : [],
    query: { enabled: canBatchRead },
  });

  const { writeContractAsync: createOpp, isMining: isCreating } = useScaffoldWriteContract("OpportunityManager");
  const { writeContractAsync: setVerifier } = useScaffoldWriteContract("OpportunityManager");

  const [description, setDescription] = useState<string>("Community cleanup");
  const [date, setDate] = useState<string>("2026-02-01");
  const [time, setTime] = useState<string>("09:00");

  const metadataURI = useMemo(() => {
    // For MVP: store metadata inline as JSON (still fits into the onchain `metadataURI` string).
    return JSON.stringify({ description, date, time });
  }, [description, date, time]);

  const [rewardCity, setRewardCity] = useState<string>("5");
  const [mode, setMode] = useState<string>("0"); // IssuerOnly by default

  const [verifierAddr, setVerifierAddr] = useState<string>("");

  // Activity log: claimed timestamps per opportunity (best-effort from logs)
  const [claimedAtByOpp, setClaimedAtByOpp] = useState<Record<string, number>>({});

  const issuerOpps = useMemo(() => {
    if (!address) return [] as Array<{ id: bigint; opp: any; claimant?: `0x${string}` }>;

    return oppIds
      .map((id, i) => {
        const opp = (oppReads?.[i]?.result ?? undefined) as any;
        const issuer = (opp?.issuer ?? opp?.[0]) as string | undefined;
        if (!issuer || issuer.toLowerCase() !== address.toLowerCase()) return null;

        const claimant = (claimReads?.[i]?.result ?? undefined) as `0x${string}` | undefined;
        return { id, opp, claimant };
      })
      .filter(Boolean) as any;
  }, [address, oppIds, oppReads, claimReads]);

  const claimants = useMemo(() => {
    return issuerOpps.map((x: any) => {
      const c = x.claimant;
      if (!c || c === "0x0000000000000000000000000000000000000000") return undefined;
      return c;
    });
  }, [issuerOpps]);

  const completionContracts = useMemo(() => {
    if (!canBatchRead) return [];
    return issuerOpps
      .map((x: any, idx: number) => {
        const claimant = claimants[idx];
        if (!claimant) return null;
        return {
          address: mgrInfo!.address as `0x${string}`,
          abi: mgrInfo!.abi,
          functionName: "completions" as const,
          args: [x.id, claimant] as const,
        };
      })
      .filter(Boolean) as any[];
  }, [canBatchRead, issuerOpps, claimants, mgrInfo]);

  const { data: completionReads } = useReadContracts({
    contracts: completionContracts,
    query: { enabled: canBatchRead && completionContracts.length > 0 },
  });

  useEffect(() => {
    const run = async () => {
      if (!publicClient || !mgrInfo?.address || !mgrInfo?.abi || !blockNumber) return;
      if (issuerOpps.length === 0) return;

      const fromBlock = blockNumber > 5000n ? blockNumber - 5000n : 0n;
      const logs = await publicClient.getLogs({
        address: mgrInfo.address as `0x${string}`,
        event: {
          type: "event",
          name: "OpportunityClaimed",
          inputs: [
            { indexed: true, name: "opportunityId", type: "uint256" },
            { indexed: true, name: "citizen", type: "address" },
          ],
        },
        fromBlock,
        toBlock: blockNumber,
      } as any);

      const relevant = new Set(issuerOpps.map((x: any) => x.id.toString()));
      const newestByOpp: Record<string, bigint> = {};

      for (const l of logs as any[]) {
        try {
          const d = decodeEventLog({ abi: mgrInfo.abi as any, data: l.data, topics: l.topics }) as any;
          const oppId = BigInt(d.args.opportunityId).toString();
          if (!relevant.has(oppId)) continue;
          const bn = l.blockNumber as bigint;
          if (!newestByOpp[oppId] || bn > newestByOpp[oppId]) newestByOpp[oppId] = bn;
        } catch {}
      }

      const updates: Record<string, number> = {};
      for (const [oppId, bn] of Object.entries(newestByOpp)) {
        try {
          const blk = await publicClient.getBlock({ blockNumber: bn });
          updates[oppId] = Number(blk.timestamp);
        } catch {}
      }

      if (Object.keys(updates).length) {
        setClaimedAtByOpp(prev => ({ ...prev, ...updates }));
      }
    };

    run();
  }, [publicClient, mgrInfo?.address, mgrInfo?.abi, blockNumber, issuerOpps]);

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-base-content/70">City/Sync</div>
          <h1 className="text-2xl font-bold">Issuer Journey</h1>
          <div className="mt-1 text-sm text-base-content/70">
            Create opportunities, assign rewards, and verify completions to mint CITY + VOTE.
          </div>
        </div>
        <Link href="/citysync" className="link">
          ← back
        </Link>
      </div>

      <ContractAddresses addresses={[{ label: "OpportunityManager", address: mgrInfo?.address }]} />

      <Section title="Your wallet" subtitle="Issuer actions require your wallet to have CERTIFIED_ISSUER_ROLE onchain.">
        <div className="flex items-center justify-between">
          <div className="text-sm text-base-content/70">Connected wallet</div>
          <div>
            {address ? <Address address={address} chain={targetNetwork} size="sm" /> : <span>not connected</span>}
          </div>
        </div>
      </Section>

      <Section
        title="Create opportunity"
        subtitle="Creates a new volunteer opportunity. Enter reward as whole CITY tokens; VOTE is always minted 1:1 with CITY."
      >
        <div className="flex flex-col gap-3">
          <div className="text-sm text-base-content/70">
            nextOpportunityId (exclusive): {nextOpp?.toString?.() ?? "?"}
          </div>
          <div className="flex gap-2 flex-wrap">
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Description</span>
              </div>
              <input
                className="input input-bordered"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="e.g., Park cleanup"
              />
            </label>

            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Date</span>
              </div>
              <input className="input input-bordered" value={date} onChange={e => setDate(e.target.value)} />
            </label>

            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Time</span>
              </div>
              <input className="input input-bordered" value={time} onChange={e => setTime(e.target.value)} />
            </label>

            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Reward (CITY)</span>
              </div>
              <input
                className="input input-bordered"
                value={rewardCity}
                onChange={e => setRewardCity(e.target.value)}
                placeholder="5"
              />
              <div className="label">
                <span className="label-text-alt text-base-content/60">VOTE will be minted 1:1 with CITY</span>
              </div>
            </label>

            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Verification mode</span>
              </div>
              <select className="select select-bordered" value={mode} onChange={e => setMode(e.target.value)}>
                <option value="0">Issuer verifies (default)</option>
                <option value="1">Delegated verifier</option>
                <option value="2">EIP712 signature</option>
              </select>
            </label>

            {mode === "1" ? (
              <label className="form-control w-full max-w-md">
                <div className="label">
                  <span className="label-text">Delegated verifier address</span>
                </div>
                <input
                  className="input input-bordered"
                  value={verifierAddr}
                  onChange={e => setVerifierAddr(e.target.value)}
                  placeholder="0x…"
                />
                <div className="label">
                  <span className="label-text-alt text-base-content/60">
                    We’ll set this verifier immediately after creation.
                  </span>
                </div>
              </label>
            ) : null}
          </div>

          <button
            className="btn btn-primary w-fit"
            disabled={!address || isCreating || (mode === "1" && !verifierAddr)}
            onClick={async () => {
              await createOpp({
                functionName: "createOpportunity",
                args: [
                  metadataURI,
                  parseUnits(rewardCity || "0", 18),
                  0n,
                  "0x0000000000000000000000000000000000000000",
                  Number(mode),
                  0n,
                  0n,
                  0n,
                ],
              });

              // If DelegatedVerifiers mode, set verifier right away.
              if (mode === "1" && verifierAddr) {
                await setVerifier({
                  functionName: "setVerifierForIssuer",
                  args: [address as `0x${string}`, verifierAddr as `0x${string}`, true],
                } as any);
              }
            }}
          >
            Create opportunity
          </button>

          {mode === "1" ? (
            <div className="text-xs text-base-content/60">
              Note: Creating + delegating verifier will trigger two transactions.
            </div>
          ) : null}
        </div>
      </Section>

      <Section
        title="Issuer activity"
        subtitle="All opportunities you’ve offered: current status, reward, and when it was claimed."
      >
        <div className="flex flex-col gap-2">
          {issuerOpps.length === 0 ? (
            <div className="text-sm text-base-content/70">No opportunities found for this issuer.</div>
          ) : (
            issuerOpps
              .slice()
              .reverse()
              .map((x: any, idx: number) => {
                const oppAny = x.opp as any;
                const metadataURI = (oppAny?.metadataURI ?? oppAny?.[1]) as string | undefined;
                const rewardCityRaw = (oppAny?.rewardCity ?? oppAny?.[2]) as bigint | undefined;

                const metadata = parseOppMetadata(metadataURI);
                const rewardCity = rewardCityRaw !== undefined ? formatUnits(rewardCityRaw, 18) : "?";

                const claimant = x.claimant as `0x${string}` | undefined;
                const isClaimed = !!claimant && claimant !== "0x0000000000000000000000000000000000000000";

                const completionIndex = claimants.slice(0, idx).filter(Boolean).length;
                const completion = isClaimed
                  ? ((completionReads?.[completionIndex]?.result ?? undefined) as any)
                  : undefined;
                const statusRaw = (completion?.status ?? completion?.[3]) as any;
                const status = statusRaw === undefined ? 0n : BigInt(statusRaw);

                const claimedAt = claimedAtByOpp[x.id.toString()];
                const claimedAtLabel = claimedAt
                  ? new Date(claimedAt * 1000).toLocaleString()
                  : isClaimed
                    ? "(claimed)"
                    : "—";

                return (
                  <div key={`${x.id.toString()}-${idx}`} className="rounded-xl border border-base-300 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-base-content/60">Opportunity #{x.id.toString()}</div>
                        <div className="font-semibold">{metadata.description ?? "(no description)"}</div>
                        <div className="text-sm text-base-content/70 mt-1">
                          {metadata.date ? <span>{metadata.date}</span> : <span>—</span>}
                          {" · "}
                          {metadata.time ? <span>{metadata.time}</span> : <span>—</span>}
                        </div>
                        <div className="text-sm mt-1">
                          <span className="text-base-content/70">Reward:</span>{" "}
                          <span className="font-mono">{rewardCity} CITY</span>
                        </div>
                        <div className="text-xs text-base-content/60 mt-1">Claimed at: {claimedAtLabel}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs text-base-content/60">Status</div>
                        <div
                          className={`text-sm ${status === 1n ? "text-warning" : status === 2n ? "text-success" : ""}`}
                        >
                          {isClaimed ? completionStatusLabel(status) : "Unclaimed"}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </Section>
    </div>
  );
}
