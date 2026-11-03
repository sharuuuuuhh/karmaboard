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
  const isLight = token.cardText === "#1F2A4D";
  const uniqueId = `${slug}-${rank}`;

  const queryParams =
    period !== undefined && offset !== undefined
      ? `?period=${encodeURIComponent(period)}&offset=${encodeURIComponent(offset)}`
      : "";
  const cardLink = `/groups/${group.id || group.name || slug}${queryParams}`;

  // ==========================================
  // COMPACT VARIANT (Used on Home "Top Groups")
  // ==========================================
  if (variant === "compact") {
    return (
      <Link
        to={cardLink}
        className={`interactive-group-card-compact ${isLight ? "light-card" : ""} ${className}`}
        style={{
          background: token.cardBg,
          color: token.cardText,
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.08)",
          ...style,
        }}
      >
        {/* 1px Inner Border */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            boxShadow: `inset 0 0 0 1px ${token.cardBorder}`,
            clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)",
            pointerEvents: "none",
            zIndex: 3,
          }}
        />

        {/* Diagonal Chamfer 1px Line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 12,
            width: 16.97,
            height: 1,
            transformOrigin: "top left",
            transform: "rotate(45deg)",
            background: token.cardBorder,
            pointerEvents: "none",
            zIndex: 4,
          }}
        />

        {/* Layer A: Giant Watermark Crest */}
        {crestFiles ? (
          <img
            src={crestFiles["384"] || crestFiles["128"]}
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              right: -15,
              bottom: -15,
              width: 110,
              height: 110,
              objectFit: "contain",
              pointerEvents: "none",
              opacity: 0.07,
              filter: token.watermarkFilter || "brightness(0) invert(1)",
              zIndex: 0,
            }}
          />
        ) : (
          <svg
            viewBox="0 0 100 100"
            style={{
              position: "absolute",
              right: -15,
              bottom: -15,
              width: 110,
              height: 110,
              pointerEvents: "none",
              opacity: 0.07,
              filter: token.watermarkFilter || "brightness(0) invert(1)",
              zIndex: 0,
            }}
            fill="none"
          >
            <path
              d="M50 8 L85 22 C85 62 50 90 50 90 C50 90 15 62 15 22 Z"
              stroke="#FFFFFF"
              strokeWidth="5"
              fill="white"
            />
          </svg>
        )}

        {/* Layer B: Faint Angular Facets */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            opacity: 0.05,
            zIndex: 0,
          }}
          viewBox="0 0 300 80"
          preserveAspectRatio="none"
          fill="none"
          aria-hidden="true"
        >
          <polygon
            points="0,0 80,0 140,80 0,80"
            fill={token.facetColor || "#FFFFFF"}
          />
          <line
            x1="0"
            y1="20"
            x2="300"
            y2="70"
            stroke={token.facetColor || "#FFFFFF"}
            strokeWidth="1.5"
          />
        </svg>

        {/* Layer C: Film-grain noise */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            opacity: 0.04,
            mixBlendMode: "overlay",
            zIndex: 0,
          }}
          aria-hidden="true"
        >
          <filter id={`grain-comp-${uniqueId}`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#grain-comp-${uniqueId})`} />
        </svg>

        {/* Left: Rank + Hero Crest + Name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            position: "relative",
            zIndex: 1,
            minWidth: 0,
          }}
        >
          {/* Outlined Rank Tag */}
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontVariationSettings: "'wdth' 112",
              fontSize: 11,
              fontWeight: 700,
              color: token.cardText,
              border: `1px solid ${token.tagBorder || "rgba(255, 255, 255, 0.6)"}`,
              padding: "1px 6px",
              borderRadius: 3,
              flexShrink: 0,
            }}
          >
            #{rank}
          </span>

          {/* Hero Crest */}
          {crestFiles ? (
            <img
              src={crestFiles["128"]}
              srcSet={`${crestFiles["128"]} 128w, ${crestFiles["384"]} 384w`}
              sizes="48px"
              alt={`${displayName} crest`}
              className="hero-crest-compact"
              style={{
                width: 44,
                height: 44,
                objectFit: "contain",
                flexShrink: 0,
                filter: token.crestOutlineFilter || "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))",
              }}
            />
          ) : (
            <svg
              viewBox="0 0 100 100"
              className="hero-crest-compact"
              style={{
                width: 44,
                height: 44,
                flexShrink: 0,
                filter: token.crestOutlineFilter || "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3))",
              }}
              fill="none"
            >
              <path
                d="M50 8 L85 22 C85 62 50 90 50 90 C50 90 15 62 15 22 Z"
                stroke={token.cardAccent || token.cardText}
                strokeWidth="5"
                fill="rgba(255, 255, 255, 0.08)"
              />
              <text
                x="50"
                y="58"
                textAnchor="middle"
                fill={token.cardText}
                fontSize="20"
                fontWeight="800"
                fontFamily="var(--font-display)"
              >
                {displayName.slice(0, 4)}
              </text>
            </svg>
          )}

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontVariationSettings: "'wdth' 125",
                fontWeight: 800,
                fontSize: 15,
                lineHeight: 1.1,
                color: token.cardText,
                textTransform: "uppercase",
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {displayName}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontVariationSettings: "'wdth' 112",
                fontSize: 10,
                fontWeight: 600,
                color: token.cardText,
                opacity: 0.8,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginTop: 2,
              }}
            >
              {memberCount} WARRIORS
            </div>
          </div>
        </div>

        {/* Right: Big Karma */}
        <div style={{ textAlign: "right", position: "relative", zIndex: 1, flexShrink: 0 }}>
          <div
            className="tabular-nums"
            style={{
              fontFamily: "var(--font-display)",
              fontVariationSettings: "'wdth' 125",
              fontSize: 20,
              fontWeight: 800,
              color: token.cardText,
              lineHeight: 1,
            }}
          >
            {karma.toLocaleString()}
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontVariationSettings: "'wdth' 112",
              fontSize: 10,
              fontWeight: 700,
              color: token.cardAccent,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
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
  // ==========================================
  return (
    <Link
      to={cardLink}
      className={`interactive-group-card ${isLight ? "light-card" : ""} ${className}`}
      style={{
        background: token.cardBg,
        color: token.cardText,
        ...style,
      }}
    >
      {/* 1px Inner Border */}
      <div
        className="group-card-inner-border"
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: `inset 0 0 0 1px ${token.cardBorder}`,
          clipPath: "polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 0 100%)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />

      {/* Diagonal Chamfer 1px Line */}
      <div
        className="group-card-chamfer-line"
        style={{
          position: "absolute",
          top: 0,
          right: 18,
          width: 25.46,
          height: 1,
          transformOrigin: "top left",
          transform: "rotate(45deg)",
          background: token.cardBorder,
          pointerEvents: "none",
          zIndex: 4,
        }}
      />

      {/* Layer A: Giant Watermark Crest */}
      {crestFiles ? (
        <img
          src={crestFiles["384"] || crestFiles["128"]}
          alt=""
          aria-hidden="true"
          className="group-card-watermark"
          style={{
            position: "absolute",
            right: -30,
            bottom: -30,
            width: 250,
            height: 250,
            objectFit: "contain",
            pointerEvents: "none",
            opacity: 0.07,
            filter: token.watermarkFilter || "brightness(0) invert(1)",
            userSelect: "none",
            zIndex: 0,
          }}
        />
      ) : (
        <svg
          viewBox="0 0 100 100"
          className="group-card-watermark"
          style={{
            position: "absolute",
            right: -30,
            bottom: -30,
            width: 250,
            height: 250,
            pointerEvents: "none",
            opacity: 0.07,
            filter: token.watermarkFilter || "brightness(0) invert(1)",
            userSelect: "none",
            zIndex: 0,
          }}
          fill="none"
        >
          <path
            d="M50 8 L85 22 C85 62 50 90 50 90 C50 90 15 62 15 22 Z"
            stroke="#FFFFFF"
            strokeWidth="5"
            fill="white"
          />
        </svg>
      )}

      {/* Layer B: Faint Angular Facet Pattern */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          opacity: 0.05,
          zIndex: 0,
        }}
        viewBox="0 0 400 300"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <polygon
          points="0,0 140,0 220,180 70,300 0,300"
          fill={token.facetColor || "#FFFFFF"}
        />
        <line
          x1="0"
          y1="70"
          x2="400"
          y2="230"
          stroke={token.facetColor || "#FFFFFF"}
          strokeWidth="1.5"
        />
        <line
          x1="200"
          y1="0"
          x2="400"
          y2="130"
          stroke={token.facetColor || "#FFFFFF"}
          strokeWidth="1.5"
        />
      </svg>

      {/* Layer C: Film-grain Noise Overlay */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          opacity: 0.04,
          mixBlendMode: "overlay",
          zIndex: 0,
        }}
        aria-hidden="true"
      >
        <filter id={`grain-${uniqueId}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.75"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${uniqueId})`} />
      </svg>

      {/* =======================================
          TOP ZONE: Hero Crest + Rank & Large Karma
          ======================================= */}
      <div
        className="group-card-top-zone"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          position: "relative",
          zIndex: 1,
          width: "100%",
          gap: 6,
        }}
      >
        {/* Left: Hero Crest */}
        <div
          className="group-card-crest-wrapper"
          style={{
            flex: "1 1 auto",
            minWidth: 0,
            maxWidth: "calc(100% - 105px)",
            display: "flex",
            alignItems: "center",
          }}
        >
          {crestFiles ? (
            <img
              src={crestFiles["384"] || crestFiles["128"]}
              srcSet={`${crestFiles["128"]} 128w, ${crestFiles["384"]} 384w`}
              sizes="(max-width: 768px) 48px, (max-width: 1200px) 100px, 125px"
              alt={`${displayName} crest`}
              className="hero-crest-img"
              style={{
                filter:
                  token.crestOutlineFilter ||
                  "drop-shadow(0 6px 10px rgba(0, 0, 0, 0.35))",
              }}
            />
          ) : (
            <svg
              viewBox="0 0 100 100"
              className="hero-crest-img"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                filter:
                  token.crestOutlineFilter ||
                  "drop-shadow(0 6px 10px rgba(0, 0, 0, 0.35))",
              }}
            >
              <path
                d="M50 8 L85 22 C85 62 50 90 50 90 C50 90 15 62 15 22 Z"
                stroke={token.cardAccent || token.cardText}
                strokeWidth="4"
                strokeLinejoin="round"
                fill="rgba(255, 255, 255, 0.08)"
              />
              <path
                d="M50 15 L78 26 C78 58 50 82 50 82 C50 82 22 58 22 26 Z"
                stroke={token.cardAccent || token.cardText}
                strokeWidth="1.5"
                strokeOpacity="0.4"
                strokeLinejoin="round"
                fill="none"
              />
              <text
                x="50"
                y="56"
                textAnchor="middle"
                fill={token.cardText}
                fontSize="14"
                fontWeight="800"
                fontFamily="var(--font-display)"
                letterSpacing="0.08em"
              >
                {displayName.slice(0, 6)}
              </text>
            </svg>
          )}
        </div>

        {/* Right: Outlined Rank Tag + Vertically-Centered Karma */}
        <div
          className="group-card-stat-zone"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            textAlign: "right",
            flexShrink: 0,
            minWidth: 95,
            maxWidth: 115,
            paddingLeft: 4,
            position: "relative",
            zIndex: 2,
          }}
        >
          {/* Top-Right Outlined Rank Tag */}
          <span
            className="group-card-rank-tag"
            style={{
              fontFamily: "var(--font-display)",
              fontVariationSettings: "'wdth' 112",
              fontSize: 11.5,
              fontWeight: 700,
              color: token.cardText,
              border: `1px solid ${token.tagBorder || "rgba(255, 255, 255, 0.6)"}`,
              padding: "1.5px 7px",
              borderRadius: 4,
              lineHeight: 1.2,
              display: "inline-block",
            }}
          >
            #{rank}
          </span>

          {/* Vertically centered with crest: Karma Number */}
          <div className="group-card-karma-box" style={{ marginTop: 8, marginBottom: 2 }}>
            <div
              className="tabular-nums group-card-karma-val"
              style={{
                fontFamily: "var(--font-display)",
                fontVariationSettings: "'wdth' 125",
                fontWeight: 800,
                fontSize: "clamp(26px, 2.3vw, 40px)",
                lineHeight: 0.95,
                color: token.cardText,
                letterSpacing: "-0.02em",
              }}
            >
              {karma.toLocaleString()}
            </div>
            <div
              className="group-card-karma-lbl"
              style={{
                fontFamily: "var(--font-display)",
                fontVariationSettings: "'wdth' 112",
                fontWeight: 600,
                fontSize: 9.5,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: token.cardText,
                opacity: 0.8,
                marginTop: 3,
                whiteSpace: "nowrap",
              }}
            >
              {period === "month"
                ? "KARMA THIS MONTH"
                : period === "all"
                ? "TOTAL KARMA"
                : "KARMA THIS WEEK"}
            </div>
          </div>
        </div>
      </div>

      {/* =======================================
          MIDDLE ZONE: Team Name & Subtitle
          ======================================= */}
      <div
        className="group-card-mid-zone"
        style={{
          position: "relative",
          zIndex: 1,
          marginTop: 10,
          marginBottom: 10,
        }}
      >
        <div
          className="group-card-name"
          style={{
            fontFamily: "var(--font-display)",
            fontVariationSettings: "'wdth' 125",
            fontWeight: 800,
            fontSize: "clamp(20px, 1.8vw, 26px)",
            lineHeight: 1.05,
            textTransform: "uppercase",
            letterSpacing: "-0.01em",
            color: token.cardText,
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
            gap: 6,
            fontFamily: "var(--font-display)",
            fontVariationSettings: "'wdth' 112",
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: token.cardText,
            opacity: 0.85,
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

      {/* =======================================
          BOTTOM ZONE: Progress Bar & Footer Row
          ======================================= */}
      <div className="group-card-bottom-zone" style={{ position: "relative", zIndex: 1, width: "100%" }}>
        {/* Target and Percent */}
        <div
          className="group-card-target-row"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "var(--font-display)",
            fontVariationSettings: "'wdth' 112",
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: token.cardText,
            opacity: 0.9,
            marginBottom: 6,
          }}
        >
          <span>TARGET {target}</span>
          <span className="tabular-nums">{percent}%</span>
        </div>

        {/* 4px Progress Track */}
        <div
          className="group-card-progress-track"
          style={{
            width: "100%",
            height: 4,
            borderRadius: 2,
            background: token.progressTrack || "rgba(255, 255, 255, 0.20)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: `${percent}%`,
              height: "100%",
              borderRadius: 2,
              background: token.cardAccent,
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
            marginTop: 12,
            paddingTop: 8,
            borderTop: `1px solid ${token.cardBorder}`,
          }}
        >
          <span
            className="group-card-status-text"
            style={{
              fontSize: 11.5,
              fontWeight: 600,
              color: token.cardText,
              opacity: 0.85,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {karma === 0
              ? "Not started yet"
              : percent >= 100
              ? "Goal reached"
              : "In progress"}
          </span>

          <span
            className="group-card-view-btn"
            style={{
              fontFamily: "var(--font-display)",
              fontVariationSettings: "'wdth' 112",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: token.cardAccent,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            <span>VIEW TEAM</span>
            <ArrowRight size={12} />
          </span>
        </div>
      </div>
    </Link>
  );
}
