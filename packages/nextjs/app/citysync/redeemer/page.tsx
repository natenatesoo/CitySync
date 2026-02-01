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

export default function RedeemerJourney() {
  const { address } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const { data: registryInfo } = useDeployedContractInfo({ contractName: "RedeemerRegistry" });
  const { data: redemptionInfo } = useDeployedContractInfo({ contractName: "Redemption" });

  const { data: canRedeem } = useScaffoldReadContract({
    contractName: "RedeemerRegistry",
    functionName: "canRedeem",
    args: [address],
    enabled: !!address,
  } as any);

  const [serviceName, setServiceName] = useState<string>("Transit Pass");
  const [amountWei, setAmountWei] = useState<string>("1000000000000000000");

  const qrPayload = useMemo(() => {
    if (!address) return "";
    return JSON.stringify(
      {
        kind: "citysync_redeem",
        chainId: targetNetwork.id,
        redeemer: address,
        amountWei,
        serviceName,
        ts: Date.now(),
      },
      null,
      2,
    );
  }, [address, amountWei, serviceName, targetNetwork.id]);

  const qrHash = useMemo(() => keccak256(stringToHex(qrPayload || "")), [qrPayload]);

  const { writeContractAsync: finalizeRedemption, isMining: isFinalizing } = useScaffoldWriteContract("Redemption");
  const [requestId, setRequestId] = useState<string>("");
  const [refText, setRefText] = useState<string>("scanned QR at kiosk");
  const refHash = useMemo(() => keccak256(stringToHex(refText)), [refText]);

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-base-content/70">City/Sync</div>
          <h1 className="text-2xl font-bold">Redeemer Journey</h1>
          <div className="mt-1 text-sm text-base-content/70">
            Generate a QR payload and finalize redemptions (burn CITY) for citizens.
          </div>
        </div>
        <Link href="/citysync" className="link">
          ← back
        </Link>
      </div>

      <ContractAddresses
        addresses={[
          { label: "RedeemerRegistry", address: registryInfo?.address },
          { label: "Redemption", address: redemptionInfo?.address },
        ]}
      />

      <Section
        title="Your wallet"
        subtitle="Redeemer actions require your wallet to be authorized in RedeemerRegistry."
      >
        <div className="flex items-center justify-between">
          <div className="text-sm text-base-content/70">Connected wallet</div>
          <div>
            {address ? <Address address={address} chain={targetNetwork} size="sm" /> : <span>not connected</span>}
          </div>
        </div>
        <div className="mt-2 text-sm">Authorized: {String(!!canRedeem)}</div>
      </Section>

      <Section
        title="QR payload"
        subtitle="For MVP testing, we emit a QR payload string (you can encode this into a QR later)."
      >
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 flex-wrap">
            <label className="form-control w-full max-w-md">
              <div className="label">
                <span className="label-text">Service name</span>
              </div>
              <input
                className="input input-bordered"
                value={serviceName}
                onChange={e => setServiceName(e.target.value)}
              />
            </label>
            <label className="form-control w-full max-w-md">
              <div className="label">
                <span className="label-text">Default amount (wei)</span>
              </div>
              <input className="input input-bordered" value={amountWei} onChange={e => setAmountWei(e.target.value)} />
            </label>
          </div>

          <pre className="text-xs bg-base-200 p-3 rounded-xl overflow-auto">{qrPayload || "(connect wallet)"}</pre>
          <div className="text-xs text-base-content/70 font-mono">payloadHash: {qrHash}</div>
        </div>
      </Section>

      <Section
        title="Finalize redemption"
        subtitle="Paste a citizen redemption requestId (from events) and burn their CITY."
      >
        <div className="flex flex-col gap-3">
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">requestId (bytes32)</span>
            </div>
            <input
              className="input input-bordered font-mono"
              value={requestId}
              onChange={e => setRequestId(e.target.value)}
              placeholder="0x…"
            />
          </label>
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Reference text</span>
            </div>
            <input className="input input-bordered" value={refText} onChange={e => setRefText(e.target.value)} />
          </label>
          <div className="text-xs text-base-content/70 font-mono">refHash: {refHash}</div>

          <button
            className="btn btn-primary w-fit"
            disabled={!address || isFinalizing || !requestId}
            onClick={async () => {
              await finalizeRedemption({
                functionName: "finalizeRedemption",
                args: [requestId as `0x${string}`, refHash],
              });
            }}
          >
            Finalize (burn CITY)
          </button>

          <div className="text-xs text-base-content/60">
            Tip: In a later iteration we can add event indexing so the redeemer UI lists pending requests automatically.
          </div>
        </div>
      </Section>
    </div>
  );
}
