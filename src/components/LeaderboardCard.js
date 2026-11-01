import React, { useState } from "react";
import { Card, CardHeader } from "./common/Card";
import { SegmentedControl } from "./common/SegmentedControl";
import { RankRow } from "./common/RankRow";
import { Skeleton, EmptyState } from "./common/Skeleton";
import { Trophy, ChevronLeft, ChevronRight, Table } from "lucide-react";
import { getWeekBoundaries, getWeekCountdown, getMonthBoundaries } from "../utils/dateUtils";

export function LeaderboardCard({
  leaderboard = [],
  period = "week",
  view = "individuals",
  weekOffset = 0,
  monthOffset = 0,
  currentMemberId = null,
  onPeriodChange,
  onViewChange,
  onWeekOffsetChange,
  onMonthOffsetChange,
  onGroupClick,
  onOpenFullTable,
  loading = false,
}) {
  const [showAll, setShowAll] = useState(false);

  // Period header calculation
  const weekInfo = getWeekBoundaries(weekOffset);
  const monthInfo = getMonthBoundaries(monthOffset);
  const weekCountdown = getWeekCountdown(weekInfo.end);

  const displayRows = showAll ? leaderboard : leaderboard.slice(0, 15);

  return (
    <Card>
      <CardHeader
        title="Leaderboard"
        icon={<Trophy size={18} />}
        action={
          <SegmentedControl
            options={[
              { value: "individuals", label: "Individuals" },
              { value: "groups", label: "Groups" },
            ]}
            value={view}
            onChange={onViewChange}
            ariaLabel="View switcher"
          />
        }
      />

      {/* Period Selector Controls */}
      <div className="controls-bar">
        <SegmentedControl
          options={[
            { value: "week", label: "Week" },
            { value: "month", label: "Month" },
            { value: "all", label: "All time" },
          ]}
          value={period}
          onChange={onPeriodChange}
          ariaLabel="Period selector"
        />

        {/* Season Navigators */}
        {period === "week" && (
          <div className="season-selector">
            <button
              type="button"
              className="season-nav-btn"
              onClick={() => onWeekOffsetChange(weekOffset - 1)}
              title="Previous week"
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-secondary)" }}>
              {weekInfo.label}
            </span>
            <button
              type="button"
              className="season-nav-btn"
              onClick={() => onWeekOffsetChange(weekOffset + 1)}
              disabled={weekOffset >= 0}
              title="Next week"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {period === "month" && (
          <div className="season-selector">
            <button
              type="button"
              className="season-nav-btn"
              onClick={() => onMonthOffsetChange(monthOffset - 1)}
              title="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-secondary)" }}>
              {monthInfo.label}
            </span>
            <button
              type="button"
              className="season-nav-btn"
              onClick={() => onMonthOffsetChange(monthOffset + 1)}
              disabled={monthOffset >= 0}
              title="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Week countdown banner */}
      {period === "week" && weekOffset === 0 && (
        <div className="season-info-bar">
          <span>Weekly Season (Mon 00:00 - Sun 23:59 IST)</span>
          <span className="countdown-badge">{weekCountdown}</span>
        </div>
      )}

      {/* Ranked rows list */}
      {loading ? (
        <div style={{ padding: "var(--space-4)" }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "12px", alignItems: "center" }}>
              <Skeleton width="24px" height="18px" />
              <Skeleton width="32px" height="32px" borderRadius="50%" />
              <Skeleton width="160px" height="16px" />
              <Skeleton width="60px" height="16px" style={{ marginLeft: "auto" }} />
            </div>
          ))}
        </div>
      ) : displayRows.length === 0 ? (
        <EmptyState title="No karma earned in this period" description="Be the first to complete a task and earn karma!" />
      ) : (
        <div className="ranked-list">
          {displayRows.map((item) => (
            <RankRow
              key={item.id}
              rank={item.rank}
              name={item.name}
              groupName={item.group_name || item.name}
              groupColor={item.color || item.group_color}
              karma={item.karma}
              movement={item.movement}
              gap={item.gap}
              streak={item.streak}
              isMVP={item.isMVP}
              isUnderdog={item.isUnderdog}
              isCurrentUser={item.id === currentMemberId}
              view={view}
              onGroupClick={() => onGroupClick(view === "groups" ? item.id : item.group_id)}
            />
          ))}
        </div>
      )}

      {/* Card footer: Show more & Show full table */}
      <div
        style={{
          padding: "var(--space-3) var(--space-5)",
          borderTop: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: "var(--subtle-surface)",
        }}
      >
        {leaderboard.length > 15 ? (
          <button
            type="button"
            onClick={() => setShowAll(!showAll)}
            style={{
              fontSize: "0.8125rem",
              fontWeight: 600,
              color: "var(--accent)",
              padding: "4px 8px",
              borderRadius: "6px",
            }}
          >
            {showAll ? "Show top 15" : `Show all ${leaderboard.length}`}
          </button>
        ) : <span />}

        <button
          type="button"
          onClick={onOpenFullTable}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "0.8125rem",
            fontWeight: 600,
            color: "var(--text-secondary)",
            padding: "5px 10px",
            borderRadius: "6px",
            border: "1px solid var(--border)",
            backgroundColor: "var(--surface)",
            boxShadow: "var(--shadow-subtle)",
          }}
        >
          <Table size={14} />
          <span>Show full table</span>
        </button>
      </div>
    </Card>
  );
}

