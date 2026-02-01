"use client";

import { useMemo } from "react";
import { Address } from "@scaffold-ui/components";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useTargetNetwork } from "~~/hooks/scaffold-eth";

export function RedeemerOffers({
  redeemer,
  purchaseOffer,
  isPurchasing,
}: {
  redeemer: `0x${string}`;
  purchaseOffer: (args: any) => Promise<any>;
  isPurchasing: boolean;
}) {
  const { targetNetwork } = useTargetNetwork();

  const { data: nextOfferId } = useScaffoldReadContract({
    contractName: "RedeemerRegistry",
    functionName: "nextOfferId",
    args: [redeemer],
    enabled: !!redeemer,
  } as any);

  const offerIds = useMemo(() => {
    const n = Number(nextOfferId ?? 0n);
    const cap = 10;
    const count = Math.min(n, cap);
    return Array.from({ length: count }, (_v, i) => BigInt(i + 1));
  }, [nextOfferId]);

  return (
    <div className="rounded-xl border border-base-300 p-4">
      <div className="text-sm text-base-content/70">Redeemer</div>
      <div className="mt-1">
        <Address address={redeemer} chain={targetNetwork} size="sm" />
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {offerIds.length === 0 ? (
          <div className="text-sm text-base-content/70">No offers yet.</div>
        ) : (
          offerIds.map(id => (
            <OfferCard
              key={id.toString()}
              redeemer={redeemer}
              offerId={id}
              purchaseOffer={purchaseOffer}
              isPurchasing={isPurchasing}
            />
          ))
        )}
      </div>
    </div>
  );
}

function OfferCard({
  redeemer,
  offerId,
  purchaseOffer,
  isPurchasing,
}: {
  redeemer: `0x${string}`;
  offerId: bigint;
  purchaseOffer: (args: any) => Promise<any>;
  isPurchasing: boolean;
}) {
  const { address } = useAccount();
  const { data: offer } = useScaffoldReadContract({
    contractName: "RedeemerRegistry",
    functionName: "offers",
    args: [redeemer, offerId],
    enabled: !!redeemer && offerId > 0n,
  } as any);

  const offerAny = offer as any;
  const name = (offerAny?.name ?? offerAny?.[0]) as string | undefined;
  const costRaw = (offerAny?.costCity ?? offerAny?.[1]) as bigint | undefined;
  const active = (offerAny?.active ?? offerAny?.[2]) as boolean | undefined;

  const cost = costRaw !== undefined ? formatUnits(costRaw, 18) : "?";

  const { data: usedCount } = useScaffoldReadContract({
    contractName: "Redemption",
    functionName: "offerUsesByCitizen",
    args: address ? [address, redeemer, offerId] : undefined,
    enabled: !!address,
  } as any);

  const used = usedCount?.toString?.() ?? "0";

  return (
    <div className="rounded-xl bg-base-100 border border-base-200 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{name ?? "(unnamed)"}</div>
          <div className="text-sm text-base-content/70">
            Offer #{offerId.toString()} · <span className="font-mono">{cost} CITY</span> · Active: {String(!!active)}
          </div>
          <div className="text-xs text-base-content/60 mt-1">
            Used: <span className="font-mono">{used}</span>
          </div>
        </div>
        <button
          className="btn btn-primary"
          disabled={isPurchasing || !active}
          onClick={async () => {
            await purchaseOffer({
              functionName: "purchaseOffer" as any,
              args: [redeemer as any, offerId as any],
            } as any);
          }}
        >
          Purchase
        </button>
      </div>
    </div>
  );
}
