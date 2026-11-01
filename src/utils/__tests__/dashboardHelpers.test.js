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
