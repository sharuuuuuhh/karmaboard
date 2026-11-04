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

// Per-team muted accent mapping (Tech gold, Marketing green, Operation indigo, Leads crimson, Creative navy, Media charcoal, Content sand, others neutral gray)
const TEAM_ACCENT_MAP = {
  tech: "#C9A227",
  marketing: "#2E7D52",
  operation: "#4A4AA8",
  operations: "#4A4AA8",
  leads: "#B3202A",
  creative: "#2B3A7A",
  media: "#3A3A40",
  content: "#B79B6A",
};

export function getTeamAccent(slugOrName) {
  if (!slugOrName) return "#6B6B72";
  const s = String(slugOrName).toLowerCase().replace(/^grp-/, "").trim();
  return TEAM_ACCENT_MAP[s] || "#6B6B72";
}

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
  const teamAccent = getTeamAccent(slug || displayName);

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
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--ink)" }}>
          Team Not Found
        </h2>
        <p style={{ color: "var(--muted)", marginTop: 8 }}>
          The requested team does not exist.
        </p>
        <Link
          to={`/groups?period=${encodeURIComponent(period)}&offset=${encodeURIComponent(offset)}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            marginTop: 16,
            color: "var(--ink)",
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

  const handleCopyNudgeMessage = () => {
    const giantNames = sleepingGiantsData.giants.map((g) => g.name).join(", ");
    const text = `Hey team ${displayName}! ${giantNames} - we need your help this week! Log your contributions on Karmayodha and let's keep our rank.`;
    handleCopy(text, "nudge");
  };

  // Shared card container styling
  const cardBoxStyle = {
    background: "#FFFFFF",
    border: "1px solid var(--border)",
    borderRadius: 20,
    boxShadow: "0 1px 2px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.05)",
    padding: 24,
    position: "relative",
    overflow: "hidden",
  };

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 20,
        paddingBottom: 40,
        position: "relative",
      }}
    >
      <style>{`
        /* Top Background Sumi-e Landscape Art Layer (Sun, Pagoda, Misty Hills) */
        .team-detail-art-layer {
          position: absolute;
          top: -24px;
          right: -24px;
          height: 180px;
          width: min(calc(100% + 48px), 1150px);
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
          mix-blend-mode: multiply;
          mask-image: linear-gradient(to bottom, #000 65%, transparent 100%), linear-gradient(to right, transparent 0%, #000 55%);
          -webkit-mask-image: linear-gradient(to bottom, #000 65%, transparent 100%), linear-gradient(to right, transparent 0%, #000 55%);
          mask-composite: intersect;
          -webkit-mask-composite: source-in;
        }

        /* Responsive 3-Column Grid */
        .team-detail-grid {
          display: grid;
          grid-template-columns: 280px minmax(0, 1fr) 280px;
          gap: 20px;
          align-items: start;
        }
        @media (min-width: 1440px) {
          .team-detail-grid {
            grid-template-columns: 300px minmax(0, 1fr) 300px;
          }
        }
        @media (max-width: 1279px) and (min-width: 1024px) {
          .team-detail-grid {
            grid-template-columns: minmax(0, 1fr) 280px;
          }
          .team-stats-stack {
            grid-column: 1 / -1;
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 14px !important;
          }
        }
        @media (max-width: 1023px) {
          .team-detail-grid {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .team-stats-stack {
            display: grid !important;
            grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
            gap: 14px !important;
          }
        }
        @media (max-width: 639px) {
          .team-hero-card {
            padding: 20px !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 20px !important;
          }
          .team-hero-right-zone {
            text-align: left !important;
            width: 100% !important;
            padding-top: 16px !important;
            border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
          }
          .team-stats-stack {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .team-roster-share-col {
            display: none !important;
          }
          .mobile-only-share {
            display: block !important;
          }
        }
      `}</style>

      {/* Top Background Sumi-e Landscape Banner (Anchored Top-Right) */}
      <div className="team-detail-art-layer" aria-hidden="true">
        <img
          src="/assets/art/header-banner.webp"
          alt=""
          aria-hidden="true"
          width={2400}
          height={466}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "right top",
            display: "block",
          }}
        />
      </div>

      {/* Top Bar: Back Link & Period Selector */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          position: "relative",
          zIndex: 2,
        }}
      >
        <Link
          to={`/groups?period=${encodeURIComponent(period)}&offset=${encodeURIComponent(offset)}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 11.5,
            fontWeight: 700,
            fontFamily: "var(--font-body)",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--muted)",
            textDecoration: "none",
            transition: "color 150ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
        >
          <ArrowLeft size={14} strokeWidth={2.2} />
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
          HERO BANNER: The ONLY dark card (var(--ink) with dark-card-art.webp anchored right)
          ========================================================================= */}
      <div
        className="team-hero-card"
        style={{
          position: "relative",
          background: "var(--ink)",
          borderRadius: 20,
          overflow: "hidden",
          padding: "28px 32px",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.08), 0 12px 32px rgba(0, 0, 0, 0.22)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 28,
        }}
      >
        {/* Dark Japanese Ink-Wash Mountains + Torii Art (anchored right at ~78% opacity) */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
            overflow: "hidden",
          }}
        >
          <img
            src="/assets/art/dark-card-art.webp"
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "right center",
              opacity: 0.78,
            }}
          />
          {/* Left-to-right dark gradient overlay so left stays pure black */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to right, #16161A 32%, rgba(22, 22, 26, 0.88) 58%, rgba(22, 22, 26, 0.35) 100%)",
            }}
          />
        </div>

        {/* Left Side: Hero Crest (130px) + Meta Stack */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 22,
            flexWrap: "wrap",
            minWidth: 0,
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Crest (never redrawn or recolored, drop shadow) */}
          {crestFiles ? (
            <img
              src={crestFiles["384"] || crestFiles["128"]}
              srcSet={`${crestFiles["128"]} 128w, ${crestFiles["384"]} 384w`}
              sizes="140px"
              alt={`${displayName} crest`}
              style={{
                height: 130,
                width: "auto",
                maxWidth: 140,
                objectFit: "contain",
                display: "block",
                flexShrink: 0,
                filter: "drop-shadow(0 8px 18px rgba(0, 0, 0, 0.45))",
              }}
            />
          ) : (
            <svg
              viewBox="0 0 100 100"
              style={{
                height: 120,
                width: "auto",
                maxWidth: 120,
                flexShrink: 0,
                filter: "drop-shadow(0 8px 18px rgba(0, 0, 0, 0.45))",
              }}
              fill="none"
            >
              <path
                d="M50 8 L85 22 C85 62 50 90 50 90 C50 90 15 62 15 22 Z"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="4"
                strokeLinejoin="round"
                fill="rgba(255, 255, 255, 0.08)"
              />
              <text
                x="50"
                y="56"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="14"
                fontWeight="800"
                fontFamily="var(--font-display)"
                letterSpacing="0.08em"
              >
                {displayName.slice(0, 6)}
              </text>
            </svg>
          )}

          {/* Department line, Team Name, Rank pill, Role badge, Motto */}
          <div style={{ minWidth: 0 }}>
            {token.discipline && (
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(255, 255, 255, 0.72)",
                  marginBottom: 4,
                }}
              >
                {token.discipline}
              </div>
            )}

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
                  fontSize: "clamp(34px, 4.2vw, 50px)",
                  fontWeight: 800,
                  lineHeight: 1.05,
                  textTransform: "uppercase",
                  letterSpacing: "-0.03em",
                  color: "#FFFFFF",
                }}
              >
                {displayName}
              </h1>

              {/* Outlined Rank Pill (outlined with --team-accent) */}
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: teamAccent,
                  border: `1px solid ${teamAccent}`,
                  padding: "3px 10px",
                  borderRadius: "var(--radius-pill)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                RANK #{currentRank}
              </span>

              {/* Subtle outlined pill with team subtitle / roleBadge */}
              {token.roleBadge && (
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.22)",
                    background: "rgba(255, 255, 255, 0.05)",
                    padding: "3px 10px",
                    borderRadius: "var(--radius-pill)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {token.roleBadge}
                </span>
              )}
            </div>

            {/* Italic motto (hidden if missing) */}
            {token.motto && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 13,
                  fontStyle: "italic",
                  fontWeight: 500,
                  fontFamily: "var(--font-body)",
                  color: "rgba(255, 255, 255, 0.72)",
                  lineHeight: 1.3,
                }}
              >
                "{token.motto}"
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Huge Karma number in Space Grotesk + Total Karma + Active Warriors */}
        <div className="team-hero-right-zone" style={{ textAlign: "right", flexShrink: 0, position: "relative", zIndex: 1 }}>
          <div
            className="tabular-nums"
            style={{
              fontFamily: "var(--font-numeric)",
              fontWeight: 800,
              fontSize: "clamp(52px, 5.5vw, 68px)",
              lineHeight: 0.95,
              letterSpacing: "-0.03em",
              color: "#FFFFFF",
            }}
          >
            {currentKarma.toLocaleString()}
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255, 255, 255, 0.6)",
              marginTop: 6,
            }}
          >
            TOTAL KARMA
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginTop: 4,
            }}
          >
            {activeMembersCount} OF {members.length} WARRIORS ACTIVE
          </div>
        </div>
      </div>

      {/* =========================================================================
          BODY 3-COLUMN GRID:
          Left (Span ~25%): 4 Stat Cards
          Center (Span ~50%): Team Roster Card
          Right (Span ~25%): Team MVP, Chasing You, Sleeping Giants
          ========================================================================= */}
      <div className="team-detail-grid">
        {/* =======================================================================
            LEFT COLUMN: 4 Stat Cards (Clean white, 20px radius, soft shadow)
            ======================================================================= */}
        <div className="team-stats-stack" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Stat 1: Campus Standing (with faint misty-mountain watermark at 5.5% opacity) */}
          <div style={{ ...cardBoxStyle, padding: "20px 22px" }}>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: 8,
              }}
            >
              CAMPUS STANDING
            </div>
            <div
              className="tabular-nums"
              style={{
                fontFamily: "var(--font-numeric)",
                fontSize: 38,
                fontWeight: 800,
                lineHeight: 1,
                color: "var(--ink)",
              }}
            >
              #{currentRank}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                fontFamily: "var(--font-body)",
                color: "var(--muted)",
                marginTop: 6,
              }}
            >
              #{currentRank} of {sameTypeCount} {isOfficial ? "teams" : "groups"}
            </div>

            {/* Faint misty-mountain watermark in bottom-right at 5.5% opacity */}
            <img
              src="/assets/art/empty-state.webp"
              alt=""
              aria-hidden="true"
              style={{
                position: "absolute",
                right: -10,
                bottom: -10,
                width: 130,
                height: 80,
                objectFit: "contain",
                opacity: 0.055,
                mixBlendMode: "multiply",
                pointerEvents: "none",
                userSelect: "none",
              }}
            />
          </div>

          {/* Stat 2: Lead Margin / Points to Bypass */}
          <div style={{ ...cardBoxStyle, padding: "20px 22px" }}>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: 8,
              }}
            >
              {currentRank === 1 ? "LEAD MARGIN" : "POINTS TO BYPASS"}
            </div>
            <div
              className="tabular-nums"
              style={{
                fontFamily: "var(--font-numeric)",
                fontSize: 38,
                fontWeight: 800,
                lineHeight: 1,
                color:
                  currentRank === 1
                    ? "var(--green)"
                    : chasingData.pointsNeeded > 0
                    ? "var(--crimson)"
                    : "var(--ink)",
              }}
            >
              {currentRank === 1
                ? `+${(chasingData.gap || 0).toLocaleString()}`
                : (chasingData.pointsNeeded || 0) === 0
                ? "0"
                : `-${(chasingData.pointsNeeded || 0).toLocaleString()}`}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                fontFamily: "var(--font-body)",
                color: "var(--muted)",
                marginTop: 6,
              }}
            >
              {currentRank === 1
                ? `Ahead of ${chasingData.rival ? chasingData.rival.name : "runner-up"}`
                : `Needed to overtake ${chasingData.rival ? chasingData.rival.name : "team ahead"}`}
            </div>
          </div>

          {/* Stat 3: Team Target Pace */}
          <div style={{ ...cardBoxStyle, padding: "20px 22px" }}>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: 8,
              }}
            >
              TEAM TARGET PACE
            </div>
            <div
              className="tabular-nums"
              style={{
                fontFamily: "var(--font-numeric)",
                fontSize: 38,
                fontWeight: 800,
                lineHeight: 1,
                color: "var(--ink)",
              }}
            >
              {targetPercent}%
            </div>
            {/* Rounded pace bar: track light gray, fill = --team-accent */}
            <div
              style={{
                width: "100%",
                height: 6,
                borderRadius: "var(--radius-pill)",
                background: "var(--surface-subtle)",
                overflow: "hidden",
                marginTop: 10,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  width: `${targetPercent}%`,
                  height: "100%",
                  borderRadius: "var(--radius-pill)",
                  background: teamAccent,
                  transition: "width 0.3s ease",
                }}
              />
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                fontFamily: "var(--font-body)",
                color: "var(--muted)",
              }}
            >
              {currentKarma.toLocaleString()} / {targetKarma.toLocaleString()} target
            </div>
          </div>

          {/* Stat 4: Roster Engagement */}
          <div style={{ ...cardBoxStyle, padding: "20px 22px" }}>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--muted)",
                marginBottom: 8,
              }}
            >
              ROSTER ENGAGEMENT
            </div>
            <div
              className="tabular-nums"
              style={{
                fontFamily: "var(--font-numeric)",
                fontSize: 38,
                fontWeight: 800,
                lineHeight: 1,
                color: "var(--ink)",
              }}
            >
              {activeMembersCount} / {members.length}
            </div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                fontFamily: "var(--font-body)",
                color: "var(--muted)",
                marginTop: 6,
              }}
            >
              {rosterPct}% of warriors active this week
            </div>
          </div>
        </div>

        {/* =======================================================================
            CENTER COLUMN: Team Roster Card
            ======================================================================= */}
        <div style={{ ...cardBoxStyle, padding: "24px 24px 16px 24px", display: "flex", flexDirection: "column" }}>
          {/* Header & Search */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <h3
                style={{
                  margin: 0,
                  fontFamily: "var(--font-display)",
                  fontSize: 18,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "-0.01em",
                  color: "var(--ink)",
                }}
              >
                TEAM ROSTER
              </h3>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 11.5,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                }}
              >
                {members.length} WARRIORS ENROLLED • {activeMembersCount} ACTIVE
              </span>
            </div>

            {/* Clean White Search Bar */}
            <div style={{ position: "relative", minWidth: 180, maxWidth: 220 }}>
              <Search
                size={14}
                color="var(--muted)"
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                placeholder="Search warrior..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "6px 12px 6px 34px",
                  borderRadius: "var(--radius-pill)",
                  border: "1px solid var(--border)",
                  background: "#FFFFFF",
                  fontSize: 12.5,
                  fontFamily: "var(--font-body)",
                  color: "var(--ink)",
                  outline: "none",
                  transition: "border-color 150ms ease",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--ink)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>
          </div>

          {/* Thin --team-accent Line Under Header */}
          <div
            style={{
              width: "100%",
              height: 2,
              background: teamAccent,
              marginTop: 14,
            }}
          />

          {/* Scrollable Table Area */}
          <div
            className="custom-scrollbar"
            style={{
              flex: 1,
              maxHeight: 540,
              overflowY: "auto",
              overflowX: "hidden",
            }}
          >
            {filteredMembers.length === 0 ? (
              <div style={{ padding: "36px 20px", textAlign: "center", color: "var(--muted)", fontSize: 13, fontFamily: "var(--font-body)" }}>
                No warriors matched "{memberSearch}".
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0, zIndex: 2, background: "#FFFFFF" }}>
                  <tr
                    style={{
                      height: 38,
                      borderBottom: "1px solid var(--border)",
                      fontSize: 11,
                      fontWeight: 600,
                      letterSpacing: "0.06em",
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      textAlign: "left",
                    }}
                  >
                    <th style={{ padding: "8px 14px", width: 44 }}>#</th>
                    <th style={{ padding: "8px 14px" }}>WARRIOR</th>
                    <th style={{ padding: "8px 14px", textAlign: "right" }}>KARMA</th>
                    <th className="team-roster-share-col" style={{ padding: "8px 14px", textAlign: "right", width: 70 }}>
                      SHARE
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((mem, idx) => {
                    const isTopRank = idx === 0 && (mem.karma || 0) > 0;
                    const sharePct = mem.share || 0;
                    const isMVP = detail.mvp && detail.mvp.id === mem.id && (mem.karma || 0) > 0;
                    const rankNum = idx + 1;
                    const rankColor =
                      rankNum === 1
                        ? "var(--gold)"
                        : rankNum === 2
                        ? "#6B6B72"
                        : rankNum === 3
                        ? "#B45309"
                        : "var(--muted)";

                    return (
                      <tr
                        key={mem.id || mem.muid || idx}
                        style={{
                          height: 54,
                          borderBottom: "1px solid var(--border)",
                          background: isTopRank ? "var(--gold-tint)" : "transparent",
                          borderLeft: isTopRank ? `3px solid ${teamAccent}` : "3px solid transparent",
                          transition: "background 150ms ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isTopRank) e.currentTarget.style.background = "#FAF8F4";
                        }}
                        onMouseLeave={(e) => {
                          if (!isTopRank) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        {/* Rank # (Gold #1, Silver #2, Bronze #3, Muted rest) */}
                        <td
                          className="tabular-nums"
                          style={{
                            padding: "10px 14px",
                            fontSize: 13,
                            fontWeight: 800,
                            fontFamily: "var(--font-numeric)",
                            color: rankColor,
                          }}
                        >
                          #{rankNum}
                        </td>

                        {/* Warrior Cell: Bold Name + Small Muted Email Handle (No dark avatar!) */}
                        <td style={{ padding: "10px 14px" }}>
                          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <Link
                                to={`/u/${encodeURIComponent(mem.muid || mem.id)}`}
                                style={{
                                  fontSize: 13.5,
                                  fontWeight: 700,
                                  fontFamily: "var(--font-body)",
                                  color: "var(--ink)",
                                  textDecoration: "none",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {mem.name}
                              </Link>
                              {isMVP && (
                                <span
                                  style={{
                                    fontSize: 9.5,
                                    fontWeight: 800,
                                    fontFamily: "var(--font-numeric)",
                                    color: "var(--gold)",
                                    background: "var(--gold-tint)",
                                    padding: "1px 5px",
                                    borderRadius: 3,
                                    letterSpacing: "0.06em",
                                  }}
                                >
                                  MVP
                                </span>
                              )}
                            </div>
                            <span
                              style={{
                                fontSize: 11.5,
                                fontFamily: "var(--font-body)",
                                color: "var(--muted)",
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                maxWidth: 220,
                              }}
                            >
                              {mem.muid || "mulearn"}
                            </span>
                            {/* Mobile only: share percentage underneath */}
                            <span
                              className="mobile-only-share tabular-nums"
                              style={{
                                display: "none",
                                fontSize: 11,
                                fontWeight: 700,
                                color: teamAccent,
                                marginTop: 2,
                              }}
                            >
                              {sharePct}% share
                            </span>
                          </div>
                        </td>

                        {/* Karma in Space Grotesk bold ink */}
                        <td
                          className="tabular-nums"
                          style={{
                            padding: "10px 14px",
                            textAlign: "right",
                            fontSize: 14,
                            fontWeight: 800,
                            fontFamily: "var(--font-numeric)",
                            color: "var(--ink)",
                          }}
                        >
                          {(mem.karma || 0).toLocaleString()}
                        </td>

                        {/* Share Percentage in --team-accent */}
                        <td
                          className="team-roster-share-col tabular-nums"
                          style={{
                            padding: "10px 14px",
                            textAlign: "right",
                            fontSize: 12.5,
                            fontWeight: 700,
                            fontFamily: "var(--font-numeric)",
                            color: teamAccent,
                          }}
                        >
                          {sharePct}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* =======================================================================
            RIGHT COLUMN: Team MVP, Chasing You, Sleeping Giants
            ======================================================================= */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* 1. Team MVP Card */}
          <div style={{ ...cardBoxStyle, padding: "20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 10.5,
                  fontWeight: 800,
                  color: "var(--gold)",
                  background: "var(--gold-tint)",
                  padding: "3px 8px",
                  borderRadius: "var(--radius-pill)",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                TEAM MVP
              </span>
              <Crest group={group} size="xs" />
            </div>

            {detail.mvp && (detail.mvp.karma || 0) > 0 ? (
              <div>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: "var(--font-body)",
                    color: "var(--ink)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {detail.mvp.name}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    fontFamily: "var(--font-body)",
                    color: "var(--muted)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {detail.mvp.muid}
                </div>

                <div
                  className="tabular-nums"
                  style={{
                    fontFamily: "var(--font-numeric)",
                    fontSize: 18,
                    fontWeight: 800,
                    color: "var(--gold)",
                    marginTop: 8,
                  }}
                >
                  +{(detail.mvp.karma || 0).toLocaleString()} KARMA
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: "var(--muted)", padding: "8px 0", fontFamily: "var(--font-body)" }}>
                No MVP yet
              </div>
            )}
          </div>

          {/* 2. Chasing You / Next Target Card */}
          <div style={{ ...cardBoxStyle, padding: "20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                }}
              >
                {chasingData.title}
              </span>

              {chasingData.threatLabel && (
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    padding: "3px 8px",
                    borderRadius: "var(--radius-pill)",
                    background:
                      chasingData.threatLabel === "SAFE"
                        ? "rgba(46, 158, 91, 0.12)"
                        : chasingData.threatLabel === "CLOSING IN" || chasingData.threatLabel === "WITHIN REACH"
                        ? "#FEF3C7"
                        : "rgba(179, 32, 42, 0.12)",
                    color:
                      chasingData.threatLabel === "SAFE"
                        ? "var(--green)"
                        : chasingData.threatLabel === "CLOSING IN" || chasingData.threatLabel === "WITHIN REACH"
                        ? "#D97706"
                        : "var(--crimson)",
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
                        fontSize: 13.5,
                        fontWeight: 800,
                        fontFamily: "var(--font-display)",
                        textTransform: "uppercase",
                        color: "var(--ink)",
                      }}
                    >
                      {chasingData.rival.name}
                    </div>
                    <div
                      style={{
                        fontSize: 10.5,
                        fontFamily: "var(--font-body)",
                        fontWeight: 700,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "var(--crimson)",
                      }}
                    >
                      VIEW TEAM →
                    </div>
                  </div>
                </Link>

                {/* Metrics Rows */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    fontSize: 11.5,
                    borderTop: "1px solid var(--border)",
                    paddingTop: 10,
                    marginBottom: 10,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--muted)", textTransform: "uppercase", fontSize: 11, fontWeight: 600 }}>
                      {currentRank === 1 ? "GAP BEHIND YOU" : "GAP TO CATCH"}
                    </span>
                    <span
                      className="tabular-nums"
                      style={{
                        fontFamily: "var(--font-numeric)",
                        fontWeight: 800,
                        color: "var(--gold)",
                      }}
                    >
                      {chasingData.gap.toLocaleString()} PTS
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--muted)", textTransform: "uppercase", fontSize: 11, fontWeight: 600 }}>
                      GAINED THIS WEEK
                    </span>
                    <span
                      className="tabular-nums"
                      style={{
                        fontFamily: "var(--font-numeric)",
                        fontWeight: 700,
                        color: "var(--ink)",
                      }}
                    >
                      {(chasingData.gainedThisWeek || 0).toLocaleString()} PTS
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ color: "var(--muted)", textTransform: "uppercase", fontSize: 11, fontWeight: 600 }}>
                      TREND
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 3,
                        fontFamily: "var(--font-numeric)",
                        fontWeight: 700,
                        color:
                          chasingData.trend === "up"
                            ? "var(--green)"
                            : chasingData.trend === "down"
                            ? "var(--crimson)"
                            : "var(--muted)",
                      }}
                    >
                      {chasingData.trend === "up" && <TrendingUp size={12} strokeWidth={2.2} />}
                      {chasingData.trend === "down" && <TrendingDown size={12} strokeWidth={2.2} />}
                      {chasingData.trend === "flat" && <Minus size={12} strokeWidth={2.2} />}
                      <span>
                        {chasingData.trend === "up"
                          ? `+${chasingData.trendDiff}`
                          : chasingData.trend === "down"
                          ? `-${chasingData.trendDiff}`
                          : "0"}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Reset & Points Needed Text */}
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--muted)",
                    lineHeight: 1.4,
                  }}
                >
                  {countdownText}. {currentRank === 1
                    ? `They need ${chasingData.pointsNeeded} to pass you.`
                    : `You need ${chasingData.pointsNeeded} to pass them.`}
                </div>
              </>
            ) : (
              <div style={{ fontSize: 12.5, color: "var(--muted)", padding: "8px 0" }}>
                {chasingData.statusMessage || "No rival team ranked yet"}
              </div>
            )}
          </div>

          {/* 3. Sleeping Giants Card */}
          <div style={{ ...cardBoxStyle, padding: "20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                }}
              >
                SLEEPING GIANTS
              </span>

              {sleepingGiantsData.giants.length > 0 && (
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "var(--gold)",
                    background: "var(--gold-tint)",
                    padding: "3px 8px",
                    borderRadius: "var(--radius-pill)",
                  }}
                >
                  {sleepingGiantsData.giants.length} READY TO RETURN
                </span>
              )}
            </div>

            {!sleepingGiantsData.hasEnoughHistory ? (
              <div style={{ fontSize: 12, color: "var(--muted)", padding: "8px 0" }}>
                Not enough history yet
              </div>
            ) : sleepingGiantsData.giants.length === 0 ? (
              <div style={{ fontSize: 12, color: "var(--muted)", padding: "8px 0" }}>
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
                        borderBottom: "1px solid var(--border)",
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            fontFamily: "var(--font-body)",
                            color: "var(--ink)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {g.name}
                        </div>
                        <div
                          style={{
                            fontSize: 10.5,
                            fontFamily: "var(--font-body)",
                            fontWeight: 600,
                            color: "var(--muted)",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                          }}
                        >
                          LAST SCORED {g.daysAgo}D AGO
                        </div>
                      </div>

                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <span
                          className="tabular-nums"
                          style={{
                            fontFamily: "var(--font-numeric)",
                            fontSize: 11.5,
                            fontWeight: 800,
                            color: "var(--gold)",
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
                    padding: "7px 12px",
                    borderRadius: "var(--radius-pill)",
                    background: "#FFFFFF",
                    border: "1px solid var(--border)",
                    color: "var(--ink)",
                    fontFamily: "var(--font-body)",
                    fontSize: 11.5,
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    transition: "all 150ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--ink)";
                    e.currentTarget.style.background = "#FAF8F4";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border)";
                    e.currentTarget.style.background = "#FFFFFF";
                  }}
                >
                  {copiedKey === "nudge" ? (
                    <>
                      <Check size={13} color="var(--green)" />
                      <span style={{ color: "var(--green)" }}>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span>Copy Nudge Message</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
