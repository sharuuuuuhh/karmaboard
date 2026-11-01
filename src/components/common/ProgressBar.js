import React from "react";

export function ProgressBar({ goal, height = 6, showLabel = true, compact = false }) {
  if (!goal) return null;

  const { percent, isReached, paceText, statusLabel } = goal;
  const clampedPercent = Math.min(100, Math.max(0, percent));

  const barColor = isReached ? "var(--status-up)" : "var(--accent)";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3px", width: "100%" }}>
      {showLabel && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.6875rem" }}>
          <span className="tabular-nums" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
            {statusLabel}
          </span>
          <span
            style={{
              fontWeight: 600,
              fontSize: "0.625rem",
              color: isReached ? "var(--status-up)" : paceText === "On pace" ? "var(--text-muted)" : "var(--status-down)",
            }}
          >
            {paceText}
          </span>
        </div>
      )}

      <div
        style={{
          width: "100%",
          height: `${height}px`,
          backgroundColor: "var(--border)",
          borderRadius: "var(--radius-full)",
          overflow: "hidden",
        }}
        title={`${percent}% complete (${paceText})`}
      >
        <div
          style={{
            width: `${clampedPercent}%`,
            height: "100%",
            backgroundColor: barColor,
            borderRadius: "var(--radius-full)",
            transition: "width 0.3s ease",
          }}
        />
      </div>
    </div>
  );
}

