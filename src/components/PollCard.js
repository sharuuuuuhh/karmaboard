import React, { useState } from "react";
import { Card, CardHeader } from "./common/Card";
import { GroupDot } from "./common/Avatar";
import { HelpCircle, Check, Lock, Sparkles, History } from "lucide-react";

export function PollCard({ pollData, onVote, onGroupClick }) {
  const [showHistory, setShowHistory] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState("");

  if (!pollData) return null;

  const {
    timing,
    userVote,
    hasVoted,
    showResults,
    tabulated,
    pastPolls,
    userStats,
  } = pollData;

  const handleCastVote = (e) => {
    e.preventDefault();
    if (!selectedGroup) return;
    onVote(timing.monthKey, selectedGroup);
  };

  return (
    <Card>
      <CardHeader
        title="Prediction Poll"
        icon={<HelpCircle size={18} />}
        action={
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {userStats?.isOracle && (
              <span
                style={{
                  fontSize: "0.625rem",
                  fontWeight: 700,
                  padding: "1px 6px",
                  borderRadius: "var(--radius-full)",
                  backgroundColor: "#FEF08A",
                  color: "#854D0E",
                  border: "1px solid #FDE047",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "2px",
                }}
                title="Oracle Badge: Predicted correctly 3 times in a row!"
              >
                <Sparkles size={10} /> ORACLE
              </span>
            )}

            <button
              type="button"
              className={`segmented-option ${showHistory ? "active" : ""}`}
              style={{ fontSize: "0.75rem", padding: "3px 8px" }}
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? "Current poll" : "Past polls"}
            </button>
          </div>
        }
      />

      {showHistory ? (
        /* Past Polls Hall-of-Fame */
        <div style={{ padding: "var(--space-3) var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            <span>Your Accuracy: <strong className="tabular-nums">{userStats.accuracyPercent}%</strong> ({userStats.totalCorrect}/{userStats.totalVoted})</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {pastPolls.length === 0 ? (
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>No past polls finalized yet.</div>
            ) : (
              pastPolls.map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: "8px 10px",
                    backgroundColor: "var(--subtle-surface)",
                    borderRadius: "var(--radius-control)",
                    border: "1px solid var(--border)",
                    fontSize: "0.75rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, color: "var(--text-primary)" }}>
                    <span>{p.monthLabel}</span>
                    <span style={{ color: "var(--status-up)" }}>{p.accuracy}% guessed correctly</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "3px", color: "var(--text-secondary)" }}>
                    <span>Winner:</span>
                    <GroupDot color={p.winnerColor} size={7} />
                    <span style={{ fontWeight: 600 }}>{p.winnerName}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* Current Active / Locked Poll */
        <div style={{ padding: "var(--space-4)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {timing.monthLabel} Poll
              </span>

              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 500,
                  color: timing.isLocked ? "var(--text-muted)" : "var(--accent)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                }}
              >
                {timing.isLocked ? <><Lock size={11} /> Locked</> : timing.countdownText}
              </span>
            </div>

            <h3 style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.3 }}>
              Which group will finish #1 this month?
            </h3>
            <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "2px" }}>
              Voting is for fun; points are not awarded. Results appear after voting.
            </p>
          </div>

          {/* Voting form when user hasn't voted and poll is open */}
          {!hasVoted && !timing.isLocked ? (
            <form onSubmit={handleCastVote} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <select
                className="search-input"
                style={{ padding: "7px 10px", fontSize: "0.8125rem", cursor: "pointer" }}
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
              >
                <option value="">Select a group...</option>
                {tabulated.breakdown.map((g) => (
                  <option key={g.groupId} value={g.groupId}>
                    {g.groupName}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                disabled={!selectedGroup}
                className="sync-button-secondary"
                style={{
                  backgroundColor: "var(--accent)",
                  color: "#FFFFFF",
                  border: "none",
                  justifyContent: "center",
                  fontWeight: 600,
                  opacity: selectedGroup ? 1 : 0.6,
                }}
              >
                Cast Your Vote
              </button>
            </form>
          ) : (
            /* Results Breakdown (shown after voting or when locked) */
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {userVote && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.75rem",
                    color: "var(--status-up)",
                    backgroundColor: "var(--status-up-bg)",
                    padding: "4px 8px",
                    borderRadius: "var(--radius-control)",
                    border: "1px solid #BBF7D0",
                  }}
                >
                  <Check size={13} />
                  <span>Your vote is cast for <strong>{tabulated.breakdown.find(b => b.groupId === userVote.group_id)?.groupName}</strong></span>
                </div>
              )}

              {showResults && (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "2px" }}>
                  {tabulated.breakdown.map((g) => (
                    <div key={g.groupId} style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                          <GroupDot color={g.groupColor} size={7} />
                          <span style={{ fontWeight: 500, color: "var(--text-primary)" }}>{g.groupName}</span>
                          {userVote && userVote.group_id === g.groupId && (
                            <span style={{ fontSize: "0.625rem", color: "var(--accent)", fontWeight: 700 }}>(You)</span>
                          )}
                        </div>
                        <span className="tabular-nums" style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
                          {g.share}%
                        </span>
                      </div>

                      <div style={{ width: "100%", height: "4px", backgroundColor: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
                        <div
                          style={{
                            width: `${g.share}%`,
                            height: "100%",
                            backgroundColor: userVote && userVote.group_id === g.groupId ? "var(--accent)" : "var(--text-secondary)",
                            borderRadius: "2px",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                  <div style={{ fontSize: "0.6875rem", color: "var(--text-muted)", textAlign: "right", marginTop: "2px" }}>
                    Total votes: {tabulated.totalVotes}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

