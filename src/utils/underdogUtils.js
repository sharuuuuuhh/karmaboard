/**
 * Underdog Award Calculation Utility for Karmayodha
 * Identifies the "most improved" individual and group for a season.
 *
 * Rules:
 * - Individuals:
 *   Biggest rank climb compared to previous period (previousRank - currentRank > 0).
 *   Tie-break: higher karma earned this period.
 *   Qualification: at least 1 karma earned this period and earlier history (previousRank != null).
 *
 * - Groups:
 *   Rule: Percentage growth in karma over the previous period.
 *   Growth formula: ((currentKarma - previousKarma) / Math.max(previousKarma, 1)) * 100.
 *   If previousKarma === 0 and currentKarma > 0, growth is treated as 100%.
 *   Tie-break: highest absolute karma earned this period.
 */

export function calculateIndividualUnderdog(rankedList = []) {
  const qualifiers = (rankedList || []).filter((item) => {
    const karma = typeof item.karma === "number" ? item.karma : 0;
    const currentRank = item.rank;
    const previousRank = item.previousRank;
    return karma > 0 && previousRank != null && previousRank > currentRank;
  });

  if (qualifiers.length === 0) {
    return null;
  }

  // Sort descending by rank climb (previousRank - currentRank), tie-break by karma
  qualifiers.sort((a, b) => {
    const climbA = a.previousRank - a.rank;
    const climbB = b.previousRank - b.rank;
    if (climbB !== climbA) return climbB - climbA;
    return (b.karma || 0) - (a.karma || 0);
  });

  const winner = qualifiers[0];
  const placesClimbed = winner.previousRank - winner.rank;

  return {
    ...winner,
    placesClimbed,
    deltaLabel: `+${placesClimbed} places`,
    description: `Climbed from #${winner.previousRank} to #${winner.rank}`,
  };
}

export function calculateGroupUnderdog(groupsCurrent = [], groupsPreviousMap = new Map()) {
  const candidates = [];

  (groupsCurrent || []).forEach((grp) => {
    const currentKarma = typeof grp.karma === "number" ? grp.karma : 0;
    const prevItem = groupsPreviousMap.get(grp.id);
    const previousKarma = prevItem && typeof prevItem.karma === "number" ? prevItem.karma : 0;

    if (currentKarma > 0) {
      let growthPercent = 0;
      if (previousKarma > 0) {
        growthPercent = Math.round(((currentKarma - previousKarma) / previousKarma) * 100);
      } else {
        growthPercent = 100;
      }

      if (growthPercent > 0) {
        candidates.push({
          ...grp,
          growthPercent,
          previousKarma,
          currentKarma,
        });
      }
    }
  });

  if (candidates.length === 0) {
    return null;
  }

  // Sort by growth percentage, tie-break by current karma
  candidates.sort((a, b) => {
    if (b.growthPercent !== a.growthPercent) return b.growthPercent - a.growthPercent;
    return b.currentKarma - a.currentKarma;
  });

  const winner = candidates[0];

  return {
    ...winner,
    deltaLabel: `+${winner.growthPercent}%`,
    description: `Grew karma by ${winner.growthPercent}% vs previous period`,
    ruleTooltip: "Group Underdog Rule: Highest percentage growth in karma over the previous period (tie-break by karma earned).",
  };
}

