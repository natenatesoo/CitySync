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

const IconVerify = () => (
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
  { key: "verify", label: "Verify", icon: <IconVerify /> },
  { key: "mces", label: "MCEs", icon: <IconBolt /> },
];

const CATALOG_TASKS = MOCK_TASKS.filter(t => !t.isMCE && !t.isOnboarding);

const EPOCH1_CAP = 312;

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
          <>
            <PanelCard label="Issuer Organization" title="Issuing Authority" accent={ACCENT}>
              <p style={{ margin: "0 0 12px" }}>
                Your organization has been certified to issue CITYx credits in exchange for verified civic
                contributions. This role sits at the heart of the CitySync protocol.
              </p>
              <p style={{ margin: 0 }}>
                As a trusted node in the network, your verification signature is what triggers token issuance on-chain —
                there is no central authority minting these credits, only verified issuers like you.
              </p>
            </PanelCard>
            <PanelCard label="Issuance Cap" title="CITYx Budget" accent={ACCENT}>
              <p style={{ margin: "0 0 12px" }}>
                Each organization is allocated a CITYx issuance cap per epoch. This cap determines the maximum CITYx you
                can distribute across all tasks you post within the epoch window.
              </p>
              <p style={{ margin: 0 }}>
                Managing your budget means balancing task frequency and credit amounts to maximize civic engagement
                within your allocation.
              </p>
            </PanelCard>
          </>
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
          <>
            <PanelCard label="Task Management" title="Task Catalog" accent={ACCENT}>
              <p style={{ margin: "0 0 12px" }}>
                All tasks in this catalog have passed a preliminary moderation review to ensure they represent genuine
                civic value.
              </p>
              <p style={{ margin: 0 }}>
                You can add any approved task directly to your task list, set your available slots, and begin receiving
                completions from participants immediately.
              </p>
            </PanelCard>
            <PanelCard label="Task Approvals" title="Proposing a New Task" accent={ACCENT}>
              <p style={{ margin: "0 0 12px" }}>
                Don&apos;t see a task that fits your organization&apos;s civic goals? You can propose a new task for
                admin review.
              </p>
              <p style={{ margin: 0 }}>
                Submitted proposals enter a moderation queue where city administrators evaluate civic impact, credit
                alignment, and task feasibility before approving it for the catalog.
              </p>
            </PanelCard>
          </>
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

    case "verify":
      return {
        left: (
          <>
            <PanelCard label="Issued Tasks" title="Open Task Pool" accent={ACCENT}>
              <p style={{ margin: 0 }}>
                Issued tasks are live in the participant catalog — citizens can see and claim them. You can remove a
                task at any time to close off new claims. Tasks already claimed will still be completable by those
                participants.
              </p>
            </PanelCard>
            <PanelCard label="Claimed Tasks" title="In Progress" accent={ACCENT}>
              <p style={{ margin: 0 }}>
                Once a participant claims a task, it moves to Claimed. They&apos;ve committed to showing up and
                executing. Use the notification reminder to nudge participants who may need a heads-up before the
                scheduled time.
              </p>
            </PanelCard>
            <PanelCard label="Completed Tasks" title="Awaiting Verification" accent={ACCENT}>
              <p style={{ margin: 0 }}>
                When a participant marks a task complete, it enters your verification queue. Review the submission and
                click Verify to trigger on-chain minting — CITYx and VOTE tokens are issued to the participant
                immediately upon your approval.
              </p>
            </PanelCard>
          </>
        ),
        right: (
          <PanelStats
            accent={ACCENT}
            stats={[
              { label: "Tasks Issued", value: issuer.totalTasksIssued },
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
          <>
            <PanelCard label="MCE Proposals" title="Your Role in MCE Creation" accent={ACCENT}>
              <p style={{ margin: "0 0 12px" }}>
                As a certified Issuer Organization, you are one of the most informed entities in the city about what
                civic work is actually needed on the ground. Use that knowledge to submit MCE proposals that reflect
                real community priorities — not just what sounds good, but what can actually be executed.
              </p>
              <p style={{ margin: 0 }}>
                Epoch 2 is your window to propose. Draft your proposal with a clear title, description, goals, and
                expected benefits. The most-liked proposals are reviewed by the Representative Issuer Committee for
                entry into the next voting epoch.
              </p>
            </PanelCard>
            <PanelCard label="Planning & Issuance" title="Winning MCE Responsibility" accent={ACCENT}>
              <p style={{ margin: 0 }}>
                When an MCE proposal wins the Epoch 1 vote, the city enters a Planning Phase. Issuer Organizations are
                responsible for designing and submitting the tasks that will execute on that proposal. You then issue
                those tasks during the Active Phase — participants earn MCE Credits for completing them, redeemable at
                an expanded set of Redeemer venues that opt into the MCE program.
              </p>
            </PanelCard>
          </>
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

interface ProposedTask {
  id: string;
  title: string;
  estimatedTime: string;
  location: string;
  date: string;
  successCriteria: string;
  creditRate: number;
  credentials: string;
  credits: number;
  tags: string[];
}

export default function IssuerApp() {
  const { state, setRole, issuerCreateTask, issuerVerifyCompletion } = useDemo();
  const [activeTab, setActiveTab] = useState("profile");
  const [createSheet, setCreateSheet] = useState(false);
  const [proposeSheet, setProposeSheet] = useState(false);
  const [composeOpen, setComposeOpen] = useState(false);
  const [localPosts, setLocalPosts] = useState<Post[]>([]);
  const [proposedTasks, setProposedTasks] = useState<ProposedTask[]>([]);
  const [approvedCatalogTasks, setApprovedCatalogTasks] = useState<Task[]>([]);
  const [issueTaskId, setIssueTaskId] = useState<string | null>(null);
  const [modifyTaskId, setModifyTaskId] = useState<string | null>(null);
  const [removedTaskIds, setRemovedTaskIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);

  const { issuer } = state;
  const { left: leftPanel, right: rightPanel } = getIssuerPanels(activeTab, state);

  React.useEffect(() => {
    setRole("issuer");
  }, [setRole]);

  const allPosts = [...localPosts, ...state.posts];
  const totalPending = issuer.tasks.reduce((n, t) => n + t.pendingCompletions.length, 0);
  const creditsCommitted = issuer.tasks.reduce((sum, t) => sum + t.credits, 0);

  const handleVerify = (taskId: string, citizen: string) => {
    issuerVerifyCompletion(taskId, citizen);
    setToast("Verification complete — credits minted!");
  };

  const handleCreateTask = (task: Task) => {
    issuerCreateTask(task);
    setCreateSheet(false);
    setToast("Task posted to the network!");
  };

  const handleProposeTask = (proposed: ProposedTask) => {
    setProposedTasks(prev => [proposed, ...prev]);
    setProposeSheet(false);
    setToast("Task proposal submitted for review!");
  };

  const handleApproveProposed = (proposed: ProposedTask) => {
    // Dedup check: same title already in approved catalog or issued tasks
    const dupInCatalog = approvedCatalogTasks.some(t => t.title.toLowerCase() === proposed.title.toLowerCase());
    const dupInIssued = issuer.tasks.some(t => t.title.toLowerCase() === proposed.title.toLowerCase());
    if (dupInCatalog || dupInIssued) {
      setToast("A task with this title already exists in the catalog.");
      return;
    }
    const task: Task = {
      id: `task-approved-${Date.now()}`,
      title: proposed.title,
      description: proposed.successCriteria || "Community civic task proposed by organization.",
      category: "Community",
      estimatedTime: proposed.estimatedTime,
      location: proposed.location || "TBD",
      credits: proposed.credits,
      voteTokens: proposed.credits,
      slots: 5,
      slotsRemaining: 5,
      issuerName: issuer.orgName,
      issuerId: FAKE_WALLETS.issuer,
      tags: proposed.tags,
      taskDate: proposed.date || "TBD",
      successCriteria: proposed.successCriteria || "",
      creditRatePerHr: proposed.creditRate,
      credentials: proposed.credentials || "None",
      isMCE: false,
      isOnboarding: false,
    };
    setApprovedCatalogTasks(prev => [task, ...prev]);
    setProposedTasks(prev => prev.filter(p => p.id !== proposed.id));
    setToast("Task approved and added to your catalog!");
  };

  const handleIssueTask = (task: Task, slots: number) => {
    issuerCreateTask({
      ...task,
      id: `task-issued-${Date.now()}`,
      slots,
      slotsRemaining: slots,
    });
    setApprovedCatalogTasks(prev => prev.filter(t => t.id !== task.id));
    setIssueTaskId(null);
    setToast("Task issued — now visible to participants!");
  };

  const handleModifyApproved = (taskId: string, updates: { location: string; taskDate: string }) => {
    setApprovedCatalogTasks(prev => prev.map(t => (t.id === taskId ? { ...t, ...updates } : t)));
    setModifyTaskId(null);
    setToast("Task updated.");
  };

  const handleRemoveIssuedTask = (taskId: string) => {
    setRemovedTaskIds(prev => new Set([...prev, taskId]));
    setToast("Task removed from open task pool.");
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
        {activeTab === "profile" && (
          <ProfileTab issuer={issuer} totalPending={totalPending} creditsCommitted={creditsCommitted} />
        )}
        {activeTab === "tasks" && (
          <TasksTab
            issuerTasks={issuer.tasks}
            totalPending={totalPending}
            creditsCommitted={creditsCommitted}
            onCreateOpen={() => setCreateSheet(true)}
            onProposeOpen={() => setProposeSheet(true)}
            onVerify={handleVerify}
            proposedTasks={proposedTasks}
            onApproveProposed={handleApproveProposed}
            approvedCatalogTasks={approvedCatalogTasks}
            onIssueTask={id => setIssueTaskId(id)}
            onModifyTask={id => setModifyTaskId(id)}
          />
        )}
        {activeTab === "mycity" && (
          <MyCityTab posts={allPosts} orgName={issuer.orgName} onCompose={() => setComposeOpen(true)} />
        )}
        {activeTab === "verify" && (
          <VerifyTab
            issuerTasks={issuer.tasks}
            claimedTaskIds={state.participant.claimedTaskIds}
            removedTaskIds={removedTaskIds}
            onRemoveTask={handleRemoveIssuedTask}
            onVerify={handleVerify}
          />
        )}
        {activeTab === "mces" && <MCEsTab state={state} orgName={issuer.orgName} />}
      </AppShell>

      {createSheet && (
        <CreateTaskSheet
          onClose={() => setCreateSheet(false)}
          onCreate={handleCreateTask}
          creditsCommitted={creditsCommitted}
          approvedCatalogTasks={approvedCatalogTasks}
        />
      )}

      {proposeSheet && (
        <ProposeTaskSheet
          onClose={() => setProposeSheet(false)}
          onPropose={handleProposeTask}
          creditsCommitted={creditsCommitted}
        />
      )}

      {composeOpen && (
        <ComposePostSheet orgName={issuer.orgName} onClose={() => setComposeOpen(false)} onPost={handleCreatePost} />
      )}

      {issueTaskId &&
        (() => {
          const task = approvedCatalogTasks.find(t => t.id === issueTaskId);
          return task ? (
            <IssueTaskPopup
              task={task}
              onClose={() => setIssueTaskId(null)}
              onIssue={slots => handleIssueTask(task, slots)}
            />
          ) : null;
        })()}

      {modifyTaskId &&
        (() => {
          const task = approvedCatalogTasks.find(t => t.id === modifyTaskId);
          return task ? (
            <ModifyTaskSheet
              task={task}
              onClose={() => setModifyTaskId(null)}
              onSave={updates => handleModifyApproved(task.id, updates)}
            />
          ) : null;
        })()}

      {toast && <SuccessToast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab({
  issuer,
  totalPending,
  creditsCommitted,
}: {
  issuer: ReturnType<typeof useDemo>["state"]["issuer"];
  totalPending: number;
  creditsCommitted: number;
}) {
  const { dispatch } = useDemo();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(issuer.orgName);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLogoUrl(url);
    }
  };

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
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            {/* Logo upload */}
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              style={{ display: "none" }}
            />
            <button
              onClick={() => logoInputRef.current?.click()}
              title="Upload organization logo"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: logoUrl ? "transparent" : "rgba(221,158,51,0.12)",
                border: `1px dashed ${logoUrl ? "transparent" : "rgba(221,158,51,0.4)"}`,
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
                <span style={{ fontSize: 18 }}>🏛</span>
              )}
            </button>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>
                {issuer.orgName || "Your Organization"}
              </div>
              <div style={{ fontSize: 10, color: "rgba(221,158,51,0.5)", marginTop: 1 }}>Tap icon to upload logo</div>
            </div>
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

      {/* Epoch 1 Issuance Allocation */}
      <SectionLabel text="Epoch 1 Issuance Allocation" />
      <div
        style={{
          ...surfaceCard,
          marginBottom: 20,
          background: "linear-gradient(135deg, #1a1a00 0%, #1E1E2C 100%)",
          border: "1px solid rgba(221,158,51,0.2)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>Jan 1, 2026 – Mar 31, 2026</div>
            <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>104 CITYx / month</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: ACCENT }}>{creditsCommitted}</div>
            <div style={{ fontSize: 11, color: MUTED }}>of {EPOCH1_CAP} CITYx used</div>
          </div>
        </div>
        {/* Progress bar */}
        <div
          style={{
            height: 6,
            borderRadius: 3,
            background: "rgba(255,255,255,0.08)",
            overflow: "hidden",
            marginBottom: 8,
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${Math.min(100, Math.round((creditsCommitted / EPOCH1_CAP) * 100))}%`,
              background:
                creditsCommitted >= EPOCH1_CAP ? "#ff6b9d" : creditsCommitted / EPOCH1_CAP > 0.8 ? "#f59e0b" : ACCENT,
              borderRadius: 3,
              transition: "width 0.4s ease",
            }}
          />
        </div>
        <div style={{ fontSize: 11, color: MUTED }}>
          {EPOCH1_CAP - creditsCommitted > 0
            ? `${EPOCH1_CAP - creditsCommitted} CITYx remaining this epoch`
            : "Epoch allocation fully committed"}
        </div>
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
  creditsCommitted,
  onCreateOpen,
  onProposeOpen,
  onVerify,
  proposedTasks,
  onApproveProposed,
  approvedCatalogTasks,
  onIssueTask,
  onModifyTask,
}: {
  issuerTasks: ReturnType<typeof useDemo>["state"]["issuer"]["tasks"];
  totalPending: number;
  creditsCommitted: number;
  onCreateOpen: () => void;
  onProposeOpen: () => void;
  onVerify: (taskId: string, citizen: string) => void;
  proposedTasks: ProposedTask[];
  onApproveProposed: (task: ProposedTask) => void;
  approvedCatalogTasks: Task[];
  onIssueTask: (id: string) => void;
  onModifyTask: (id: string) => void;
}) {
  const [view, setView] = useState<"my" | "pending">("my");
  const pendingAll = issuerTasks.flatMap(t => t.pendingCompletions.map(addr => ({ task: t, citizen: addr })));
  const creditsRemaining = EPOCH1_CAP - creditsCommitted;
  const atCap = creditsRemaining <= 0;

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
            {v === "my"
              ? `My Tasks (${issuerTasks.length + approvedCatalogTasks.length})`
              : `Pending (${totalPending + proposedTasks.length})`}
          </button>
        ))}
      </div>

      {view === "my" && (
        <>
          {/* Budget bar */}
          {atCap && (
            <div
              style={{
                background: "rgba(255,107,157,0.08)",
                border: "1px solid rgba(255,107,157,0.3)",
                borderRadius: 12,
                padding: "10px 14px",
                marginBottom: 12,
                fontSize: 12,
                color: "#ff6b9d",
                fontWeight: 600,
              }}
            >
              ⚠️ Epoch allocation cap reached ({EPOCH1_CAP} CITYx). New tasks cannot be posted until next epoch.
            </div>
          )}

          {/* Create CTA */}
          <button
            onClick={atCap ? undefined : onCreateOpen}
            disabled={atCap}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: atCap ? "rgba(255,255,255,0.04)" : "rgba(221,158,51,0.1)",
              border: atCap ? "1px dashed rgba(255,255,255,0.12)" : "1px dashed rgba(221,158,51,0.4)",
              borderRadius: 14,
              padding: "14px 0",
              fontSize: 13,
              fontWeight: 600,
              color: atCap ? DIMMED : ACCENT,
              cursor: atCap ? "not-allowed" : "pointer",
              marginBottom: 10,
            }}
          >
            <IconPlus /> Add Task from Catalog
          </button>

          {/* Propose CTA */}
          <button
            onClick={atCap ? undefined : onProposeOpen}
            disabled={atCap}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              background: atCap ? "rgba(255,255,255,0.04)" : "rgba(221,158,51,0.06)",
              border: atCap ? "1px dashed rgba(255,255,255,0.12)" : "1px solid rgba(221,158,51,0.25)",
              borderRadius: 14,
              padding: "14px 0",
              fontSize: 13,
              fontWeight: 600,
              color: atCap ? DIMMED : "rgba(221,158,51,0.8)",
              cursor: atCap ? "not-allowed" : "pointer",
              marginBottom: 16,
            }}
          >
            <IconPlus /> Propose New Task for Approval
          </button>

          {/* Approved catalog tasks (ready to issue) */}
          {approvedCatalogTasks.length > 0 && (
            <>
              <SectionLabel text={`Approved Catalog (${approvedCatalogTasks.length})`} />
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
                {approvedCatalogTasks.map(t => (
                  <div
                    key={t.id}
                    style={{
                      background: "rgba(52,238,182,0.04)",
                      border: "1px solid rgba(52,238,182,0.2)",
                      borderRadius: 16,
                      padding: 16,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        marginBottom: 8,
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
                    <div
                      style={{
                        display: "inline-block",
                        fontSize: 10,
                        fontWeight: 600,
                        background: "rgba(52,238,182,0.12)",
                        color: "#34eeb6",
                        borderRadius: 6,
                        padding: "2px 8px",
                        marginBottom: 12,
                      }}
                    >
                      ✓ Approved · Ready to Issue
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => onIssueTask(t.id)}
                        style={{
                          flex: 1,
                          background: ACCENT,
                          border: "none",
                          borderRadius: 10,
                          padding: "9px 0",
                          fontSize: 12,
                          fontWeight: 700,
                          color: BG,
                          cursor: "pointer",
                        }}
                      >
                        Issue Task
                      </button>
                      <button
                        onClick={() => onModifyTask(t.id)}
                        style={{
                          flex: 1,
                          background: "rgba(255,255,255,0.06)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          borderRadius: 10,
                          padding: "9px 0",
                          fontSize: 12,
                          fontWeight: 600,
                          color: MUTED,
                          cursor: "pointer",
                        }}
                      >
                        Modify Task
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {issuerTasks.length === 0 && approvedCatalogTasks.length === 0 ? (
            <EmptyState
              emoji="📭"
              title="No tasks yet"
              desc="Post a task from the catalog to start receiving completions from participants."
            />
          ) : issuerTasks.length > 0 ? (
            <>
              <SectionLabel text={`Active Tasks (${issuerTasks.length})`} />
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
            </>
          ) : null}
        </>
      )}

      {view === "pending" && (
        <>
          {/* Proposed tasks awaiting approval */}
          {proposedTasks.length > 0 && (
            <>
              <SectionLabel text={`Proposed Tasks (${proposedTasks.length})`} />
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                {proposedTasks.map(pt => (
                  <div
                    key={pt.id}
                    style={{
                      background: "rgba(221,158,51,0.05)",
                      border: "1px solid rgba(221,158,51,0.25)",
                      borderRadius: 16,
                      padding: 16,
                    }}
                  >
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{pt.title}</div>
                      <div style={{ fontSize: 11, color: MUTED, marginBottom: 2 }}>
                        {pt.estimatedTime} · {pt.location}
                      </div>
                      {pt.date && <div style={{ fontSize: 11, color: MUTED }}>📅 {pt.date}</div>}
                    </div>

                    {pt.successCriteria && (
                      <div
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          borderRadius: 10,
                          padding: "8px 12px",
                          marginBottom: 10,
                          fontSize: 12,
                          color: MUTED,
                          lineHeight: 1.5,
                        }}
                      >
                        <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Success criteria: </span>
                        {pt.successCriteria}
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 10,
                        fontSize: 12,
                        color: MUTED,
                      }}
                    >
                      <span>Proposed reward</span>
                      <span style={{ color: ACCENT, fontWeight: 700 }}>{pt.credits} CITYx</span>
                    </div>

                    <button
                      onClick={() => onApproveProposed(pt)}
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
                        marginBottom: 8,
                      }}
                    >
                      Approve Task in Catalog
                    </button>
                    <div
                      style={{
                        fontSize: 10,
                        color: DIMMED,
                        textAlign: "center",
                        lineHeight: 1.5,
                        fontStyle: "italic",
                      }}
                    >
                      As a demo, you are auto-approving your own task proposal. In production, this would go through an
                      admin moderation queue.
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Citizen completion verifications */}
          {pendingAll.length > 0 && <SectionLabel text={`Completion Verifications (${pendingAll.length})`} />}
          {pendingAll.length === 0 && proposedTasks.length === 0 ? (
            <EmptyState
              emoji="🎉"
              title="All clear!"
              desc="No pending verifications. Create tasks and participants will start claiming them."
            />
          ) : pendingAll.length === 0 ? null : (
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

function CreateTaskSheet({
  onClose,
  onCreate,
  creditsCommitted,
  approvedCatalogTasks = [],
}: {
  onClose: () => void;
  onCreate: (task: Task) => void;
  creditsCommitted: number;
  approvedCatalogTasks?: Task[];
}) {
  const [selected, setSelected] = useState<Task | null>(null);
  const [step, setStep] = useState<"pick" | "review">("pick");
  const allCatalogTasks = [...approvedCatalogTasks, ...CATALOG_TASKS];

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
              {allCatalogTasks.map(task => (
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

            {creditsCommitted + selected.credits > EPOCH1_CAP && (
              <div
                style={{
                  background: "rgba(255,107,157,0.08)",
                  border: "1px solid rgba(255,107,157,0.3)",
                  borderRadius: 10,
                  padding: "10px 14px",
                  marginBottom: 12,
                  fontSize: 12,
                  color: "#ff6b9d",
                }}
              >
                ⚠️ Posting this task ({selected.credits} CITYx) would exceed your epoch allocation. You have{" "}
                {Math.max(0, EPOCH1_CAP - creditsCommitted)} CITYx remaining.
              </div>
            )}
            <button
              onClick={() =>
                creditsCommitted + selected.credits <= EPOCH1_CAP
                  ? onCreate({ ...selected, id: `task-issued-${Date.now()}` })
                  : undefined
              }
              disabled={creditsCommitted + selected.credits > EPOCH1_CAP}
              style={{
                width: "100%",
                background: creditsCommitted + selected.credits > EPOCH1_CAP ? "rgba(255,255,255,0.08)" : ACCENT,
                border: "none",
                borderRadius: 14,
                padding: "14px 0",
                fontSize: 14,
                fontWeight: 700,
                color: creditsCommitted + selected.credits > EPOCH1_CAP ? DIMMED : BG,
                cursor: creditsCommitted + selected.credits > EPOCH1_CAP ? "not-allowed" : "pointer",
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

// ─── Propose Task Sheet ───────────────────────────────────────────────────────

function ProposeTaskSheet({
  onClose,
  onPropose,
  creditsCommitted,
}: {
  onClose: () => void;
  onPropose: (task: ProposedTask) => void;
  creditsCommitted: number;
}) {
  const [title, setTitle] = useState("");
  const [estimatedTime, setEstimatedTime] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [successCriteria, setSuccessCriteria] = useState("");
  const [creditRate, setCreditRate] = useState("");
  const [credentials, setCredentials] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const TASK_TAGS = [
    "Environment",
    "Education",
    "Community",
    "Health",
    "Infrastructure",
    "Arts",
    "Youth",
    "Seniors",
    "Safety",
    "Food",
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]));
  };

  const computedCredits = (() => {
    const rate = parseFloat(creditRate);
    if (isNaN(rate) || rate <= 0) return 0;
    // Try explicit "h" notation first (e.g. "2h", "1.5 hours")
    const hoursMatch = estimatedTime.match(/(\d+(?:\.\d+)?)\s*h/i);
    if (hoursMatch) {
      return Math.round(rate * parseFloat(hoursMatch[1]));
    }
    // Fallback: try parsing the first number in the string as hours
    const numMatch = estimatedTime.match(/(\d+(?:\.\d+)?)/);
    const hours = numMatch ? parseFloat(numMatch[1]) : 1;
    return Math.round(rate * hours);
  })();

  const canSubmit = title.trim() && estimatedTime.trim() && computedCredits > 0;
  const wouldExceedCap = creditsCommitted + computedCredits > EPOCH1_CAP;

  const handleSubmit = () => {
    if (!canSubmit || wouldExceedCap) return;
    onPropose({
      id: `proposed-${Date.now()}`,
      title: title.trim(),
      estimatedTime: estimatedTime.trim(),
      location: location.trim() || "TBD",
      date: date.trim(),
      successCriteria: successCriteria.trim(),
      creditRate: parseFloat(creditRate),
      credentials: credentials.trim(),
      credits: computedCredits,
      tags: selectedTags,
    });
  };

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
          maxHeight: "90vh",
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

        <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Propose New Task</div>
        <div style={{ fontSize: 13, color: MUTED, marginBottom: 20, lineHeight: 1.5 }}>
          Submit a task for admin review. Once approved, it will enter the catalog for participants to claim.
        </div>

        {/* Budget indicator */}
        <div
          style={{
            background: "rgba(221,158,51,0.07)",
            border: "1px solid rgba(221,158,51,0.2)",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 12,
          }}
        >
          <span style={{ color: MUTED }}>Epoch budget remaining</span>
          <span style={{ color: ACCENT, fontWeight: 700 }}>{Math.max(0, EPOCH1_CAP - creditsCommitted)} CITYx</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Title of Task *</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Community Garden Cleanup"
              style={inputStyle}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={labelStyle}>Estimated Time *</label>
              <input
                value={estimatedTime}
                onChange={e => setEstimatedTime(e.target.value)}
                placeholder="e.g. 2 hours"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Credit Rate / hr *</label>
              <input
                type="number"
                value={creditRate}
                onChange={e => setCreditRate(e.target.value)}
                placeholder="e.g. 20"
                style={inputStyle}
              />
            </div>
          </div>

          {computedCredits > 0 && (
            <div
              style={{
                background: wouldExceedCap ? "rgba(255,107,157,0.08)" : "rgba(221,158,51,0.08)",
                border: `1px solid ${wouldExceedCap ? "rgba(255,107,157,0.3)" : "rgba(221,158,51,0.2)"}`,
                borderRadius: 10,
                padding: "8px 14px",
                fontSize: 12,
                color: wouldExceedCap ? "#ff6b9d" : ACCENT,
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <span>{wouldExceedCap ? "⚠️ Exceeds epoch budget" : "Estimated total credits"}</span>
              <span style={{ fontWeight: 700 }}>{computedCredits} CITYx</span>
            </div>
          )}

          <div>
            <label style={labelStyle}>Location</label>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Riverside Park, District 4"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Date / Time of Activity</label>
            <input
              value={date}
              onChange={e => setDate(e.target.value)}
              placeholder="e.g. Saturday, March 21, 2026 · 10am"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Success Criteria</label>
            <textarea
              value={successCriteria}
              onChange={e => setSuccessCriteria(e.target.value)}
              placeholder="How will completion be verified? What should participants submit as evidence?"
              rows={3}
              style={{ ...inputStyle, resize: "none", lineHeight: 1.5 }}
            />
          </div>

          <div>
            <label style={labelStyle}>Required Credentials or Skills</label>
            <input
              value={credentials}
              onChange={e => setCredentials(e.target.value)}
              placeholder="e.g. No prior experience needed"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Tags</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {TASK_TAGS.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: 20,
                    border: selectedTags.includes(tag) ? `1px solid ${ACCENT}` : "1px solid rgba(255,255,255,0.12)",
                    background: selectedTags.includes(tag) ? `${ACCENT}22` : "rgba(255,255,255,0.04)",
                    color: selectedTags.includes(tag) ? ACCENT : MUTED,
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
          onClick={handleSubmit}
          disabled={!canSubmit || wouldExceedCap}
          style={{
            width: "100%",
            background: canSubmit && !wouldExceedCap ? ACCENT : "rgba(255,255,255,0.08)",
            border: "none",
            borderRadius: 14,
            padding: "14px 0",
            fontSize: 14,
            fontWeight: 700,
            color: canSubmit && !wouldExceedCap ? BG : MUTED,
            cursor: canSubmit && !wouldExceedCap ? "pointer" : "not-allowed",
            marginTop: 20,
          }}
        >
          Submit for Review
        </button>
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
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>MyCity Feed</div>
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

// ─── Verify Tab ───────────────────────────────────────────────────────────────

function VerifyTab({
  issuerTasks,
  claimedTaskIds,
  removedTaskIds,
  onRemoveTask,
  onVerify,
}: {
  issuerTasks: ReturnType<typeof useDemo>["state"]["issuer"]["tasks"];
  claimedTaskIds: string[];
  removedTaskIds: Set<string>;
  onRemoveTask: (taskId: string) => void;
  onVerify: (taskId: string, citizen: string) => void;
}) {
  const [view, setView] = useState<"issued" | "claimed" | "completed">("issued");
  const [feedbackMap, setFeedbackMap] = useState<Record<string, string>>({});
  const [reminderSent, setReminderSent] = useState<Set<string>>(new Set());

  const issuedTasks = issuerTasks.filter(t => !removedTaskIds.has(t.id));
  const claimedTasks = issuerTasks.filter(t => claimedTaskIds.includes(t.id) && !removedTaskIds.has(t.id));
  const completedTasks = issuerTasks.filter(t => t.pendingCompletions.length > 0);

  const TOGGLE_OPTIONS = [
    { key: "issued", label: `Issued (${issuedTasks.length})` },
    { key: "claimed", label: `Claimed (${claimedTasks.length})` },
    { key: "completed", label: `Completed (${completedTasks.length})` },
  ] as const;

  return (
    <div style={{ padding: "24px 20px 100px" }}>
      {/* Three-way toggle */}
      <div
        style={{
          display: "flex",
          background: "rgba(255,255,255,0.05)",
          borderRadius: 10,
          padding: 4,
          marginBottom: 20,
        }}
      >
        {TOGGLE_OPTIONS.map(opt => (
          <button
            key={opt.key}
            onClick={() => setView(opt.key)}
            style={{
              flex: 1,
              padding: "9px 0",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 600,
              background: view === opt.key ? ACCENT : "transparent",
              color: view === opt.key ? BG : MUTED,
              transition: "all 0.15s",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Issued Tasks */}
      {view === "issued" && (
        <>
          {issuedTasks.length === 0 ? (
            <EmptyState
              emoji="📋"
              title="No issued tasks"
              desc="Post tasks from the Tasks tab to make them available for participants to claim."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {issuedTasks.map(t => (
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
                        {t.estimatedTime} · {t.slotsRemaining}/{t.slots} slots open
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: ACCENT, flexShrink: 0, marginLeft: 12 }}>
                      {t.credits} CITYx
                    </div>
                  </div>
                  <button
                    onClick={() => onRemoveTask(t.id)}
                    style={{
                      width: "100%",
                      background: "rgba(255,107,157,0.08)",
                      border: "1px solid rgba(255,107,157,0.25)",
                      borderRadius: 10,
                      padding: "9px 0",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#ff6b9d",
                      cursor: "pointer",
                    }}
                  >
                    Remove from Open Task Pool
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Claimed Tasks */}
      {view === "claimed" && (
        <>
          {claimedTasks.length === 0 ? (
            <EmptyState
              emoji="👤"
              title="No claimed tasks"
              desc="When participants claim your tasks, they'll appear here so you can track progress."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {claimedTasks.map(t => {
                const key = t.id;
                const sent = reminderSent.has(key);
                return (
                  <div key={t.id} style={{ ...surfaceCard }}>
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{t.title}</div>
                      <div style={{ fontSize: 11, color: MUTED }}>
                        {t.estimatedTime}
                        {t.taskDate && t.taskDate !== "TBD" ? ` · 📅 ${t.taskDate}` : ""}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!sent) setReminderSent(prev => new Set([...prev, key]));
                      }}
                      style={{
                        width: "100%",
                        background: sent ? "rgba(52,238,182,0.08)" : "rgba(65,105,225,0.1)",
                        border: sent ? "1px solid rgba(52,238,182,0.25)" : "1px solid rgba(65,105,225,0.3)",
                        borderRadius: 10,
                        padding: "9px 0",
                        fontSize: 12,
                        fontWeight: 600,
                        color: sent ? "#34eeb6" : "#4169E1",
                        cursor: sent ? "default" : "pointer",
                      }}
                    >
                      {sent ? "✓ Reminder Sent" : "Send Notification Reminder"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Completed Tasks */}
      {view === "completed" && (
        <>
          {completedTasks.length === 0 ? (
            <EmptyState
              emoji="🎉"
              title="All clear!"
              desc="No pending verifications. Participants will appear here once they submit completed tasks."
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {completedTasks.flatMap(t =>
                t.pendingCompletions.map(citizen => {
                  const fbKey = `${t.id}-${citizen}`;
                  return (
                    <div
                      key={fbKey}
                      style={{
                        background: SURFACE,
                        border: "1px solid rgba(221,158,51,0.2)",
                        borderRadius: 16,
                        padding: 16,
                      }}
                    >
                      <div style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{t.title}</div>
                        <div style={{ fontFamily: "monospace", fontSize: 11, color: MUTED }}>Citizen: {citizen}</div>
                      </div>

                      <div
                        style={{
                          background: "rgba(255,255,255,0.05)",
                          borderRadius: 10,
                          padding: "8px 12px",
                          marginBottom: 10,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: 12,
                          color: MUTED,
                        }}
                      >
                        <span>Reward on verification</span>
                        <span>
                          <span style={{ color: ACCENT }}>{t.credits} CITYx</span>
                          {" + "}
                          <span style={{ color: "#4169E1" }}>{t.voteTokens} VOTE</span>
                        </span>
                      </div>

                      <textarea
                        placeholder="Optional feedback on task execution…"
                        value={feedbackMap[fbKey] ?? ""}
                        onChange={e => setFeedbackMap(prev => ({ ...prev, [fbKey]: e.target.value }))}
                        rows={2}
                        style={{
                          width: "100%",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 10,
                          color: "#fff",
                          fontSize: 12,
                          padding: "8px 12px",
                          outline: "none",
                          resize: "none",
                          boxSizing: "border-box",
                          marginBottom: 10,
                          lineHeight: 1.5,
                        }}
                      />

                      <button
                        onClick={() => onVerify(t.id, citizen)}
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
                  );
                }),
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── MCEs Tab ─────────────────────────────────────────────────────────────────

function MCEsTab({ state, orgName }: { state: ReturnType<typeof useDemo>["state"]; orgName: string }) {
  const [section, setSection] = useState<"epoch1" | "epoch2">("epoch1");
  const [proposeOpen, setProposeOpen] = useState(false);
  const [localProposals, setLocalProposals] = useState<
    Array<{ id: string; title: string; description: string; goals: string; benefits: string; tags: string[] }>
  >([]);

  // MCE proposal form state
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

      {/* Epoch 1 — View only, no voting */}
      {section === "epoch1" && (
        <>
          <div
            style={{
              ...surfaceCard,
              marginBottom: 16,
              padding: "12px 16px",
              background: "rgba(65,105,225,0.08)",
              border: "1px solid rgba(65,105,225,0.25)",
            }}
          >
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
              <span style={{ fontWeight: 600, color: "#4169E1" }}>Issuer Organizations observe Epoch 1 voting</span> —
              you cannot allocate VOTE tokens to proposals. Epoch 1 voting is reserved for Civic Participants. Your role
              is to monitor which proposals are gaining support and prepare to plan tasks for the winner.
            </div>
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
          <div style={{ ...surfaceCard, marginBottom: 16, padding: "14px 16px" }}>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
              These proposals are gathering community support for the next voting epoch. As an Issuer Organization, you
              can submit new proposals here. The top-liked proposals may be selected for Epoch 2 voting.
            </div>
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
                    background: "rgba(65,105,225,0.15)",
                    color: "#4169E1",
                    border: "1px solid rgba(65,105,225,0.3)",
                  }}
                >
                  Org
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
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(4px)",
          }}
          onClick={() => setProposeOpen(false)}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              maxHeight: "90vh",
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
      )}
    </div>
  );
}

// ─── Issue Task Popup ─────────────────────────────────────────────────────────

function IssueTaskPopup({
  task,
  onClose,
  onIssue,
}: {
  task: Task;
  onClose: () => void;
  onIssue: (slots: number) => void;
}) {
  const [slots, setSlots] = useState(5);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(4px)",
        padding: "0 16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: SURFACE,
          borderRadius: 20,
          padding: "28px 24px",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Issue Task</div>
        <div style={{ fontSize: 13, color: MUTED, marginBottom: 6 }}>{task.title}</div>
        <div style={{ fontSize: 12, color: DIMMED, marginBottom: 20 }}>
          {task.credits} CITYx + {task.voteTokens} VOTE per completion
        </div>

        <div style={{ fontSize: 13, color: MUTED, marginBottom: 12 }}>
          How many instances of this task do you want to offer?
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <button
            onClick={() => setSlots(s => Math.max(1, s - 1))}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(255,255,255,0.06)",
              color: "white",
              fontSize: 22,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            −
          </button>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 36, fontWeight: 700, color: ACCENT, lineHeight: 1 }}>{slots}</div>
            <div style={{ fontSize: 11, color: DIMMED, marginTop: 4 }}>slots</div>
          </div>
          <button
            onClick={() => setSlots(s => s + 1)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              border: "1px solid rgba(255,255,255,0.15)",
              background: `${ACCENT}33`,
              color: ACCENT,
              fontSize: 22,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            +
          </button>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              padding: "12px 0",
              fontSize: 13,
              fontWeight: 600,
              color: MUTED,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onIssue(slots)}
            style={{
              flex: 2,
              background: ACCENT,
              border: "none",
              borderRadius: 12,
              padding: "12px 0",
              fontSize: 13,
              fontWeight: 700,
              color: BG,
              cursor: "pointer",
            }}
          >
            Issue {slots} Slot{slots !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modify Task Sheet ────────────────────────────────────────────────────────

function ModifyTaskSheet({
  task,
  onClose,
  onSave,
}: {
  task: Task;
  onClose: () => void;
  onSave: (updates: { location: string; taskDate: string }) => void;
}) {
  const [location, setLocation] = useState(task.location);
  const [taskDate, setTaskDate] = useState(task.taskDate ?? "");

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
        <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Modify Task</div>
        <div style={{ fontSize: 13, color: MUTED, marginBottom: 6 }}>{task.title}</div>
        <div
          style={{
            fontSize: 11,
            color: DIMMED,
            marginBottom: 20,
            background: "rgba(255,255,255,0.04)",
            borderRadius: 8,
            padding: "8px 12px",
            lineHeight: 1.5,
          }}
        >
          Only Location and Date &amp; Time of Activity can be changed on an approved task.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={labelStyle}>Location</label>
            <input
              value={location}
              onChange={e => setLocation(e.target.value)}
              placeholder="e.g. Riverside Park, District 4"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Date &amp; Time of Activity</label>
            <input
              value={taskDate}
              onChange={e => setTaskDate(e.target.value)}
              placeholder="e.g. Saturday, March 21, 2026 · 10am"
              style={inputStyle}
            />
          </div>
        </div>

        <button
          onClick={() => onSave({ location: location.trim() || task.location, taskDate: taskDate.trim() })}
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
            marginTop: 20,
          }}
        >
          Save Changes
        </button>
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
