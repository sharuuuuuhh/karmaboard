import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getGroupToken } from "../../utils/groupTokens";
import { CREST_REGISTRY, normalizeGroupSlug, getGroupDisplayName } from "../../crests";

export default function GroupCard({
  group,
  rank = 1,
  karma: explicitKarma,
  memberCount: explicitMemberCount,
  target = 360,
  variant = "full",
  className = "",
  style = {},
  period,
  offset,
}) {
  const token = getGroupToken(group);
  const slug = normalizeGroupSlug(group);
  const displayName = getGroupDisplayName(slug) || token.name;
  const crestFiles = CREST_REGISTRY[slug];

  const karma =
    explicitKarma !== undefined
      ? explicitKarma
      : typeof group === "object" && group.karma !== undefined
      ? group.karma
      : 0;

  const memberCount =
    explicitMemberCount !== undefined
      ? explicitMemberCount
      : typeof group === "object" && (group.member_count || group.members_count)
      ? group.member_count || group.members_count
      : 6;

  const percent = Math.min(100, Math.round((karma / target) * 100));
  const isRank1 = rank === 1;

  const queryParams =
    period !== undefined && offset !== undefined
      ? `?period=${encodeURIComponent(period)}&offset=${encodeURIComponent(offset)}`
      : "";
  const cardLink = `/groups/${group.id || group.name || slug}${queryParams}`;

  // ==========================================
  // COMPACT VARIANT (Used on Home / Unit Tests)
  // ==========================================
  if (variant === "compact") {
    return (
      <Link
        to={cardLink}
        className={`interactive-group-card-compact ${className}`}
        style={{
          background: "#FFFFFF",
          color: "var(--ink)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "12px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          textDecoration: "none",
          position: "relative",
          overflow: "hidden",
          boxShadow: "var(--shadow-soft)",
          borderLeft: "3px solid var(--crimson)",
          ...style,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
          <span
            className="tabular-nums"
            style={{
              fontSize: 12.5,
              fontWeight: 800,
              fontFamily: "var(--font-numeric)",
              color: "var(--crimson)",
              width: 22,
              flexShrink: 0,
            }}
          >
            #{rank}
          </span>

          <div style={{ width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {crestFiles ? (
              <img
                src={crestFiles["128"] || crestFiles["384"]}
                alt=""
                style={{ width: 34, height: 34, objectFit: "contain" }}
              />
            ) : (
              <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#FAF8F5", border: "1px solid var(--border)" }} />
            )}
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: 14,
                color: "var(--ink)",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {displayName}
            </div>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 10.5,
                fontWeight: 600,
                color: "var(--muted)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              {memberCount} WARRIORS
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 10 }}>
          <div
            className="tabular-nums"
            style={{
              fontFamily: "var(--font-numeric)",
              fontSize: 16,
              fontWeight: 800,
              color: "var(--ink)",
              lineHeight: 1,
            }}
          >
            {karma.toLocaleString()}
          </div>
          <div
            className="tabular-nums"
            style={{
              fontFamily: "var(--font-numeric)",
              fontSize: 11,
              fontWeight: 700,
              color: "var(--crimson)",
              marginTop: 2,
            }}
          >
            {karma > 0 ? `+${karma.toLocaleString()}` : "0 PTS"}
          </div>
        </div>
      </Link>
    );
  }

  // ==========================================
  // FULL CARD VARIANT (Used on Groups Page)
  // Clean light card + Red top highlight strip
  // ==========================================
  const karmaPeriodLabel =
    period === "month"
      ? "KARMA THIS MONTH"
      : period === "all"
      ? "TOTAL KARMA"
      : "KARMA THIS WEEK";

  const statusLabel =
    karma === 0
      ? "Not started yet"
      : percent >= 100
      ? "Goal reached"
      : "In progress";

  return (
    <Link
      to={cardLink}
      className={`interactive-group-card ${className}`}
      style={{
        background: "#FFFFFF",
        color: "var(--ink)",
        ...style,
      }}
    >
      {/* Top Highlight Strip: Brand Red that matches website */}
      <div
        className="group-card-top-accent"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3.5,
          background: "var(--crimson)",
          zIndex: 3,
        }}
      />

      {/* TOP ZONE: Original Crest (Left) + Outlined Rank & Karma (Right) */}
      <div className="group-card-top-zone">
        {/* Left: Original Crest */}
        <div className="group-card-crest-wrapper">
          {crestFiles ? (
            <img
              src={crestFiles["384"] || crestFiles["128"]}
              alt={`${displayName} crest`}
              className="hero-crest-img"
              style={{
                filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.12))",
              }}
            />
          ) : (
            <svg
              viewBox="0 0 100 100"
              className="hero-crest-img"
              fill="none"
              style={{
                filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.12))",
              }}
            >
              <path
                d="M50 8 L85 22 C85 62 50 90 50 90 C50 90 15 62 15 22 Z"
                stroke="var(--crimson)"
                strokeWidth="4"
                fill="#FAF8F5"
              />
              <text
                x="50"
                y="58"
                textAnchor="middle"
                fill="var(--ink)"
                fontSize="18"
                fontWeight="800"
                fontFamily="var(--font-display)"
              >
                {displayName.slice(0, 4)}
              </text>
            </svg>
          )}
        </div>

        {/* Right: Rank Tag + Karma Number */}
        <div className="group-card-stat-zone">
          <span
            className="group-card-rank-tag tabular-nums"
            style={{
              fontFamily: "var(--font-numeric)",
              fontSize: 11.5,
              fontWeight: 800,
              color: isRank1 ? "var(--crimson)" : "var(--ink)",
              background: "#FAF8F5",
              border: "1px solid var(--border)",
              padding: "2px 7px",
              borderRadius: 6,
              lineHeight: 1.2,
              display: "inline-block",
            }}
          >
            #{rank}
          </span>

          <div className="group-card-karma-box">
            <div
              className="tabular-nums group-card-karma-val"
              style={{
                fontFamily: "var(--font-numeric)",
                fontWeight: 800,
                fontSize: 32,
                lineHeight: 1,
                color: "var(--ink)",
                letterSpacing: "-0.02em",
              }}
            >
              {karma.toLocaleString()}
            </div>
            <div
              className="group-card-karma-lbl"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: 9.5,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginTop: 4,
                whiteSpace: "nowrap",
              }}
            >
              {karmaPeriodLabel}
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE ZONE: Team Name & Subtitle */}
      <div className="group-card-mid-zone">
        <div
          className="group-card-name"
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 800,
            fontSize: 22,
            lineHeight: 1.1,
            textTransform: "uppercase",
            letterSpacing: "-0.015em",
            color: "var(--ink)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {displayName}
        </div>
        <div
          className="group-card-subtitle"
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 5,
            fontFamily: "var(--font-body)",
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--muted)",
            marginTop: 4,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          <span className="group-card-role-badge">{token.roleBadge || token.name}</span>
          <span className="group-card-dot">•</span>
          <span>{memberCount} WARRIORS</span>
        </div>
      </div>

      {/* BOTTOM ZONE: Target Progress Bar & View Team Row */}
      <div className="group-card-bottom-zone">
        {/* Target and Percent */}
        <div
          className="group-card-target-row"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "var(--font-numeric)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--ink)",
            marginBottom: 6,
          }}
        >
          <span>TARGET {target}</span>
          <span className="tabular-nums">{percent}%</span>
        </div>

        {/* 5px Progress Track with Brand Red Fill */}
        <div
          className="group-card-progress-track"
          style={{
            width: "100%",
            height: 5,
            borderRadius: 9999,
            background: "#EAE6DF",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${percent}%`,
              height: "100%",
              borderRadius: 9999,
              background: "var(--crimson)",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        {/* Footer Row */}
        <div
          className="group-card-footer-row"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 6,
            marginTop: 14,
            paddingTop: 12,
            borderTop: "1px solid var(--border)",
          }}
        >
          <span
            className="group-card-status-text"
            style={{
              fontSize: 11.5,
              fontWeight: 500,
              fontFamily: "var(--font-body)",
              color: "var(--muted)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {statusLabel}
          </span>

          <span
            className="group-card-view-btn"
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--crimson)",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            <span>VIEW TEAM</span>
            <ArrowRight size={12} strokeWidth={2.5} />
          </span>
        </div>
      </div>
    </Link>
  );
}
