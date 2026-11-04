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
    if (norm.includes("operat")) return "#64748B"; // slate
    if (norm.includes("lead")) return "var(--crimson)";
    if (rank === 1) return "var(--gold)";
    if (rank === 2) return "var(--green)";
    if (rank === 3) return "#64748B";
    return "var(--crimson)";
  };

  return (
    <div
      className="top-groups-card-root"
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
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .top-groups-card-root {
            border-radius: 24px !important;
            padding: 20px !important;
            box-shadow: 0 8px 28px rgba(0, 0, 0, 0.06) !important;
            background: #FFFFFF !important;
            position: relative;
            z-index: 2;
          }
          .top-teams-row-left {
            gap: 6px !important;
          }
          .top-teams-crest-slot {
            width: 32px !important;
            height: 32px !important;
          }
          .top-teams-rank-slot {
            width: 22px !important;
            font-size: 13px !important;
          }
          .top-teams-name-text {
            font-size: 13.5px !important;
          }
          .top-teams-warriors-text {
            font-size: 10px !important;
          }
          .top-teams-pts-pill {
            padding: 3px 8px !important;
            font-size: 11.5px !important;
            margin-left: 6px !important;
          }
        }
      `}</style>
      {/* Background Japanese Samurai Kabuto Helmet Art */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          right: 12,
          bottom: 12,
          width: 130,
          height: 130,
          opacity: 0.06,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        <img
          src="/assets/art/samurai-kabuto.webp"
          alt=""
          aria-hidden="true"
          width={1024}
          height={1024}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>

      {/* Header: Title + See all groups */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
          position: "relative",
          zIndex: 1,
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
          gap: 10,
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
                padding: "10px 14px 10px 12px",
                borderRadius: 10,
                background: isRank1 ? "var(--gold-tint)" : "#FAF9F6",
                borderLeft: `3px solid ${borderColor}`,
                textDecoration: "none",
                flex: 1,
                minHeight: 52,
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
              <div className="top-teams-row-left" style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                {/* Rank */}
                <span
                  className="top-teams-rank-slot tabular-nums"
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    fontFamily: "var(--font-numeric)",
                    color: isRank1 ? "var(--gold)" : rank === 4 ? "var(--crimson)" : "var(--muted)",
                    width: 26,
                    flexShrink: 0,
                  }}
                >
                  #{rank}
                </span>

                {/* Original Crest */}
                <div className="top-teams-crest-slot" style={{ width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Crest group={grp} size="sm" />
                </div>

                {/* Team Name */}
                <span
                  className="top-teams-name-text"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 800,
                    fontSize: 15,
                    color: "var(--ink)",
                    letterSpacing: "-0.015em",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {teamName}
                </span>

                {/* Warriors Label */}
                <span
                  className="top-teams-warriors-text"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--muted)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    marginLeft: 4,
                  }}
                >
                  {warriorCount} WARRIORS
                </span>
              </div>

              {/* Right Zone: Points in Soft Gold Pill */}
              <div
                className="top-teams-pts-pill tabular-nums"
                style={{
                  fontFamily: "var(--font-numeric)",
                  fontVariantNumeric: "tabular-nums",
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: "var(--gold)",
                  background: "var(--gold-tint)",
                  padding: "4px 10px",
                  borderRadius: "var(--radius-pill)",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  marginLeft: 10,
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
