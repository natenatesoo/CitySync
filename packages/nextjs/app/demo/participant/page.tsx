"use client";

import React, { useState } from "react";
import AppShell from "../_components/AppShell";
import VerifyingOverlay from "../_components/VerifyingOverlay";
import { useDemo } from "../_context/DemoContext";
import { FAKE_WALLETS, Task, TaskCategory } from "../_data/mockData";

// ─── Tab icons ────────────────────────────────────────────────────────────────

const icons = {
  profile: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  explore: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  mycity: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M3 21h18M3 7l9-4 9 4v14H3V7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M9 21v-6h6v6" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  ),
  vote: (
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
  redemptions: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path
        d="M2 17l10 5 10-5M2 12l10 5 10-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

const TABS = [
  { key: "profile", label: "Profile", icon: icons.profile },
  { key: "explore", label: "Explore", icon: icons.explore },
  { key: "mycity", label: "MyCity", icon: icons.mycity },
  { key: "vote", label: "Vote", icon: icons.vote },
  { key: "redemptions", label: "Redeem", icon: icons.redemptions },
];

const CATEGORY_COLORS: Record<TaskCategory, string> = {
  Environment: "#34eeb6",
  Education: "#4169E1",
  Community: "#DD9E33",
  Health: "#ff6b9d",
  Infrastructure: "#a78bfa",
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ParticipantApp() {
  const { state, setRole, claimTask, startVerify, voteOnMCE, redeemOffer } = useDemo();
  const [activeTab, setActiveTab] = useState("explore");
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<TaskCategory | "All">("All");
  const [redeemConfirm, setRedeemConfirm] = useState<string | null>(null);

  const { participant, mces, availableTasks, verifying, pastRedemptions, offers } = state;

  // Ensure role is set
  React.useEffect(() => {
    setRole("participant");
  }, [setRole]);

  const filteredTasks =
    selectedCategory === "All" ? availableTasks : availableTasks.filter(t => t.category === selectedCategory);

  return (
    <>
      {verifying && <VerifyingOverlay taskTitle={verifying.taskTitle} secondsRemaining={verifying.secondsRemaining} />}

      <AppShell
        role="participant"
        address={FAKE_WALLETS.participant}
        cityBalance={participant.cityBalance}
        voteBalance={participant.voteBalance}
        mceBalance={participant.mceBalance}
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        accentColor="#4169E1"
        title="Participant"
      >
        {activeTab === "profile" && <ProfileTab participant={participant} />}
        {activeTab === "explore" && (
          <ExploreTab
            tasks={filteredTasks}
            claimedIds={participant.claimedTaskIds}
            completedIds={participant.completedTasks.map(t => t.taskId)}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onSelectTask={setSelectedTask}
            onClaim={claimTask}
            onVerify={startVerify}
          />
        )}
        {activeTab === "mycity" && (
          <MyCityTab
            completedTasks={participant.completedTasks}
            cityBalance={participant.cityBalance}
            voteBalance={participant.voteBalance}
            mceBalance={participant.mceBalance}
          />
        )}
        {activeTab === "vote" && (
          <VoteTab mces={mces} votes={participant.mceVotes} voteBalance={participant.voteBalance} onVote={voteOnMCE} />
        )}
        {activeTab === "redemptions" && (
          <RedemptionsTab
            offers={offers}
            cityBalance={participant.cityBalance}
            mceBalance={participant.mceBalance}
            pastRedemptions={pastRedemptions}
            confirmId={redeemConfirm}
            onSelectConfirm={setRedeemConfirm}
            onRedeem={offerId => {
              redeemOffer(offerId);
              setRedeemConfirm(null);
            }}
          />
        )}
      </AppShell>

      {/* Task detail sheet */}
      {selectedTask && (
        <TaskDetailSheet
          task={selectedTask}
          isClaimed={participant.claimedTaskIds.includes(selectedTask.id)}
          isCompleted={participant.completedTasks.some(t => t.taskId === selectedTask.id)}
          onClaim={() => {
            claimTask(selectedTask.id);
            setSelectedTask(null);
          }}
          onVerify={() => {
            startVerify(selectedTask.id, selectedTask.title);
            setSelectedTask(null);
          }}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab({ participant }: { participant: ReturnType<typeof useDemo>["state"]["participant"] }) {
  const completionCount = participant.completedTasks.length;

  return (
    <div className="px-5 py-6">
      {/* Welcome banner */}
      <div className="mb-6 rounded-3xl p-5" style={{ background: "linear-gradient(135deg, #4169E1 0%, #23128F 100%)" }}>
        <div className="mb-1 text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.6)" }}>
          Welcome back
        </div>
        <div className="mb-3 text-xl font-bold text-white">Demo Citizen</div>
        <div className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
          {FAKE_WALLETS.participant}
        </div>
        <div className="mt-4 flex gap-3">
          <StatusPill label="Active" color="#34eeb6" />
          <StatusPill label="Base Sepolia" color="rgba(255,255,255,0.5)" />
        </div>
      </div>

      {/* Balances */}
      <SectionHeader title="Your Balances" />
      <div className="mb-6 grid grid-cols-3 gap-3">
        <BalanceCard label="CITY" value={participant.cityBalance} color="#4169E1" desc="Civic Credits" />
        <BalanceCard label="VOTE" value={participant.voteBalance} color="#DD9E33" desc="Vote Power" />
        <BalanceCard label="MCE" value={participant.mceBalance} color="#34eeb6" desc="MCE Credits" />
      </div>

      {/* Stats */}
      <SectionHeader title="Participation" />
      <div className="mb-6 rounded-2xl" style={{ background: "#1E1E2C" }}>
        <StatRow label="Tasks Completed" value={completionCount} />
        <StatRow label="Credits Earned" value={participant.cityBalance} suffix="CITY" border />
        <StatRow label="Votes Cast" value={Object.keys(participant.mceVotes).length} />
      </div>

      {/* Recent completions */}
      {participant.completedTasks.length > 0 && (
        <>
          <SectionHeader title="Recent Activity" />
          <div className="space-y-2">
            {participant.completedTasks.slice(0, 3).map(ct => (
              <div
                key={ct.txHash}
                className="flex items-center justify-between rounded-2xl px-4 py-3"
                style={{ background: "#1E1E2C" }}
              >
                <div>
                  <div className="text-sm font-medium text-white">{ct.title}</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {ct.issuerName} · {new Date(ct.completedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold" style={{ color: "#4169E1" }}>
                    +{ct.credits} CITY
                  </div>
                  <div className="text-xs" style={{ color: "#DD9E33" }}>
                    +{ct.voteTokens} VOTE
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {participant.completedTasks.length === 0 && (
        <EmptyState
          emoji="🏙️"
          title="Ready to participate?"
          desc="Head to Explore to browse volunteer tasks and start earning CITY credits."
        />
      )}
    </div>
  );
}

// ─── Explore Tab ─────────────────────────────────────────────────────────────

const CATEGORIES: Array<TaskCategory | "All"> = [
  "All",
  "Environment",
  "Community",
  "Education",
  "Health",
  "Infrastructure",
];

function ExploreTab({
  tasks,
  claimedIds,
  completedIds,
  selectedCategory,
  onCategoryChange,
  onSelectTask,
  onClaim,
  onVerify,
}: {
  tasks: Task[];
  claimedIds: string[];
  completedIds: string[];
  selectedCategory: TaskCategory | "All";
  onCategoryChange: (c: TaskCategory | "All") => void;
  onSelectTask: (t: Task) => void;
  onClaim: (id: string) => void;
  onVerify: (id: string, title: string) => void;
}) {
  return (
    <div>
      {/* Category filter */}
      <div className="px-5 pb-2 pt-5">
        <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className="shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition"
              style={{
                background:
                  selectedCategory === cat
                    ? cat === "All"
                      ? "#4169E1"
                      : CATEGORY_COLORS[cat as TaskCategory]
                    : "rgba(255,255,255,0.07)",
                color: selectedCategory === cat ? "#15151E" : "rgba(255,255,255,0.6)",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div className="px-5 pb-3 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
        {tasks.length} {tasks.length === 1 ? "task" : "tasks"} available
      </div>

      {/* Task list */}
      <div className="space-y-3 px-5 pb-6">
        {tasks.map(task => {
          const isClaimed = claimedIds.includes(task.id);
          const isCompleted = completedIds.includes(task.id);
          return (
            <TaskCard
              key={task.id}
              task={task}
              isClaimed={isClaimed}
              isCompleted={isCompleted}
              onTap={() => onSelectTask(task)}
              onClaim={() => onClaim(task.id)}
              onVerify={() => onVerify(task.id, task.title)}
            />
          );
        })}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  isClaimed,
  isCompleted,
  onTap,
  onClaim,
  onVerify,
}: {
  task: Task;
  isClaimed: boolean;
  isCompleted: boolean;
  onTap: () => void;
  onClaim: () => void;
  onVerify: () => void;
}) {
  const catColor = CATEGORY_COLORS[task.category];

  return (
    <div
      className="rounded-3xl p-4 transition"
      style={{
        background: isCompleted ? "rgba(52,238,182,0.06)" : "#1E1E2C",
        border: isCompleted
          ? "1px solid rgba(52,238,182,0.2)"
          : isClaimed
            ? "1px solid rgba(65,105,225,0.3)"
            : "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Header row */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <button className="flex-1 text-left" onClick={onTap}>
          <div className="flex items-start gap-2">
            <span
              className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ background: `${catColor}18`, color: catColor }}
            >
              {task.category}
            </span>
            {task.isMCE && (
              <span
                className="mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium"
                style={{ background: "rgba(221,158,51,0.15)", color: "#DD9E33" }}
              >
                MCE
              </span>
            )}
          </div>
          <div className="mt-2 text-sm font-semibold text-white">{task.title}</div>
          <div className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            {task.issuerName} · {task.estimatedTime} · {task.location}
          </div>
        </button>

        {/* Reward */}
        <div className="shrink-0 text-right">
          <div className="text-sm font-bold" style={{ color: "#4169E1" }}>
            {task.credits} CITY
          </div>
          <div className="text-xs" style={{ color: "#DD9E33" }}>
            +{task.voteTokens} VOTE
          </div>
        </div>
      </div>

      {/* Slots */}
      <div className="mb-3 flex items-center gap-1.5">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.max(5, (task.slotsRemaining / task.slots) * 100)}%`,
              background: catColor,
            }}
          />
        </div>
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
          {task.slotsRemaining}/{task.slots} spots
        </span>
      </div>

      {/* Action */}
      {isCompleted ? (
        <div
          className="flex items-center justify-center gap-1.5 rounded-2xl py-2 text-xs font-medium"
          style={{ background: "rgba(52,238,182,0.12)", color: "#34eeb6" }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 6L9 17l-5-5"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Completed
        </div>
      ) : isClaimed ? (
        <button
          onClick={onVerify}
          className="w-full rounded-2xl py-2 text-xs font-semibold transition"
          style={{ background: "#4169E1", color: "#fff" }}
        >
          Submit for Verification →
        </button>
      ) : (
        <button
          onClick={onClaim}
          disabled={task.slotsRemaining === 0}
          className="w-full rounded-2xl py-2 text-xs font-semibold transition"
          style={{
            background: task.slotsRemaining === 0 ? "rgba(255,255,255,0.07)" : "rgba(65,105,225,0.2)",
            color: task.slotsRemaining === 0 ? "rgba(255,255,255,0.25)" : "#4169E1",
          }}
        >
          {task.slotsRemaining === 0 ? "Full" : "Claim Task"}
        </button>
      )}
    </div>
  );
}

// ─── Task Detail Sheet ────────────────────────────────────────────────────────

function TaskDetailSheet({
  task,
  isClaimed,
  isCompleted,
  onClaim,
  onVerify,
  onClose,
}: {
  task: Task;
  isClaimed: boolean;
  isCompleted: boolean;
  onClaim: () => void;
  onVerify: () => void;
  onClose: () => void;
}) {
  const catColor = CATEGORY_COLORS[task.category];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="w-full rounded-t-3xl p-6 pb-10"
        style={{ background: "#1E1E2C", maxWidth: 480, maxHeight: "80vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="mx-auto mb-5 h-1 w-12 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />

        <div className="mb-1 flex items-center gap-2">
          <span
            className="rounded-full px-2 py-0.5 text-xs font-medium"
            style={{ background: `${catColor}18`, color: catColor }}
          >
            {task.category}
          </span>
          {task.isMCE && (
            <span
              className="rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ background: "rgba(221,158,51,0.15)", color: "#DD9E33" }}
            >
              MCE
            </span>
          )}
        </div>

        <h2 className="mb-2 text-xl font-bold text-white">{task.title}</h2>
        <p className="mb-5 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
          {task.description}
        </p>

        {/* Details grid */}
        <div className="mb-5 grid grid-cols-2 gap-3">
          <DetailItem icon="⏱" label="Time" value={task.estimatedTime} />
          <DetailItem icon="📍" label="Location" value={task.location} />
          <DetailItem icon="🏢" label="Issuer" value={task.issuerName} />
          <DetailItem icon="👥" label="Spots Left" value={`${task.slotsRemaining} / ${task.slots}`} />
        </div>

        {/* Rewards */}
        <div
          className="mb-5 flex items-center justify-around rounded-2xl py-4"
          style={{ background: "rgba(65,105,225,0.1)", border: "1px solid rgba(65,105,225,0.2)" }}
        >
          <RewardItem label="CITY Credits" value={task.credits} color="#4169E1" />
          <div className="h-10 w-px" style={{ background: "rgba(255,255,255,0.1)" }} />
          <RewardItem label="VOTE Tokens" value={task.voteTokens} color="#DD9E33" />
        </div>

        {/* Tags */}
        <div className="mb-6 flex flex-wrap gap-1.5">
          {task.tags.map(tag => (
            <span
              key={tag}
              className="rounded-full px-2.5 py-0.5 text-xs"
              style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.5)" }}
            >
              #{tag}
            </span>
          ))}
        </div>

        {isCompleted ? (
          <div
            className="flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium"
            style={{ background: "rgba(52,238,182,0.12)", color: "#34eeb6" }}
          >
            ✓ Completed
          </div>
        ) : isClaimed ? (
          <button
            onClick={onVerify}
            className="w-full rounded-2xl py-3.5 text-sm font-semibold text-white transition"
            style={{ background: "#4169E1" }}
          >
            Submit for Verification
          </button>
        ) : (
          <button
            onClick={onClaim}
            disabled={task.slotsRemaining === 0}
            className="w-full rounded-2xl py-3.5 text-sm font-semibold transition"
            style={{
              background: task.slotsRemaining === 0 ? "rgba(255,255,255,0.07)" : "#4169E1",
              color: task.slotsRemaining === 0 ? "rgba(255,255,255,0.25)" : "#fff",
            }}
          >
            {task.slotsRemaining === 0 ? "No Spots Available" : "Claim This Task"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── MyCity Tab ───────────────────────────────────────────────────────────────

function MyCityTab({
  completedTasks,
  cityBalance,
  voteBalance,
  mceBalance,
}: {
  completedTasks: ReturnType<typeof useDemo>["state"]["participant"]["completedTasks"];
  cityBalance: number;
  voteBalance: number;
  mceBalance: number;
}) {
  const totalCategories = [...new Set(completedTasks.map(t => t.issuerName))].length;

  return (
    <div className="px-5 py-6">
      {/* Impact header */}
      <div
        className="mb-6 rounded-3xl p-5"
        style={{
          background: "linear-gradient(135deg, #23128F 0%, #15151E 100%)",
          border: "1px solid rgba(65,105,225,0.3)",
        }}
      >
        <div className="mb-3 text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.4)" }}>
          Your City Impact
        </div>
        <div className="mb-4 text-3xl font-bold text-white">{completedTasks.length}</div>
        <div className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
          {completedTasks.length === 1 ? "task completed" : "tasks completed"} across {totalCategories}{" "}
          {totalCategories === 1 ? "organization" : "organizations"}
        </div>
      </div>

      {/* Contribution breakdown */}
      <SectionHeader title="Your Contributions" />
      <div className="mb-6 rounded-2xl" style={{ background: "#1E1E2C" }}>
        <StatRow label="Tasks Completed" value={completedTasks.length} />
        <StatRow label="CITY Earned" value={cityBalance} suffix="CITY" border />
        <StatRow label="VOTE Earned" value={voteBalance} suffix="VOTE" border />
        <StatRow label="MCE Credits" value={mceBalance} suffix="MCE" border />
      </div>

      {/* Completed task list */}
      {completedTasks.length > 0 ? (
        <>
          <SectionHeader title="Completed Tasks" />
          <div className="space-y-2">
            {completedTasks.map(ct => (
              <div
                key={ct.txHash}
                className="rounded-2xl px-4 py-3"
                style={{ background: "#1E1E2C", border: "1px solid rgba(52,238,182,0.12)" }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">{ct.title}</div>
                    <div className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {ct.issuerName}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold" style={{ color: "#34eeb6" }}>
                      +{ct.credits} CITY
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full" style={{ background: "#34eeb6" }} />
                  <span className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
                    {ct.txHash.slice(0, 10)}…{ct.txHash.slice(-6)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          emoji="🌆"
          title="Your city impact starts here"
          desc="Complete tasks in the Explore tab to see your civic contributions tracked here."
        />
      )}
    </div>
  );
}

// ─── Vote Tab ─────────────────────────────────────────────────────────────────

function VoteTab({
  mces,
  votes,
  voteBalance,
  onVote,
}: {
  mces: ReturnType<typeof useDemo>["state"]["mces"];
  votes: Record<string, "for" | "against">;
  voteBalance: number;
  onVote: (mceId: string, dir: "for" | "against") => void;
}) {
  const STATUS_COLOR: Record<string, string> = {
    Voting: "#4169E1",
    Planning: "#DD9E33",
    Active: "#34eeb6",
    Closed: "rgba(255,255,255,0.3)",
    Rejected: "#ff6b9d",
  };

  return (
    <div className="px-5 py-6">
      {/* Vote power banner */}
      <div
        className="mb-5 flex items-center justify-between rounded-2xl px-4 py-3"
        style={{ background: "rgba(221,158,51,0.1)", border: "1px solid rgba(221,158,51,0.2)" }}
      >
        <div>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            Your Vote Power
          </div>
          <div className="text-xl font-bold" style={{ color: "#DD9E33" }}>
            {voteBalance.toLocaleString()} VOTE
          </div>
        </div>
        <div className="text-2xl">🗳️</div>
      </div>

      <SectionHeader title="Mass Coordination Events" />

      <div className="space-y-4">
        {mces.map(mce => {
          const myVote = votes[mce.id];
          const totalVotes = mce.votesFor + mce.votesAgainst;
          const forPct = totalVotes > 0 ? (mce.votesFor / totalVotes) * 100 : 50;
          const isVotable = mce.status === "Voting";
          const statusColor = STATUS_COLOR[mce.status] ?? "#4169E1";

          return (
            <div
              key={mce.id}
              className="rounded-3xl p-5"
              style={{ background: "#1E1E2C", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-1">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-medium"
                      style={{ background: `${statusColor}18`, color: statusColor }}
                    >
                      {mce.status}
                    </span>
                  </div>
                  <div className="mt-1.5 text-base font-semibold text-white">{mce.title}</div>
                  <div className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Proposed by {mce.proposerName}
                  </div>
                </div>
              </div>

              <p className="mb-4 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
                {mce.description.slice(0, 140)}…
              </p>

              {/* Vote bar */}
              <div className="mb-3">
                <div className="mb-1.5 flex justify-between text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                  <span>For: {mce.votesFor.toLocaleString()}</span>
                  <span>Against: {mce.votesAgainst.toLocaleString()}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${forPct}%`,
                      background: "linear-gradient(90deg, #4169E1, #34eeb6)",
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>

              {/* MCE meta */}
              <div className="mb-4 flex gap-3 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                <span>🗓 Ends {new Date(mce.votingEndsAt).toLocaleDateString()}</span>
                <span>·</span>
                <span>📋 {mce.taskCount} tasks</span>
                <span>·</span>
                <span>🏅 {mce.mceCreditsPerTask} MCE/task</span>
              </div>

              {/* Vote buttons */}
              {isVotable ? (
                myVote ? (
                  <div
                    className="flex items-center justify-center gap-1.5 rounded-2xl py-2.5 text-sm font-medium"
                    style={{
                      background: myVote === "for" ? "rgba(52,238,182,0.12)" : "rgba(255,107,157,0.12)",
                      color: myVote === "for" ? "#34eeb6" : "#ff6b9d",
                    }}
                  >
                    {myVote === "for" ? "✓ You voted FOR" : "✗ You voted AGAINST"}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onVote(mce.id, "for")}
                      className="flex-1 rounded-2xl py-2.5 text-sm font-semibold transition"
                      style={{ background: "rgba(52,238,182,0.15)", color: "#34eeb6" }}
                    >
                      Vote For
                    </button>
                    <button
                      onClick={() => onVote(mce.id, "against")}
                      className="flex-1 rounded-2xl py-2.5 text-sm font-semibold transition"
                      style={{ background: "rgba(255,107,157,0.12)", color: "#ff6b9d" }}
                    >
                      Vote Against
                    </button>
                  </div>
                )
              ) : (
                <div
                  className="rounded-2xl py-2.5 text-center text-xs"
                  style={{ background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.35)" }}
                >
                  Voting {mce.status === "Voting" ? "open" : "closed"} · {mce.participantCount.toLocaleString()}{" "}
                  participants
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Redemptions Tab ──────────────────────────────────────────────────────────

const _CAT_EMOJI: Record<string, string> = {
  Food: "🍱",
  Fitness: "🏋️",
  Transit: "🚌",
  Culture: "🎨",
  Essentials: "🛒",
};

function RedemptionsTab({
  offers,
  cityBalance,
  mceBalance,
  pastRedemptions,
  confirmId,
  onSelectConfirm,
  onRedeem,
}: {
  offers: ReturnType<typeof useDemo>["state"]["offers"];
  cityBalance: number;
  mceBalance: number;
  pastRedemptions: ReturnType<typeof useDemo>["state"]["pastRedemptions"];
  confirmId: string | null;
  onSelectConfirm: (id: string | null) => void;
  onRedeem: (id: string) => void;
}) {
  const confirmOffer = confirmId ? offers.find(o => o.id === confirmId) : null;
  const _canAfford = (o: typeof confirmOffer) => o && cityBalance >= o.costCity;

  return (
    <div className="px-5 py-6">
      {/* Balance summary */}
      <div className="mb-5 flex gap-3">
        <div
          className="flex-1 rounded-2xl p-3 text-center"
          style={{ background: "rgba(65,105,225,0.1)", border: "1px solid rgba(65,105,225,0.2)" }}
        >
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            Available
          </div>
          <div className="text-xl font-bold" style={{ color: "#4169E1" }}>
            {cityBalance}
          </div>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            CITY
          </div>
        </div>
        <div
          className="flex-1 rounded-2xl p-3 text-center"
          style={{ background: "rgba(52,238,182,0.08)", border: "1px solid rgba(52,238,182,0.15)" }}
        >
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            MCE Credits
          </div>
          <div className="text-xl font-bold" style={{ color: "#34eeb6" }}>
            {mceBalance}
          </div>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
            MCE
          </div>
        </div>
      </div>

      <SectionHeader title="Available Offers" />

      <div className="mb-6 space-y-3">
        {offers.map(offer => {
          const canAffordOffer = cityBalance >= offer.costCity;
          return (
            <div
              key={offer.id}
              className="rounded-3xl p-4"
              style={{
                background: "#1E1E2C",
                border: offer.mceOnly ? "1px solid rgba(221,158,51,0.25)" : "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xl"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    {offer.emoji}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <div className="text-sm font-semibold text-white">{offer.offerTitle}</div>
                      {offer.mceOnly && (
                        <span
                          className="rounded-full px-1.5 py-0.5 text-xs"
                          style={{ background: "rgba(221,158,51,0.2)", color: "#DD9E33" }}
                        >
                          MCE
                        </span>
                      )}
                    </div>
                    <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {offer.redeemerName}
                    </div>
                    <div className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                      {offer.description}
                    </div>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div
                    className="text-base font-bold"
                    style={{ color: canAffordOffer ? "#4169E1" : "rgba(255,255,255,0.25)" }}
                  >
                    {offer.costCity}
                  </div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
                    CITY
                  </div>
                </div>
              </div>

              <button
                onClick={() => canAffordOffer && onSelectConfirm(offer.id)}
                disabled={!canAffordOffer}
                className="mt-3 w-full rounded-2xl py-2 text-xs font-semibold transition"
                style={{
                  background: canAffordOffer ? "rgba(65,105,225,0.2)" : "rgba(255,255,255,0.05)",
                  color: canAffordOffer ? "#4169E1" : "rgba(255,255,255,0.2)",
                }}
              >
                {canAffordOffer
                  ? `Redeem for ${offer.costCity} CITY →`
                  : `Need ${offer.costCity - cityBalance} more CITY`}
              </button>
            </div>
          );
        })}
      </div>

      {/* Past redemptions */}
      {pastRedemptions.length > 0 && (
        <>
          <SectionHeader title="Past Redemptions" />
          <div className="space-y-2">
            {pastRedemptions.map(r => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-2xl px-4 py-3"
                style={{ background: "#1E1E2C" }}
              >
                <div>
                  <div className="text-sm font-medium text-white">{r.offerTitle}</div>
                  <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {r.redeemerName} · {new Date(r.redeemedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-sm font-semibold" style={{ color: "#ff6b9d" }}>
                  -{r.costCity} CITY
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Confirm modal */}
      {confirmOffer && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={() => onSelectConfirm(null)}
        >
          <div
            className="w-full rounded-t-3xl p-6 pb-10"
            style={{ background: "#1E1E2C", maxWidth: 480 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="mx-auto mb-5 h-1 w-12 rounded-full" style={{ background: "rgba(255,255,255,0.15)" }} />
            <div className="mb-4 text-xl font-bold text-white">Confirm Redemption</div>
            <div className="mb-4 rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.05)" }}>
              <div className="text-sm font-semibold text-white">{confirmOffer.offerTitle}</div>
              <div className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
                {confirmOffer.redeemerName}
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                  Cost
                </span>
                <span className="text-lg font-bold" style={{ color: "#4169E1" }}>
                  {confirmOffer.costCity} CITY
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                  Remaining
                </span>
                <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                  {cityBalance - confirmOffer.costCity} CITY
                </span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => onSelectConfirm(null)}
                className="flex-1 rounded-2xl py-3 text-sm font-semibold"
                style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.6)" }}
              >
                Cancel
              </button>
              <button
                onClick={() => onRedeem(confirmOffer.id)}
                className="flex-1 rounded-2xl py-3 text-sm font-semibold text-white"
                style={{ background: "#4169E1" }}
              >
                Confirm Burn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared micro-components ──────────────────────────────────────────────────

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

function BalanceCard({ label, value, color, desc }: { label: string; value: number; color: string; desc: string }) {
  return (
    <div className="rounded-2xl p-3 text-center" style={{ background: "#1E1E2C" }}>
      <div className="text-xs font-semibold" style={{ color }}>
        {label}
      </div>
      <div className="mt-1 text-xl font-bold text-white">{value}</div>
      <div className="text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>
        {desc}
      </div>
    </div>
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

function RewardItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold" style={{ color }}>
        {value}
      </div>
      <div className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
        {label}
      </div>
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
