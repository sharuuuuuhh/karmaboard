import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  Copy,
  Check,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import PageGrid, { PageCol } from "../components/common/PageGrid";
import TeamPageCard from "../components/common/TeamPageCard";
import { karmaStore } from "../data/karmaStore";
import { getGroupToken, isOfficialTeam } from "../utils/groupTokens";
import { computeDefaultGroupTarget } from "../utils/goalUtils";
import {
  getWeekBoundaries,
  getMonthBoundaries,
  getISTDate,
  getWeekCountdown,
} from "../utils/dateUtils";
import {
  getSharedPeriod,
  setSharedPeriod,
  subscribeSharedPeriod,
} from "../utils/periodState";
import { CREST_REGISTRY, normalizeGroupSlug, getGroupDisplayName } from "../crests";
import Crest from "../crests";
import PeriodCalendarPopover from "../components/common/PeriodCalendarPopover";
import { getChasingOrTargetTeam, getSleepingGiants } from "../utils/teamPageHelpers";

export default function GroupDetailPage() {
  const { id } = useParams();
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

  const [, setDataVersion] = useState(0);
  const [period, setPeriod] = useState(initialPeriod);
  const [offset, setOffset] = useState(
    paramOffset !== null ? parseInt(paramOffset, 10) || 0 : initialShared.offset || 0
  );
  const [memberSearch, setMemberSearch] = useState("");
  const [copiedKey, setCopiedKey] = useState(null);

  useEffect(() => {
    const unsub = karmaStore.subscribe(() => {
      setDataVersion((v) => v + 1);
    });
    return unsub;
  }, []);

  // Listen to shared period changes from other components (e.g. GroupsPage)
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

  const handleCopy = (text, key) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

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

  const group = karmaStore.getGroupById ? karmaStore.getGroupById(id) : null;
  const token = getGroupToken(group || id);
  const slug = normalizeGroupSlug(group || id);
  const displayName = getGroupDisplayName(slug) || token.name;
  const crestFiles = CREST_REGISTRY[slug];
  const isOfficial = isOfficialTeam(group || id);

  // Retrieve group detail for the chosen period
  const detail = useMemo(() => {
    if (!group || !karmaStore.getGroupDetail) return null;
    return (
      karmaStore.getGroupDetail(
        group.id,
        period,
        period === "week" ? offset : 0,
        period === "month" ? offset : 0
      ) || {
        group,
        rank: 1,
        totalKarma: 0,
        contributions: [],
        summaryLine: "",
        mvp: null,
        gap: null,
        goal: null,
      }
    );
  }, [group, period, offset]);

  // Overall campus group leaderboard to compute exact standings & gaps
  const campusGroupLeaderboard = useMemo(() => {
    if (!karmaStore.getLeaderboard) return [];
    return karmaStore.getLeaderboard({
      period,
      view: "groups",
      weekOffset: period === "week" ? offset : 0,
      monthOffset: period === "month" ? offset : 0,
    });
  }, [period, offset]);

  // Previous week leaderboard for trends
  const prevWeekLeaderboard = useMemo(() => {
    if (!karmaStore.getLeaderboard) return [];
    return karmaStore.getLeaderboard({
      period: "week",
      view: "groups",
      weekOffset: (period === "week" ? offset : 0) - 1,
    });
  }, [period, offset]);

  // Leaderboard filtered to same division (official teams vs community groups)
  const sameDivisionLeaderboard = useMemo(() => {
    const list = campusGroupLeaderboard.filter((t) => isOfficialTeam(t) === isOfficial);
    return list
      .map((t) => {
        if (t.id === group?.id && detail?.totalKarma !== undefined) {
          return { ...t, karma: detail.totalKarma };
        }
        if (karmaStore.getGroupDetail) {
          const d = karmaStore.getGroupDetail(
            t.id,
            period,
            period === "week" ? offset : 0,
            period === "month" ? offset : 0
          );
          if (d && d.totalKarma !== undefined) {
            return { ...t, karma: d.totalKarma };
          }
        }
        return t;
      })
      .sort((a, b) => (b.karma || 0) - (a.karma || 0));
  }, [campusGroupLeaderboard, isOfficial, group, detail, period, offset]);

  const sameTypeCount = sameDivisionLeaderboard.length || campusGroupLeaderboard.length || 7;
  const divisionIndex = sameDivisionLeaderboard.findIndex((g) => g.id === group?.id);
  const currentRank = divisionIndex !== -1 ? divisionIndex + 1 : (detail?.rank || 1);
  const currentKarma = detail?.totalKarma || 0;

  // Week boundaries & countdown
  const weekBoundaries = useMemo(() => getWeekBoundaries(period === "week" ? offset : 0), [period, offset]);
  const countdownText = useMemo(() => getWeekCountdown(weekBoundaries.end), [weekBoundaries]);

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

  // Chasing You / Next Target data
  const chasingData = useMemo(() => {
    return getChasingOrTargetTeam({
      currentTeam: {
        ...(group || {}),
        karma: currentKarma,
      },
      leaderboard: sameDivisionLeaderboard,
      prevWeekLeaderboard,
    });
  }, [group, currentKarma, sameDivisionLeaderboard, prevWeekLeaderboard]);

  // Sleeping Giants data
  const sleepingGiantsData = useMemo(() => {
    const allMembers = group && karmaStore.members ? karmaStore.members.filter((m) => m.group_id === group.id) : [];
    const events = karmaStore.karmaEvents || [];
    return getSleepingGiants({
      members: allMembers,
      karmaEvents: events,
      currentWeekOffset: period === "week" ? offset : 0,
    });
  }, [group, period, offset]);

  if (!group || !detail) {
    return (
      <div style={{ padding: "48px 0", textAlign: "center" }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)" }}>
          Team Not Found
        </h2>
        <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>
          The requested team does not exist.
        </p>
        <Link
          to={`/groups?period=${encodeURIComponent(period)}&offset=${encodeURIComponent(offset)}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 16,
            color: "var(--text-primary)",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to all teams</span>
        </Link>
      </div>
    );
  }

  const members = detail.contributions || [];
  const activeMembersCount = members.filter((m) => (m.karma || 0) > 0).length;
  const targetKarma = computeDefaultGroupTarget([], members.length || 6);
  const targetPercent = Math.min(100, Math.round((currentKarma / targetKarma) * 100));
  const rosterPct = members.length > 0 ? Math.round((activeMembersCount / members.length) * 100) : 0;

  const filteredMembers = members.filter((m) => {
    if (!memberSearch.trim()) return true;
    const q = memberSearch.toLowerCase();
    return (
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.muid && m.muid.toLowerCase().includes(q))
    );
  });

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // Nudge message text without emojis
  const handleCopyNudgeMessage = () => {
    const giantNames = sleepingGiantsData.giants.map((g) => g.name).join(", ");
    const text = `Hey team ${displayName}! ${giantNames} - we need your help this week! Log your contributions on Karmayodha and let's keep our rank.`;
    handleCopy(text, "nudge");
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        paddingBottom: 40,
      }}
    >
      <style>{`
        .team-stats-stack {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .team-hero-crest {
          height: 180px;
          width: auto;
          max-width: 180px;
          object-fit: contain;
          display: block;
          flex-shrink: 0;
        }
        .team-hero-card {
          padding: 28px 32px;
        }
        @media (max-width: 768px) {
          .team-hero-card {
            padding: 20px 18px !important;
          }
          .team-hero-crest {
            height: 110px !important;
            max-width: 110px !important;
            margin: 0 auto;
          }
          .team-stats-stack {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 10px !important;
          }
          .team-roster-table-scroll {
            max-height: none !important;
            overflow-y: visible !important;
          }
        }
      `}</style>

      {/* Top Bar: Back Link & Period Selector */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Link
          to={`/groups?period=${encodeURIComponent(period)}&offset=${encodeURIComponent(offset)}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 12,
            fontWeight: 700,
            color: "var(--text-secondary)",
            textDecoration: "none",
            fontFamily: "var(--font-display)",
            fontVariationSettings: "'wdth' 112",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
        >
          <ArrowLeft size={14} />
          <span>Back to all teams</span>
        </Link>

        <PeriodCalendarPopover
          period={period}
          offset={offset}
          dateLabel={dateRangeInfo.label}
          onPeriodChange={handlePeriodChange}
          onOffsetChange={handleOffsetChange}
          onDateSelect={handleDateSelect}
        />
      </div>

      {/* =========================================================================
          HERO BAND: Full width, solid team color, 180px crest, 56px team title, 92px karma
          ========================================================================= */}
      <TeamPageCard
        token={token}
        slug={slug}
        chamfer={18}
        bg={token.cardBg}
        className="team-hero-card"
        uniqueId="hero"
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 28,
          }}
        >
          {/* Left Side: Hero Crest (180px) + Meta Stack */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              flexWrap: "wrap",
              minWidth: 0,
            }}
          >
            {/* Crest at about 180px tall on the left, never cropped, drop-shadow */}
            {crestFiles ? (
              <img
                src={crestFiles["384"] || crestFiles["128"]}
                srcSet={`${crestFiles["128"]} 128w, ${crestFiles["384"]} 384w`}
                sizes="180px"
                alt={`${displayName} crest`}
                className="team-hero-crest"
                style={{
                  filter:
                    token.crestOutlineFilter ||
                    "drop-shadow(0 6px 10px rgba(0, 0, 0, 0.35))",
                }}
              />
            ) : (
              <svg
                viewBox="0 0 100 100"
                className="team-hero-crest"
                style={{
                  filter:
                    token.crestOutlineFilter ||
                    "drop-shadow(0 6px 10px rgba(0, 0, 0, 0.35))",
                }}
                fill="none"
              >
                <path
                  d="M50 8 L85 22 C85 62 50 90 50 90 C50 90 15 62 15 22 Z"
                  stroke={token.cardAccent || token.cardText}
                  strokeWidth="4"
                  strokeLinejoin="round"
                  fill="rgba(255, 255, 255, 0.08)"
                />
                <text
                  x="50"
                  y="56"
                  textAnchor="middle"
                  fill={token.cardText}
                  fontSize="14"
                  fontWeight="800"
                  fontFamily="var(--font-display)"
                  letterSpacing="0.08em"
                >
                  {displayName.slice(0, 6)}
                </text>
              </svg>
            )}

            {/* Beside it: department line, team name 56px, rank tag, descriptive name tag, motto tagline */}
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontVariationSettings: "'wdth' 112",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: token.cardText,
                  opacity: 0.85,
                  marginBottom: 4,
                }}
              >
                {token.discipline || "CAMPUS SKILL DIVISION"}
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <h1
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-display)",
                    fontVariationSettings: "'wdth' 125",
                    fontSize: "clamp(38px, 4.4vw, 56px)",
                    fontWeight: 800,
                    lineHeight: 1.02,
                    textTransform: "uppercase",
                    letterSpacing: "-0.01em",
                    color: token.cardText,
                  }}
                >
                  {displayName}
                </h1>

                {/* Outlined Rank Tag "RANK #1" */}
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontVariationSettings: "'wdth' 112",
                    fontSize: 12,
                    fontWeight: 700,
                    color: token.cardText,
                    border: `1px solid ${token.tagBorder || "rgba(255, 255, 255, 0.6)"}`,
                    padding: "3px 10px",
                    borderRadius: 4,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  RANK #{currentRank}
                </span>

                {/* Descriptive Name Tag */}
                {token.roleBadge && (
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontVariationSettings: "'wdth' 112",
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: token.cardAccent,
                      border: `1px solid ${token.cardAccent}66`,
                      background: `${token.cardAccent}18`,
                      padding: "3px 10px",
                      borderRadius: 4,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {token.roleBadge}
                  </span>
                )}
              </div>

              {/* Italic tagline as one line (replaces Crest Lore) */}
              <div
                style={{
                  marginTop: 8,
                  fontSize: 13.5,
                  fontStyle: "italic",
                  fontWeight: 500,
                  color: token.cardText,
                  opacity: 0.9,
                  lineHeight: 1.3,
                }}
              >
                "{token.motto}"
              </div>
            </div>
          </div>

          {/* Right Side: Karma number 88-96px + captions */}
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div
              className="tabular-nums"
              style={{
                fontFamily: "var(--font-display)",
                fontVariationSettings: "'wdth' 125",
                fontWeight: 800,
                fontSize: "clamp(68px, 6vw, 92px)",
                lineHeight: 0.92,
                letterSpacing: "-0.03em",
                color: token.cardText,
              }}
            >
              {currentKarma.toLocaleString()}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontVariationSettings: "'wdth' 112",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                color: token.cardText,
                opacity: 0.85,
                marginTop: 6,
              }}
            >
              {period === "month"
                ? "KARMA THIS MONTH"
                : period === "all"
                ? "TOTAL KARMA"
                : "KARMA THIS WEEK"}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontVariationSettings: "'wdth' 112",
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: token.cardAccent,
                marginTop: 3,
              }}
            >
              {activeMembersCount} OF {members.length} WARRIORS ACTIVE
            </div>
          </div>
        </div>
      </TeamPageCard>

      {/* =========================================================================
          BODY 12-COLUMN GRID:
          Left (span 3): 4 Stat Blocks in cardDeep
          Center (span 6): Team Roster in cardDeep
          Right (span 3): Team MVP, Chasing You / Next Target, Sleeping Giants
          ========================================================================= */}
      <PageGrid gap={20}>
        {/* =======================================================================
            LEFT COLUMN (Span 3): 4 Stat Blocks in cardDeep
            ======================================================================= */}
        <PageCol col={12} colLg={3}>
          <div className="team-stats-stack">
            {/* Stat 1: Campus Standing (no crown emoji, counts same-type teams) */}
            <TeamPageCard
              token={token}
              slug={slug}
              chamfer={14}
              bg={token.cardDeep}
              style={{ padding: "18px 20px" }}
              uniqueId="stat-standing"
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontVariationSettings: "'wdth' 112",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: token.cardText,
                  opacity: 0.8,
                  marginBottom: 8,
                }}
              >
                CAMPUS STANDING
              </div>
              <div
                className="tabular-nums"
                style={{
                  fontFamily: "var(--font-display)",
                  fontVariationSettings: "'wdth' 125",
                  fontSize: 40,
                  fontWeight: 800,
                  lineHeight: 1,
                  color: token.cardText,
                }}
              >
                #{currentRank}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: token.cardText,
                  opacity: 0.85,
                  marginTop: 6,
                }}
              >
                #{currentRank} of {sameTypeCount} {isOfficial ? "teams" : "groups"}
              </div>
            </TeamPageCard>

            {/* Stat 2: Lead Margin / Points to Bypass */}
            <TeamPageCard
              token={token}
              slug={slug}
              chamfer={14}
              bg={token.cardDeep}
              style={{ padding: "18px 20px" }}
              uniqueId="stat-margin"
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontVariationSettings: "'wdth' 112",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: token.cardText,
                  opacity: 0.8,
                  marginBottom: 8,
                }}
              >
                {currentRank === 1 ? "LEAD MARGIN" : "POINTS TO BYPASS"}
              </div>
              <div
                className="tabular-nums"
                style={{
                  fontFamily: "var(--font-display)",
                  fontVariationSettings: "'wdth' 125",
                  fontSize: 40,
                  fontWeight: 800,
                  lineHeight: 1,
                  color: token.cardAccent,
                }}
              >
                +{currentRank === 1
                  ? (chasingData.gap || 0).toLocaleString()
                  : (chasingData.pointsNeeded || 0).toLocaleString()}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: token.cardText,
                  opacity: 0.85,
                  marginTop: 6,
                }}
              >
                {currentRank === 1
                  ? `Ahead of ${chasingData.rival ? chasingData.rival.name : "runner-up"}`
                  : `Needed to overtake ${chasingData.rival ? chasingData.rival.name : "team ahead"}`}
              </div>
            </TeamPageCard>

            {/* Stat 3: Team Target Pace */}
            <TeamPageCard
              token={token}
              slug={slug}
              chamfer={14}
              bg={token.cardDeep}
              style={{ padding: "18px 20px" }}
              uniqueId="stat-pace"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontVariationSettings: "'wdth' 112",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: token.cardText,
                    opacity: 0.8,
                  }}
                >
                  TEAM TARGET PACE
                </span>
                <span
                  className="tabular-nums"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontVariationSettings: "'wdth' 112",
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: token.cardAccent,
                  }}
                >
                  {targetPercent}%
                </span>
              </div>
              <div
                className="tabular-nums"
                style={{
                  fontFamily: "var(--font-display)",
                  fontVariationSettings: "'wdth' 125",
                  fontSize: 40,
                  fontWeight: 800,
                  lineHeight: 1,
                  color: token.cardText,
                }}
              >
                {targetPercent}%
              </div>
              {/* 4px pace bar: track white at 20%, fill = accent */}
              <div
                style={{
                  width: "100%",
                  height: 4,
                  borderRadius: 2,
                  background: token.progressTrack || "rgba(255, 255, 255, 0.20)",
                  overflow: "hidden",
                  marginTop: 8,
                  marginBottom: 6,
                }}
              >
                <div
                  style={{
                    width: `${targetPercent}%`,
                    height: "100%",
                    borderRadius: 2,
                    background: token.cardAccent,
                    transition: "width 0.3s ease",
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: token.cardText,
                  opacity: 0.85,
                }}
              >
                {currentKarma.toLocaleString()} / {targetKarma.toLocaleString()} target
              </div>
            </TeamPageCard>

            {/* Stat 4: Roster Engagement */}
            <TeamPageCard
              token={token}
              slug={slug}
              chamfer={14}
              bg={token.cardDeep}
              style={{ padding: "18px 20px" }}
              uniqueId="stat-engagement"
            >
              <div
                style={{
                  fontFamily: "var(--font-display)",
                  fontVariationSettings: "'wdth' 112",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: token.cardText,
                  opacity: 0.8,
                  marginBottom: 8,
                }}
              >
                ROSTER ENGAGEMENT
              </div>
              <div
                className="tabular-nums"
                style={{
                  fontFamily: "var(--font-display)",
                  fontVariationSettings: "'wdth' 125",
                  fontSize: 40,
                  fontWeight: 800,
                  lineHeight: 1,
                  color: token.cardText,
                }}
              >
                {activeMembersCount} / {members.length}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: token.cardText,
                  opacity: 0.85,
                  marginTop: 6,
                }}
              >
                {rosterPct}% of warriors active this week
              </div>
            </TeamPageCard>
          </div>
        </PageCol>

        {/* =======================================================================
            CENTER COLUMN (Span 6): Team Roster Card in cardDeep
            ======================================================================= */}
        <PageCol col={12} colLg={6}>
          <TeamPageCard
            token={token}
            slug={slug}
            chamfer={14}
            bg={token.cardDeep}
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
            uniqueId="roster"
          >
            {/* Header & Search */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 22px",
                borderBottom: `1px solid ${token.cardLine}`,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-display)",
                    fontVariationSettings: "'wdth' 125",
                    fontSize: 18,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "-0.01em",
                    color: token.cardText,
                  }}
                >
                  TEAM ROSTER
                </h3>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontVariationSettings: "'wdth' 112",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: token.cardText,
                    opacity: 0.8,
                  }}
                >
                  {members.length} WARRIORS ENROLLED • {activeMembersCount} ACTIVE
                </span>
              </div>

              {/* Clean Dark Search Bar */}
              <div style={{ position: "relative", minWidth: 180 }}>
                <Search
                  size={13}
                  color={token.cardAccent}
                  style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  type="text"
                  placeholder="Search warrior..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 10px 6px 30px",
                    borderRadius: 4,
                    border: `1px solid ${token.cardLine}`,
                    background: "rgba(0, 0, 0, 0.25)",
                    color: token.cardText,
                    fontSize: 12,
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Thin Contribution Bar Under Header (segments in shades of accent) */}
            <div
              style={{
                width: "100%",
                height: 4,
                display: "flex",
                background: "rgba(0, 0, 0, 0.2)",
                overflow: "hidden",
              }}
              title="Contribution breakdown across team members"
            >
              {members.map((m, idx) => {
                const share = m.share || 0;
                if (share <= 0) return null;
                const opacities = [1, 0.85, 0.7, 0.55, 0.4, 0.3];
                const segOpacity = opacities[idx % opacities.length];
                return (
                  <div
                    key={m.id || idx}
                    style={{
                      width: `${share}%`,
                      height: "100%",
                      background: token.cardAccent,
                      opacity: segOpacity,
                    }}
                    title={`${m.name}: ${share}% (${(m.karma || 0).toLocaleString()} karma)`}
                  />
                );
              })}
            </div>

            {/* Scrollable Table Area */}
            <div
              className="custom-scrollbar team-roster-table-scroll"
              style={{
                flex: 1,
                maxHeight: 520,
                overflowY: "auto",
              }}
            >
              {filteredMembers.length === 0 ? (
                <div style={{ padding: "36px 20px", textAlign: "center", color: token.cardText, opacity: 0.75 }}>
                  No warriors matched "{memberSearch}".
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr
                      style={{
                        borderBottom: `1px solid ${token.cardLine}`,
                        fontSize: 11,
                        fontFamily: "var(--font-display)",
                        fontVariationSettings: "'wdth' 112",
                        textTransform: "uppercase",
                        letterSpacing: "0.15em",
                        color: token.cardText,
                        opacity: 0.75,
                        textAlign: "left",
                      }}
                    >
                      <th style={{ padding: "10px 16px", width: 50 }}>#</th>
                      <th style={{ padding: "10px 16px" }}>WARRIOR</th>
                      <th style={{ padding: "10px 16px", textAlign: "right" }}>KARMA</th>
                      <th style={{ padding: "10px 16px", textAlign: "center", width: 80 }}>SHARE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((mem, idx) => {
                      const isTopRank = idx === 0 && (mem.karma || 0) > 0;
                      const sharePct = mem.share || 0;
                      const isMVP = detail.mvp && detail.mvp.id === mem.id && (mem.karma || 0) > 0;

                      return (
                        <tr
                          key={mem.id || mem.muid || idx}
                          style={{
                            borderBottom: `1px solid ${token.cardLine}`,
                            transition: "background 0.15s ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          {/* Rank badge: Plain numeral with small accent bar for #1 */}
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              {isTopRank && (
                                <div
                                  style={{
                                    width: 3,
                                    height: 14,
                                    borderRadius: 1,
                                    background: token.cardAccent,
                                  }}
                                />
                              )}
                              <span
                                className="tabular-nums"
                                style={{
                                  fontFamily: "var(--font-display)",
                                  fontVariationSettings: "'wdth' 112",
                                  fontSize: 13,
                                  fontWeight: 800,
                                  color: isTopRank ? token.cardAccent : token.cardText,
                                }}
                              >
                                #{idx + 1}
                              </span>
                            </div>
                          </td>

                          {/* Warrior Avatar (Chamfered Square) & Name */}
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              {/* Square avatar with chamfered corner */}
                              <div
                                style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: 3,
                                  clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)",
                                  background: "rgba(0, 0, 0, 0.35)",
                                  border: `1px solid ${token.cardLine}`,
                                  color: token.cardText,
                                  fontSize: 12,
                                  fontWeight: 800,
                                  fontFamily: "var(--font-display)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                {getInitials(mem.name)}
                              </div>

                              <div style={{ minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                  <Link
                                    to={`/u/${mem.muid || mem.id}`}
                                    style={{
                                      fontSize: 13.5,
                                      fontWeight: 700,
                                      color: token.cardText,
                                      textDecoration: "none",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                    }}
                                  >
                                    {mem.name}
                                  </Link>

                                  {/* Outlined MVP Tag */}
                                  {isMVP && (
                                    <span
                                      style={{
                                        fontFamily: "var(--font-display)",
                                        fontVariationSettings: "'wdth' 112",
                                        fontSize: 9.5,
                                        fontWeight: 800,
                                        color: token.cardAccent,
                                        border: `1px solid ${token.cardAccent}`,
                                        padding: "1px 5px",
                                        borderRadius: 2,
                                        letterSpacing: "0.08em",
                                        textTransform: "uppercase",
                                      }}
                                    >
                                      MVP
                                    </span>
                                  )}
                                </div>
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: token.cardText,
                                    opacity: 0.65,
                                    fontFamily: "var(--font-display)",
                                    letterSpacing: "0.02em",
                                  }}
                                >
                                  {mem.muid || "mulearn"}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Karma Number */}
                          <td style={{ padding: "12px 16px", textAlign: "right" }}>
                            <span
                              className="tabular-nums"
                              style={{
                                fontFamily: "var(--font-display)",
                                fontVariationSettings: "'wdth' 125",
                                fontSize: 16,
                                fontWeight: 800,
                                color: token.cardText,
                              }}
                            >
                              {(mem.karma || 0).toLocaleString()}
                            </span>
                          </td>

                          {/* Share Percentage */}
                          <td style={{ padding: "12px 16px", textAlign: "center" }}>
                            <span
                              className="tabular-nums"
                              style={{
                                fontFamily: "var(--font-display)",
                                fontVariationSettings: "'wdth' 112",
                                fontSize: 12,
                                fontWeight: 700,
                                color: token.cardAccent,
                              }}
                            >
                              {sharePct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </TeamPageCard>
        </PageCol>

        {/* =======================================================================
            RIGHT COLUMN (Span 3): Team MVP, Chasing You / Next Target, Sleeping Giants
            ======================================================================= */}
        <PageCol col={12} colLg={3}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* 1. Team MVP Card */}
            <TeamPageCard
              token={token}
              slug={slug}
              chamfer={14}
              bg={token.cardDeep}
              style={{ padding: "18px 20px" }}
              uniqueId="mvp"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontVariationSettings: "'wdth' 112",
                    fontSize: 10.5,
                    fontWeight: 800,
                    color: token.cardAccent,
                    border: `1px solid ${token.cardAccent}88`,
                    padding: "2px 7px",
                    borderRadius: 3,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  TEAM MVP
                </span>
                <Crest group={group} size="xs" />
              </div>

              {detail.mvp && (detail.mvp.karma || 0) > 0 ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Square avatar with chamfered corner */}
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 3,
                        clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)",
                        background: "rgba(0, 0, 0, 0.35)",
                        border: `1px solid ${token.cardLine}`,
                        color: token.cardText,
                        fontSize: 13,
                        fontWeight: 800,
                        fontFamily: "var(--font-display)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(detail.mvp.name)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: token.cardText,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {detail.mvp.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: token.cardText,
                          opacity: 0.65,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {detail.mvp.muid}
                      </div>
                    </div>
                  </div>

                  <div
                    className="tabular-nums"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontVariationSettings: "'wdth' 125",
                      fontSize: 22,
                      fontWeight: 800,
                      color: token.cardAccent,
                      marginTop: 10,
                    }}
                  >
                    +{(detail.mvp.karma || 0).toLocaleString()} KARMA
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 13, color: token.cardText, opacity: 0.75, padding: "8px 0" }}>
                  No MVP yet
                </div>
              )}
            </TeamPageCard>

            {/* 2. CHASING YOU / NEXT TARGET Card */}
            <TeamPageCard
              token={token}
              slug={slug}
              chamfer={14}
              bg={token.cardDeep}
              style={{ padding: "18px 20px" }}
              uniqueId="chasing"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontVariationSettings: "'wdth' 112",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: token.cardText,
                  }}
                >
                  {chasingData.title}
                </span>

                {chasingData.threatLabel && (
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontVariationSettings: "'wdth' 112",
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color:
                        chasingData.threatLabel === "CLOSING IN" || chasingData.threatLabel === "WITHIN REACH"
                          ? token.cardAccent
                          : token.cardText,
                      border: `1px solid ${
                        chasingData.threatLabel === "CLOSING IN" || chasingData.threatLabel === "WITHIN REACH"
                          ? token.cardAccent
                          : token.cardLine
                      }`,
                      padding: "2px 7px",
                      borderRadius: 3,
                    }}
                  >
                    {chasingData.threatLabel}
                  </span>
                )}
              </div>

              {chasingData.rival ? (
                <>
                  {/* Rival Crest & Name Link */}
                  <Link
                    to={`/groups/${chasingData.rival.id || chasingData.rival.name}?period=${encodeURIComponent(period)}&offset=${encodeURIComponent(offset)}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      textDecoration: "none",
                      marginBottom: 12,
                    }}
                  >
                    <Crest group={chasingData.rival} size="sm" />
                    <div>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 800,
                          fontFamily: "var(--font-display)",
                          fontVariationSettings: "'wdth' 125",
                          textTransform: "uppercase",
                          color: token.cardText,
                        }}
                      >
                        {chasingData.rival.name}
                      </div>
                      <div
                        style={{
                          fontSize: 10.5,
                          fontFamily: "var(--font-display)",
                          fontVariationSettings: "'wdth' 112",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          color: token.cardAccent,
                        }}
                      >
                        VIEW TEAM →
                      </div>
                    </div>
                  </Link>

                  {/* 3 Metrics Rows */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      fontSize: 11.5,
                      borderTop: `1px solid ${token.cardLine}`,
                      paddingTop: 8,
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: token.cardText, opacity: 0.75 }}>
                        {currentRank === 1 ? "GAP BEHIND YOU" : "GAP TO CATCH"}
                      </span>
                      <span
                        className="tabular-nums"
                        style={{
                          fontFamily: "var(--font-display)",
                          fontVariationSettings: "'wdth' 112",
                          fontWeight: 800,
                          color: token.cardAccent,
                        }}
                      >
                        {chasingData.gap.toLocaleString()} PTS
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: token.cardText, opacity: 0.75 }}>GAINED THIS WEEK</span>
                      <span
                        className="tabular-nums"
                        style={{
                          fontFamily: "var(--font-display)",
                          fontVariationSettings: "'wdth' 112",
                          fontWeight: 700,
                          color: token.cardText,
                        }}
                      >
                        {(chasingData.gainedThisWeek || 0).toLocaleString()} PTS
                      </span>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: token.cardText, opacity: 0.75 }}>TREND</span>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 3,
                          fontFamily: "var(--font-display)",
                          fontVariationSettings: "'wdth' 112",
                          fontWeight: 700,
                          color:
                            chasingData.trend === "up"
                              ? token.cardAccent
                              : token.cardText,
                        }}
                      >
                        {chasingData.trend === "up" && <TrendingUp size={12} />}
                        {chasingData.trend === "down" && <TrendingDown size={12} />}
                        {chasingData.trend === "flat" && <Minus size={12} />}
                        <span>
                          {chasingData.trend === "up" ? `+${chasingData.trendDiff}` : chasingData.trend === "down" ? `-${chasingData.trendDiff}` : "0"}
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Reset & Points Needed Text */}
                  <div
                    style={{
                      fontSize: 11,
                      color: token.cardText,
                      opacity: 0.85,
                      lineHeight: 1.35,
                    }}
                  >
                    {countdownText}. {currentRank === 1
                      ? `They need ${chasingData.pointsNeeded} to pass you.`
                      : `You need ${chasingData.pointsNeeded} to pass them.`}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: 12.5, color: token.cardText, opacity: 0.75, padding: "8px 0" }}>
                  {chasingData.statusMessage || "No rival team ranked yet"}
                </div>
              )}
            </TeamPageCard>

            {/* 3. SLEEPING GIANTS Card */}
            <TeamPageCard
              token={token}
              slug={slug}
              chamfer={14}
              bg={token.cardDeep}
              style={{ padding: "18px 20px" }}
              uniqueId="giants"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontVariationSettings: "'wdth' 112",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: token.cardText,
                  }}
                >
                  SLEEPING GIANTS
                </span>

                {sleepingGiantsData.giants.length > 0 && (
                  <span
                    style={{
                      fontFamily: "var(--font-display)",
                      fontVariationSettings: "'wdth' 112",
                      fontSize: 9.5,
                      fontWeight: 800,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: token.cardAccent,
                    }}
                  >
                    {sleepingGiantsData.giants.length} READY TO RETURN
                  </span>
                )}
              </div>

              {!sleepingGiantsData.hasEnoughHistory ? (
                <div style={{ fontSize: 12, color: token.cardText, opacity: 0.75, padding: "8px 0" }}>
                  Not enough history yet
                </div>
              ) : sleepingGiantsData.giants.length === 0 ? (
                <div style={{ fontSize: 12, color: token.cardText, opacity: 0.75, padding: "8px 0" }}>
                  Everyone has scored this week
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
                    {sleepingGiantsData.giants.map((g) => (
                      <div
                        key={g.id || g.muid}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 0",
                          borderBottom: `1px solid ${token.cardLine}`,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                          {/* Chamfered square avatar */}
                          <div
                            style={{
                              width: 30,
                              height: 30,
                              borderRadius: 3,
                              clipPath: "polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)",
                              background: "rgba(0, 0, 0, 0.35)",
                              border: `1px solid ${token.cardLine}`,
                              color: token.cardText,
                              fontSize: 11,
                              fontWeight: 800,
                              fontFamily: "var(--font-display)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {getInitials(g.name)}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 700,
                                color: token.cardText,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                              }}
                            >
                              {g.name}
                            </div>
                            <div
                              style={{
                                fontSize: 10,
                                fontFamily: "var(--font-display)",
                                fontVariationSettings: "'wdth' 112",
                                color: token.cardText,
                                opacity: 0.65,
                                textTransform: "uppercase",
                                letterSpacing: "0.08em",
                              }}
                            >
                              LAST SCORED {g.daysAgo}D AGO
                            </div>
                          </div>
                        </div>

                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <span
                            className="tabular-nums"
                            style={{
                              fontFamily: "var(--font-display)",
                              fontVariationSettings: "'wdth' 112",
                              fontSize: 11,
                              fontWeight: 800,
                              color: token.cardAccent,
                            }}
                          >
                            AVG {g.avg} / WK
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Encouraging Plain-Text Copy Button (No emojis) */}
                  <button
                    type="button"
                    onClick={handleCopyNudgeMessage}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: 4,
                      background: "rgba(0, 0, 0, 0.25)",
                      border: `1px solid ${token.cardLine}`,
                      color: token.cardText,
                      fontFamily: "var(--font-display)",
                      fontVariationSettings: "'wdth' 112",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 6,
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = token.cardAccent;
                      e.currentTarget.style.color = token.cardAccent;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = token.cardLine;
                      e.currentTarget.style.color = token.cardText;
                    }}
                  >
                    {copiedKey === "nudge" ? (
                      <>
                        <Check size={12} color={token.cardAccent} />
                        <span style={{ color: token.cardAccent }}>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy Nudge Message</span>
                      </>
                    )}
                  </button>
                </>
              )}
            </TeamPageCard>
          </div>
        </PageCol>
      </PageGrid>
    </div>
  );
}
