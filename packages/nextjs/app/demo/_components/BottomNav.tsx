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
  accentColor?: string;
}

export default function BottomNav({ tabs, active, onChange, accentColor = "#4169E1" }: BottomNavProps) {
  const activeBg = `${accentColor}20`;

  return (
    <nav
      className="absolute left-0 right-0 z-40 flex items-center justify-around"
      style={{
        bottom: 0,
        background: "rgba(24,24,38,0.97)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "0 -8px 24px rgba(0,0,0,0.35)",
        backdropFilter: "blur(14px)",
        padding: "6px 6px calc(10px + env(safe-area-inset-bottom, 0px))",
      }}
    >
      {tabs.map(tab => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className="flex flex-col items-center justify-center gap-0.5 rounded-xl py-2 px-3 transition-all"
            style={{
              color: isActive ? accentColor : "rgba(255,255,255,0.45)",
              minHeight: 52,
              minWidth: 58,
              flex: 1,
              background: isActive ? activeBg : "transparent",
            }}
          >
            <span
              className="transition-transform"
              style={{
                transform: isActive ? "scale(1.08)" : "scale(1)",
                display: "flex",
              }}
            >
              {tab.icon}
            </span>
            <span
              style={{
                fontSize: 11,
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
