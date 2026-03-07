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
  title: _title,
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
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "max(12px, env(safe-area-inset-top)) 16px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            background: "#15151E",
            flexShrink: 0,
          }}
        >
          {/* Left: Switch Roles */}
          <Link
            href="/demo"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              color: "rgba(255,255,255,0.55)",
              textDecoration: "none",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.01em" }}>Switch Roles</span>
          </Link>

          {/* Center: // logo */}
          <div
            style={{
              background: accentColor,
              borderRadius: 10,
              padding: "5px 10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg viewBox="47 2 30 32" width="20" height="22" aria-hidden="true">
              <polygon points="51,32 55,32 62,10 58,10" fill="none" stroke="#15151E" strokeWidth="2" />
              <polygon points="62,28 66,28 73,6 69,6" fill="none" stroke="rgba(21,21,30,0.5)" strokeWidth="2" />
            </svg>
          </div>

          {/* Right: Wallet button */}
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
