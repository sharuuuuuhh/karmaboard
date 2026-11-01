import React, { useState } from "react";
import { Card, CardHeader } from "./common/Card";
import { Avatar } from "./common/Avatar";
import { EmptyState } from "./common/Skeleton";
import { Award } from "lucide-react";
import Crest from "../crests";

export function GroupMVPsCard({ mvpsCurrent = [], mvpsLast = [], onGroupClick }) {
  const [weekTab, setWeekTab] = useState("current"); // 'current' | 'last'

  const activeMVPs = weekTab === "current" ? mvpsCurrent : mvpsLast;

  return (
    <Card>
      <CardHeader
        title="Group MVPs"
        icon={<Award size={18} />}
        action={
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              type="button"
              className={`segmented-option ${weekTab === "current" ? "active" : ""}`}
              style={{ fontSize: "0.75rem", padding: "3px 8px" }}
              onClick={() => setWeekTab("current")}
            >
              This week
            </button>
            <button
              type="button"
              className={`segmented-option ${weekTab === "last" ? "active" : ""}`}
              style={{ fontSize: "0.75rem", padding: "3px 8px" }}
              onClick={() => setWeekTab("last")}
            >
              Last week
            </button>
          </div>
        }
      />

      {activeMVPs.length === 0 ? (
        <EmptyState
          title="No MVPs yet"
          description="Members earn MVP status by being their group's top karma earner this week."
        />
      ) : (
        <div className="activity-feed-list">
          {activeMVPs.map((mvp) => (
            <div
              key={mvp.member_id}
              className="rank-row"
              style={{ padding: "var(--space-2) var(--space-4)", cursor: "pointer" }}
              onClick={() => onGroupClick(mvp.group_id)}
              title={`View ${mvp.group_name} details`}
            >
              <div className="rank-col-avatar" style={{ minWidth: "32px" }}>
                <Avatar name={mvp.name} size={28} />
              </div>

              <div className="rank-col-info">
                <div className="entity-name-row">
                  <span className="entity-name" style={{ fontSize: "0.8125rem" }}>
                    {mvp.name}
                  </span>
                  <span className="mvp-pill" style={{ fontSize: "0.625rem" }}>MVP</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                  <Crest group={mvp.group_name || mvp.group_id} size="xs" />
                  <span>{mvp.group_name}</span>
                </div>
              </div>

              <div className="rank-col-karma" style={{ marginLeft: "auto" }}>
                <span className="karma-amount tabular-nums" style={{ fontSize: "0.8125rem" }}>
                  {mvp.karma.toLocaleString("en-IN")}
                </span>
                <span className="karma-label" style={{ fontSize: "0.625rem" }}>earned</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

