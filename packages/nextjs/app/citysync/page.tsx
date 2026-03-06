"use client";

import Link from "next/link";

const roles = [
  {
    key: "citizen",
    title: "Citizen",
    desc: "Browse volunteer opportunities, earn civic credits, redeem CITY, and vote with VOTE.",
    href: "/citysync/citizen",
  },
  {
    key: "issuer",
    title: "Issuer",
    desc: "Offer volunteer opportunities, set CITY rewards, and verify completions to mint CITY + VOTE.",
    href: "/citysync/issuer",
  },
  {
    key: "verifier",
    title: "Verifier",
    desc: "Select opportunities you’re assigned to verify and attest citizen completions to distribute credits.",
    href: "/citysync/verifier",
  },
  {
    key: "redeemer",
    title: "Redeemer",
    desc: "Generate a QR payload and finalize redemptions that burn CITY in exchange for public services.",
    href: "/citysync/redeemer",
  },
] as const;

export default function CitySyncHome() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">City/Sync — Participation Paths</h1>
        <p className="mt-2 text-base-content/70">
          Choose a journey to explore the City/Sync protocol via real wallet interactions on your connected network.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {roles.map(r => (
          <Link
            key={r.key}
            href={r.href}
            className="block rounded-2xl bg-base-100 border border-base-300 p-5 hover:border-primary transition"
          >
            <div className="text-xl font-semibold">{r.title}</div>
            <div className="mt-2 text-sm text-base-content/70">{r.desc}</div>
            <div className="mt-4 text-sm font-medium text-primary">Open →</div>
          </Link>
        ))}
      </div>

      {/* Demo link */}
      <div className="rounded-2xl bg-base-100 border border-primary/40 p-5" style={{ background: "rgba(65,105,225,0.05)" }}>
        <div className="text-lg font-semibold">🎮 Try the Interactive Demo</div>
        <div className="mt-2 text-sm text-base-content/70">
          Explore City/Sync with simulated wallet interactions — no real funds required. Choose a role and experience the
          full protocol flow in a mobile-first interface.
        </div>
        <div className="mt-3">
          <Link href="/demo" className="link font-medium">
            Open Demo →
          </Link>
        </div>
      </div>

      <div className="rounded-2xl bg-base-100 border border-base-300 p-5">
        <div className="text-lg font-semibold">Local demo setup</div>
        <div className="mt-2 text-sm text-base-content/70">
          Use the Admin Setup page to approve an issuer and redeemer, and optionally delegate a verifier (prefilled with
          common Anvil accounts).
        </div>
        <div className="mt-3">
          <Link href="/citysync/admin" className="link">
            Open Admin Setup →
          </Link>
        </div>
      </div>
    </div>
  );
}
