"use client";

import React from "react";

interface WalletModalProps {
  address: string;
  cityBalance: number;
  voteBalance: number;
  mceBalance: number;
  orgName?: string;
  role: string;
  onClose: () => void;
}

const ROLE_COLOR: Record<string, string> = {
  participant: "#4169E1",
  issuer: "#DD9E33",
  redeemer: "#34eeb6",
};

export default function WalletModal({
  address,
  cityBalance,
  voteBalance,
  mceBalance,
  orgName,
  role,
  onClose,
}: WalletModalProps) {
  const color = ROLE_COLOR[role] ?? "#4169E1";

  return (
    <div
      style={{
        position: "fixed",
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(calc(100% - 32px), 520px)",
        top: 68,
        bottom: "calc(108px + env(safe-area-inset-bottom, 0px))",
        zIndex: 220,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(8,10,18,0.76)",
          pointerEvents: "auto",
        }}
        onClick={onClose}
      >
        <div
          style={{
            position: "absolute",
            inset: 12,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 392,
              maxHeight: "100%",
              overflowY: "auto",
              background: "#1E1E2C",
              border: "1px solid rgba(255,255,255,0.16)",
              borderTop: `3px solid ${color}`,
              borderRadius: 22,
              boxShadow: "0 18px 42px rgba(0,0,0,0.48)",
              pointerEvents: "auto",
              padding: "20px 18px 20px",
            }}
          >
            {/* Handle */}
            <div
              style={{
                width: 48,
                height: 4,
                borderRadius: 999,
                background: "rgba(255,255,255,0.15)",
                margin: "0 auto 16px",
              }}
            />

            <div className="mb-4 flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold"
                style={{ background: color, color: "#15151E" }}
              >
                {role === "participant" ? "P" : role === "issuer" ? "I" : "R"}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{orgName ?? "Demo Wallet"}</div>
                <div className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {address}
                </div>
              </div>
            </div>

            <div className="mb-5 rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div
                className="mb-1 text-xs font-medium uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Balances
              </div>
              <div className="mt-3 space-y-3">
                <BalanceRow label="CITY Credits" value={cityBalance} color="#4169E1" symbol="CITY" />
                <BalanceRow label="Vote Tokens" value={voteBalance} color="#DD9E33" symbol="VOTE" />
                <BalanceRow label="MCE Credits" value={mceBalance} color="#34eeb6" symbol="MCE" />
              </div>
            </div>

            <div className="rounded-2xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)" }}>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                This is a simulated wallet on Base Sepolia testnet. All tokens are soul-bound (non-transferable) and
                earned through civic participation.
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-5 w-full rounded-2xl py-3 text-sm font-semibold transition"
              style={{ background: color, color: "#15151E" }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BalanceRow({ label, value, color, symbol }: { label: string; value: number; color: string; symbol: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="h-2 w-2 rounded-full" style={{ background: color }} />
        <span className="text-sm text-white">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold text-white">{value.toLocaleString()}</span>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          {symbol}
        </span>
      </div>
    </div>
  );
}
