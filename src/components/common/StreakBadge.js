import React from "react";
import { Flame } from "lucide-react";

export function StreakBadge({ streak, compact = false }) {
  if (!streak || streak.currentStreak <= 0) {
    return null;
  }

  const { currentStreak, longestStreak, isAtRisk, statusText } = streak;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "3px",
        fontSize: "0.6875rem",
        fontWeight: 600,
        padding: "1px 6px",
        borderRadius: "var(--radius-full)",
        backgroundColor: isAtRisk ? "var(--status-down-bg)" : "var(--status-up-bg)",
        color: isAtRisk ? "var(--status-down)" : "var(--status-up)",
        border: `1px solid ${isAtRisk ? "#FECACA" : "#BBF7D0"}`,
      }}
      title={`${statusText} • Longest streak: ${longestStreak} days`}
    >
      <Flame size={12} strokeWidth={2.2} />
      <span className="tabular-nums">{currentStreak}d</span>
      {!compact && isAtRisk && (
        <span style={{ fontSize: "0.625rem", fontWeight: 500 }}>• Ends tonight</span>
      )}
    </div>
  );
}

