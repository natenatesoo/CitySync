"use client";

import React, { useRef, useState } from "react";
import AppShell from "../_components/AppShell";
import { useDemo } from "../_context/DemoContext";
import { FAKE_WALLETS, OfferCategory, Post, PostCategory, RedemptionOffer } from "../_data/mockData";

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconStore = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M3 9l1-5h16l1 5M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9M3 9h18"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

const IconCard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="6" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M16 10a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="currentColor" />
    <path d="M2 10h20" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const IconCity = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M3 21h18M3 7l9-4 9 4v14H3V7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

const IconDashboard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const IconBolt = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

const IconPencil = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path
      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconQR = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    <path d="M14 14h2v2h-2zM18 14h3v3h-1v-1h-2zM18 19h3M14 18v3M16 18h2" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);

const IconHeart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// ─── Constants & Styles ───────────────────────────────────────────────────────

const TABS = [
  { key: "profile", label: "Profile", icon: <IconStore /> },
  { key: "redemptions", label: "Redeem", icon: <IconCard /> },
  { key: "mycity", label: "MyCity", icon: <IconCity /> },
  { key: "dashboard", label: "Dashboard", icon: <IconDashboard /> },
  { key: "mces", label: "MCEs", icon: <IconBolt /> },
];

const ACCENT = "#34eeb6";
const SURFACE = "#1E1E2C";
const BG = "#15151E";
const MUTED = "rgba(255,255,255,0.45)";
const DIMMED = "rgba(255,255,255,0.25)";

const surfaceCard: React.CSSProperties = {
  background: SURFACE,
  border: "1px solid rgba(255,255,255,0.06)",
  borderRadius: 16,
  padding: "16px",
};

const POST_CATEGORIES: PostCategory[] = ["Announcement", "Event", "Update", "Opportunity"];

const CATEGORY_COLOR: Record<PostCategory, string> = {
  Announcement: "#4169E1",
  Event: "#DD9E33",
  Update: "#34eeb6",
  Opportunity: "#a78bfa",
};

const STATUS_COLOR: Record<string, string> = {
  Voting: "#4169E1",
  Planning: "#DD9E33",
  Active: "#34eeb6",
  Closed: "rgba(255,255,255,0.3)",
  Rejected: "#ff6b9d",
};

// Preset offers for the AddOfferSheet
type PresetOffer = {
  title: string;
  desc: string;
  cost: number;
  cat: OfferCategory;
  emoji: string;
  mceOnly?: boolean;
};

const PRESET_OFFERS: PresetOffer[] = [
  { title: "10% Grocery Discount", desc: "10% off any purchase up to $50", cost: 30, cat: "Essentials", emoji: "🛒" },
  { title: "Day Pass", desc: "Full access for one day", cost: 20, cat: "Fitness", emoji: "🏋️" },
  { title: "Meal Voucher ($10)", desc: "Any item up to $10 value", cost: 25, cat: "Food", emoji: "🍱" },
  { title: "Transit Pass (1 day)", desc: "Unlimited rides for one day", cost: 15, cat: "Transit", emoji: "🚌" },
  { title: "Workshop Entry", desc: "One drop-in workshop session", cost: 35, cat: "Culture", emoji: "🎨" },
  {
    title: "MCE Champion Reward",
    desc: "Special reward for MCE participants",
    cost: 80,
    cat: "Culture",
    emoji: "🏆",
    mceOnly: true,
  },
];

// ─── Success Toast ────────────────────────────────────────────────────────────

function SuccessToast({ message, onDone }: { message: string; onDone: () => void }) {
  React.useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      style={{
        position: "fixed",
        bottom: 90,
        left: "50%",
        transform: "translateX(-50%)",
        background: "#0d2620",
        border: "1px solid rgba(52,238,182,0.35)",
        borderRadius: 12,
        padding: "12px 20px",
        color: ACCENT,
        fontSize: 14,
        fontWeight: 600,
        zIndex: 300,
        whiteSpace: "nowrap",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        maxWidth: 440,
      }}
    >
      ✓ {message}
    </div>
  );
}

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
    <div style={{ marginBottom: 20 }}>
      <p style={{ margin: "0 0 4px", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: accent, textTransform: "uppercase" }}>
        {label}
      </p>
      <h3 style={{ margin: "0 0 10px", fontSize: 16, fontWeight: 700, color: "#fff" }}>{title}</h3>
      <div style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.55)" }}>{children}</div>
    </div>
  );
}

function PanelStats({ stats, accent }: { stats: { label: string; value: string | number }[]; accent: string }) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: 12,
        padding: "14px 16px",
        marginTop: 16,
      }}
    >
      {stats.map((s, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "7px 0",
            borderBottom: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
          }}
        >
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>{s.label}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>{s.value}</span>
        </div>
      ))}
    </div>
  );
}

