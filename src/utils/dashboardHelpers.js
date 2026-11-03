import { getISTDate, getStartOfWeekIST } from "./dateUtils";

/**
 * Generates daily karma totals for Monday through Sunday in Asia/Kolkata.
 * Omits future days (or flags them so they aren't plotted past today).
 */
export function getDailyKarmaSeries(events = [], range = "week", baseDate = new Date()) {
  const istNow = getISTDate(baseDate);

  if (range === "month") {
    const year = istNow.getUTCFullYear();
    const month = istNow.getUTCMonth();
    const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();

    const buckets = [
      { name: "W1", label: "1-7", startDay: 1, endDay: 7 },
      { name: "W2", label: "8-14", startDay: 8, endDay: 14 },
      { name: "W3", label: "15-21", startDay: 15, endDay: 21 },
      { name: "W4", label: "22-28", startDay: 22, endDay: 28 },
    ];
    if (lastDay > 28) {
      buckets.push({
        name: "W5",
        label: `29-${lastDay}`,
        startDay: 29,
        endDay: lastDay,
      });
    }

    const currentIST = getISTDate(new Date());
    const isCurrentMonth =
      currentIST.getUTCFullYear() === year && currentIST.getUTCMonth() === month;
    const currentDayOfMonth = currentIST.getUTCDate();

    const monthSeries = buckets.map((b, idx) => {
      const isFuture = isCurrentMonth && b.startDay > currentDayOfMonth;
      return {
        name: b.name,
        idx,
        label: b.label,
        date: `${year}-${String(month + 1).padStart(2, "0")}-${String(b.startDay).padStart(2, "0")}`,
        karma: 0,
        isFuture,
        startDay: b.startDay,
        endDay: b.endDay,
      };
    });

    if (!events || events.length === 0) return monthSeries;

    events.forEach((ev) => {
      const ts = ev.timestamp || ev.created_at;
      if (!ts) return;
      const evIST = getISTDate(new Date(ts));
      if (evIST.getUTCFullYear() === year && evIST.getUTCMonth() === month) {
        const d = evIST.getUTCDate();
        const b = monthSeries.find((s) => d >= s.startDay && d <= s.endDay);
        if (b) {
          b.karma += Number(ev.delta || ev.karma_points || ev.points || 0);
        }
      }
    });

    return monthSeries;
  }

  if (range === "all") {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const allSeries = [];
    const baseYear = istNow.getUTCFullYear();
    const baseMonth = istNow.getUTCMonth();

    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(Date.UTC(baseYear, baseMonth - i, 1));
      const y = targetDate.getUTCFullYear();
      const m = targetDate.getUTCMonth();
      allSeries.push({
        name: monthNames[m],
        idx: 5 - i,
        year: y,
        month: m,
        date: `${y}-${String(m + 1).padStart(2, "0")}-01`,
        karma: 0,
        isFuture: false,
      });
    }

    if (!events || events.length === 0) return allSeries;

    events.forEach((ev) => {
      const ts = ev.timestamp || ev.created_at;
      if (!ts) return;
      const evIST = getISTDate(new Date(ts));
      const y = evIST.getUTCFullYear();
      const m = evIST.getUTCMonth();
      const match = allSeries.find((s) => s.year === y && s.month === m);
      if (match) {
        match.karma += Number(ev.delta || ev.karma_points || ev.points || 0);
      }
    });

    return allSeries;
  }

  // Week mode (default)
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
    if (matchingDay) {
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
