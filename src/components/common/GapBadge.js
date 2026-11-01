import React from "react";

export function GapBadge({ gap, compact = true, showProgress = true }) {
  if (!gap) return null;

  const { isLeader, text, compactText, progress } = gap;
  const displayText = compact ? compactText : text;

  return (
    <div
      style={{
        display: "inline-flex",
        flexDirection: "column",
        gap: "2px",
        fontSize: "0.6875rem",
        color: "var(--text-muted)",
      }}
      title={text}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
        <span className="tabular-nums" style={{ fontWeight: 500 }}>
          {displayText}
        </span>
      </div>

      {showProgress && !isLeader && progress > 0 && progress < 1 && (
        <div
          style={{
            width: "48px",
            height: "3px",
            backgroundColor: "var(--border)",
            borderRadius: "2px",
            overflow: "hidden",
          }}
          title={`${Math.round(progress * 100)}% progress toward next rank`}
        >
          <div
            style={{
              width: `${Math.round(progress * 100)}%`,
              height: "100%",
              backgroundColor: "var(--accent)",
              borderRadius: "2px",
            }}
          />
        </div>
      )}
    </div>
  );
}

