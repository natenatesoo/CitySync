"use client";

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from "react";
import {
  Task,
  MCEProposal,
  RedemptionOffer,
  CompletedTask,
  PastRedemption,
  MOCK_TASKS,
  MOCK_MCES,
  MOCK_OFFERS,
  FAKE_WALLETS,
} from "../_data/mockData";

// ─── Types ────────────────────────────────────────────────────────────────────

export type Role = "participant" | "issuer" | "redeemer" | null;

export interface IssuerTask extends Task {
  pendingCompletions: string[]; // citizen "addresses" who claimed but need verification
  verifiedCount: number;
}

export interface ParticipantState {
  cityBalance: number;
  voteBalance: number;
  mceBalance: number;
  claimedTaskIds: string[];
  completedTasks: CompletedTask[];
  mceVotes: Record<string, "for" | "against">; // mceId → vote
}

export interface IssuerState {
  orgName: string;
  registered: boolean;
  tasks: IssuerTask[];
  totalCreditsIssued: number;
  totalTasksIssued: number;
}

export interface RedeemerState {
  orgName: string;
  registered: boolean;
  acceptsMCE: boolean;
  offers: RedemptionOffer[];
  redemptionQueue: QueuedRedemption[];
  processedRedemptions: ProcessedRedemption[];
}

export interface QueuedRedemption {
  id: string;
  citizenAddress: string;
  offerId: string;
  offerTitle: string;
  costCity: number;
  timestamp: string;
}

export interface ProcessedRedemption {
  id: string;
  citizenAddress: string;
  offerId: string;
  offerTitle: string;
  costCity: number;
  processedAt: string;
  txHash: string;
}

export interface VerifyingState {
  taskId: string;
  taskTitle: string;
  secondsRemaining: number;
}

export interface DemoState {
  role: Role;
  participant: ParticipantState;
  issuer: IssuerState;
  redeemer: RedeemerState;
  mces: MCEProposal[];
  availableTasks: Task[];
  offers: RedemptionOffer[];
  verifying: VerifyingState | null;
  pastRedemptions: PastRedemption[];
  notifications: string[];
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: "SET_ROLE"; role: Role }
  | { type: "CLAIM_TASK"; taskId: string }
  | { type: "START_VERIFY"; taskId: string; taskTitle: string }
  | { type: "TICK_VERIFY" }
  | { type: "COMPLETE_VERIFY" }
  | { type: "VOTE_MCE"; mceId: string; direction: "for" | "against"; weight: number }
  | { type: "REDEEM_OFFER"; offerId: string }
  | { type: "ISSUER_REGISTER"; orgName: string }
  | { type: "ISSUER_CREATE_TASK"; task: Task }
  | { type: "ISSUER_VERIFY_COMPLETION"; taskId: string; citizenAddress: string }
  | { type: "REDEEMER_REGISTER"; orgName: string }
  | { type: "REDEEMER_TOGGLE_MCE" }
  | { type: "REDEEMER_ADD_OFFER"; offer: RedemptionOffer }
  | { type: "REDEEMER_REMOVE_OFFER"; offerId: string }
  | { type: "REDEEMER_PROCESS_REDEMPTION"; queueId: string }
  | { type: "ADD_QUEUE_REDEMPTION"; redemption: QueuedRedemption }
  | { type: "CLEAR_NOTIFICATION" };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const randomTxHash = () =>
  "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

