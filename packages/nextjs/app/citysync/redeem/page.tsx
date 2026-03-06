"use client";

import { Suspense, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ContractAddresses } from "../_components/ContractAddresses";
import { Section } from "../_components/Section";
import { Address } from "@scaffold-ui/components";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import {
  useDeployedContractInfo,
  useScaffoldReadContract,
  useScaffoldWriteContract,
  useTargetNetwork,
} from "~~/hooks/scaffold-eth";

function RedeemContent() {
  const params = useSearchParams();
  const { address } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const redeemer = (params.get("redeemer") ?? "").trim() as `0x${string}` | "";
  const offerIdStr = (params.get("offerId") ?? "").trim();
  const offerId = useMemo(() => {
    try {
      return offerIdStr ? BigInt(offerIdStr) : 0n;
    } catch {
      return 0n;
    }
  }, [offerIdStr]);

  const { data: registryInfo } = useDeployedContractInfo({ contractName: "RedeemerRegistry" });
  const { data: redemptionInfo } = useDeployedContractInfo({ contractName: "Redemption" });

  const valid = redeemer.startsWith("0x") && redeemer.length === 42 && offerId > 0n;

  const { data: offer } = useScaffoldReadContract({
    contractName: "RedeemerRegistry",
    functionName: "offers",
    args: valid ? [redeemer, offerId] : undefined,
    enabled: valid,
  } as any);

  const offerAny = offer as any;
  const offerName = (offerAny?.name ?? offerAny?.[0]) as string | undefined;
  const costCityRaw = (offerAny?.costCity ?? offerAny?.[1]) as bigint | undefined;
  const active = (offerAny?.active ?? offerAny?.[2]) as boolean | undefined;

  const costCity = costCityRaw !== undefined ? formatUnits(costCityRaw, 18) : "?";

  const { writeContractAsync: purchaseOffer, isMining: isPurchasing } = useScaffoldWriteContract("Redemption");

  const { data: lastReceiptId } = useScaffoldReadContract({
    contractName: "Redemption",
    functionName: "lastReceiptId",
    args: [address],
    enabled: !!address,
  } as any);

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-base-content/70">City/Sync</div>
          <h1 className="text-2xl font-bold">Redeem</h1>
          <div className="mt-1 text-sm text-base-content/70">Purchase a redemption offering with CITY.</div>
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

      <Section title="Your wallet" subtitle="Connect a wallet to purchase.">
        <div className="flex items-center justify-between">
          <div className="text-sm text-base-content/70">Connected wallet</div>
          <div>
            {address ? <Address address={address} chain={targetNetwork} size="sm" /> : <span>not connected</span>}
          </div>
        </div>
      </Section>

      <Section title="Offering" subtitle="This page is intended to be opened via a QR code / link.">
        {!valid ? (
          <div className="text-sm text-error">Missing or invalid redeemer/offerId in URL.</div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="text-sm">
              <span className="text-base-content/70">Redeemer:</span>{" "}
              <Address address={redeemer} chain={targetNetwork} size="sm" />
            </div>
            <div className="text-sm">
              <span className="text-base-content/70">Offer:</span> #{offerId.toString()} — {offerName ?? "(unnamed)"}
            </div>
            <div className="text-sm">
              <span className="text-base-content/70">Cost:</span> <span className="font-mono">{costCity} CITY</span>
            </div>
            <div className="text-sm">
              <span className="text-base-content/70">Active:</span> {String(!!active)}
            </div>

            <button
              className="btn btn-primary w-fit"
              disabled={!address || isPurchasing || !active}
              onClick={async () => {
                await purchaseOffer({
                  functionName: "purchaseOffer" as any,
                  args: [redeemer as any, offerId as any],
                } as any);
              }}
            >
              Purchase
            </button>

            <div className="text-xs text-base-content/70">
              Receipt (latest for you): <span className="font-mono">{lastReceiptId?.toString?.() ?? "0"}</span>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}

export default function RedeemLinkPage() {
  return (
    <Suspense fallback={<div className="p-6 text-base-content/50">Loading…</div>}>
      <RedeemContent />
    </Suspense>
  );
}
