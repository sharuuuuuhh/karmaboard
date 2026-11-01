/**
 * Monthly Prediction Poll Utilities for Karmayodha
 *
 * Rules:
 * - One poll per calendar month in Asia/Kolkata (IST).
 * - Voting opens on the 1st of the month at 00:00:00 IST.
 * - Voting locks at the end of the 3rd day (23:59:59.999 IST).
 * - One vote per member (keyed by member_id or muid).
 * - When month ends, poll is resolved with the winning group.
 * - Prediction accuracy: (correctVotes / totalVotes).
 * - "Oracle" badge: Awarded to members who predicted correctly 3 times in a row.
 */

import { getISTDate, getMonthBoundaries } from "./dateUtils";

/**
 * Checks whether voting is currently open or locked for a monthly poll.
 */
export function getPollTiming(monthOffset = 0, now = new Date()) {
  const { start, end, label, key } = getMonthBoundaries(monthOffset, now);
  const istStart = getISTDate(start);

  // Voting lock time: 3rd of the month at 23:59:59.999 IST
  const lockISTMs = Date.UTC(
    istStart.getUTCFullYear(),
    istStart.getUTCMonth(),
    3,
    23,
    59,
    59,
    999
  );
  // Shift from IST back to UTC
  const lockTimeUtc = new Date(lockISTMs - 5.5 * 60 * 60 * 1000);

  const isBeforeOpen = now.getTime() < start.getTime();
  const isLocked = now.getTime() > lockTimeUtc.getTime();
  const isMonthEnded = now.getTime() > end.getTime();
  const isOpen = !isBeforeOpen && !isLocked;

  // Countdown until lock
  let countdownText = "Voting closed";
  if (isOpen) {
    const diffMs = lockTimeUtc.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (3600 * 1000));
    const diffMin = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
    if (diffHours > 24) {
      const days = Math.floor(diffHours / 24);
      countdownText = `Locks in ${days}d ${diffHours % 24}h`;
    } else {
      countdownText = `Locks in ${diffHours}h ${diffMin}m`;
    }
  }

  return {
    monthKey: key,
    monthLabel: label,
    isOpen,
    isLocked,
    isMonthEnded,
    lockTime: lockTimeUtc,
    countdownText,
  };
}

/**
 * Tabulates vote results for a poll
 */
export function tabulatePollVotes(votes = [], groups = []) {
  const voteCounts = {};
  groups.forEach((g) => {
    voteCounts[g.id] = 0;
  });

  const totalVotes = votes.length;
  votes.forEach((v) => {
    if (voteCounts[v.group_id] !== undefined) {
      voteCounts[v.group_id]++;
    }
  });

  const breakdown = groups.map((g) => {
    const count = voteCounts[g.id] || 0;
    const share = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
    return {
      groupId: g.id,
      groupName: g.name,
      groupColor: g.color,
      count,
      share,
    };
  });

  breakdown.sort((a, b) => b.count - a.count);

  return {
    totalVotes,
    breakdown,
  };
}

/**
 * Resolves a past poll given the winning group ID
 */
export function resolvePoll(votes = [], winningGroupId, groups = []) {
  const { totalVotes, breakdown } = tabulatePollVotes(votes, groups);
  const correctVotes = votes.filter((v) => v.group_id === winningGroupId).length;
  const accuracyPercent = totalVotes > 0 ? Math.round((correctVotes / totalVotes) * 100) : 0;
  const winnerGroup = groups.find((g) => g.id === winningGroupId) || null;

  return {
    winningGroupId,
    winnerGroup,
    totalVotes,
    correctVotes,
    accuracyPercent,
    breakdown,
  };
}

/**
 * Calculates member prediction stats and Oracle badge eligibility
 */
export function calculateMemberPollStats(memberId, pastResolvedPolls = []) {
  let totalVoted = 0;
  let totalCorrect = 0;
  let consecutiveCorrect = 0;
  let isOracle = false;

  // Chronological ascending
  const sorted = [...pastResolvedPolls].sort((a, b) => (a.monthKey > b.monthKey ? 1 : -1));

  sorted.forEach((poll) => {
    const myVote = (poll.votes || []).find((v) => v.member_id === memberId);
    if (myVote) {
      totalVoted++;
      if (myVote.group_id === poll.winningGroupId) {
        totalCorrect++;
        consecutiveCorrect++;
        if (consecutiveCorrect >= 3) {
          isOracle = true;
        }
      } else {
        consecutiveCorrect = 0;
      }
    }
  });

  return {
    totalVoted,
    totalCorrect,
    accuracyPercent: totalVoted > 0 ? Math.round((totalCorrect / totalVoted) * 100) : 0,
    isOracle,
    consecutiveCorrect,
  };
}

