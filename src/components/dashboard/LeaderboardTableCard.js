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
      className="leaderboard-table-card-root"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: "24px",
        boxShadow: "var(--shadow-soft)",
        minWidth: 0,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <style>{`
        .mobile-empty-state-art {
          display: none;
        }
        @media (max-width: 768px) {
          .leaderboard-table-card-root {
            border-radius: 24px !important;
            padding: 20px !important;
            box-shadow: 0 8px 28px rgba(0, 0, 0, 0.06) !important;
          }
          .desktop-empty-state-art {
            display: none !important;
          }
          .mobile-empty-state-art {
            display: flex !important;
            justify-content: center;
            width: 100%;
          }
        }
      `}</style>
      <div>
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
              color: "var(--ink)",
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
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => onSelectGroup && onSelectGroup(isSelected && chip.id !== "all" ? "all" : chip.id)}
                style={{
                  padding: "5px 14px",
                  borderRadius: "var(--radius-pill)",
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  color: isSelected ? "#FFFFFF" : "var(--muted)",
                  background: isSelected ? "var(--ink)" : "#FFFFFF",
                  border: isSelected ? "1px solid var(--ink)" : "1px solid var(--border)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 150ms ease",
                  boxShadow: isSelected ? "0 1px 3px rgba(0, 0, 0, 0.1)" : "none",
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = "#CCC6BA";
                    e.currentTarget.style.color = "var(--ink)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.color = "var(--muted)";
                  }
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
              padding: "44px 16px",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            {/* Desktop Sumi-e Torii Gate and Misty Mountains */}
            <div
              className="desktop-empty-state-art"
              aria-hidden="true"
              style={{
                width: "100%",
                maxWidth: 560,
                display: "flex",
                justifyContent: "center",
                pointerEvents: "none",
                margin: "12px 0 8px",
              }}
            >
              <img
                src="/assets/art/empty-state.webp"
                alt=""
                aria-hidden="true"
                width={1200}
                height={275}
                loading="lazy"
                style={{
                  width: "100%",
                  height: "auto",
                  maxHeight: 195,
                  objectFit: "contain",
                  display: "block",
                }}
              />
            </div>

            {/* Mobile Sumi-e Torii Gate Art (Max-width 320px, multiply, soft mask) */}
            <div
              className="mobile-empty-state-art"
              aria-hidden="true"
              style={{
                width: "100%",
                pointerEvents: "none",
                margin: "12px 0 8px",
              }}
            >
              <picture style={{ width: "100%", maxWidth: 320, display: "flex", justifyContent: "center" }}>
                <source
                  type="image/avif"
                  srcSet="/assets/art/mobile/m-empty-state@1x.avif 458w, /assets/art/mobile/m-empty-state@2x.avif 917w, /assets/art/mobile/m-empty-state@3x.avif 1376w"
                  sizes="(max-width: 768px) 320px, 560px"
                />
                <source
                  type="image/webp"
                  srcSet="/assets/art/mobile/m-empty-state@1x.webp 458w, /assets/art/mobile/m-empty-state@2x.webp 917w, /assets/art/mobile/m-empty-state@3x.webp 1376w"
                  sizes="(max-width: 768px) 320px, 560px"
                />
                <img
                  src="/assets/art/mobile/m-empty-state.webp"
                  alt=""
                  aria-hidden="true"
                  width={1376}
                  height={768}
                  loading="lazy"
                  style={{
                    width: "100%",
                    maxWidth: 320,
                    height: "auto",
                    mixBlendMode: "multiply",
                    maskImage: "radial-gradient(ellipse 90% 75% at 50% 50%, black 50%, transparent 100%)",
                    WebkitMaskImage: "radial-gradient(ellipse 90% 75% at 50% 50%, black 50%, transparent 100%)",
                    display: "block",
                  }}
                />
              </picture>
            </div>

            <span
              style={{
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "var(--font-body)",
                color: "var(--muted)",
              }}
            >
              {period === "all" ? "No karma logged yet." : "No karma this week yet."}
            </span>
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
            color: "var(--ink)",
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
    </div>
  );
}

