"use client";

import React from "react";

interface VerifyingOverlayProps {
  taskTitle: string;
  secondsRemaining: number;
  total?: number;
}

const TOTAL = 12;

const MESSAGES = [
  "Submitting proof to oracle…",
  "Oracle verifying on-chain…",
  "Awaiting issuer signature…",
  "Minting CITY credits…",
  "Recording to blockchain…",
  "Finalizing transaction…",
];

export default function VerifyingOverlay({ taskTitle, secondsRemaining, total = TOTAL }: VerifyingOverlayProps) {
  const elapsed = total - secondsRemaining;
  const progress = Math.min(100, (elapsed / total) * 100);
  const msgIdx = Math.min(MESSAGES.length - 1, Math.floor((elapsed / total) * MESSAGES.length));
  const message = MESSAGES[msgIdx];

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: "rgba(21,21,30,0.96)", backdropFilter: "blur(8px)" }}
    >
      {/* Spinning ring */}
      <div className="relative mb-8 flex h-28 w-28 items-center justify-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="#4169E1"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 54}`}
            strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
            style={{ transition: "stroke-dashoffset 0.9s ease" }}
          />
        </svg>
        <div className="text-center">
          <div className="text-3xl font-bold text-white">{secondsRemaining}</div>
          <div className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>
            sec
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mb-2 text-lg font-semibold text-white">Verifying Completion</div>
      <div className="mb-8 max-w-xs px-4 text-center text-sm" style={{ color: "rgba(255,255,255,0.55)" }}>
        {taskTitle}
      </div>

      {/* Animated message */}
      <div
        className="rounded-xl px-5 py-2.5 text-sm font-medium"
        style={{ background: "rgba(65,105,225,0.15)", color: "#4169E1", border: "1px solid rgba(65,105,225,0.3)" }}
      >
        {message}
      </div>

      {/* Progress dots */}
      <div className="mt-6 flex gap-2">
        {MESSAGES.map((_, i) => (
          <div
            key={i}
            className="h-1.5 rounded-full transition-all"
            style={{
              width: i === msgIdx ? 24 : 6,
              background: i <= msgIdx ? "#4169E1" : "rgba(255,255,255,0.15)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
