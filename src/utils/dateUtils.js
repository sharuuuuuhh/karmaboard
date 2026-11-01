/**
 * Date and Season Utilities for Karmayodha
 * Timezone: Asia/Kolkata (IST = UTC+5:30)
 *
 * Rules:
 * - Weekly season: Monday 00:00:00 to Sunday 23:59:59.999 IST
 * - Monthly season: 1st of month 00:00:00 to last day 23:59:59.999 IST
 */

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * Returns a Date object shifted into IST. Its getUTC* methods correspond
 * to the exact date, day, and time in Asia/Kolkata.
 */
export function getISTDate(baseDate = new Date()) {
  const epoch = new Date(baseDate).getTime();
  return new Date(epoch + IST_OFFSET_MS);
}

/**
 * Given any date/timestamp, returns the start of the week in Asia/Kolkata (Monday 00:00:00 IST).
 */
export function getStartOfWeekIST(date = new Date()) {
  const ist = getISTDate(date);
  const day = ist.getUTCDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  const diffToMonday = day === 0 ? 6 : day - 1;

  const istYear = ist.getUTCFullYear();
  const istMonth = ist.getUTCMonth();
  const istDate = ist.getUTCDate() - diffToMonday;

  // Midnight of that IST Monday
  const mondayISTMs = Date.UTC(istYear, istMonth, istDate, 0, 0, 0, 0);
  // Shift back from IST to true UTC timestamp
  return new Date(mondayISTMs - IST_OFFSET_MS);
}

/**
 * Returns boundaries of a weekly season in Asia/Kolkata.
 */
export function getWeekBoundaries(weekOffset = 0, baseDate = new Date()) {
  const currentWeekStart = getStartOfWeekIST(baseDate);
  const targetWeekStart = new Date(currentWeekStart.getTime() + weekOffset * 7 * 24 * 60 * 60 * 1000);
  const targetWeekEnd = new Date(targetWeekStart.getTime() + (7 * 24 * 60 * 60 * 1000) - 1);

  const startIST = getISTDate(targetWeekStart);
  const endIST = getISTDate(targetWeekEnd);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const startDay = startIST.getUTCDate();
  const startMonth = months[startIST.getUTCMonth()];
  const endDay = endIST.getUTCDate();
  const endMonth = months[endIST.getUTCMonth()];

  const label = startMonth === endMonth
    ? `Week of ${startDay} - ${endDay} ${startMonth}`
    : `Week of ${startDay} ${startMonth} - ${endDay} ${endMonth}`;

  const key = `${startIST.getUTCFullYear()}-W${getWeekNumber(startIST)}`;

  return {
    start: targetWeekStart,
    end: targetWeekEnd,
    label,
    key,
  };
}

export function getWeekNumber(istDate) {
  const target = new Date(istDate.valueOf());
  const dayNr = (istDate.getUTCDay() + 6) % 7;
  target.setUTCDate(target.getUTCDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setUTCMonth(0, 1);
  if (target.getUTCDay() !== 4) {
    target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - target) / 604800000);
}

export function getMonthBoundaries(monthOffset = 0, baseDate = new Date()) {
  const ist = getISTDate(baseDate);
  const year = ist.getUTCFullYear();
  const month = ist.getUTCMonth() + monthOffset;

  // 1st of month 00:00:00 IST
  const startISTMs = Date.UTC(year, month, 1, 0, 0, 0, 0);
  // Last day of month 23:59:59.999 IST
  const endISTMs = Date.UTC(year, month + 1, 0, 23, 59, 59, 999);

  const startUtc = new Date(startISTMs - IST_OFFSET_MS);
  const endUtc = new Date(endISTMs - IST_OFFSET_MS);

  const startIST = getISTDate(startUtc);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const targetYear = startIST.getUTCFullYear();
  const targetMonthIndex = startIST.getUTCMonth();
  const label = `${monthNames[targetMonthIndex]} ${targetYear}`;
  const key = `${targetYear}-${String(targetMonthIndex + 1).padStart(2, "0")}`;

  return {
    start: startUtc,
    end: endUtc,
    label,
    key,
  };
}

export function getWeekCountdown(weekEnd, now = new Date()) {
  const diffMs = weekEnd.getTime() - now.getTime();
  if (diffMs <= 0) {
    return "Season ended";
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffHours / 24);
  const hours = diffHours % 24;

  if (days > 0) {
    return `Resets in ${days}d ${hours}h`;
  }
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `Resets in ${hours}h ${minutes}m`;
}

export function formatRelativeTime(timestamp, now = new Date()) {
  if (!timestamp) return "just now";
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return "just now";

  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 45) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks}w ago`;
}
