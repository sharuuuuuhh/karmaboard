import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  Swords,
  Award,
  ArrowUpDown,
  Clock,
} from "lucide-react";
import PageHeader from "../components/shell/PageHeader";
import PageGrid, { PageCol } from "../components/common/PageGrid";
import PeriodCalendarPopover from "../components/common/PeriodCalendarPopover";
import GroupCard from "../components/common/GroupCard";
import { karmaStore } from "../data/karmaStore";
import { getGroupToken, isOfficialTeam } from "../utils/groupTokens";
import { computeDefaultGroupTarget } from "../utils/goalUtils";
import {
  getWeekBoundaries,
  getMonthBoundaries,
  getISTDate,
} from "../utils/dateUtils";
import {
  getSharedPeriod,
  setSharedPeriod,
  subscribeSharedPeriod,
} from "../utils/periodState";
import Crest from "../crests";

export default function GroupsPage() {
  const [, setDataVersion] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialShared = getSharedPeriod();
  const paramPeriod = searchParams.get("period");
  const paramOffset = searchParams.get("offset");

  const initialPeriod =
    paramPeriod && paramPeriod !== "week"
      ? paramPeriod
      : initialShared.period && initialShared.period !== "week"
      ? initialShared.period
      : "month";

  const [period, setPeriod] = useState(initialPeriod);
  const [offset, setOffset] = useState(
    paramOffset !== null ? parseInt(paramOffset, 10) || 0 : initialShared.offset || 0
  );
  const [filter, setFilter] = useState("all"); // 'all' | 'teams' | 'groups'
  const [sortBy, setSortBy] = useState("rank"); // 'rank' | 'name' | 'members'

  useEffect(() => {
    const unsub = karmaStore.subscribe(() => {
      setDataVersion((v) => v + 1);
    });
    return unsub;
  }, []);

  // Listen to shared period changes from other components (e.g. GroupDetailPage)
  useEffect(() => {
    const unsub = subscribeSharedPeriod(({ period: p, offset: o }) => {
      setPeriod(p);
      setOffset(o);
      setSearchParams({ period: p, offset: o });
    });
    return unsub;
  }, [setSearchParams]);

  // Keep search params in sync on mount if not already present
  useEffect(() => {
    if (!paramPeriod && !paramOffset) {
      setSearchParams({ period, offset }, { replace: true });
    }
  }, [paramPeriod, paramOffset, period, offset, setSearchParams]);

  // Update state if searchParams change externally (e.g. back/forward navigation)
  useEffect(() => {
    if (paramPeriod && paramPeriod !== period) {
      setPeriod(paramPeriod);
      setSharedPeriod(paramPeriod, undefined);
    }
    if (paramOffset !== null) {
      const parsed = parseInt(paramOffset, 10);
      if (!isNaN(parsed) && parsed !== offset) {
        setOffset(parsed);
        setSharedPeriod(undefined, parsed);
      }
    }
  }, [paramPeriod, paramOffset, period, offset]);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setOffset(0);
    setSharedPeriod(newPeriod, 0);
    setSearchParams({ period: newPeriod, offset: 0 });
  };

  const handleOffsetChange = (newOffset) => {
    setOffset(newOffset);
    setSharedPeriod(period, newOffset);
    setSearchParams({ period, offset: newOffset });
  };

  const handleDateSelect = (selectedDate) => {
    const now = new Date();
    const monthDiff =
      (selectedDate.getFullYear() - now.getFullYear()) * 12 +
      (selectedDate.getMonth() - now.getMonth());
    const newOffset = Math.min(0, monthDiff);
    setOffset(newOffset);
    setSharedPeriod(period, newOffset);
    setSearchParams({ period, offset: newOffset });
  };

  // Date and month display formatting
  const dateRangeInfo = useMemo(() => {
    if (period === "all") {
      return {
        label: "All Time",
        sublabel: "Overall campus score",
        cardLabel: "all time",
      };
    }
    if (period === "week") {
      const b = getWeekBoundaries(offset);
      const startIST = getISTDate(b.start);
      const year = startIST.getUTCFullYear();
      return {
        label: `${b.label} ${year}`,
        sublabel: b.label,
        cardLabel: `this week (${b.label})`,
      };
    }
    // Month
    const b = getMonthBoundaries(offset);
    return {
      label: b.monthName,
      fullLabel: b.label,
      sublabel: b.label,
      cardLabel: `in ${b.monthName}`,
    };
  }, [period, offset]);

  // Fetch groups with period and offset applied
  const groups = useMemo(() => {
    return karmaStore.getLeaderboard
      ? karmaStore.getLeaderboard({
          period,
          view: "groups",
          weekOffset: period === "week" ? offset : 0,
          monthOffset: period === "month" ? offset : 0,
        })
      : [];
  }, [period, offset]);

  // Attach overall campus rank before filtering/sorting
  const rankedGroups = useMemo(() => {
    return groups.map((g, idx) => ({
      ...g,
      overallRank: idx + 1,
    }));
  }, [groups]);

  // Official Teams (Fixed 7: leads, tech, creative, media, content, operation, marketing)
  const teamsList = useMemo(() => {
    return rankedGroups.filter((g) => isOfficialTeam(g));
  }, [rankedGroups]);

  // Campus Groups (All other groups present or added from now on)
  const groupsList = useMemo(() => {
    return rankedGroups.filter((g) => !isOfficialTeam(g));
  }, [rankedGroups]);

  // Displayed groups filtered and sorted
  const displayedGroups = useMemo(() => {
    let list = rankedGroups;
    if (filter === "teams") list = teamsList;
    else if (filter === "groups") list = groupsList;

    if (sortBy === "name") {
      return [...list].sort((a, b) => {
        const nameA = (a.name || a.id || "").toLowerCase();
        const nameB = (b.name || b.id || "").toLowerCase();
        return nameA.localeCompare(nameB);
      });
    }
    if (sortBy === "members") {
      return [...list].sort((a, b) => {
        const countA = a.member_count || a.members_count || 6;
        const countB = b.member_count || b.members_count || 6;
        return countB - countA;
      });
    }
    // Default: 'rank' (preserves karma ranking order)
    return list;
  }, [rankedGroups, filter, teamsList, groupsList, sortBy]);

  const filterOptions = [
    { id: "all", label: "All", count: rankedGroups.length },
    { id: "teams", label: "Teams", count: teamsList.length },
    { id: "groups", label: "Groups", count: groupsList.length },
  ];

  const subtitle = useMemo(() => {
    const periodText = dateRangeInfo.fullLabel || dateRangeInfo.label;
    if (filter === "teams") {
      return `Official campus skill teams (${teamsList.length}) • ${periodText}`;
    }
    if (filter === "groups") {
      return `Campus interest groups & skill guilds (${groupsList.length}) • ${periodText}`;
    }
    return `All ${rankedGroups.length} campus teams and groups • ${periodText}`;
  }, [filter, teamsList.length, groupsList.length, rankedGroups.length, dateRangeInfo.fullLabel, dateRangeInfo.label]);

  // Campus summary stats
  const totalCampusKarma = useMemo(() => {
    return groups.reduce((acc, g) => acc + (g.karma || 0), 0);
  }, [groups]);

  const totalWarriors = useMemo(() => {
    return groups.reduce((acc, g) => acc + (g.member_count || g.members_count || 6), 0);
  }, [groups]);

  // Closest race calculation
  const closestRace = useMemo(() => {
    if (groups.length < 2) return null;
    let minDiff = Infinity;
    let teamA = groups[0];
    let teamB = groups[1];

    for (let i = 0; i < groups.length - 1; i++) {
      const g1 = groups[i];
      const g2 = groups[i + 1];
      const diff = Math.abs((g1.karma || 0) - (g2.karma || 0));
      if (diff < minDiff && (g1.karma > 0 || g2.karma > 0)) {
        minDiff = diff;
        teamA = g1;
        teamB = g2;
      }
    }

    if (minDiff === Infinity) {
      teamA = groups[0];
      teamB = groups[1];
      minDiff = Math.abs((teamA.karma || 0) - (teamB.karma || 0));
    }

    return {
      teamA,
      teamB,
      gap: minDiff,
      tokenA: getGroupToken(teamA),
      tokenB: getGroupToken(teamB),
    };
  }, [groups]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <PageHeader
        title="Teams & Groups"
        subtitle={subtitle}
        centerActions={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <PeriodCalendarPopover
              period={period}
              offset={offset}
              dateLabel={dateRangeInfo.label}
              onPeriodChange={handlePeriodChange}
              onOffsetChange={handleOffsetChange}
              onDateSelect={handleDateSelect}
            />
          </div>
        }
      />

      {/* Category Filter & Sort Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {/* All / Teams / Groups Segmented Control */}
        <div
          role="tablist"
          aria-label="Filter teams and groups"
          style={{
            display: "inline-flex",
            alignItems: "center",
            background: "#FFFFFF",
            borderRadius: "var(--radius-pill)",
            padding: 4,
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-soft)",
            gap: 4,
          }}
        >
          {filterOptions.map((opt) => {
            const isActive = filter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setFilter(opt.id)}
                style={{
                  padding: "6px 16px",
                  borderRadius: "var(--radius-pill)",
                  fontSize: 13,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  background: isActive ? "var(--surface-subtle)" : "transparent",
                  boxShadow: isActive ? "0 1px 3px rgba(0, 0, 0, 0.06)" : "none",
                  border: isActive ? "1px solid var(--border-strong)" : "1px solid transparent",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                <span>{opt.label}</span>
                <span
                  className="tabular-nums"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: "var(--radius-pill)",
                    background: isActive ? "var(--text-primary)" : "rgba(0, 0, 0, 0.06)",
                    color: isActive ? "#FFFFFF" : "var(--text-secondary)",
                    lineHeight: 1.2,
                  }}
                >
                  {opt.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Sort by Dropdown */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 12.5,
            color: "var(--text-secondary)",
            fontWeight: 600,
          }}
        >
          <ArrowUpDown size={14} color="var(--text-muted)" />
          <span>Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: "6px 14px",
              borderRadius: "var(--radius-pill)",
              border: "1px solid var(--border)",
              background: "#FFFFFF",
              fontSize: 12.5,
              fontWeight: 600,
              color: "var(--text-primary)",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="rank">Rank (Highest Karma)</option>
            <option value="name">Name (A-Z)</option>
            <option value="members">Warriors Count</option>
          </select>
        </div>
      </div>

      <PageGrid gap={20}>
        {/* Left Column (Span 9): 7 Group Cards in 2 Rows (4 + 3) */}
        <PageCol col={12} colLg={9}>
          <div className="groups-cards-grid">
            {displayedGroups.length === 0 ? (
              <div
                style={{
                  gridColumn: "1 / -1",
                  padding: "48px 24px",
                  textAlign: "center",
                  background: "#FFFFFF",
                  borderRadius: "var(--radius-card)",
                  border: "1px solid var(--border)",
                  color: "var(--text-secondary)",
                }}
              >
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>
                  No campus groups found
                </div>
                <div style={{ fontSize: 13 }}>
                  All campus special interest groups and community clubs added to Karmayodha will appear here.
                </div>
              </div>
            ) : (
              displayedGroups.map((grp, idx) => {
                const memberCount = grp.member_count || grp.members_count || 6;
                const target = computeDefaultGroupTarget([], memberCount);

                return (
                  <motion.div
                    key={grp.id || grp.name || idx}
                    layout="position"
                    transition={{
                      layout: {
                        duration: 0.22,
                        ease: [0.16, 1, 0.3, 1],
                      },
                    }}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                      transition: "transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                    }}
                  >
                    <GroupCard
                      group={grp}
                      rank={grp.overallRank || idx + 1}
                      karma={grp.karma || 0}
                      memberCount={memberCount}
                      target={target}
                      variant="full"
                      period={period}
                      offset={offset}
                      style={{ height: "100%" }}
                    />
                  </motion.div>
                );
              })
            )}
          </div>
        </PageCol>

        {/* Right Summary Column (Span 3): Campus Totals, Closest Race, and Goal Progress List */}
        <PageCol col={12} colLg={3}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 16,
              position: "sticky",
              top: 24,
            }}
          >
            {/* 1. Campus Totals Card */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-card)",
                padding: "18px 20px",
                boxShadow: "var(--shadow-soft)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Subtle Japanese Scenery & Bow/Arrow Watermark */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  right: -15,
                  bottom: -10,
                  width: 175,
                  height: 100,
                  opacity: 0.10,
                  pointerEvents: "none",
                  zIndex: 0,
                }}
              >
                <img
                  src="/assets/art/japanese-scenery-weapons.webp"
                  alt=""
                  aria-hidden="true"
                  width={1376}
                  height={768}
                  loading="lazy"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                    objectPosition: "right bottom",
                    display: "block",
                  }}
                />
              </div>

              <div style={{ position: "relative", zIndex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                  <Sparkles size={16} color="var(--chart-line)" />
                  <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Campus Overview
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div style={{ background: "var(--surface-subtle)", padding: "12px", borderRadius: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>CAMPUS KARMA</div>
                    <div className="tabular-nums" style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginTop: 2 }}>
                      {totalCampusKarma.toLocaleString()}
                    </div>
                  </div>

                  <div style={{ background: "var(--surface-subtle)", padding: "12px", borderRadius: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>WARRIORS</div>
                    <div className="tabular-nums" style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", marginTop: 2 }}>
                      {totalWarriors}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Closest Race Card */}
            {closestRace && (
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-card)",
                  padding: "18px 20px",
                  boxShadow: "var(--shadow-soft)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Subtle Crossed Katanas Duel Watermark */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    right: -10,
                    bottom: -15,
                    width: 130,
                    height: 130,
                    opacity: 0.09,
                    pointerEvents: "none",
                    zIndex: 0,
                  }}
                >
                  <img
                    src="/assets/art/crossed-katanas.webp"
                    alt=""
                    aria-hidden="true"
                    width={1024}
                    height={1024}
                    loading="lazy"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "contain",
                      objectPosition: "right bottom",
                      display: "block",
                    }}
                  />
                </div>

                <div style={{ position: "relative", zIndex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                    <Swords size={16} color="#DC2626" />
                    <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Closest Race
                    </span>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      borderRadius: 12,
                      background: "var(--surface-subtle)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Crest group={closestRace.teamA} size="sm" />
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 800 }}>{closestRace.tokenA.name}</div>
                        <div className="tabular-nums" style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>
                          {(closestRace.teamA.karma || 0).toLocaleString()} pts
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: "center", padding: "0 6px" }}>
                      <span
                        style={{
                          fontSize: 10.5,
                          fontWeight: 800,
                          color: "#DC2626",
                          background: "#FEE2E2",
                          padding: "2px 6px",
                          borderRadius: 6,
                        }}
                      >
                        {closestRace.gap === 0 ? "TIED" : `Δ ${closestRace.gap}`}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexDirection: "row-reverse", textAlign: "right" }}>
                      <Crest group={closestRace.teamB} size="sm" />
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 800 }}>{closestRace.tokenB.name}</div>
                        <div className="tabular-nums" style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 600 }}>
                          {(closestRace.teamB.karma || 0).toLocaleString()} pts
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Goal Progress List (Retained with Work in Progress card) */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-card)",
                padding: "18px 20px",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              {/* Heading: Retained as Goal Pace */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <Award size={16} color="var(--chart-line)" />
                  <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    Goal Pace
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    fontFamily: "var(--font-numeric)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-pill)",
                    background: "var(--surface-subtle)",
                    color: "var(--muted)",
                    border: "1px solid var(--border)",
                  }}
                >
                  In Progress
                </span>
              </div>

              {/* Work in Progress Card */}
              <div
                style={{
                  background: "#FAF8F4",
                  border: "1px dashed var(--border)",
                  borderRadius: 14,
                  padding: "22px 16px",
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: "50%",
                    background: "#FFFFFF",
                    border: "1px solid var(--border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--gold)",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <Clock size={18} strokeWidth={2.2} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      fontFamily: "var(--font-display)",
                      color: "var(--ink)",
                      letterSpacing: "-0.01em",
                      marginBottom: 4,
                    }}
                  >
                    Work In Progress
                  </div>
                  <div
                    style={{
                      fontSize: 11.5,
                      fontWeight: 500,
                      fontFamily: "var(--font-body)",
                      color: "var(--muted)",
                      lineHeight: 1.45,
                      maxWidth: 220,
                    }}
                  >
                    Goal tracking and pace analytics are currently being calibrated for campus teams.
                  </div>
                </div>
              </div>

              {/* Preserved Goal List Data (retained for future activation) */}
              {/*
              <div style={{ display: "none", flexDirection: "column", gap: 10 }}>
                {displayedGroups.map((grp) => {
                  const token = getGroupToken(grp);
                  const memberCount = grp.member_count || grp.members_count || 6;
                  const target = computeDefaultGroupTarget([], memberCount);
                  const pct = Math.min(100, Math.round(((grp.karma || 0) / target) * 100));

                  return (
                    <div key={grp.id || grp.name}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3, fontSize: 11.5 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Crest group={grp} size="xs" />
                          <span style={{ fontWeight: 700, color: "var(--text-primary)" }}>{token.name}</span>
                        </div>
                        <span className="tabular-nums" style={{ fontWeight: 700, color: token.ink }}>
                          {pct}%
                        </span>
                      </div>
                      <div style={{ width: "100%", height: 5, borderRadius: 9999, background: "var(--surface-subtle)", overflow: "hidden" }}>
                        <div style={{ width: `${pct}%`, height: "100%", background: token.ink, borderRadius: 9999 }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              */}
            </div>
          </div>
        </PageCol>
      </PageGrid>
    </div>
  );
}
