"use client";

import React from "react";

export type LearnInfoCard = {
  title: string;
  subtitle: string;
  body: string;
};

export function LearnMoreLink({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "transparent",
        border: "none",
        color: "rgba(255,255,255,0.6)",
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 600,
      }}
    >
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.4)",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          lineHeight: 1,
        }}
      >
        i
      </span>
      Learn More
    </button>
  );
}

export function LearnMorePanel<TKey extends string>({
  keys,
  cards,
  onClose,
  accent,
}: {
  keys: TKey[];
  cards: Record<TKey, LearnInfoCard>;
  onClose: (key: TKey) => void;
  accent: string;
}) {
  if (keys.length === 0) return null;

  return (
    <>
      {keys.map(key => {
        const info = cards[key];
        if (!info) return null;
        return (
          <div
            key={key}
            style={{
              background: "rgba(255,255,255,0.025)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: 8 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{info.title}</div>
                <div style={{ fontSize: 11, color: accent, fontWeight: 600, marginBottom: 8 }}>{info.subtitle}</div>
              </div>
              <button
                onClick={() => onClose(key)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255,255,255,0.45)",
                  cursor: "pointer",
                  fontSize: 16,
                }}
              >
                ×
              </button>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>{info.body}</div>
          </div>
        );
      })}
    </>
  );
}
