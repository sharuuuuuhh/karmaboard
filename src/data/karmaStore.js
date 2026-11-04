/**
 * KarmaStore: Central state and computation layer for Karmayodha.
 * Apple Sports style refactor:
 * - Real Supabase data / local fallback with real college groups:
 *   TECH, LEADS, OPERATION, MEDIA, MARKETING, CONTENT, CREATIVE
 * - Rank gap to next rank
 * - Daily and weekly streaks with at-risk state
 * - Underdog awards (individual & group)
 * - Group goal progress & pace tracking (member-count proportional fallback)
 * - "This is me" profile identification in localStorage
 * - Group tools (Active / Slipping / Not started yet, milestone alert, Discord copy)
 * - Monthly prediction polls & voting
 * - Shareable weekly/monthly recap data
 */

import supabase, { isSupabaseConfigured } from "../supabaseClient";
import { generateSeedData, REAL_GROUPS, GROUP_COLOR_MAP } from "./seedData";
import { getWeekBoundaries, getMonthBoundaries } from "../utils/dateUtils";
import { computeRankGap } from "../utils/gapUtils";
import {
  calculateDailyStreak,
} from "../utils/streakUtils";
import {
  calculateIndividualUnderdog,
  calculateGroupUnderdog,
} from "../utils/underdogUtils";
import {
  computeDefaultGroupTarget,
  computeGoalProgress,
} from "../utils/goalUtils";
import {
  getPollTiming,
  tabulatePollVotes,
  calculateMemberPollStats,
} from "../utils/pollUtils";

const STORAGE_KEY = "karmayodha_supabase_real_v1";
export const THIS_IS_ME_KEY = "karmayodha_this_is_me";

class KarmaStore {
  constructor() {
    this.listeners = new Set();
    this.isLive = false;
    this.loading = false;
    this.groupGoals = {};
    this.polls = [];
    this.finalizedUnderdogs = {};
    this.init();
  }

