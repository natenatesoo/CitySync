"use client";

import React from "react";

export interface NavTab {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface BottomNavProps {
  tabs: NavTab[];
  active: string;
  onChange: (key: string) => void;
}

export default function BottomNav({ tabs, active, onChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-end justify-around"
      style={{
        background: "#15151E",
        borderTop: "1px solid rgba(255,255,255,0.08)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        maxWidth: 480,
        margin: "0 auto",
      }}
    >
      {tabs.map(tab => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="flex flex-col items-center gap-0.5 py-2 px-3 transition-all"
            style={{
              color: isActive ? "#4169E1" : "rgba(255,255,255,0.45)",
              minWidth: 60,
              flex: 1,
            }}
          >
            <span
              className="transition-transform"
              style={{
                transform: isActive ? "scale(1.15)" : "scale(1)",
                display: "flex",
              }}
            >
              {tab.icon}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: isActive ? 600 : 400,
                letterSpacing: "0.02em",
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
