/**
 * Group Goal Calculation Utility for Karmayodha
 *
 * Rules:
 * - When a group has at least 4 weeks of history:
 *   Target = average of group's last 4 weeks * 1.1, rounded to nearest 10.
 * - Fallback when a group has less than 4 weeks of history:
 *   Target is proportional to member count: (memberCount * 60 karma), so groups are comparable.
 * - Allow custom override target.
 * - Pace calculation based on elapsed time in current weekly season (Mon-Sun IST).
 */

import { getWeekBoundaries } from "./dateUtils";

export function computeDefaultGroupTarget(pastFourWeeksKarma = [], memberCount = null) {
  if (typeof pastFourWeeksKarma === "number") {
    memberCount = pastFourWeeksKarma;
    pastFourWeeksKarma = [];
  }
  if (!Array.isArray(pastFourWeeksKarma) || pastFourWeeksKarma.length === 0) {
    if (memberCount) return Math.max(120, Math.round((memberCount * 60) / 10) * 10);
    return 400;
  }
  if (pastFourWeeksKarma.length < 4) {
    const sum = pastFourWeeksKarma.reduce((acc, val) => acc + (val || 0), 0);
    const avg = sum / pastFourWeeksKarma.length;
    if (avg > 0) return Math.max(50, Math.round((avg * 1.1) / 10) * 10);
    return memberCount ? Math.max(120, Math.round((memberCount * 60) / 10) * 10) : 400;
  }
  const sum = pastFourWeeksKarma.reduce((acc, val) => acc + (val || 0), 0);
  const avg = sum / pastFourWeeksKarma.length;
  if (avg <= 0) return 400;
  const rawTarget = avg * 1.1;
  return Math.max(50, Math.round(rawTarget / 10) * 10);
}

export function computeGoalProgress(currentKarma = 0, targetKarma = 400, now = new Date()) {
  const safeTarget = Math.max(1, targetKarma || 400);
  const safeCurrent = Math.max(0, currentKarma || 0);

  const percent = Math.round((safeCurrent / safeTarget) * 100);
  const isReached = safeCurrent >= safeTarget;

  // Pace calculation: fraction of weekly season that has elapsed
  const { start, end } = getWeekBoundaries(0, now);
  const totalMs = end.getTime() - start.getTime();
  const elapsedMs = Math.max(0, Math.min(totalMs, now.getTime() - start.getTime()));
  const elapsedRatio = elapsedMs / totalMs; // 0 to 1

  // Expected progress at this point in the week
  const expectedKarma = safeTarget * elapsedRatio;
  const isOnPace = isReached || safeCurrent >= expectedKarma * 0.9;

  return {
    current: safeCurrent,
    target: safeTarget,
    percent,
    isReached,
    paceText: isReached ? "Goal reached" : isOnPace ? "On pace" : "Behind pace",
    isOnPace,
    statusLabel: `${safeCurrent.toLocaleString("en-IN")} / ${safeTarget.toLocaleString("en-IN")} karma`,
  };
}
