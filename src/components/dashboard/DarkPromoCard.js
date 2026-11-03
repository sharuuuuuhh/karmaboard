import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Clock, Users } from "lucide-react";
import Crest from "../../crests";

export default function DarkPromoCard({
  groups = [],
  countdown = "Resets soon",
  activeMemberCount = 0,
  period = "month",
}) {
  // Build headline from data:
  // e.g. "LEADS leads TECH by 200", or "No karma this month yet" when everyone is 0, or "LEADS and TECH are tied"
  let headline = period === "all" ? "No karma logged yet" : "No karma this month yet";
  const sortedGroups = [...groups].sort((a, b) => (b.karma || 0) - (a.karma || 0));
  const first = sortedGroups[0] || null;
  const second = sortedGroups[1] || null;

  if (first) {
    const firstKarma = first?.karma || 0;
    const secondKarma = second?.karma || 0;

    if (firstKarma === 0) {
      headline = period === "all" ? "No karma logged yet" : "No karma this month yet";
    } else if (second && firstKarma === secondKarma) {
      headline = `${first.name || first.id} and ${second.name || second.id} are tied`;
    } else if (second) {
      const diff = firstKarma - secondKarma;
      headline = `${first.name || first.id} leads ${second.name || second.id} by ${diff.toLocaleString()}`;
    } else {
      headline = `${first.name || first.id} leads the race`;
    }
  }

  return (
    <div
      style={{
        background: "var(--ink)",
        borderRadius: "var(--radius-card)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        padding: "24px",
        color: "#FFFFFF",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 280,
        height: "100%",
        boxShadow: "var(--shadow-soft)",
      }}
    >
      {/* Decorative Subtle Misty Mountain and Torii Gate Line Art (8-12% opacity) */}
      <svg
        width="220"
        height="160"
        viewBox="0 0 220 160"
        fill="none"
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          opacity: 0.10,
          pointerEvents: "none",
          zIndex: 0,
        }}
      >
        {/* Soft mountain silhouette */}
        <path
          d="M 20 160 Q 70 95 130 115 Q 170 85 220 105 L 220 160 Z"
          fill="#FFFFFF"
          opacity="0.6"
        />
        {/* Far ridge */}
        <path
          d="M 60 160 Q 110 70 170 90 L 220 75 L 220 160 Z"
          fill="#FFFFFF"
          opacity="0.4"
        />

        {/* Torii Gate Outline in Silhouette */}
        <g transform="translate(142, 38)" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Top curved roof (Kasagi) */}
          <path d="M 0 14 Q 28 8 56 14" strokeWidth="2.8" />
          {/* Second tie beam (Shimaki & Nuki) */}
          <line x1="4" y1="22" x2="52" y2="22" strokeWidth="2" />
          <line x1="8" y1="32" x2="48" y2="32" strokeWidth="1.8" />
          {/* Central strut (Gakuzuka) */}
          <line x1="28" y1="22" x2="28" y2="32" strokeWidth="2" />
          {/* Main Pillars (Hashira) slightly inclined */}
          <line x1="14" y1="18" x2="11" y2="72" strokeWidth="2.6" />
          <line x1="42" y1="18" x2="45" y2="72" strokeWidth="2.6" />
          {/* Pillar Base Stones (Daiishi) */}
          <rect x="8" y="70" width="6" height="3" fill="#FFFFFF" />
          <rect x="42" y="70" width="6" height="3" fill="#FFFFFF" />
        </g>
      </svg>

      {/* Top Header: Eyebrow + Headline & Leader Crest */}
      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: "rgba(255, 255, 255, 0.6)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: 8,
                fontFamily: "var(--font-body)",
              }}
            >
              {period === "all" ? "ALL TIME" : period === "week" ? "THIS WEEK" : "THIS MONTH"}
            </div>

            <h3
              style={{
                margin: "0 0 16px 0",
                fontSize: 22,
                fontWeight: 800,
                color: "#FFFFFF",
                letterSpacing: "-0.02em",
                lineHeight: 1.25,
                maxWidth: 230,
                fontFamily: "var(--font-display)",
              }}
            >
              {headline}
            </h3>
          </div>

          {first && (
            <div style={{ flexShrink: 0 }}>
              <Crest group={first} size="md" />
            </div>
          )}
        </div>

        {/* Two Small Stat Tiles */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginTop: 12,
          }}
        >
          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "14px",
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Clock size={16} color="rgba(255, 255, 255, 0.7)" style={{ flexShrink: 0 }} />
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.6)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.06em", fontFamily: "var(--font-body)" }}>Countdown</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF", whiteSpace: "nowrap", fontFamily: "var(--font-numeric)", fontVariantNumeric: "tabular-nums" }}>
                {countdown}
              </div>
            </div>
          </div>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "14px",
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Users size={16} color="rgba(255, 255, 255, 0.7)" style={{ flexShrink: 0 }} />
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 11, color: "rgba(255, 255, 255, 0.6)", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.06em", fontFamily: "var(--font-body)" }}>Active Members</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF", whiteSpace: "nowrap", fontFamily: "var(--font-numeric)", fontVariantNumeric: "tabular-nums" }}>
                {activeMemberCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Button: Crimson button with 12px radius */}
      <div style={{ marginTop: 22, position: "relative", zIndex: 1 }}>
        <Link
          to="/leaderboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "11px 20px",
            borderRadius: 12,
            background: "var(--crimson)",
            color: "#FFFFFF",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "var(--font-body)",
            textDecoration: "none",
            transition: "background 150ms ease, opacity 150ms ease",
            width: "100%",
            boxShadow: "0 2px 8px rgba(179, 32, 42, 0.25)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#981720")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "var(--crimson)")}
        >
          <span>View leaderboard</span>
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </div>
  );
}
