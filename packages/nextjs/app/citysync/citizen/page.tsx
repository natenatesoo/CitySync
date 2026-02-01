"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ContractAddresses } from "../_components/ContractAddresses";
import { Section } from "../_components/Section";
import { Address } from "@scaffold-ui/components";
import { keccak256, stringToHex } from "viem";
import { useAccount } from "wagmi";
import {
  useDeployedContractInfo,
  useScaffoldReadContract,
  useScaffoldWriteContract,
  useTargetNetwork,
} from "~~/hooks/scaffold-eth";

export default function CitizenJourney() {
  const { address } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const { data: cityInfo } = useDeployedContractInfo({ contractName: "CityToken" });
  const { data: voteInfo } = useDeployedContractInfo({ contractName: "VoteToken" });
  const { data: mgrInfo } = useDeployedContractInfo({ contractName: "OpportunityManager" });
  const { data: redemptionInfo } = useDeployedContractInfo({ contractName: "Redemption" });

  const [oppId, setOppId] = useState<string>("1");
  const [proofText, setProofText] = useState<string>("completed shift A");

  const proofHash = useMemo(() => keccak256(stringToHex(proofText)), [proofText]);

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

  const { data: opp } = useScaffoldReadContract({
    contractName: "OpportunityManager",
    functionName: "opportunities",
    args: [oppId ? BigInt(oppId) : undefined],
    enabled: !!oppId,
  } as any);

  const { writeContractAsync: submitCompletion, isMining: isSubmitting } =
    useScaffoldWriteContract("OpportunityManager");

  const { writeContractAsync: requestRedemption, isMining: isRequesting } = useScaffoldWriteContract("Redemption");
  const [redeemerAddr, setRedeemerAddr] = useState<string>("");
  const [redeemAmt, setRedeemAmt] = useState<string>("1");
  const [memo, setMemo] = useState<string>("transit pass");

  const memoHash = useMemo(() => keccak256(stringToHex(memo)), [memo]);

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-base-content/70">City/Sync</div>
          <h1 className="text-2xl font-bold">Citizen Journey</h1>
          <div className="mt-1 text-sm text-base-content/70">
            Browse opportunities, submit completion, redeem CITY, and view VOTE balance.
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
            <div className="font-mono text-sm">{cityBal?.toString?.() ?? "0"}</div>
          </div>
          <div className="flex items-center justify-between">
            <div className="text-sm text-base-content/70">VOTE balance</div>
            <div className="font-mono text-sm">{voteBal?.toString?.() ?? "0"}</div>
          </div>
        </div>
      </Section>

      <Section
        title="Browse opportunities"
        subtitle="For the MVP, enter an ID to view details. nextOpportunityId helps you discover the range."
      >
        <div className="flex flex-col gap-3">
          <div className="text-sm text-base-content/70">
            nextOpportunityId (exclusive): {nextOpp?.toString?.() ?? "?"}
          </div>
          <div className="flex gap-2 items-end">
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Opportunity ID</span>
              </div>
              <input className="input input-bordered" value={oppId} onChange={e => setOppId(e.target.value)} />
            </label>
          </div>
          <pre className="text-xs bg-base-200 p-3 rounded-xl overflow-auto">
            {opp ? JSON.stringify(opp, null, 2) : "(no data)"}
          </pre>
        </div>
      </Section>

      <Section
        title="Submit completion"
        subtitle="This signals you completed an opportunity. A verifier will later attest and mint tokens."
      >
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Opportunity ID</span>
              </div>
              <input className="input input-bordered" value={oppId} onChange={e => setOppId(e.target.value)} />
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Proof text</span>
              </div>
              <input className="input input-bordered" value={proofText} onChange={e => setProofText(e.target.value)} />
            </label>
          </div>
          <div className="text-xs text-base-content/70 font-mono">proofHash: {proofHash}</div>
          <button
            className="btn btn-primary w-fit"
            disabled={!address || isSubmitting || !oppId}
            onClick={async () => {
              await submitCompletion({
                functionName: "submitCompletion",
                args: [BigInt(oppId), proofHash],
              });
            }}
          >
            Submit completion
          </button>
        </div>
      </Section>

      <Section title="Redeem CITY" subtitle="Request a redemption. A redeemer will finalize and burn your CITY.">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 flex-wrap">
            <label className="form-control w-full max-w-md">
              <div className="label">
                <span className="label-text">Redeemer address</span>
              </div>
              <input
                className="input input-bordered"
                value={redeemerAddr}
                onChange={e => setRedeemerAddr(e.target.value)}
                placeholder="0x…"
              />
            </label>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Amount (wei)</span>
              </div>
              <input className="input input-bordered" value={redeemAmt} onChange={e => setRedeemAmt(e.target.value)} />
            </label>
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text">Memo</span>
              </div>
              <input className="input input-bordered" value={memo} onChange={e => setMemo(e.target.value)} />
            </label>
          </div>
          <div className="text-xs text-base-content/70 font-mono">memoHash: {memoHash}</div>
          <button
            className="btn btn-secondary w-fit"
            disabled={!address || isRequesting || !redeemerAddr}
            onClick={async () => {
              await requestRedemption({
                functionName: "requestRedemption",
                args: [redeemerAddr as `0x${string}`, BigInt(redeemAmt), memoHash],
              });
            }}
          >
            Request redemption
          </button>
          <div className="text-xs text-base-content/60">
            After requesting, switch to the Redeemer journey and finalize the requestId from the event logs.
          </div>
        </div>
      </Section>
    </div>
  );
}
