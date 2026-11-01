import {
  calculateMedian,
  getSleepingGiants,
  getChasingOrTargetTeam,
} from "../teamPageHelpers";

describe("teamPageHelpers", () => {
  describe("calculateMedian", () => {
    test("calculates median of odd and even length arrays", () => {
      expect(calculateMedian([10, 20, 30])).toBe(20);
      expect(calculateMedian([30, 10, 20])).toBe(20);
      expect(calculateMedian([10, 20, 30, 40])).toBe(25);
      expect(calculateMedian([])).toBe(0);
      expect(calculateMedian([50])).toBe(50);
    });
  });

  describe("getChasingOrTargetTeam", () => {
    const mockLeaderboard = [
      { id: "grp-leads", name: "LEADS", karma: 1000 },
      { id: "grp-tech", name: "TECH", karma: 800 },
      { id: "grp-marketing", name: "MARKETING", karma: 500 },
      { id: "grp-operation", name: "OPERATION", karma: 200 },
    ];

    const prevLeaderboard = [
      { id: "grp-leads", name: "LEADS", karma: 600 },
      { id: "grp-tech", name: "TECH", karma: 700 }, // gained 100
      { id: "grp-marketing", name: "MARKETING", karma: 600 }, // lost 100
    ];

    test("Rank #1 team shows CHASING YOU with team ranked #2", () => {
      const res = getChasingOrTargetTeam({
        currentTeam: mockLeaderboard[0],
        leaderboard: mockLeaderboard,
        prevWeekLeaderboard: prevLeaderboard,
      });

      expect(res.title).toBe("CHASING YOU");
      expect(res.rival.name).toBe("TECH");
      expect(res.gap).toBe(200);
      expect(res.gainedThisWeek).toBe(800);
      expect(res.pointsNeeded).toBe(201);
      // gap (200) < 1000 * 0.25 (250) -> CLOSING IN
      expect(res.threatLabel).toBe("CLOSING IN");
      expect(res.trend).toBe("up");
    });

    test("Non-#1 team shows NEXT TARGET with team ranked directly above", () => {
      const res = getChasingOrTargetTeam({
        currentTeam: mockLeaderboard[1], // TECH (800)
        leaderboard: mockLeaderboard,
        prevWeekLeaderboard: prevLeaderboard,
      });

      expect(res.title).toBe("NEXT TARGET");
      expect(res.rival.name).toBe("LEADS");
      expect(res.gap).toBe(200); // 1000 - 800
      expect(res.threatLabel).toBe("WITHIN REACH");
    });

    test("Edge case: all teams at 0 karma shows No team is chasing yet", () => {
      const allZeroLb = [
        { id: "grp-leads", name: "LEADS", karma: 0 },
        { id: "grp-tech", name: "TECH", karma: 0 },
      ];
      const res = getChasingOrTargetTeam({
        currentTeam: allZeroLb[0],
        leaderboard: allZeroLb,
      });

      expect(res.type).toBe("all_zero");
      expect(res.statusMessage).toBe("No team is chasing yet");
    });

    test("Edge case: last place team in division shows No team behind you yet", () => {
      const res = getChasingOrTargetTeam({
        currentTeam: mockLeaderboard[3], // OPERATION (rank #4)
        leaderboard: mockLeaderboard,
      });

      // For non-#1 team, it targets team above (#3 MARKETING)
      expect(res.title).toBe("NEXT TARGET");
      expect(res.rival.name).toBe("MARKETING");
    });

    test("Tied teams show TIED threat label", () => {
      const tiedLb = [
        { id: "grp-leads", name: "LEADS", karma: 800 },
        { id: "grp-tech", name: "TECH", karma: 800 },
      ];
      const res = getChasingOrTargetTeam({
        currentTeam: tiedLb[0],
        leaderboard: tiedLb,
      });

      expect(res.isTied).toBe(true);
      expect(res.threatLabel).toBe("TIED");
      expect(res.gap).toBe(0);
    });
  });

  describe("getSleepingGiants", () => {
    const mockMembers = [
      { id: "m1", name: "Alice", muid: "alice@mulearn" },
      { id: "m2", name: "Bob", muid: "bob@mulearn" },
      { id: "m3", name: "Charlie", muid: "charlie@mulearn" },
      { id: "m4", name: "Dave", muid: "dave@mulearn" },
    ];

    test("identifies members with 0 karma this week whose past 4-week average >= team median", () => {
      const now = new Date();
      // Generate events across previous 4 weeks
      const karmaEvents = [
        // Alice: scored 400 in each of 4 past weeks, 0 this week (avg = 400)
        { member_id: "m1", delta: 400, timestamp: new Date(now.getTime() - 8 * 86400000).toISOString() },
        { member_id: "m1", delta: 400, timestamp: new Date(now.getTime() - 15 * 86400000).toISOString() },
        { member_id: "m1", delta: 400, timestamp: new Date(now.getTime() - 22 * 86400000).toISOString() },
        { member_id: "m1", delta: 400, timestamp: new Date(now.getTime() - 29 * 86400000).toISOString() },

        // Bob: scored 200 in past weeks, 0 this week (avg = 200)
        { member_id: "m2", delta: 200, timestamp: new Date(now.getTime() - 8 * 86400000).toISOString() },
        { member_id: "m2", delta: 200, timestamp: new Date(now.getTime() - 15 * 86400000).toISOString() },
        { member_id: "m2", delta: 200, timestamp: new Date(now.getTime() - 22 * 86400000).toISOString() },
        { member_id: "m2", delta: 200, timestamp: new Date(now.getTime() - 29 * 86400000).toISOString() },

        // Charlie: scored this week (should NOT be a sleeping giant)
        { member_id: "m3", delta: 500, timestamp: new Date(now.getTime()).toISOString() },
        { member_id: "m3", delta: 100, timestamp: new Date(now.getTime() - 29 * 86400000).toISOString() },

        // Dave: 0 karma ever (avg = 0, below median)
      ];

      const res = getSleepingGiants({
        members: mockMembers,
        karmaEvents,
        currentWeekOffset: 0,
      });

      expect(res.hasEnoughHistory).toBe(true);
      expect(res.giants.length).toBeGreaterThan(0);
      expect(res.giants[0].name).toBe("Alice");
      expect(res.giants[0].avg).toBe(400);
      expect(res.giants[0].currentKarma).toBe(0);
    });

    test("returns hasEnoughHistory: false when history is under 4 weeks", () => {
      const now = new Date();
      // Only 1 event 3 days ago (less than 4 weeks of history)
      const freshEvents = [
        { member_id: "m1", delta: 100, timestamp: new Date(now.getTime() - 3 * 86400000).toISOString() },
      ];

      const res = getSleepingGiants({
        members: mockMembers,
        karmaEvents: freshEvents,
        currentWeekOffset: 0,
      });

      expect(res.hasEnoughHistory).toBe(false);
      expect(res.giants).toEqual([]);
    });
  });
});

