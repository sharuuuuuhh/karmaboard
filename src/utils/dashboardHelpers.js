import { getISTDate, getStartOfWeekIST } from "./dateUtils";

/**
 * Generates daily karma totals for Monday through Sunday in Asia/Kolkata.
 * Omits future days (or flags them so they aren't plotted past today).
 */
export function getDailyKarmaSeries(events = [], range = "week", baseDate = new Date()) {
  const istNow = getISTDate(baseDate);
  const startOfWeek = getStartOfWeekIST(baseDate);
  const istStart = getISTDate(startOfWeek);

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const currentISTDayIndex = (istNow.getUTCDay() + 6) % 7; // 0 = Mon, 6 = Sun

  const days = dayNames.map((name, idx) => {
    const dayDate = new Date(istStart.getTime() + idx * 24 * 60 * 60 * 1000);
    const dateStr = dayDate.toISOString().split("T")[0];
    const isFuture = idx > currentISTDayIndex && range === "week";
    return {
      name,
      idx,
      date: dateStr,
      karma: 0,
      isFuture,
    };
  });

  if (!events || events.length === 0) {
    return days;
  }

  // Aggregate events matching each day
  events.forEach((ev) => {
    const ts = ev.timestamp || ev.created_at;
    if (!ts) return;
    const evIST = getISTDate(new Date(ts));
    const evDateStr = evIST.toISOString().split("T")[0];
    const pts = Number(ev.delta || ev.karma_points || ev.points || 0);

    const matchingDay = days.find((d) => d.date === evDateStr);
    if (matchingDay && !matchingDay.isFuture) {
      matchingDay.karma += pts;
    }
  });

  return days;
}

/**
 * Headline sentence generator based on top 2 groups' point spread.
 */
export function generateHeadlineSentence(groups = [], period = "week") {
  if (!groups || groups.length === 0) {
    return `Quiet ${period} so far. No karma logged yet.`;
  }

  const sorted = [...groups].sort((a, b) => (b.karma || 0) - (a.karma || 0));
  const first = sorted[0];
  const second = sorted[1];

  if (!first || !first.karma) {
    return `Quiet ${period} so far. No karma logged yet.`;
  }

  if (!second || !second.karma) {
    return `${first.name} leads with ${first.karma.toLocaleString()} karma this ${period}`;
  }

  const gap = (first.karma || 0) - (second.karma || 0);
  if (gap === 0) {
    return `${first.name} and ${second.name} tied at ${first.karma.toLocaleString()} this ${period}`;
  }

  return `${first.name} leads by ${gap.toLocaleString()} this ${period}`;
}

/**
 * Format rank label: "T-3" for ties, "#1" for standard rank.
 */
export function formatRankLabel(rank, isTie = false) {
  if (!rank || rank <= 0) return "-";
  return isTie ? `T-${rank}` : `#${rank}`;
}
