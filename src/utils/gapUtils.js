/**
 * Gap to Next Rank Utility for Karmayodha
 * Computes the distance ahead or behind adjacent ranks in a leaderboard.
 *
 * Edge cases handled:
 * - Rank 1: No one above; computes distance ahead of Rank 2.
 * - Ties: Gap is 0; formats as "Tied at #X" or "Tied with #X".
 * - Zero karma: Progress is 0.
 * - Single item list.
 */

export function computeRankGap(currentIndex, rankedList = []) {
  if (!rankedList || rankedList.length === 0 || currentIndex < 0 || currentIndex >= rankedList.length) {
    return {
      rank: 1,
      isLeader: true,
      gapToAbove: 0,
      rankAbove: null,
      gapToBelow: 0,
      rankBelow: null,
      progress: 1,
      text: "Leading",
      compactText: "Leader",
    };
  }

  const currentItem = rankedList[currentIndex];
  const myKarma = typeof currentItem.karma === "number" ? currentItem.karma : 0;
  const currentRank = currentItem.rank || currentIndex + 1;

  // Rank 1 Leader Case
  if (currentIndex === 0 || currentRank === 1) {
    const nextItem = rankedList[1];
    if (!nextItem) {
      return {
        rank: 1,
        isLeader: true,
        gapToAbove: 0,
        rankAbove: null,
        gapToBelow: 0,
        rankBelow: null,
        progress: 1,
        text: "You're #1",
        compactText: "Leader",
      };
    }

    const nextKarma = typeof nextItem.karma === "number" ? nextItem.karma : 0;
    const leadGap = myKarma - nextKarma;
    const nextRank = nextItem.rank || 2;

    if (leadGap === 0) {
      return {
        rank: 1,
        isLeader: true,
        gapToAbove: 0,
        rankAbove: null,
        gapToBelow: 0,
        rankBelow: nextRank,
        progress: 1,
        text: `Tied at #1 with ${nextItem.name || "next competitor"}`,
        compactText: "Tied #1",
      };
    }

    return {
      rank: 1,
      isLeader: true,
      gapToAbove: 0,
      rankAbove: null,
      gapToBelow: leadGap,
      rankBelow: nextRank,
      progress: 1,
      text: `You're #1, ${leadGap.toLocaleString("en-IN")} ahead of #${nextRank}`,
      compactText: `+${leadGap.toLocaleString("en-IN")} ahead`,
    };
  }

  // Not Rank 1: Find item directly above (rank - 1)
  const itemAbove = rankedList[currentIndex - 1];
  const karmaAbove = typeof itemAbove.karma === "number" ? itemAbove.karma : 0;
  const rankAbove = itemAbove.rank || currentIndex;
  const gapToAbove = Math.max(0, karmaAbove - myKarma);

  // Progress toward next rank: my karma / target karma
  let progress = 0;
  if (karmaAbove > 0) {
    progress = Math.min(1, Math.max(0, myKarma / karmaAbove));
  } else if (myKarma === 0 && karmaAbove === 0) {
    progress = 1;
  }

  // Find item directly below
  const itemBelow = rankedList[currentIndex + 1];
  let gapToBelow = 0;
  let rankBelow = null;
  if (itemBelow) {
    const karmaBelow = typeof itemBelow.karma === "number" ? itemBelow.karma : 0;
    rankBelow = itemBelow.rank || currentIndex + 2;
    gapToBelow = Math.max(0, myKarma - karmaBelow);
  }

  if (gapToAbove === 0) {
    return {
      rank: currentRank,
      isLeader: false,
      gapToAbove: 0,
      rankAbove,
      gapToBelow,
      rankBelow,
      progress: 1,
      text: `Tied with #${rankAbove}`,
      compactText: `Tied #${rankAbove}`,
    };
  }

  return {
    rank: currentRank,
    isLeader: false,
    gapToAbove,
    rankAbove,
    gapToBelow,
    rankBelow,
    progress,
    text: `${gapToAbove.toLocaleString("en-IN")} karma behind #${rankAbove}`,
    compactText: `-${gapToAbove.toLocaleString("en-IN")} to #${rankAbove}`,
  };
}

