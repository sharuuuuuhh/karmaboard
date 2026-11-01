import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import GroupCard from "../common/GroupCard";

export default function TopGroupsCards({ groups = [] }) {
  // Top 4 teams to comfortably fill vertical card space
  const topTeams = groups.slice(0, 4);

  return (
    <div
      style={{
        background: "#FFFFFF",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: "18px 20px",
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
          marginBottom: 10,
        }}
      >
        <span
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
          }}
        >
          Top Teams
        </span>

        <Link
          to="/groups"
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: "var(--text-secondary)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: 2,
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
          <span>See all</span>
          <ChevronRight size={13} />
        </Link>
      </div>

      {/* 4 Compact Team Cards Stack (Solid colors, chamfered corner, watermark, hero crest) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 9,
          flex: 1,
          justifyContent: "space-between",
        }}
      >
        {topTeams.map((grp, idx) => (
          <GroupCard
            key={grp.id || grp.name || idx}
            group={grp}
            rank={idx + 1}
            variant="compact"
          />
        ))}
      </div>
    </div>
  );
}
