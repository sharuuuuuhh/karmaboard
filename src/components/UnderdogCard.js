import React from "react";
import { Card, CardHeader } from "./common/Card";
import { Avatar, GroupDot } from "./common/Avatar";
import { EmptyState } from "./common/Skeleton";
import { TrendingUp, HelpCircle } from "lucide-react";

export function UnderdogCard({ underdogData, onGroupClick }) {
  if (!underdogData) return null;

  const { isLive, status, individualUnderdog, groupUnderdog } = underdogData;

  return (
    <Card>
      <CardHeader
        title="Underdog Award"
        icon={<TrendingUp size={18} />}
        action={
          <span
            style={{
              fontSize: "0.6875rem",
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: "var(--radius-full)",
              backgroundColor: isLive ? "var(--accent-tint)" : "var(--subtle-surface)",
              color: isLive ? "var(--accent)" : "var(--text-secondary)",
              border: `1px solid ${isLive ? "var(--accent-tint-border)" : "var(--border)"}`,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            {status}
          </span>
        }
      />

      <div style={{ padding: "var(--space-3) var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        {/* Individual Most Improved */}
        <div>
          <div style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
            Most Improved Member
          </div>

          {individualUnderdog ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                padding: "8px 10px",
                backgroundColor: "var(--subtle-surface)",
                borderRadius: "var(--radius-control)",
                border: "1px solid var(--border)",
              }}
            >
              <Avatar name={individualUnderdog.name} size={32} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)" }}>
                    {individualUnderdog.name}
                  </span>
                  <span
                    style={{
                      fontSize: "0.5625rem",
                      fontWeight: 700,
                      padding: "1px 5px",
                      borderRadius: "var(--radius-full)",
                      backgroundColor: "#FEF3C7",
                      color: "#B45309",
                      border: "1px solid #FDE68A",
                    }}
                  >
                    UNDERDOG
                  </span>
                </div>
                <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                  {individualUnderdog.group_name} • {individualUnderdog.description}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <span
                  className="tabular-nums"
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--status-up)",
                    backgroundColor: "var(--status-up-bg)",
                    padding: "2px 6px",
                    borderRadius: "4px",
                  }}
                >
                  {individualUnderdog.deltaLabel}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              No members qualifying for rank climb yet.
            </div>
          )}
        </div>

        {/* Group Most Improved */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
            <span style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Most Improved Group
            </span>
            <span
              style={{ display: "inline-flex", alignItems: "center", color: "var(--text-muted)", cursor: "pointer" }}
              title="Group Underdog Rule: Highest percentage growth in karma over the previous period (tie-break by karma earned)."
            >
              <HelpCircle size={12} />
            </span>
          </div>

          {groupUnderdog ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                padding: "8px 10px",
                backgroundColor: "var(--subtle-surface)",
                borderRadius: "var(--radius-control)",
                border: "1px solid var(--border)",
                cursor: "pointer",
              }}
              onClick={() => onGroupClick && onGroupClick(groupUnderdog.id)}
              title="Click to view group details"
            >
              <GroupDot color={groupUnderdog.color} size={10} />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)" }}>
                    {groupUnderdog.name}
                  </span>
                </div>
                <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                  {groupUnderdog.description}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <span
                  className="tabular-nums"
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--status-up)",
                    backgroundColor: "var(--status-up-bg)",
                    padding: "2px 6px",
                    borderRadius: "4px",
                  }}
                >
                  {groupUnderdog.deltaLabel}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              No groups with positive karma growth yet.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

