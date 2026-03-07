"use client";

import React from "react";
import Link from "next/link";
import { useLogout, useSignerStatus } from "@account-kit/react";
import { LoginScreen } from "./_components/LoginScreen";
import { useDemo } from "./_context/DemoContext";

// ─── Role definitions ─────────────────────────────────────────────────────────

const ROLES = [
  {
    key: "participant" as const,
    href: "/demo/participant",
    emoji: "🏙️",
    title: "Civic Participant",
    tagline: "Earn. Vote. Redeem.",
    accent: "#4169E1",
    description:
      "Civic Participants are the heartbeat of the City/Sync protocol. As a community member, you complete local volunteer tasks — from neighborhood cleanups to civic surveys — and earn CITY credits and VOTE tokens for your contributions. Those credits can be redeemed at partner businesses and services, while your VOTE tokens let you have a direct say in Mass Coordination Events that shape the direction of your city.",
    tabs: [
      { key: "Profile", desc: "View your wallet, earned credits, VOTE balance, and a history of completed tasks and verifications." },
      { key: "Explore", desc: "Browse available volunteer tasks, filter by category, and claim tasks you want to complete for civic credit rewards." },
      { key: "MyCity", desc: "See your personal impact — total credits earned, tasks completed, and your on-chain contribution record." },
      { key: "Vote", desc: "Cast VOTE-weighted votes on active Mass Coordination Events and track the outcomes of initiatives you've supported." },
      { key: "Redemptions", desc: "Browse partner offers and redeem your CITY credits for goods, services, and exclusive community benefits." },
    ],
    eligibility: {
      title: "Onboarding for Civic Participants",
      body: "New Participants must complete an in-person onboarding event to activate their wallet and join the platform. This initial task is how the protocol ensures real community membership — not just an email address. Upon completion, your wallet is whitelisted and you receive your first CITY credits as a welcome reward. From there, you're free to explore and claim any available task on the platform.",
    },
  },
  {
    key: "issuer" as const,
    href: "/demo/issuer",
    emoji: "📋",
    title: "Task Issuer",
    tagline: "Create. Verify. Distribute.",
    accent: "#DD9E33",
    description:
      "Task Issuers are the organizations that power the civic economy. As an Issuer, you represent a community organization, public agency, or public-benefit entity that creates and manages volunteer opportunities. You post tasks from the curated catalog, set CITY and VOTE reward amounts, and verify completions directly from your wallet — triggering on-chain credit minting to deserving Participants.",
    tabs: [
      { key: "Profile", desc: "Manage your organization profile, view your registered name, and track your total issuance activity." },
      { key: "Tasks", desc: "Create new tasks from the approved catalog, set reward amounts, and manage your active and completed task listings." },
      { key: "MyCity", desc: "See city-wide statistics — total credits in circulation, task volume, and how your organization compares to peers." },
      { key: "Dashboard", desc: "Track your issuance metrics: total credits issued, tasks verified, pending completions, and category breakdowns." },
      { key: "MCEs", desc: "View active Mass Coordination Events, monitor community vote outcomes, and create MCE-linked tasks during Planning phase." },
    ],
    eligibility: {
      title: "Becoming a Task Issuer",
      body: "Issuers must apply to join the platform and must represent an organization that is providing a measurable public good or service. Approved Issuers are granted a credit allocation based on the total number of active Issuers and the platform's Issuance Cap — a mechanism that keeps the civic economy balanced. The more Issuers participating, the more thoughtfully each one must allocate their credits across their task portfolio.",
    },
  },
  {
    key: "redeemer" as const,
    href: "/demo/redeemer",
    emoji: "🏪",
    title: "Redeemer",
    tagline: "Accept. Fulfill. Track.",
    accent: "#34eeb6",
    description:
      "Redeemers are the businesses, venues, and service providers that give CITY credits real-world value. As a Redeemer, you decide which offerings you want to present, the credit rates for each, and the terms of redemption — all within the framework set by the Representative Redeemer Committee. You can also opt in to accept MCE Credits, a specialized credit tied to Mass Coordination Events, and set the duration for which specific offers remain valid.",
    tabs: [
      { key: "Profile", desc: "Manage your organization profile, MCE opt-in status, and your registered offering portfolio." },
      { key: "Redemptions", desc: "View incoming redemption requests, process fulfillments, and generate QR codes for in-person redemption flows." },
      { key: "MyCity", desc: "See platform-wide economic activity — total redemptions processed, credit volumes, and community engagement data." },
      { key: "Dashboard", desc: "Track your redemption metrics: total credits accepted, offers processed, queue activity, and fulfillment history." },
      { key: "MCEs", desc: "Monitor Mass Coordination Events, view MCE Credit volumes, and manage MCE-specific time-limited offer windows." },
    ],
    eligibility: {
      title: "Becoming a Redeemer",
      body: "Redeemers must apply to join the platform. Any company or organization — from a local coffee shop to a transit authority — is eligible, as long as they commit to honoring their offerings according to the rules set by the Representative Redeemer Committee. Redeemers have full autonomy over what they offer and at what credit rates, and can create time-limited offers tied to specific credit types like MCE Credits. This flexibility allows both small businesses and large public service providers to participate on their own terms.",
    },
  },
] as const;

