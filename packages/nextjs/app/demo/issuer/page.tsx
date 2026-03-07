"use client";

import React, { useRef, useState } from "react";
import AppShell from "../_components/AppShell";
import { useDemo } from "../_context/DemoContext";
import { FAKE_WALLETS, MOCK_TASKS, Post, PostCategory, Task } from "../_data/mockData";

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconBuilding = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M3 21h18M6 21V7l6-4 6 4v14" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <path d="M10 21v-4h4v4" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

const IconClipboard = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path
      d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
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
  { key: "profile", label: "Profile", icon: <IconBuilding /> },
  { key: "tasks", label: "Tasks", icon: <IconClipboard /> },
  { key: "mycity", label: "MyCity", icon: <IconCity /> },
  { key: "dashboard", label: "Dashboard", icon: <IconDashboard /> },
  { key: "mces", label: "MCEs", icon: <IconBolt /> },
];

const CATALOG_TASKS = MOCK_TASKS.filter(t => !t.isMCE && !t.isOnboarding);

const ACCENT = "#DD9E33";
const SURFACE = "#1E1E2C";
const BG = "#15151E";
const MUTED = "rgba(255,255,255,0.45)";
const DIMMED = "rgba(255,255,255,0.25)";

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

function PanelStats({ stats, accent }: { stats: { label: string; value: string | number }[]; accent: string }) {
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

function getIssuerPanels(
  activeTab: string,
  state: ReturnType<typeof useDemo>["state"],
): { left: React.ReactNode; right: React.ReactNode } {
  const { issuer, mces, posts, availableTasks } = state;
  const totalPending = issuer.tasks.reduce((n, t) => n + t.pendingCompletions.length, 0);
  const totalVerified = issuer.tasks.reduce((n, t) => n + t.verifiedCount, 0);
  const catalogSize = availableTasks.filter(t => !t.isMCE && !t.isOnboarding).length;
  const totalParticipants = mces.reduce((n, m) => n + m.participantCount, 0);

  switch (activeTab) {
    case "profile":
      return {
        left: (
          <PanelCard label="Issuer Organization" title="Your Issuing Authority" accent={ACCENT}>
            <p style={{ margin: "0 0 12px" }}>
              As a certified Issuer, you design and deploy community tasks. Your wallet signature is the trust anchor —
              when you verify a completion, CITYx credits and VOTE tokens are minted on-chain with no intermediary.
            </p>
            <p style={{ margin: 0 }}>
              Tasks you post appear to all participants in the Explore tab. You control slot counts and choose from the
              admin-curated catalog to ensure quality.
            </p>
          </PanelCard>
        ),
        right: (
          <PanelStats
            accent={ACCENT}
            stats={[
              { label: "Tasks Created", value: issuer.totalTasksIssued },
              { label: "Credits Issued", value: `${issuer.totalCreditsIssued} CITYx` },
              { label: "Pending Verifications", value: totalPending },
              { label: "Catalog Tasks Available", value: catalogSize },
            ]}
          />
        ),
      };

    case "tasks":
      return {
        left: (
          <PanelCard label="Task Catalog" title="Admin-Curated Quality" accent={ACCENT}>
            <p style={{ margin: "0 0 12px" }}>
              All tasks pass a moderation queue before appearing here. This prevents spam and ensures every task
              represents genuine civic value. You pick which to post and how many participant slots to open.
            </p>
            <p style={{ margin: 0 }}>
              When a participant submits a completion, it lands in your Pending queue. Verify it from your wallet to
              release their credits instantly.
            </p>
          </PanelCard>
        ),
        right: (
          <PanelStats
            accent={ACCENT}
            stats={[
              { label: "Catalog Size", value: catalogSize },
              { label: "Your Posted Tasks", value: issuer.tasks.length },
              { label: "Pending Completions", value: totalPending },
              { label: "Total Verified", value: totalVerified },
            ]}
          />
        ),
      };

    case "mycity":
      return {
        left: (
          <PanelCard label="City Feed" title="Your Voice in the City" accent={ACCENT}>
            <p style={{ margin: "0 0 12px" }}>
              Post announcements, events, and opportunities directly to all participants and orgs. Your posts appear in
              the city-wide MyCity feed — your primary channel for outreach and community building.
            </p>
            <p style={{ margin: 0 }}>
              Use categories to help participants find what&apos;s relevant to them. Events and Opportunities tend to
              drive the most engagement.
            </p>
          </PanelCard>
        ),
        right: (
          <PanelStats
            accent={ACCENT}
            stats={[
              { label: "Posts in Feed", value: posts.length },
              { label: "Active Orgs Posting", value: new Set(posts.map(p => p.authorId)).size },
              { label: "Post Categories", value: 4 },
              { label: "Your Posted Tasks", value: issuer.tasks.length },
            ]}
          />
        ),
      };

    case "dashboard":
      return {
        left: (
          <PanelCard label="Impact Dashboard" title="Your On-Chain Ledger" accent={ACCENT}>
            <p style={{ margin: "0 0 12px" }}>
              Every credit you&apos;ve issued is permanently recorded on Base. This dashboard reflects your real impact:
              tasks deployed, completions verified, and civic value created in the city.
            </p>
            <p style={{ margin: 0 }}>
              Your completion rate reflects how quickly you process pending verifications. Participants see your
              organization&apos;s track record when choosing tasks.
            </p>
          </PanelCard>
        ),
        right: (
          <PanelStats
            accent={ACCENT}
            stats={[
              { label: "Tasks Posted", value: issuer.totalTasksIssued },
              { label: "CITYx Issued", value: issuer.totalCreditsIssued },
              { label: "Total Verified", value: totalVerified },
              { label: "Pending Now", value: totalPending },
            ]}
          />
        ),
      };

    case "mces":
      return {
        left: (
          <PanelCard label="MCE System" title="Mass Coordination Events" accent={ACCENT}>
            <p style={{ margin: "0 0 12px" }}>
              MCEs are city-wide initiatives voted on by VOTE token holders. As a certified Issuer, you can propose
              MCEs. If a proposal passes, the city mobilizes around a shared goal.
            </p>
            <p style={{ margin: 0 }}>
              MCE participants earn a separate MCECredit stream — redeemable at an expanded set of venues that opted
              into the MCE program.
            </p>
          </PanelCard>
        ),
        right: (
          <PanelStats
            accent={ACCENT}
            stats={[
              { label: "Total MCEs", value: mces.length },
              { label: "Currently Voting", value: mces.filter(m => m.status === "Voting").length },
              { label: "Active MCEs", value: mces.filter(m => m.status === "Active").length },
              { label: "Total Participants", value: totalParticipants.toLocaleString() },
            ]}
          />
        ),
      };

    default:
      return { left: null, right: null };
  }
}

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
        background: "#1a2e1a",
        border: "1px solid rgba(52,238,182,0.35)",
        borderRadius: 12,
        padding: "12px 20px",
        color: "#34eeb6",
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

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function IssuerApp() {
  const { state, setRole, issuerCreateTask, issuerVerifyCompletion } = useDemo();
  const [activeTab, setActiveTab] = useState("profile");
  const [createSheet, setCreateSheet] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [localPosts, setLocalPosts] = useState<Post[]>([]);
  const [toast, setToast] = useState<string | null>(null);

  const { issuer, mces } = state;
  const { left: leftPanel, right: rightPanel } = getIssuerPanels(activeTab, state);

  React.useEffect(() => {
    setRole("issuer");
  }, [setRole]);

  const allPosts = [...localPosts, ...state.posts];
  const totalPending = issuer.tasks.reduce((n, t) => n + t.pendingCompletions.length, 0);

  const handleVerify = (taskId: string, citizen: string) => {
    issuerVerifyCompletion(taskId, citizen);
    setToast("Verification complete — credits minted!");
  };

  const handleCreateTask = (task: Task) => {
    issuerCreateTask(task);
    setCreateSheet(false);
    setToast("Task posted to the network!");
  };

  const handleCreatePost = (post: Post) => {
    setLocalPosts(prev => [post, ...prev]);
    setComposeOpen(false);
    setToast("Post published to MyCity!");
  };

  return (
    <>
      <AppShell
        role="issuer"
        orgName={issuer.orgName}
        address={FAKE_WALLETS.issuer}
        cityBalance={0}
        voteBalance={0}
        mceBalance={0}
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        accentColor={ACCENT}
        title="Issuer"
        leftPanel={leftPanel}
        rightPanel={rightPanel}
      >
        {activeTab === "profile" && <ProfileTab issuer={issuer} totalPending={totalPending} />}
        {activeTab === "tasks" && (
          <TasksTab
            issuerTasks={issuer.tasks}
            totalPending={totalPending}
            onCreateOpen={() => setCreateSheet(true)}
            onVerify={handleVerify}
          />
        )}
        {activeTab === "mycity" && (
          <MyCityTab posts={allPosts} orgName={issuer.orgName} onCompose={() => setComposeOpen(true)} />
        )}
        {activeTab === "dashboard" && <DashboardTab issuer={issuer} />}
        {activeTab === "mces" && <MCEsTab mces={mces} />}
      </AppShell>

      {createSheet && <CreateTaskSheet onClose={() => setCreateSheet(false)} onCreate={handleCreateTask} />}

      {composeOpen && (
        <ComposePostSheet orgName={issuer.orgName} onClose={() => setComposeOpen(false)} onPost={handleCreatePost} />
      )}

      {toast && <SuccessToast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab({
  issuer,
  totalPending,
}: {
  issuer: ReturnType<typeof useDemo>["state"]["issuer"];
  totalPending: number;
}) {
  const { dispatch } = useDemo();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(issuer.orgName);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = () => {
    setDraft(issuer.orgName);
    setEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const saveEdit = () => {
    if (draft.trim()) {
      dispatch({ type: "ISSUER_REGISTER", orgName: draft.trim() });
    }
    setEditing(false);
  };

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      {/* Welcome banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #2a2000 0%, #1E1E2C 100%)",
          border: "1px solid rgba(221,158,51,0.3)",
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
            color: "rgba(221,158,51,0.6)",
            marginBottom: 4,
          }}
        >
          Certified Issuer Organization
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
                border: "1px solid rgba(221,158,51,0.5)",
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
            <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>{issuer.orgName || "Your Organization"}</div>
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
          {FAKE_WALLETS.issuer}
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <StatusPill label="Verified Issuer" color={ACCENT} />
          <StatusPill label="Base Sepolia" color={DIMMED} />
        </div>
      </div>

      {/* Role description */}
      <div
        style={{
          background: "rgba(221,158,51,0.06)",
          border: "1px solid rgba(221,158,51,0.15)",
          borderRadius: 14,
          padding: "14px 16px",
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4 }}>Your Role as an Issuer</div>
        <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, margin: 0 }}>
          You post volunteer tasks, set CITYx and VOTE credit rewards, and verify completions from your wallet. When you
          verify a completion, CITYx credits and VOTE tokens are minted to the participant on-chain.
        </p>
      </div>

      {/* Stats */}
      <SectionLabel text="Issuance Stats" />
      <div style={{ ...surfaceCard, padding: 0, marginBottom: 20, overflow: "hidden" }}>
        <StatRow label="Tasks Created" value={issuer.totalTasksIssued} />
        <StatRow label="Credits Issued" value={issuer.totalCreditsIssued} suffix="CITYx" border />
        <StatRow label="Pending Verifications" value={totalPending} border accent={totalPending > 0} />
      </div>

      {/* Active tasks quick view */}
      {issuer.tasks.length > 0 && (
        <>
          <SectionLabel text="Active Tasks" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {issuer.tasks.slice(0, 3).map(t => (
              <div
                key={t.id}
                style={{
                  ...surfaceCard,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{t.title}</div>
                  <div style={{ fontSize: 11, color: MUTED }}>
                    {t.verifiedCount} verified · {t.pendingCompletions.length} pending
                  </div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT }}>{t.credits} CITYx</div>
              </div>
            ))}
          </div>
        </>
      )}

      {issuer.tasks.length === 0 && (
        <EmptyState
          emoji="📋"
          title="Ready to create tasks?"
          desc="Head to the Tasks tab to browse the admin-approved catalog and post your first opportunity."
        />
      )}
    </div>
  );
}

// ─── Tasks Tab ────────────────────────────────────────────────────────────────

function TasksTab({
  issuerTasks,
  totalPending,
  onCreateOpen,
  onVerify,
}: {
  issuerTasks: ReturnType<typeof useDemo>["state"]["issuer"]["tasks"];
  totalPending: number;
  onCreateOpen: () => void;
  onVerify: (taskId: string, citizen: string) => void;
}) {
  const [view, setView] = useState<"my" | "pending">("my");
  const pendingAll = issuerTasks.flatMap(t => t.pendingCompletions.map(addr => ({ task: t, citizen: addr })));

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      {/* Segment control */}
      <div style={{ background: SURFACE, borderRadius: 16, padding: 4, display: "flex", marginBottom: 20 }}>
        {(["my", "pending"] as const).map(v => (
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
            {v === "my" ? `My Tasks (${issuerTasks.length})` : `Pending (${totalPending})`}
          </button>
        ))}
      </div>

      {view === "my" && (
        <>
          {/* Create CTA */}
          <button
            onClick={onCreateOpen}
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
            <IconPlus /> Add Task from Catalog
          </button>

          {issuerTasks.length === 0 ? (
            <EmptyState
              emoji="📭"
              title="No tasks yet"
              desc="Post a task from the catalog to start receiving completions from participants."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {issuerTasks.map(t => (
                <div key={t.id} style={{ ...surfaceCard }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 2 }}>{t.title}</div>
                      <div style={{ fontSize: 11, color: MUTED }}>
                        {t.category} · {t.estimatedTime}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 12 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: ACCENT }}>{t.credits} CITYx</div>
                      <div style={{ fontSize: 11, color: DIMMED }}>+{t.voteTokens} VOTE</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 12, fontSize: 12, color: MUTED }}>
                    <span>✓ {t.verifiedCount} verified</span>
                    <span>⏳ {t.pendingCompletions.length} pending</span>
                    <span>
                      👥 {t.slotsRemaining}/{t.slots}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {view === "pending" && (
        <>
          {pendingAll.length === 0 ? (
            <EmptyState
              emoji="🎉"
              title="All clear!"
              desc="No pending verifications. Create tasks and participants will start claiming them."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {pendingAll.map(({ task, citizen }) => (
                <div
                  key={`${task.id}-${citizen}`}
                  style={{
                    background: SURFACE,
                    border: "1px solid rgba(221,158,51,0.2)",
                    borderRadius: 16,
                    padding: 16,
                  }}
                >
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{task.title}</div>
                    <div style={{ fontFamily: "monospace", fontSize: 11, color: MUTED }}>Citizen: {citizen}</div>
                  </div>

                  <div
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: 10,
                      padding: "8px 12px",
                      marginBottom: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 12,
                      color: MUTED,
                    }}
                  >
                    <span>Reward on verification</span>
                    <span>
                      <span style={{ color: ACCENT }}>{task.credits} CITYx</span>
                      {" + "}
                      <span style={{ color: "#4169E1" }}>{task.voteTokens} VOTE</span>
                    </span>
                  </div>

                  <button
                    onClick={() => onVerify(task.id, citizen)}
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
                    Verify & Mint Credits
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── Create Task Sheet ────────────────────────────────────────────────────────

function CreateTaskSheet({ onClose, onCreate }: { onClose: () => void; onCreate: (task: Task) => void }) {
  const [selected, setSelected] = useState<Task | null>(null);
  const [step, setStep] = useState<"pick" | "review">("pick");

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
            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Task Catalog</div>
            <div style={{ fontSize: 13, color: MUTED, marginBottom: 20 }}>
              Admin-approved tasks ready to post. Choose one to review.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {CATALOG_TASKS.map(task => (
                <button
                  key={task.id}
                  onClick={() => {
                    setSelected(task);
                    setStep("review");
                  }}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 14,
                    padding: 14,
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 3 }}>{task.title}</div>
                    <div style={{ fontSize: 11, color: MUTED }}>
                      {task.category} · {task.estimatedTime}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT, flexShrink: 0, marginLeft: 12 }}>
                    {task.credits} CITYx
                  </div>
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
              ← Back to catalog
            </button>

            <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{selected.title}</div>
            <div style={{ fontSize: 12, color: ACCENT, marginBottom: 14 }}>{selected.category}</div>
            <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6, marginBottom: 20 }}>{selected.description}</p>

            {/* Reward display */}
            <div
              style={{
                background: "rgba(221,158,51,0.07)",
                border: "1px solid rgba(221,158,51,0.2)",
                borderRadius: 14,
                padding: "16px 0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
                marginBottom: 20,
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: ACCENT }}>{selected.credits}</div>
                <div style={{ fontSize: 11, color: MUTED }}>CITYx per completion</div>
              </div>
              <div style={{ width: 1, height: 40, background: "rgba(255,255,255,0.1)" }} />
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 700, color: "#4169E1" }}>{selected.voteTokens}</div>
                <div style={{ fontSize: 11, color: MUTED }}>VOTE per completion</div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
              <DetailItem icon="📍" label="Location" value={selected.location} />
              <DetailItem icon="⏱" label="Duration" value={selected.estimatedTime} />
              <DetailItem icon="👥" label="Slots" value={`${selected.slots} available`} />
            </div>

            <button
              onClick={() => onCreate({ ...selected, id: `task-issued-${Date.now()}` })}
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
              Post This Task
            </button>
          </>
        ) : null}
      </div>
    </div>
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

      {/* Sort tabs */}
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
                border: isOwn ? "1px solid rgba(221,158,51,0.25)" : "1px solid rgba(255,255,255,0.06)",
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
                          background: "rgba(221,158,51,0.15)",
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
      id: `post-local-${Date.now()}`,
      authorName: orgName,
      authorId: FAKE_WALLETS.issuer,
      authorType: "issuer",
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
          placeholder="Share an update, event, or opportunity with the city..."
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

function DashboardTab({ issuer }: { issuer: ReturnType<typeof useDemo>["state"]["issuer"] }) {
  const totalPending = issuer.tasks.reduce((n, t) => n + t.pendingCompletions.length, 0);
  const totalVerified = issuer.tasks.reduce((n, t) => n + t.verifiedCount, 0);
  const completionRate =
    totalPending + totalVerified > 0 ? Math.round((totalVerified / (totalPending + totalVerified)) * 100) : 0;

  const categoryBreakdown = issuer.tasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <SectionLabel text="Performance" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
        <MetricCard label="Tasks Posted" value={issuer.totalTasksIssued} color={ACCENT} />
        <MetricCard label="CITYx Issued" value={issuer.totalCreditsIssued} color="#4169E1" />
        <MetricCard label="Verifications" value={totalVerified} color="#34eeb6" />
        <MetricCard label="Completion Rate" value={`${completionRate}%`} color="#a78bfa" />
      </div>

      {Object.keys(categoryBreakdown).length > 0 && (
        <>
          <SectionLabel text="Tasks by Category" />
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
                  {count} task{count > 1 ? "s" : ""}
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      {issuer.totalTasksIssued === 0 && (
        <EmptyState
          emoji="📊"
          title="No data yet"
          desc="Create tasks in the Tasks tab to see performance analytics here."
        />
      )}

      <SectionLabel text="How It Works" />
      <div style={{ ...surfaceCard, display: "flex", flexDirection: "column", gap: 14 }}>
        {(
          [
            ["1️⃣", "Post a task", "Choose from the admin-curated catalog and publish it to participants."],
            ["2️⃣", "Citizens claim", "Participants claim a slot and complete the task in the real world."],
            ["3️⃣", "You verify", "Review completion evidence and click Verify — this triggers on-chain minting."],
            ["4️⃣", "Credits minted", "CITYx and VOTE tokens land in the citizen's wallet automatically."],
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

function MCEsTab({ mces }: { mces: ReturnType<typeof useDemo>["state"]["mces"] }) {
  return (
    <div style={{ padding: "24px 20px 100px" }}>
      <div
        style={{
          background: "rgba(221,158,51,0.06)",
          border: "1px solid rgba(221,158,51,0.15)",
          borderRadius: 14,
          padding: "14px 16px",
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4 }}>What is an MCE?</div>
        <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, margin: 0 }}>
          Mass Coordination Events are city-wide initiatives proposed by certified issuers and voted on by VOTE token
          holders. If approved, the city enters a planning phase before activation. MCE tasks earn MCE Credits —
          redeemable at a wider set of venues.
        </p>
      </div>

      <SectionLabel text={`All MCEs (${mces.length})`} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {mces.map(mce => (
          <MCECard key={mce.id} mce={mce} />
        ))}
      </div>
    </div>
  );
}

// ─── MCE Card ─────────────────────────────────────────────────────────────────

function MCECard({ mce }: { mce: ReturnType<typeof useDemo>["state"]["mces"][number] }) {
  const statusColor = STATUS_COLOR[mce.status] ?? "#4169E1";
  const total = mce.votesFor + mce.votesAgainst;
  const forPct = total > 0 ? (mce.votesFor / total) * 100 : 50;

  return (
    <div style={{ ...surfaceCard }}>
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
        {mce.proposerName} · {mce.taskCount} tasks · {mce.mceCreditsPerTask} MCE/task
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

      {mce.participantCount > 0 && (
        <div style={{ fontSize: 11, color: DIMMED, marginTop: 8 }}>
          {mce.participantCount.toLocaleString()} participants enrolled
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

function DetailItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: 12 }}>
      <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{value}</div>
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
