import React from "react";
import { Card, CardHeader } from "./common/Card";
import { GroupDot } from "./common/Avatar";
import { ProgressBar } from "./common/ProgressBar";
import { Target } from "lucide-react";

export function GoalCard({ groupGoals = [], onGroupClick }) {
  return (
    <Card>
      <CardHeader
        title="Weekly Goals"
        icon={<Target size={18} />}
        action={
          <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
            Sorted by % complete
          </span>
        }
      />

      <div style={{ display: "flex", flexDirection: "column" }}>
        {groupGoals.map((item) => {
          const { goal } = item;

          return (
            <div
              key={item.id}
              style={{
                padding: "var(--space-3) var(--space-4)",
                borderBottom: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                cursor: "pointer",
                transition: "background-color 0.15s",
              }}
              onClick={() => onGroupClick && onGroupClick(item.id)}
              title={`View ${item.name} details`}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <GroupDot color={item.color} size={8} />
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)" }}>
                    {item.name}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span className="tabular-nums" style={{ fontSize: "0.75rem", fontWeight: 700, color: goal.isReached ? "var(--status-up)" : "var(--text-primary)" }}>
                    {goal.percent}%
                  </span>
                  {goal.isReached && (
                    <span
                      style={{
                        fontSize: "0.5625rem",
                        fontWeight: 700,
                        padding: "1px 5px",
                        borderRadius: "var(--radius-full)",
                        backgroundColor: "var(--status-up-bg)",
                        color: "var(--status-up)",
                        border: "1px solid #BBF7D0",
                      }}
                    >
                      REACHED
                    </span>
                  )}
                </div>
              </div>

              <ProgressBar goal={goal} height={5} showLabel={false} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                <span>{goal.statusLabel}</span>
                <span style={{ color: goal.isOnPace ? "var(--text-secondary)" : "var(--status-down)" }}>
                  {goal.paceText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

