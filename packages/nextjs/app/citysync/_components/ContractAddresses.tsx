"use client";

import { Address } from "@scaffold-ui/components";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";

export function ContractAddresses(props: { addresses: { label: string; address?: `0x${string}` }[] }) {
  const { targetNetwork } = useTargetNetwork();

  return (
    <div className="rounded-xl border border-base-300 bg-base-100 p-4">
      <div className="font-semibold">Contracts</div>
      <div className="mt-2 flex flex-col gap-2">
        {props.addresses.map(item => (
          <div key={item.label} className="flex items-center justify-between gap-3">
            <div className="text-sm text-base-content/70">{item.label}</div>
            <div className="text-right">
              {item.address ? (
                <Address address={item.address} chain={targetNetwork} size="sm" />
              ) : (
                <span className="text-xs text-error">not found</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
