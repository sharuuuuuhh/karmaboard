import {
  getDailyKarmaSeries,
  generateHeadlineSentence,
  formatRankLabel,
} from "../dashboardHelpers";

describe("dashboardHelpers", () => {
  describe("getDailyKarmaSeries", () => {
    it("generates 7 days (Mon-Sun) and sums karma for events", () => {
      // Mock base date: Wednesday Oct 28 2026
      const baseDate = new Date("2026-10-28T12:00:00Z");
      const mockEvents = [
        { timestamp: "2026-10-26T08:00:00Z", delta: 100 },
        { timestamp: "2026-10-26T14:00:00Z", delta: 200 },
        { timestamp: "2026-10-27T10:00:00Z", delta: 150 },
      ];

      const series = getDailyKarmaSeries(mockEvents, "week", baseDate);
      expect(series).toHaveLength(7);
      expect(series[0].name).toBe("Mon");
      expect(series[0].karma).toBe(300);
      expect(series[1].name).toBe("Tue");
      expect(series[1].karma).toBe(150);
    });

    it("marks days past current day index as isFuture in week mode", () => {
      const baseDate = new Date("2026-10-27T12:00:00Z"); // Tuesday
      const series = getDailyKarmaSeries([], "week", baseDate);
      expect(series[0].isFuture).toBe(false); // Mon
      expect(series[1].isFuture).toBe(false); // Tue
      expect(series[2].isFuture).toBe(true);  // Wed
      expect(series[6].isFuture).toBe(true);  // Sun
    });

    it("generates month series with weekly buckets in month mode", () => {
      const baseDate = new Date("2026-10-15T12:00:00Z");
      const mockEvents = [
        { timestamp: "2026-10-03T10:00:00Z", delta: 400 },
        { timestamp: "2026-10-25T14:00:00Z", delta: 600 },
      ];
      const series = getDailyKarmaSeries(mockEvents, "month", baseDate);
      expect(series).toHaveLength(5); // W1-W5 for October (31 days)
      expect(series[0].name).toBe("W1");
      expect(series[0].karma).toBe(400);
      expect(series[3].name).toBe("W4");
      expect(series[3].karma).toBe(600);
    });

    it("generates 6 month series in all mode", () => {
      const baseDate = new Date("2026-11-01T12:00:00Z");
      const mockEvents = [
        { timestamp: "2026-10-20T10:00:00Z", delta: 1200 },
      ];
      const series = getDailyKarmaSeries(mockEvents, "all", baseDate);
      expect(series).toHaveLength(6);
      const oct = series.find((s) => s.name === "Oct");
      expect(oct).toBeDefined();
      expect(oct.karma).toBe(1200);
    });
  });

  describe("generateHeadlineSentence", () => {
    it("returns quiet week sentence when list is empty or zero", () => {
      expect(generateHeadlineSentence([])).toBe("Quiet week so far. No karma logged yet.");
      expect(generateHeadlineSentence([{ name: "TECH", karma: 0 }])).toBe("Quiet week so far. No karma logged yet.");
    });

    it("returns lead gap sentence when leader has more karma", () => {
      const groups = [
        { name: "LEADS", karma: 800 },
        { name: "TECH", karma: 600 },
      ];
      expect(generateHeadlineSentence(groups, "week")).toBe("LEADS leads by 200 this week");
    });

    it("returns tied sentence when top two are equal", () => {
      const groups = [
        { name: "LEADS", karma: 500 },
        { name: "TECH", karma: 500 },
      ];
      expect(generateHeadlineSentence(groups, "week")).toBe("LEADS and TECH tied at 500 this week");
    });

    it("returns single leader sentence when only one group has karma", () => {
      const groups = [
        { name: "TECH", karma: 400 },
      ];
      expect(generateHeadlineSentence(groups, "week")).toBe("TECH leads with 400 karma this week");
    });
  });

  describe("formatRankLabel", () => {
    it("formats regular ranks and ties", () => {
      expect(formatRankLabel(1)).toBe("#1");
      expect(formatRankLabel(3, true)).toBe("T-3");
      expect(formatRankLabel(0)).toBe("-");
    });
  });
});
