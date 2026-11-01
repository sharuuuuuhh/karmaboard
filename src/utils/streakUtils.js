/**
 * Streak Tracker Utilities for Karmayodha
 * Timezone: Asia/Kolkata (IST = UTC + 5:30)
 *
 * Rules:
 * - Day boundary: Midnight 00:00:00 to 23:59:59 IST.
 * - Active daily streak: Consecutive days with >= 1 positive event.
 * - If last scored day was yesterday: Streak is ACTIVE but "At Risk" (ends tonight).
 * - If last scored day was today: Streak is ACTIVE and safe for today.
 * - If last scored day was 2+ days ago: Current streak is 0.
 * - Longest streak: All-time historical consecutive run.
 * - Weekly streak: Consecutive calendar weeks (Mon-Sun IST) with >= 1 event.
 */

import { getISTDate, getStartOfWeekIST } from "./dateUtils";

/**
 * Returns YYYY-MM-DD string in Asia/Kolkata timezone.
 */
export function getISTDayKey(dateOrTimestamp) {
  const ist = getISTDate(dateOrTimestamp);
  const year = ist.getUTCFullYear();
  const month = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const day = String(ist.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Given two YYYY-MM-DD strings, returns the difference in days (dayB - dayA).
 */
export function diffDays(dayA, dayB) {
  const [y1, m1, d1] = dayA.split("-").map(Number);
  const [y2, m2, d2] = dayB.split("-").map(Number);
  const dateA = Date.UTC(y1, m1 - 1, d1);
  const dateB = Date.UTC(y2, m2 - 1, d2);
  return Math.round((dateB - dateA) / (24 * 60 * 60 * 1000));
}

/**
 * Calculate daily streak for a list of karma events for an individual.
 */
export function calculateDailyStreak(events = [], now = new Date()) {
  const positiveEvents = (events || []).filter((e) => e && (e.delta || 0) > 0 && e.timestamp);
  if (positiveEvents.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      isAtRisk: false,
      hasScoredToday: false,
      lastScoredDate: null,
      statusText: "No active streak",
    };
  }

  // Collect distinct active days in IST
  const activeDaysSet = new Set();
  positiveEvents.forEach((ev) => {
    activeDaysSet.add(getISTDayKey(ev.timestamp));
  });

  const sortedDays = Array.from(activeDaysSet).sort(); // chronological ascending
  if (sortedDays.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      isAtRisk: false,
      hasScoredToday: false,
      lastScoredDate: null,
      statusText: "No active streak",
    };
  }

  const todayKey = getISTDayKey(now);
  const lastActiveDay = sortedDays[sortedDays.length - 1];
  const daysSinceLast = diffDays(lastActiveDay, todayKey);

  const hasScoredToday = daysSinceLast === 0;
  const isAtRisk = daysSinceLast === 1;

  // 1. Calculate all-time longest streak
  let longestStreak = 0;
  let currentRun = 0;
  let prevDay = null;

  for (const day of sortedDays) {
    if (!prevDay) {
      currentRun = 1;
    } else {
      const gap = diffDays(prevDay, day);
      if (gap === 1) {
        currentRun += 1;
      } else {
        currentRun = 1;
      }
    }
    prevDay = day;
    if (currentRun > longestStreak) {
      longestStreak = currentRun;
    }
  }

  // 2. Calculate current streak backwards from today or yesterday
  let currentStreak = 0;
  if (hasScoredToday || isAtRisk) {
    let checkDay = lastActiveDay;
    currentStreak = 1;

    for (let i = sortedDays.length - 2; i >= 0; i--) {
      const prev = sortedDays[i];
      if (diffDays(prev, checkDay) === 1) {
        currentStreak++;
        checkDay = prev;
      } else {
        break;
      }
    }
  }

  let statusText = "No active streak";
  if (currentStreak > 0) {
    if (isAtRisk) {
      statusText = "Streak ends tonight";
    } else {
      statusText = `${currentStreak} day streak`;
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    isAtRisk,
    hasScoredToday,
    lastScoredDate: lastActiveDay,
    statusText,
  };
}

/**
 * Calculate weekly streak (consecutive calendar weeks with >= 1 event)
 */
export function calculateWeeklyStreak(events = [], now = new Date()) {
  const positiveEvents = (events || []).filter((e) => e && (e.delta || 0) > 0 && e.timestamp);
  if (positiveEvents.length === 0) {
    return { currentWeeklyStreak: 0, longestWeeklyStreak: 0 };
  }

  const activeWeeks = new Set();
  positiveEvents.forEach((ev) => {
    const mondayIST = getStartOfWeekIST(new Date(ev.timestamp));
    activeWeeks.add(mondayIST.getTime());
  });

  const sortedWeeks = Array.from(activeWeeks).sort((a, b) => a - b);
  const currentWeekMonday = getStartOfWeekIST(now).getTime();
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  // Longest weekly streak
  let longestWeeklyStreak = 0;
  let curRun = 0;
  let prevW = null;

  for (const w of sortedWeeks) {
    if (!prevW) {
      curRun = 1;
    } else {
      const diff = Math.round((w - prevW) / ONE_WEEK_MS);
      if (diff === 1) {
        curRun += 1;
      } else {
        curRun = 1;
      }
    }
    prevW = w;
    if (curRun > longestWeeklyStreak) longestWeeklyStreak = curRun;
  }

  // Current weekly streak
  let currentWeeklyStreak = 0;
  const lastWeek = sortedWeeks[sortedWeeks.length - 1];
  const diffFromCurrent = Math.round((currentWeekMonday - lastWeek) / ONE_WEEK_MS);

  if (diffFromCurrent === 0 || diffFromCurrent === 1) {
    let checkW = lastWeek;
    currentWeeklyStreak = 1;

    for (let i = sortedWeeks.length - 2; i >= 0; i--) {
      const prev = sortedWeeks[i];
      if (Math.round((checkW - prev) / ONE_WEEK_MS) === 1) {
        currentWeeklyStreak++;
        checkW = prev;
      } else {
        break;
      }
    }
  }

  return {
    currentWeeklyStreak,
    longestWeeklyStreak: Math.max(longestWeeklyStreak, currentWeeklyStreak),
  };
}

/**
 * Group active streak: Consecutive days where at least ONE member of the group scored.
 */
export function calculateGroupActiveStreak(events = [], memberIds = [], now = new Date()) {
  const memberIdSet = new Set(memberIds);
  const groupEvents = (events || []).filter(
    (e) => (e.delta || 0) > 0 && (memberIdSet.has(e.member_id) || memberIdSet.size === 0)
  );
  return calculateDailyStreak(groupEvents, now);
}

