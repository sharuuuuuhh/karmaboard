import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight, Minus, Crown } from "lucide-react";
import { getGroupToken } from "../../utils/groupTokens";
import {
  generateHeadlineSentence,
  formatRankLabel,
} from "../../utils/dashboardHelpers";
import Crest from "../../crests";

export default function LeaderboardTableCard({
  individuals = [],
  groups = [],
  period = "week",
  showPeriodSelector = false,
  onPeriodChange,
  selectedGroupId = "all",
  onSelectGroup,
}) {
  // Filter out 0 karma
  const activeMembers = individuals.filter((m) => (m.karma || 0) > 0);
  const rows = activeMembers.slice(0, 5);

  const headline = generateHeadlineSentence(groups, period);

  const periods = [
    { id: "week", label: "Week" },
    { id: "month", label: "Month" },
    { id: "all", label: "All time" },
  ];

  const groupChips = [
    { id: "all", label: "All" },
    { id: "TECH", label: "TECH" },
    { id: "LEADS", label: "LEADS" },
    { id: "OPERATION", label: "OPERATION" },
    { id: "MEDIA", label: "MEDIA" },
    { id: "MARKETING", label: "MARKETING" },
    { id: "CONTENT", label: "CONTENT" },
    { id: "CREATIVE", label: "CREATIVE" },
  ];

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: "24px",
        boxShadow: "var(--shadow-soft)",
        minWidth: 0,
      }}
    >
      {/* Top Header: Headline Sentence + Period Pills */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            color: "var(--text-primary)",
            letterSpacing: "-0.02em",
            fontFamily: "var(--font-display)",
          }}
        >
          {headline}
        </h3>

        {/* Period Pills (hidden when controlled globally) */}
        {showPeriodSelector && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              background: "var(--surface-subtle)",
              padding: 3,
              borderRadius: "var(--radius-pill)",
            }}
          >
            {periods.map((p) => {
              const isActive = period === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onPeriodChange && onPeriodChange(p.id)}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "var(--radius-pill)",
                    fontSize: 12,
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                    background: isActive ? "#FFFFFF" : "transparent",
                    boxShadow: isActive ? "0 1px 3px rgba(0, 0, 0, 0.08)" : "none",
                    transition: "all 0.15s ease",
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Group Filter Chips Row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          overflowX: "auto",
          paddingBottom: 14,
          marginBottom: 8,
          scrollbarWidth: "none",
        }}
      >
        {groupChips.map((chip) => {
          const isSelected = selectedGroupId === chip.id;
          const token = chip.id !== "all" ? getGroupToken(chip.id) : null;
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => onSelectGroup && onSelectGroup(isSelected && chip.id !== "all" ? "all" : chip.id)}
              style={{
                padding: "4px 12px",
                borderRadius: "var(--radius-pill)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                fontFamily: "var(--font-body)",
                textTransform: "uppercase",
                color: isSelected
                  ? chip.id === "all" ? "#FFFFFF" : token.ink
                  : "var(--text-secondary)",
                background: isSelected
                  ? chip.id === "all" ? "var(--text-primary)" : token.pastel
                  : "var(--surface-subtle)",
                border: isSelected && token ? `1px solid ${token.ink}44` : "1px solid transparent",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.15s ease",
              }}
            >
              {chip.label}
            </button>
          );
        })}
      </div>

      {/* Table Content */}
      {rows.length === 0 ? (
        <div
          style={{
            padding: "48px 16px",
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: 13,
          }}
        >
          No karma this week yet.
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="clean-table">
            <thead>
              <tr>
                <th style={{ width: 48 }}>Rank</th>
                <th>Name</th>
                <th>Group</th>
                <th style={{ textAlign: "right" }}>Karma</th>
                <th style={{ width: 70, textAlign: "center" }}>Change</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((mem, idx) => {
                const rankNum = idx + 1;
                const token = getGroupToken(mem.group_name || mem.group_id);
                const isGroupMvp = Boolean(mem.is_group_mvp);

                // Movement calculation
                const changeVal = mem.movement || 0;

                return (
                  <tr key={mem.muid || mem.id || idx}>
                    {/* Rank */}
                    <td
                      className="tabular-nums"
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: "var(--font-numeric)",
                        fontVariantNumeric: "tabular-nums",
                        color: rankNum === 1 ? "var(--chart-line)" : "var(--text-secondary)",
                      }}
                    >
                      {formatRankLabel(rankNum, mem.is_tie)}
                    </td>

                    {/* Name + Initials Avatar + MUID */}
                    <td>
                      <Link
                        to={`/u/${encodeURIComponent(mem.muid)}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          textDecoration: "none",
                          color: "inherit",
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: token.pastel,
                            color: token.ink,
                            fontSize: 11,
                            fontWeight: 700,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          {getInitials(mem.name)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: "var(--text-primary)",
                                whiteSpace: "nowrap",
                                fontFamily: "var(--font-body)",
                              }}
                            >
                              {mem.name}
                            </span>
                            {/* MVP mark only on the current group MVP */}
                            {isGroupMvp && (
                              <span
                                title="Group MVP this week"
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  color: "var(--ink-operation)",
                                }}
                              >
                                <Crown size={13} fill="currentColor" />
                              </span>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              color: "var(--text-muted)",
                              fontFamily: "var(--font-body)",
                            }}
                          >
                            {mem.muid}
                          </span>
                        </div>
                      </Link>
                    </td>

                    {/* Group Crest (sm 36px), left-aligned with sr-only text for sorting */}
                    <td>
                      <Crest group={mem.group_name || mem.group_id} size="sm" />
                    </td>

                    {/* Karma Number */}
                    <td
                      className="tabular-nums"
                      style={{
                        textAlign: "right",
                        fontSize: 14,
                        fontWeight: 700,
                        fontFamily: "var(--font-numeric)",
                        fontVariantNumeric: "tabular-nums",
                        color: "var(--text-primary)",
                      }}
                    >
                      {(mem.karma || 0).toLocaleString()}
                    </td>

                    {/* Change Arrow */}
                    <td style={{ textAlign: "center" }}>
                      {changeVal > 0 ? (
                        <span
                          className="tabular-nums"
                          style={{
                            color: "var(--status-up)",
                            display: "inline-flex",
                            alignItems: "center",
                            fontSize: 12,
                            fontWeight: 700,
                            fontFamily: "var(--font-numeric)",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          <ArrowUpRight size={14} />
                          <span>{changeVal}</span>
                        </span>
                      ) : changeVal < 0 ? (
                        <span
                          className="tabular-nums"
                          style={{
                            color: "var(--status-down)",
                            display: "inline-flex",
                            alignItems: "center",
                            fontSize: 12,
                            fontWeight: 700,
                            fontFamily: "var(--font-numeric)",
                            fontVariantNumeric: "tabular-nums",
                          }}
                        >
                          <ArrowDownRight size={14} />
                          <span>{Math.abs(changeVal)}</span>
                        </span>
                      ) : (
                        <Minus size={13} color="var(--text-muted)" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Bottom Link: View full leaderboard */}
      <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
        <Link
          to="/leaderboard"
          style={{
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "var(--font-body)",
            color: "var(--text-primary)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>View full leaderboard</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}

