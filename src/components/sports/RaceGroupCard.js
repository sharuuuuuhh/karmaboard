import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUp, ArrowDown, Minus, Users, ChevronRight } from "lucide-react";
import { karmaStore } from "../../data/karmaStore";

export default function RaceGroupCard({ group }) {
  const navigate = useNavigate();

  const color = group.color || "var(--accent)";
  const groupMembers = karmaStore.members?.filter(
    (m) => m.group_id === group.id || m.group_name === group.name
  ) || [];
  const memberCount = groupMembers.length;
  const activeCount = groupMembers.filter((m) => (m.karma || 0) > 0).length;

  const rankMedalColor =
    group.rank === 1
      ? "var(--medal-gold)"
      : group.rank === 2
      ? "var(--medal-silver)"
      : group.rank === 3
      ? "var(--medal-bronze)"
      : "var(--text-muted)";

  return (
    <div
      onClick={() => navigate(`/groups/${group.id}`)}
      style={{
        position: "relative",
        background: `linear-gradient(145deg, ${color}22 0%, var(--surface) 55%)`,
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: "20px 22px",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transition: "all 0.18s ease",
        overflow: "hidden",
        minHeight: 180,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${color}66`;
        e.currentTarget.style.transform = "translateY(-3px)";
        e.currentTarget.style.boxShadow = `0 12px 30px ${color}22`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border)";
        e.currentTarget.style.transform = "translateY(0px)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {/* Top Row: Rank, Group Name with dot, Movement */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontSize: 16,
                fontWeight: 900,
                color: rankMedalColor,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              #{group.rank}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: color,
                  display: "inline-block",
                  boxShadow: `0 0 8px ${color}88`,
                }}
              />
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  color: "#FFFFFF",
                  letterSpacing: "0.02em",
                }}
              >
                {group.name}
              </span>
            </div>
          </div>

          {/* Movement Indicator */}
          {group.movement && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 2,
                fontSize: 12,
                fontWeight: 800,
                color:
                  group.movement.direction === "up"
                    ? "var(--status-up)"
                    : group.movement.direction === "down"
                    ? "var(--status-down)"
                    : "var(--text-muted)",
              }}
            >
              {group.movement.direction === "up" && <ArrowUp size={13} strokeWidth={3} />}
              {group.movement.direction === "down" && <ArrowDown size={13} strokeWidth={3} />}
              {group.movement.direction === "same" && <Minus size={13} strokeWidth={3} />}
              <span>{group.movement.delta ? Math.abs(group.movement.delta) : ""}</span>
            </div>
          )}
        </div>

        {/* Hero Karma Number */}
        <div style={{ margin: "10px 0" }}>
          <div
            style={{
              fontSize: 36,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {(group.karma || 0).toLocaleString()}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 6,
            }}
          >
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
              }}
            >
              Group Karma
            </span>

            {group.gap && (
              <span
                style={{
                  fontSize: 11,
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                }}
              >
                {group.gap.isLeader
                  ? `+${group.gap.gapToBelow} to #${group.gap.rankBelow || 2}`
                  : `-${group.gap.gapToAbove} to #${group.gap.rankAbove || group.rank - 1}`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Member Count & View Link */}
      <div
        style={{
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          paddingTop: 12,
          marginTop: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--text-secondary)" }}>
          <Users size={13} color={color} />
          <span>
            {memberCount} members ({activeCount} active)
          </span>
        </div>

        <div style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "#C6F432", fontWeight: 700 }}>
          <span>Roster</span>
          <ChevronRight size={13} />
        </div>
      </div>
    </div>
  );
}
