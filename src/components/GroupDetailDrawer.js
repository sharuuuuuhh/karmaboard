import React, { useState } from "react";
import { Avatar } from "./common/Avatar";
import { MovementBadge } from "./common/MovementBadge";
import { StackedBar } from "./common/StackedBar";
import { ProgressBar } from "./common/ProgressBar";
import { StreakBadge } from "./common/StreakBadge";
import Crest from "../crests";
import {
  X,
  Award,
  Users,
  Copy,
  Check,
  TrendingUp,
  Target,
  Crown,
} from "lucide-react";

export function GroupDetailDrawer({
  detail,
  onClose,
  periodLabel = "this week",
  onOpenCaptainDashboard,
  canAccessCaptain = false,
}) {
  const [copied, setCopied] = useState(false);

  if (!detail) return null;

  const {
    group,
    rank,
    movement,
    gap,
    totalKarma,
    contributions,
    summaryLine,
    mvp,
    isUnderdog,
    goal,
    inactiveMembers,
  } = detail;

  const handleCopyNudge = () => {
    if (!inactiveMembers || inactiveMembers.length === 0) return;
    const names = inactiveMembers.slice(0, 5).map((m) => `@${m.name.split(" ")[0]}`).join(", ");
    const more = inactiveMembers.length > 5 ? ` and ${inactiveMembers.length - 5} more` : "";
    const msg = `Hey ${group.name}! 🚀 ${inactiveMembers.length} of us haven't scored karma yet ${periodLabel}: ${names}${more}. Let's pick up a MuLearn task today and climb the leaderboard!`;

    navigator.clipboard.writeText(msg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="drawer-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)" }}>
            <Crest group={group} size="md" />

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h2 style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  {group.name}
                </h2>
                <MovementBadge movement={movement} />
                {isUnderdog && (
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
                )}
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                Rank #{rank} • {totalKarma.toLocaleString("en-IN")} karma ({periodLabel})
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {onOpenCaptainDashboard && (
              <button
                type="button"
                className="sync-button-secondary"
                style={{ padding: "4px 10px", fontSize: "0.75rem", opacity: canAccessCaptain ? 1 : 0.6 }}
                onClick={() => onOpenCaptainDashboard(group.id)}
                title={canAccessCaptain ? "Open Captain View" : "Captain View (Only group captain or admin)"}
              >
                <Crown size={13} color="var(--accent)" />
                <span>Captain view</span>
              </button>
            )}

            <button
              type="button"
              className="drawer-close-btn"
              onClick={onClose}
              aria-label="Close group details"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="drawer-body">
          {/* Feature 8: Rank Gap Both Ways */}
          {gap && (
            <div
              style={{
                padding: "var(--space-3) var(--space-4)",
                backgroundColor: "var(--subtle-surface)",
                borderRadius: "var(--radius-control)",
                border: "1px solid var(--border)",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              }}
            >
              <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                Leaderboard Distance
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "2px", fontSize: "0.8125rem" }}>
                {gap.isLeader ? (
                  <div style={{ color: "var(--status-up)", fontWeight: 600 }}>
                    🏆 {gap.text}
                  </div>
                ) : (
                  <>
                    {gap.rankAbove && (
                      <div style={{ color: "var(--text-primary)" }}>
                        ↑ <strong>{gap.gapToAbove.toLocaleString("en-IN")} karma</strong> behind #{gap.rankAbove}
                      </div>
                    )}
                    {gap.rankBelow && gap.gapToBelow > 0 && (
                      <div style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>
                        ↓ <strong>{gap.gapToBelow.toLocaleString("en-IN")} karma</strong> ahead of #{gap.rankBelow}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Feature 11: Weekly Goal Progress */}
          {goal && (
            <div
              style={{
                padding: "var(--space-4)",
                backgroundColor: "var(--surface)",
                borderRadius: "var(--radius-control)",
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Target size={14} color="var(--accent)" />
                  <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)" }}>
                    Weekly Karma Goal
                  </span>
                </div>
                <span style={{ fontSize: "0.75rem", fontWeight: 600, color: goal.isReached ? "var(--status-up)" : "var(--accent)" }}>
                  {goal.percent}% Complete
                </span>
              </div>

              <ProgressBar goal={goal} height={7} showLabel={false} />

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                <span>{goal.statusLabel}</span>
                <span style={{ color: goal.isOnPace ? "var(--text-secondary)" : "var(--status-down)", fontWeight: 500 }}>
                  {goal.paceText}
                </span>
              </div>
            </div>
          )}

          {/* Group MVP Banner */}
          {mvp && (
            <div
              style={{
                padding: "var(--space-4)",
                backgroundColor: "var(--medal-gold-bg)",
                border: "1px solid #FEF08A",
                borderRadius: "var(--radius-control)",
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: "#FEF08A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--medal-gold)",
                }}
              >
                <Award size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--medal-gold)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    Group MVP of the Week
                  </span>
                </div>
                <div style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-primary)" }}>
                  {mvp.name}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                  Earned {mvp.karma.toLocaleString("en-IN")} karma this week
                </div>
              </div>
            </div>
          )}

          {/* Contribution Breakdown */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                Contribution Breakdown
              </span>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {periodLabel}
              </span>
            </div>

            <StackedBar items={contributions} total={totalKarma} height={14} />

            <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "8px", fontStyle: "italic" }}>
              {summaryLine}
            </p>
          </div>

          {/* Inactive Members Nudge Section */}
          {inactiveMembers && inactiveMembers.length > 0 && (
            <div
              style={{
                padding: "var(--space-4)",
                backgroundColor: "var(--subtle-surface)",
                borderRadius: "var(--radius-control)",
                border: "1px solid var(--border)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)" }}>
                  Inactive Members ({inactiveMembers.length})
                </span>
                <button
                  type="button"
                  className="copy-nudge-btn"
                  onClick={handleCopyNudge}
                  style={{ fontSize: "0.6875rem", padding: "3px 8px" }}
                >
                  {copied ? (
                    <>
                      <Check size={11} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={11} /> Copy Discord nudge
                    </>
                  )}
                </button>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                {inactiveMembers.map((m) => (
                  <span
                    key={m.id}
                    style={{
                      fontSize: "0.6875rem",
                      backgroundColor: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "4px",
                      padding: "2px 6px",
                      color: "var(--text-muted)",
                    }}
                  >
                    {m.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Member contribution ranked list */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "12px" }}>
              <Users size={16} color="var(--text-secondary)" />
              <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                All Members ({contributions.length})
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {contributions.map((member, index) => {
                const isZero = member.isZero;

                return (
                  <div
                    key={member.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--space-3)",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      backgroundColor: isZero ? "transparent" : "var(--subtle-surface)",
                      opacity: isZero ? 0.6 : 1,
                      border: "1px solid",
                      borderColor: isZero ? "transparent" : "var(--border)",
                    }}
                  >
                    <span className="tabular-nums" style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", width: "16px" }}>
                      {index + 1}
                    </span>

                    <Avatar name={member.name} size={28} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {member.name}
                        </span>
                        {mvp && mvp.member_id === member.id && (
                          <span className="mvp-pill" style={{ fontSize: "0.5625rem" }}>MVP</span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                        {member.muid} • {member.department}
                      </div>
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <div className="tabular-nums" style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--text-primary)" }}>
                        {member.karma.toLocaleString("en-IN")}
                      </div>
                      <div className="tabular-nums" style={{ fontSize: "0.6875rem", color: "var(--text-muted)" }}>
                        {member.share}% share
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
