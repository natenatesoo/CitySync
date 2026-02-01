"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ContractAddresses } from "../_components/ContractAddresses";
import { Section } from "../_components/Section";
import { RedeemerOffers } from "./_components/RedeemerOffers";
import { Address } from "@scaffold-ui/components";
import { decodeEventLog, formatUnits, keccak256, stringToHex } from "viem";
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

export default function CitizenJourney() {
  const { address } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const publicClient = usePublicClient();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  const { data: cityInfo } = useDeployedContractInfo({ contractName: "CityToken" });
  const { data: voteInfo } = useDeployedContractInfo({ contractName: "VoteToken" });
  const { data: mgrInfo } = useDeployedContractInfo({ contractName: "OpportunityManager" });
  const { data: redemptionInfo } = useDeployedContractInfo({ contractName: "Redemption" });

  const { data: cityBal } = useScaffoldReadContract({
    contractName: "CityToken",
    functionName: "balanceOf",
    args: [address],
    enabled: !!address,
  } as any);

  const { data: voteBal } = useScaffoldReadContract({
    contractName: "VoteToken",
    functionName: "balanceOf",
    args: [address],
    enabled: !!address,
  } as any);

  const { data: nextOpp } = useScaffoldReadContract({
    contractName: "OpportunityManager",
    functionName: "nextOpportunityId",
  } as any);

  const oppIds = useMemo(() => {
    const n = Number(nextOpp ?? 1n);
    const maxToRender = 25; // safety for MVP UI
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

  const { data: completionReads } = useReadContracts({
    contracts:
      canBatchRead && !!address
        ? oppIds.map(id => ({
            address: mgrInfo!.address as `0x${string}`,
            abi: mgrInfo!.abi,
            functionName: "completions",
            args: [id, address as `0x${string}`],
          }))
        : [],
    query: { enabled: canBatchRead && !!address },
  });

  const { writeContractAsync: claimOpportunity, isMining: isClaiming } = useScaffoldWriteContract("OpportunityManager");
  const { writeContractAsync: unclaimOpportunity, isMining: isUnclaiming } =
    useScaffoldWriteContract("OpportunityManager");
  const { writeContractAsync: submitCompletion, isMining: isSubmitting } =
    useScaffoldWriteContract("OpportunityManager");

  const [proofTextByOpp, setProofTextByOpp] = useState<Record<string, string>>({});
  const [pendingProofByOpp, setPendingProofByOpp] = useState<Record<string, boolean>>({});

  const { writeContractAsync: purchaseOffer, isMining: isPurchasing } = useScaffoldWriteContract("Redemption");

  const { data: lastReceiptId } = useScaffoldReadContract({
    contractName: "Redemption",
    functionName: "lastReceiptId",
    args: [address],
    enabled: !!address,
  } as any);

  const { data: allRedeemers } = useScaffoldReadContract({
    contractName: "RedeemerRegistry",
    functionName: "getAllRedeemers",
  } as any);

  const [activity, setActivity] = useState<
    Array<
      | { kind: "opportunity"; opportunityId: bigint; blockNumber?: bigint }
      | {
          kind: "redemption";
          redeemer: string;
          offerId: bigint;
          costCity: bigint;
          receiptId: bigint;
          blockNumber?: bigint;
        }
    >
  >([]);

  useEffect(() => {
    const run = async () => {
      if (!publicClient || !address || !blockNumber) return;
      const fromBlock = blockNumber > 5000n ? blockNumber - 5000n : 0n;

      const items: any[] = [];

      // Completed opportunities
      if (mgrInfo?.address && mgrInfo?.abi) {
        const logs = await publicClient.getLogs({
          address: mgrInfo.address as `0x${string}`,
          event: {
            type: "event",
            name: "CompletionVerified",
            inputs: [
              { indexed: true, name: "opportunityId", type: "uint256" },
              { indexed: true, name: "citizen", type: "address" },
              { indexed: false, name: "cityMinted", type: "uint256" },
              { indexed: false, name: "voteMinted", type: "uint256" },
            ],
          },
          args: { citizen: address as `0x${string}` },
          fromBlock,
          toBlock: blockNumber,
        } as any);

        for (const l of logs as any[]) {
          try {
            const d = decodeEventLog({ abi: mgrInfo.abi as any, data: l.data, topics: l.topics }) as any;
            items.push({
              kind: "opportunity",
              opportunityId: BigInt(d.args.opportunityId),
              blockNumber: l.blockNumber,
            });
          } catch {}
        }
      }

      // Redemption purchases
      if (redemptionInfo?.address && redemptionInfo?.abi) {
        const logs = await publicClient.getLogs({
          address: redemptionInfo.address as `0x${string}`,
          event: {
            type: "event",
            name: "OfferPurchased",
            inputs: [
              { indexed: true, name: "citizen", type: "address" },
              { indexed: true, name: "redeemer", type: "address" },
              { indexed: true, name: "offerId", type: "uint256" },
              { indexed: false, name: "costCity", type: "uint256" },
              { indexed: false, name: "receiptId", type: "uint256" },
            ],
          },
          args: { citizen: address as `0x${string}` },
          fromBlock,
          toBlock: blockNumber,
        } as any);

        for (const l of logs as any[]) {
          try {
            const d = decodeEventLog({ abi: redemptionInfo.abi as any, data: l.data, topics: l.topics }) as any;
            items.push({
              kind: "redemption",
              redeemer: d.args.redeemer as string,
              offerId: BigInt(d.args.offerId),
              costCity: BigInt(d.args.costCity),
              receiptId: BigInt(d.args.receiptId),
              blockNumber: l.blockNumber,
            });
          } catch {}
        }
      }

      items.sort((a, b) => Number((b.blockNumber ?? 0n) - (a.blockNumber ?? 0n)));
      setActivity(items.slice(0, 50));
    };

    run();
  }, [
    publicClient,
    address,
    blockNumber,
    mgrInfo?.address,
    mgrInfo?.abi,
    redemptionInfo?.address,
    redemptionInfo?.abi,
  ]);

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-base-content/70">City/Sync</div>
          <h1 className="text-2xl font-bold">Citizen Journey</h1>
          <div className="mt-1 text-sm text-base-content/70">
            Browse opportunities, claim one, prove execution, and redeem CITY.
          </div>
        </div>
        <Link href="/citysync" className="link">
          ← back
        </Link>
      </div>

      <ContractAddresses
        addresses={[
          { label: "OpportunityManager", address: mgrInfo?.address },
          { label: "CityToken (CITY)", address: cityInfo?.address },
          { label: "VoteToken (VOTE)", address: voteInfo?.address },
          { label: "Redemption", address: redemptionInfo?.address },
        ]}
      />

      <Section title="Your wallet" subtitle="Balances update when you earn or redeem credits.">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="text-sm text-base-content/70">Connected wallet</div>
            <div>
              {address ? <Address address={address} chain={targetNetwork} size="sm" /> : <span>not connected</span>}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-base-content/70">CITY balance</div>
            <div className="font-mono text-sm">{formatUnits((cityBal ?? 0n) as bigint, 18)}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-base-content/70">VOTE balance</div>
            <div className="font-mono text-sm">{formatUnits((voteBal ?? 0n) as bigint, 18)}</div>
          </div>
        </div>
      </Section>

      <Section
        title="Browse opportunities"
        subtitle="Opportunity cards show only Description, Date, Time, Reward, and your claim/proof state."
      >
        <div className="flex flex-col gap-3">
          <div className="text-sm text-base-content/70">
            nextOpportunityId (exclusive): {nextOpp?.toString?.() ?? "?"}
          </div>

          {oppIds.length === 0 ? (
            <div className="text-sm text-base-content/70">No opportunities yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {oppIds.map((id, i) => {
                const opp = (oppReads?.[i]?.result ?? undefined) as any;
                const claimant = (claimReads?.[i]?.result ?? undefined) as `0x${string}` | undefined;
                const completion = (completionReads?.[i]?.result ?? undefined) as any;
                const completionStatusRaw = (completion?.status ?? completion?.[3]) as any;
                const completionStatus = completionStatusRaw === undefined ? undefined : BigInt(completionStatusRaw);

                const metadataURI = (opp?.metadataURI ?? opp?.[1]) as string | undefined;
                const rewardCityRaw = (opp?.rewardCity ?? opp?.[2]) as bigint | undefined;

                const metadata = parseOppMetadata(metadataURI);
                const rewardCity = rewardCityRaw !== undefined ? formatUnits(rewardCityRaw, 18) : "?";

                const status = completionStatus;
                const isClaimed = !!claimant && claimant !== "0x0000000000000000000000000000000000000000";
                const isMine = !!address && !!claimant && claimant.toLowerCase() === address.toLowerCase();

                const proofText = proofTextByOpp[id.toString()] ?? "completed shift";
                const proofHash = keccak256(stringToHex(proofText));

                const completed = status === 2n;

                const pendingOnchain = status === 1n;
                const pendingLocal = pendingProofByOpp[id.toString()] === true;
                const pending = !completed && (pendingOnchain || pendingLocal);

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
                          <div className={`text-sm ${pending ? "text-warning" : ""}`}>
                            {completionStatusLabel(status)}
                          </div>
                        </div>
                      </div>

                      {isClaimed ? (
                        <div className="text-xs text-base-content/70">
                          Claimed by: <Address address={claimant} chain={targetNetwork} size="sm" />
                        </div>
                      ) : (
                        <div className="text-xs text-base-content/70">Unclaimed</div>
                      )}

                      {/* Actions */}
                      {!completed ? (
                        <div className="card-actions items-end justify-between gap-2">
                          {/* Button 1: Claim */}
                          <button
                            className="btn btn-primary"
                            disabled={!address || isClaiming || isClaimed || pending}
                            onClick={async () => {
                              await claimOpportunity({
                                functionName: "claimOpportunity",
                                args: [id],
                              });
                            }}
                          >
                            Claim opportunity
                          </button>

                          {/* Buttons 2/3 depend on whether it's your claim */}
                          <div className="flex gap-2">
                            <button
                              className="btn btn-ghost"
                              disabled={!address || isUnclaiming || !isMine || pending}
                              onClick={async () => {
                                await unclaimOpportunity({
                                  functionName: "unclaimOpportunity",
                                  args: [id],
                                });
                              }}
                            >
                              Remove me
                            </button>

                            <button
                              className="btn btn-secondary"
                              disabled={!address || isSubmitting || !isMine || pending}
                              onClick={async () => {
                                setPendingProofByOpp(prev => ({ ...prev, [id.toString()]: true }));
                                try {
                                  await submitCompletion({
                                    functionName: "submitCompletion",
                                    args: [id, proofHash],
                                  });
                                } catch (e) {
                                  // if the tx is rejected/reverts, re-enable actions
                                  setPendingProofByOpp(prev => ({ ...prev, [id.toString()]: false }));
                                  throw e;
                                }
                              }}
                            >
                              Prove execution
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-success font-medium">Completed</div>
                      )}

                      {isMine && !pending ? (
                        <label className="form-control">
                          <div className="label">
                            <span className="label-text">Proof text (hashed onchain)</span>
                            <span className="label-text-alt font-mono text-xs">{proofHash.slice(0, 10)}…</span>
                          </div>
                          <input
                            className="input input-bordered"
                            value={proofText}
                            onChange={e => setProofTextByOpp(prev => ({ ...prev, [id.toString()]: e.target.value }))}
                          />
                        </label>
                      ) : null}

                      {isMine && pending ? (
                        <div className="text-xs text-warning">
                          {pendingOnchain
                            ? "Pending: waiting for a verifier to approve."
                            : "Submitting proof… (waiting for confirmation)"}
                        </div>
                      ) : null}

                      {isMine && completed ? <div className="text-xs text-success">Completed & verified.</div> : null}
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

      <Section
        title="Redemption offerings"
        subtitle="Browse redemption opportunities and purchase with CITY. Purchases burn CITY and mint a non-transferable receipt."
      >
        <div className="flex flex-col gap-3">
          <div className="text-xs text-base-content/70">
            Latest receipt for you: <span className="font-mono">{lastReceiptId?.toString?.() ?? "0"}</span>
          </div>

          {Array.isArray(allRedeemers) && allRedeemers.length > 0 ? (
            <div className="flex flex-col gap-4">
              {(allRedeemers as any[])
                .slice(0, 5)
                .map(r => String(r))
                .map(r => (
                  <RedeemerOffers
                    key={r}
                    redeemer={r as `0x${string}`}
                    purchaseOffer={purchaseOffer as any}
                    isPurchasing={isPurchasing}
                  />
                ))}
            </div>
          ) : (
            <div className="text-sm text-base-content/70">No redeemers found yet.</div>
          )}
        </div>
      </Section>

      <Section
        title="Citizen Activity Log"
        subtitle="Your verified opportunity completions and redemption purchases (recent onchain activity)."
      >
        <div className="flex flex-col gap-2">
          {activity.length === 0 ? (
            <div className="text-sm text-base-content/70">No recent activity found.</div>
          ) : (
            activity.map((a, idx) => {
              if (a.kind === "opportunity") {
                return (
                  <div
                    key={`opp-${a.opportunityId.toString()}-${idx}`}
                    className="rounded-xl border border-base-300 p-3"
                  >
                    <div className="font-semibold">Opportunity completed</div>
                    <div className="text-sm text-base-content/70">Opportunity #{a.opportunityId.toString()}</div>
                  </div>
                );
              }

              return (
                <div key={`red-${a.receiptId.toString()}-${idx}`} className="rounded-xl border border-base-300 p-3">
                  <div className="font-semibold">Redemption purchased</div>
                  <div className="text-sm text-base-content/70">
                    Offer #{a.offerId.toString()} ·{" "}
                    <span className="font-mono">{formatUnits(a.costCity, 18)} CITY</span>
                  </div>
                  <div className="text-xs text-base-content/60">Redeemer: {a.redeemer}</div>
                  <div className="text-xs text-base-content/60">Receipt #{a.receiptId.toString()}</div>
                </div>
              );
            })
          )}
        </div>
      </Section>
    </div>
  );
}
