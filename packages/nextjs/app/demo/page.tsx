"use client";

import React from "react";
import Link from "next/link";
import { useDemo } from "./_context/DemoContext";

const ROLES = [
  {
    key: "participant" as const,
    href: "/demo/participant",
    emoji: "🏙️",
    title: "Civic Participant",
    tagline: "Earn. Vote. Redeem.",
    description:
      "Complete local volunteer tasks to earn CITY credits and VOTE tokens. Use credits to unlock services from partner venues, and cast votes on Mass Coordination Events that shape city initiatives.",
    accent: "#4169E1",
    tabs: ["Profile", "Explore", "MyCity", "Vote", "Redemptions"],
  },
  {
    key: "issuer" as const,
    href: "/demo/issuer",
    emoji: "📋",
    title: "Task Issuer",
    tagline: "Create. Verify. Distribute.",
    description:
      "Post volunteer opportunities from the curated task catalog, set CITY and VOTE rewards, and verify completions from your wallet to mint credits directly to participants.",
    accent: "#DD9E33",
    tabs: ["Profile", "Tasks", "MyCity", "Dashboard", "MCEs"],
  },
  {
    key: "redeemer" as const,
    href: "/demo/redeemer",
    emoji: "🏪",
    title: "Redeemer",
    tagline: "Accept. Fulfill. Track.",
    description:
      "Register your business or service to accept CITY credits in exchange for goods and public services. Opt in to MCECredits for bonus offerings tied to Mass Coordination Events.",
    accent: "#34eeb6",
    tabs: ["Profile", "Redemptions", "MyCity", "Dashboard", "MCEs"],
  },
] as const;

export default function DemoHome() {
  const { setRole } = useDemo();

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center overflow-y-auto"
      style={{ background: "#0D0D14", fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <div className="flex w-full flex-col" style={{ maxWidth: 480, background: "#15151E" }}>
        {/* Hero */}
        <div
          className="relative shrink-0 px-6 pb-8 pt-14"
          style={{
            background: "linear-gradient(160deg, #15151E 0%, #1a1a2e 50%, #15151E 100%)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          {/* Back to site */}
          <Link
            href="/"
            className="mb-6 flex items-center gap-1.5 text-xs"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            city-sync.org
          </Link>

          {/* Logo lockup */}
          <div className="mb-5 flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl font-bold"
              style={{ background: "#4169E1", color: "#fff", boxShadow: "0 0 30px rgba(65,105,225,0.35)" }}
            >
              CS
            </div>
            <div>
              <div className="text-xl font-bold text-white">City/Sync</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                Programmable Civic Infrastructure
              </div>
            </div>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-white">Choose Your Role</h1>
          <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
            This is a live demo running on Base Sepolia. Wallet interactions are simulated — no real funds required.
            Pick a role to explore the protocol from the inside.
          </p>
        </div>

        {/* Role cards */}
        <div className="flex flex-col gap-4 px-5 py-6">
          {ROLES.map(role => (
            <Link
              key={role.key}
              href={role.href}
              onClick={() => setRole(role.key)}
              className="group block rounded-3xl p-5 transition-all"
              style={{
                background: "#1E1E2C",
                border: `1.5px solid rgba(255,255,255,0.07)`,
                textDecoration: "none",
              }}
            >
              {/* Role header */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                    style={{ background: `${role.accent}18` }}
                  >
                    {role.emoji}
                  </div>
                  <div>
                    <div className="text-base font-semibold text-white">{role.title}</div>
                    <div className="text-xs font-medium" style={{ color: role.accent }}>
                      {role.tagline}
                    </div>
                  </div>
                </div>
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5"
                  style={{ background: role.accent }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="#15151E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>

              {/* Description */}
              <p className="mb-4 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                {role.description}
              </p>

              {/* Tab preview */}
              <div className="flex flex-wrap gap-1.5">
                {role.tabs.map(tab => (
                  <span
                    key={tab}
                    className="rounded-full px-2.5 py-0.5 text-xs"
                    style={{ background: `${role.accent}15`, color: role.accent }}
                  >
                    {tab}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-10 pt-2">
          <div
            className="rounded-2xl px-5 py-4"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div className="mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
              About the Demo
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.4)" }}>
              All three roles interact with the same shared state — credits earned as a Participant are spendable at
              Redeemer offers, and tasks created by an Issuer appear in the Participant&apos;s explore feed. Switch
              between roles to see the full loop.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
