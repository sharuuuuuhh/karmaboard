import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Clock, Users } from "lucide-react";
import Crest from "../../crests";

export default function DarkPromoCard({
  groups = [],
  countdown = "Resets soon",
  activeMemberCount = 0,
}) {
  // Build headline from data:
  // e.g. "LEADS leads TECH by 200", or "No karma this week yet" when everyone is 0, or "LEADS and TECH are tied"
  let headline = "No karma this week yet";
  const sortedGroups = [...groups].sort((a, b) => (b.karma || 0) - (a.karma || 0));
  const first = sortedGroups[0] || null;
  const second = sortedGroups[1] || null;

  if (first) {
    const firstKarma = first?.karma || 0;
    const secondKarma = second?.karma || 0;

    if (firstKarma === 0) {
      headline = "No karma this week yet";
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
        background: "var(--promo-bg)",
        borderRadius: "var(--radius-card)",
        padding: "26px",
        color: "#FFFFFF",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 280,
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.16)",
      }}
    >
      {/* Subtle geometric line-art card outlines in the bottom-right corner */}
      <svg
        width="160"
        height="160"
        viewBox="0 0 160 160"
        fill="none"
        style={{
          position: "absolute",
          bottom: -20,
          right: -20,
          opacity: 0.16,
          pointerEvents: "none",
        }}
      >
        <rect
          x="20"
          y="30"
          width="120"
          height="80"
          rx="14"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          transform="rotate(-12 80 70)"
        />
        <rect
          x="30"
          y="45"
          width="120"
          height="80"
          rx="14"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          transform="rotate(6 90 85)"
        />
        <circle cx="110" cy="70" r="14" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="124" cy="70" r="14" stroke="#FFFFFF" strokeWidth="1.5" />
      </svg>

      {/* Top Header: Eyebrow + Headline & Leader Crest */}
      <div>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "#A0A0A8",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: 8,
              }}
            >
              THIS WEEK
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
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "14px",
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Clock size={16} color="#93C5FD" style={{ flexShrink: 0 }} />
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", fontWeight: 600 }}>Countdown</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#FFFFFF", whiteSpace: "nowrap" }}>
                {countdown}
              </div>
            </div>
          </div>

          <div
            style={{
              background: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "14px",
              padding: "10px 12px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Users size={16} color="#93C5FD" style={{ flexShrink: 0 }} />
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 10, color: "#9CA3AF", textTransform: "uppercase", fontWeight: 600 }}>Active Members</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#FFFFFF", whiteSpace: "nowrap" }}>
                {activeMemberCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Button: Pale-blue pill linking to /leaderboard */}
      <div style={{ marginTop: 22 }}>
        <Link
          to="/leaderboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: "var(--radius-pill)",
            background: "#DBEAFE",
            color: "#1E3A8A",
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
            transition: "all 0.15s ease",
            width: "100%",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
          className="hover:opacity-95"
        >
          <span>View leaderboard</span>
          <ArrowUpRight size={15} />
        </Link>
      </div>
    </div>
  );
}
