import React from "react";
import { Avatar } from "./Avatar";
import { MovementBadge } from "./MovementBadge";
import { StreakBadge } from "./StreakBadge";
import { GapBadge } from "./GapBadge";
import Crest from "../../crests";

export function RankRow({
  rank,
  name,
  groupName,
  groupColor,
  karma,
  movement,
  gap,
  streak,
  isMVP = false,
  isUnderdog = false,
  isCurrentUser = false,
  onGroupClick,
  view = "individuals",
}) {
  const medalClass = rank === 1 ? "gold" : rank === 2 ? "silver" : rank === 3 ? "bronze" : null;

  return (
    <div className={`rank-row ${isCurrentUser ? "is-current-user" : ""}`}>
      {/* Position column */}
      <div className="rank-col-position">
        <span className="rank-number tabular-nums">{rank}</span>
        {medalClass ? (
          <span className={`medal-dot ${medalClass}`} title={`Rank ${rank}`} />
        ) : (
          <span style={{ width: "6px" }} />
        )}
      </div>

      {/* Avatar column */}
      <div className="rank-col-avatar">
        {view === "groups" ? (
          <Crest group={name} size="sm" />
        ) : (
          <Avatar name={name} size={32} />
        )}
      </div>

      {/* Info column */}
      <div className="rank-col-info">
        <div className="entity-name-row" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
          <span className="entity-name" title={name}>
            {name}
          </span>
          {isMVP && <span className="mvp-pill">MVP</span>}
          {isUnderdog && (
            <span
              style={{
                fontSize: "0.5625rem",
                fontWeight: 700,
                padding: "1px 5px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "#FEF3C7",
                color: "#B45309",
                border: "1px solid #FDE68A",
              }}
              title="Underdog: Most improved ranking this period"
            >
              UNDERDOG
            </span>
          )}
          {streak && <StreakBadge streak={streak} compact={true} />}
        </div>

        {view === "individuals" ? (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              type="button"
              className="group-badge-line"
              onClick={(e) => {
                e.stopPropagation();
                if (onGroupClick) onGroupClick();
              }}
              title={`View ${groupName} details`}
            >
              <Crest group={groupName} size="xs" />
              <span>{groupName}</span>
            </button>
            {isCurrentUser && gap && (
              <GapBadge gap={gap} compact={false} showProgress={true} />
            )}
          </div>
        ) : (
          <div style={{ marginTop: "2px" }}>
            <GapBadge gap={gap} compact={true} showProgress={true} />
          </div>
        )}
      </div>

      {/* Karma column */}
      <div className="rank-col-karma">
        <span className="karma-amount tabular-nums">
          {typeof karma === "number" ? karma.toLocaleString("en-IN") : karma}
        </span>
        <span className="karma-label">karma</span>
      </div>

      {/* Movement column */}
      <div className="rank-col-movement">
        <MovementBadge movement={movement} />
      </div>
    </div>
  );
}
