import React, { useState } from "react";
import { Card, CardHeader } from "./common/Card";
import { EmptyState } from "./common/Skeleton";
import { MessageSquare, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";
import Crest from "../crests";

export function NeedsANudgeCard({ nudgeGroups = [] }) {
  const [expandedId, setExpandedId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId((cur) => (cur === id ? null : id));
  };

  const handleCopy = (group) => {
    navigator.clipboard.writeText(group.discordMessage);
    setCopiedId(group.group_id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  return (
    <Card>
      <CardHeader
        title="Needs a Nudge"
        icon={<MessageSquare size={18} />}
      />

      {nudgeGroups.length === 0 ? (
        <EmptyState
          title="Great momentum!"
          description="Every member has earned karma this week. Keep up the high energy!"
        />
      ) : (
        <div>
          {nudgeGroups.map((group) => {
            const isExpanded = expandedId === group.group_id;
            const isCopied = copiedId === group.group_id;

            return (
              <div key={group.group_id} className="nudge-item">
                <div
                  className="nudge-header"
                  onClick={() => toggleExpand(group.group_id)}
                  title="Click to view inactive members and message"
                >
                  <div className="nudge-group-info" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Crest group={group.group_name || group.group_id} size="xs" />
                    <span>{group.group_name}</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="nudge-count-badge tabular-nums">
                      {group.inactiveCount} inactive
                    </span>
                    {isExpanded ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="nudge-details-expanded">
                    <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem", fontWeight: 500 }}>
                      Members without karma this week ({group.inactiveCount}):
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                      {group.inactiveMembers.map((m) => (
                        <span
                          key={m.id}
                          style={{
                            fontSize: "0.6875rem",
                            backgroundColor: "var(--surface)",
                            border: "1px solid var(--border)",
                            borderRadius: "4px",
                            padding: "2px 6px",
                            color: "var(--text-secondary)",
                          }}
                        >
                          {m.name}
                        </span>
                      ))}
                    </div>

                    <div style={{ marginTop: "4px" }}>
                      <button
                        type="button"
                        className="copy-nudge-btn"
                        onClick={() => handleCopy(group)}
                      >
                        {isCopied ? (
                          <>
                            <Check size={12} /> Copied to clipboard!
                          </>
                        ) : (
                          <>
                            <Copy size={12} /> Copy Discord nudge
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

