"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ContractAddresses } from "../_components/ContractAddresses";
import { Section } from "../_components/Section";
import { Address } from "@scaffold-ui/components";
import { decodeEventLog, formatUnits, parseUnits } from "viem";
import { useAccount, useBlockNumber, usePublicClient } from "wagmi";
import {
  useDeployedContractInfo,
  useScaffoldReadContract,
  useScaffoldWriteContract,
  useTargetNetwork,
} from "~~/hooks/scaffold-eth";

export default function RedeemerJourney() {
  const { address } = useAccount();
  const { targetNetwork } = useTargetNetwork();

  const publicClient = usePublicClient();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  const { data: registryInfo } = useDeployedContractInfo({ contractName: "RedeemerRegistry" });
  const { data: redemptionInfo } = useDeployedContractInfo({ contractName: "Redemption" });

  const [recentPurchases, setRecentPurchases] = useState<
    Array<{ citizen: string; offerId: bigint; costCity: bigint; receiptId: bigint; blockNumber?: bigint }>
  >([]);

  useEffect(() => {
    const run = async () => {
      if (!publicClient || !redemptionInfo?.address || !redemptionInfo?.abi || !address) return;
      if (!blockNumber) return;

      const fromBlock = blockNumber > 5000n ? blockNumber - 5000n : 0n;
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
        args: { redeemer: address as `0x${string}` },
        fromBlock,
        toBlock: blockNumber,
      } as any);

      const decoded = logs
        .map((l: any) => {
          try {
            const d = decodeEventLog({
              abi: redemptionInfo.abi as any,
              data: l.data,
              topics: l.topics,
            }) as any;

            return {
              citizen: d.args.citizen as string,
              offerId: BigInt(d.args.offerId),
              costCity: BigInt(d.args.costCity),
              receiptId: BigInt(d.args.receiptId),
              blockNumber: l.blockNumber as bigint,
            };
          } catch {
            return null;
          }
        })
        .filter(Boolean)
        .slice(-20)
        .reverse() as any;

      setRecentPurchases(decoded);
    };

    run();
  }, [publicClient, redemptionInfo?.address, redemptionInfo?.abi, address, blockNumber]);

  const { data: canRedeem } = useScaffoldReadContract({
    contractName: "RedeemerRegistry",
    functionName: "canRedeem",
    args: [address],
    enabled: !!address,
  } as any);

  const [offerName, setOfferName] = useState<string>("Transit Pass");
  const [offerCostCity, setOfferCostCity] = useState<string>("10");

  const { writeContractAsync: createOffer, isMining: isCreating } = useScaffoldWriteContract("RedeemerRegistry");

  const { data: myNextOfferId } = useScaffoldReadContract({
    contractName: "RedeemerRegistry",
    functionName: "nextOfferId",
    args: [address],
    enabled: !!address,
  } as any);

  const maxOffersToShow = 10;
  const offerIds = useMemo(() => {
    const n = Number(myNextOfferId ?? 0n);
    const count = Math.min(n, maxOffersToShow);
    return Array.from({ length: count }, (_v, i) => BigInt(i + 1));
  }, [myNextOfferId]);

  // Read offers 1..nextOfferId (capped)
  // Scaffold hook doesn't batch multi-reads across arbitrary contractName easily without wagmi;
  // For MVP, we just read per-offer in the UI with useScaffoldReadContract.
  //
  // (If we later want batch reads, resurrect this):
  // const offerReads = offerIds.map(id => ({
  //   contractName: "RedeemerRegistry" as const,
  //   functionName: "offers" as const,
  //   args: [address as `0x${string}`, id] as const,
  // }));

  return (
    <div className="p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-base-content/70">City/Sync</div>
          <h1 className="text-2xl font-bold">Redeemer Journey</h1>
          <div className="mt-1 text-sm text-base-content/70">
            Create redemption offerings and share links (for QR codes) that let citizens purchase by burning CITY.
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

      <Section title="Create offering" subtitle="Offerings are stored onchain and can be purchased by citizens.">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2 flex-wrap items-end">
            <label className="form-control w-full max-w-md">
              <div className="label">
                <span className="label-text">Name</span>
              </div>
              <input className="input input-bordered" value={offerName} onChange={e => setOfferName(e.target.value)} />
            </label>
            <label className="form-control w-full max-w-xs">
              <div className="label">
                <span className="label-text">Cost (CITY)</span>
              </div>
              <input
                className="input input-bordered"
                value={offerCostCity}
                onChange={e => setOfferCostCity(e.target.value)}
                placeholder="10"
              />
            </label>
            <button
              className="btn btn-primary"
              disabled={!address || !canRedeem || isCreating}
              onClick={async () => {
                await createOffer({
                  functionName: "createOffer" as any,
                  args: [offerName as any, parseUnits(offerCostCity || "0", 18) as any],
                } as any);
              }}
            >
              Create
            </button>
          </div>
          <div className="text-xs text-base-content/60">
            After creating, the offering will appear in your list below. (Showing up to {maxOffersToShow} offers.)
          </div>
        </div>
      </Section>

      <Section title="Redemption activity" subtitle="Recent purchases of your offerings (onchain logs).">
        <div className="flex flex-col gap-2">
          {recentPurchases.length === 0 ? (
            <div className="text-sm text-base-content/70">No purchases found yet.</div>
          ) : (
            recentPurchases.map((p, idx) => (
              <div key={`${p.receiptId.toString()}-${idx}`} className="rounded-xl border border-base-300 p-3">
                <div className="text-sm">
                  <span className="text-base-content/70">Citizen:</span> <span className="font-mono">{p.citizen}</span>
                </div>
                <div className="text-sm">
                  Offer #{p.offerId.toString()} · <span className="font-mono">{formatUnits(p.costCity, 18)} CITY</span>
                </div>
                <div className="text-xs text-base-content/60">Receipt #{p.receiptId.toString()}</div>
              </div>
            ))
          )}
        </div>
      </Section>

      <Section title="Your offerings" subtitle="Share the link as a QR code at your kiosk.">
        <div className="flex flex-col gap-3">
          <div className="text-sm text-base-content/70">nextOfferId: {myNextOfferId?.toString?.() ?? "0"}</div>

          {offerIds.length === 0 ? (
            <div className="text-sm text-base-content/70">No offerings yet.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {offerIds.map(id => (
                <OfferRow key={id.toString()} redeemer={address as `0x${string}`} offerId={id} />
              ))}
            </div>
          )}
        </div>
      </Section>
    </div>
  );
}

function OfferRow({ redeemer, offerId }: { redeemer: `0x${string}`; offerId: bigint }) {
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

  const link =
    typeof window !== "undefined"
      ? `${window.location.origin}/citysync/redeem?redeemer=${redeemer}&offerId=${offerId.toString()}`
      : `/citysync/redeem?redeemer=${redeemer}&offerId=${offerId.toString()}`;

  return (
    <div className="rounded-xl border border-base-300 p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{name ?? "(unnamed)"}</div>
          <div className="text-sm text-base-content/70">
            Offer #{offerId.toString()} · <span className="font-mono">{cost} CITY</span> · Active: {String(!!active)}
          </div>
          <div className="text-xs text-base-content/60 break-all mt-1">{link}</div>
        </div>
        <a className="btn btn-ghost" href={link} target="_blank" rel="noreferrer">
          Open
        </a>
      </div>
    </div>
  );
}
