import { computeRankGap } from "../gapUtils";
import { calculateDailyStreak, calculateWeeklyStreak, getISTDayKey, diffDays } from "../streakUtils";
import { calculateIndividualUnderdog, calculateGroupUnderdog } from "../underdogUtils";
import { computeDefaultGroupTarget, computeGoalProgress } from "../goalUtils";
import { getPollTiming, tabulatePollVotes, resolvePoll, calculateMemberPollStats } from "../pollUtils";

describe("FEATURE 8: computeRankGap", () => {
  test("handles Rank 1 with lead over Rank 2", () => {
    const list = [
      { name: "Alice", karma: 1000, rank: 1 },
      { name: "Bob", karma: 880, rank: 2 },
    ];
    const gap = computeRankGap(0, list);
    expect(gap.isLeader).toBe(true);
    expect(gap.gapToBelow).toBe(120);
    expect(gap.text).toBe("You're #1, 120 ahead of #2");
  });

  test("handles Rank 1 tied with Rank 2", () => {
    const list = [
      { name: "Alice", karma: 1000, rank: 1 },
      { name: "Bob", karma: 1000, rank: 1 },
    ];
    const gap = computeRankGap(0, list);
    expect(gap.isLeader).toBe(true);
    expect(gap.gapToBelow).toBe(0);
    expect(gap.text).toContain("Tied at #1");
  });

  test("handles rank > 1 gap to rank above and below", () => {
    const list = [
      { name: "Alice", karma: 1000, rank: 1 },
      { name: "Bob", karma: 950, rank: 2 },
      { name: "Charlie", karma: 800, rank: 3 },
    ];
    const gap = computeRankGap(1, list); // Bob
    expect(gap.isLeader).toBe(false);
    expect(gap.gapToAbove).toBe(50);
    expect(gap.rankAbove).toBe(1);
    expect(gap.gapToBelow).toBe(150);
    expect(gap.text).toBe("50 karma behind #1");
    expect(gap.progress).toBeCloseTo(950 / 1000);
  });

  test("handles zero karma edge case", () => {
    const list = [
      { name: "Alice", karma: 500, rank: 1 },
      { name: "Bob", karma: 0, rank: 2 },
    ];
    const gap = computeRankGap(1, list);
    expect(gap.gapToAbove).toBe(500);
    expect(gap.progress).toBe(0);
  });
});

describe("FEATURE 9: Streak Tracker", () => {
  test("calculates active streak when user scored today", () => {
    const now = new Date("2026-10-31T12:00:00.000Z");
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    const events = [
      { delta: 50, timestamp: new Date(now.getTime() - 2 * ONE_DAY_MS).toISOString() },
      { delta: 50, timestamp: new Date(now.getTime() - 1 * ONE_DAY_MS).toISOString() },
      { delta: 50, timestamp: now.toISOString() }, // Scored today!
    ];

    const streak = calculateDailyStreak(events, now);
    expect(streak.currentStreak).toBe(3);
    expect(streak.hasScoredToday).toBe(true);
    expect(streak.isAtRisk).toBe(false);
  });

  test("calculates 'at risk' streak when user scored yesterday but not today", () => {
    const now = new Date("2026-10-31T12:00:00.000Z");
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    const events = [
      { delta: 50, timestamp: new Date(now.getTime() - 2 * ONE_DAY_MS).toISOString() },
      { delta: 50, timestamp: new Date(now.getTime() - 1 * ONE_DAY_MS).toISOString() }, // Yesterday
    ];

    const streak = calculateDailyStreak(events, now);
    expect(streak.currentStreak).toBe(2);
    expect(streak.hasScoredToday).toBe(false);
    expect(streak.isAtRisk).toBe(true);
    expect(streak.statusText).toBe("Streak ends tonight");
  });

  test("resets streak to 0 if gap is 2 or more days", () => {
    const now = new Date("2026-10-31T12:00:00.000Z");
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    const events = [
      { delta: 50, timestamp: new Date(now.getTime() - 4 * ONE_DAY_MS).toISOString() },
      { delta: 50, timestamp: new Date(now.getTime() - 3 * ONE_DAY_MS).toISOString() },
    ];

    const streak = calculateDailyStreak(events, now);
    expect(streak.currentStreak).toBe(0);
    expect(streak.longestStreak).toBe(2);
  });
});

