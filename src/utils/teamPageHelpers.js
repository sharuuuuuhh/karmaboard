import { getWeekBoundaries } from "./dateUtils";
import { isOfficialTeam } from "./groupTokens";

/**
 * Calculates median of an array of numbers.
 */
export function calculateMedian(numbers = []) {
  if (!numbers || !numbers.length) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Rule for Sleeping Giants:
 * Identifies members with 0 karma this week whose average weekly karma over the previous 4 weeks
 * is at least the team's median member average (and above 0).
 * Sorted by that average, descending. Returns up to 3.
 *
 * Edge cases:
 * - If the team has fewer than 4 weeks of history, returns { hasEnoughHistory: false, giants: [] }.
 * - If everyone has scored this week or no member qualifies, returns { hasEnoughHistory: true, giants: [] }.
 */
export function getSleepingGiants({
  members = [],
  karmaEvents = [],
  currentWeekOffset = 0,
}) {
  if (!members || members.length === 0) {
    return { hasEnoughHistory: false, giants: [] };
  }

  // Determine boundaries for current week and previous 4 weeks
  const currentWeek = getWeekBoundaries(currentWeekOffset);
  const pastWeeks = [];
  for (let i = 1; i <= 4; i++) {
    pastWeeks.push(getWeekBoundaries(currentWeekOffset - i));
  }

  const teamMemberIds = new Set(members.map((m) => m.id));
  const teamMemberMuids = new Set(
    members.map((m) => (m.muid ? m.muid.toLowerCase() : "")).filter(Boolean)
  );

  const teamEvents = (karmaEvents || []).filter(
    (e) =>
      teamMemberIds.has(e.member_id) ||
      (e.muid && teamMemberMuids.has(e.muid.toLowerCase()))
  );

  // If there are no team events or the oldest event is newer than 4 weeks ago
  const oldestEventTime = teamEvents.reduce(
    (min, e) => {
      const t = new Date(e.timestamp || e.recorded_at).getTime();
      return t < min ? t : min;
    },
    Infinity
  );

  // 4 weeks history boundary
  const fourWeeksAgoMs = pastWeeks[3].start.getTime();
  const hasHistory = oldestEventTime !== Infinity && oldestEventTime <= fourWeeksAgoMs;

  if (!hasHistory && teamEvents.length < 4) {
    return { hasEnoughHistory: false, giants: [] };
  }

  // Compute current week karma for each member
  const currentStart = currentWeek.start.getTime();
  const currentEnd = currentWeek.end.getTime();

  // Compute past 4 weeks karma for each member
  const memberStats = members.map((mem) => {
    const memEvents = teamEvents.filter(
      (e) =>
        e.member_id === mem.id ||
        (e.muid && mem.muid && e.muid.toLowerCase() === mem.muid.toLowerCase())
    );

    // Current week karma
    const currentKarma = memEvents
      .filter((e) => {
        const t = new Date(e.timestamp || e.recorded_at).getTime();
        return t >= currentStart && t <= currentEnd;
      })
      .reduce((sum, e) => sum + (e.delta || 0), 0);

    // 4 previous weeks karma
    const weeklyTotals = pastWeeks.map((w) => {
      const wStart = w.start.getTime();
      const wEnd = w.end.getTime();
      return memEvents
        .filter((e) => {
          const t = new Date(e.timestamp || e.recorded_at).getTime();
          return t >= wStart && t <= wEnd;
        })
        .reduce((sum, e) => sum + (e.delta || 0), 0);
    });

    const totalPast4Weeks = weeklyTotals.reduce((a, b) => a + b, 0);
    const avg4Weeks = totalPast4Weeks / 4;

    // Find last scored date
    const sortedPastEvents = [...memEvents].sort(
      (a, b) =>
        new Date(b.timestamp || b.recorded_at).getTime() -
        new Date(a.timestamp || a.recorded_at).getTime()
    );
    const lastEvent = sortedPastEvents[0];
    const lastScoreDate = lastEvent
      ? new Date(lastEvent.timestamp || lastEvent.recorded_at)
      : null;

    let daysAgo = null;
    if (lastScoreDate) {
      const diffMs = Date.now() - lastScoreDate.getTime();
      daysAgo = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    }

    return {
      id: mem.id,
      name: mem.name,
      muid: mem.muid,
      currentKarma,
      weeklyTotals,
      avg4Weeks,
      daysAgo: daysAgo !== null ? daysAgo : 9,
    };
  });

  // Calculate team median member average across all members in the team
  const allAverages = memberStats.map((m) => m.avg4Weeks);
  const teamMedianAvg = calculateMedian(allAverages);

  // Filter members with 0 karma this week whose average is >= teamMedianAvg and > 0
  const qualifying = memberStats.filter(
    (m) => m.currentKarma === 0 && m.avg4Weeks > 0 && m.avg4Weeks >= teamMedianAvg
  );

  // Sort descending by avg4Weeks
  qualifying.sort((a, b) => b.avg4Weeks - a.avg4Weeks);

  const giants = qualifying.slice(0, 3).map((m) => ({
    ...m,
    avg: Math.round(m.avg4Weeks),
  }));

  return {
    hasEnoughHistory: true,
    teamMedianAvg: Math.round(teamMedianAvg),
    giants,
  };
}

/**
 * Determines the rival team for the "CHASING YOU" / "NEXT TARGET" card.
 *
 * Rules:
 * - Filters leaderboard to only teams of the same type (official teams vs community groups).
 * - If current team is #1:
 *     Title: "CHASING YOU"
 *     Target: team directly below (rank #2).
 *     Gap: currentTeam.karma - targetTeam.karma.
 *     Threat:
 *       - "CLOSING IN" when gap < currentTeam.karma * 0.25 (accent color).
 *       - "WITHIN REACH" when gap < currentTeam.karma * 0.60.
 *       - "SAFE" otherwise.
 *     Caption: "Resets in {time}. They need {gap + 1} to pass you."
 * - If current team is NOT #1:
 *     Title: "NEXT TARGET"
 *     Target: team directly above.
 *     Gap: targetTeam.karma - currentTeam.karma.
 *     Threat:
 *       - "WITHIN REACH" when gap < targetTeam.karma * 0.25.
 *       - "IN SIGHT" when gap < targetTeam.karma * 0.60.
 *       - "CHALLENGE" otherwise.
 *     Caption: "Resets in {time}. You need {gap + 1} to pass them."
 * - Edge cases:
 *     - All teams have 0 karma: "No team is chasing yet".
 *     - If current team is last place: "No team behind you yet".
 *     - Ties: "TIED".
 *     - Never print "-0".
 */
export function getChasingOrTargetTeam({
  currentTeam,
  leaderboard = [],
  prevWeekLeaderboard = [],
}) {
  if (!currentTeam || !leaderboard.length) {
    return {
      type: "none",
      title: "CHASING YOU",
      statusMessage: "No team data available",
    };
  }

  // Filter to same type (official team vs campus group)
  const isOfficial = isOfficialTeam(currentTeam);
  const sameTypeLeaderboard = leaderboard.filter(
    (t) => isOfficialTeam(t) === isOfficial
  );

  const totalKarmaInDivision = sameTypeLeaderboard.reduce(
    (sum, t) => sum + (t.karma || 0),
    0
  );

  if (totalKarmaInDivision === 0) {
    return {
      type: "all_zero",
      title: "CHASING YOU",
      statusMessage: "No team is chasing yet",
    };
  }

  // Find index of current team in same-type leaderboard
  const teamIdx = sameTypeLeaderboard.findIndex(
    (t) =>
      t.id === currentTeam.id ||
      (t.name && currentTeam.name && t.name.toLowerCase() === currentTeam.name.toLowerCase())
  );

  if (teamIdx === -1) {
    return {
      type: "none",
      title: "CHASING YOU",
      statusMessage: "Team not ranked",
    };
  }

  const currentKarma = sameTypeLeaderboard[teamIdx].karma || 0;
  const isFirst = teamIdx === 0;

  if (isFirst) {
    // Current team is #1 -> look at team below (#2)
    if (teamIdx >= sameTypeLeaderboard.length - 1) {
      return {
        type: "last",
        title: "CHASING YOU",
        statusMessage: "No team behind you yet",
      };
    }

    const rival = sameTypeLeaderboard[teamIdx + 1];
    const rivalKarma = rival.karma || 0;
    const rawGap = currentKarma - rivalKarma;
    const gap = Math.max(0, rawGap);
    const isTied = rawGap === 0 && currentKarma > 0;

    // Trend: compare rival's karma this week with last week
    const rivalPrev = (prevWeekLeaderboard || []).find(
      (t) => t.id === rival.id || (t.name && t.name.toLowerCase() === rival.name.toLowerCase())
    );
    const prevKarma = rivalPrev ? rivalPrev.karma || 0 : 0;
    const diff = rivalKarma - prevKarma;
    let trend = "flat";
    if (diff > 0) trend = "up";
    else if (diff < 0) trend = "down";

    // Threat label: CLOSING IN (<25%), WITHIN REACH (<60%), SAFE
    let threatLabel = "SAFE";
    if (isTied) {
      threatLabel = "TIED";
    } else if (currentKarma > 0 && gap < currentKarma * 0.25) {
      threatLabel = "CLOSING IN";
    } else if (currentKarma > 0 && gap < currentKarma * 0.6) {
      threatLabel = "WITHIN REACH";
    }

    return {
      type: "chasing",
      title: "CHASING YOU",
      rival,
      gap,
      isTied,
      threatLabel,
      gainedThisWeek: rivalKarma,
      trend,
      trendDiff: Math.abs(diff),
      pointsNeeded: gap + 1,
    };
  } else {
    // Current team is NOT #1 -> look at team above
    const rival = sameTypeLeaderboard[teamIdx - 1];
    const rivalKarma = rival.karma || 0;
    const rawGap = rivalKarma - currentKarma;
    const gap = Math.max(0, rawGap);
    const isTied = rawGap === 0 && currentKarma > 0;

    // Trend of rival
    const rivalPrev = (prevWeekLeaderboard || []).find(
      (t) => t.id === rival.id || (t.name && t.name.toLowerCase() === rival.name.toLowerCase())
    );
    const prevKarma = rivalPrev ? rivalPrev.karma || 0 : 0;
    const diff = rivalKarma - prevKarma;
    let trend = "flat";
    if (diff > 0) trend = "up";
    else if (diff < 0) trend = "down";

    let threatLabel = "CHALLENGE";
    if (isTied) {
      threatLabel = "TIED";
    } else if (rivalKarma > 0 && gap < rivalKarma * 0.25) {
      threatLabel = "WITHIN REACH";
    } else if (rivalKarma > 0 && gap < rivalKarma * 0.6) {
      threatLabel = "IN SIGHT";
    }

    return {
      type: "target",
      title: "NEXT TARGET",
      rival,
      gap,
      isTied,
      threatLabel,
      gainedThisWeek: rivalKarma,
      trend,
      trendDiff: Math.abs(diff),
      pointsNeeded: gap + 1,
    };
  }
}