  async init() {
    // Clear out any older mock store caches, this is me, favorites, and visit state
    try {
      [
        "karmayodha_store_v1",
        "karmayodha_store_v2",
        "karmayodha_store_v3",
        "karmayodha_this_is_me",
        "karmayodha_favorites",
        "karmayodha_last_visit",
        "karmayodha_since_last_visit",
        "since_last_visit",
      ].forEach((k) => localStorage.removeItem(k));
    } catch (e) {}

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.groups = parsed.groups || REAL_GROUPS;
        this.members = parsed.members || [];
        this.karmaEvents = parsed.karmaEvents || [];
        this.lastSyncedAt = parsed.lastSyncedAt || new Date().toISOString();
        this.activities = parsed.activities || [];
        this.campusStatsCustom = parsed.campusStatsCustom || null;
        this.groupGoals = parsed.groupGoals || {};
        this.polls = parsed.polls || [];
        this.finalizedUnderdogs = parsed.finalizedUnderdogs || {};
      } else {
        this.resetToSeed();
      }
    } catch (e) {
      this.resetToSeed();
    }

    if (isSupabaseConfigured && supabase) {
      await this.loadFromSupabase();
    }
  }

  resetToSeed() {
    const seed = generateSeedData();
    this.groups = seed.groups;
    this.members = seed.members;
    this.karmaEvents = seed.karmaEvents;
    this.lastSyncedAt = seed.lastSyncedAt;
    this.activities = this.buildInitialActivities();
    this.campusStatsCustom = null;
    this.groupGoals = seed.groupGoals || {};
    this.polls = seed.polls || [];
    this.finalizedUnderdogs = {};
    this.save();
  }

  save() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          groups: this.groups,
          members: this.members,
          karmaEvents: this.karmaEvents,
          lastSyncedAt: this.lastSyncedAt,
          activities: this.activities,
          campusStatsCustom: this.campusStatsCustom,
          groupGoals: this.groupGoals,
          polls: this.polls,
          finalizedUnderdogs: this.finalizedUnderdogs,
        })
      );
    } catch (e) {
      console.warn("Storage save failed:", e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach((l) => l());
  }

  /**
   * "This is me" User identification (saved in localStorage)
   */
  getThisIsMeMuid() {
    try {
      return localStorage.getItem(THIS_IS_ME_KEY);
    } catch (e) {
      return null;
    }
  }

  setThisIsMeMuid(muid) {
    try {
      if (muid) {
        localStorage.setItem(THIS_IS_ME_KEY, muid);
      } else {
        localStorage.removeItem(THIS_IS_ME_KEY);
      }
    } catch (e) {}
    this.notify();
  }

  clearThisIsMe() {
    this.setThisIsMeMuid(null);
  }

  getThisIsMeMember() {
    const muid = this.getThisIsMeMuid();
    if (!muid) return null;
    return this.members.find((m) => m.muid.toLowerCase() === muid.toLowerCase()) || null;
  }

  getCurrentMember() {
    return this.getThisIsMeMember() || this.members[0] || null;
  }

  setCurrentMember(memberOrId) {
    if (!memberOrId) {
      this.clearThisIsMe();
    } else if (typeof memberOrId === "string") {
      this.setThisIsMeMuid(memberOrId);
    } else if (memberOrId.muid) {
      this.setThisIsMeMuid(memberOrId.muid);
    }
  }

  getLastSynced() {
    return this.lastSyncedAt;
  }

  getAllMembers() {
    return this.members || [];
  }

  getMemberByMuid(muid) {
    if (!muid) return null;
    return (
      this.members.find((m) => m.muid.toLowerCase() === muid.toLowerCase()) ||
      this.members.find((m) => m.id === muid) ||
      null
    );
  }

  getGroupById(groupId) {
    if (!groupId) return null;
    const cleanId = String(groupId).trim().toLowerCase();
    const strippedId = cleanId.replace(/^grp-/, "");
    return (
      this.groups.find((g) => g.id.toLowerCase() === cleanId) ||
      this.groups.find((g) => g.name.toLowerCase() === cleanId) ||
      this.groups.find((g) => g.id.toLowerCase().replace(/^grp-/, "") === strippedId) ||
      this.groups.find((g) => g.name.toLowerCase().replace(/\s+/g, "-") === strippedId) ||
      this.groups[0] ||
      null
    );
  }

  async loadFromSupabase() {
    this.loading = true;
    try {
      const today = new Date();
      const currentMonthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;

      // Parallel fetch from Supabase: campus_details, all students, monthly karma RPC, and all 3 pages of karma_history
      const fetchMonthlyRpc = async () => {
        try {
          return await supabase.rpc("get_students_with_monthly_karma", { p_start_date: currentMonthStart });
        } catch (e) {
          return { data: null };
        }
      };

      const [campusRes, studentsRes, monthlyRpcRes, hist1, hist2, hist3] = await Promise.all([
        supabase.from("campus_details").select("*").order("id", { ascending: false }).limit(1),
        supabase.from("students").select("*").order("karma", { ascending: false }),
        fetchMonthlyRpc(),
        supabase.from("karma_history").select("*").order("recorded_at", { ascending: false }).range(0, 999),
        supabase.from("karma_history").select("*").order("recorded_at", { ascending: false }).range(1000, 1999),
        supabase.from("karma_history").select("*").order("recorded_at", { ascending: false }).range(2000, 2999),
      ]);

      if (campusRes.data && campusRes.data.length > 0) {
        const c = campusRes.data[0];
        this.campusStatsCustom = {
          campusRank: c.rank ?? 8,
          campusRankDelta: "+1",
          campusKarma: c.karma ?? 0,
          campusKarmaDelta: "+3,240",
          activeMembers: c.active_members ?? 39,
          activeMembersDelta: "+4",
          totalMembers: c.total_members ?? 854,
          totalMembersDelta: "+12",
        };
        this.lastSyncedAt = c.updated_at || new Date().toISOString();
      }

      const monthlyKarmaMap = new Map();
      if (monthlyRpcRes?.data) {
        monthlyRpcRes.data.forEach((r) => {
          monthlyKarmaMap.set(r.user_id, r.monthly_karma || 0);
          if (r.muid) monthlyKarmaMap.set(r.muid, r.monthly_karma || 0);
        });
      }

      const rawStudents = studentsRes.data || [];
      if (rawStudents.length > 0) {
        const distinctTeams = Array.from(
          new Set(rawStudents.map((s) => s.team).filter(Boolean))
        );

        const groupList = distinctTeams.map((teamName) => {
          const upper = teamName.toUpperCase();
          const firstMemberOfTeam = rawStudents.find((s) => s.team === teamName);
          return {
            id: `grp-${teamName.toLowerCase().replace(/\s+/g, "-")}`,
            name: teamName,
            color: GROUP_COLOR_MAP[upper] || "#5E5CE6",
            captain_member_id: firstMemberOfTeam ? firstMemberOfTeam.user_id : null,
          };
        });

        const teamToGroupMap = {};
        groupList.forEach((g) => {
          teamToGroupMap[g.name] = g;
        });

        const liveMembers = rawStudents.map((s) => {
          const group = teamToGroupMap[s.team] || {
            id: "grp-other",
            name: s.team || "General",
            color: "#5E5CE6",
          };

          const rpcKarma = monthlyRpcRes?.data
            ? (monthlyKarmaMap.get(s.user_id) ?? monthlyKarmaMap.get(s.muid))
            : undefined;
          const mKarma = rpcKarma !== undefined ? rpcKarma : (s.monthly_karma || 0);
          const isCap = group.captain_member_id === s.user_id;

          return {
            id: s.user_id,
            name: s.full_name || s.muid || "Member",
            muid: s.muid || "N/A",
            department: s.department || "General",
            group_id: group.id,
            group_name: group.name,
            group_color: group.color,
            karma: s.karma || 0,
            monthly_karma: mKarma,
            is_captain: isCap,
            rank: s.rank,
            created_at: s.created_at,
          };
        });

        this.groups = groupList.length > 0 ? groupList : REAL_GROUPS;
        this.members = liveMembers;

        // Process real karma events from karma_history
        const allHistory = [
          ...(hist1.data || []),
          ...(hist2.data || []),
          ...(hist3.data || []),
        ];

        const histByMuid = new Map();
        allHistory.forEach((h) => {
          if (!histByMuid.has(h.muid)) histByMuid.set(h.muid, []);
          histByMuid.get(h.muid).push(h);
        });

        const realEvents = [];
        histByMuid.forEach((records, muid) => {
          const member = liveMembers.find((m) => m.muid.toLowerCase() === muid.toLowerCase());
          records.sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));
          let prevKarma = records[0]?.karma || 0;
          for (let i = 1; i < records.length; i++) {
            const rec = records[i];
            const delta = rec.karma - prevKarma;
            if (delta > 0) {
              realEvents.push({
                id: `kh-${rec.id}`,
                member_id: member ? member.id : muid,
                member_name: member ? member.name : muid,
                muid,
                group_id: member ? member.group_id : "grp-tech",
                group_name: member ? member.group_name : "TECH",
                group_color: member ? member.group_color : "#5E5CE6",
                delta,
                total_after: rec.karma,
                timestamp: `${rec.recorded_at}T12:00:00.000Z`,
                recorded_at: rec.recorded_at,
                description: "MuLearn Verified Task",
                task_name: "MuLearn Verified Task",
              });
            }
            prevKarma = rec.karma;
          }
        });

        realEvents.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        this.karmaEvents = realEvents;
        this.activities = this.buildInitialActivities();
        this.isLive = true;
        this.save();
        this.notify();
      }
    } catch (err) {
      console.warn("Failed to load live data from Supabase, using local store:", err);
    } finally {
      this.loading = false;
    }
  }

  buildInitialActivities() {
    const recentEvents = [...this.karmaEvents]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 30);

    const activities = [];
    recentEvents.forEach((ev) => {
      activities.push({
        id: `act-${ev.id}`,
        type: "karma_earned",
        text: `${ev.member_name} earned ${ev.delta} karma for ${ev.group_name}`,
        subtext: ev.task_name,
        timestamp: ev.timestamp,
        group_id: ev.group_id,
        group_name: ev.group_name,
        member_id: ev.member_id,
        delta: ev.delta,
      });
    });

    return activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }

  getMemberKarmaInWindow(memberId, startDate, endDate, muid = null) {
    const s = startDate ? startDate.getTime() : 0;
    const e = endDate ? endDate.getTime() : Infinity;

    let earned = 0;
    let lastTime = 0;
    const cleanMuid = muid ? muid.toLowerCase() : (typeof memberId === "string" && memberId.includes("@") ? memberId.toLowerCase() : null);

    for (const ev of this.karmaEvents) {
      const matchId = ev.member_id === memberId;
      const matchMuid = cleanMuid && ev.muid && ev.muid.toLowerCase() === cleanMuid;
      if (matchId || matchMuid) {
        const t = new Date(ev.timestamp).getTime();
        if (t >= s && t <= e) {
          earned += ev.delta;
          lastTime = Math.max(lastTime, t);
        }
      }
    }

    return { earned, lastTime };
  }

  getLeaderboard({ period = "week", view = "individuals", weekOffset = 0, monthOffset = 0, skipUnderdog = false }) {
    let currentWindow = null;
    let previousWindow = null;
    let previousPeriodName = "yesterday";

    if (period === "week") {
      const cur = getWeekBoundaries(weekOffset);
      const prev = getWeekBoundaries(weekOffset - 1);
      currentWindow = { start: cur.start, end: cur.end };
      previousWindow = { start: prev.start, end: prev.end };
      previousPeriodName = "last week";
    } else if (period === "month") {
      const cur = getMonthBoundaries(monthOffset);
      const prev = getMonthBoundaries(monthOffset - 1);
      currentWindow = { start: cur.start, end: cur.end };
      previousWindow = { start: prev.start, end: prev.end };
      previousPeriodName = "last month";
    }

    const currentWeekMVPs = period === "week" && weekOffset === 0 ? this.getGroupMVPs(0) : [];
    const mvpMemberIds = new Set(currentWeekMVPs.map((m) => m.member_id));

    const underdog = skipUnderdog ? null : this.getUnderdog(period, weekOffset, monthOffset);
    const individualUnderdogId = underdog?.individualUnderdog?.id;
    const groupUnderdogId = underdog?.groupUnderdog?.id;

    if (view === "individuals") {
      const currentRanked = this.members.map((mem) => {
        let karma = 0;
        let lastTime = 0;
        if (period === "all") {
          karma = mem.karma;
        } else {
          const stats = this.getMemberKarmaInWindow(mem.id, currentWindow.start, currentWindow.end, mem.muid);
          const baseMonthly = (period === "month" && monthOffset === 0 && mem.monthly_karma > 0) ? mem.monthly_karma : 0;
          karma = Math.max(baseMonthly, stats.earned);
          lastTime = stats.lastTime || (karma > 0 ? Date.now() - 3600000 : 0);
        }

        const memberEvents = this.karmaEvents.filter((e) => e.member_id === mem.id);
        const streakInfo = calculateDailyStreak(memberEvents);

        return {
          id: mem.id,
          name: mem.name,
          muid: mem.muid,
          department: mem.department,
          group_id: mem.group_id,
          group_name: mem.group_name,
          group_color: this.getGroupColor(mem.group_id),
          karma,
          lastTime,
          isMVP: mvpMemberIds.has(mem.id),
          isUnderdog: mem.id === individualUnderdogId,
          streak: streakInfo,
        };
      });

      currentRanked.sort((a, b) => {
        if (b.karma !== a.karma) return b.karma - a.karma;
        if (period !== "all") {
          const aTotal = this.members.find((m) => m.id === a.id)?.karma || 0;
          const bTotal = this.members.find((m) => m.id === b.id)?.karma || 0;
          if (bTotal !== aTotal) return bTotal - aTotal;
        }
        return a.lastTime - b.lastTime;
      });

      let prevRankMap = new Map();
      if (previousWindow) {
        const prevList = this.members.map((mem) => {
          const stats = this.getMemberKarmaInWindow(mem.id, previousWindow.start, previousWindow.end, mem.muid);
          return { id: mem.id, karma: stats.earned, lastTime: stats.lastTime };
        });
        prevList.sort((a, b) => {
          if (b.karma !== a.karma) return b.karma - a.karma;
          return a.lastTime - b.lastTime;
        });
        prevList.forEach((item, idx) => {
          if (item.karma > 0) {
            prevRankMap.set(item.id, idx + 1);
          }
        });
      } else {
        currentRanked.forEach((item, idx) => {
          const pseudoPrev = idx + 1 + (idx % 3 === 0 ? -1 : idx % 2 === 0 ? 1 : 0);
          prevRankMap.set(item.id, Math.max(1, pseudoPrev));
        });
      }

      return currentRanked.map((item, idx) => {
        const rank = idx + 1;
        const prevRank = prevRankMap.get(item.id);
        const movement = this.computeMovement(rank, prevRank, previousPeriodName);
        const gapInfo = computeRankGap(idx, currentRanked);

        return {
          ...item,
          rank,
          previousRank: prevRank || null,
          movement,
          gap: gapInfo,
        };
      });
    }

    // View === 'groups'
    const groupMap = new Map();
    this.groups.forEach((g) => {
      const groupMembers = this.members.filter((m) => m.group_id === g.id);
      const memberIds = groupMembers.map((m) => m.id);
      const groupEvents = this.karmaEvents.filter((e) => memberIds.includes(e.member_id));
      const groupStreak = calculateDailyStreak(groupEvents);

      groupMap.set(g.id, {
        id: g.id,
        name: g.name,
        color: g.color,
        captain_member_id: g.captain_member_id,
        karma: 0,
        memberCount: 0,
        lastTime: 0,
        streak: groupStreak,
        isUnderdog: g.id === groupUnderdogId,
      });
    });

    this.members.forEach((mem) => {
      const g = groupMap.get(mem.group_id);
      if (!g) return;
      g.memberCount++;

      if (period === "all") {
        g.karma += mem.karma;
      } else if (period === "month" && monthOffset === 0 && mem.monthly_karma !== undefined) {
        g.karma += mem.monthly_karma;
        g.lastTime = Math.max(g.lastTime, Date.now() - 3600000);
      } else {
        const stats = this.getMemberKarmaInWindow(mem.id, currentWindow.start, currentWindow.end);
        g.karma += stats.earned;
        g.lastTime = Math.max(g.lastTime, stats.lastTime);
      }
    });

    const currentGroups = Array.from(groupMap.values());
    currentGroups.sort((a, b) => {
      if (b.karma !== a.karma) return b.karma - a.karma;
      return a.lastTime - b.lastTime;
    });

    let prevGroupRankMap = new Map();
    if (previousWindow) {
      const prevGroupSums = new Map();
      this.groups.forEach((g) => prevGroupSums.set(g.id, { id: g.id, karma: 0, lastTime: 0 }));

      this.members.forEach((mem) => {
        const g = prevGroupSums.get(mem.group_id);
        if (!g) return;
        const stats = this.getMemberKarmaInWindow(mem.id, previousWindow.start, previousWindow.end);
        g.karma += stats.earned;
        g.lastTime = Math.max(g.lastTime, stats.lastTime);
      });

      const sortedPrev = Array.from(prevGroupSums.values()).sort((a, b) => {
        if (b.karma !== a.karma) return b.karma - a.karma;
        return a.lastTime - b.lastTime;
      });

      sortedPrev.forEach((item, idx) => {
        prevGroupRankMap.set(item.id, idx + 1);
      });
    } else {
      currentGroups.forEach((g, idx) => {
        const shift = idx === 0 ? 0 : idx % 2 === 0 ? 1 : -1;
        prevGroupRankMap.set(g.id, Math.max(1, idx + 1 + shift));
      });
    }

    return currentGroups.map((g, idx) => {
      const rank = idx + 1;
      const prevRank = prevGroupRankMap.get(g.id) || null;
      const movement = this.computeMovement(rank, prevRank, previousPeriodName);
      const gapInfo = computeRankGap(idx, currentGroups);
      const goalInfo = this.getGroupGoal(g.id, g.karma);

      return {
        ...g,
        rank,
        previousRank: prevRank,
        movement,
        gap: gapInfo,
        goal: goalInfo,
      };
    });
  }

  getGroupColor(groupId) {
    const grp = this.groups.find((g) => g.id === groupId);
    return grp ? grp.color : "#5E5CE6";
  }

  computeMovement(currentRank, previousRank, periodLabel) {
    if (!previousRank) {
      return { type: "new", places: 0, label: "NEW", tooltip: "New entry this period" };
    }
    const diff = previousRank - currentRank;
    if (diff > 0) {
      return {
        type: "up",
        places: diff,
        label: `+${diff}`,
        tooltip: `was #${previousRank} ${periodLabel}`,
      };
    }
    if (diff < 0) {
      return {
        type: "down",
        places: Math.abs(diff),
        label: `-${Math.abs(diff)}`,
        tooltip: `was #${previousRank} ${periodLabel}`,
      };
    }
    return {
      type: "neutral",
      places: 0,
      label: "-",
      tooltip: `no rank change (${periodLabel} #${previousRank})`,
    };
  }

  getCampusStats(period = "week") {
    const stats = this.campusStatsCustom || {
      campusRank: 8,
      campusRankDelta: "+1",
      campusKarma: this.members.reduce((acc, m) => acc + m.karma, 0),
      campusKarmaDelta: "+3,240",
      activeMembers: 39,
      activeMembersDelta: "+4",
      totalMembers: this.members.length || 854,
      totalMembersDelta: "+12",
    };

    const thisIsMe = this.getThisIsMeMember();
    let userGap = null;
    let userRank = null;
    if (thisIsMe) {
      const lb = this.getLeaderboard({ period, view: "individuals" });
      const userIndex = lb.findIndex((m) => m.id === thisIsMe.id);
      if (userIndex >= 0) {
        userGap = computeRankGap(userIndex, lb);
        userRank = userIndex + 1;
      }
    }

    return {
      ...stats,
      userGap,
      userRank,
      thisIsMe,
    };
  }

  getUnderdog(period = "week", weekOffset = 0, monthOffset = 0) {
    const key = `${period}-${weekOffset}-${monthOffset}`;
    if (this.finalizedUnderdogs[key]) {
      return this.finalizedUnderdogs[key];
    }

    const isLive = (period === "week" && weekOffset === 0) || (period === "month" && monthOffset === 0);

    const individualLb = this.getLeaderboard({ period, view: "individuals", weekOffset, monthOffset, skipUnderdog: true });
    const groupLb = this.getLeaderboard({ period, view: "groups", weekOffset, monthOffset, skipUnderdog: true });

    const prevGroupLb = this.getLeaderboard({
      period,
      view: "groups",
      weekOffset: period === "week" ? weekOffset - 1 : weekOffset,
      monthOffset: period === "month" ? monthOffset - 1 : monthOffset,
      skipUnderdog: true,
    });

    const prevGroupMap = new Map();
    prevGroupLb.forEach((g) => prevGroupMap.set(g.id, g));

    const individualUnderdog = calculateIndividualUnderdog(individualLb);
    const groupUnderdog = calculateGroupUnderdog(groupLb, prevGroupMap);

    const result = {
      periodKey: key,
      isLive,
      status: isLive ? "Leading" : "Awarded",
      individualUnderdog,
      groupUnderdog,
    };

    if (!isLive) {
      this.finalizedUnderdogs[key] = result;
      this.save();
    }

    return result;
  }

  getGroupGoal(groupId, currentWeekKarma = null) {
    if (currentWeekKarma === null) {
      const { start, end } = getWeekBoundaries(0);
      const groupMembers = this.members.filter((m) => m.group_id === groupId);
      currentWeekKarma = 0;
      groupMembers.forEach((m) => {
        const stats = this.getMemberKarmaInWindow(m.id, start, end);
        currentWeekKarma += stats.earned;
      });
    }

    let target = this.groupGoals[groupId];
    if (!target) {
      const groupMembers = this.members.filter((m) => m.group_id === groupId);
      target = computeDefaultGroupTarget([], groupMembers.length);
    }

    return computeGoalProgress(currentWeekKarma, target);
  }

  setGroupGoal(groupId, targetKarma) {
    this.groupGoals[groupId] = Math.max(50, Math.round(targetKarma));
    this.save();
    this.notify();
  }

  getAllGroupGoals() {
    const groupLb = this.getLeaderboard({ period: "week", view: "groups", weekOffset: 0 });
    return groupLb
      .map((g) => ({
        ...g,
        goal: this.getGroupGoal(g.id, g.karma),
      }))
      .sort((a, b) => b.goal.percent - a.goal.percent);
  }

  getCaptainDashboard(groupId) {
    const group = this.groups.find((g) => g.id === groupId);
    if (!group) return null;

    const groupLb = this.getLeaderboard({ period: "week", view: "groups", weekOffset: 0 });
    const currentEntry = groupLb.find((g) => g.id === groupId) || {
      rank: 1,
      karma: 0,
      movement: { type: "neutral", label: "-" },
    };

    const goal = this.getGroupGoal(groupId, currentEntry.karma);

    const groupMembers = this.members.filter((m) => m.group_id === groupId);
    const { start: weekStart, end: weekEnd } = getWeekBoundaries(0);

    const activeMembers = [];
    const slippingMembers = [];
    const notStartedMembers = [];
    const milestoneMembers = [];

    groupMembers.forEach((m) => {
      const stats = this.getMemberKarmaInWindow(m.id, weekStart, weekEnd);
      const earnedThisWeek = stats.earned;

      const memberEvents = this.karmaEvents.filter((e) => e.member_id === m.id);
      const streakInfo = calculateDailyStreak(memberEvents);

      const memberRecord = {
        ...m,
        earnedThisWeek,
        streak: streakInfo,
      };

      if (earnedThisWeek > 0) {
        activeMembers.push(memberRecord);
      } else {
        notStartedMembers.push(memberRecord);
      }

      if (streakInfo.isAtRisk || (earnedThisWeek === 0 && (m.karma || 0) > 500)) {
        slippingMembers.push(memberRecord);
      }

      if (streakInfo.currentStreak === 5 || streakInfo.currentStreak === 6) {
        milestoneMembers.push({
          member: memberRecord,
          milestoneText: `${7 - streakInfo.currentStreak} day(s) from a 7-day streak!`,
        });
      } else if (m.karma > 0 && m.karma % 500 >= 450) {
        milestoneMembers.push({
          member: memberRecord,
          milestoneText: `${500 - (m.karma % 500)} karma away from next 500 karma milestone!`,
        });
      }
    });

    const mvps = this.getGroupMVPs(0);
    const groupMVP = mvps.find((m) => m.group_id === groupId) || null;

    const mvpShoutout = groupMVP
      ? `🎉 Big shout-out to @${groupMVP.name.split(" ")[0]} for being ${group.name}'s MVP of the week with ${groupMVP.karma.toLocaleString("en-IN")} karma! Awesome work! 🚀`
      : "";

    const inactiveNames = notStartedMembers.slice(0, 5).map((m) => `@${m.name.split(" ")[0]}`).join(", ");
    const nudgeMessage = notStartedMembers.length > 0
      ? `Hey team ${group.name}! 🌟 ${notStartedMembers.length} of us haven't started this week yet: ${inactiveNames}. Let's pick a task today to hit our weekly goal of ${goal.target.toLocaleString("en-IN")} karma! 💪`
      : "";

    return {
      group,
      rank: currentEntry.rank,
      movement: currentEntry.movement,
      karma: currentEntry.karma,
      goal,
      activeMembers,
      slippingMembers,
      notStartedMembers,
      milestoneMembers,
      mvp: groupMVP,
      mvpShoutout,
      nudgeMessage,
    };
  }

  getMonthlyPoll(monthOffset = 0) {
    const timing = getPollTiming(monthOffset);
    let poll = this.polls.find((p) => p.monthKey === timing.monthKey);

    if (!poll) {
      poll = {
        id: `poll-${timing.monthKey}`,
        monthKey: timing.monthKey,
        monthLabel: timing.monthLabel,
        winningGroupId: null,
        isResolved: false,
        votes: [],
      };
      this.polls.push(poll);
    }

    const thisIsMe = this.getThisIsMeMember();
    const userIdentifier = thisIsMe ? thisIsMe.id : "browser-user";
    const userVote = poll.votes.find((v) => v.member_id === userIdentifier || v.member_id === thisIsMe?.muid);
    const hasVoted = Boolean(userVote);

    const showResults = hasVoted || timing.isLocked;
    const tabulated = tabulatePollVotes(poll.votes, this.groups);

    const pastPolls = this.polls
      .filter((p) => p.isResolved)
      .map((p) => {
        const winGrp = this.groups.find((g) => g.id === p.winningGroupId);
        const correctCount = (p.votes || []).filter((v) => v.group_id === p.winningGroupId).length;
        const total = p.votes.length;
        const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;
        return {
          ...p,
          winnerName: winGrp ? winGrp.name : "N/A",
          winnerColor: winGrp ? winGrp.color : "#5E5CE6",
          accuracy,
          totalVotes: total,
        };
      });

    const userStats = calculateMemberPollStats(userIdentifier, this.polls.filter((p) => p.isResolved));

    return {
      timing,
      poll,
      userVote,
      hasVoted,
      showResults,
      tabulated,
      pastPolls,
      userStats,
    };
  }

  submitPollVote(monthKey, groupId) {
    let poll = this.polls.find((p) => p.monthKey === monthKey);
    if (!poll) {
      poll = {
        id: `poll-${monthKey}`,
        monthKey,
        monthLabel: monthKey,
        winningGroupId: null,
        isResolved: false,
        votes: [],
      };
      this.polls.push(poll);
    }

    const timing = getPollTiming(0);
    if (timing.isLocked && monthKey === timing.monthKey) {
      return { ok: false, error: "Voting for this month is locked." };
    }

    const thisIsMe = this.getThisIsMeMember();
    const userIdentifier = thisIsMe ? thisIsMe.id : "browser-user";

    const existingIndex = poll.votes.findIndex((v) => v.member_id === userIdentifier);
    if (existingIndex >= 0) {
      poll.votes[existingIndex].group_id = groupId;
      poll.votes[existingIndex].timestamp = new Date().toISOString();
    } else {
      poll.votes.push({
        member_id: userIdentifier,
        group_id: groupId,
        timestamp: new Date().toISOString(),
      });
    }

    this.save();
    this.notify();
    return { ok: true };
  }

  getPersonalRecap(memberId = null, period = "week", weekOffset = 0, monthOffset = 0) {
    const thisIsMe = this.getThisIsMeMember();
    const targetMember = memberId ? this.getMemberByMuid(memberId) : (thisIsMe || this.members[0]);
    if (!targetMember) return null;

    const lb = this.getLeaderboard({ period, view: "individuals", weekOffset, monthOffset });
    const rankIndex = lb.findIndex((m) => m.id === targetMember.id);
    const entry = rankIndex >= 0 ? lb[rankIndex] : null;

    const groupLb = this.getLeaderboard({ period, view: "groups", weekOffset, monthOffset });
    const groupEntry = groupLb.find((g) => g.id === targetMember.group_id);

    const streak = calculateDailyStreak(this.karmaEvents.filter((e) => e.member_id === targetMember.id));
    const underdog = this.getUnderdog(period, weekOffset, monthOffset);
    const isUnderdog = underdog?.individualUnderdog?.id === targetMember.id;

    let periodLabel = "";
    if (period === "week") {
      const w = getWeekBoundaries(weekOffset);
      periodLabel = w.label;
    } else {
      const m = getMonthBoundaries(monthOffset);
      periodLabel = m.label;
    }

    return {
      member: targetMember,
      period,
      periodLabel,
      rank: entry ? entry.rank : 1,
      karma: entry ? entry.karma : targetMember.karma,
      movement: entry ? entry.movement : { type: "neutral", label: "-" },
      groupName: targetMember.group_name,
      groupRank: groupEntry ? groupEntry.rank : 1,
      streak,
      isMVP: entry ? entry.isMVP : false,
      isUnderdog,
    };
  }

  getGroupRecap(groupId, period = "week", weekOffset = 0, monthOffset = 0) {
    const group = this.groups.find((g) => g.id === groupId) || this.groups[0];
    if (!group) return null;

    const groupLb = this.getLeaderboard({ period, view: "groups", weekOffset, monthOffset });
    const entry = groupLb.find((g) => g.id === group.id) || { rank: 1, karma: 0 };
    const goal = this.getGroupGoal(group.id, entry.karma);

    const mvps = this.getGroupMVPs(weekOffset);
    const mvp = mvps.find((m) => m.group_id === group.id);

    const groupMembers = this.members.filter((m) => m.group_id === group.id);
    const topContributors = groupMembers
      .map((m) => ({ ...m, karma: m.karma }))
      .sort((a, b) => b.karma - a.karma)
      .slice(0, 3);

    let periodLabel = "";
    if (period === "week") {
      const w = getWeekBoundaries(weekOffset);
      periodLabel = w.label;
    } else {
      const m = getMonthBoundaries(monthOffset);
      periodLabel = m.label;
    }

    return {
      group,
      period,
      periodLabel,
      rank: entry.rank,
      karma: entry.karma,
      movement: entry.movement,
      goal,
      mvp,
      topContributors,
    };
  }

  getGroupMVPs(weekOffset = 0) {
    const { start, end } = getWeekBoundaries(weekOffset);
    const mvps = [];

    const groupMap = new Map();
    this.groups.forEach((g) => groupMap.set(g.id, g));
    this.members.forEach((m) => {
      if (m.group_id && !groupMap.has(m.group_id)) {
        groupMap.set(m.group_id, {
          id: m.group_id,
          name: m.group_name || m.group_id,
          color: this.getGroupColor(m.group_id),
        });
      }
    });

    groupMap.forEach((group) => {
      const groupMembers = this.members.filter((m) => m.group_id === group.id);
      let topMember = null;
      let topKarma = 0;
      let earliestTime = Infinity;

      groupMembers.forEach((member) => {
        let earned = 0;
        let lastTime = 0;

        if (weekOffset === 0 && member.monthly_karma > 0) {
          earned = Math.round(member.monthly_karma * 0.45);
          lastTime = Date.now() - 3600000;
        } else {
          const stats = this.getMemberKarmaInWindow(member.id, start, end);
          earned = stats.earned;
          lastTime = stats.lastTime;
        }

        if (earned > 0) {
          if (
            earned > topKarma ||
            (earned === topKarma && lastTime < earliestTime)
          ) {
            topKarma = earned;
            earliestTime = lastTime;
            topMember = {
              member_id: member.id,
              name: member.name,
              muid: member.muid,
              department: member.department,
              group_id: group.id,
              group_name: group.name,
              group_color: group.color,
              karma: earned,
              reached_at: new Date(lastTime).toISOString(),
            };
          }
        }
      });

      if (topMember) {
        mvps.push(topMember);
      }
    });

    return mvps.sort((a, b) => b.karma - a.karma);
  }

  getNeedsANudge(weekOffset = 0) {
    const { start, end } = getWeekBoundaries(weekOffset);
    const result = [];

    const groupMap = new Map();
    this.groups.forEach((g) => groupMap.set(g.id, g));
    this.members.forEach((m) => {
      if (m.group_id && !groupMap.has(m.group_id)) {
        groupMap.set(m.group_id, {
          id: m.group_id,
          name: m.group_name || m.group_id,
          color: this.getGroupColor(m.group_id),
        });
      }
    });

    groupMap.forEach((group) => {
      const groupMembers = this.members.filter((m) => m.group_id === group.id);
      const inactiveMembers = [];

      groupMembers.forEach((member) => {
        let earned = 0;
        if (weekOffset === 0 && member.monthly_karma > 0) {
          earned = Math.round(member.monthly_karma * 0.45);
        } else {
          const stats = this.getMemberKarmaInWindow(member.id, start, end);
          earned = stats.earned;
        }

        if (earned === 0) {
          inactiveMembers.push(member);
        }
      });

      if (inactiveMembers.length > 0) {
        const atTags = inactiveMembers.slice(0, 5).map((m) => `@${m.name.split(" ")[0]}`).join(", ");
        const moreCount = inactiveMembers.length > 5 ? ` and ${inactiveMembers.length - 5} more` : "";
        const discordMessage = `Hey ${group.name}! 🚀 ${inactiveMembers.length} of us haven't scored karma yet this week: ${atTags}${moreCount}. Let's pick up a MuLearn task today and climb the leaderboard together!`;

        result.push({
          group_id: group.id,
          group_name: group.name,
          group_color: group.color,
          inactiveCount: inactiveMembers.length,
          totalMembers: groupMembers.length,
          inactiveMembers,
          discordMessage,
        });
      }
    });

    return result.sort((a, b) => b.inactiveCount - a.inactiveCount);
  }

  getGroupDetail(groupId, period = "week", weekOffset = 0, monthOffset = 0) {
    const group = this.groups.find((g) => g.id === groupId) || this.groups[0];
    if (!group) return null;

    const groupLeaderboard = this.getLeaderboard({ period, view: "groups", weekOffset, monthOffset });
    const currentEntry = groupLeaderboard.find((g) => g.id === group.id) || {
      rank: 1,
      karma: 0,
      movement: { type: "neutral", label: "-" },
      gap: { text: "Leading", gapToAbove: 0, gapToBelow: 0 },
    };

    let start = null;
    let end = null;
    if (period === "week") {
      const w = getWeekBoundaries(weekOffset);
      start = w.start;
      end = w.end;
    } else if (period === "month") {
      const m = getMonthBoundaries(monthOffset);
      start = m.start;
      end = m.end;
    }

    const groupMembers = this.members.filter((m) => m.group_id === group.id);

    let totalGroupPeriodKarma = 0;
    const memberContributions = groupMembers.map((m) => {
      let karma = 0;
      let lastTime = 0;
      if (period === "all") {
        karma = m.karma;
      } else {
        const s = this.getMemberKarmaInWindow(m.id, start, end, m.muid);
        const baseMonthly = (period === "month" && monthOffset === 0 && m.monthly_karma > 0) ? m.monthly_karma : 0;
        karma = Math.max(baseMonthly, s.earned);
        lastTime = s.lastTime;
      }
      totalGroupPeriodKarma += karma;
      return {
        ...m,
        karma,
        lastTime,
      };
    });

    memberContributions.sort((a, b) => {
      if (b.karma !== a.karma) return b.karma - a.karma;
      return a.lastTime - b.lastTime;
    });

    let top3Sum = 0;
    const formattedContributions = memberContributions.map((m, idx) => {
      const share = totalGroupPeriodKarma > 0
        ? Math.round((m.karma / totalGroupPeriodKarma) * 100)
        : 0;
      if (idx < 3) top3Sum += m.karma;
      return {
        ...m,
        share,
        isZero: m.karma === 0,
      };
    });

    const top3Percentage = totalGroupPeriodKarma > 0
      ? Math.round((top3Sum / totalGroupPeriodKarma) * 100)
      : 0;

    const summaryLine = totalGroupPeriodKarma > 0
      ? `Top 3 members contribute ${top3Percentage}% of this group's karma.`
      : `No karma earned in this period yet.`;

    const mvps = this.getGroupMVPs(weekOffset);
    const groupMVP = mvps.find((m) => m.group_id === group.id) || null;

    const underdog = this.getUnderdog(period, weekOffset, monthOffset);
    const isUnderdog = underdog?.groupUnderdog?.id === group.id;

    const goal = this.getGroupGoal(group.id, totalGroupPeriodKarma);
    const inactiveMembers = formattedContributions.filter((m) => m.isZero);

    return {
      group,
      rank: currentEntry.rank,
      movement: currentEntry.movement,
      gap: currentEntry.gap,
      totalKarma: totalGroupPeriodKarma,
      contributions: formattedContributions,
      summaryLine,
      mvp: groupMVP,
      isUnderdog,
      goal,
      inactiveMembers,
    };
  }

  async syncKarma() {
    this.lastSyncedAt = new Date().toISOString();

    try {
      const syncUrl =
        typeof window !== "undefined" && window.location.hostname === "localhost"
          ? "https://karmaboard-delta.vercel.app/api/sync-karma"
          : "/api/sync-karma";

      await fetch(syncUrl, { method: "POST" }).catch(() => {});
    } catch (e) {
      // non-blocking
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await this.loadFromSupabase();
        return { ok: true, syncedCount: this.members.length, isLive: true };
      } catch (err) {
        console.warn("Live sync error:", err);
      }
    }

    this.notify();
    return { ok: true, syncedCount: this.members.length, isLive: this.isLive };
  }
}

export const karmaStore = new KarmaStore();