const randomAddress = () =>
  "0x" + Array.from({ length: 4 }, () => Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0")).join("") +
  "..." +
  Array.from({ length: 4 }, () => Math.floor(Math.random() * 0xffff).toString(16).padStart(4, "0")).join("");

const VERIFY_DURATION = 12; // seconds

// ─── Issuer org name generator ────────────────────────────────────────────────

const PREFIXES = ["Metro", "Civic", "Urban", "Green", "Public", "Community", "City", "Open"];
const SUFFIXES = ["Initiative", "Coalition", "Alliance", "Network", "Foundation", "Collaborative", "Works", "Commons"];
const VENUES = ["Market", "Gym", "Library", "Transit Pass", "Kitchen", "Arts Center", "Co-op", "Hub"];
const ADJECTIVES = ["Local", "Corner", "City", "Central", "Community", "District"];

export const generateIssuerName = (seed: number) =>
  `${PREFIXES[seed % PREFIXES.length]} ${SUFFIXES[(seed * 3) % SUFFIXES.length]}`;

export const generateRedeemerName = (seed: number) =>
  `${ADJECTIVES[seed % ADJECTIVES.length]} ${VENUES[(seed * 2) % VENUES.length]}`;

// ─── Initial State ────────────────────────────────────────────────────────────

const INITIAL_STATE: DemoState = {
  role: null,
  participant: {
    cityBalance: 0,
    voteBalance: 0,
    mceBalance: 0,
    claimedTaskIds: [],
    completedTasks: [],
    mceVotes: {},
  },
  issuer: {
    orgName: "",
    registered: false,
    tasks: [],
    totalCreditsIssued: 0,
    totalTasksIssued: 0,
  },
  redeemer: {
    orgName: "",
    registered: false,
    acceptsMCE: false,
    offers: [],
    redemptionQueue: [],
    processedRedemptions: [],
  },
  mces: MOCK_MCES,
  availableTasks: MOCK_TASKS,
  offers: MOCK_OFFERS,
  verifying: null,
  pastRedemptions: [],
  notifications: [],
};

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: DemoState, action: Action): DemoState {
  switch (action.type) {
    case "SET_ROLE": {
      // Auto-register on role selection for demo smoothness
      const now = Date.now();
      if (action.role === "issuer" && !state.issuer.registered) {
        const orgName = generateIssuerName(now % PREFIXES.length);
        return {
          ...state,
          role: action.role,
          issuer: { ...state.issuer, registered: true, orgName },
        };
      }
      if (action.role === "redeemer" && !state.redeemer.registered) {
        const orgName = generateRedeemerName(now % ADJECTIVES.length);
        return {
          ...state,
          role: action.role,
          redeemer: { ...state.redeemer, registered: true, orgName },
        };
      }
      return { ...state, role: action.role };
    }

    case "CLAIM_TASK": {
      if (state.participant.claimedTaskIds.includes(action.taskId)) return state;
      // Reduce available slot count
      const updatedTasks = state.availableTasks.map(t =>
        t.id === action.taskId ? { ...t, slotsRemaining: Math.max(0, t.slotsRemaining - 1) } : t,
      );
      return {
        ...state,
        participant: {
          ...state.participant,
          claimedTaskIds: [...state.participant.claimedTaskIds, action.taskId],
        },
        availableTasks: updatedTasks,
      };
    }

    case "START_VERIFY": {
      return {
        ...state,
        verifying: { taskId: action.taskId, taskTitle: action.taskTitle, secondsRemaining: VERIFY_DURATION },
      };
    }

    case "TICK_VERIFY": {
      if (!state.verifying) return state;
      const next = state.verifying.secondsRemaining - 1;
      if (next <= 0) return state; // handled by COMPLETE_VERIFY
      return { ...state, verifying: { ...state.verifying, secondsRemaining: next } };
    }

    case "COMPLETE_VERIFY": {
      if (!state.verifying) return state;
      const task = state.availableTasks.find(t => t.id === state.verifying!.taskId);
      if (!task) return { ...state, verifying: null };

      const completed: CompletedTask = {
        taskId: task.id,
        title: task.title,
        credits: task.credits,
        voteTokens: task.voteTokens,
        completedAt: new Date().toISOString(),
        issuerName: task.issuerName,
        txHash: randomTxHash(),
      };

      return {
        ...state,
        verifying: null,
        participant: {
          ...state.participant,
          cityBalance: state.participant.cityBalance + task.credits,
          voteBalance: state.participant.voteBalance + task.voteTokens,
          mceBalance: task.isMCE ? state.participant.mceBalance + task.credits : state.participant.mceBalance,
          claimedTaskIds: state.participant.claimedTaskIds.filter(id => id !== task.id),
          completedTasks: [completed, ...state.participant.completedTasks],
        },
      };
    }

    case "VOTE_MCE": {
      if (state.participant.mceVotes[action.mceId]) return state; // already voted
      const updatedMces = state.mces.map(m => {
        if (m.id !== action.mceId) return m;
        return {
          ...m,
          votesFor: action.direction === "for" ? m.votesFor + action.weight : m.votesFor,
          votesAgainst: action.direction === "against" ? m.votesAgainst + action.weight : m.votesAgainst,
        };
      });
      return {
        ...state,
        mces: updatedMces,
        participant: {
          ...state.participant,
          mceVotes: { ...state.participant.mceVotes, [action.mceId]: action.direction },
        },
      };
    }

    case "REDEEM_OFFER": {
      const offer = state.offers.find(o => o.id === action.offerId);
      if (!offer) return state;
      if (state.participant.cityBalance < offer.costCity) return state;

      const redemption: PastRedemption = {
        id: `redemption-${Date.now()}`,
        offerTitle: offer.offerTitle,
        redeemerName: offer.redeemerName,
        costCity: offer.costCity,
        redeemedAt: new Date().toISOString(),
        txHash: randomTxHash(),
      };

      // Also add to redeemer queue for cross-role simulation
      const queued: QueuedRedemption = {
        id: redemption.id,
        citizenAddress: FAKE_WALLETS.participant,
        offerId: offer.id,
        offerTitle: offer.offerTitle,
        costCity: offer.costCity,
        timestamp: redemption.redeemedAt,
      };

      return {
        ...state,
        participant: {
          ...state.participant,
          cityBalance: state.participant.cityBalance - offer.costCity,
          mceBalance: offer.mceOnly ? state.participant.mceBalance - offer.costCity : state.participant.mceBalance,
        },
        pastRedemptions: [redemption, ...state.pastRedemptions],
        redeemer: {
          ...state.redeemer,
          redemptionQueue: [queued, ...state.redeemer.redemptionQueue],
        },
      };
    }

    // ── Issuer actions ────────────────────────────────────────────────────────

    case "ISSUER_REGISTER": {
      return {
        ...state,
        issuer: { ...state.issuer, registered: true, orgName: action.orgName },
      };
    }

    case "ISSUER_CREATE_TASK": {
      const issuerTask: IssuerTask = {
        ...action.task,
        pendingCompletions: [],
        verifiedCount: 0,
      };
      // Simulate some pending completions appearing
      const mockPending = Array.from({ length: Math.floor(Math.random() * 3) }, () => randomAddress());
      issuerTask.pendingCompletions = mockPending;

      return {
        ...state,
        availableTasks: [...state.availableTasks, action.task],
        issuer: {
          ...state.issuer,
          tasks: [...state.issuer.tasks, issuerTask],
          totalTasksIssued: state.issuer.totalTasksIssued + 1,
        },
      };
    }

    case "ISSUER_VERIFY_COMPLETION": {
      const task = state.availableTasks.find(t => t.id === action.taskId);
      if (!task) return state;

      const updatedTasks = state.issuer.tasks.map(t => {
        if (t.id !== action.taskId) return t;
        return {
          ...t,
          pendingCompletions: t.pendingCompletions.filter(a => a !== action.citizenAddress),
          verifiedCount: t.verifiedCount + 1,
        };
      });

      return {
        ...state,
        issuer: {
          ...state.issuer,
          tasks: updatedTasks,
          totalCreditsIssued: state.issuer.totalCreditsIssued + task.credits,
        },
      };
    }

    // ── Redeemer actions ──────────────────────────────────────────────────────

    case "REDEEMER_REGISTER": {
      return {
        ...state,
        redeemer: { ...state.redeemer, registered: true, orgName: action.orgName },
      };
    }

    case "REDEEMER_TOGGLE_MCE": {
      return {
        ...state,
        redeemer: { ...state.redeemer, acceptsMCE: !state.redeemer.acceptsMCE },
      };
    }

    case "REDEEMER_ADD_OFFER": {
      return {
        ...state,
        redeemer: { ...state.redeemer, offers: [...state.redeemer.offers, action.offer] },
        offers: [...state.offers, action.offer],
      };
    }

    case "REDEEMER_REMOVE_OFFER": {
      return {
        ...state,
        redeemer: {
          ...state.redeemer,
          offers: state.redeemer.offers.filter(o => o.id !== action.offerId),
        },
      };
    }

    case "REDEEMER_PROCESS_REDEMPTION": {
      const queued = state.redeemer.redemptionQueue.find(r => r.id === action.queueId);
      if (!queued) return state;

      const processed: ProcessedRedemption = {
        ...queued,
        processedAt: new Date().toISOString(),
        txHash: randomTxHash(),
      };

      return {
        ...state,
        redeemer: {
          ...state.redeemer,
          redemptionQueue: state.redeemer.redemptionQueue.filter(r => r.id !== action.queueId),
          processedRedemptions: [processed, ...state.redeemer.processedRedemptions],
        },
      };
    }

    case "ADD_QUEUE_REDEMPTION": {
      return {
        ...state,
        redeemer: {
          ...state.redeemer,
          redemptionQueue: [action.redemption, ...state.redeemer.redemptionQueue],
        },
      };
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface DemoContextValue {
  state: DemoState;
  setRole: (role: Role) => void;
  claimTask: (taskId: string) => void;
  startVerify: (taskId: string, taskTitle: string) => void;
  voteOnMCE: (mceId: string, direction: "for" | "against") => void;
  redeemOffer: (offerId: string) => void;
  issuerCreateTask: (task: Task) => void;
  issuerVerifyCompletion: (taskId: string, citizenAddress: string) => void;
  redeemerToggleMCE: () => void;
  redeemerAddOffer: (offer: RedemptionOffer) => void;
  redeemerRemoveOffer: (offerId: string) => void;
  redeemerProcessRedemption: (queueId: string) => void;
  dispatch: React.Dispatch<Action>;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);

  const setRole = useCallback((role: Role) => dispatch({ type: "SET_ROLE", role }), []);
  const claimTask = useCallback((taskId: string) => dispatch({ type: "CLAIM_TASK", taskId }), []);

  const startVerify = useCallback(
    (taskId: string, taskTitle: string) => {
      dispatch({ type: "START_VERIFY", taskId, taskTitle });
      let remaining = VERIFY_DURATION;
      const interval = setInterval(() => {
        remaining -= 1;
        dispatch({ type: "TICK_VERIFY" });
        if (remaining <= 0) {
          clearInterval(interval);
          dispatch({ type: "COMPLETE_VERIFY" });
        }
      }, 1000);
    },
    [],
  );

  const voteOnMCE = useCallback(
    (mceId: string, direction: "for" | "against") => {
      const weight = Math.max(1, state.participant.voteBalance);
      dispatch({ type: "VOTE_MCE", mceId, direction, weight });
    },
    [state.participant.voteBalance],
  );

  const redeemOffer = useCallback((offerId: string) => dispatch({ type: "REDEEM_OFFER", offerId }), []);

  const issuerCreateTask = useCallback(
    (task: Task) => dispatch({ type: "ISSUER_CREATE_TASK", task }),
    [],
  );

  const issuerVerifyCompletion = useCallback(
    (taskId: string, citizenAddress: string) =>
      dispatch({ type: "ISSUER_VERIFY_COMPLETION", taskId, citizenAddress }),
    [],
  );

  const redeemerToggleMCE = useCallback(() => dispatch({ type: "REDEEMER_TOGGLE_MCE" }), []);

  const redeemerAddOffer = useCallback(
    (offer: RedemptionOffer) => dispatch({ type: "REDEEMER_ADD_OFFER", offer }),
    [],
  );

  const redeemerRemoveOffer = useCallback(
    (offerId: string) => dispatch({ type: "REDEEMER_REMOVE_OFFER", offerId }),
    [],
  );

  const redeemerProcessRedemption = useCallback(
    (queueId: string) => dispatch({ type: "REDEEMER_PROCESS_REDEMPTION", queueId }),
    [],
  );

  return (
    <DemoContext.Provider
      value={{
        state,
        setRole,
        claimTask,
        startVerify,
        voteOnMCE,
        redeemOffer,
        issuerCreateTask,
        issuerVerifyCompletion,
        redeemerToggleMCE,
        redeemerAddOffer,
        redeemerRemoveOffer,
        redeemerProcessRedemption,
        dispatch,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within DemoProvider");
  return ctx;
}
