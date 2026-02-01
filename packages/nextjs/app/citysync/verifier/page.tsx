"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ContractAddresses } from "../_components/ContractAddresses";
import { Section } from "../_components/Section";
import { Address } from "@scaffold-ui/components";
import { formatUnits } from "viem";
import { useAccount, useReadContracts } from "wagmi";
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
    return {
      description: parsed?.description,
      date: parsed?.date,
      time: parsed?.time,
    };
  } catch {
    return { description: metadataURI };
  }
}

function completionStatusLabel(status?: bigint): string {
  // enum CompletionStatus { None, Submitted, Verified, Invalidated }
  if (status === undefined) return "Unknown";
  if (status === 0n) return "Not started";
  if (status === 1n) return "Pending verification";
  if (status === 2n) return "Verified";
  if (status === 3n) return "Invalidated";
  return "Unknown";
}

export default function VerifierJourney() {
  const { address } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const [showOnlyPending, setShowOnlyPending] = useState<boolean>(true);

  const { data: mgrInfo } = useDeployedContractInfo({ contractName: "OpportunityManager" });

  const { data: nextOpp } = useScaffoldReadContract({
    contractName: "OpportunityManager",
    functionName: "nextOpportunityId",
  } as any);

  // No manual citizen entry: verifier reviews claimant on each opportunity card.

  const oppIds = useMemo(() => {
    const n = Number(nextOpp ?? 1n);
    const maxToRender = 25;
    const count = Math.max(0, Math.min(n - 1, maxToRender));
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

  const claimants = useMemo(() => {
    return oppIds.map((_id, i) => {
      const c = (claimReads?.[i]?.result ?? undefined) as `0x${string}` | undefined;
      if (!c || c === "0x0000000000000000000000000000000000000000") return undefined;
      return c;
    });
  }, [oppIds, claimReads]);

  const completionContracts = useMemo(() => {
    if (!canBatchRead) return [];
    return oppIds
      .map((id, i) => {
        const claimant = claimants[i];
        if (!claimant) return null;
        return {
          address: mgrInfo!.address as `0x${string}`,
          abi: mgrInfo!.abi,
          functionName: "completions" as const,
          args: [id, claimant] as const,
        };
      })
      .filter(Boolean) as any[];
  }, [canBatchRead, oppIds, claimants, mgrInfo]);

  const { data: completionReads } = useReadContracts({
    contracts: completionContracts,
    query: { enabled: canBatchRead && completionContracts.length > 0 },
  });

  const { writeContractAsync: verifyCompletion, isMining: isVerifying } =
    useScaffoldWriteContract("OpportunityManager");

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-base-content/70">City/Sync</div>
          <h1 className="text-2xl font-bold">Verifier Journey</h1>
          <div className="mt-1 text-sm text-base-content/70">
            Review opportunities and approve pending citizen proofs.
          </div>
        </div>
        <Link href="/citysync" className="link">
          ← back
        </Link>
      </div>

      <ContractAddresses addresses={[{ label: "OpportunityManager", address: mgrInfo?.address }]} />

      <Section
        title="Your wallet"
        subtitle="Verifier actions require your wallet to be the issuer or a delegated verifier."
      >
        <div className="flex items-center justify-between">
          <div className="text-sm text-base-content/70">Connected wallet</div>
          <div>
            {address ? <Address address={address} chain={targetNetwork} size="sm" /> : <span>not connected</span>}
          </div>
        </div>
      </Section>

      <Section
        title="Review claimed work"
        subtitle="Verifiers browse the same opportunities as citizens. If a citizen claimed an opportunity and submitted proof, you can verify/mint right from that card."
      >
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-base-content/70">No manual citizen address needed.</div>

          <label className="label cursor-pointer gap-2">
            <span className="label-text">Show only pending</span>
            <input
              type="checkbox"
              className="toggle"
              checked={showOnlyPending}
              onChange={e => setShowOnlyPending(e.target.checked)}
            />
          </label>
        </div>
      </Section>

      <Section
        title="Opportunities"
        subtitle="Cards show only Description, Date, Time, Reward, and claim/proof status."
      >
        <div className="flex flex-col gap-3">
          <div className="text-sm text-base-content/70">
            nextOpportunityId (exclusive): {nextOpp?.toString?.() ?? "?"}
          </div>

          {oppIds.length === 0 ? (
            <div className="text-sm text-base-content/70">No opportunities yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {oppIds
                .map((id, i) => {
                  const opp = (oppReads?.[i]?.result ?? undefined) as any;
                  const metadataURI = (opp?.metadataURI ?? opp?.[1]) as string | undefined;
                  const rewardCityRaw = (opp?.rewardCity ?? opp?.[2]) as bigint | undefined;

                  const metadata = parseOppMetadata(metadataURI);
                  const rewardCity = rewardCityRaw !== undefined ? formatUnits(rewardCityRaw, 18) : "?";

                  const claimant = (claimReads?.[i]?.result ?? undefined) as `0x${string}` | undefined;
                  const isClaimed = !!claimant && claimant !== "0x0000000000000000000000000000000000000000";

                  // completionReads is a compact array only for claimed opportunities
                  const completionIndex = claimants.slice(0, i).filter(Boolean).length;
                  const completion = isClaimed
                    ? ((completionReads?.[completionIndex]?.result ?? undefined) as any)
                    : undefined;
                  const statusRaw = (completion?.status ?? completion?.[3]) as any;
                  const status = statusRaw === undefined ? undefined : BigInt(statusRaw);

                  const completed = status === 2n;
                  const canVerify = isClaimed && status === 1n;

                  const isPendingCard = isClaimed && status === 1n;
                  const isCompletedCard = isClaimed && completed;

                  return {
                    id,
                    i,
                    metadata,
                    rewardCity,
                    claimant,
                    isClaimed,
                    status,
                    canVerify,
                    isPendingCard,
                    isCompletedCard,
                  };
                })
                .filter(card => (showOnlyPending ? card.isPendingCard : true))
                .map(card => {
                  const { id, metadata, rewardCity, claimant, isClaimed, status, canVerify, isCompletedCard } = card;

                  return (
                    <div key={id.toString()} className="card bg-base-100 border border-base-300">
                      <div className="card-body gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xs text-base-content/60">Opportunity #{id.toString()}</div>
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
                          </div>

                          <div className="text-right">
                            <div className="text-xs text-base-content/60">Status</div>
                            <div className={`text-sm ${status === 1n ? "text-warning" : ""}`}>
                              {isClaimed ? completionStatusLabel(status) : "Unclaimed"}
                            </div>
                          </div>
                        </div>

                        <div className="text-xs text-base-content/70">
                          Claimed by:{" "}
                          {isClaimed ? <Address address={claimant} chain={targetNetwork} size="sm" /> : "Unclaimed"}
                        </div>

                        <div className="card-actions justify-end">
                          {!isCompletedCard ? (
                            <button
                              className="btn btn-primary"
                              disabled={!address || isVerifying || !canVerify}
                              onClick={async () => {
                                await verifyCompletion({
                                  functionName: "verifyCompletion",
                                  args: [id, claimant as `0x${string}`],
                                });
                              }}
                            >
                              Verify & mint
                            </button>
                          ) : (
                            <div className="text-sm text-success font-medium">Completed</div>
                          )}
                        </div>

                        {isClaimed && status === 1n ? (
                          <div className="text-xs text-base-content/70">Pending: click “Verify & mint” to approve.</div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {Number(nextOpp ?? 1n) > 26 ? (
            <div className="text-xs text-base-content/60">Showing first 25 opportunities only (MVP safety cap).</div>
          ) : null}
        </div>
      </Section>
    </div>
  );
}
