import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import Crest from "../../crests";

export default function TopGroupsCards({ groups = [] }) {
  // Top 4 teams to comfortably fill vertical card space
  const topTeams = groups.slice(0, 4);

  const getTeamBorderColor = (teamName, rank) => {
    const norm = String(teamName || "").toLowerCase();
    if (norm.includes("tech")) return "var(--gold)";
    if (norm.includes("market")) return "var(--green)";
    if (norm.includes("operat")) return "#4F46E5";
    if (norm.includes("lead")) return "var(--crimson)";
    if (rank === 1) return "var(--gold)";
    if (rank === 2) return "var(--green)";
    if (rank === 3) return "#4F46E5";
    return "var(--crimson)";
  };

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: "22px 20px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        minHeight: 280,
        boxShadow: "var(--shadow-soft)",
      }}
    >
      {/* Header: Title + See all groups */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "var(--font-display)",
            color: "var(--ink)",
            letterSpacing: "-0.02em",
          }}
        >
          Top Teams
        </span>

        <Link
          to="/groups"
          style={{
            fontSize: 12,
            fontWeight: 600,
            fontFamily: "var(--font-body)",
            color: "var(--muted)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
            transition: "color 150ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
        >
          <span>See all</span>
          <ChevronRight size={13} />
        </Link>
      </div>

      {/* 4 Clean Rows with Left Border Identity */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          flex: 1,
          justifyContent: "space-between",
        }}
      >
        {topTeams.map((grp, idx) => {
          const rank = idx + 1;
          const isRank1 = rank === 1;
          const borderColor = getTeamBorderColor(grp.name || grp.id, rank);
          const slug = grp.slug || grp.id || String(grp.name || "").toLowerCase().replace(/\s+/g, "-");
          const targetUrl = `/groups/${slug.startsWith("grp-") ? slug : `grp-${slug}`}`;
          const teamName = String(grp.name || grp.id || "Team").toUpperCase();
          const warriorCount = grp.member_count || grp.members_count || 6;
          const points = (grp.karma || 0).toLocaleString();

          return (
            <Link
              key={grp.id || grp.name || idx}
              to={targetUrl}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px 8px 10px",
                borderRadius: 8,
                background: isRank1 ? "var(--gold-tint)" : "#FAF9F6",
                borderLeft: `3px solid ${borderColor}`,
                textDecoration: "none",
                transition: "background 150ms ease, transform 150ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = isRank1 ? "#F7E9C6" : "#F3F0EA";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isRank1 ? "var(--gold-tint)" : "#FAF9F6";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {/* Left Zone: Rank # + Original Crest + Name + Warriors */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
                {/* Rank */}
                <span
                  className="tabular-nums"
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "var(--font-numeric)",
                    color: isRank1 ? "var(--gold)" : rank === 4 ? "var(--crimson)" : "var(--muted)",
                    width: 22,
                    flexShrink: 0,
                  }}
                >
                  #{rank}
                </span>

                {/* Original Crest */}
                <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Crest group={grp} size="xs" />
                </div>

                {/* Team Name */}
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 12.5,
                    color: "var(--ink)",
                    letterSpacing: "-0.01em",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {teamName}
                </span>

                {/* Warriors Label */}
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 10.5,
                    fontWeight: 600,
                    color: "var(--muted)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    marginLeft: 2,
                  }}
                >
                  {warriorCount} WARRIORS
                </span>
              </div>

              {/* Right Zone: Points in Gold */}
              <div
                className="tabular-nums"
                style={{
                  fontFamily: "var(--font-numeric)",
                  fontVariantNumeric: "tabular-nums",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "var(--gold)",
                  textAlign: "right",
                  flexShrink: 0,
                  marginLeft: 8,
                }}
              >
                {points} PTS
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
