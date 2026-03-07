"use client";

import React, { useEffect, useRef, useState } from "react";
import AppShell from "../_components/AppShell";
import { NavTab } from "../_components/BottomNav";
import { useDemo } from "../_context/DemoContext";
import { FAKE_WALLETS, RedemptionOffer, Task, TaskCategory } from "../_data/mockData";

// ─── Brand ────────────────────────────────────────────────────────────────────

const ACCENT = "#4169E1";
const TEAL = "#34eeb6";
const GOLD = "#DD9E33";

// ─── Panel helpers ────────────────────────────────────────────────────────────

function PanelCard({
  label,
  title,
  accent,
  children,
}: {
  label: string;
  title: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.025)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 16,
        padding: "20px",
        marginBottom: 12,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.12em",
          color: accent,
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 10, lineHeight: 1.3 }}>{title}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.65 }}>{children}</div>
    </div>
  );
}

function PanelStats({
  stats,
  accent,
}: {
  stats: { label: string; value: string | number }[];
  accent: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {stats.map(({ label, value }) => (
        <div
          key={label}
          style={{
            background: "rgba(255,255,255,0.025)",
            border: "1px solid rgba(255,255,255,0.05)",
            borderRadius: 12,
            padding: "12px 14px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{label}</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: accent }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

function getParticipantPanels(
  activeTab: string,
  state: ReturnType<typeof useDemo>["state"],
): { left: React.ReactNode; right: React.ReactNode } {
  const { participant, mces, epoch2Proposals, posts, availableTasks, offers, pastRedemptions } = state;
  const openTasks = availableTasks.filter(t => t.slotsRemaining > 0 && !t.isOnboarding);
  const uniqueIssuers = new Set(availableTasks.map(t => t.issuerId)).size;
  const uniqueRedeemers = new Set(offers.map(o => o.redeemerId)).size;
  const totalAllocated = Object.values(participant.mceVoteAllocations).reduce((a, b) => a + b, 0);
  const totalCreditsAvailable = openTasks.reduce((n, t) => n + t.credits, 0);

  switch (activeTab) {
    case "profile":
      return {
        left: (
          <PanelCard label="Civic Participant" title="Your Civic Wallet" accent={ACCENT}>
            <p style={{ margin: "0 0 12px" }}>
              Every task you complete earns CITY credits and VOTE tokens — minted directly to your address on Base. No
              intermediary. The issuing organization&apos;s verification triggers on-chain transfer.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {(
                [
                  ["🏙️", "CITY credits", "spendable at partner venues"],
                  ["🗳️", "VOTE tokens", "governance weight in MCE votes"],
                  ["⚡", "MCECredits", "bonus rewards from city-wide events"],
                ] as [string, string, string][]
              ).map(([icon, term, desc]) => (
                <div key={term} style={{ display: "flex", gap: 8 }}>
                  <span>{icon}</span>
                  <span>
                    <strong style={{ color: "rgba(255,255,255,0.75)" }}>{term}</strong> — {desc}
                  </span>
                </div>
              ))}
            </div>
          </PanelCard>
        ),
        right: (
          <PanelStats
            accent={ACCENT}
            stats={[
              { label: "CITY Balance", value: participant.cityBalance },
              { label: "VOTE Balance", value: participant.voteBalance },
              { label: "Tasks Completed", value: participant.completedTasks.length },
              { label: "Active Issuers", value: uniqueIssuers },
            ]}
          />
        ),
      };

    case "explore":
      return {
        left: (
          <PanelCard label="Task Catalog" title="Claim & Complete" accent={ACCENT}>
            <p style={{ margin: "0 0 12px" }}>
              Tasks are reviewed by the city administration and issued by certified organizations. Each has a fixed slot
              count, reward, and a verification requirement — credits are released only after the issuing org confirms
              your work.
            </p>
            <p style={{ margin: 0 }}>
              Onboarding tasks have unlimited slots and are always available for new participants with a zero balance.
            </p>
          </PanelCard>
        ),
        right: (
          <PanelStats
            accent={ACCENT}
            stats={[
              { label: "Open Tasks", value: openTasks.length },
              { label: "Claimed by You", value: participant.claimedTaskIds.length },
              { label: "Issuing Orgs", value: uniqueIssuers },
              { label: "CITY Available", value: `${totalCreditsAvailable}+` },
            ]}
          />
        ),
      };

    case "mycity":
      return {
        left: (
          <PanelCard label="City Feed" title="Your City's Bulletin Board" accent={ACCENT}>
            <p style={{ margin: "0 0 12px" }}>
              Certified Issuer Organizations and Redeemer Venues post here directly — announcements, events, volunteer
              opportunities, and deals.
            </p>
            <p style={{ margin: 0 }}>
              No ads. No algorithms. Just your city&apos;s orgs talking to you. Like posts to boost their visibility in
              the community feed.
            </p>
          </PanelCard>
        ),
        right: (
          <PanelStats
            accent={ACCENT}
            stats={[
              { label: "Posts in Feed", value: posts.length },
              { label: "Active Orgs", value: new Set(posts.map(p => p.authorId)).size },
              { label: "Post Categories", value: 4 },
              { label: "Liked by You", value: participant.likedPostIds.length },
            ]}
          />
        ),
      };

    case "vote":
      return {
        left: (
          <PanelCard label="MCE Governance" title="Governance by Participation" accent={ACCENT}>
            <p style={{ margin: "0 0 12px" }}>
              VOTE tokens are non-transferable — you can&apos;t buy them, only earn them through civic work. Your vote
              weight is proportional to your earned balance.
            </p>
            <p style={{ margin: 0 }}>
              In Epoch 1, allocate tokens across active proposals. In Epoch 2, signal support for upcoming ideas — the
              top-liked proposals advance to the next voting cycle.
            </p>
          </PanelCard>
        ),
        right: (
          <PanelStats
            accent={ACCENT}
            stats={[
              { label: "Your VOTE Balance", value: participant.voteBalance },
              { label: "Allocated", value: totalAllocated },
              { label: "Remaining", value: participant.voteBalance - totalAllocated },
              { label: "Epoch 1 Proposals", value: mces.length },
              { label: "Epoch 2 Proposals", value: epoch2Proposals.length },
            ]}
          />
        ),
      };

    case "redeem":
      return {
        left: (
          <PanelCard label="Redemption" title="Close the Loop" accent={ACCENT}>
            <p style={{ margin: "0 0 12px" }}>
              CITY credits were minted because you did real civic work. Spend them at partner venues — the credit burns
              on-chain, and the venue receives confirmation instantly.
            </p>
            <p style={{ margin: 0 }}>
              MCECredits unlock additional offers from venues that opted into Mass Coordination Events. No cash, no
              extra apps — just a QR code scan at the counter.
            </p>
          </PanelCard>
        ),
        right: (
          <PanelStats
            accent={ACCENT}
            stats={[
              { label: "Partner Venues", value: uniqueRedeemers },
              { label: "Offer Categories", value: 5 },
              { label: "Your CITY", value: participant.cityBalance },
              { label: "Past Redemptions", value: pastRedemptions.length },
            ]}
          />
        ),
      };

    default:
      return { left: null, right: null };
  }
}

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconUser = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);
const IconCompass = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);
const IconCity = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IconVote = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 20V10" />
    <path d="M12 20V4" />
    <path d="M6 20v-6" />
  </svg>
);
const IconGift = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 12 20 22 4 22 4 12" />
    <rect x="2" y="7" width="20" height="5" />
    <line x1="12" y1="22" x2="12" y2="7" />
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
  </svg>
);
const IconPencil = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconCheck = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconXSmall = ({ size = 14 }: { size?: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const IconHeart = ({ filled }: { filled: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const IconArrow = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const IconLock = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Shared card style ────────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  padding: "16px",
};

// ─── Category pill colors ─────────────────────────────────────────────────────

const CAT_COLORS: Record<string, string> = {
  Onboarding: "#34eeb6",
  Environment: "#4CAF50",
  Education: "#9C27B0",
  Community: "#FF9800",
  Health: "#E91E63",
  Infrastructure: "#607D8B",
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS: NavTab[] = [
  { key: "profile", label: "Profile", icon: <IconUser /> },
  { key: "explore", label: "Explore", icon: <IconCompass /> },
  { key: "mycity", label: "MyCity", icon: <IconCity /> },
  { key: "vote", label: "Vote", icon: <IconVote /> },
  { key: "redeem", label: "Redeem", icon: <IconGift /> },
];

// ─── Verification Overlay ─────────────────────────────────────────────────────

function VerifyOverlay() {
  const { state } = useDemo();
  const v = state.verifying;
  if (!v) return null;

  const pct = Math.round(((12 - v.secondsRemaining) / 12) * 100);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(13,13,20,0.92)",
      }}
    >
      <div style={{ ...card, maxWidth: 320, width: "90%", textAlign: "center", padding: 28 }}>
        <div style={{ position: "relative", width: 80, height: 80, margin: "0 auto 20px" }}>
          <svg width="80" height="80" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke={TEAL}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 34}`}
              strokeDashoffset={`${2 * Math.PI * 34 * (1 - pct / 100)}`}
              style={{ transition: "stroke-dashoffset 0.9s linear" }}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              fontWeight: 700,
              color: "white",
            }}
          >
            {v.secondsRemaining}
          </div>
        </div>
        <div style={{ color: TEAL, fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Verifying on-chain…</div>
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.5 }}>{v.taskTitle}</div>
        <div
          style={{
            marginTop: 16,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
          }}
        >
          Demo: auto-verification simulates the on-chain completion flow
        </div>
      </div>
    </div>
  );
}

// ─── Execute Task Modal ───────────────────────────────────────────────────────

function ExecuteModal({ task, onConfirm, onClose }: { task: Task; onConfirm: () => void; onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 180,
        background: "rgba(13,13,20,0.88)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          ...card,
          width: "100%",
          maxWidth: 480,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          padding: "24px 20px 32px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: "white" }}>Complete Task</span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}
          >
            <IconXSmall size={18} />
          </button>
        </div>

        <div
          style={{
            marginBottom: 16,
            padding: "14px 16px",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10,
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 14, color: "white", marginBottom: 4 }}>{task.title}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
            {task.issuerName} · {task.estimatedTime}
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <div
            style={{
              flex: 1,
              background: "rgba(52,238,182,0.08)",
              border: "1px solid rgba(52,238,182,0.2)",
              borderRadius: 8,
              padding: "10px 0",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: TEAL }}>+{task.credits}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>CITY</div>
          </div>
          <div
            style={{
              flex: 1,
              background: "rgba(65,105,225,0.08)",
              border: "1px solid rgba(65,105,225,0.2)",
              borderRadius: 8,
              padding: "10px 0",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 700, color: ACCENT }}>+{task.voteTokens}</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>VOTE</div>
          </div>
          {task.isMCE && (
            <div
              style={{
                flex: 1,
                background: "rgba(221,158,51,0.08)",
                border: "1px solid rgba(221,158,51,0.2)",
                borderRadius: 8,
                padding: "10px 0",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 18, fontWeight: 700, color: GOLD }}>+{task.credits}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>MCE</div>
            </div>
          )}
        </div>

        <div
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
            background: "rgba(255,255,255,0.03)",
            borderRadius: 8,
            padding: "10px 12px",
            marginBottom: 20,
            lineHeight: 1.5,
          }}
        >
          In production, task completion is verified by the Issuer before credits are minted. In this demo, verification
          is automated — a 12-second countdown simulates on-chain activity.
        </div>

        <button
          onClick={onConfirm}
          style={{
            width: "100%",
            padding: "14px 0",
            background: ACCENT,
            color: "white",
            border: "none",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Confirm &amp; Verify
        </button>
      </div>
    </div>
  );
}

// ─── Redeem Confirm Modal ─────────────────────────────────────────────────────

function QRIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="5" y="5" width="3" height="3" fill="currentColor" stroke="none" />
      <rect x="16" y="5" width="3" height="3" fill="currentColor" stroke="none" />
      <rect x="5" y="16" width="3" height="3" fill="currentColor" stroke="none" />
      <path d="M14 14h2v2h-2zM18 14h2v2h-2zM14 18h2v2h-2zM18 18h2v2h-2z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function RedeemModal({
  offer,
  onConfirm,
  onClose,
}: {
  offer: RedemptionOffer;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 180,
        background: "rgba(13,13,20,0.88)",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          ...card,
          width: "100%",
          maxWidth: 480,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          padding: "24px 20px 32px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ fontWeight: 700, fontSize: 16, color: "white" }}>Confirm Redemption</span>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer" }}
          >
            <IconXSmall size={18} />
          </button>
        </div>

        <div style={{ textAlign: "center", padding: "20px 0 16px" }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>{offer.emoji}</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "white", marginBottom: 4 }}>{offer.offerTitle}</div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>{offer.redeemerName}</div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(52,238,182,0.1)",
              border: "1px solid rgba(52,238,182,0.25)",
              borderRadius: 20,
              padding: "6px 14px",
            }}
          >
            <span style={{ fontSize: 16, fontWeight: 700, color: TEAL }}>{offer.costCity} CITY</span>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>will be spent</span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 14,
            alignItems: "flex-start",
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10,
            padding: "14px",
            marginBottom: 20,
          }}
        >
          <div style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0, marginTop: 2 }}>
            <QRIcon />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: 4 }}>
              QR Code at Point of Redemption
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>
              In production, a redemption QR code is generated on-chain and scanned by the Redeemer to confirm. In this
              demo, the transaction is simulated instantly.
            </div>
          </div>
        </div>

        <button
          onClick={onConfirm}
          style={{
            width: "100%",
            padding: "14px 0",
            background: TEAL,
            color: "#15151E",
            border: "none",
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Redeem Now
        </button>
      </div>
    </div>
  );
}

// ─── Success Toast ────────────────────────────────────────────────────────────

function SuccessToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 90,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 300,
        background: "#1a2e20",
        border: "1px solid rgba(52,238,182,0.3)",
        borderRadius: 12,
        padding: "12px 20px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
        maxWidth: 340,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ color: TEAL }}>
        <IconCheck size={16} />
      </span>
      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>{message}</span>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// PROFILE TAB
// ═════════════════════════════════════════════════════════════════════════════

function ProfileTab({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const { state, setCitizenName } = useDemo();
  const p = state.participant;
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(p.citizenName);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const saveEdit = () => {
    const trimmed = nameInput.trim();
    if (trimmed) setCitizenName(trimmed);
    setEditing(false);
  };
  const cancelEdit = () => {
    setNameInput(p.citizenName);
    setEditing(false);
  };

  const totalAllocated = Object.values(p.mceVoteAllocations).reduce((a, b) => a + b, 0);
  const votedMceIds = Object.entries(p.mceVoteAllocations)
    .filter(([, v]) => v > 0)
    .map(([id]) => id);
  const activeMces = state.mces.filter(m => votedMceIds.includes(m.id));
  const creditsEarned = p.completedTasks.reduce((sum, t) => sum + t.credits, 0);

  return (
    <div style={{ padding: "20px 16px 24px" }}>
      {/* Identity card */}
      <div style={{ ...card, marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${ACCENT}, #6b8fff)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                fontWeight: 700,
                color: "white",
                flexShrink: 0,
              }}
            >
              {p.citizenName ? p.citizenName[0].toUpperCase() : "?"}
            </div>
            <div>
              {editing ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    ref={inputRef}
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") saveEdit();
                      if (e.key === "Escape") cancelEdit();
                    }}
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      border: "1px solid rgba(65,105,225,0.5)",
                      borderRadius: 8,
                      padding: "6px 10px",
                      color: "white",
                      fontSize: 15,
                      fontWeight: 600,
                      outline: "none",
                      width: 150,
                    }}
                  />
                  <button
                    onClick={saveEdit}
                    style={{ background: "none", border: "none", color: TEAL, cursor: "pointer", padding: 0 }}
                  >
                    <IconCheck size={16} />
                  </button>
                  <button
                    onClick={cancelEdit}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(255,255,255,0.4)",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <IconXSmall size={16} />
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{ fontSize: 16, fontWeight: 700, color: p.citizenName ? "white" : "rgba(255,255,255,0.3)" }}
                  >
                    {p.citizenName || "Tap to set your name"}
                  </span>
                  <button
                    onClick={() => {
                      setNameInput(p.citizenName);
                      setEditing(true);
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "rgba(255,255,255,0.35)",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    <IconPencil size={14} />
                  </button>
                </div>
              )}
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 3, fontFamily: "monospace" }}>
                {FAKE_WALLETS.participant}
              </div>
            </div>
          </div>
          <span
            style={{
              background: "rgba(52,238,182,0.1)",
              border: "1px solid rgba(52,238,182,0.2)",
              borderRadius: 20,
              padding: "4px 12px",
              fontSize: 12,
              color: TEAL,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            Citizen
          </span>
        </div>

        {/* Balances */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { label: "CITY", value: p.cityBalance, color: TEAL },
            { label: "VOTE", value: p.voteBalance, color: ACCENT },
            { label: "MCE", value: p.mceBalance, color: GOLD },
          ].map(b => (
            <div
              key={b.label}
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 10,
                padding: "12px 0",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 20, fontWeight: 700, color: b.color }}>{b.value.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{b.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ ...card, marginBottom: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div style={{ textAlign: "center", padding: "4px 0" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "white" }}>{p.completedTasks.length}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>Tasks Completed</div>
        </div>
        <div style={{ textAlign: "center", padding: "4px 0" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: TEAL }}>{creditsEarned.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>Credits Earned</div>
        </div>
      </div>

      {/* Recent completed tasks */}
      {p.completedTasks.length > 0 && (
        <div style={{ ...card, marginBottom: 14 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "rgba(255,255,255,0.5)",
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Recent Tasks
          </div>
          {p.completedTasks.slice(0, 3).map((t, i) => (
            <div
              key={t.taskId}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingBottom: i < Math.min(p.completedTasks.length, 3) - 1 ? 10 : 0,
                marginBottom: i < Math.min(p.completedTasks.length, 3) - 1 ? 10 : 0,
                borderBottom:
                  i < Math.min(p.completedTasks.length, 3) - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{t.title}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                  {fmtDate(t.completedAt)}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: TEAL }}>+{t.credits} CITY</div>
                <div style={{ fontSize: 11, color: `${ACCENT}cc`, marginTop: 1 }}>+{t.voteTokens} VOTE</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active vote allocations */}
      <div style={{ ...card }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "rgba(255,255,255,0.5)",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Active Votes
          </div>
          <button
            onClick={() => onTabChange("vote")}
            style={{
              background: "none",
              border: "none",
              color: ACCENT,
              cursor: "pointer",
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: 0,
            }}
          >
            Vote tab <IconArrow />
          </button>
        </div>

        {activeMces.length === 0 ? (
          <div style={{ textAlign: "center", padding: "12px 0 4px" }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.5 }}>
              {p.voteBalance === 0
                ? "Complete tasks to earn VOTE tokens, then allocate them to MCE proposals."
                : `You have ${p.voteBalance} VOTE — head to the Vote tab to allocate.`}
            </div>
          </div>
        ) : (
          <>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginBottom: 10 }}>
              {totalAllocated} of {p.voteBalance} VOTE allocated
            </div>
            {activeMces.map(m => (
              <div
                key={m.id}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}
              >
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", flex: 1, paddingRight: 12 }}>
                  {m.title}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT }}>
                  {p.mceVoteAllocations[m.id] ?? 0} VOTE
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// EXPLORE TAB
// ═════════════════════════════════════════════════════════════════════════════

const ALL_CATEGORIES: TaskCategory[] = [
  "Onboarding",
  "Environment",
  "Education",
  "Community",
  "Health",
  "Infrastructure",
];

function TaskCard({
  task,
  isClaimed,
  locked,
  showClaimButton,
  showUnclaimButton,
  onClaim,
  onUnclaim,
  onExecute,
}: {
  task: Task;
  isClaimed: boolean;
  locked: boolean;
  showClaimButton?: boolean;
  showUnclaimButton?: boolean;
  onClaim?: () => void;
  onUnclaim?: () => void;
  onExecute?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const catColor = CAT_COLORS[task.category] ?? "#666";

  return (
    <div style={{ ...card, marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div style={{ flex: 1, paddingRight: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5, flexWrap: "wrap" }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "2px 8px",
                borderRadius: 20,
                background: `${catColor}22`,
                color: catColor,
                border: `1px solid ${catColor}44`,
              }}
            >
              {task.category}
            </span>
            {task.isMCE && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "2px 8px",
                  borderRadius: 20,
                  background: "rgba(221,158,51,0.15)",
                  color: GOLD,
                  border: "1px solid rgba(221,158,51,0.3)",
                }}
              >
                MCE
              </span>
            )}
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: locked ? "rgba(255,255,255,0.4)" : "white",
              lineHeight: 1.3,
            }}
          >
            {task.title}
          </div>
        </div>
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: TEAL }}>{task.credits}</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>CITY</div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>⏱ {task.estimatedTime}</span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>📍 {task.location}</span>
        {!task.isOnboarding && (
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
            {task.slotsRemaining}/{task.slots} slots
          </span>
        )}
      </div>

      <div
        style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, cursor: "pointer", marginBottom: 12 }}
        onClick={() => setExpanded(e => !e)}
      >
        {expanded ? task.description : task.description.slice(0, 90) + (task.description.length > 90 ? "…" : "")}
        {task.description.length > 90 && (
          <span style={{ color: ACCENT, marginLeft: 4 }}>{expanded ? " less" : " more"}</span>
        )}
      </div>

      {locked && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 12px",
            background: "rgba(255,255,255,0.04)",
            borderRadius: 8,
            marginBottom: 10,
            fontSize: 12,
            color: "rgba(255,255,255,0.35)",
          }}
        >
          <IconLock />
          Available to new members only (zero balance &amp; completions required)
        </div>
      )}

      <div style={{ display: "flex", gap: 8 }}>
        {showClaimButton && !isClaimed && !locked && (
          <button
            onClick={onClaim}
            style={{
              flex: 1,
              padding: "10px 0",
              background: ACCENT,
              color: "white",
              border: "none",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Claim
          </button>
        )}
        {showClaimButton && isClaimed && (
          <div
            style={{
              flex: 1,
              padding: "10px 0",
              background: "rgba(52,238,182,0.08)",
              color: TEAL,
              border: "1px solid rgba(52,238,182,0.2)",
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              textAlign: "center",
            }}
          >
            ✓ Claimed — go to My Tasks
          </div>
        )}
        {showUnclaimButton && (
          <>
            <button
              onClick={onUnclaim}
              style={{
                padding: "10px 18px",
                background: "rgba(255,255,255,0.05)",
                color: "rgba(255,255,255,0.55)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Unclaim
            </button>
            <button
              onClick={onExecute}
              style={{
                flex: 1,
                padding: "10px 0",
                background: ACCENT,
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Execute →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function ExploreTab() {
  const { state, claimTask, unclaimTask, startVerify } = useDemo();
  const [view, setView] = useState<"open" | "mine">("open");
  const [catFilter, setCatFilter] = useState<TaskCategory | "All">("All");
  const [executeTask, setExecuteTask] = useState<Task | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const p = state.participant;
  const isNewMember = p.cityBalance === 0 && p.completedTasks.length === 0 && p.claimedTaskIds.length === 0;

  // Open Tasks: always show onboarding; show non-claimed regular tasks
  const openTasks = state.availableTasks.filter(t => t.isOnboarding || !p.claimedTaskIds.includes(t.id));
  const filteredOpenTasks = catFilter === "All" ? openTasks : openTasks.filter(t => t.category === catFilter);

  const myTasks = p.claimedTaskIds.map(id => state.availableTasks.find(t => t.id === id)).filter(Boolean) as Task[];

  const handleClaim = (task: Task) => {
    if (task.isOnboarding && !isNewMember) return;
    claimTask(task.id);
    setToast(`Claimed: ${task.title}`);
  };

  const handleUnclaim = (task: Task) => {
    unclaimTask(task.id);
    setToast(`Removed from My Tasks`);
  };

  const handleExecuteConfirm = () => {
    if (!executeTask) return;
    const task = executeTask;
    setExecuteTask(null);
    startVerify(task.id, task.title);
  };

  return (
    <div style={{ padding: "20px 16px 24px" }}>
      {/* Open / My Tasks toggle */}
      <div
        style={{
          display: "flex",
          background: "rgba(255,255,255,0.05)",
          borderRadius: 10,
          padding: 4,
          marginBottom: 16,
        }}
      >
        {(["open", "mine"] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              flex: 1,
              padding: "9px 0",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              background: view === v ? ACCENT : "transparent",
              color: view === v ? "white" : "rgba(255,255,255,0.45)",
              transition: "all 0.15s",
            }}
          >
            {v === "open" ? "Open Tasks" : `My Tasks${myTasks.length > 0 ? ` (${myTasks.length})` : ""}`}
          </button>
        ))}
      </div>

      {/* Category filter — Open Tasks only */}
      {view === "open" && (
        <div
          style={{
            display: "flex",
            gap: 8,
            overflowX: "auto",
            paddingBottom: 14,
            marginBottom: 2,
            scrollbarWidth: "none",
          }}
        >
          {(["All", ...ALL_CATEGORIES] as (TaskCategory | "All")[]).map(c => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              style={{
                flexShrink: 0,
                padding: "6px 14px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                background: catFilter === c ? (c === "All" ? ACCENT : CAT_COLORS[c]) : "rgba(255,255,255,0.06)",
                color: catFilter === c ? (c === "Onboarding" ? "#15151E" : "white") : "rgba(255,255,255,0.55)",
                transition: "all 0.15s",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Task list */}
      {view === "open" ? (
        filteredOpenTasks.length === 0 ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: "rgba(255,255,255,0.3)", fontSize: 14 }}>
            No tasks in this category
          </div>
        ) : (
          filteredOpenTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              isClaimed={p.claimedTaskIds.includes(task.id)}
              locked={!!(task.isOnboarding && !isNewMember)}
              showClaimButton
              onClaim={() => handleClaim(task)}
              onExecute={() => setExecuteTask(task)}
            />
          ))
        )
      ) : myTasks.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <div style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>No claimed tasks yet</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.2)" }}>Head to Open Tasks to claim one</div>
        </div>
      ) : (
        myTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            isClaimed
            locked={false}
            showUnclaimButton
            onUnclaim={() => handleUnclaim(task)}
            onExecute={() => setExecuteTask(task)}
          />
        ))
      )}

      {executeTask && (
        <ExecuteModal task={executeTask} onConfirm={handleExecuteConfirm} onClose={() => setExecuteTask(null)} />
      )}
      {toast && <SuccessToast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MYCITY TAB
// ═════════════════════════════════════════════════════════════════════════════

function MyCityTab() {
  const { state, likePost } = useDemo();
  const [sort, setSort] = useState<"recent" | "top">("recent");

  const sorted = [...state.posts].sort((a, b) =>
    sort === "recent" ? new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime() : b.likes - a.likes,
  );

  const AUTHOR_COLORS: Record<string, string> = {
    "issuer-1": "#4CAF50",
    "issuer-2": "#FF9800",
    "issuer-3": "#9C27B0",
    "redeemer-1": TEAL,
    "redeemer-2": ACCENT,
    "redeemer-4": GOLD,
  };
  const CAT_BADGE: Record<string, string> = {
    Announcement: ACCENT,
    Event: "#9C27B0",
    Update: "#607D8B",
    Opportunity: TEAL,
  };

  return (
    <div style={{ padding: "20px 16px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "white" }}>City Feed</div>
        <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", borderRadius: 8, padding: 3 }}>
          {(["recent", "top"] as const).map(s => (
            <button
              key={s}
              onClick={() => setSort(s)}
              style={{
                padding: "6px 14px",
                border: "none",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                background: sort === s ? "rgba(255,255,255,0.1)" : "transparent",
                color: sort === s ? "white" : "rgba(255,255,255,0.45)",
              }}
            >
              {s === "recent" ? "Recent" : "Top"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 16 }}>
        Updates from Issuer and Redeemer organizations in your city
      </div>

      {sorted.map(post => {
        const liked = state.participant.likedPostIds.includes(post.id);
        const avatarColor = AUTHOR_COLORS[post.authorId] ?? ACCENT;
        const badgeColor = CAT_BADGE[post.category] ?? "#666";

        return (
          <div key={post.id} style={{ ...card, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: `${avatarColor}26`,
                    border: `1.5px solid ${avatarColor}55`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: avatarColor,
                  }}
                >
                  {post.authorName[0]}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{post.authorName}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                    {post.authorType === "issuer" ? "Issuer Org" : "Redeemer Org"} · {timeAgo(post.postedAt)}
                  </div>
                </div>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: "3px 9px",
                  borderRadius: 20,
                  background: `${badgeColor}22`,
                  color: badgeColor,
                  border: `1px solid ${badgeColor}44`,
                }}
              >
                {post.category}
              </span>
            </div>

            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.6, marginBottom: 14 }}>
              {post.content}
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => likePost(post.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: liked ? "rgba(255,90,100,0.12)" : "rgba(255,255,255,0.05)",
                  border: liked ? "1px solid rgba(255,90,100,0.3)" : "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 20,
                  padding: "6px 14px",
                  cursor: "pointer",
                  color: liked ? "#ff5a64" : "rgba(255,255,255,0.5)",
                  fontSize: 13,
                  fontWeight: 600,
                  transition: "all 0.15s",
                }}
              >
                <IconHeart filled={liked} />
                {post.likes}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// VOTE TAB
// ═════════════════════════════════════════════════════════════════════════════

function VoteTab() {
  const { state, allocateMceVote, likeEpoch2 } = useDemo();
  const p = state.participant;
  const [section, setSection] = useState<"epoch1" | "epoch2">("epoch1");

  const totalAllocated = Object.values(p.mceVoteAllocations).reduce((a, b) => a + b, 0);
  const remaining = p.voteBalance - totalAllocated;
  const epoch1Mces = state.mces.filter(m => m.status === "Voting");
  const STEP = 5;

  const adjust = (mceId: string, delta: number) => {
    const current = p.mceVoteAllocations[mceId] ?? 0;
    allocateMceVote(mceId, current + delta);
  };

  return (
    <div style={{ padding: "20px 16px 24px" }}>
      {/* Epoch toggle */}
      <div
        style={{
          display: "flex",
          background: "rgba(255,255,255,0.05)",
          borderRadius: 10,
          padding: 4,
          marginBottom: 20,
        }}
      >
        {(
          [
            { key: "epoch1", label: "Epoch 1 · Voting" },
            { key: "epoch2", label: "Epoch 2 · Upcoming" },
          ] as const
        ).map(s => (
          <button
            key={s.key}
            onClick={() => setSection(s.key)}
            style={{
              flex: 1,
              padding: "9px 0",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              background: section === s.key ? ACCENT : "transparent",
              color: section === s.key ? "white" : "rgba(255,255,255,0.45)",
              transition: "all 0.15s",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === "epoch1" && (
        <>
          {/* Vote balance summary */}
          <div
            style={{
              ...card,
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>VOTE Balance</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: "white" }}>{p.voteBalance.toLocaleString()}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 4 }}>Unallocated</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: remaining > 0 ? TEAL : "rgba(255,255,255,0.3)" }}>
                {remaining.toLocaleString()}
              </div>
            </div>
          </div>

          {p.voteBalance === 0 ? (
            <div style={{ ...card, marginBottom: 16, textAlign: "center", padding: "24px 16px" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>🗳️</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>
                No VOTE tokens yet
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", lineHeight: 1.6 }}>
                Complete civic tasks to earn VOTE tokens. Each CITY credit earned also mints 1 VOTE — both are issued
                1:1 for every completed task.
              </div>
            </div>
          ) : (
            <div style={{ marginBottom: 20 }}>
              <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 3, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    borderRadius: 3,
                    width: `${Math.min(100, (totalAllocated / p.voteBalance) * 100)}%`,
                    background: `linear-gradient(90deg, ${ACCENT}, ${TEAL})`,
                    transition: "width 0.2s",
                  }}
                />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{totalAllocated} allocated</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{p.voteBalance} total</span>
              </div>
            </div>
          )}

          {epoch1Mces.map((mce, i) => {
            const allocated = p.mceVoteAllocations[mce.id] ?? 0;
            const totalVotes = mce.votesFor + mce.votesAgainst + allocated;
            const pct = totalVotes > 0 ? Math.round(((mce.votesFor + allocated) / totalVotes) * 100) : 0;

            return (
              <div key={mce.id} style={{ ...card, marginBottom: 12 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <div style={{ flex: 1, paddingRight: 10 }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>MCE-0{i + 1}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "white", lineHeight: 1.35 }}>{mce.title}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>
                      by {mce.proposerName}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: allocated > 0 ? ACCENT : "rgba(255,255,255,0.25)",
                      }}
                    >
                      {allocated}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>your VOTE</div>
                  </div>
                </div>

                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginBottom: 12 }}>
                  {mce.description.slice(0, 120)}…
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}>
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: TEAL,
                        borderRadius: 3,
                        transition: "width 0.2s",
                      }}
                    />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                      {(mce.votesFor + allocated).toLocaleString()} for
                    </span>
                    <span style={{ fontSize: 11, color: TEAL }}>{pct}%</span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                      {mce.votesAgainst.toLocaleString()} against
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", flex: 1 }}>
                    Allocate ({STEP} VOTE per step):
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={() => adjust(mce.id, -STEP)}
                      disabled={allocated === 0}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: "rgba(255,255,255,0.06)",
                        cursor: allocated === 0 ? "not-allowed" : "pointer",
                        color: allocated === 0 ? "rgba(255,255,255,0.2)" : "white",
                        fontSize: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      −
                    </button>
                    <span
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: allocated > 0 ? ACCENT : "rgba(255,255,255,0.25)",
                        minWidth: 36,
                        textAlign: "center",
                      }}
                    >
                      {allocated}
                    </span>
                    <button
                      onClick={() => adjust(mce.id, STEP)}
                      disabled={remaining < STEP}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        border: "1px solid rgba(255,255,255,0.12)",
                        background: remaining >= STEP ? `${ACCENT}33` : "rgba(255,255,255,0.06)",
                        color: remaining >= STEP ? ACCENT : "rgba(255,255,255,0.2)",
                        cursor: remaining < STEP ? "not-allowed" : "pointer",
                        fontSize: 18,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.25)",
              textAlign: "center",
              marginTop: 8,
              lineHeight: 1.5,
            }}
          >
            Allocations can be adjusted during the open voting period.
          </div>
        </>
      )}

      {section === "epoch2" && (
        <>
          <div style={{ ...card, marginBottom: 16, padding: "14px 16px" }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
              These proposals are gathering community support for the next voting epoch. Like the ones you want
              considered — the top-liked proposals may be selected by the committee for Epoch 2 voting.
            </div>
          </div>

          {state.epoch2Proposals.map(prop => {
            const liked = state.participant.likedEpoch2Ids.includes(prop.id);
            return (
              <div key={prop.id} style={{ ...card, marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: 20,
                      background: prop.proposerType === "org" ? "rgba(65,105,225,0.15)" : "rgba(52,238,182,0.12)",
                      color: prop.proposerType === "org" ? ACCENT : TEAL,
                      border: `1px solid ${prop.proposerType === "org" ? "rgba(65,105,225,0.3)" : "rgba(52,238,182,0.25)"}`,
                    }}
                  >
                    {prop.proposerType === "org" ? "Org" : "Citizen"}
                  </span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{timeAgo(prop.proposedAt)}</span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "white", lineHeight: 1.35, marginBottom: 4 }}>
                  {prop.title}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 10 }}>
                  by {prop.proposerName}
                </div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: 12 }}>
                  {prop.description.slice(0, 130)}…
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                  {prop.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 20,
                        background: "rgba(255,255,255,0.05)",
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    onClick={() => likeEpoch2(prop.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: liked ? "rgba(255,90,100,0.12)" : "rgba(255,255,255,0.05)",
                      border: liked ? "1px solid rgba(255,90,100,0.3)" : "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 20,
                      padding: "7px 16px",
                      cursor: "pointer",
                      color: liked ? "#ff5a64" : "rgba(255,255,255,0.5)",
                      fontSize: 13,
                      fontWeight: 600,
                      transition: "all 0.15s",
                    }}
                  >
                    <IconHeart filled={liked} /> {prop.likes}
                  </button>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// REDEEM TAB
// ═════════════════════════════════════════════════════════════════════════════

type CreditFilter = "All" | "CITY" | "MCE";

function RedeemTab() {
  const { state, redeemOffer } = useDemo();
  const p = state.participant;
  const [filter, setFilter] = useState<CreditFilter>("All");
  const [confirmOffer, setConfirmOffer] = useState<RedemptionOffer | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = state.offers.filter(o => {
    if (filter === "MCE") return o.mceOnly;
    if (filter === "CITY") return !o.mceOnly;
    return true;
  });

  const handleConfirm = () => {
    if (!confirmOffer) return;
    const offer = confirmOffer;
    redeemOffer(offer.id);
    setToast(`Redeemed: ${offer.offerTitle}`);
    setConfirmOffer(null);
  };

  return (
    <div style={{ padding: "20px 16px 24px" }}>
      {/* Balances */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, ...card, padding: "12px 14px", textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: TEAL }}>{p.cityBalance}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>CITY Available</div>
        </div>
        <div style={{ flex: 1, ...card, padding: "12px 14px", textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: GOLD }}>{p.mceBalance}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>MCE Credits</div>
        </div>
      </div>

      {/* Credit filter pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["All", "CITY", "MCE"] as CreditFilter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "7px 18px",
              borderRadius: 20,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              background: filter === f ? (f === "MCE" ? GOLD : f === "CITY" ? TEAL : ACCENT) : "rgba(255,255,255,0.06)",
              color: filter === f ? "#15151E" : "rgba(255,255,255,0.55)",
              transition: "all 0.15s",
            }}
          >
            {f === "All" ? "All Offers" : f === "CITY" ? "CITY Only" : "MCE Only"}
          </button>
        ))}
      </div>

      {/* Offers */}
      {filtered.map(offer => {
        const canAfford = p.cityBalance >= offer.costCity;
        const needsMce = offer.mceOnly && p.mceBalance < offer.costCity;
        const disabled = !canAfford || needsMce;

        return (
          <div key={offer.id} style={{ ...card, marginBottom: 10, opacity: disabled ? 0.55 : 1 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  flexShrink: 0,
                  background: "rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 24,
                }}
              >
                {offer.emoji}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 3,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{offer.offerTitle}</div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                      {offer.redeemerName}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", paddingLeft: 8, flexShrink: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: offer.mceOnly ? GOLD : TEAL }}>
                      {offer.costCity}
                    </div>
                    <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{offer.mceOnly ? "MCE" : "CITY"}</div>
                  </div>
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.45, marginBottom: 10 }}>
                  {offer.description}
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    {offer.mceOnly && (
                      <span
                        style={{
                          fontSize: 11,
                          padding: "2px 8px",
                          borderRadius: 20,
                          background: "rgba(221,158,51,0.15)",
                          color: GOLD,
                          border: "1px solid rgba(221,158,51,0.3)",
                        }}
                      >
                        MCE Only
                      </span>
                    )}
                    <span
                      style={{
                        fontSize: 11,
                        padding: "2px 8px",
                        borderRadius: 20,
                        background: "rgba(255,255,255,0.05)",
                        color: "rgba(255,255,255,0.4)",
                      }}
                    >
                      {offer.category}
                    </span>
                  </div>
                  <button
                    onClick={() => !disabled && setConfirmOffer(offer)}
                    disabled={disabled}
                    style={{
                      padding: "8px 18px",
                      borderRadius: 10,
                      border: "none",
                      cursor: disabled ? "not-allowed" : "pointer",
                      background: disabled ? "rgba(255,255,255,0.07)" : TEAL,
                      color: disabled ? "rgba(255,255,255,0.3)" : "#15151E",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    {!canAfford ? "Can't Afford" : needsMce ? "Need MCE" : "Redeem"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Past Redemptions */}
      {state.pastRedemptions.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "rgba(255,255,255,0.45)",
              marginBottom: 12,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
            }}
          >
            Past Redemptions
          </div>
          {state.pastRedemptions.map(r => (
            <div key={r.id} style={{ ...card, marginBottom: 8, padding: "12px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{r.offerTitle}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                    {r.redeemerName} · {fmtDate(r.redeemedAt)}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "monospace", marginTop: 2 }}>
                    {r.txHash.slice(0, 22)}…
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "rgba(255,100,100,0.85)" }}>−{r.costCity}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>CITY</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmOffer && (
        <RedeemModal offer={confirmOffer} onConfirm={handleConfirm} onClose={() => setConfirmOffer(null)} />
      )}
      {toast && <SuccessToast message={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═════════════════════════════════════════════════════════════════════════════

export default function ParticipantPage() {
  const { state, setRole } = useDemo();
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!state.role) setRole("participant");
  }, [state.role, setRole]);

  const { left: leftPanel, right: rightPanel } = getParticipantPanels(activeTab, state);

  return (
    <>
      <AppShell
        role="participant"
        address={FAKE_WALLETS.participant}
        cityBalance={state.participant.cityBalance}
        voteBalance={state.participant.voteBalance}
        mceBalance={state.participant.mceBalance}
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        accentColor={ACCENT}
        title="CitySync · Citizen"
        leftPanel={leftPanel}
        rightPanel={rightPanel}
      >
        {activeTab === "profile" && <ProfileTab onTabChange={setActiveTab} />}
        {activeTab === "explore" && <ExploreTab />}
        {activeTab === "mycity" && <MyCityTab />}
        {activeTab === "vote" && <VoteTab />}
        {activeTab === "redeem" && <RedeemTab />}
      </AppShell>

      {/* Verification overlay rendered outside AppShell so it covers all layers */}
      <VerifyOverlay />
    </>
  );
}