// ─── Economy section data ─────────────────────────────────────────────────────

const ECONOMY_CARDS = [
  {
    icon: "📊",
    title: "Issuance Caps",
    body: "The total number of CITY credits that can be issued at any given time is governed by an Issuance Cap — a protocol-level limit that keeps the civic economy from inflating beyond what the Redemption side can absorb. Each Issuer's allocation is determined by dividing the cap by the number of active Issuers, ensuring no single organization can dominate credit creation.",
  },
  {
    icon: "⚖️",
    title: "Issuance & Redemption Balance",
    body: "The health of the public sector economy depends on a fundamental balance: credits issued must be redeemable. If credits are issued faster than Redeemers can absorb them, the value of civic participation erodes. City/Sync's governance model is designed to monitor this balance in real time, with Issuance Caps adjusted periodically to reflect the capacity of the active Redeemer network.",
  },
  {
    icon: "🧭",
    title: "Rate Guidance",
    body: "Redeemers set their own credit rates, but they don't do so blindly. The platform provides guidance benchmarks based on the current credit supply, average redemption volumes, and community feedback — giving Redeemers a principled starting point for valuing their offerings. The Representative Redeemer Committee also plays a governance role in flagging rates that fall outside community norms.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function DemoHome() {
  const { setRole } = useDemo();
  const { isConnected } = useSignerStatus();
  const { logout } = useLogout();

  if (!isConnected) return <LoginScreen />;

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: "#0D0D14", fontFamily: "system-ui, -apple-system, sans-serif", color: "#fff" }}
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-6 py-4"
        style={{ background: "rgba(13,13,20,0.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <Link href="/" className="flex items-center gap-3" style={{ textDecoration: "none" }}>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold"
            style={{ background: "#4169E1", color: "#fff" }}
          >
            CS
          </div>
          <span className="text-base font-bold text-white">City/Sync</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm" style={{ color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>
            city-sync.org
          </Link>
          <button
            onClick={() => logout()}
            className="rounded-xl px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
            style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section
        className="px-6 py-20 text-center"
        style={{ background: "linear-gradient(180deg, #0D0D14 0%, #111128 50%, #0D0D14 100%)" }}
      >
        <div
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold"
          style={{ background: "#4169E1", boxShadow: "0 0 48px rgba(65,105,225,0.4)" }}
        >
          CS
        </div>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-white">
          City<span style={{ color: "#4169E1" }}>/</span>Sync Demo
        </h1>
        <p className="mx-auto mb-3 max-w-2xl text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
          Programmable civic infrastructure for local communities. Explore the protocol from the inside — choose a role
          and see how credits are earned, issued, and redeemed in a living civic economy.
        </p>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
          Live demo on Base Sepolia Testnet · No real funds required
        </p>
      </section>

      {/* ── Role cards ─────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <h2 className="mb-3 text-center text-2xl font-bold text-white">Choose Your Role</h2>
        <p className="mb-12 text-center text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          All three roles share the same state — switch freely to see the full loop.
        </p>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {ROLES.map(role => (
            <div
              key={role.key}
              className="flex flex-col rounded-3xl overflow-hidden"
              style={{ background: "#15151E", border: `1px solid rgba(255,255,255,0.07)` }}
            >
              {/* Card header */}
              <div className="p-6 pb-4" style={{ borderBottom: `1px solid rgba(255,255,255,0.06)` }}>
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-2xl"
                    style={{ background: `${role.accent}18` }}
                  >
                    {role.emoji}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">{role.title}</div>
                    <div className="text-xs font-semibold" style={{ color: role.accent }}>
                      {role.tagline}
                    </div>
                  </div>
                </div>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                  {role.description}
                </p>
              </div>

              {/* Tabs */}
              <div className="p-6 pb-4">
                <div className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>
                  What you can do
                </div>
                <div className="flex flex-col gap-3">
                  {role.tabs.map(tab => (
                    <div key={tab.key} className="flex gap-3">
                      <span
                        className="mt-0.5 shrink-0 rounded-lg px-2 py-0.5 text-xs font-semibold"
                        style={{ background: `${role.accent}18`, color: role.accent, minWidth: 90, textAlign: "center" }}
                      >
                        {tab.key}
                      </span>
                      <span className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                        {tab.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Eligibility */}
              <div
                className="mx-6 mb-6 rounded-2xl p-4"
                style={{ background: `${role.accent}0a`, border: `1px solid ${role.accent}22` }}
              >
                <div className="mb-1.5 text-xs font-semibold" style={{ color: role.accent }}>
                  {role.eligibility.title}
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {role.eligibility.body}
                </p>
              </div>

              {/* CTA */}
              <div className="mt-auto px-6 pb-6">
                <Link
                  href={role.href}
                  onClick={() => setRole(role.key)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-bold transition-opacity hover:opacity-90"
                  style={{ background: role.accent, color: "#0D0D14", textDecoration: "none" }}
                >
                  Enter as {role.title}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Public Sector Economy ───────────────────────────────────────────── */}
      <section
        className="px-6 py-20"
        style={{ background: "#111120", borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="mx-auto max-w-7xl">
          {/* Prose intro */}
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <div className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "#4169E1" }}>
              The Public Sector Economy
            </div>
            <h2 className="mb-5 text-3xl font-bold text-white">How the Civic Economy Works</h2>
            <p className="mb-4 text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              City/Sync operates a bifurcated economy — one that exists entirely within the public sector, separate from
              speculative financial markets. CITY credits are not bought or sold. They are <em>earned through
              contribution</em> and <em>spent on access</em>. This keeps the system grounded in real civic value rather
              than market dynamics.
            </p>
            <p className="text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              For this economy to function sustainably, the rate at which credits are issued must remain in balance with
              the capacity of the Redeemer network to absorb them. Too many credits chasing too few redemptions erodes
              value. Too few credits stifles participation. The protocol is designed to keep this equilibrium — through
              Issuance Caps, governance feedback loops, and transparent rate guidance for Redeemers.
            </p>
          </div>

          {/* Visual cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {ECONOMY_CARDS.map(card => (
              <div
                key={card.title}
                className="rounded-2xl p-6"
                style={{ background: "#15151E", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="mb-4 text-3xl">{card.icon}</div>
                <div className="mb-3 text-base font-bold text-white">{card.title}</div>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer
        className="px-6 py-8 text-center text-xs"
        style={{ color: "rgba(255,255,255,0.2)", borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        City/Sync Demo · Base Sepolia Testnet · All roles share live state
      </footer>
    </div>
  );
}
