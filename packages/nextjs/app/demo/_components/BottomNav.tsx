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
      className="absolute left-3 right-3 z-40 flex items-center justify-around rounded-2xl"
      style={{
        bottom: "calc(10px + env(safe-area-inset-bottom, 0px))",
        background: "rgba(24,24,38,0.9)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
        backdropFilter: "blur(10px)",
        padding: "6px",
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
