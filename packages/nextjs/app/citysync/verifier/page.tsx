"use client";

import { useState } from "react";
import Link from "next/link";
import { ContractAddresses } from "../_components/ContractAddresses";
import { Section } from "../_components/Section";
import { Address } from "@scaffold-ui/components";
import { useAccount } from "wagmi";
import {
  useDeployedContractInfo,
  useScaffoldReadContract,
  useScaffoldWriteContract,
  useTargetNetwork,
} from "~~/hooks/scaffold-eth";

export default function VerifierJourney() {
  const { address } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const { data: mgrInfo } = useDeployedContractInfo({ contractName: "OpportunityManager" });

  const { data: nextOpp } = useScaffoldReadContract({
    contractName: "OpportunityManager",
    functionName: "nextOpportunityId",
  } as any);

  const [oppId, setOppId] = useState<string>("1");
  const [citizenAddr, setCitizenAddr] = useState<string>("");

  const { data: opp } = useScaffoldReadContract({
    contractName: "OpportunityManager",
    functionName: "opportunities",
    args: [oppId ? BigInt(oppId) : undefined],
    enabled: !!oppId,
  } as any);

  const { writeContractAsync: verifyCompletion, isMining: isVerifying } =
    useScaffoldWriteContract("OpportunityManager");

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-base-content/70">City/Sync</div>
          <h1 className="text-2xl font-bold">Verifier Journey</h1>
          <div className="mt-1 text-sm text-base-content/70">
            Select an opportunity, review details, and verify citizen completions.
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
        title="Select opportunity"
        subtitle="Enter an opportunity ID to inspect it. nextOpportunityId helps you know the valid range."
      >
        <div className="flex flex-col gap-3">
          <div className="text-sm text-base-content/70">
            nextOpportunityId (exclusive): {nextOpp?.toString?.() ?? "?"}
          </div>
          <label className="form-control w-full max-w-xs">
            <div className="label">
              <span className="label-text">Opportunity ID</span>
            </div>
            <input className="input input-bordered" value={oppId} onChange={e => setOppId(e.target.value)} />
          </label>
          <pre className="text-xs bg-base-200 p-3 rounded-xl overflow-auto">
            {opp ? JSON.stringify(opp, null, 2) : "(no data)"}
          </pre>
        </div>
      </Section>

      <Section
        title="Verify completion"
        subtitle="This calls OpportunityManager.verifyCompletion(opportunityId, citizen). The citizen must have submitted completion first."
      >
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 flex-wrap">
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Opportunity ID</span>
              </div>
              <input className="input input-bordered" value={oppId} onChange={e => setOppId(e.target.value)} />
            </label>
            <label className="form-control w-full max-w-md">
              <div className="label">
                <span className="label-text">Citizen address</span>
              </div>
              <input
                className="input input-bordered"
                value={citizenAddr}
                onChange={e => setCitizenAddr(e.target.value)}
                placeholder="0x…"
              />
            </label>
          </div>

          <button
            className="btn btn-primary w-fit"
            disabled={!address || !citizenAddr || isVerifying}
            onClick={async () => {
              await verifyCompletion({
                functionName: "verifyCompletion",
                args: [BigInt(oppId), citizenAddr as `0x${string}`],
              });
            }}
          >
            Verify & mint
          </button>
        </div>
      </Section>
    </div>
  );
}
