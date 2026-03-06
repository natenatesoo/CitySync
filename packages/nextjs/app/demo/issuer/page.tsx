"use client";

import React, { useState } from "react";
import AppShell from "../_components/AppShell";
import { useDemo } from "../_context/DemoContext";
import { FAKE_WALLETS, MOCK_TASKS, Task, TaskCategory } from "../_data/mockData";

// ─── Tab icons ────────────────────────────────────────────────────────────────

const icons = {
  profile: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  tasks: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  mycity: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 21h18M3 7l9-4 9 4v14H3V7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
  dashboard: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
      <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  mces: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
};

const TABS = [
  { key: "profile", label: "Profile", icon: icons.profile },
  { key: "tasks", label: "Tasks", icon: icons.tasks },
  { key: "mycity", label: "MyCity", icon: icons.mycity },
  { key: "dashboard", label: "Dashboard", icon: icons.dashboard },
  { key: "mces", label: "MCEs", icon: icons.mces },
];

// Catalog items the admin has pre-approved (subset of MOCK_TASKS)
const CATALOG_TASKS = MOCK_TASKS.filter(t => !t.isMCE);

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function IssuerApp() {
  const { state, setRole, issuerCreateTask, issuerVerifyCompletion } = useDemo();
  const [activeTab, setActiveTab] = useState("profile");
  const [createSheet, setCreateSheet] = useState(false);

  const { issuer, mces, availableTasks } = state;

  React.useEffect(() => {
    setRole("issuer");
  }, [setRole]);

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
        accentColor="#DD9E33"
        title="Issuer"
      >
        {activeTab === "profile" && <IssuerProfileTab issuer={issuer} />}
        {activeTab === "tasks" && (
          <IssuerTasksTab
            issuerTasks={issuer.tasks}
            allTasks={availableTasks}
            onCreateOpen={() => setCreateSheet(true)}
            onVerify={issuerVerifyCompletion}
          />
        )}
        {activeTab === "mycity" && <IssuerMyCityTab mces={mces} issuer={issuer} />}
        {activeTab === "dashboard" && <IssuerDashboard issuer={issuer} />}
        {activeTab === "mces" && <IssuerMCEsTab mces={mces} />}
      </AppShell>

      {createSheet && (
        <CreateTaskSheet
          onClose={() => setCreateSheet(false)}
          onCreate={task => {
            issuerCreateTask(task);
            setCreateSheet(false);
          }}
        />
      )}
    </>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function IssuerProfileTab({ issuer }: { issuer: ReturnType<typeof useDemo>["state"]["issuer"] }) {
  return (
    <div className="px-5 py-6">
      {/* Welcome banner */}
      <div
        className="mb-6 rounded-3xl p-5"
        style={{
          background: "linear-gradient(135deg, #2a2000 0%, #1E1E2C 100%)",
          border: "1px solid rgba(221,158,51,0.3)",
        }}
      >
        <div className="mb-1 text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(221,158,51,0.6)" }}>
          Welcome
        </div>
        <div className="mb-1 text-2xl font-bold text-white">{issuer.orgName || "Your Organization"}</div>
        <div className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          {FAKE_WALLETS.issuer}
        </div>
        <div className="mt-4 flex gap-3">
          <StatusPill label="Certified Issuer" color="#DD9E33" />
          <StatusPill label="Base Sepolia" color="rgba(255,255,255,0.4)" />
        </div>
      </div>

      {/* About the issuer role */}
      <div
        className="mb-6 rounded-2xl p-4"
        style={{ background: "rgba(221,158,51,0.06)", border: "1px solid rgba(221,158,51,0.15)" }}
      >
        <div className="mb-2 text-sm font-semibold text-white">Your Role as an Issuer</div>
        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
          You post volunteer tasks, set CITY and VOTE credit rewards, and verify completions directly from your wallet.
          When you verify a completion, CITY credits and VOTE tokens are minted to the participant on-chain.
        </p>
      </div>

      {/* Stats */}
      <SectionHeader title="Issuance Stats" />
      <div className="mb-6 rounded-2xl" style={{ background: "#1E1E2C" }}>
        <StatRow label="Tasks Created" value={issuer.totalTasksIssued} />
        <StatRow label="Credits Issued" value={issuer.totalCreditsIssued} suffix="CITY" border />
        <StatRow
          label="Pending Verifications"
          value={issuer.tasks.reduce((n, t) => n + t.pendingCompletions.length, 0)}
          border
        />
      </div>

      {/* Active tasks quick view */}
      {issuer.tasks.length > 0 && (
        <>
          <SectionHeader title="Active Tasks" />
          <div className="space-y-2">
            {issuer.tasks.slice(0, 3).map(t => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-2xl px-4 py-3"
                style={{ background: "#1E1E2C" }}
              >
                <div>
                  <div className="text-sm font-medium text-white">{t.title}</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {t.verifiedCount} verified · {t.pendingCompletions.length} pending
                  </div>
                </div>
                <div className="text-sm font-semibold" style={{ color: "#DD9E33" }}>
                  {t.credits} CITY
                </div>
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

function IssuerTasksTab({
  issuerTasks,
  allTasks,
  onCreateOpen,
  onVerify,
}: {
  issuerTasks: ReturnType<typeof useDemo>["state"]["issuer"]["tasks"];
  allTasks: Task[];
  onCreateOpen: () => void;
  onVerify: (taskId: string, citizen: string) => void;
}) {
  const [view, setView] = useState<"my" | "pending">("my");

  const pendingAll = issuerTasks.flatMap(t => t.pendingCompletions.map(addr => ({ task: t, citizen: addr })));

  return (
    <div className="px-5 py-6">
      {/* Segment control */}
      <div className="mb-5 flex rounded-2xl p-1" style={{ background: "#1E1E2C" }}>
        {(["my", "pending"] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="flex-1 rounded-xl py-2 text-sm font-medium transition"
            style={{
              background: view === v ? "#DD9E33" : "transparent",
              color: view === v ? "#15151E" : "rgba(255,255,255,0.5)",
            }}
          >
            {v === "my" ? `My Tasks (${issuerTasks.length})` : `Pending (${pendingAll.length})`}
          </button>
        ))}
      </div>

      {view === "my" && (
        <>
          {/* Create task CTA */}
          <button
            onClick={onCreateOpen}
            className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition"
            style={{ background: "rgba(221,158,51,0.15)", color: "#DD9E33", border: "1px dashed rgba(221,158,51,0.4)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            Add Task from Catalog
          </button>

          {issuerTasks.length === 0 ? (
            <EmptyState
              emoji="📭"
              title="No tasks yet"
              desc="Post a task from the catalog to start receiving completions from participants."
            />
          ) : (
            <div className="space-y-3">
              {issuerTasks.map(t => (
                <div
                  key={t.id}
                  className="rounded-3xl p-4"
                  style={{ background: "#1E1E2C", border: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-white">{t.title}</div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                        {t.category} · {t.estimatedTime}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold" style={{ color: "#DD9E33" }}>
                        {t.credits} CITY
                      </div>
                      <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                        +{t.voteTokens} VOTE
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                    <span>✓ {t.verifiedCount} verified</span>
                    <span>⏳ {t.pendingCompletions.length} pending</span>
                    <span>
                      👥 {t.slotsRemaining}/{t.slots} slots
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
            <div className="space-y-3">
              {pendingAll.map(({ task, citizen }) => (
                <div
                  key={`${task.id}-${citizen}`}
                  className="rounded-3xl p-4"
                  style={{ background: "#1E1E2C", border: "1px solid rgba(221,158,51,0.15)" }}
                >
                  <div className="mb-3">
                    <div className="text-sm font-semibold text-white">{task.title}</div>
                    <div className="mt-0.5 font-mono text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                      Citizen: {citizen}
                    </div>
                  </div>

                  <div className="mb-3 rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div
                      className="flex items-center justify-between text-xs"
                      style={{ color: "rgba(255,255,255,0.45)" }}
                    >
                      <span>Reward on verification</span>
                      <span>
                        <span style={{ color: "#DD9E33" }}>{task.credits} CITY</span>
                        {" + "}
                        <span style={{ color: "#4169E1" }}>{task.voteTokens} VOTE</span>
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onVerify(task.id, citizen)}
                    className="w-full rounded-2xl py-2.5 text-sm font-semibold text-white transition"
                    style={{ background: "#DD9E33", color: "#15151E" }}
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
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl p-6 pb-10"
        style={{ background: "#1E1E2C", maxWidth: 480, maxHeight: "85vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="mx-auto mb-5 h-1 w-12 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />

        {step === "pick" ? (
          <>
            <div className="mb-1 text-xl font-bold text-white">Task Catalog</div>
            <div className="mb-5 text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>
              Admin-approved tasks ready to post. Choose one to review and customize.
            </div>
            <div className="space-y-2">
              {CATALOG_TASKS.map(task => (
                <button
                  key={task.id}
                  onClick={() => {
                    setSelected(task);
                    setStep("review");
                  }}
                  className="flex w-full items-start justify-between rounded-2xl p-4 text-left transition"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  <div>
                    <div className="text-sm font-semibold text-white">{task.title}</div>
                    <div className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {task.category} · {task.estimatedTime}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-sm font-bold" style={{ color: "#DD9E33" }}>
                      {task.credits} CITY
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : selected ? (
          <>
            <button
              onClick={() => setStep("pick")}
              className="mb-4 flex items-center gap-1.5 text-xs"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              ← Back to catalog
            </button>
            <div className="mb-1 text-xl font-bold text-white">{selected.title}</div>
            <div className="mb-4 text-xs" style={{ color: "#DD9E33" }}>
              {selected.category}
            </div>
            <p className="mb-5 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
              {selected.description}
            </p>

            {/* Reward display */}
            <div
              className="mb-5 flex items-center justify-around rounded-2xl py-4"
              style={{ background: "rgba(221,158,51,0.08)", border: "1px solid rgba(221,158,51,0.2)" }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: "#DD9E33" }}>
                  {selected.credits}
                </div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                  CITY per completion
                </div>
              </div>
              <div className="h-10 w-px" style={{ background: "rgba(255,255,255,0.1)" }} />
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: "#4169E1" }}>
                  {selected.voteTokens}
                </div>
                <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                  VOTE per completion
                </div>
              </div>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-2">
              <DetailItem icon="📍" label="Location" value={selected.location} />
              <DetailItem icon="⏱" label="Duration" value={selected.estimatedTime} />
              <DetailItem icon="👥" label="Slots" value={`${selected.slots} available`} />
            </div>

            <button
              onClick={() => onCreate({ ...selected, id: `task-issued-${Date.now()}` })}
              className="w-full rounded-2xl py-3.5 text-sm font-semibold transition"
              style={{ background: "#DD9E33", color: "#15151E" }}
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

function IssuerMyCityTab({
  mces,
  issuer,
}: {
  mces: ReturnType<typeof useDemo>["state"]["mces"];
  issuer: ReturnType<typeof useDemo>["state"]["issuer"];
}) {
  const activeMce = mces.find(m => m.status === "Active");
  const votingMce = mces.filter(m => m.status === "Voting");

  return (
    <div className="px-5 py-6">
      <SectionHeader title="City Overview" />
      <div className="mb-6 rounded-2xl" style={{ background: "#1E1E2C" }}>
        <StatRow label="Active MCEs" value={mces.filter(m => m.status === "Active").length} />
        <StatRow label="MCEs in Voting" value={votingMce.length} border />
        <StatRow label="Total Participants (MCE)" value={mces.reduce((n, m) => n + m.participantCount, 0)} border />
      </div>

      {activeMce && (
        <>
          <SectionHeader title="Active Mass Coordination Event" />
          <MCECard mce={activeMce} />
        </>
      )}

      <SectionHeader title="City Issuance Summary" />
      <div className="mb-6 rounded-2xl" style={{ background: "#1E1E2C" }}>
        <StatRow label="Your Tasks Posted" value={issuer.totalTasksIssued} />
        <StatRow label="CITY Distributed" value={issuer.totalCreditsIssued} suffix="CITY" border />
      </div>
    </div>
  );
}

// ─── Dashboard Tab ────────────────────────────────────────────────────────────

function IssuerDashboard({ issuer }: { issuer: ReturnType<typeof useDemo>["state"]["issuer"] }) {
  const totalPending = issuer.tasks.reduce((n, t) => n + t.pendingCompletions.length, 0);
  const totalVerified = issuer.tasks.reduce((n, t) => n + t.verifiedCount, 0);
  const completionRate =
    totalPending + totalVerified > 0 ? Math.round((totalVerified / (totalPending + totalVerified)) * 100) : 0;

  const categoryBreakdown = issuer.tasks.reduce<Record<string, number>>((acc, t) => {
    acc[t.category] = (acc[t.category] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="px-5 py-6">
      <SectionHeader title="Performance" />
      <div className="mb-6 grid grid-cols-2 gap-3">
        <MetricCard label="Tasks Posted" value={issuer.totalTasksIssued} color="#DD9E33" />
        <MetricCard label="CITY Issued" value={issuer.totalCreditsIssued} color="#4169E1" />
        <MetricCard label="Verifications" value={totalVerified} color="#34eeb6" />
        <MetricCard label="Completion Rate" value={`${completionRate}%`} color="#a78bfa" />
      </div>

      {Object.keys(categoryBreakdown).length > 0 && (
        <>
          <SectionHeader title="Tasks by Category" />
          <div className="mb-6 space-y-2">
            {Object.entries(categoryBreakdown).map(([cat, count]) => (
              <div
                key={cat}
                className="flex items-center justify-between rounded-xl px-4 py-2.5"
                style={{ background: "#1E1E2C" }}
              >
                <span className="text-sm text-white">{cat}</span>
                <span className="text-sm font-semibold" style={{ color: "#DD9E33" }}>
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

      {/* How verification works */}
      <SectionHeader title="How It Works" />
      <div className="rounded-2xl p-4 space-y-3" style={{ background: "#1E1E2C" }}>
        {[
          ["1️⃣", "Post a task", "Choose from the admin-curated catalog and publish it to participants."],
          ["2️⃣", "Citizens claim", "Participants claim a slot and complete the task in the real world."],
          ["3️⃣", "You verify", "Review completion evidence and click Verify — this triggers on-chain minting."],
          ["4️⃣", "Credits minted", "CITY and VOTE tokens land in the citizen's wallet automatically."],
        ].map(([num, title, desc]) => (
          <div key={title} className="flex gap-3">
            <span className="text-lg">{num}</span>
            <div>
              <div className="text-sm font-semibold text-white">{title}</div>
              <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                {desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── MCEs Tab ─────────────────────────────────────────────────────────────────

function IssuerMCEsTab({ mces }: { mces: ReturnType<typeof useDemo>["state"]["mces"] }) {
  return (
    <div className="px-5 py-6">
      <div
        className="mb-5 rounded-2xl p-4"
        style={{ background: "rgba(221,158,51,0.06)", border: "1px solid rgba(221,158,51,0.15)" }}
      >
        <div className="mb-1 text-sm font-semibold text-white">What is an MCE?</div>
        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
          Mass Coordination Events (MCEs) are city-wide initiatives proposed by certified issuers and voted on by VOTE
          token holders. If approved, the city enters a 2-day planning phase before activation. MCE tasks earn
          MCECredits — redeemable at a wider set of venues.
        </p>
      </div>

      <SectionHeader title="All MCEs" />
      <div className="space-y-4">
        {mces.map(mce => (
          <MCECard key={mce.id} mce={mce} />
        ))}
      </div>
    </div>
  );
}

// ─── MCE Card (shared) ────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  Voting: "#4169E1",
  Planning: "#DD9E33",
  Active: "#34eeb6",
  Closed: "rgba(255,255,255,0.3)",
  Rejected: "#ff6b9d",
};

function MCECard({ mce }: { mce: ReturnType<typeof useDemo>["state"]["mces"][number] }) {
  const statusColor = STATUS_COLOR[mce.status] ?? "#4169E1";
  const total = mce.votesFor + mce.votesAgainst;
  const forPct = total > 0 ? (mce.votesFor / total) * 100 : 50;

  return (
    <div className="rounded-3xl p-5" style={{ background: "#1E1E2C", border: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="mb-1">
        <span
          className="rounded-full px-2 py-0.5 text-xs font-medium"
          style={{ background: `${statusColor}18`, color: statusColor }}
        >
          {mce.status}
        </span>
      </div>
      <div className="mt-2 text-base font-semibold text-white">{mce.title}</div>
      <div className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
        {mce.proposerName} · {mce.taskCount} tasks · {mce.mceCreditsPerTask} MCE/task
      </div>

      <div className="mt-3 mb-1.5 flex justify-between text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
        <span>{mce.votesFor.toLocaleString()} for</span>
        <span>{mce.votesAgainst.toLocaleString()} against</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${forPct}%`, background: "linear-gradient(90deg, #4169E1, #34eeb6)" }}
        />
      </div>

      {mce.participantCount > 0 && (
        <div className="mt-2 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
          {mce.participantCount.toLocaleString()} participants enrolled
        </div>
      )}
    </div>
  );
}

// ─── Micro-components ─────────────────────────────────────────────────────────

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>
      {title}
    </div>
  );
}

function StatusPill({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{ background: `${color}20`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function StatRow({
  label,
  value,
  suffix,
  border,
}: {
  label: string;
  value: number;
  suffix?: string;
  border?: boolean;
}) {
  return (
    <div
      className="flex items-center justify-between px-4 py-3"
      style={{ borderTop: border ? "1px solid rgba(255,255,255,0.06)" : undefined }}
    >
      <span className="text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
        {label}
      </span>
      <span className="text-sm font-semibold text-white">
        {value.toLocaleString()}
        {suffix && (
          <span className="ml-1 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            {suffix}
          </span>
        )}
      </span>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-2xl p-4 text-center" style={{ background: "#1E1E2C" }}>
      <div className="text-2xl font-bold" style={{ color }}>
        {typeof value === "number" ? value.toLocaleString() : value}
      </div>
      <div className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
        {label}
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
      <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
        {icon} {label}
      </div>
      <div className="mt-1 text-sm font-medium text-white">{value}</div>
    </div>
  );
}

function EmptyState({ emoji, title, desc }: { emoji: string; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center py-12 text-center">
      <div className="mb-4 text-5xl">{emoji}</div>
      <div className="mb-2 text-base font-semibold text-white">{title}</div>
      <div className="max-w-xs text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.45)" }}>
        {desc}
      </div>
    </div>
  );
}
