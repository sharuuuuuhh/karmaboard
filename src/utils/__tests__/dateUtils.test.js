import {
  getWeekBoundaries,
  getMonthBoundaries,
  getWeekCountdown,
  formatRelativeTime,
  getISTDate,
} from "../dateUtils";

describe("dateUtils - Asia/Kolkata Season Boundaries", () => {
  test("getISTDate shifts UTC correctly by +5:30", () => {
    // 2026-10-31 00:00:00 UTC -> 2026-10-31 05:30:00 IST
    const utcDate = new Date(Date.UTC(2026, 9, 31, 0, 0, 0));
    const ist = getISTDate(utcDate);
    expect(ist.getUTCHours() * 60 + ist.getUTCMinutes()).toBe(5 * 60 + 30);
  });

  test("getWeekBoundaries starts on Monday and ends on Sunday in IST", () => {
    // Wednesday 2026-10-28
    const midWeek = new Date("2026-10-28T10:00:00.000Z");
    const { start, end, label } = getWeekBoundaries(0, midWeek);

    const istStart = getISTDate(start);
    const istEnd = getISTDate(end);

    // Monday is day 1, Sunday is day 0
    expect(istStart.getUTCDay()).toBe(1);
    expect(istEnd.getUTCDay()).toBe(0);

    // Start is 00:00:00 IST, End is 23:59:59 IST
    expect(istStart.getUTCHours()).toBe(0);
    expect(istStart.getUTCMinutes()).toBe(0);
    expect(istEnd.getUTCHours()).toBe(23);
    expect(istEnd.getUTCMinutes()).toBe(59);

    expect(label).toContain("Week of");
  });

  test("getMonthBoundaries starts on 1st and ends on last day of month in IST", () => {
    const testDate = new Date("2026-10-15T12:00:00.000Z");
    const { start, end, label, key } = getMonthBoundaries(0, testDate);

    const istStart = getISTDate(start);
    const istEnd = getISTDate(end);

    expect(istStart.getUTCDate()).toBe(1);
    expect(istStart.getUTCMonth()).toBe(9); // October
    expect(istEnd.getUTCDate()).toBe(31);
    expect(label).toBe("October 2026");
    expect(key).toBe("2026-10");
  });

  test("getWeekCountdown formats countdown string correctly", () => {
    const now = new Date("2026-10-30T12:00:00.000Z");
    const end = new Date("2026-11-01T18:29:59.000Z");

    const countdown = getWeekCountdown(end, now);
    expect(countdown).toContain("Resets in 2d");
  });

  test("formatRelativeTime formats seconds, minutes, and hours", () => {
    const now = new Date();
    expect(formatRelativeTime(new Date(now.getTime() - 10 * 1000), now)).toBe("just now");
    expect(formatRelativeTime(new Date(now.getTime() - 5 * 60 * 1000), now)).toBe("5m ago");
    expect(formatRelativeTime(new Date(now.getTime() - 3 * 3600 * 1000), now)).toBe("3h ago");
    expect(formatRelativeTime(new Date(now.getTime() - 2 * 86400 * 1000), now)).toBe("2d ago");
  });
});
