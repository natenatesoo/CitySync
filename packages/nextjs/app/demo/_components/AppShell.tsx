"use client";

import React, { useState } from "react";
import Link from "next/link";
import BottomNav, { NavTab } from "./BottomNav";
import WalletModal from "./WalletModal";

interface AppShellProps {
  role: "participant" | "issuer" | "redeemer";
  orgName?: string;
  address: string;
  cityBalance: number;
  voteBalance: number;
  mceBalance: number;
  tabs: NavTab[];
  activeTab: string;
  onTabChange: (key: string) => void;
  accentColor: string;
  title: string;
  children: React.ReactNode;
  leftPanel?: React.ReactNode;
  rightPanel?: React.ReactNode;
}

export default function AppShell({
  role,
  orgName,
  address,
  cityBalance,
  voteBalance,
  mceBalance,
  tabs,
  activeTab,
  onTabChange,
  accentColor,
  title,
  children,
  leftPanel,
  rightPanel,
}: AppShellProps) {
  const [walletOpen, setWalletOpen] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center"
      style={{ background: "#0D0D14", fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      {/* Phone-width container */}
      <div
        className="relative flex h-full w-full flex-col overflow-hidden"
        style={{ maxWidth: 480, background: "#15151E" }}
      >
        {/* Header */}
        <header
          className="flex shrink-0 items-center justify-between px-5"
          style={{
            paddingTop: "max(12px, env(safe-area-inset-top))",
            paddingBottom: 12,
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            background: "#15151E",
          }}
        >
          <Link href="/demo" className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold"
              style={{ background: accentColor, color: "#15151E" }}
            >
              CS
            </div>
            <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
              {title}
            </span>
          </Link>

          {/* Wallet button */}
          <button
            onClick={() => setWalletOpen(true)}
            className="flex items-center gap-2 rounded-xl px-3 py-1.5 transition"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="h-2 w-2 rounded-full" style={{ background: "#34eeb6" }} />
            <span className="font-mono text-xs text-white">{cityBalance.toLocaleString()} CITY</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: "rgba(255,255,255,0.4)" }}>
              <rect x="2" y="7" width="20" height="15" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M16 11a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="currentColor" />
              <path d="M2 11h20" stroke="currentColor" strokeWidth="2" />
              <path d="M7 7V5a5 5 0 0 1 10 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {/* Scrollable content area */}
        <main className="flex-1 overflow-y-auto" style={{ paddingBottom: 80 }}>
          {children}
        </main>

        {/* Bottom navigation */}
        <BottomNav tabs={tabs} active={activeTab} onChange={onTabChange} />
      </div>

      {/* Left context panel — naturally hidden on narrow viewports via absolute positioning */}
      {leftPanel && (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: "calc(50% + 260px)",
            width: 280,
            padding: "72px 20px 40px",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          {leftPanel}
        </div>
      )}

      {/* Right context panel — naturally hidden on narrow viewports via absolute positioning */}
      {rightPanel && (
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "calc(50% + 260px)",
            width: 280,
            padding: "72px 20px 40px",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          {rightPanel}
        </div>
      )}

      {/* Wallet modal */}
      {walletOpen && (
        <WalletModal
          address={address}
          cityBalance={cityBalance}
          voteBalance={voteBalance}
          mceBalance={mceBalance}
          orgName={orgName}
          role={role}
          onClose={() => setWalletOpen(false)}
        />
      )}
    </div>
  );
}
