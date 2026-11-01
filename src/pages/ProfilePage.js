import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Flame,
  Award,
  Shield,
  Activity,
  Trophy,
  ChevronRight,
} from "lucide-react";
import PageGrid, { PageCol } from "../components/common/PageGrid";
import { karmaStore } from "../data/karmaStore";
import { formatRelativeTime } from "../utils/dateUtils";
import { calculateDailyStreak } from "../utils/streakUtils";
import { getGroupToken } from "../utils/groupTokens";
import Crest from "../crests";

export default function ProfilePage() {
  const { muid } = useParams();
  const [, setDataVersion] = useState(0);

  useEffect(() => {
    const unsub = karmaStore.subscribe(() => {
      setDataVersion((v) => v + 1);
    });
    return unsub;
  }, []);

  const member = karmaStore.getMemberByMuid ? karmaStore.getMemberByMuid(muid) : null;

  const memberEvents = useMemo(() => {
    if (!member) return [];
    const events = karmaStore.karmaEvents || [];
    const cleanMuid = (member.muid || "").toLowerCase();
    return events.filter(
      (ev) =>
        ev.member_id === member.id ||
        (ev.muid && ev.muid.toLowerCase() === cleanMuid)
    );
  }, [member]);

  const streakDays = useMemo(() => {
    const res = calculateDailyStreak(memberEvents);
    return typeof res === "object" ? res?.currentStreak || 0 : res || 0;
  }, [memberEvents]);

  const allTimeLeaderboard = useMemo(() => {
    return karmaStore.getLeaderboard
      ? karmaStore.getLeaderboard({ period: "all", view: "individuals" })
      : [];
  }, []);

  const rankIndex = allTimeLeaderboard.findIndex(
    (m) => m.muid?.toLowerCase() === (member?.muid || "").toLowerCase()
  );
  const campusRank = rankIndex !== -1 ? rankIndex + 1 : (member?.rank || "-");

  if (!member) {
    return (
      <div style={{ textAlign: "center", padding: "60px 16px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)" }}>
          Warrior Not Found
        </h2>
        <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>
          The requested student profile could not be found.
        </p>
        <Link
          to="/leaderboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 16,
            color: "var(--chart-line)",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Leaderboard</span>
        </Link>
      </div>
    );
  }

  const token = getGroupToken(member.group_name || member.group_id);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Back Button */}
      <div>
        <Link
          to="/leaderboard"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-secondary)",
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={15} />
          <span>Back to leaderboard</span>
        </Link>
      </div>

      <PageGrid gap={20}>
        {/* Left Column (Span 3): Identity Card & Core Stats */}
        <PageCol col={12} colLg={3}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Warrior Identity Card */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "var(--radius-card)",
                padding: "24px 20px",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-soft)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: 68,
                  height: 68,
                  borderRadius: "50%",
                  background: token.pastel,
                  color: token.ink,
                  fontSize: 24,
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: `2px solid ${token.ink}`,
                  marginBottom: 12,
                }}
              >
                {getInitials(member.name)}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center" }}>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 20,
                    fontWeight: 800,
                    color: "var(--text-primary)",
                  }}
                >
                  {member.name}
                </h2>
                <Crest group={member.group_name || member.group_id} size="xs" />
              </div>

              <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
                {member.muid}
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 12px",
                  borderRadius: "var(--radius-pill)",
                  background: token.pastel,
                  color: token.ink,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <span>{token.name} Team</span>
              </div>
            </div>

            {/* Stat 1: Total Karma */}
            <div
              style={{
                background: "var(--pastel-tech)",
                borderRadius: "var(--radius-card)",
                padding: "18px 20px",
                border: "1px solid rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-tech)", marginBottom: 6 }}>
                TOTAL KARMA
              </div>
              <div
                className="tabular-nums"
                style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}
              >
                {(member.karma || 0).toLocaleString()}
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-tech)", fontWeight: 600, marginTop: 4 }}>
                lifetime score across campus
              </div>
            </div>

            {/* Stat 2: Campus Rank */}
            <div
              style={{
                background: "var(--pastel-media)",
                borderRadius: "var(--radius-card)",
                padding: "18px 20px",
                border: "1px solid rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-media)" }}>
                  CAMPUS RANK
                </span>
                <Trophy size={14} color="var(--ink-media)" />
              </div>
              <div
                className="tabular-nums"
                style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}
              >
                #{campusRank}
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-media)", fontWeight: 600, marginTop: 4 }}>
                on overall campus leaderboard
              </div>
            </div>
          </div>
        </PageCol>

        {/* Center Column (Span 6): Karma History Table with Internal Scroll */}
        <PageCol col={12} colLg={6}>
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: "var(--radius-card)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-soft)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid var(--border)",
                background: "#FAFAFA",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Activity size={16} color="var(--chart-line)" />
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>
                  Karma Activity History
                </h3>
              </div>
              <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 600 }}>
                {memberEvents.length} events logged
              </span>
            </div>

            <div
              className="custom-scrollbar"
              style={{
                maxHeight: 520,
                overflowY: "auto",
              }}
            >
              {memberEvents.length === 0 ? (
                <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                  No karma actions recorded for this member yet.
                </div>
              ) : (
                <table className="clean-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      background: "#FFFFFF",
                      boxShadow: "0 1px 0 var(--border)",
                    }}
                  >
                    <tr style={{ height: 40 }}>
                      <th style={{ padding: "8px 16px" }}>Task / Description</th>
                      <th style={{ textAlign: "right", padding: "8px 16px" }}>Karma</th>
                      <th style={{ width: 120, textAlign: "right", padding: "8px 16px" }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {memberEvents.slice(0, 30).map((ev, idx) => (
                      <tr
                        key={ev.id || idx}
                        style={{
                          height: 50,
                          borderBottom: "1px solid var(--border-subtle, #F1F3F5)",
                        }}
                      >
                        <td style={{ padding: "6px 16px" }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                            {ev.task_name || ev.description || "Earned Karma in MuLearn"}
                          </div>
                        </td>
                        <td
                          className="tabular-nums"
                          style={{
                            padding: "6px 16px",
                            textAlign: "right",
                            fontSize: 13.5,
                            fontWeight: 800,
                            color: "var(--status-up)",
                          }}
                        >
                          +{(ev.delta || ev.karma_points || ev.points || 300).toLocaleString()}
                        </td>
                        <td
                          style={{
                            padding: "6px 16px",
                            textAlign: "right",
                            fontSize: 11.5,
                            color: "var(--text-muted)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatRelativeTime(ev.timestamp || ev.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </PageCol>

        {/* Right Column (Span 3): Streak, Actions, and Team Info */}
        <PageCol col={12} colLg={3}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Stat 3: Daily Streak */}
            <div
              style={{
                background: "var(--pastel-operation)",
                borderRadius: "var(--radius-card)",
                padding: "18px 20px",
                border: "1px solid rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-operation)", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                <Flame size={14} />
                <span>DAILY STREAK</span>
              </div>
              <div
                className="tabular-nums"
                style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}
              >
                {streakDays} {streakDays === 1 ? "day" : "days"}
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-operation)", fontWeight: 600, marginTop: 4 }}>
                {streakDays > 0 ? "Active daily streak 🔥" : "No active streak yet"}
              </div>
            </div>

            {/* Stat 4: Total Actions */}
            <div
              style={{
                background: "var(--pastel-marketing)",
                borderRadius: "var(--radius-card)",
                padding: "18px 20px",
                border: "1px solid rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-marketing)" }}>
                  TOTAL ACTIONS
                </span>
                <Award size={14} color="var(--ink-marketing)" />
              </div>
              <div
                className="tabular-nums"
                style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}
              >
                {memberEvents.length}
              </div>
              <div style={{ fontSize: 11, color: "var(--ink-marketing)", fontWeight: 600, marginTop: 4 }}>
                verified campus activities recorded
              </div>
            </div>

            {/* Team Affiliation Guild Card */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: "var(--radius-card)",
                padding: "18px 20px",
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                <Shield size={15} color={token.ink} />
                <span style={{ fontSize: 11, fontWeight: 700, color: token.ink, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Squad Guild
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <Crest group={member.group_name || member.group_id} size="md" />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)" }}>
                    {token.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-secondary)" }}>
                    {token.discipline || "Campus Skill Team"}
                  </div>
                </div>
              </div>

              <Link
                to={`/groups/${member.group_name || member.group_id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderRadius: "var(--radius-pill)",
                  background: token.pastel,
                  color: token.ink,
                  textDecoration: "none",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                <span>View team page</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </PageCol>
      </PageGrid>
    </div>
  );
}
