"use client";

import React, { useRef, useState } from "react";
import { useAccount } from "@account-kit/react";
import { useSmartAccountClient } from "@account-kit/react";
import AppShell from "../_components/AppShell";
import { LearnInfoCard, LearnMoreLink, LearnMorePanel } from "../_components/LearnMore";
import { OnchainActivityPanel } from "../_components/OnchainActivityPanel";
import { useDemo } from "../_context/DemoContext";
import { FAKE_WALLETS, Post, PostCategory, RedemptionOffer } from "../_data/mockData";

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

const IconLock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ─── Constants & Styles ───────────────────────────────────────────────────────

const TABS = [
  { key: "profile", label: "Profile", icon: <IconStore /> },
  { key: "offerings", label: "Offerings", icon: <IconCard /> },
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

const REDEEMER_COMMITTED_CATALOG_STORAGE_KEY = "citysync:demo:redeemer:committed-catalog:v2";
const REDEEMER_MCE_CATALOG_STORAGE_KEY = "citysync:demo:redeemer:mce-catalog:v2";
const REDEEMER_ACTIVE_COMMITTED_STORAGE_KEY = "citysync:demo:redeemer:active-committed:v2";
const REDEEMER_ACTIVE_MCE_STORAGE_KEY = "citysync:demo:redeemer:active-mce:v2";

type OfferWriteStatus = {
  state: "idle" | "pending" | "confirmed" | "failed";
  hash?: `0x${string}`;
  error?: string;
};

// ─── Local Offering Types ─────────────────────────────────────────────────────

type CustomOffering = {
  id: string;
  name: string;
  costCity: number;
  stipulations: string;
  createdAt: string;
};

type MCECustomOffering = {
  id: string;
  name: string;
  costCity: number;
  stipulations: string;
  mceIds: string[];
  mceNames: string[];
  createdAt: string;
};

type QROfferingData = {
  id: string;
  name: string;
  costCity: number;
  orgName: string;
};

type CatalogEditorState = { type: "committed"; editId?: string } | { type: "mce"; editId?: string } | null;

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

type RedeemerLearnCardKey =
  | "profile-account"
  | "profile-role"
  | "offerings-catalog"
  | "offerings-commitment"
  | "offerings-activity"
  | "mycity-feed"
  | "dashboard-metrics"
  | "mce-participation"
  | "epoch1-voting"
  | "next-epoch";

const REDEEMER_LEARN_CARDS: Record<RedeemerLearnCardKey, LearnInfoCard> = {
  "profile-account": {
    title: "Redeemer Account",
    subtitle: "Registered organization identity",
    body: "Your redeemer profile ties venue details, organization identity, and account-level redemption actions to one persistent role session in the demo.",
  },
  "profile-role": {
    title: "Redeemer Responsibilities",
    subtitle: "How redeemers create utility",
    body: "Redeemers convert earned CITY into real-world value through committed offerings and event-specific reward programs, closing the contribution-to-benefit loop.",
  },
  "offerings-catalog": {
    title: "Offerings Catalog",
    subtitle: "Templates before commitment",
    body: "Catalog entries are reusable templates for future commitments. You can edit them over time and issue new active offerings without recreating details from scratch.",
  },
  "offerings-commitment": {
    title: "Why Offerings Are Committed",
    subtitle: "Epoch and MCE commitment model",
    body: "Committed offerings are locked for the duration of an Epoch or MCE event to provide predictability for Civic Participants and strengthen participation incentives. Redeemer organizations must honor these commitments and abide by the rules established by the Representative Redeemer Committee.",
  },
  "offerings-activity": {
    title: "Redeemer Onchain Activity",
    subtitle: "Shared role-wide visibility",
    body: "The activity panel tracks committed offerings and redemption-related contract actions across redeemer organizations, with explorer links for each transaction.",
  },
  "mycity-feed": {
    title: "MyCity Communications",
    subtitle: "Public coordination channel",
    body: "Use MyCity to announce reward programs, venue updates, and campaign participation so participants can discover timely redemption options.",
  },
  "dashboard-metrics": {
    title: "Impact Dashboard",
    subtitle: "Operational performance view",
    body: "Dashboard metrics summarize active offerings, queue throughput, and redemption outcomes so your team can measure engagement and service reliability.",
  },
  "mce-participation": {
    title: "MCE Participation",
    subtitle: "Event-based reward programs",
    body: "Mass Coordination Events align participant demand around city priorities. Redeemers support this by publishing MCE-specific offerings and redemption capacity.",
  },
  "epoch1-voting": {
    title: "Epoch 1 Voting",
    subtitle: "Planning MCE's",
    body: "Epoch 1 voting is reserved for Civic Participants. Your role is to monitor which proposals are gaining support. The Issuer Representative Committee will be responsible for creating and distributing tasks on behalf of Issuer organizations that will execute on the winning proposal. These tasks will be added to your Task Catalog automatically during the next Epoch.",
  },
  "next-epoch": {
    title: "The Next Epoch",
    subtitle: "Epoch Proposals & Process",
    body: "While Epoch 1 Proposals are being voted on, active Issuer and Redeemer organizations will have the ability to propose their own MCE initiatives based on their observations and desires for the community. During this time, Civic Participants can boost these proposals through likes to provide signaling for the Issuer Committee, who will ultimately decide the top 5 proposals based on community need. Redeemers also have the opportunity to influence what 5 proposals are selected by providing preemptive Redemption Offerings for proposals that they like. This allows private businesses to influence community direction through their willingness to offer private goods and services in exchange for local outcomes.",
  },
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RedeemerApp() {
  const { state, setRole, redeemerProcessRedemption, redeemerAddOffer, dispatch } = useDemo();
  const { address } = useAccount({ type: "ModularAccountV2" });
  const { client } = useSmartAccountClient({ type: "ModularAccountV2" });
  const [activeTab, setActiveTab] = useState("profile");
  const [catalogEditor, setCatalogEditor] = useState<CatalogEditorState>(null);
  const [qrTarget, setQrTarget] = useState<QROfferingData | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [localPosts, setLocalPosts] = useState<Post[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [committedOfferings, setCommittedOfferings] = useState<CustomOffering[]>([]);
  const [mceOfferings, setMceOfferings] = useState<MCECustomOffering[]>([]);
  const [committedCatalog, setCommittedCatalog] = useState<CustomOffering[]>([]);
  const [mceCatalog, setMceCatalog] = useState<MCECustomOffering[]>([]);
  const [catalogIssueSheet, setCatalogIssueSheet] = useState<"committed" | "mce" | null>(null);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [offerWriteStatus, setOfferWriteStatus] = useState<OfferWriteStatus>({ state: "idle" });
  const [openInfoCards, setOpenInfoCards] = useState<RedeemerLearnCardKey[]>([]);

  const { redeemer, mces } = state;
  const canCommitOnchain = Boolean(address && client);
  const allPosts = [...localPosts, ...state.posts];
  const rightPanel = <OnchainActivityPanel role="redeemer" accent={ACCENT} />;
  const leftPanel =
    openInfoCards.length > 0 ? (
      <LearnMorePanel
        keys={openInfoCards}
        cards={REDEEMER_LEARN_CARDS}
        onClose={key => setOpenInfoCards(prev => prev.filter(existing => existing !== key))}
        accent={ACCENT}
      />
    ) : null;

  const openLearnMore = React.useCallback((key: RedeemerLearnCardKey) => {
    setOpenInfoCards(prev => (prev.includes(key) ? prev : [...prev, key]));
  }, []);

  React.useEffect(() => {
    setRole("redeemer");
    // Intentional mount-only role selection; avoids reruns when callback identity updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const rawCommitted = window.localStorage.getItem(REDEEMER_COMMITTED_CATALOG_STORAGE_KEY);
      if (rawCommitted) {
        const parsed = JSON.parse(rawCommitted) as CustomOffering[];
        if (Array.isArray(parsed)) setCommittedCatalog(parsed);
      }
      const rawMce = window.localStorage.getItem(REDEEMER_MCE_CATALOG_STORAGE_KEY);
      if (rawMce) {
        const parsed = JSON.parse(rawMce) as MCECustomOffering[];
        if (Array.isArray(parsed)) setMceCatalog(parsed);
      }

      const rawActiveCommitted = window.localStorage.getItem(REDEEMER_ACTIVE_COMMITTED_STORAGE_KEY);
      if (rawActiveCommitted) {
        const parsed = JSON.parse(rawActiveCommitted) as CustomOffering[];
        if (Array.isArray(parsed)) setCommittedOfferings(parsed);
      }

      const rawActiveMce = window.localStorage.getItem(REDEEMER_ACTIVE_MCE_STORAGE_KEY);
      if (rawActiveMce) {
        const parsed = JSON.parse(rawActiveMce) as MCECustomOffering[];
        if (Array.isArray(parsed)) setMceOfferings(parsed);
      }
    } catch {
      // Ignore hydration failures.
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(REDEEMER_COMMITTED_CATALOG_STORAGE_KEY, JSON.stringify(committedCatalog));
    } catch {
      // Ignore persistence failures.
    }
  }, [committedCatalog]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(REDEEMER_MCE_CATALOG_STORAGE_KEY, JSON.stringify(mceCatalog));
    } catch {
      // Ignore persistence failures.
    }
  }, [mceCatalog]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(REDEEMER_ACTIVE_COMMITTED_STORAGE_KEY, JSON.stringify(committedOfferings));
    } catch {
      // Ignore persistence failures.
    }
  }, [committedOfferings]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(REDEEMER_ACTIVE_MCE_STORAGE_KEY, JSON.stringify(mceOfferings));
    } catch {
      // Ignore persistence failures.
    }
  }, [mceOfferings]);

  const handleCreateCommittedOffering = async (data: { name: string; costCity: number; stipulations: string }) => {
    const catalogId = catalogEditor?.type === "committed" ? catalogEditor.editId : undefined;
    const catalogItem: CustomOffering = {
      id: catalogId ?? `committed-catalog-${Date.now()}`,
      name: data.name,
      costCity: data.costCity,
      stipulations: data.stipulations,
      createdAt: new Date().toISOString(),
    };
    setCommittedCatalog(prev => {
      if (!catalogId) return [catalogItem, ...prev];
      return prev.map(item => (item.id === catalogId ? { ...item, ...catalogItem } : item));
    });
    setCatalogEditor(null);
    setToast(catalogId ? "Committed offering updated in catalog." : "Committed offering added to catalog.");
  };

  const handleIssueCommittedFromCatalog = async (catalogId: string) => {
    if (!canCommitOnchain) {
      setOfferWriteStatus({ state: "failed", error: "Wallet session not ready. Please wait and try again." });
      setToast("Wallet not ready yet. Wait 2-3 seconds and try Commit again.");
      return;
    }

    const template = committedCatalog.find(item => item.id === catalogId);
    if (!template) return;

    const offering: CustomOffering = {
      id: `committed-${Date.now()}`,
      name: template.name,
      costCity: template.costCity,
      stipulations: template.stipulations,
      createdAt: new Date().toISOString(),
    };
    setCommittedOfferings(prev => [offering, ...prev]);

    const onchainOffer: RedemptionOffer = {
      id: `offer-${Date.now()}`,
      redeemerName: redeemer.orgName || "Redeemer",
      redeemerId: address ?? FAKE_WALLETS.redeemer,
      offerTitle: template.name,
      description: template.stipulations || "No additional stipulations",
      costCity: template.costCity,
      acceptsMCE: redeemer.acceptsMCE,
      mceOnly: false,
      category: "Essentials",
      emoji: "🏪",
    };

    setOfferWriteStatus({ state: "pending" });
    const result = await redeemerAddOffer(onchainOffer);
    if (result.ok) {
      setOfferWriteStatus({ state: "confirmed", hash: result.hash });
      setToast("Committed offering issued from catalog and submitted onchain.");
    } else {
      setOfferWriteStatus({ state: "failed", error: result.error });
      setToast("Offering issued locally from catalog, but onchain write failed.");
    }
  };

  const handleCreateMCEOffering = async (data: {
    name: string;
    costCity: number;
    stipulations: string;
    mceIds: string[];
    mceNames: string[];
  }) => {
    const catalogId = catalogEditor?.type === "mce" ? catalogEditor.editId : undefined;
    const catalogItem: MCECustomOffering = {
      id: catalogId ?? `mce-catalog-${Date.now()}`,
      name: data.name,
      costCity: data.costCity,
      stipulations: data.stipulations,
      mceIds: data.mceIds,
      mceNames: data.mceNames,
      createdAt: new Date().toISOString(),
    };
    setMceCatalog(prev => {
      if (!catalogId) return [catalogItem, ...prev];
      return prev.map(item => (item.id === catalogId ? { ...item, ...catalogItem } : item));
    });
    setCatalogEditor(null);
    setToast(catalogId ? "MCE offering updated in catalog." : "MCE offering added to catalog.");
  };

  const handleIssueMceFromCatalog = async (catalogId: string) => {
    if (!canCommitOnchain) {
      setOfferWriteStatus({ state: "failed", error: "Wallet session not ready. Please wait and try again." });
      setToast("Wallet not ready yet. Wait 2-3 seconds and try Commit again.");
      return;
    }

    const template = mceCatalog.find(item => item.id === catalogId);
    if (!template) return;

    const offering: MCECustomOffering = {
      id: `mce-offering-${Date.now()}`,
      name: template.name,
      costCity: template.costCity,
      stipulations: template.stipulations,
      mceIds: template.mceIds,
      mceNames: template.mceNames,
      createdAt: new Date().toISOString(),
    };
    setMceOfferings(prev => [offering, ...prev]);

    const onchainOffer: RedemptionOffer = {
      id: `offer-${Date.now()}`,
      redeemerName: redeemer.orgName || "Redeemer",
      redeemerId: address ?? FAKE_WALLETS.redeemer,
      offerTitle: template.name,
      description: template.stipulations || "No additional stipulations",
      costCity: template.costCity,
      acceptsMCE: true,
      mceOnly: true,
      category: "Culture",
      emoji: "🏆",
    };

    setOfferWriteStatus({ state: "pending" });
    const result = await redeemerAddOffer(onchainOffer);
    if (result.ok) {
      setOfferWriteStatus({ state: "confirmed", hash: result.hash });
      setToast("MCE offering issued from catalog and submitted onchain.");
    } else {
      setOfferWriteStatus({ state: "failed", error: result.error });
      setToast("Offering issued locally from catalog, but onchain write failed.");
    }
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

  return (
    <>
      <AppShell
        role="redeemer"
        orgName={redeemer.orgName}
        address={address ?? FAKE_WALLETS.redeemer}
        cityBalance={state.participant.cityBalance}
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
        {activeTab === "profile" && <ProfileTab redeemer={redeemer} dispatch={dispatch} onLearnMore={openLearnMore} />}
        {activeTab === "offerings" && (
          <OfferingsTab
            redeemer={redeemer}
            committedOfferings={committedOfferings}
            mceOfferings={mceOfferings}
            committedCatalog={committedCatalog}
            mceCatalog={mceCatalog}
            onCommitFromCatalogCommitted={handleIssueCommittedFromCatalog}
            onCommitFromCatalogMCE={handleIssueMceFromCatalog}
            onAddCommitted={() => setCatalogEditor({ type: "committed" })}
            onAddMCE={() => setCatalogEditor({ type: "mce" })}
            onModifyCommitted={catalogId => setCatalogEditor({ type: "committed", editId: catalogId })}
            onModifyMCE={catalogId => setCatalogEditor({ type: "mce", editId: catalogId })}
            onShowQR={setQrTarget}
            onRemoveAttempt={id => setRemoveTarget(id)}
            onProcess={handleProcess}
            orgName={redeemer.orgName}
            offerWriteStatus={offerWriteStatus}
            onLearnMore={openLearnMore}
          />
        )}
        {activeTab === "mycity" && (
          <MyCityTab
            posts={allPosts}
            orgName={redeemer.orgName}
            onCompose={() => setComposeOpen(true)}
            onLearnMore={openLearnMore}
          />
        )}
        {activeTab === "dashboard" && (
          <DashboardTab
            redeemer={redeemer}
            committedOfferings={committedOfferings}
            mceOfferings={mceOfferings}
            onLearnMore={openLearnMore}
          />
        )}
        {activeTab === "mces" && <MCEsTab state={state} orgName={redeemer.orgName} onLearnMore={openLearnMore} />}
        {catalogEditor?.type === "committed" && (
          <AddOfferingSheet
            type="committed"
            mces={mces}
            onClose={() => setCatalogEditor(null)}
            onSubmitCommitted={handleCreateCommittedOffering}
            onSubmitMCE={handleCreateMCEOffering}
            initialCommitted={
              catalogEditor.editId ? (committedCatalog.find(item => item.id === catalogEditor.editId) ?? null) : null
            }
          />
        )}
        {catalogEditor?.type === "mce" && (
          <AddOfferingSheet
            type="mce"
            mces={mces}
            onClose={() => setCatalogEditor(null)}
            onSubmitCommitted={handleCreateCommittedOffering}
            onSubmitMCE={handleCreateMCEOffering}
            initialMCE={
              catalogEditor.editId ? (mceCatalog.find(item => item.id === catalogEditor.editId) ?? null) : null
            }
          />
        )}

        {catalogIssueSheet === "committed" && (
          <IssueOfferingFromCatalogSheet
            type="committed"
            committedCatalog={committedCatalog}
            mceCatalog={mceCatalog}
            canCommitOnchain={canCommitOnchain}
            onIssueCommitted={handleIssueCommittedFromCatalog}
            onIssueMCE={handleIssueMceFromCatalog}
            onModifyCommitted={catalogId => setCatalogEditor({ type: "committed", editId: catalogId })}
            onModifyMCE={catalogId => setCatalogEditor({ type: "mce", editId: catalogId })}
            onClose={() => setCatalogIssueSheet(null)}
          />
        )}
        {catalogIssueSheet === "mce" && (
          <IssueOfferingFromCatalogSheet
            type="mce"
            committedCatalog={committedCatalog}
            mceCatalog={mceCatalog}
            canCommitOnchain={canCommitOnchain}
            onIssueCommitted={handleIssueCommittedFromCatalog}
            onIssueMCE={handleIssueMceFromCatalog}
            onModifyCommitted={catalogId => setCatalogEditor({ type: "committed", editId: catalogId })}
            onModifyMCE={catalogId => setCatalogEditor({ type: "mce", editId: catalogId })}
            onClose={() => setCatalogIssueSheet(null)}
          />
        )}

        {qrTarget && <QRModal offering={qrTarget} onClose={() => setQrTarget(null)} />}

        {removeTarget && (
          <ConfirmDialog
            title="Committed Offering Locked"
            message="This is a Committed Offering. It cannot be removed until the end of the current Epoch. All modifications to offerings and rates must occur after the Epoch ends or after the expiration of your offer."
            confirmLabel="Got it"
            onConfirm={() => setRemoveTarget(null)}
            onCancel={() => setRemoveTarget(null)}
            warningOnly
          />
        )}

        {composeOpen && (
          <ComposePostSheet
            orgName={redeemer.orgName}
            onClose={() => setComposeOpen(false)}
            onPost={handleCreatePost}
          />
        )}
      </AppShell>

      {toast && <SuccessToast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab({
  redeemer,
  dispatch,
  onLearnMore,
}: {
  redeemer: ReturnType<typeof useDemo>["state"]["redeemer"];
  dispatch: ReturnType<typeof useDemo>["dispatch"];
  onLearnMore: (key: RedeemerLearnCardKey) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(redeemer.orgName);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Venue info editable fields
  const [venueAddress, setVenueAddress] = useState("123 Main Street, Oakland, CA 94601");
  const [venuePhone, setVenuePhone] = useState("(510) 555-0198");
  const [venueWebsite, setVenueWebsite] = useState("https://yourvenuesite.com");
  const [editingVenue, setEditingVenue] = useState(false);
  const [draftAddress, setDraftAddress] = useState(venueAddress);
  const [draftPhone, setDraftPhone] = useState(venuePhone);
  const [draftWebsite, setDraftWebsite] = useState(venueWebsite);

  const startVenueEdit = () => {
    setDraftAddress(venueAddress);
    setDraftPhone(venuePhone);
    setDraftWebsite(venueWebsite);
    setEditingVenue(true);
  };

  const saveVenueEdit = () => {
    setVenueAddress(draftAddress.trim() || venueAddress);
    setVenuePhone(draftPhone.trim() || venuePhone);
    setVenueWebsite(draftWebsite.trim() || venueWebsite);
    setEditingVenue(false);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
    }
  };

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

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginBottom: 12 }}>
        <LearnMoreLink onClick={() => onLearnMore("profile-account")} />
        <LearnMoreLink onClick={() => onLearnMore("profile-role")} />
      </div>
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
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            {/* Logo upload */}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleLogoChange}
            />
            <button
              onClick={() => logoInputRef.current?.click()}
              title="Upload organization logo"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: logoUrl ? "transparent" : "rgba(52,238,182,0.1)",
                border: `1px dashed ${logoUrl ? "transparent" : "rgba(52,238,182,0.4)"}`,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ fontSize: 20 }}>🏪</span>
              )}
            </button>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
              <div style={{ fontSize: 10, color: "rgba(52,238,182,0.5)", marginTop: 1 }}>Tap icon to upload logo</div>
            </div>
          </div>
        )}

        <div style={{ fontFamily: "monospace", fontSize: 11, color: "rgba(255,255,255,0.35)", marginBottom: 14 }}>
          {FAKE_WALLETS.redeemer}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <StatusPill label="Registered Redeemer" color={ACCENT} />
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
          Accept CITYx credits from civic participants in exchange for goods and services. Create committed offerings
          for the current Epoch and MCE-linked offerings for city events. Generate QR codes for in-person redemption and
          process incoming requests from your queue.
        </p>
      </div>

      {/* Venue Information */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <SectionLabel text="Venue Information" />
        {!editingVenue && (
          <button
            onClick={startVenueEdit}
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
        )}
      </div>
      <div
        style={{
          ...surfaceCard,
          marginBottom: 20,
        }}
      >
        {editingVenue ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              {
                label: "Address",
                value: draftAddress,
                setter: setDraftAddress,
                placeholder: "Street, City, State ZIP",
              },
              { label: "Phone Number", value: draftPhone, setter: setDraftPhone, placeholder: "(555) 555-5555" },
              { label: "Website", value: draftWebsite, setter: setDraftWebsite, placeholder: "https://yoursite.com" },
            ].map(field => (
              <div key={field.label}>
                <div style={{ fontSize: 11, fontWeight: 600, color: MUTED, marginBottom: 4 }}>{field.label}</div>
                <input
                  value={field.value}
                  onChange={e => field.setter(e.target.value)}
                  placeholder={field.placeholder}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(52,238,182,0.4)",
                    borderRadius: 8,
                    color: "#fff",
                    fontSize: 13,
                    padding: "8px 10px",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button
                onClick={saveVenueEdit}
                style={{
                  flex: 1,
                  background: ACCENT,
                  border: "none",
                  borderRadius: 10,
                  padding: "9px 0",
                  fontSize: 13,
                  fontWeight: 700,
                  color: BG,
                  cursor: "pointer",
                }}
              >
                Save
              </button>
              <button
                onClick={() => setEditingVenue(false)}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  padding: "9px 0",
                  fontSize: 13,
                  fontWeight: 600,
                  color: MUTED,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Address", value: venueAddress },
              { label: "Phone Number", value: venuePhone },
              { label: "Website", value: venueWebsite },
            ].map((row, i) => (
              <div
                key={row.label}
                style={{
                  ...(i > 0 ? { borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 10 } : {}),
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 13, color: MUTED, flexShrink: 0 }}>{row.label}</span>
                <span
                  style={{
                    fontSize: 13,
                    color: DIMMED,
                    textAlign: "right",
                    wordBreak: "break-all",
                  }}
                >
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Offerings Tab ─────────────────────────────────────────────────────────────

function OfferingsTab({
  redeemer,
  committedOfferings,
  mceOfferings,
  committedCatalog,
  mceCatalog,
  onCommitFromCatalogCommitted,
  onCommitFromCatalogMCE,
  onAddCommitted,
  onAddMCE,
  onModifyCommitted,
  onModifyMCE,
  onShowQR,
  onRemoveAttempt,
  onProcess,
  orgName,
  offerWriteStatus,
  onLearnMore,
}: {
  redeemer: ReturnType<typeof useDemo>["state"]["redeemer"];
  committedOfferings: CustomOffering[];
  mceOfferings: MCECustomOffering[];
  committedCatalog: CustomOffering[];
  mceCatalog: MCECustomOffering[];
  onCommitFromCatalogCommitted: (catalogId: string) => void;
  onCommitFromCatalogMCE: (catalogId: string) => void;
  onAddCommitted: () => void;
  onAddMCE: () => void;
  onModifyCommitted: (catalogId: string) => void;
  onModifyMCE: (catalogId: string) => void;
  onShowQR: (data: QROfferingData) => void;
  onRemoveAttempt: (id: string) => void;
  onProcess: (queueId: string) => void;
  orgName: string;
  offerWriteStatus: OfferWriteStatus;
  onLearnMore: (key: RedeemerLearnCardKey) => void;
}) {
  const [view, setView] = useState<"committed" | "mce">("committed");
  const [pendingCommittedCatalogCommitId, setPendingCommittedCatalogCommitId] = useState<string | null>(null);
  const [pendingMceCatalogCommitId, setPendingMceCatalogCommitId] = useState<string | null>(null);
  const explorerHref = offerWriteStatus.hash ? `https://sepolia.basescan.org/tx/${offerWriteStatus.hash}` : null;

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <LearnMoreLink onClick={() => onLearnMore("offerings-commitment")} />
      </div>
      {/* Segment control */}
      <div style={{ background: SURFACE, borderRadius: 16, padding: 4, display: "flex", marginBottom: 20 }}>
        {(["committed", "mce"] as const).map(v => (
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
            {v === "committed"
              ? `Committed Offerings (${committedOfferings.length})`
              : `MCE Offerings (${mceOfferings.length})`}
          </button>
        ))}
      </div>

      {offerWriteStatus.state !== "idle" && (
        <div
          style={{
            ...surfaceCard,
            marginBottom: 16,
            border:
              offerWriteStatus.state === "confirmed"
                ? "1px solid rgba(52,238,182,0.35)"
                : offerWriteStatus.state === "failed"
                  ? "1px solid rgba(255,107,157,0.35)"
                  : "1px solid rgba(65,105,225,0.35)",
            background:
              offerWriteStatus.state === "confirmed"
                ? "rgba(52,238,182,0.08)"
                : offerWriteStatus.state === "failed"
                  ? "rgba(255,107,157,0.08)"
                  : "rgba(65,105,225,0.08)",
          }}
        >
          <div style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>Last Offer Write</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
            {offerWriteStatus.state === "pending" && "Pending wallet/user-op confirmation..."}
            {offerWriteStatus.state === "confirmed" && "Confirmed onchain"}
            {offerWriteStatus.state === "failed" && "Failed onchain (UI-only for this attempt)"}
          </div>
          {offerWriteStatus.error && (
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", lineHeight: 1.4 }}>
              {offerWriteStatus.error}
            </div>
          )}
          {explorerHref && (
            <a
              href={explorerHref}
              target="_blank"
              rel="noreferrer"
              style={{ display: "inline-block", marginTop: 6, fontSize: 12, color: ACCENT, textDecoration: "none" }}
            >
              View on Base Sepolia Explorer ↗
            </a>
          )}
        </div>
      )}

      {/* ── Committed Offerings ── */}
      {view === "committed" && (
        <>
          <button
            onClick={onAddCommitted}
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
            <IconPlus /> Add Offering to Catalog
          </button>

          <SectionLabel text={`Offering Catalog (${committedCatalog.length})`} />

          {committedCatalog.length === 0 ? (
            <EmptyState
              emoji="📚"
              title="No offerings in catalog yet"
              desc="Add an offering to catalog, then commit it onchain."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {committedCatalog.map(item => (
                <div
                  key={item.id}
                  style={{
                    ...surfaceCard,
                    border: "1px solid rgba(52,238,182,0.2)",
                    background: "rgba(52,238,182,0.04)",
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{item.name}</div>
                  {item.stipulations && (
                    <div style={{ fontSize: 11, color: DIMMED, marginBottom: 6, lineHeight: 1.45 }}>
                      {item.stipulations}
                    </div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT, marginBottom: 8 }}>
                    {item.costCity} CITYx
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={() => onModifyCommitted(item.id)}
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.14)",
                        borderRadius: 10,
                        padding: "8px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      Modify Offering
                    </button>
                    <button
                      onClick={() => setPendingCommittedCatalogCommitId(item.id)}
                      style={{
                        background: ACCENT,
                        border: "none",
                        borderRadius: 10,
                        padding: "8px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: BG,
                        cursor: "pointer",
                      }}
                    >
                      Commit Offering
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <SectionLabel text={`Active Committed Offerings (${committedOfferings.length})`} />

          {committedOfferings.length === 0 ? (
            <EmptyState
              emoji="🏪"
              title="No committed offerings yet"
              desc="Issue from your committed catalog to activate offerings for participants this Epoch."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {committedOfferings.map(offering => (
                <div
                  key={offering.id}
                  style={{
                    ...surfaceCard,
                    border: "1px solid rgba(52,238,182,0.15)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: "rgba(52,238,182,0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                        flexShrink: 0,
                      }}
                    >
                      🏪
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{offering.name}</div>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                            fontSize: 10,
                            fontWeight: 600,
                            background: "rgba(52,238,182,0.1)",
                            color: ACCENT,
                            borderRadius: 20,
                            padding: "1px 7px",
                          }}
                        >
                          <IconLock /> Epoch Locked
                        </span>
                      </div>
                      {offering.stipulations && (
                        <div style={{ fontSize: 11, color: DIMMED, marginBottom: 4, lineHeight: 1.4 }}>
                          {offering.stipulations}
                        </div>
                      )}
                      <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT }}>{offering.costCity} CITYx</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() =>
                        onShowQR({
                          id: offering.id,
                          name: offering.name,
                          costCity: offering.costCity,
                          orgName,
                        })
                      }
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
                      onClick={() => onRemoveAttempt(offering.id)}
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 10,
                        padding: "9px 14px",
                        fontSize: 12,
                        fontWeight: 600,
                        color: MUTED,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <IconLock /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Redemption queue */}
          {redeemer.redemptionQueue.length > 0 && (
            <>
              <SectionLabel text={`Redemption Queue (${redeemer.redemptionQueue.length})`} />
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
                        <div style={{ fontSize: 11, color: DIMMED }}>CITYx</div>
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
            </>
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
                      +{r.costCity} CITYx
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {committedOfferings.length === 0 &&
            redeemer.redemptionQueue.length === 0 &&
            redeemer.processedRedemptions.length === 0 &&
            null}

          {pendingCommittedCatalogCommitId && (
            <ConfirmDialog
              title="Commit Offering?"
              message="This commitment will be locked, and your organization agrees to honor this commitment until the end of the Epoch."
              confirmLabel="Confirm Commit"
              onConfirm={() => {
                onCommitFromCatalogCommitted(pendingCommittedCatalogCommitId);
                setPendingCommittedCatalogCommitId(null);
              }}
              onCancel={() => setPendingCommittedCatalogCommitId(null)}
            />
          )}
        </>
      )}

      {/* ── MCE Offerings ── */}
      {view === "mce" && (
        <>
          <button
            onClick={onAddMCE}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "rgba(221,158,51,0.08)",
              border: "1px dashed rgba(221,158,51,0.35)",
              borderRadius: 14,
              padding: "14px 0",
              fontSize: 13,
              fontWeight: 600,
              color: "#DD9E33",
              cursor: "pointer",
              marginBottom: 16,
            }}
          >
            <IconPlus /> Add Offering to MCE Catalog
          </button>

          <SectionLabel text={`MCE Offering Catalog (${mceCatalog.length})`} />

          {mceCatalog.length === 0 ? (
            <EmptyState
              emoji="📚"
              title="No offerings in MCE catalog yet"
              desc="Add an MCE offering to catalog, then commit it onchain."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {mceCatalog.map(item => (
                <div
                  key={item.id}
                  style={{
                    ...surfaceCard,
                    border: "1px solid rgba(221,158,51,0.22)",
                    background: "rgba(221,158,51,0.04)",
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{item.name}</div>
                  {item.mceNames.length > 0 && (
                    <div style={{ fontSize: 11, color: DIMMED, marginBottom: 4 }}>
                      Events: {item.mceNames.join(", ")}
                    </div>
                  )}
                  {item.stipulations && (
                    <div style={{ fontSize: 11, color: DIMMED, marginBottom: 6, lineHeight: 1.45 }}>
                      {item.stipulations}
                    </div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#DD9E33", marginBottom: 8 }}>
                    {item.costCity} CITYx
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={() => onModifyMCE(item.id)}
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.14)",
                        borderRadius: 10,
                        padding: "8px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      Modify Offering
                    </button>
                    <button
                      onClick={() => setPendingMceCatalogCommitId(item.id)}
                      style={{
                        background: "#DD9E33",
                        border: "none",
                        borderRadius: 10,
                        padding: "8px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: BG,
                        cursor: "pointer",
                      }}
                    >
                      Commit Offering
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <SectionLabel text={`Active MCE Offerings (${mceOfferings.length})`} />

          {mceOfferings.length === 0 ? (
            <EmptyState
              emoji="⚡"
              title="No MCE offerings yet"
              desc="Issue from your MCE catalog to activate event-linked offerings."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {mceOfferings.map(offering => (
                <div
                  key={offering.id}
                  style={{
                    ...surfaceCard,
                    border: "1px solid rgba(221,158,51,0.2)",
                    background: "rgba(221,158,51,0.03)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        background: "rgba(221,158,51,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 22,
                        flexShrink: 0,
                      }}
                    >
                      ⚡
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{offering.name}</div>
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
                      </div>
                      <div style={{ fontSize: 11, color: DIMMED, marginBottom: 6 }}>
                        Events: {offering.mceNames.join(", ")}
                      </div>
                      {offering.stipulations && (
                        <div style={{ fontSize: 11, color: DIMMED, marginBottom: 6, lineHeight: 1.4 }}>
                          {offering.stipulations}
                        </div>
                      )}
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#DD9E33" }}>{offering.costCity} CITYx</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() =>
                        onShowQR({
                          id: offering.id,
                          name: offering.name,
                          costCity: offering.costCity,
                          orgName,
                        })
                      }
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        background: "rgba(221,158,51,0.1)",
                        border: "none",
                        borderRadius: 10,
                        padding: "9px 0",
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#DD9E33",
                        cursor: "pointer",
                      }}
                    >
                      <IconQR /> Show QR
                    </button>
                    <div
                      style={{
                        background: "rgba(221,158,51,0.08)",
                        borderRadius: 10,
                        padding: "9px 14px",
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#DD9E33",
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <IconLock /> Locked
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pendingMceCatalogCommitId && (
            <ConfirmDialog
              title="Commit Offering?"
              message="This MCE commitment will be locked, and your organization agrees to honor this commitment until the end of the MCE Event."
              confirmLabel="Confirm Commit"
              onConfirm={() => {
                onCommitFromCatalogMCE(pendingMceCatalogCommitId);
                setPendingMceCatalogCommitId(null);
              }}
              onCancel={() => setPendingMceCatalogCommitId(null)}
            />
          )}
        </>
      )}
    </div>
  );
}

// ─── Add Offering Sheet ────────────────────────────────────────────────────────

function AddOfferingSheet({
  type,
  mces,
  onClose,
  onSubmitCommitted,
  onSubmitMCE,
  initialCommitted,
  initialMCE,
}: {
  type: "committed" | "mce";
  mces: ReturnType<typeof useDemo>["state"]["mces"];
  onClose: () => void;
  onSubmitCommitted: (data: { name: string; costCity: number; stipulations: string }) => void;
  onSubmitMCE: (data: {
    name: string;
    costCity: number;
    stipulations: string;
    mceIds: string[];
    mceNames: string[];
  }) => void;
  initialCommitted?: CustomOffering | null;
  initialMCE?: MCECustomOffering | null;
}) {
  const [name, setName] = useState(type === "committed" ? (initialCommitted?.name ?? "") : (initialMCE?.name ?? ""));
  const [costCity, setCostCity] = useState(
    type === "committed"
      ? initialCommitted?.costCity
        ? String(initialCommitted.costCity)
        : ""
      : initialMCE?.costCity
        ? String(initialMCE.costCity)
        : "",
  );
  const [stipulations, setStipulations] = useState(
    type === "committed" ? (initialCommitted?.stipulations ?? "") : (initialMCE?.stipulations ?? ""),
  );
  const [selectedMceIds, setSelectedMceIds] = useState(type === "mce" ? (initialMCE?.mceIds ?? []) : []);

  const activeMces = mces.filter(m => m.status === "Active" || m.status === "Voting");

  const canSubmitCommitted = name.trim() && parseInt(costCity) > 0;
  const canSubmitMCE = name.trim() && parseInt(costCity) > 0 && selectedMceIds.length > 0;

  const toggleMce = (id: string) => {
    setSelectedMceIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const doSubmit = () => {
    if (type === "committed") {
      if (!canSubmitCommitted) return;
      onSubmitCommitted({ name: name.trim(), costCity: parseInt(costCity), stipulations: stipulations.trim() });
    } else {
      if (!canSubmitMCE) return;
      onSubmitMCE({
        name: name.trim(),
        costCity: parseInt(costCity),
        stipulations: stipulations.trim(),
        mceIds: selectedMceIds,
        mceNames: selectedMceIds.map(id => activeMces.find(m => m.id === id)?.title ?? id),
      });
    }
  };

  const handleSubmit = () => doSubmit();

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    color: "#fff",
    fontSize: 13,
    padding: "10px 12px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: MUTED,
    textTransform: "uppercase" as const,
    letterSpacing: "0.07em",
    marginBottom: 6,
    display: "block",
  };

  const accentCol = type === "committed" ? ACCENT : "#DD9E33";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 40,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          height: "100%",
          position: "relative",
          pointerEvents: "auto",
        }}
        onClick={onClose}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.34)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 10,
            right: 10,
            bottom: "92px",
            maxHeight: "min(74vh, calc(100% - 98px))",
            overflowY: "auto",
            background: SURFACE,
            borderRadius: 22,
            padding: "24px 20px 24px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 14px 34px rgba(0,0,0,0.35)",
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

          <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
            Add Offering to your Catalog
          </div>
          <div style={{ fontSize: 13, color: MUTED, marginBottom: 20, lineHeight: 1.5 }}>
            {type === "committed"
              ? "Create or update your committed offering template."
              : "Create or update your MCE offering template."}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Offering Name */}
            <div>
              <label style={labelStyle}>Offering Name *</label>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. 10% Grocery Discount"
                style={inputStyle}
              />
            </div>

            {/* Cost */}
            <div>
              <label style={labelStyle}>Cost in CITYx *</label>
              <input
                type="number"
                value={costCity}
                onChange={e => setCostCity(e.target.value)}
                placeholder="e.g. 30"
                style={{ ...inputStyle, fontSize: 20, fontWeight: 700 }}
              />
            </div>

            {/* MCE Selector (MCE type only) — multi-select checkboxes */}
            {type === "mce" && (
              <div>
                <label style={labelStyle}>Select MCE Events (choose all that apply) *</label>
                <div style={{ fontSize: 11, color: DIMMED, marginBottom: 8, lineHeight: 1.4 }}>
                  Select the MCE proposals you would create this offering for. Your selection signals influence on
                  voting.
                </div>
                {activeMces.length === 0 ? (
                  <div
                    style={{
                      ...inputStyle,
                      color: DIMMED,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    No active MCEs available
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {activeMces.map(mce => {
                      const checked = selectedMceIds.includes(mce.id);
                      return (
                        <button
                          key={mce.id}
                          type="button"
                          onClick={() => toggleMce(mce.id)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            padding: "12px 14px",
                            borderRadius: 10,
                            border: checked ? "1px solid rgba(221,158,51,0.5)" : "1px solid rgba(255,255,255,0.1)",
                            background: checked ? "rgba(221,158,51,0.08)" : "rgba(255,255,255,0.04)",
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          {/* Checkbox indicator */}
                          <div
                            style={{
                              width: 18,
                              height: 18,
                              borderRadius: 4,
                              border: checked ? "none" : "1.5px solid rgba(255,255,255,0.25)",
                              background: checked ? "#DD9E33" : "transparent",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {checked && <span style={{ fontSize: 11, color: "#0d1117", fontWeight: 800 }}>✓</span>}
                          </div>
                          <span style={{ fontSize: 13, color: "#fff", fontWeight: 500, flex: 1 }}>{mce.title}</span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              background: `${STATUS_COLOR[mce.status] ?? ACCENT}18`,
                              color: STATUS_COLOR[mce.status] ?? ACCENT,
                              borderRadius: 20,
                              padding: "2px 8px",
                              flexShrink: 0,
                            }}
                          >
                            {mce.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Stipulations / Notes */}
            <div>
              <label style={labelStyle}>Stipulations / Notes</label>
              <textarea
                value={stipulations}
                onChange={e => setStipulations(e.target.value)}
                placeholder="e.g. Valid Mon–Fri only, not during peak hours, one redemption per visit..."
                rows={3}
                style={{ ...inputStyle, resize: "none", lineHeight: 1.55 }}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={type === "committed" ? !canSubmitCommitted : !canSubmitMCE}
            style={{
              width: "100%",
              background: (type === "committed" ? canSubmitCommitted : canSubmitMCE)
                ? accentCol
                : "rgba(255,255,255,0.08)",
              border: "none",
              borderRadius: 14,
              padding: "14px 0",
              fontSize: 14,
              fontWeight: 700,
              color: (type === "committed" ? canSubmitCommitted : canSubmitMCE) ? BG : MUTED,
              cursor: (type === "committed" ? canSubmitCommitted : canSubmitMCE) ? "pointer" : "not-allowed",
              marginTop: 20,
            }}
          >
            Add To Catalog
          </button>
        </div>
      </div>
    </div>
  );
}

function IssueOfferingFromCatalogSheet({
  type,
  committedCatalog,
  mceCatalog,
  canCommitOnchain,
  onIssueCommitted,
  onIssueMCE,
  onModifyCommitted,
  onModifyMCE,
  onClose,
}: {
  type: "committed" | "mce";
  committedCatalog: CustomOffering[];
  mceCatalog: MCECustomOffering[];
  canCommitOnchain: boolean;
  onIssueCommitted: (catalogId: string) => void;
  onIssueMCE: (catalogId: string) => void;
  onModifyCommitted: (catalogId: string) => void;
  onModifyMCE: (catalogId: string) => void;
  onClose: () => void;
}) {
  const isCommitted = type === "committed";
  const accent = isCommitted ? ACCENT : "#DD9E33";
  const list = isCommitted ? committedCatalog : mceCatalog;
  const [pendingCommitId, setPendingCommitId] = useState<string | null>(null);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 42,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          height: "100%",
          position: "relative",
          pointerEvents: "auto",
        }}
        onClick={onClose}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.34)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 10,
            right: 10,
            bottom: "92px",
            maxHeight: "min(74vh, calc(100% - 98px))",
            overflowY: "auto",
            background: SURFACE,
            borderRadius: 22,
            padding: "22px 20px 20px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 14px 34px rgba(0,0,0,0.35)",
          }}
          onClick={e => e.stopPropagation()}
        >
          <div
            style={{
              width: 40,
              height: 4,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 2,
              margin: "0 auto 18px",
            }}
          />

          <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
            {isCommitted ? "Committed Offerings Catalog" : "MCE Offerings Catalog"}
          </div>
          <div style={{ fontSize: 13, color: MUTED, marginBottom: 18 }}>
            Select an offering to modify, or commit it onchain as an active offering.
          </div>
          {!canCommitOnchain && (
            <div
              style={{
                background: "rgba(255,107,157,0.08)",
                border: "1px solid rgba(255,107,157,0.25)",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 12,
                color: "rgba(255,255,255,0.8)",
                marginBottom: 14,
              }}
            >
              Wallet session is still initializing. Commit Offering will enable once ready.
            </div>
          )}

          {list.length === 0 ? (
            <EmptyState
              emoji={isCommitted ? "🏪" : "⚡"}
              title="Catalog is empty"
              desc={
                isCommitted ? "Add a committed offering to catalog first." : "Add an MCE offering to catalog first."
              }
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {list.map(item => (
                <div
                  key={item.id}
                  style={{
                    ...surfaceCard,
                    border: `1px solid ${isCommitted ? "rgba(52,238,182,0.2)" : "rgba(221,158,51,0.22)"}`,
                    background: isCommitted ? "rgba(52,238,182,0.04)" : "rgba(221,158,51,0.04)",
                  }}
                >
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{item.name}</div>
                  {Array.isArray((item as MCECustomOffering).mceNames) &&
                    (item as MCECustomOffering).mceNames.length > 0 && (
                      <div style={{ fontSize: 11, color: DIMMED, marginBottom: 4 }}>
                        Events: {(item as MCECustomOffering).mceNames.join(", ")}
                      </div>
                    )}
                  {item.stipulations && (
                    <div style={{ fontSize: 11, color: DIMMED, marginBottom: 6, lineHeight: 1.45 }}>
                      {item.stipulations}
                    </div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 700, color: accent, marginBottom: 8 }}>
                    {item.costCity} CITYx
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={() => {
                        if (isCommitted) onModifyCommitted(item.id);
                        else onModifyMCE(item.id);
                        onClose();
                      }}
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.14)",
                        borderRadius: 10,
                        padding: "8px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#fff",
                        cursor: "pointer",
                      }}
                    >
                      Modify Offering
                    </button>
                    <button
                      onClick={() => setPendingCommitId(item.id)}
                      disabled={!canCommitOnchain}
                      style={{
                        background: canCommitOnchain ? accent : "rgba(255,255,255,0.08)",
                        border: "none",
                        borderRadius: 10,
                        padding: "8px 12px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: canCommitOnchain ? BG : MUTED,
                        cursor: canCommitOnchain ? "pointer" : "not-allowed",
                      }}
                    >
                      Commit Offering
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pendingCommitId && (
            <ConfirmDialog
              title="Commit Offering?"
              message={
                isCommitted
                  ? "This commitment will be locked, and your organization agrees to honor this commitment until the end of the Epoch."
                  : "This MCE commitment will be locked, and your organization agrees to honor this commitment until the end of the MCE Event."
              }
              confirmLabel="Confirm Commit"
              onConfirm={() => {
                if (isCommitted) onIssueCommitted(pendingCommitId);
                else onIssueMCE(pendingCommitId);
                setPendingCommitId(null);
                onClose();
              }}
              onCancel={() => setPendingCommitId(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ────────────────────────────────────────────────────────────

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
  warningOnly,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  warningOnly?: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 46,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.34)",
        padding: "0 20px",
      }}
      onClick={onCancel}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: SURFACE,
          borderRadius: 20,
          padding: "28px 24px",
          border: "1px solid rgba(255,107,157,0.2)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            fontSize: 24,
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          🔒
        </div>
        <div
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: "#fff",
            marginBottom: 12,
            textAlign: "center",
          }}
        >
          {title}
        </div>
        <p
          style={{
            fontSize: 13,
            color: MUTED,
            lineHeight: 1.6,
            margin: "0 0 24px",
            textAlign: "center",
          }}
        >
          {message}
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          {!warningOnly && (
            <button
              onClick={onCancel}
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.07)",
                border: "none",
                borderRadius: 12,
                padding: "12px 0",
                fontSize: 14,
                fontWeight: 600,
                color: MUTED,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          )}
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              background: warningOnly ? ACCENT : "rgba(255,107,157,0.15)",
              border: warningOnly ? "none" : "1px solid rgba(255,107,157,0.3)",
              borderRadius: 12,
              padding: "12px 0",
              fontSize: 14,
              fontWeight: 700,
              color: warningOnly ? BG : "#ff6b9d",
              cursor: "pointer",
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── QR Modal ─────────────────────────────────────────────────────────────────

function QRModal({ offering, onClose }: { offering: QROfferingData; onClose: () => void }) {
  const qrPayload = `citysync://redeem?offer=${offering.id}&redeemer=${FAKE_WALLETS.redeemer}&cost=${offering.costCity}`;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 44,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.34)",
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
          <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{offering.name}</div>
          <div style={{ fontSize: 13, color: MUTED }}>{offering.orgName}</div>
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
          <QRGrid seed={offering.id} />
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
          <div style={{ fontSize: 26, fontWeight: 700, color: ACCENT }}>{offering.costCity} CITYx</div>
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

function MyCityTab({
  posts,
  orgName,
  onCompose,
  onLearnMore,
}: {
  posts: Post[];
  orgName: string;
  onCompose: () => void;
  onLearnMore: (key: RedeemerLearnCardKey) => void;
}) {
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
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>MyCity Feed</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LearnMoreLink onClick={() => onLearnMore("mycity-feed")} />
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
        position: "absolute",
        inset: 0,
        zIndex: 40,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 430,
          height: "100%",
          position: "relative",
          pointerEvents: "auto",
        }}
        onClick={onClose}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.34)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 10,
            right: 10,
            bottom: "92px",
            maxHeight: "min(74vh, calc(100% - 98px))",
            overflowY: "auto",
            background: SURFACE,
            borderRadius: 22,
            padding: "24px 20px 24px",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 14px 34px rgba(0,0,0,0.35)",
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
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

function DashboardTab({
  redeemer,
  committedOfferings,
  mceOfferings,
  onLearnMore,
}: {
  redeemer: ReturnType<typeof useDemo>["state"]["redeemer"];
  committedOfferings: CustomOffering[];
  mceOfferings: MCECustomOffering[];
  onLearnMore: (key: RedeemerLearnCardKey) => void;
}) {
  const totalCityxBurned = redeemer.processedRedemptions.reduce((n, r) => n + r.costCity, 0);
  // Simulated network-level values
  const totalInCirculation = 125000;
  const networkBurned = totalCityxBurned + 4820; // includes other redeemers

  // Build per-offering breakdown — merge committed + mce, simulate redemptions
  const offeringStats: { name: string; type: string; redemptions: number; cityxBurned: number }[] = [
    ...committedOfferings.map((o, i) => ({
      name: o.name,
      type: "Committed",
      redemptions: i === 0 ? redeemer.processedRedemptions.length : 0,
      cityxBurned: i === 0 ? totalCityxBurned : 0,
    })),
    ...mceOfferings.map(o => ({
      name: o.name,
      type: "MCE",
      redemptions: 0,
      cityxBurned: 0,
    })),
  ];

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <LearnMoreLink onClick={() => onLearnMore("dashboard-metrics")} />
      </div>
      {/* Network Totals */}
      <SectionLabel text="Network Overview" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        <div style={{ ...surfaceCard, textAlign: "center", padding: "16px 12px" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: ACCENT }}>
            {(totalInCirculation - networkBurned).toLocaleString()}
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>CITYx in Circulation</div>
        </div>
        <div style={{ ...surfaceCard, textAlign: "center", padding: "16px 12px" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#ff6b9d" }}>{networkBurned.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Total CITYx Burned</div>
        </div>
        <div style={{ ...surfaceCard, textAlign: "center", padding: "16px 12px" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#DD9E33" }}>{redeemer.processedRedemptions.length}</div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Your Redemptions</div>
        </div>
        <div style={{ ...surfaceCard, textAlign: "center", padding: "16px 12px" }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#a78bfa" }}>{totalCityxBurned.toLocaleString()}</div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>Your CITYx Burned</div>
        </div>
      </div>

      {/* Per-offering breakdown */}
      {offeringStats.length > 0 ? (
        <>
          <SectionLabel text="Offerings Breakdown" />
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
            {offeringStats.map((o, i) => (
              <div
                key={i}
                style={{
                  ...surfaceCard,
                  padding: "14px 16px",
                  border: o.type === "MCE" ? "1px solid rgba(221,158,51,0.15)" : "1px solid rgba(52,238,182,0.1)",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{o.name}</div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      background: o.type === "MCE" ? "rgba(221,158,51,0.15)" : "rgba(52,238,182,0.1)",
                      color: o.type === "MCE" ? "#DD9E33" : ACCENT,
                      borderRadius: 20,
                      padding: "2px 8px",
                    }}
                  >
                    {o.type}
                  </span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderRadius: 8,
                      padding: "8px 10px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 18, fontWeight: 700, color: ACCENT }}>{o.redemptions}</div>
                    <div style={{ fontSize: 10, color: DIMMED, marginTop: 2 }}>Redemptions</div>
                  </div>
                  <div
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      borderRadius: 8,
                      padding: "8px 10px",
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#ff6b9d" }}>{o.cityxBurned}</div>
                    <div style={{ fontSize: 10, color: DIMMED, marginTop: 2 }}>CITYx Burned</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          emoji="📊"
          title="No offerings yet"
          desc="Add committed or MCE offerings to start tracking redemptions and CITYx burned per offering."
        />
      )}

      {/* How it works */}
      <SectionLabel text="How Redemption Works" />
      <div style={{ ...surfaceCard, display: "flex", flexDirection: "column", gap: 14 }}>
        {(
          [
            ["1️⃣", "Create offerings", "Add committed or MCE offerings with your CITYx pricing."],
            ["2️⃣", "Show QR code", "Participants scan your QR in person to initiate a redemption."],
            ["3️⃣", "Confirm in queue", "Redemption appears in your queue — review and process it."],
            ["4️⃣", "CITYx burned", "CITYx is burned from the citizen's wallet, reducing total supply."],
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

function MCEsTab({
  state,
  orgName,
  onLearnMore,
}: {
  state: ReturnType<typeof useDemo>["state"];
  orgName: string;
  onLearnMore: (key: RedeemerLearnCardKey) => void;
}) {
  const [section, setSection] = useState<"epoch1" | "epoch2">("epoch1");
  const [proposeOpen, setProposeOpen] = useState(false);
  const [localProposals, setLocalProposals] = useState<
    Array<{ id: string; title: string; description: string; goals: string; benefits: string; tags: string[] }>
  >([]);

  const [mceTitle, setMceTitle] = useState("");
  const [mceDesc, setMceDesc] = useState("");
  const [mceGoals, setMceGoals] = useState("");
  const [mceBenefits, setMceBenefits] = useState("");
  const [mceTags, setMceTags] = useState<string[]>([]);

  const MCE_TAGS = ["Environment", "Infrastructure", "Education", "Health", "Community", "Safety", "Economy"];

  const toggleMceTag = (tag: string) => {
    setMceTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  const submitProposal = () => {
    if (!mceTitle.trim() || !mceDesc.trim()) return;
    setLocalProposals(prev => [
      {
        id: `mce-local-${Date.now()}`,
        title: mceTitle.trim(),
        description: mceDesc.trim(),
        goals: mceGoals.trim(),
        benefits: mceBenefits.trim(),
        tags: mceTags,
      },
      ...prev,
    ]);
    setMceTitle("");
    setMceDesc("");
    setMceGoals("");
    setMceBenefits("");
    setMceTags([]);
    setProposeOpen(false);
  };

  const epoch1Mces = [...state.mces.filter(m => m.status === "Voting")].sort((a, b) => b.votesFor - a.votesFor);
  const totalVotesCast = Math.max(
    epoch1Mces.reduce((sum, m) => sum + m.votesFor, 0),
    1,
  );

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    color: "#fff",
    fontSize: 13,
    padding: "10px 12px",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 600,
    color: MUTED,
    textTransform: "uppercase" as const,
    letterSpacing: "0.07em",
    marginBottom: 6,
    display: "block",
  };

  return (
    <div style={{ padding: "24px 20px 100px" }}>
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
              color: section === s.key ? BG : MUTED,
              transition: "all 0.15s",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Epoch 1 — View only */}
      {section === "epoch1" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <LearnMoreLink onClick={() => onLearnMore("epoch1-voting")} />
          </div>

          {epoch1Mces.length === 0 ? (
            <EmptyState emoji="🗳️" title="No active proposals" desc="Epoch 1 voting proposals will appear here." />
          ) : (
            <div style={{ marginBottom: 8 }}>
              {epoch1Mces.map((mce, i) => {
                const pct = Math.round((mce.votesFor / totalVotesCast) * 100);
                return (
                  <div key={mce.id} style={{ ...surfaceCard, marginBottom: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 8,
                      }}
                    >
                      <div style={{ flex: 1, paddingRight: 10 }}>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 3 }}>
                          MCE-0{i + 1}
                        </div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "white", lineHeight: 1.35 }}>
                          {mce.title}
                        </div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>
                          by {mce.proposerName}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          padding: "3px 10px",
                          borderRadius: 20,
                          background: `${STATUS_COLOR[mce.status] ?? ACCENT}18`,
                          color: STATUS_COLOR[mce.status] ?? ACCENT,
                          flexShrink: 0,
                        }}
                      >
                        {mce.status}
                      </span>
                    </div>

                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, marginBottom: 12 }}>
                      {mce.description.slice(0, 120)}…
                    </div>

                    <div style={{ marginBottom: 4 }}>
                      <div
                        style={{ height: 5, background: "rgba(255,255,255,0.07)", borderRadius: 3, overflow: "hidden" }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: "#34eeb6",
                            borderRadius: 3,
                            transition: "width 0.2s",
                          }}
                        />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                          {mce.votesFor.toLocaleString()} votes
                        </span>
                        <span style={{ fontSize: 11, color: "#34eeb6" }}>{pct}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Epoch 2 — View + Create proposal */}
      {section === "epoch2" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <LearnMoreLink onClick={() => onLearnMore("next-epoch")} />
          </div>

          {/* Create proposal button */}
          <button
            onClick={() => setProposeOpen(true)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: "rgba(221,158,51,0.1)",
              border: "1px dashed rgba(221,158,51,0.4)",
              borderRadius: 14,
              padding: "14px 0",
              fontSize: 13,
              fontWeight: 600,
              color: ACCENT,
              cursor: "pointer",
              marginBottom: 16,
            }}
          >
            <IconPlus /> Create New MCE Proposal
          </button>

          {/* Local proposals (just submitted) */}
          {localProposals.map(p => (
            <div
              key={p.id}
              style={{
                ...surfaceCard,
                marginBottom: 12,
                border: "1px solid rgba(221,158,51,0.2)",
                background: "rgba(221,158,51,0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 20,
                    background: "rgba(52,238,182,0.12)",
                    color: ACCENT,
                    border: "1px solid rgba(52,238,182,0.25)",
                  }}
                >
                  Redeemer
                </span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>just now</span>
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "white", lineHeight: 1.35, marginBottom: 4 }}>
                {p.title}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>by {orgName}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, marginBottom: 10 }}>
                {p.description}
              </div>
              {p.tags.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {p.tags.map(tag => (
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
              )}
            </div>
          ))}

          {/* Existing epoch2 proposals */}
          {state.epoch2Proposals.map(prop => (
            <div key={prop.id} style={{ ...surfaceCard, marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: "2px 8px",
                    borderRadius: 20,
                    background: prop.proposerType === "org" ? "rgba(65,105,225,0.15)" : "rgba(52,238,182,0.12)",
                    color: prop.proposerType === "org" ? "#4169E1" : "#34eeb6",
                    border: `1px solid ${prop.proposerType === "org" ? "rgba(65,105,225,0.3)" : "rgba(52,238,182,0.25)"}`,
                  }}
                >
                  {prop.proposerType === "org" ? "Org" : "Citizen"}
                </span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                  {(() => {
                    const diff = Date.now() - new Date(prop.proposedAt).getTime();
                    const h = Math.floor(diff / 3600000);
                    if (h < 1) return "just now";
                    if (h < 24) return `${h}h ago`;
                    return `${Math.floor(h / 24)}d ago`;
                  })()}
                </span>
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
              {prop.tags.length > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
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
              )}
            </div>
          ))}
        </>
      )}

      {/* MCE Proposal Create Sheet */}
      {proposeOpen && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 40,
            display: "flex",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 430,
              height: "100%",
              position: "relative",
              pointerEvents: "auto",
            }}
            onClick={() => setProposeOpen(false)}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.34)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 10,
                right: 10,
                bottom: "92px",
                maxHeight: "min(74vh, calc(100% - 98px))",
                overflowY: "auto",
                background: SURFACE,
                borderRadius: 22,
                padding: "24px 20px 24px",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 14px 34px rgba(0,0,0,0.35)",
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
              <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>New MCE Proposal</div>
              <div style={{ fontSize: 13, color: MUTED, marginBottom: 20, lineHeight: 1.5 }}>
                Submit a proposal for community consideration. Strong proposals include clear goals and measurable
                benefits.
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={labelStyle}>Title *</label>
                  <input
                    value={mceTitle}
                    onChange={e => setMceTitle(e.target.value)}
                    placeholder="e.g. Eastside Green Corridor Initiative"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Description *</label>
                  <textarea
                    value={mceDesc}
                    onChange={e => setMceDesc(e.target.value)}
                    placeholder="What is this proposal about? Why does the city need it?"
                    rows={3}
                    style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Goals</label>
                  <textarea
                    value={mceGoals}
                    onChange={e => setMceGoals(e.target.value)}
                    placeholder="What specific outcomes will this achieve?"
                    rows={2}
                    style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Community Benefits</label>
                  <textarea
                    value={mceBenefits}
                    onChange={e => setMceBenefits(e.target.value)}
                    placeholder="Who benefits and how? Be specific about impact."
                    rows={2}
                    style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Tags</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {MCE_TAGS.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleMceTag(tag)}
                        style={{
                          padding: "5px 12px",
                          borderRadius: 20,
                          border: mceTags.includes(tag) ? `1px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.12)",
                          background: mceTags.includes(tag) ? `${ACCENT}22` : "rgba(255,255,255,0.04)",
                          color: mceTags.includes(tag) ? ACCENT : MUTED,
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={submitProposal}
                disabled={!mceTitle.trim() || !mceDesc.trim()}
                style={{
                  width: "100%",
                  background: mceTitle.trim() && mceDesc.trim() ? ACCENT : "rgba(255,255,255,0.08)",
                  border: "none",
                  borderRadius: 14,
                  padding: "14px 0",
                  fontSize: 14,
                  fontWeight: 700,
                  color: mceTitle.trim() && mceDesc.trim() ? BG : MUTED,
                  cursor: mceTitle.trim() && mceDesc.trim() ? "pointer" : "not-allowed",
                  marginTop: 20,
                }}
              >
                Submit Proposal
              </button>
            </div>
          </div>
        </div>
      )}
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
