"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import BottomNav, { NavTab } from "./BottomNav";
import WalletModal from "./WalletModal";
import { useDemo } from "../_context/DemoContext";

// ─── Role definitions (single source of truth for the switcher) ────────────────

const ROLES = [
  {
    key: "participant" as const,
    emoji: "🏙️",
    label: "Participant",
    tagline: "Earn · Vote · Redeem",
    accent: "#4169E1",
    href: "/demo/participant",
  },
  {
    key: "issuer" as const,
    emoji: "📋",
    label: "Issuer Org",
    tagline: "Create · Verify · Distribute",
    accent: "#DD9E33",
    href: "/demo/issuer",
  },
  {
    key: "redeemer" as const,
    emoji: "🏪",
    label: "Redeemer Org",
    tagline: "Incentivize · Reward · Track",
    accent: "#34eeb6",
    href: "/demo/redeemer",
  },
] as const;

// ─── Props ─────────────────────────────────────────────────────────────────────

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

// ─── Component ─────────────────────────────────────────────────────────────────

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
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const { setRole } = useDemo();
  const router = useRouter();

  const currentRole = ROLES.find(r => r.key === role)!;

  const handleRoleSwitch = (r: (typeof ROLES)[number]) => {
    if (r.key === role) {
      setSwitcherOpen(false);
      return;
    }
    setRole(r.key);
    setSwitcherOpen(false);
    router.push(r.href);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center"
      style={{
        background: "radial-gradient(1100px 500px at 50% -120px, rgba(65,105,225,0.18), transparent 65%), #0D0D14",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Phone-width container */}
      <div
        className="relative flex h-full w-full flex-col overflow-hidden"
        style={{
          maxWidth: 430,
          background: "#15151E",
          borderLeft: "1px solid rgba(255,255,255,0.05)",
          borderRight: "1px solid rgba(255,255,255,0.05)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
        }}
      >
        {/* Header */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 35,
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            alignItems: "center",
            padding: "max(12px, env(safe-area-inset-top)) 14px 10px",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(21,21,30,0.92)",
            backdropFilter: "blur(10px)",
            flexShrink: 0,
          }}
        >
          {/* Left: Role badge / switcher trigger */}
          <button
            onClick={() => setSwitcherOpen(true)}
            style={{
              justifySelf: "start",
              display: "flex",
              alignItems: "center",
              gap: 6,
              minHeight: 42,
              padding: "6px 10px 6px 8px",
              borderRadius: 10,
              border: `1px solid ${currentRole.accent}30`,
              background: `${currentRole.accent}14`,
              cursor: "pointer",
              transition: "background 0.15s ease",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = `${currentRole.accent}22`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = `${currentRole.accent}14`;
            }}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>{currentRole.emoji}</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.03em",
                color: currentRole.accent,
                lineHeight: 1,
              }}
            >
              {currentRole.label}
            </span>
            {/* Chevron down */}
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke={currentRole.accent}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ opacity: 0.7, marginLeft: 1 }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Center: // logo mark */}
          <div
            style={{
              justifySelf: "center",
              background: accentColor,
              borderRadius: 10,
              padding: "6px 10px",
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
            className="flex items-center gap-1.5 rounded-xl transition"
            style={{
              justifySelf: "end",
              minHeight: 42,
              padding: "8px 12px 8px 10px",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <div className="h-2 w-2 rounded-full" style={{ background: "#34eeb6" }} />
            <span className="font-mono text-white" style={{ fontSize: 11, lineHeight: 1, whiteSpace: "nowrap" }}>
              {cityBalance.toLocaleString()} CITY
            </span>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" style={{ color: "rgba(255,255,255,0.4)" }}>
              <rect x="2" y="7" width="20" height="15" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M16 11a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="currentColor" />
              <path d="M2 11h20" stroke="currentColor" strokeWidth="2" />
              <path d="M7 7V5a5 5 0 0 1 10 0v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </header>

        {/* Scrollable content area */}
        <main
          className="flex-1 overflow-y-auto"
          style={{
            position: "relative",
            paddingBottom: "calc(108px + env(safe-area-inset-bottom, 0px))",
            WebkitOverflowScrolling: "touch",
            overscrollBehaviorY: "contain",
          }}
        >
          {children}
        </main>

        {/* Bottom navigation */}
        <BottomNav tabs={tabs} active={activeTab} onChange={onTabChange} accentColor={accentColor} />

        {/* ── Role Switcher Bottom Sheet ────────────────────────────────────── */}
        {/* Backdrop */}
        <div
          onClick={() => setSwitcherOpen(false)}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            zIndex: 50,
            opacity: switcherOpen ? 1 : 0,
            pointerEvents: switcherOpen ? "auto" : "none",
            transition: "opacity 0.22s ease",
          }}
        />

        {/* Sheet */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 51,
            background: "#1A1A28",
            borderTop: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px 20px 0 0",
            padding: "0 0 calc(16px + env(safe-area-inset-bottom, 0px))",
            transform: switcherOpen ? "translateY(0)" : "translateY(100%)",
            transition: "transform 0.28s cubic-bezier(0.32,0.72,0,1)",
            boxShadow: "0 -8px 40px rgba(0,0,0,0.5)",
          }}
        >
          {/* Drag handle */}
          <div style={{ display: "flex", justifyContent: "center", padding: "12px 0 8px" }}>
            <div
              style={{
                width: 36,
                height: 4,
                borderRadius: 2,
                background: "rgba(255,255,255,0.18)",
              }}
            />
          </div>

          {/* Sheet header */}
          <div
            style={{
              padding: "4px 20px 14px",
              borderBottom: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.35)",
              }}
            >
              Switch Role
            </p>
          </div>

          {/* Role options */}
          <div style={{ padding: "8px 12px" }}>
            {ROLES.map(r => {
              const isActive = r.key === role;
              return (
                <button
                  key={r.key}
                  onClick={() => handleRoleSwitch(r)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "14px 12px",
                    borderRadius: 14,
                    border: isActive ? `1px solid ${r.accent}35` : "1px solid transparent",
                    background: isActive ? `${r.accent}12` : "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 0.12s ease",
                    marginBottom: 4,
                  }}
                >
                  {/* Emoji badge */}
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: `${r.accent}18`,
                      border: `1px solid ${r.accent}28`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      flexShrink: 0,
                    }}
                  >
                    {r.emoji}
                  </div>

                  {/* Label + tagline */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: isActive ? r.accent : "#fff",
                        lineHeight: 1.2,
                        marginBottom: 3,
                      }}
                    >
                      {r.label}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.38)",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {r.tagline}
                    </div>
                  </div>

                  {/* Active checkmark */}
                  {isActive && (
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        background: r.accent,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M20 6L9 17l-5-5"
                          stroke="#0D0D14"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Cancel */}
          <div style={{ padding: "4px 20px 0" }}>
            <button
              onClick={() => setSwitcherOpen(false)}
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: 14,
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.04)",
                color: "rgba(255,255,255,0.45)",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Left context panel */}
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

      {/* Right context panel */}
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
