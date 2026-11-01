import React, { useState, useEffect, useCallback } from "react";
import { karmaStore } from "../data/karmaStore";
import { StatCard } from "../components/common/StatCard";
import { LeaderboardCard } from "../components/LeaderboardCard";
import { LiveActivityFeed } from "../components/LiveActivityFeed";
import { GroupMVPsCard } from "../components/GroupMVPsCard";
import { NeedsANudgeCard } from "../components/NeedsANudgeCard";
import { GroupDetailDrawer } from "../components/GroupDetailDrawer";
import { OverallTable } from "../components/OverallTable";
import { UnderdogCard } from "../components/UnderdogCard";
import { GoalCard } from "../components/GoalCard";
import { PollCard } from "../components/PollCard";
import { RecapModal } from "../components/RecapModal";
import { formatRelativeTime } from "../utils/dateUtils";
import {
  RotateCw,
  Trophy,
  Flame,
  UserCheck,
  Users,
  CheckCircle2,
  Crown,
  Share2,
} from "lucide-react";
import "../styles/design-system.css";

export default function Home() {
  const [period, setPeriod] = useState("week"); // 'week' | 'month' | 'all'
  const [view, setView] = useState("individuals"); // 'individuals' | 'groups'
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current, -1 = last week
  const [monthOffset, setMonthOffset] = useState(0); // 0 = this month, -1 = last month

  const [leaderboard, setLeaderboard] = useState([]);
  const [campusStats, setCampusStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [mvpsCurrent, setMvpsCurrent] = useState([]);
  const [mvpsLast, setMvpsLast] = useState([]);
  const [nudgeGroups, setNudgeGroups] = useState([]);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  // New features data
  const [underdogData, setUnderdogData] = useState(null);
  const [allGroupGoals, setAllGroupGoals] = useState([]);
  const [pollData, setPollData] = useState(null);
  const [currentMember, setCurrentMember] = useState(null);

  // Sync state
  const [syncing, setSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState(null);

  // Drawers and Modals
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [showOverallTable, setShowOverallTable] = useState(false);
  const [captainGroupId, setCaptainGroupId] = useState(null);
  const [showRecapModal, setShowRecapModal] = useState(false);

  // Refresh data from store
  const refreshData = useCallback(() => {
    const lb = karmaStore.getLeaderboard({
      period,
      view,
      weekOffset,
      monthOffset,
    });
    setLeaderboard(lb);

    setCampusStats(karmaStore.getCampusStats(period));
    setActivities(karmaStore.activities);
    setMvpsCurrent(karmaStore.getGroupMVPs(0));
    setMvpsLast(karmaStore.getGroupMVPs(-1));
    setNudgeGroups(karmaStore.getNeedsANudge(weekOffset));
    setLastSyncedAt(karmaStore.lastSyncedAt);

    // New features data
    setUnderdogData(karmaStore.getUnderdog(period, weekOffset, monthOffset));
    setAllGroupGoals(karmaStore.getAllGroupGoals());
    setPollData(karmaStore.getMonthlyPoll(monthOffset));
    setCurrentMember(karmaStore.getCurrentMember());
  }, [period, view, weekOffset, monthOffset]);

  useEffect(() => {
    refreshData();
    const unsubscribe = karmaStore.subscribe(refreshData);
    return () => unsubscribe();
  }, [refreshData]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncToast(null);

    try {
      const res = await karmaStore.syncKarma();
      setSyncToast(`Synced latest karma from MuLearn (${res.syncedCount} members updated)`);
      setTimeout(() => setSyncToast(null), 3500);
    } catch (e) {
      setSyncToast("Sync failed: please check network connection");
      setTimeout(() => setSyncToast(null), 3500);
    } finally {
      setSyncing(false);
    }
  };

  const handleVotePoll = (monthKey, groupId) => {
    const res = karmaStore.submitPollVote(monthKey, groupId);
    if (!res.ok) {
      alert(res.error || "Could not record vote.");
    }
  };

  const groupDetail = selectedGroupId
    ? karmaStore.getGroupDetail(selectedGroupId, period, weekOffset, monthOffset)
    : null;

  const captainData = captainGroupId
    ? karmaStore.getCaptainDashboard(captainGroupId)
    : null;

  const personalRecap = showRecapModal
    ? karmaStore.getPersonalRecap(karmaStore.currentMemberId, period, weekOffset, monthOffset)
    : null;

  const groupRecap = showRecapModal && currentMember
    ? karmaStore.getGroupRecap(currentMember.group_id, period, weekOffset, monthOffset)
    : null;

  const periodLabelText =
    period === "week"
      ? weekOffset === 0 ? "this week" : "last week"
      : period === "month"
      ? monthOffset === 0 ? "this month" : "last month"
      : "all time";

  // Check if current user is captain of a group
  const userCaptainGroup = karmaStore.groups.find(
    (g) => g.captain_member_id === karmaStore.currentMemberId
  );

  return (
    <div className="app-container">
      {/* ── Top Bar ── */}
      <header className="top-bar">
        <div className="brand-section">
          <span className="brand-wordmark">Karmayodha</span>
          <span className="brand-sublabel">MuLearn TLY</span>
        </div>

        <div className="top-bar-actions">
          {/* User switcher (Dev / Demo mode auth selector) */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Viewing as:</span>
            <select
              className="search-input"
              style={{
                padding: "3px 8px",
                fontSize: "0.75rem",
                width: "auto",
                maxWidth: "180px",
                cursor: "pointer",
              }}
              value={karmaStore.currentMemberId || ""}
              onChange={(e) => karmaStore.setCurrentMemberId(e.target.value)}
              title="Switch active user profile for gap tracking and captain access"
            >
              {karmaStore.members.slice(0, 30).map((m) => {
                const isCap = karmaStore.groups.some((g) => g.captain_member_id === m.id);
                return (
                  <option key={m.id} value={m.id}>
                    {m.name} {isCap ? `(Captain - ${m.group_name})` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Captain View Button (if current user is a captain) */}
          {userCaptainGroup && (
            <button
              type="button"
              className="sync-button-secondary"
              style={{
                backgroundColor: "var(--accent-tint)",
                color: "var(--accent)",
                borderColor: "var(--accent-tint-border)",
              }}
              onClick={() => setCaptainGroupId(userCaptainGroup.id)}
              title="Open Group Captain Dashboard"
            >
              <Crown size={14} />
              <span>Captain View</span>
            </button>
          )}

          {/* Shareable Recap Card Button */}
          <button
            type="button"
            className="sync-button-secondary"
            onClick={() => setShowRecapModal(true)}
            title="Create & download shareable season recap card"
          >
            <Share2 size={14} />
            <span>Recap</span>
          </button>

          {syncToast && (
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "0.75rem",
                color: "var(--status-up)",
                backgroundColor: "var(--status-up-bg)",
                padding: "4px 10px",
                borderRadius: "var(--radius-full)",
                border: "1px solid #BBF7D0",
              }}
            >
              <CheckCircle2 size={13} />
              <span>{syncToast}</span>
            </div>
          )}

          <div className="last-synced tabular-nums">
            <span>Last synced {formatRelativeTime(lastSyncedAt)}</span>
          </div>

          <button
            type="button"
            className="sync-button-secondary"
            onClick={handleSync}
            disabled={syncing}
            title="Fetch latest karma data from MuLearn"
          >
            <RotateCw
              size={14}
              className={syncing ? "animate-spin" : ""}
              style={{ animation: syncing ? "spin 1s linear infinite" : "none" }}
            />
            <span>{syncing ? "Syncing..." : "Sync Karma"}</span>
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="main-content">
        {/* ── Summary Row (4 Compact Stat Cards + Feature 8 Personal Gap) ── */}
        <section className="stats-grid" aria-label="Campus Summary Statistics">
          <StatCard
            title="Campus Rank"
            value={campusStats ? `#${campusStats.campusRank}` : "—"}
            delta={campusStats?.campusRankDelta}
            deltaLabel="vs last month"
            icon={<Trophy size={18} />}
          />
          <StatCard
            title="Campus Karma"
            value={campusStats ? campusStats.campusKarma : 0}
            delta={campusStats?.campusKarmaDelta}
            deltaLabel="vs last week"
            icon={<Flame size={18} />}
          />
          <StatCard
            title="Active Members"
            value={campusStats ? campusStats.activeMembers : 0}
            delta={campusStats?.activeMembersDelta}
            deltaLabel="vs last week"
            icon={<UserCheck size={18} />}
          />
          <StatCard
            title={
              campusStats?.userGap
                ? `${currentMember?.name?.split(" ")[0]}'s Standing`
                : "Total Members"
            }
            value={
              campusStats?.userGap
                ? `#${campusStats.userGap.rank}`
                : campusStats ? campusStats.totalMembers : 0
            }
            delta={campusStats?.userGap?.compactText || campusStats?.totalMembersDelta}
            deltaLabel="to adjacent rank"
            icon={<Users size={18} />}
          />
        </section>

        {/* ── Two Column Layout (2/3 Left, 1/3 Right) ── */}
        <div className="layout-two-column">
          {/* Left Column: Leaderboard with Gap Badges, Streaks & Underdog */}
          <section aria-label="Leaderboard">
            <LeaderboardCard
              leaderboard={leaderboard}
              period={period}
              view={view}
              weekOffset={weekOffset}
              monthOffset={monthOffset}
              currentMemberId={karmaStore.currentMemberId}
              onPeriodChange={(p) => {
                setPeriod(p);
                setWeekOffset(0);
                setMonthOffset(0);
              }}
              onViewChange={setView}
              onWeekOffsetChange={setWeekOffset}
              onMonthOffsetChange={setMonthOffset}
              onGroupClick={(groupId) => setSelectedGroupId(groupId)}
              onOpenFullTable={() => setShowOverallTable(true)}
            />
          </section>

          {/* Right Column: Live Activity, Underdog Award, Weekly Goals, Prediction Poll, MVPs, Nudges */}
          <aside className="right-column-stack" aria-label="Campus Activity & Engagement">
            {/* Feature 10: Underdog Award Card */}
            <UnderdogCard
              underdogData={underdogData}
              onGroupClick={(groupId) => setSelectedGroupId(groupId)}
            />

            {/* Feature 11: Weekly Goals Card */}
            <GoalCard
              groupGoals={allGroupGoals}
              onGroupClick={(groupId) => setSelectedGroupId(groupId)}
            />

            {/* Feature 14: Monthly Prediction Poll Card */}
            <PollCard
              pollData={pollData}
              onVote={handleVotePoll}
              onGroupClick={(groupId) => setSelectedGroupId(groupId)}
            />

            {/* Feature 3: Live Activity Feed */}
            <LiveActivityFeed
              activities={activities}
              groups={karmaStore.groups}
              onGroupClick={(groupId) => setSelectedGroupId(groupId)}
              userGroupId={currentMember?.group_id}
            />

            {/* Feature 6: Group MVPs */}
            <GroupMVPsCard
              mvpsCurrent={mvpsCurrent}
              mvpsLast={mvpsLast}
              onGroupClick={(groupId) => setSelectedGroupId(groupId)}
            />

            {/* Feature 7: Needs a Nudge */}
            <NeedsANudgeCard nudgeGroups={nudgeGroups} />
          </aside>
        </div>
      </main>

      {/* ── Group Detail Drawer (Feature 5, 8, 11) ── */}
      {selectedGroupId && (
        <GroupDetailDrawer
          detail={groupDetail}
          periodLabel={periodLabelText}
          onClose={() => setSelectedGroupId(null)}
        />
      )}

      {/* ── Feature 13: Shareable Recap Card Modal ── */}
      {showRecapModal && (
        <RecapModal
          personalRecap={personalRecap}
          groupRecap={groupRecap}
          onClose={() => setShowRecapModal(false)}
        />
      )}

      {/* ── Full Overall Rankings Table Modal ── */}
      {showOverallTable && (
        <OverallTable
          students={karmaStore.members}
          groups={karmaStore.groups}
          onGroupClick={(groupId) => setSelectedGroupId(groupId)}
          onClose={() => setShowOverallTable(false)}
        />
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
