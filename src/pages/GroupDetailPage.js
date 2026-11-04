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
  ChevronDown,
  ChevronUp,
  Crown,
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
  const [showAllMembers, setShowAllMembers] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

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

  const isSearching = Boolean(memberSearch.trim());
  const visibleMembers = isSearching || showAllMembers
    ? filteredMembers
    : filteredMembers.slice(0, 3);

  return (
    <div
      className="team-detail-page-root"
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        paddingBottom: 40,
        position: "relative",
      }}
    >
      <style>{`
        /* Top Background Sumi-e Landscape Art Layer */
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

        /* 3 Stat Cards Row */
        .team-stats-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          width: 100%;
        }

        /* 2-Column Sub Grid for Team MVP & Next Target */
        .team-sub-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          width: 100%;
        }

        .sleeping-giants-body {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        @media (max-width: 640px) {
          .team-hero-card {
            padding: 18px 16px !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          .team-hero-right-zone {
            text-align: left !important;
            width: 100% !important;
            padding-top: 14px !important;
            border-top: 1px solid rgba(255, 255, 255, 0.12) !important;
          }
          .team-stats-row {
            gap: 8px !important;
          }
          .team-stat-card {
            padding: 12px 10px !important;
            border-radius: 14px !important;
          }
          .team-stat-val {
            font-size: 24px !important;
          }
          .team-stat-lbl {
            font-size: 9px !important;
          }
          .team-sub-grid {
            grid-template-columns: 1fr !important;
            gap: 12px !important;
          }
          .sleeping-giants-body {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .sleeping-giants-btn {
            width: 100% !important;
            justify-content: center !important;
          }
        }
      `}</style>

      {/* Top Background Sumi-e Landscape Banner */}
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
            fontSize: 12,
            fontWeight: 700,
            fontFamily: "var(--font-body)",
            letterSpacing: "0.04em",
            color: "var(--muted)",
            textDecoration: "none",
            transition: "color 150ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--ink)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
        >
          <ArrowLeft size={14} strokeWidth={2.4} />
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
          HERO BANNER: Unified Dark Card with Original Crest, Title, Motto & Karma
          ========================================================================= */}
      <div
        className="team-hero-card"
        style={{
          position: "relative",
          background: "var(--ink)",
          borderRadius: 20,
          overflow: "hidden",
          padding: "24px 28px",
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.08), 0 12px 32px rgba(0, 0, 0, 0.22)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        {/* Dark Japanese Ink-Wash Mountains + Torii Art */}
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
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to right, #16161A 32%, rgba(22, 22, 26, 0.88) 58%, rgba(22, 22, 26, 0.35) 100%)",
            }}
          />
        </div>

        {/* Left Side: Hero Crest + Meta Stack */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            flexWrap: "wrap",
            minWidth: 0,
            position: "relative",
            zIndex: 1,
          }}
        >
          {crestFiles ? (
            <img
              src={crestFiles["384"] || crestFiles["128"]}
              srcSet={`${crestFiles["128"]} 128w, ${crestFiles["384"]} 384w`}
              sizes="110px"
              alt={`${displayName} crest`}
              style={{
                height: 84,
                width: "auto",
                maxWidth: 96,
                objectFit: "contain",
                display: "block",
                flexShrink: 0,
                filter: "drop-shadow(0 6px 14px rgba(0, 0, 0, 0.45))",
              }}
            />
          ) : (
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: 16,
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 24,
                fontWeight: 800,
                color: "#FFFFFF",
                flexShrink: 0,
              }}
            >
              {displayName.slice(0, 2)}
            </div>
          )}

          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(255, 255, 255, 0.72)",
                marginBottom: 3,
              }}
            >
              {token.discipline || "COMMUNITY GUILD & CONNECTED UNIVERSE"}
            </div>

            <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
              <h1
                style={{
                  margin: 0,
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(26px, 3.5vw, 40px)",
                  fontWeight: 800,
                  lineHeight: 1.05,
                  textTransform: "uppercase",
                  letterSpacing: "-0.03em",
                  color: "#FFFFFF",
                }}
              >
                {displayName}
              </h1>

              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: teamAccent,
                  border: `1px solid ${teamAccent}`,
                  padding: "2px 8px",
                  borderRadius: "var(--radius-pill)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                RANK #{currentRank}
              </span>

              {token.roleBadge && (
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: "rgba(255, 255, 255, 0.8)",
                    border: "1px solid rgba(255, 255, 255, 0.22)",
                    background: "rgba(255, 255, 255, 0.05)",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-pill)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  {token.roleBadge}
                </span>
              )}
            </div>

            {token.motto && (
              <div
                style={{
                  marginTop: 6,
                  fontSize: 12,
                  fontStyle: "italic",
                  fontWeight: 500,
                  fontFamily: "var(--font-body)",
                  color: "rgba(255, 255, 255, 0.7)",
                  lineHeight: 1.3,
                }}
              >
                "{token.motto}"
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Huge Karma + Active Count */}
        <div className="team-hero-right-zone" style={{ textAlign: "right", flexShrink: 0, position: "relative", zIndex: 1 }}>
          <div
            className="tabular-nums"
            style={{
              fontFamily: "var(--font-numeric)",
              fontWeight: 800,
              fontSize: "clamp(42px, 5vw, 56px)",
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
              fontSize: 10.5,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(255, 255, 255, 0.6)",
              marginTop: 4,
            }}
          >
            TOTAL KARMA
          </div>
          <div
            style={{
              fontFamily: "var(--font-body)",
              fontSize: 10.5,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--gold)",
              marginTop: 3,
            }}
          >
            {activeMembersCount} OF {members.length} WARRIORS ACTIVE
          </div>
        </div>
      </div>

      {/* =========================================================================
          3 STAT CARDS IN ONE ROW: Campus Standing | Lead/Overtake | Target Pace
          ========================================================================= */}
      <div className="team-stats-row">
        {/* Stat 1: Campus Standing */}
        <div className="team-stat-card" style={{ ...cardBoxStyle, padding: "16px 18px", position: "relative" }}>
          <div className="team-stat-lbl" style={{ fontFamily: "var(--font-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)" }}>
            CAMPUS STANDING
          </div>
          <div className="team-stat-val tabular-nums" style={{ fontFamily: "var(--font-numeric)", fontSize: 30, fontWeight: 800, lineHeight: 1.1, color: "var(--ink)", marginTop: 4 }}>
            #{currentRank}
          </div>
          <div style={{ fontSize: 11, fontWeight: 500, fontFamily: "var(--font-body)", color: "var(--muted)", marginTop: 4 }}>
            of {sameTypeCount} {isOfficial ? "teams" : "groups"}
          </div>
          <img
            src="/assets/art/empty-state.webp"
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              right: -6,
              bottom: -6,
              width: 90,
              height: 55,
              objectFit: "contain",
              opacity: 0.055,
              mixBlendMode: "multiply",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Stat 2: Overtake Margin */}
        <div className="team-stat-card" style={{ ...cardBoxStyle, padding: "16px 18px" }}>
          <div className="team-stat-lbl" style={{ fontFamily: "var(--font-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {currentRank === 1
              ? "LEAD MARGIN"
              : `${chasingData.pointsNeeded || 0} PTS TO OVERTAKE ${chasingData.rival ? chasingData.rival.name : "TEAM AHEAD"}`}
          </div>
          <div className="team-stat-val tabular-nums" style={{ fontFamily: "var(--font-numeric)", fontSize: 30, fontWeight: 800, lineHeight: 1.1, color: currentRank === 1 ? "var(--green)" : "var(--crimson)", marginTop: 4 }}>
            {currentRank === 1 ? `+${chasingData.gap || 0}` : (chasingData.pointsNeeded || 0)}
          </div>
          <div style={{ width: 42, height: 4, background: "var(--crimson)", borderRadius: 9999, marginTop: 8 }} />
        </div>

        {/* Stat 3: Team Target Pace & Roster Engagement */}
        <div className="team-stat-card" style={{ ...cardBoxStyle, padding: "16px 18px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div className="team-stat-lbl" style={{ fontFamily: "var(--font-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)" }}>
            TEAM TARGET PACE
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
            <svg width="42" height="42" viewBox="0 0 42 42" style={{ flexShrink: 0 }}>
              <circle cx="21" cy="21" r="16" stroke="#EAE6DF" strokeWidth="4" fill="none" />
              <circle
                cx="21"
                cy="21"
                r="16"
                stroke={targetPercent >= 100 ? "var(--green)" : "var(--crimson)"}
                strokeWidth="4"
                fill="none"
                strokeDasharray={100.5}
                strokeDashoffset={100.5 * (1 - targetPercent / 100)}
                strokeLinecap="round"
                transform="rotate(-90 21 21)"
              />
              <text x="21" y="25" textAnchor="middle" fontSize="10" fontWeight="800" fontFamily="var(--font-numeric)" fill="var(--ink)">
                {targetPercent}%
              </text>
            </svg>
            <div>
              <div className="tabular-nums" style={{ fontSize: 12, fontWeight: 800, color: "var(--ink)", fontFamily: "var(--font-numeric)" }}>
                {currentKarma.toLocaleString()} / {targetKarma.toLocaleString()}
              </div>
              <div style={{ fontSize: 9.5, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase" }}>
                target
              </div>
            </div>
          </div>
          <div style={{ fontSize: 9.5, color: "var(--muted)", marginTop: 4 }}>
            Roster Engagement: {activeMembersCount}/{members.length} active ({rosterPct}%)
          </div>
        </div>
      </div>

      {/* =========================================================================
          TEAM ROSTER CARD: Compact list with show/hide toggle ("scroll less")
          ========================================================================= */}
      <div style={{ ...cardBoxStyle, padding: "20px 22px 14px 22px" }}>
        {/* Header & Search */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
          <div>
            <h3
              style={{
                margin: 0,
                fontFamily: "var(--font-display)",
                fontSize: 16,
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
                fontSize: 10.5,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--muted)",
              }}
            >
              {members.length} WARRIORS ENROLLED • {activeMembersCount} ACTIVE
            </span>
          </div>

          <div style={{ position: "relative", minWidth: 160, maxWidth: 220 }}>
            <Search
              size={13}
              color="var(--muted)"
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
                borderRadius: "var(--radius-pill)",
                border: "1px solid var(--border)",
                background: "#FFFFFF",
                fontSize: 12.5,
                fontFamily: "var(--font-body)",
                color: "var(--ink)",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* Roster Items */}
        {filteredMembers.length === 0 ? (
          <div style={{ padding: "30px 16px", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            No warriors matched "{memberSearch}".
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {visibleMembers.map((mem, idx) => {
              const rankNum = idx + 1;
              const isTopRank = rankNum === 1 && (mem.karma || 0) > 0;
              const sharePct = mem.share || 0;
              const isMVP = detail.mvp && detail.mvp.id === mem.id && (mem.karma || 0) > 0;

              return (
                <div
                  key={mem.id || mem.muid || idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: isTopRank ? "10px 12px" : "10px 12px",
                    background: isTopRank ? "#FFFDF5" : "transparent",
                    border: isTopRank ? "1px solid rgba(217, 119, 6, 0.16)" : "none",
                    borderBottom: isTopRank ? "1px solid rgba(217, 119, 6, 0.16)" : "1px solid var(--border)",
                    borderRadius: isTopRank ? 12 : 0,
                    marginBottom: isTopRank ? 6 : 0,
                    transition: "background 150ms ease",
                  }}
                >
                  {/* Left: Rank # + Initials Avatar + Name & MUID */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 800,
                        fontFamily: "var(--font-numeric)",
                        flexShrink: 0,
                        background:
                          rankNum === 1
                            ? "#FDE68A"
                            : rankNum === 2
                            ? "#E2E8F0"
                            : rankNum === 3
                            ? "#FED7AA"
                            : "#F1F5F9",
                        color:
                          rankNum === 1
                            ? "#78350F"
                            : rankNum === 2
                            ? "#334155"
                            : rankNum === 3
                            ? "#7C2D12"
                            : "var(--muted)",
                      }}
                    >
                      {rankNum}
                    </div>

                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: "50%",
                        background: "#16161A",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 10.5,
                        fontWeight: 700,
                        fontFamily: "var(--font-body)",
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(mem.name)}
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Link
                          to={`/u/${encodeURIComponent(mem.muid || mem.id)}`}
                          style={{
                            fontSize: 13,
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
                              fontSize: 9,
                              fontWeight: 800,
                              fontFamily: "var(--font-numeric)",
                              color: "var(--gold)",
                              background: "var(--gold-tint)",
                              padding: "1px 5px",
                              borderRadius: 3,
                            }}
                          >
                            MVP
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          fontFamily: "var(--font-body)",
                          color: "var(--muted)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {mem.muid || "mulearn"}
                      </div>
                    </div>
                  </div>

                  {/* Right: Progress Share Bar + Karma */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div
                        style={{
                          width: 48,
                          height: 4,
                          borderRadius: 9999,
                          background: "#E2E8F0",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${sharePct}%`,
                            height: "100%",
                            borderRadius: 9999,
                            background: isTopRank ? "var(--gold)" : "#94A3B8",
                          }}
                        />
                      </div>
                      <span
                        className="tabular-nums"
                        style={{
                          fontSize: 11,
                          fontWeight: 600,
                          fontFamily: "var(--font-numeric)",
                          color: "var(--muted)",
                          width: 26,
                        }}
                      >
                        {sharePct}%
                      </span>
                    </div>

                    <div
                      className="tabular-nums"
                      style={{
                        fontSize: 12.5,
                        fontWeight: 800,
                        fontFamily: "var(--font-numeric)",
                        color: isTopRank ? "var(--gold)" : "var(--ink)",
                        whiteSpace: "nowrap",
                        minWidth: 80,
                        textAlign: "right",
                      }}
                    >
                      {(mem.karma || 0).toLocaleString()} KARMA
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Show All / Show Less Expander */}
            {filteredMembers.length > 3 && !isSearching && (
              <button
                type="button"
                onClick={() => setShowAllMembers((prev) => !prev)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--ink)",
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: "var(--font-body)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  width: "100%",
                  padding: "12px 0 4px 0",
                  transition: "opacity 150ms ease",
                }}
              >
                <span>
                  {showAllMembers
                    ? "Show less warriors"
                    : `Show all ${filteredMembers.length} warriors`}
                </span>
                {showAllMembers ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          SUB-GRID: Team MVP (Left) | Next Target (Right)
          ========================================================================= */}
      <div className="team-sub-grid">
        {/* Card 1: Team MVP */}
        <div style={{ ...cardBoxStyle, padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontSize: 10,
                fontWeight: 800,
                color: "var(--gold)",
                background: "var(--gold-tint)",
                padding: "3px 8px",
                borderRadius: "var(--radius-pill)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Crown size={12} fill="currentColor" />
              <span>TEAM MVP</span>
            </span>
            <Crest group={group} size="xs" />
          </div>

          {detail.mvp && (detail.mvp.karma || 0) > 0 ? (
            <div>
              <div style={{ fontSize: 14.5, fontWeight: 800, fontFamily: "var(--font-body)", color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {detail.mvp.name}
              </div>
              <div style={{ fontSize: 11, fontFamily: "var(--font-body)", color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {detail.mvp.muid}
              </div>
              <div className="tabular-nums" style={{ fontFamily: "var(--font-numeric)", fontSize: 20, fontWeight: 800, color: "var(--gold)", marginTop: 6 }}>
                +{(detail.mvp.karma || 0).toLocaleString()} KARMA
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 12.5, color: "var(--muted)", padding: "6px 0" }}>
              No MVP this period
            </div>
          )}

          <img
            src="/assets/art/empty-state.webp"
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              right: -8,
              bottom: -8,
              width: 100,
              height: 60,
              objectFit: "contain",
              opacity: 0.05,
              mixBlendMode: "multiply",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Card 2: Next Target */}
        <div style={{ ...cardBoxStyle, padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)" }}>
              {chasingData.title}
            </span>

            {chasingData.threatLabel && (
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 9.5,
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  padding: "2px 7px",
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
              <Link
                to={`/groups/${chasingData.rival.id || chasingData.rival.name}?period=${encodeURIComponent(period)}&offset=${encodeURIComponent(offset)}`}
                style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", marginBottom: 10 }}
              >
                <Crest group={chasingData.rival} size="sm" />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, fontFamily: "var(--font-display)", textTransform: "uppercase", color: "var(--ink)" }}>
                    {chasingData.rival.name}
                  </div>
                  <div style={{ fontSize: 10, fontFamily: "var(--font-body)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--crimson)" }}>
                    VIEW TEAM →
                  </div>
                </div>
              </Link>

              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11, borderTop: "1px solid var(--border)", paddingTop: 8, marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--muted)", textTransform: "uppercase", fontSize: 10, fontWeight: 600 }}>
                    {currentRank === 1 ? "GAP BEHIND YOU" : "GAP TO CATCH"}
                  </span>
                  <span className="tabular-nums" style={{ fontFamily: "var(--font-numeric)", fontWeight: 800, color: "var(--gold)" }}>
                    {chasingData.gap.toLocaleString()} PTS
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--muted)", textTransform: "uppercase", fontSize: 10, fontWeight: 600 }}>
                    GAINED THIS WEEK
                  </span>
                  <span className="tabular-nums" style={{ fontFamily: "var(--font-numeric)", fontWeight: 700, color: "var(--ink)" }}>
                    {(chasingData.gainedThisWeek || 0).toLocaleString()} PTS
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: "var(--muted)", textTransform: "uppercase", fontSize: 10, fontWeight: 600 }}>
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

              <div style={{ fontSize: 10.5, color: "var(--muted)", lineHeight: 1.3 }}>
                {countdownText}. {currentRank === 1
                  ? `They need ${chasingData.pointsNeeded} to pass you.`
                  : `You need ${chasingData.pointsNeeded} to pass them.`}
              </div>
            </>
          ) : (
            <div style={{ fontSize: 12, color: "var(--muted)", padding: "6px 0" }}>
              {chasingData.statusMessage || "No rival team ranked yet"}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          SLEEPING GIANTS CARD: Full width at the bottom with Red Copy Nudge Button
          ========================================================================= */}
      <div style={{ ...cardBoxStyle, padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontFamily: "var(--font-body)", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)" }}>
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
          <div className="sleeping-giants-body">
            {/* Left: Sleeping Warriors List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1, minWidth: 240 }}>
              {sleepingGiantsData.giants.slice(0, 3).map((g) => (
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
                    <div style={{ fontSize: 13, fontWeight: 700, fontFamily: "var(--font-body)", color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {g.name}
                    </div>
                    <div style={{ fontSize: 10, fontFamily: "var(--font-body)", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      LAST SCORED {g.daysAgo}D AGO
                    </div>
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <span className="tabular-nums" style={{ fontFamily: "var(--font-numeric)", fontSize: 11, fontWeight: 800, color: "var(--gold)" }}>
                      AVG {g.avg} / WK
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Right: Bold Red Nudge Button matching the screenshot */}
            <button
              type="button"
              className="sleeping-giants-btn"
              onClick={handleCopyNudgeMessage}
              style={{
                background: "var(--crimson)",
                color: "#FFFFFF",
                border: "none",
                borderRadius: 12,
                padding: "12px 20px",
                fontFamily: "var(--font-body)",
                fontSize: 12.5,
                fontWeight: 700,
                letterSpacing: "0.04em",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
                boxShadow: "0 4px 14px rgba(179, 32, 42, 0.25)",
                transition: "all 150ms ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.92")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              {copiedKey === "nudge" ? (
                <>
                  <Check size={15} color="#FFFFFF" />
                  <span>Copied Nudge!</span>
                </>
              ) : (
                <>
                  <Copy size={15} color="#FFFFFF" />
                  <span>Copy Nudge Message</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