describe("FEATURE 10: Underdog Award", () => {
  test("identifies individual with biggest rank climb, minimum karma rule", () => {
    const list = [
      { id: "1", name: "Alice", rank: 1, previousRank: 2, karma: 500 }, // climbed 1
      { id: "2", name: "Bob", rank: 3, previousRank: 10, karma: 400 }, // climbed 7!
      { id: "3", name: "Charlie", rank: 4, previousRank: 20, karma: 0 }, // 0 karma does NOT qualify
      { id: "4", name: "Dave", rank: 5, previousRank: null, karma: 300 }, // new entry does NOT qualify
    ];

    const underdog = calculateIndividualUnderdog(list);
    expect(underdog).toBeDefined();
    expect(underdog.id).toBe("2");
    expect(underdog.placesClimbed).toBe(7);
  });

  test("tie-breaks individual underdog by karma earned", () => {
    const list = [
      { id: "1", name: "Alice", rank: 2, previousRank: 6, karma: 300 }, // climbed 4, 300 karma
      { id: "2", name: "Bob", rank: 3, previousRank: 7, karma: 450 }, // climbed 4, 450 karma -> winner!
    ];

    const underdog = calculateIndividualUnderdog(list);
    expect(underdog.id).toBe("2");
  });

  test("identifies group underdog by percentage growth", () => {
    const currentGroups = [
      { id: "g1", name: "Tech", karma: 1200 },
      { id: "g2", name: "Media", karma: 600 },
    ];
    const prevMap = new Map([
      ["g1", { id: "g1", karma: 1000 }], // 20% growth
      ["g2", { id: "g2", karma: 200 }],  // 200% growth -> winner!
    ]);

    const underdog = calculateGroupUnderdog(currentGroups, prevMap);
    expect(underdog).toBeDefined();
    expect(underdog.id).toBe("g2");
    expect(underdog.growthPercent).toBe(200);
  });
});

describe("FEATURE 11: Group Goal Target Calculation", () => {
  test("computes default goal as 4-week average * 1.1 rounded to nearest 10", () => {
    const history = [400, 450, 500, 450]; // avg = 450; 450 * 1.1 = 495 -> rounded to 500
    const target = computeDefaultGroupTarget(history);
    expect(target).toBe(500);
  });

  test("falls back to 400 for new group with empty history", () => {
    expect(computeDefaultGroupTarget([])).toBe(400);
  });

  test("calculates progress percentage and pace", () => {
    const progress = computeGoalProgress(350, 500);
    expect(progress.percent).toBe(70);
    expect(progress.isReached).toBe(false);
  });
});

describe("FEATURE 14: Monthly Prediction Polls", () => {
  test("voting locks after 3rd day of the month in IST", () => {
    // 4th of October 2026 00:00:00 UTC is 4th of October 05:30:00 IST -> Locked!
    const pastLockDate = new Date("2026-10-04T00:00:00.000Z");
    const timing = getPollTiming(0, pastLockDate);
    expect(timing.isLocked).toBe(true);
    expect(timing.isOpen).toBe(false);
  });

  test("voting is open on the 2nd day of the month in IST", () => {
    const openDate = new Date("2026-10-02T10:00:00.000Z");
    const timing = getPollTiming(0, openDate);
    expect(timing.isOpen).toBe(true);
    expect(timing.isLocked).toBe(false);
  });

  test("tabulates and resolves votes accurately", () => {
    const groups = [
      { id: "g1", name: "Group 1", color: "#000" },
      { id: "g2", name: "Group 2", color: "#111" },
    ];
    const votes = [
      { member_id: "m1", group_id: "g1" },
      { member_id: "m2", group_id: "g1" },
      { member_id: "m3", group_id: "g2" },
    ];

    const resolved = resolvePoll(votes, "g1", groups);
    expect(resolved.totalVotes).toBe(3);
    expect(resolved.correctVotes).toBe(2);
    expect(resolved.accuracyPercent).toBe(67);
  });

  test("awards Oracle badge to members with 3 consecutive correct predictions", () => {
    const pastPolls = [
      { monthKey: "2026-07", winningGroupId: "g1", votes: [{ member_id: "m1", group_id: "g1" }] },
      { monthKey: "2026-08", winningGroupId: "g2", votes: [{ member_id: "m1", group_id: "g2" }] },
      { monthKey: "2026-09", winningGroupId: "g1", votes: [{ member_id: "m1", group_id: "g1" }] },
    ];

    const stats = calculateMemberPollStats("m1", pastPolls);
    expect(stats.totalCorrect).toBe(3);
    expect(stats.isOracle).toBe(true);
  });
});

