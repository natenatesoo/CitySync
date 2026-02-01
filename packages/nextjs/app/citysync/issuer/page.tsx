"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ContractAddresses } from "../_components/ContractAddresses";
import { Section } from "../_components/Section";
import { Address } from "@scaffold-ui/components";
import { keccak256, parseUnits, stringToHex } from "viem";
import { useAccount } from "wagmi";
import {
  useDeployedContractInfo,
  useScaffoldReadContract,
  useScaffoldWriteContract,
  useTargetNetwork,
} from "~~/hooks/scaffold-eth";

export default function IssuerJourney() {
  const { address } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const { data: mgrInfo } = useDeployedContractInfo({ contractName: "OpportunityManager" });

  const { data: nextOpp } = useScaffoldReadContract({
    contractName: "OpportunityManager",
    functionName: "nextOpportunityId",
  } as any);

  const { writeContractAsync: createOpp, isMining: isCreating } = useScaffoldWriteContract("OpportunityManager");
  const { writeContractAsync: setVerifier, isMining: isSettingVerifier } =
    useScaffoldWriteContract("OpportunityManager");
  const { writeContractAsync: verifyCompletion, isMining: isVerifying } =
    useScaffoldWriteContract("OpportunityManager");

  const [metadataURI, setMetadataURI] = useState<string>("ipfs://example");
  const [rewardCity, setRewardCity] = useState<string>("5");
  const [mode, setMode] = useState<string>("1"); // DelegatedVerifiers

  const [verifierAddr, setVerifierAddr] = useState<string>("");

  const [verifyOppId, setVerifyOppId] = useState<string>("1");
  const [citizenAddr, setCitizenAddr] = useState<string>("");

  const [invalidateReason] = useState<string>("invalid proof");
  const reasonHash = useMemo(() => keccak256(stringToHex(invalidateReason)), [invalidateReason]);

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
                <span className="label-text">metadataURI</span>
              </div>
              <input
                className="input input-bordered"
                value={metadataURI}
                onChange={e => setMetadataURI(e.target.value)}
              />
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
                <span className="label-text">verificationMode</span>
              </div>
              <select className="select select-bordered" value={mode} onChange={e => setMode(e.target.value)}>
                <option value="0">IssuerOnly</option>
                <option value="1">DelegatedVerifiers</option>
                <option value="2">EIP712Signature</option>
              </select>
            </label>
          </div>

          <button
            className="btn btn-primary w-fit"
            disabled={!address || isCreating}
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
            }}
          >
            Create opportunity
          </button>
        </div>
      </Section>

      <Section
        title="Delegate verifier"
        subtitle="(Optional) Allow a verifier address to verify completions for your issuer account."
      >
        <div className="flex gap-2 flex-wrap items-end">
          <label className="form-control w-full max-w-md">
            <div className="label">
              <span className="label-text">Verifier address</span>
            </div>
            <input
              className="input input-bordered"
              value={verifierAddr}
              onChange={e => setVerifierAddr(e.target.value)}
              placeholder="0x…"
            />
          </label>
          <button
            className="btn btn-secondary"
            disabled={!address || !verifierAddr || isSettingVerifier}
            onClick={async () => {
              await setVerifier({
                functionName: "setVerifierForIssuer",
                args: [address as `0x${string}`, verifierAddr as `0x${string}`, true],
              });
            }}
          >
            Approve verifier
          </button>
        </div>
      </Section>

      <Section
        title="Verify completion"
        subtitle="Verifier (issuer or delegated) attests completion and mints CITY + VOTE to the citizen."
      >
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 flex-wrap">
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Opportunity ID</span>
              </div>
              <input
                className="input input-bordered"
                value={verifyOppId}
                onChange={e => setVerifyOppId(e.target.value)}
              />
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
                args: [BigInt(verifyOppId), citizenAddr as `0x${string}`],
              });
            }}
          >
            Verify & mint
          </button>

          <div className="text-xs text-base-content/60">Debug helper: reasonHash (for invalidation) = {reasonHash}</div>
        </div>
      </Section>
    </div>
  );
}