function getRedeemerPanels(
  activeTab: string,
  state: ReturnType<typeof useDemo>["state"],
): { left: React.ReactNode; right: React.ReactNode } {
  const { redeemer, mces, posts } = state;

  switch (activeTab) {
    case "profile":
      return {
        left: (
          <PanelCard label="Redeemer Organization" title="Where CITY Meets Real Value" accent={ACCENT}>
            <p style={{ margin: "0 0 12px" }}>
              Redeemer organizations close the loop between civic participation and tangible rewards. Citizens earn CITY
              by completing tasks — you let them spend it in your venue.
            </p>
            <p style={{ margin: 0 }}>
              Registering your organization unlocks access to the full redemption network, MCE rewards, and on-chain
              proof of community engagement.
            </p>
          </PanelCard>
        ),
        right: (
          <PanelStats
            accent={ACCENT}
            stats={[
              { label: "Active Offers", value: redeemer.offers.length },
              { label: "Processed Redemptions", value: redeemer.processedRedemptions.length },
              { label: "Queue Length", value: redeemer.redemptionQueue.length },
              { label: "MCE Partner", value: redeemer.acceptsMCE ? "Yes ✓" : "No" },
            ]}
          />
        ),
      };

    case "redemptions":
      return {
        left: (
          <PanelCard label="Redemption Network" title="Accept CITY, Give Back Value" accent={ACCENT}>
            <p style={{ margin: "0 0 12px" }}>
              Each offer you list becomes a redemption point on the network. Citizens scan a QR code at your venue, and
              the system deducts CITY from their wallet automatically.
            </p>
            <p style={{ margin: 0 }}>
              The queue shows pending redemptions awaiting your confirmation. Processing a redemption triggers an
              on-chain settlement, instantly verifiable by anyone.
            </p>
          </PanelCard>
        ),
        right: (
          <PanelStats
            accent={ACCENT}
            stats={[
              { label: "Active Offers", value: redeemer.offers.length },
              { label: "Pending Queue", value: redeemer.redemptionQueue.length },
              { label: "Total Processed", value: redeemer.processedRedemptions.length },
              {
                label: "CITY Accepted",
                value: redeemer.processedRedemptions.reduce((n, r) => n + r.costCity, 0).toLocaleString(),
              },
            ]}
          />
        ),
      };

    case "mycity":
      return {
        left: (
          <PanelCard label="City Feed" title="Connect with Your Community" accent={ACCENT}>
            <p style={{ margin: "0 0 12px" }}>
              Post promotions, events, and announcements to the city-wide feed. Your posts reach every participant and
              organization in the network.
            </p>
            <p style={{ margin: 0 }}>
              Use the feed to announce limited-time offers, new redemption categories, or upcoming MCE events where your
              venue participates as a reward partner.
            </p>
          </PanelCard>
        ),
        right: (
          <PanelStats
            accent={ACCENT}
            stats={[
              { label: "Total Posts", value: posts.length },
              { label: "Active Orgs", value: 3 },
              { label: "Your Offers Listed", value: redeemer.offers.length },
              { label: "Categories", value: new Set(redeemer.offers.map(o => o.category)).size },
            ]}
          />
        ),
      };

    case "dashboard":
      return {
        left: (
          <PanelCard label="Impact Dashboard" title="Your Redemption Record" accent={ACCENT}>
            <p style={{ margin: "0 0 12px" }}>
              Every redemption your organization processes is permanently settled on Base. Your dashboard reflects
              real-time community impact — no invoices, no chargebacks.
            </p>
            <p style={{ margin: 0 }}>
              Participants trust venues with strong redemption records. A growing history signals that your offers are
              popular and your settlement is reliable.
            </p>
          </PanelCard>
        ),
        right: (
          <PanelStats
            accent={ACCENT}
            stats={[
              { label: "Total Processed", value: redeemer.processedRedemptions.length },
              {
                label: "CITY Settled",
                value: redeemer.processedRedemptions.reduce((n, r) => n + r.costCity, 0).toLocaleString(),
              },
              { label: "Offer Categories", value: new Set(redeemer.offers.map(o => o.category)).size },
              { label: "Queue Pending", value: redeemer.redemptionQueue.length },
            ]}
          />
        ),
      };

    case "mces":
      return {
        left: (
          <PanelCard label="MCE Program" title="Amplify with Mass Events" accent={ACCENT}>
            <p style={{ margin: "0 0 12px" }}>
              Mass Coordination Events are city-wide mobilizations voted on by the community. Opting in makes your
              venue a featured reward destination during the event.
            </p>
            <p style={{ margin: 0 }}>
              MCE participation drives surges of motivated participants to your venue. Event rewards are funded from a
              pooled treasury, so your CITY acceptance stays profitable.
            </p>
          </PanelCard>
        ),
        right: (
          <PanelStats
            accent={ACCENT}
            stats={[
              { label: "Total MCEs", value: mces.length },
              { label: "Voting Now", value: mces.filter(m => m.status === "Voting").length },
              { label: "Active Events", value: mces.filter(m => m.status === "Active").length },
              { label: "MCE Partner", value: redeemer.acceptsMCE ? "Opted In ✓" : "Opted Out" },
            ]}
          />
        ),
      };

    default:
      return { left: null, right: null };
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RedeemerApp() {
  const {
    state,
    setRole,
    redeemerToggleMCE,
    redeemerAddOffer,
    redeemerRemoveOffer,
    redeemerProcessRedemption,
    dispatch,
  } = useDemo();
  const [activeTab, setActiveTab] = useState("profile");
  const [addOfferSheet, setAddOfferSheet] = useState(false);
  const [qrTarget, setQrTarget] = useState<string | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [localPosts, setLocalPosts] = useState<Post[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const { redeemer, mces } = state;
  const allPosts = [...localPosts, ...state.posts];
  const { left: leftPanel, right: rightPanel } = getRedeemerPanels(activeTab, state);

  React.useEffect(() => {
    setRole("redeemer");
  }, [setRole]);

  const handleAddOffer = (offer: RedemptionOffer) => {
    redeemerAddOffer(offer);
    setAddOfferSheet(false);
    setToast("Offer added successfully!");
  };

  const handleProcess = (queueId: string) => {
    redeemerProcessRedemption(queueId);
    setToast("Redemption processed — on-chain confirmed!");
  };

  const handleCreatePost = (post: Post) => {
    setLocalPosts(prev => [post, ...prev]);
    setComposeOpen(false);
    setToast("Post published to MyCity!");
  };

  const handleRemoveOffer = (id: string) => {
    redeemerRemoveOffer(id);
    setToast("Offer removed.");
  };

  return (
    <>
      <AppShell
        role="redeemer"
        orgName={redeemer.orgName}
        address={FAKE_WALLETS.redeemer}
        cityBalance={0}
        voteBalance={0}
        mceBalance={0}
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        accentColor={ACCENT}
        title="Redeemer"
        leftPanel={leftPanel}
        rightPanel={rightPanel}
      >
        {activeTab === "profile" && (
          <ProfileTab redeemer={redeemer} onToggleMCE={redeemerToggleMCE} dispatch={dispatch} />
        )}
        {activeTab === "redemptions" && (
          <RedemptionsTab
            redeemer={redeemer}
            onAddOffer={() => setAddOfferSheet(true)}
            onRemoveOffer={handleRemoveOffer}
            onShowQR={setQrTarget}
            onProcess={handleProcess}
          />
        )}
        {activeTab === "mycity" && (
          <MyCityTab posts={allPosts} orgName={redeemer.orgName} onCompose={() => setComposeOpen(true)} />
        )}
        {activeTab === "dashboard" && <DashboardTab redeemer={redeemer} />}
        {activeTab === "mces" && <MCEsTab mces={mces} acceptsMCE={redeemer.acceptsMCE} />}
      </AppShell>

      {addOfferSheet && (
        <AddOfferSheet redeemer={redeemer} onClose={() => setAddOfferSheet(false)} onAdd={handleAddOffer} />
      )}

      {qrTarget && <QRModal offerId={qrTarget} offers={redeemer.offers} onClose={() => setQrTarget(null)} />}

      {composeOpen && (
        <ComposePostSheet orgName={redeemer.orgName} onClose={() => setComposeOpen(false)} onPost={handleCreatePost} />
      )}

      {toast && <SuccessToast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab({
  redeemer,
  onToggleMCE,
  dispatch,
}: {
  redeemer: ReturnType<typeof useDemo>["state"]["redeemer"];
  onToggleMCE: () => void;
  dispatch: ReturnType<typeof useDemo>["dispatch"];
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(redeemer.orgName);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setDraft(redeemer.orgName);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const saveEdit = () => {
    if (draft.trim()) {
      dispatch({ type: "REDEEMER_REGISTER", orgName: draft.trim() });
    }
    setEditing(false);
  };

  const totalCityReceived = redeemer.processedRedemptions.reduce((n, r) => n + r.costCity, 0);

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      {/* Welcome banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #001a14 0%, #1E1E2C 100%)",
          border: "1px solid rgba(52,238,182,0.25)",
          borderRadius: 20,
          padding: "20px",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "rgba(52,238,182,0.6)",
            marginBottom: 4,
          }}
        >
          Registered Redeemer Venue
        </div>

        {editing ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <input
              ref={inputRef}
              value={draft}
              onChange={e => setDraft(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") saveEdit();
                if (e.key === "Escape") setEditing(false);
              }}
              style={{
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(52,238,182,0.5)",
                borderRadius: 8,
                color: "#fff",
                fontSize: 22,
                fontWeight: 700,
                padding: "4px 10px",
                flex: 1,
                outline: "none",
              }}
            />
            <button
              onClick={saveEdit}
              style={{
                background: ACCENT,
                border: "none",
                borderRadius: 8,
                padding: "6px 10px",
                cursor: "pointer",
                color: BG,
                display: "flex",
                alignItems: "center",
              }}
            >
              <IconCheck />
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{redeemer.orgName || "Your Venue"}</div>
            <button
              onClick={startEdit}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: MUTED,
                padding: 4,
                display: "flex",
                alignItems: "center",
              }}
            >
              <IconPencil />
            </button>
          </div>
        )}

        <div style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>
          {FAKE_WALLETS.redeemer}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <StatusPill label="Registered Redeemer" color={ACCENT} />
          {redeemer.acceptsMCE && <StatusPill label="MCE Accepted" color="#DD9E33" />}
        </div>
      </div>

      {/* Role description */}
      <div
        style={{
          background: "rgba(52,238,182,0.05)",
          border: "1px solid rgba(52,238,182,0.12)",
          borderRadius: 14,
          padding: "14px 16px",
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4 }}>Your Role as a Redeemer</div>
        <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, margin: 0 }}>
          Accept CITY credits from civic participants in exchange for goods and services. Generate QR codes for
          in-person redemption, process incoming requests from your queue, and optionally accept MCECredits for expanded
          offerings.
        </p>
      </div>

      {/* MCE toggle */}
      <SectionLabel text="MCECredit Settings" />
      <div
        style={{
          ...surfaceCard,
          border: redeemer.acceptsMCE ? "1px solid rgba(221,158,51,0.25)" : "1px solid rgba(255,255,255,0.06)",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4 }}>Accept MCECredits</div>
            <div style={{ fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
              Opt in to receive MCECredits from Mass Coordination Event participants. Unlocks MCE-exclusive offer types
              and recognition in the city portal.
            </div>
          </div>
          {/* Toggle switch */}
          <button
            onClick={onToggleMCE}
            style={{
              flexShrink: 0,
              borderRadius: 12,
              width: 44,
              height: 24,
              background: redeemer.acceptsMCE ? "#DD9E33" : "rgba(255,255,255,0.15)",
              position: "relative",
              border: "none",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            <div
              style={{
                position: "absolute",
                borderRadius: "50%",
                background: "#fff",
                width: 18,
                height: 18,
                top: 3,
                left: redeemer.acceptsMCE ? 23 : 3,
                transition: "left 0.2s",
              }}
            />
          </button>
        </div>
      </div>

      {/* Stats */}
      <SectionLabel text="Activity" />
      <div style={{ ...surfaceCard, padding: 0, overflow: "hidden", marginBottom: 20 }}>
        <StatRow label="Active Offers" value={redeemer.offers.length} />
        <StatRow label="Pending Queue" value={redeemer.redemptionQueue.length} border />
        <StatRow label="Processed" value={redeemer.processedRedemptions.length} border />
        <StatRow label="CITY Received" value={totalCityReceived} suffix="CITY" border accent />
      </div>

      {redeemer.offers.length === 0 && (
        <EmptyState
          emoji="🏪"
          title="No offers yet"
          desc="Head to the Redeem tab to add your first offer and start accepting CITY credits."
        />
      )}
    </div>
  );
}

// ─── Redemptions Tab ──────────────────────────────────────────────────────────

function RedemptionsTab({
  redeemer,
  onAddOffer,
  onRemoveOffer,
  onShowQR,
  onProcess,
}: {
  redeemer: ReturnType<typeof useDemo>["state"]["redeemer"];
  onAddOffer: () => void;
  onRemoveOffer: (id: string) => void;
  onShowQR: (id: string) => void;
  onProcess: (queueId: string) => void;
}) {
  const [view, setView] = useState<"offers" | "queue">("offers");

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      {/* Segment control */}
      <div style={{ background: SURFACE, borderRadius: 16, padding: 4, display: "flex", marginBottom: 20 }}>
        {(["offers", "queue"] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            style={{
              flex: 1,
              border: "none",
              borderRadius: 12,
              padding: "9px 0",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s",
              background: view === v ? ACCENT : "transparent",
              color: view === v ? BG : MUTED,
            }}
          >
            {v === "offers" ? `My Offers (${redeemer.offers.length})` : `Queue (${redeemer.redemptionQueue.length})`}
          </button>
        ))}
      </div>

      {view === "offers" && (
        <>
          <button
            onClick={onAddOffer}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "rgba(52,238,182,0.08)",
              border: "1px dashed rgba(52,238,182,0.35)",
              borderRadius: 14,
              padding: "14px 0",
              fontSize: 13,
              fontWeight: 600,
              color: ACCENT,
              cursor: "pointer",
              marginBottom: 16,
            }}
          >
            <IconPlus /> Add New Offer
          </button>

          {redeemer.offers.length === 0 ? (
            <EmptyState
              emoji="🏪"
              title="No offers yet"
              desc="Add an offer to start accepting CITY credits from participants."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {redeemer.offers.map(offer => (
                <div
                  key={offer.id}
                  style={{
                    ...surfaceCard,
                    border: offer.mceOnly ? "1px solid rgba(221,158,51,0.2)" : "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                        flexShrink: 0,
                      }}
                    >
                      {offer.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{offer.offerTitle}</div>
                        {offer.mceOnly && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              background: "rgba(221,158,51,0.2)",
                              color: "#DD9E33",
                              borderRadius: 20,
                              padding: "1px 6px",
                            }}
                          >
                            MCE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: DIMMED, marginBottom: 4 }}>{offer.description}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT }}>{offer.costCity} CITY</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => onShowQR(offer.id)}
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        background: "rgba(52,238,182,0.1)",
                        border: "none",
                        borderRadius: 10,
                        padding: "9px 0",
                        fontSize: 12,
                        fontWeight: 600,
                        color: ACCENT,
                        cursor: "pointer",
                      }}
                    >
                      <IconQR /> Show QR
                    </button>
                    <button
                      onClick={() => onRemoveOffer(offer.id)}
                      style={{
                        background: "rgba(255,107,157,0.08)",
                        border: "none",
                        borderRadius: 10,
                        padding: "9px 14px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#ff6b9d",
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {view === "queue" && (
        <>
          {redeemer.redemptionQueue.length === 0 ? (
            <EmptyState
              emoji="📭"
              title="Queue is empty"
              desc="When participants redeem your offers, they appear here for you to process and finalize."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {redeemer.redemptionQueue.map(r => (
                <div
                  key={r.id}
                  style={{
                    background: SURFACE,
                    border: "1px solid rgba(52,238,182,0.15)",
                    borderRadius: 16,
                    padding: 16,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>
                        {r.offerTitle}
                      </div>
                      <div style={{ fontFamily: "monospace", fontSize: 11, color: MUTED }}>{r.citizenAddress}</div>
                      <div style={{ fontSize: 11, color: DIMMED, marginTop: 2 }}>
                        {new Date(r.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 18, fontWeight: 700, color: ACCENT }}>{r.costCity}</div>
                      <div style={{ fontSize: 11, color: DIMMED }}>CITY</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onProcess(r.id)}
                    style={{
                      width: "100%",
                      background: ACCENT,
                      border: "none",
                      borderRadius: 12,
                      padding: "11px 0",
                      fontSize: 13,
                      fontWeight: 700,
                      color: BG,
                      cursor: "pointer",
                    }}
                  >
                    Process Redemption
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Processed history */}
          {redeemer.processedRedemptions.length > 0 && (
            <>
              <SectionLabel text="Processed" />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {redeemer.processedRedemptions.map(r => (
                  <div
                    key={r.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      ...surfaceCard,
                      padding: "12px 16px",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>{r.offerTitle}</div>
                      <div style={{ fontFamily: "monospace", fontSize: 11, color: DIMMED }}>{r.citizenAddress}</div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: ACCENT, flexShrink: 0 }}>
                      +{r.costCity} CITY
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─── Add Offer Sheet ──────────────────────────────────────────────────────────

function AddOfferSheet({
  redeemer,
  onClose,
  onAdd,
}: {
  redeemer: ReturnType<typeof useDemo>["state"]["redeemer"];
  onClose: () => void;
  onAdd: (offer: RedemptionOffer) => void;
}) {
  const [selected, setSelected] = useState<PresetOffer | null>(null);
  const [customCost, setCustomCost] = useState("");
  const [step, setStep] = useState<"pick" | "configure">("pick");

  const handleAdd = () => {
    if (!selected) return;
    const cost = parseInt(customCost) > 0 ? parseInt(customCost) : selected.cost;
    const offer: RedemptionOffer = {
      id: `offer-custom-${Date.now()}`,
      redeemerName: redeemer.orgName,
      redeemerId: FAKE_WALLETS.redeemer,
      offerTitle: selected.title,
      description: selected.desc,
      costCity: cost,
      acceptsMCE: redeemer.acceptsMCE,
      mceOnly: selected.mceOnly ?? false,
      category: selected.cat,
      emoji: selected.emoji,
    };
    onAdd(offer);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          maxHeight: "85vh",
          overflowY: "auto",
          background: SURFACE,
          borderRadius: "24px 24px 0 0",
          padding: "24px 20px 40px",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            width: 40,
            height: 4,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 2,
            margin: "0 auto 20px",
          }}
        />

        {step === "pick" ? (
          <>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Add an Offer</div>
            <div style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>
              Choose a preset to get started. You can adjust the CITY cost.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {PRESET_OFFERS.map(preset => (
                <button
                  key={preset.title}
                  onClick={() => {
                    setSelected(preset);
                    setCustomCost(String(preset.cost));
                    setStep("configure");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 14,
                    padding: 14,
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: 24 }}>{preset.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{preset.title}</span>
                      {preset.mceOnly && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 600,
                            background: "rgba(221,158,51,0.2)",
                            color: "#DD9E33",
                            borderRadius: 20,
                            padding: "1px 6px",
                          }}
                        >
                          MCE
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: DIMMED }}>{preset.desc}</div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT, flexShrink: 0 }}>{preset.cost} CITY</div>
                </button>
              ))}
            </div>
          </>
        ) : selected ? (
          <>
            <button
              onClick={() => setStep("pick")}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: MUTED,
                fontSize: 12,
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: 0,
              }}
            >
              ← Back
            </button>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <span style={{ fontSize: 32 }}>{selected.emoji}</span>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#fff" }}>{selected.title}</div>
                <div style={{ fontSize: 12, color: MUTED }}>{selected.desc}</div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: MUTED, marginBottom: 8 }}>CITY Cost</div>
              <input
                type="number"
                value={customCost}
                onChange={e => setCustomCost(e.target.value)}
                style={{
                  width: "100%",
                  background: "rgba(255,255,255,0.07)",
                  border: `1px solid rgba(52,238,182,0.3)`,
                  borderRadius: 12,
                  color: "#fff",
                  fontSize: 22,
                  fontWeight: 700,
                  padding: "12px 16px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
                placeholder={String(selected.cost)}
              />
              <div style={{ fontSize: 11, color: DIMMED, marginTop: 6 }}>Default: {selected.cost} CITY</div>
            </div>

            <button
              onClick={handleAdd}
              style={{
                width: "100%",
                background: ACCENT,
                border: "none",
                borderRadius: 14,
                padding: "14px 0",
                fontSize: 14,
                fontWeight: 700,
                color: BG,
                cursor: "pointer",
              }}
            >
              Add Offer
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

// ─── QR Modal ─────────────────────────────────────────────────────────────────

function QRModal({ offerId, offers, onClose }: { offerId: string; offers: RedemptionOffer[]; onClose: () => void }) {
  const offer = offers.find(o => o.id === offerId);
  if (!offer) return null;

  const qrPayload = `citysync://redeem?offer=${offerId}&redeemer=${FAKE_WALLETS.redeemer}&cost=${offer.costCity}`;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.85)",
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          margin: "0 20px",
          background: SURFACE,
          borderRadius: 24,
          padding: 24,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{offer.offerTitle}</div>
          <div style={{ fontSize: 13, color: MUTED }}>{offer.redeemerName}</div>
        </div>

        {/* QR placeholder */}
        <div
          style={{
            width: 200,
            height: 200,
            background: "#fff",
            borderRadius: 16,
            padding: 12,
            margin: "0 auto 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxSizing: "border-box",
          }}
        >
          <QRGrid seed={offerId} />
        </div>

        {/* Cost */}
        <div
          style={{
            background: "rgba(52,238,182,0.08)",
            border: "1px solid rgba(52,238,182,0.2)",
            borderRadius: 12,
            padding: "10px 0",
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          <div style={{ fontSize: 11, color: MUTED, marginBottom: 2 }}>Cost</div>
          <div style={{ fontSize: 26, fontWeight: 700, color: ACCENT }}>{offer.costCity} CITY</div>
        </div>

        {/* URI */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: 10,
            padding: "10px 12px",
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: 10,
              color: DIMMED,
              wordBreak: "break-all",
              lineHeight: 1.5,
            }}
          >
            {qrPayload}
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            width: "100%",
            background: ACCENT,
            border: "none",
            borderRadius: 14,
            padding: "13px 0",
            fontSize: 14,
            fontWeight: 700,
            color: BG,
            cursor: "pointer",
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
}

// Deterministic QR-like SVG grid (no external library)
function QRGrid({ seed }: { seed: string }) {
  const size = 13;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  const cells = Array.from({ length: size * size }, (_, i) => {
    const r = Math.floor(i / size);
    const c = i % size;
    if ((r < 3 && c < 3) || (r < 3 && c >= size - 3) || (r >= size - 3 && c < 3)) return true;
    return ((hash ^ (i * 0x5f3759df)) & 1) === 1;
  });

  return (
    <svg width="176" height="176" viewBox={`0 0 ${size} ${size}`} style={{ imageRendering: "pixelated" }}>
      {cells.map((filled, i) =>
        filled ? <rect key={i} x={i % size} y={Math.floor(i / size)} width={1} height={1} fill="#15151E" /> : null,
      )}
    </svg>
  );
}

// ─── MyCity Tab ───────────────────────────────────────────────────────────────

function MyCityTab({ posts, orgName, onCompose }: { posts: Post[]; orgName: string; onCompose: () => void }) {
  const [sort, setSort] = useState<"recent" | "top">("recent");

  const sorted = [...posts].sort((a, b) => {
    if (sort === "top") return b.likes - a.likes;
    return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
  });

  const timeAgo = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "just now";
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>City Feed</div>
        <button
          onClick={onCompose}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: ACCENT,
            border: "none",
            borderRadius: 10,
            padding: "8px 14px",
            fontSize: 12,
            fontWeight: 700,
            color: BG,
            cursor: "pointer",
          }}
        >
          <IconPlus /> New Post
        </button>
      </div>

      {/* Sort */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {(["recent", "top"] as const).map(s => (
          <button
            key={s}
            onClick={() => setSort(s)}
            style={{
              border: "none",
              borderRadius: 20,
              padding: "6px 16px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              background: sort === s ? ACCENT : "rgba(255,255,255,0.07)",
              color: sort === s ? BG : MUTED,
            }}
          >
            {s === "recent" ? "Recent" : "Top"}
          </button>
        ))}
      </div>

      {/* Posts */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sorted.map(post => {
          const catColor = CATEGORY_COLOR[post.category];
          const isOwn = post.authorName === orgName;

          return (
            <div
              key={post.id}
              style={{
                ...surfaceCard,
                border: isOwn ? "1px solid rgba(52,238,182,0.2)" : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{post.authorName}</div>
                    {isOwn && (
                      <span
                        style={{
                          fontSize: 10,
                          background: "rgba(52,238,182,0.12)",
                          color: ACCENT,
                          borderRadius: 6,
                          padding: "1px 6px",
                          fontWeight: 600,
                        }}
                      >
                        You
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: DIMMED }}>{timeAgo(post.postedAt)}</div>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 600,
                    background: `${catColor}18`,
                    color: catColor,
                    borderRadius: 6,
                    padding: "3px 8px",
                    flexShrink: 0,
                    marginLeft: 8,
                  }}
                >
                  {post.category}
                </span>
              </div>

              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", lineHeight: 1.55, margin: "0 0 12px" }}>
                {post.content}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: DIMMED }}>
                <IconHeart />
                <span>{post.likes}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Compose Post Sheet ───────────────────────────────────────────────────────

function ComposePostSheet({
  orgName,
  onClose,
  onPost,
}: {
  orgName: string;
  onClose: () => void;
  onPost: (post: Post) => void;
}) {
  const [category, setCategory] = useState<PostCategory>("Announcement");
  const [content, setContent] = useState("");

  const submit = () => {
    if (!content.trim()) return;
    const post: Post = {
      id: `post-redeemer-${Date.now()}`,
      authorName: orgName,
      authorId: FAKE_WALLETS.redeemer,
      authorType: "redeemer",
      content: content.trim(),
      postedAt: new Date().toISOString(),
      likes: 0,
      category,
    };
    onPost(post);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(4px)",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: SURFACE,
          borderRadius: "24px 24px 0 0",
          padding: "24px 20px 40px",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            width: 40,
            height: 4,
            background: "rgba(255,255,255,0.15)",
            borderRadius: 2,
            margin: "0 auto 20px",
          }}
        />
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 16 }}>New Post</div>

        {/* Category picker */}
        <div style={{ marginBottom: 14 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: MUTED,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: 8,
            }}
          >
            Category
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {POST_CATEGORIES.map(cat => {
              const c = CATEGORY_COLOR[cat];
              const active = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    border: active ? `1px solid ${c}` : "1px solid transparent",
                    borderRadius: 8,
                    padding: "5px 12px",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    background: active ? `${c}22` : "rgba(255,255,255,0.06)",
                    color: active ? c : MUTED,
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Share a deal, event, or announcement with the city..."
          rows={5}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12,
            color: "#fff",
            fontSize: 13,
            padding: "12px 14px",
            lineHeight: 1.55,
            resize: "none",
            outline: "none",
            boxSizing: "border-box",
            marginBottom: 16,
          }}
        />

        <button
          onClick={submit}
          disabled={!content.trim()}
          style={{
            width: "100%",
            background: content.trim() ? ACCENT : "rgba(255,255,255,0.1)",
            border: "none",
            borderRadius: 14,
            padding: "14px 0",
            fontSize: 14,
            fontWeight: 700,
            color: content.trim() ? BG : MUTED,
            cursor: content.trim() ? "pointer" : "not-allowed",
          }}
        >
          Publish Post
        </button>
      </div>
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

function DashboardTab({ redeemer }: { redeemer: ReturnType<typeof useDemo>["state"]["redeemer"] }) {
  const totalCity = redeemer.processedRedemptions.reduce((n, r) => n + r.costCity, 0);

  const categoryBreakdown = redeemer.offers.reduce<Record<string, number>>((acc, o) => {
    acc[o.category] = (acc[o.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <SectionLabel text="Performance" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        <MetricCard label="Active Offers" value={redeemer.offers.length} color={ACCENT} />
        <MetricCard label="Processed" value={redeemer.processedRedemptions.length} color="#4169E1" />
        <MetricCard label="CITY Received" value={totalCity} color="#DD9E33" />
        <MetricCard label="Pending Queue" value={redeemer.redemptionQueue.length} color="#a78bfa" />
      </div>

      {Object.keys(categoryBreakdown).length > 0 && (
        <>
          <SectionLabel text="Offers by Category" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {Object.entries(categoryBreakdown).map(([cat, count]) => (
              <div
                key={cat}
                style={{
                  ...surfaceCard,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 16px",
                }}
              >
                <span style={{ fontSize: 13, color: "#fff" }}>{cat}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: ACCENT }}>
                  {count} offer{count > 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {redeemer.offers.length === 0 && redeemer.processedRedemptions.length === 0 && (
        <EmptyState emoji="📊" title="No data yet" desc="Add offers and process redemptions to see analytics here." />
      )}

      <SectionLabel text="Redemption Flow" />
      <div style={{ ...surfaceCard, display: "flex", flexDirection: "column", gap: 14 }}>
        {(
          [
            ["1️⃣", "Create offers", "Add offers from the Redemptions tab with your CITY pricing."],
            ["2️⃣", "Show QR code", "Participants scan your QR in person to initiate a redemption."],
            ["3️⃣", "Confirm in queue", "Redemption request appears in your queue — review and process."],
            ["4️⃣", "Credits arrive", "CITY is burned from the citizen's wallet and confirmed on-chain."],
          ] as [string, string, string][]
        ).map(([num, title, desc]) => (
          <div key={title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span style={{ fontSize: 18 }}>{num}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{title}</div>
              <div style={{ fontSize: 12, color: MUTED }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MCEs Tab ─────────────────────────────────────────────────────────────────

function MCEsTab({ mces, acceptsMCE }: { mces: ReturnType<typeof useDemo>["state"]["mces"]; acceptsMCE: boolean }) {
  return (
    <div style={{ padding: "24px 20px 100px" }}>
      {!acceptsMCE && (
        <div
          style={{
            background: "rgba(221,158,51,0.06)",
            border: "1px solid rgba(221,158,51,0.2)",
            borderRadius: 14,
            padding: "14px 16px",
            marginBottom: 20,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 600, color: "#DD9E33", marginBottom: 4 }}>
            ⚡ Enable MCECredits to unlock MCE offers
          </div>
          <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, margin: 0 }}>
            Toggle MCE opt-in on your Profile tab to start accepting MCECredits from Mass Coordination Event
            participants — and create MCE-exclusive offers.
          </p>
        </div>
      )}

      <SectionLabel text={`Mass Coordination Events (${mces.length})`} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mces.map(mce => {
          const statusColor = STATUS_COLOR[mce.status] ?? "#4169E1";
          const total = mce.votesFor + mce.votesAgainst;
          const forPct = total > 0 ? (mce.votesFor / total) * 100 : 50;

          return (
            <div key={mce.id} style={{ ...surfaceCard }}>
              <div style={{ marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    background: `${statusColor}18`,
                    color: statusColor,
                    borderRadius: 20,
                    padding: "3px 10px",
                  }}
                >
                  {mce.status}
                </span>
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{mce.title}</div>
              <div style={{ fontSize: 11, color: MUTED, marginBottom: 12 }}>
                {mce.mceCreditsPerTask} MCE credits/task · {mce.taskCount} tasks
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: 11,
                  color: MUTED,
                  marginBottom: 6,
                }}
              >
                <span>{mce.votesFor.toLocaleString()} for</span>
                <span>{mce.votesAgainst.toLocaleString()} against</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${forPct}%`,
                    background: "linear-gradient(90deg, #4169E1, #34eeb6)",
                    borderRadius: 3,
                  }}
                />
              </div>

              {acceptsMCE && mce.status === "Active" && (
                <div
                  style={{
                    marginTop: 10,
                    background: "rgba(52,238,182,0.08)",
                    color: ACCENT,
                    borderRadius: 10,
                    padding: "8px 12px",
                    fontSize: 12,
                  }}
                >
                  ✓ You can create MCE-exclusive offers for this event
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Micro-components ─────────────────────────────────────────────────────────

function SectionLabel({ text }: { text: string }) {
  return (
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        color: "rgba(255,255,255,0.35)",
        marginBottom: 10,
      }}
    >
      {text}
    </div>
  );
}

function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        background: `${color}20`,
        color,
        borderRadius: 20,
        padding: "3px 10px",
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, flexShrink: 0 }} />
      {label}
    </span>
  );
}

function StatRow({
  label,
  value,
  suffix,
  border,
  accent,
}: {
  label: string;
  value: number;
  suffix?: string;
  border?: boolean;
  accent?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 16px",
        borderTop: border ? "1px solid rgba(255,255,255,0.06)" : undefined,
      }}
    >
      <span style={{ fontSize: 13, color: MUTED }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: accent ? ACCENT : "#fff" }}>
        {value.toLocaleString()}
        {suffix && <span style={{ fontSize: 11, color: DIMMED, marginLeft: 4 }}>{suffix}</span>}
      </span>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div style={{ ...surfaceCard, textAlign: "center", padding: "16px 12px" }}>
      <div style={{ fontSize: 26, fontWeight: 700, color }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{label}</div>
    </div>
  );
}

function EmptyState({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "48px 0",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 14 }}>{emoji}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: "#fff", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 13, color: MUTED, maxWidth: 240, lineHeight: 1.55 }}>{desc}</div>
    </div>
  );
}
