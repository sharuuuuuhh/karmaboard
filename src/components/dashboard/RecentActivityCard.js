import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { formatRelativeTime } from "../../utils/dateUtils";
import { karmaStore } from "../../data/karmaStore";
import Crest from "../../crests";

export default function RecentActivityCard({ activities = [], maxRows = 6 }) {
  const rows = activities.slice(0, maxRows);

  const getMemberName = (act) => {
    if (act.member_name && act.member_name !== "Member") return act.member_name;
    if (act.student_name && act.student_name !== "Member") return act.student_name;
    if (act.name && act.name !== "Member") return act.name;
    if (act.muid) {
      const found = karmaStore.getMemberByMuid ? karmaStore.getMemberByMuid(act.muid) : null;
      if (found && found.name) return found.name;
      return act.muid.split("@")[0];
    }
    return "Student";
  };

  const formatActivityTime = (timestamp) => {
    if (!timestamp) return "just now";
    const date = new Date(timestamp);
    const diffMs = Date.now() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays > 7) {
      // Absolute date after 7 days (e.g. "24 Oct")
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return `${date.getDate()} ${months[date.getMonth()]}`;
    }
    return formatRelativeTime(timestamp);
  };

  return (
    <div
      className="recent-activity-card-root"
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: "24px",
        boxShadow: "var(--shadow-soft)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .recent-activity-card-root {
            border-radius: 24px !important;
            padding: 20px !important;
            box-shadow: 0 8px 28px rgba(0, 0, 0, 0.06) !important;
          }
          .recent-activity-name-col {
            max-width: 100px !important;
            width: auto !important;
          }
        }
      `}</style>
      {/* Header: Title + See all */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
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
            Recent activity
          </h3>
        </div>

        <Link
          to="/activity"
          style={{
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "var(--font-body)",
            color: "var(--muted)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 3,
            transition: "color 150ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
        >
          <span>See all</span>
          <ChevronRight size={14} />
        </Link>
      </div>

      {/* Rows with internal scroll */}
      {rows.length === 0 ? (
        <div
          style={{
            padding: "36px 16px",
            textAlign: "center",
            color: "var(--muted)",
            fontSize: 13,
          }}
        >
          No recent activity recorded.
        </div>
      ) : (
        <div
          className="custom-scrollbar"
          style={{
            display: "flex",
            flexDirection: "column",
            maxHeight: 380,
            overflowY: "auto",
            paddingRight: 4,
            flex: 1,
          }}
        >
          {rows.map((act, idx) => {
            const memberName = getMemberName(act);
            const points = act.delta || act.karma_points || act.points || 300;
            const timeStr = formatActivityTime(act.timestamp || act.created_at);

            return (
              <div
                key={act.id || idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 6px",
                  borderBottom:
                    idx < rows.length - 1 ? "1px solid var(--border)" : "none",
                  gap: 12,
                  borderRadius: 6,
                  transition: "background 150ms ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#FAF8F4")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                {/* Left: Name | Original Crest | "earned +X karma" */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1 }}>
                  {/* Name */}
                  <div className="recent-activity-name-col" style={{ width: 120, flexShrink: 0 }}>
                    {act.muid ? (
                      <Link
                        to={`/u/${encodeURIComponent(act.muid)}`}
                        style={{
                          fontWeight: 600,
                          fontSize: 13.5,
                          fontFamily: "var(--font-body)",
                          color: "var(--ink)",
                          textDecoration: "none",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "block",
                        }}
                      >
                        {memberName}
                      </Link>
                    ) : (
                      <span
                        style={{
                          fontWeight: 600,
                          fontSize: 13.5,
                          fontFamily: "var(--font-body)",
                          color: "var(--ink)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "block",
                        }}
                      >
                        {memberName}
                      </span>
                    )}
                  </div>

                  {/* Original Team Crest */}
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Crest group={act.group_name || act.group_id} size="xs" />
                  </div>

                  {/* Points Earned */}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontFamily: "var(--font-body)" }}>
                    <span style={{ color: "var(--muted)" }}>earned</span>
                    <span
                      className="tabular-nums"
                      style={{
                        fontWeight: 700,
                        color: "var(--green)",
                        fontFamily: "var(--font-numeric)",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      +{points} karma
                    </span>
                  </div>
                </div>

                {/* Right: Relative/Absolute Timestamp */}
                <span
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {timeStr}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

