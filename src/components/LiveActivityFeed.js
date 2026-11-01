import React, { useState, useEffect } from "react";
import { Card, CardHeader } from "./common/Card";
import { GroupDot } from "./common/Avatar";
import { EmptyState } from "./common/Skeleton";
import { Activity, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { formatRelativeTime } from "../utils/dateUtils";

export function LiveActivityFeed({
  activities = [],
  groups = [],
  onGroupClick,
  userGroupId = "grp-1", // default selected for "My group" filter
}) {
  const [filter, setFilter] = useState("all"); // 'all' | 'my_group'
  const [viewMore, setViewMore] = useState(false);
  const [, setTick] = useState(0);

  // Auto-refresh relative timestamps every 30s
  useEffect(() => {
    const timer = setInterval(() => {
      setTick((t) => t + 1);
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const groupColorMap = {};
  groups.forEach((g) => { groupColorMap[g.id] = g.color; });

  const filtered = activities.filter((act) => {
    if (filter === "my_group") {
      return act.group_id === userGroupId;
    }
    return true;
  });

  const displayList = viewMore ? filtered.slice(0, 40) : filtered.slice(0, 10);

  return (
    <Card>
      <CardHeader
        title="Live Activity"
        icon={<Activity size={18} />}
        action={
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              type="button"
              className={`segmented-option ${filter === "all" ? "active" : ""}`}
              style={{ fontSize: "0.75rem", padding: "3px 8px" }}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={`segmented-option ${filter === "my_group" ? "active" : ""}`}
              style={{ fontSize: "0.75rem", padding: "3px 8px" }}
              onClick={() => setFilter("my_group")}
            >
              My group
            </button>
          </div>
        }
      />

      {displayList.length === 0 ? (
        <EmptyState title="No recent activity" description="Complete tasks on MuLearn to see live updates here." />
      ) : (
        <div className="activity-feed-list">
          {displayList.map((item) => {
            const color = groupColorMap[item.group_id] || "var(--accent)";
            const isMilestone = item.type === "milestone";

            return (
              <div key={item.id} className="activity-item">
                <div className="activity-icon-slot">
                  {isMilestone ? (
                    <Sparkles size={14} style={{ color: "var(--medal-gold)" }} />
                  ) : (
                    <GroupDot color={color} size={8} />
                  )}
                </div>

                <div className="activity-content">
                  <div className="activity-text">
                    {item.text}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="activity-time tabular-nums">
                      {formatRelativeTime(item.timestamp)}
                    </span>
                    {item.subtext && (
                      <span style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                        • {item.subtext}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {filtered.length > 10 && (
        <div
          style={{
            padding: "var(--space-2) var(--space-4)",
            borderTop: "1px solid var(--border)",
            textAlign: "center",
            backgroundColor: "var(--subtle-surface)",
          }}
        >
          <button
            type="button"
            onClick={() => setViewMore(!viewMore)}
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "var(--text-secondary)",
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "4px 8px",
            }}
          >
            {viewMore ? (
              <>
                Show less <ChevronUp size={12} />
              </>
            ) : (
              <>
                View more ({filtered.length - 10} more) <ChevronDown size={12} />
              </>
            )}
          </button>
        </div>
      )}
    </Card>
  );
}

