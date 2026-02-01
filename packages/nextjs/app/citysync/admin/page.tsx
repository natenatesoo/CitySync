"use client";

import { useState } from "react";
import Link from "next/link";
import { ContractAddresses } from "../_components/ContractAddresses";
import { Section } from "../_components/Section";
import { Address } from "@scaffold-ui/components";
import { useAccount } from "wagmi";
import { useDeployedContractInfo, useScaffoldWriteContract, useTargetNetwork } from "~~/hooks/scaffold-eth";

// Default Anvil accounts (commonly used by Scaffold-ETH / Foundry local chain)
const DEFAULT_ADMIN = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266" as const;
const DEFAULT_ISSUER = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8" as const;
// const DEFAULT_VERIFIER = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC" as const;
const DEFAULT_REDEEMER = "0x90F79bf6EB2c4f870365E785982E1f101E93b906" as const;

export default function CitySyncAdmin() {
  const { address } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const { data: mgrInfo } = useDeployedContractInfo({ contractName: "OpportunityManager" });
  const { data: registryInfo } = useDeployedContractInfo({ contractName: "RedeemerRegistry" });

  const [issuerAddr, setIssuerAddr] = useState<string>(DEFAULT_ISSUER);
  // verifier delegation is now handled during opportunity creation (Issuer page)
  const [redeemerAddr, setRedeemerAddr] = useState<string>(DEFAULT_REDEEMER);

  const { writeContractAsync: setIssuerApproved, isMining: isApprovingIssuer } =
    useScaffoldWriteContract("OpportunityManager");
  // (removed) setVerifierForIssuer
  const { writeContractAsync: setRedeemer, isMining: isSettingRedeemer } = useScaffoldWriteContract("RedeemerRegistry");

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-base-content/70">City/Sync</div>
          <h1 className="text-2xl font-bold">Admin Setup (Local Test)</h1>
          <div className="mt-1 text-sm text-base-content/70">
            One-click setup for the demo roles. Intended for localhost/anvil only.
          </div>
        </div>
        <Link href="/citysync" className="link">
          ← back
        </Link>
      </div>

      <ContractAddresses
        addresses={[
          { label: "OpportunityManager", address: mgrInfo?.address },
          { label: "RedeemerRegistry", address: registryInfo?.address },
        ]}
      />

      <Section
        title="Admin wallet"
        subtitle={`You should connect as the CityAdmin. Default anvil admin is ${DEFAULT_ADMIN}.`}
      >
        <div className="flex items-center justify-between">
          <div className="text-sm text-base-content/70">Connected wallet</div>
          <div>
            {address ? <Address address={address} chain={targetNetwork} size="sm" /> : <span>not connected</span>}
          </div>
        </div>
        <div className="mt-2 text-xs text-base-content/60">
          If you are not connected as the CityAdmin, these calls will revert with AccessControl errors.
        </div>
      </Section>

      <Section
        title="Choose demo addresses"
        subtitle="These are prefilled with common Anvil accounts. You can change them."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="form-control">
            <div className="label">
              <span className="label-text">Issuer</span>
            </div>
            <input
              className="input input-bordered font-mono"
              value={issuerAddr}
              onChange={e => setIssuerAddr(e.target.value)}
            />
          </label>

          {/* Verifier delegation removed from Admin page */}
          <label className="form-control">
            <div className="label">
              <span className="label-text">Redeemer</span>
            </div>
            <input
              className="input input-bordered font-mono"
              value={redeemerAddr}
              onChange={e => setRedeemerAddr(e.target.value)}
            />
          </label>
        </div>
      </Section>

      <Section
        title="Step 1: Approve Issuer"
        subtitle="Grants CERTIFIED_ISSUER_ROLE so the issuer can create opportunities."
      >
        <button
          className="btn btn-primary w-fit"
          disabled={!address || isApprovingIssuer}
          onClick={async () => {
            await setIssuerApproved({
              functionName: "setIssuerApproved",
              args: [issuerAddr as `0x${string}`, true],
            });
          }}
        >
          Approve issuer
        </button>
      </Section>

      <Section title="Step 2: Approve Redeemer" subtitle="Allowlists the redeemer address in RedeemerRegistry.">
        <button
          className="btn btn-primary w-fit"
          disabled={!address || isSettingRedeemer}
          onClick={async () => {
            await setRedeemer({
              functionName: "setRedeemer",
              args: [redeemerAddr as `0x${string}`, true],
            });
          }}
        >
          Approve redeemer
        </button>
      </Section>

      <div className="text-sm text-base-content/60">
        After this setup:
        <ul className="list-disc ml-6 mt-2">
          <li>Switch wallet to Issuer → create opportunity</li>
          <li>Switch wallet to Citizen → submit completion</li>
          <li>Switch wallet to Issuer/Verifier → verify completion</li>
          <li>Switch wallet to Citizen → purchase redemption offering</li>
        </ul>
      </div>
    </div>
  );
}
