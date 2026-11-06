import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  TrendingUp,
  Trophy,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { karmaStore } from "../data/karmaStore";
import { getGroupToken, isOfficialTeam } from "../utils/groupTokens";
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
import { CREST_REGISTRY, normalizeGroupSlug, getGroupDisplayName } from "../crests";
import PeriodCalendarPopover from "../components/common/PeriodCalendarPopover";
import { getChasingOrTargetTeam } from "../utils/teamPageHelpers";

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
  const rosterPct = members.length > 0 ? Math.round((activeMembersCount / members.length) * 100) : 0;

  const filteredMembers = members.filter((m) => {
    if (!memberSearch.trim()) return true;
    const q = memberSearch.toLowerCase();
    return (
      (m.name && m.name.toLowerCase().includes(q)) ||
      (m.muid && m.muid.toLowerCase().includes(q))
    );
  });

  const isSearching = Boolean(memberSearch.trim());
  const visibleMembers = isSearching || showAllMembers
    ? filteredMembers
    : filteredMembers.slice(0, 3);

  return (
    <div
      className="team-detail-page-container"
      style={{
        width: "100%",
        maxWidth: 820,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        padding: "16px 16px 120px 16px",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        /* Page Background Art Layer */
        .team-detail-bg-art {
          position: absolute;
          top: -20px;
          right: 0;
          width: clamp(340px, 50vw, 750px);
          height: 280px;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
          opacity: 0.95;
        }

        .team-detail-sakura-branch {
          position: absolute;
          top: -10px;
          right: 0;
          width: clamp(260px, 35vw, 480px);
          pointer-events: none;
          z-index: 0;
          user-select: none;
        }

        .team-detail-petals {
          position: absolute;
          top: 0;
          right: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
          user-select: none;
        }

        .team-detail-bottom-waves {
          position: absolute;
          bottom: 20px;
          right: 0;
          width: clamp(240px, 35vw, 420px);
          height: 140px;
          pointer-events: none;
          z-index: 0;
          opacity: 0.12;
          color: var(--crimson);
        }

        /* Responsive Stat Cards Row */
        .team-detail-stats-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          width: 100%;
        }

        @media (max-width: 640px) {
          .team-detail-stats-row {
            gap: 8px !important;
          }
          .team-stat-card-box {
            padding: 14px 12px !important;
            border-radius: 16px !important;
          }
          .team-stat-main-num {
            font-size: 26px !important;
          }
          .team-stat-lbl-text {
            font-size: 9.5px !important;
          }
          .team-banner-crest-img {
            height: 64px !important;
          }
        }
      `}</style>

      {/* =========================================================================
          BACKGROUND ARTWORK: Pagoda + Red Sun + Sakura Branch + Drifting Petals
          ========================================================================= */}
      <div className="team-detail-bg-art" aria-hidden="true">
        <img
          src="/assets/art/header-banner.webp"
          alt=""
          aria-hidden="true"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            objectPosition: "right top",
            display: "block",
            mixBlendMode: "multiply",
            opacity: 0.88,
          }}
        />
      </div>

      {/* Cherry blossom branch in top-right corner */}
      <img
        src="/assets/art/sakura-branch.webp"
        alt=""
        aria-hidden="true"
        className="team-detail-sakura-branch"
      />

      {/* Falling sakura petals overlay */}
      <img
        src="/assets/art/falling-petals.svg"
        alt=""
        aria-hidden="true"
        className="team-detail-petals"
      />

      {/* Seigaiha wave pattern fading in along bottom */}
      <img
        src="/assets/art/seigaiha.svg"
        alt=""
        aria-hidden="true"
        className="team-detail-bottom-waves"
      />

      {/* =========================================================================
          1. BACK LINK: "<- Back to all teams"
          ========================================================================= */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <Link
          to={`/groups?period=${encodeURIComponent(period)}&offset=${encodeURIComponent(offset)}`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "var(--font-body)",
            color: "var(--ink)",
            textDecoration: "none",
            transition: "color 150ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--crimson)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink)")}
        >
          <ArrowLeft size={16} strokeWidth={2.4} />
          <span>Back to all teams</span>
        </Link>
      </div>

      {/* =========================================================================
          2. COMPACT TEAM BANNER CARD (Matches Image 1)
          ========================================================================= */}
      <div
        className="team-banner-card"
        style={{
          position: "relative",
          background: "#141416",
          borderRadius: 28,
          overflow: "hidden",
          padding: "20px 24px",
          border: "1px solid rgba(179, 32, 42, 0.45)",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.28), 0 0 24px rgba(179, 32, 42, 0.12)",
          zIndex: 2,
        }}
      >
        {/* Dark Torii Gate & Misty Mountain Background Image with Red Brush Accents */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          <img
            src="/assets/art/team-banner-bg.webp"
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
              opacity: 0.88,
            }}
          />
          {/* Subtle gradient vignette to keep text on left ultra crisp */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to right, #141416 38%, rgba(20, 20, 22, 0.78) 65%, rgba(20, 20, 22, 0.15) 100%)",
            }}
          />
        </div>

        {/* Content: Crest + Divider + Info Stack */}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          {/* Crest / Logo */}
          <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
            {crestFiles ? (
              <img
                src={crestFiles["384"] || crestFiles["128"]}
                srcSet={`${crestFiles["128"]} 128w, ${crestFiles["384"]} 384w`}
                sizes="96px"
                alt={`${displayName} crest`}
                className="team-banner-crest-img"
                style={{
                  height: 76,
                  width: "auto",
                  maxWidth: 90,
                  objectFit: "contain",
                  display: "block",
                  filter: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.55))",
                }}
              />
            ) : (
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: 18,
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#FFFFFF",
                }}
              >
                {displayName.slice(0, 2)}
              </div>
            )}
          </div>

          {/* Thin Vertical Divider */}
          <div
            style={{
              width: 1,
              height: 56,
              background: "rgba(255, 255, 255, 0.25)",
              flexShrink: 0,
              margin: "0 4px",
            }}
          />

          {/* Right Info: Team Name, Rank #7, Total Karma */}
          <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 3 }}>
            <h1
              style={{
                margin: 0,
                fontFamily: "var(--font-display)",
                fontSize: "clamp(22px, 3.4vw, 28px)",
                fontWeight: 800,
                lineHeight: 1.1,
                textTransform: "uppercase",
                letterSpacing: "-0.01em",
                color: "#FFFFFF",
              }}
            >
              {displayName}
            </h1>

            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "var(--font-body)",
                color: "rgba(255, 255, 255, 0.68)",
                letterSpacing: "0.01em",
              }}
            >
              Rank #{currentRank}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 8,
                marginTop: 2,
              }}
            >
              <span
                className="tabular-nums"
                style={{
                  fontFamily: "var(--font-numeric)",
                  fontSize: "clamp(30px, 4.2vw, 38px)",
                  fontWeight: 800,
                  lineHeight: 1,
                  color: "#FFFFFF",
                  letterSpacing: "-0.02em",
                }}
              >
                {currentKarma.toLocaleString()}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 12.5,
                  fontWeight: 500,
                  color: "rgba(255, 255, 255, 0.6)",
                  letterSpacing: "0.02em",
                }}
              >
                Total Karma
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. FULL-WIDTH MONTH SELECTOR PILL (Moved Below Banner, Above Stats)
          ========================================================================= */}
      <div style={{ position: "relative", zIndex: 2 }}>
        <PeriodCalendarPopover
          period={period}
          offset={offset}
          dateLabel={dateRangeInfo.label}
          onPeriodChange={handlePeriodChange}
          onOffsetChange={handleOffsetChange}
          onDateSelect={handleDateSelect}
          fullWidth={true}
        />
      </div>

      {/* =========================================================================
          4. 3 STAT CARDS ROW: Campus Standing | PTS to Overtake | Roster Engagement
          ========================================================================= */}
      <div className="team-detail-stats-row" style={{ position: "relative", zIndex: 2 }}>
        {/* Stat Card 1: Campus Standing */}
        <div
          className="team-stat-card-box"
          style={{
            background: "#FFFFFF",
            borderRadius: 20,
            border: "1px solid rgba(0, 0, 0, 0.06)",
            borderLeft: "4px solid var(--crimson)",
            boxShadow: "0 2px 12px rgba(22, 22, 26, 0.04)",
            padding: "16px 16px 14px 16px",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "var(--font-body)",
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#5A5A62",
                whiteSpace: "nowrap",
              }}
              className="team-stat-lbl-text"
            >
              <Users size={14} color="#5A5A62" strokeWidth={2.2} />
              <span>CAMPUS STANDING</span>
            </div>
            <div
              className="team-stat-main-num tabular-nums"
              style={{
                fontFamily: "var(--font-numeric)",
                fontSize: 32,
                fontWeight: 800,
                lineHeight: 1.1,
                color: "var(--ink)",
                marginTop: 6,
              }}
            >
              #{currentRank}
            </div>
          </div>
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 500,
              fontFamily: "var(--font-body)",
              color: "var(--muted)",
              marginTop: 6,
            }}
          >
            of {sameTypeCount} {isOfficial ? "teams" : "groups"}
          </div>

          {/* Faint Seigaiha wave pattern in bottom-right corner */}
          <img
            src="/assets/art/seigaiha.svg"
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              right: -8,
              bottom: -8,
              width: 75,
              height: 44,
              objectFit: "contain",
              opacity: 0.08,
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Stat Card 2: Points to Overtake / Lead Margin */}
        <div
          className="team-stat-card-box"
          style={{
            background: "#FFFFFF",
            borderRadius: 20,
            border: "1px solid rgba(0, 0, 0, 0.06)",
            borderLeft: "4px solid var(--crimson)",
            boxShadow: "0 2px 12px rgba(22, 22, 26, 0.04)",
            padding: "16px 16px 14px 16px",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "var(--font-body)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.01em",
                textTransform: "uppercase",
                color: "#5A5A62",
                whiteSpace: "nowrap",
              }}
              className="team-stat-lbl-text"
            >
              <Trophy size={14} color="#5A5A62" strokeWidth={2.2} />
              <span>
                {currentRank === 1
                  ? "LEAD MARGIN"
                  : `${chasingData.pointsNeeded || 0} PTS TO OVERTAKE`}
              </span>
            </div>
            <div
              className="team-stat-main-num tabular-nums"
              style={{
                fontFamily: "var(--font-numeric)",
                fontSize: 32,
                fontWeight: 800,
                lineHeight: 1.1,
                color: currentRank === 1 ? "var(--green)" : "var(--crimson)",
                marginTop: 6,
              }}
            >
              {currentRank === 1 ? `+${chasingData.gap || 0}` : (chasingData.pointsNeeded || 0)}
            </div>
            {/* Short solid red underline bar */}
            <div
              style={{
                width: 36,
                height: 4,
                background: currentRank === 1 ? "var(--green)" : "var(--crimson)",
                borderRadius: 9999,
                marginTop: 6,
              }}
            />
          </div>

          {/* Faint Seigaiha wave pattern in bottom-right corner */}
          <img
            src="/assets/art/seigaiha.svg"
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              right: -8,
              bottom: -8,
              width: 75,
              height: 44,
              objectFit: "contain",
              opacity: 0.08,
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Stat Card 3: Roster Engagement */}
        <div
          className="team-stat-card-box"
          style={{
            background: "#FFFFFF",
            borderRadius: 20,
            border: "1px solid rgba(0, 0, 0, 0.06)",
            borderLeft: "4px solid var(--crimson)",
            boxShadow: "0 2px 12px rgba(22, 22, 26, 0.04)",
            padding: "16px 16px 14px 16px",
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "var(--font-body)",
                fontSize: 10.5,
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#5A5A62",
                whiteSpace: "nowrap",
              }}
              className="team-stat-lbl-text"
            >
              <TrendingUp size={14} color="#5A5A62" strokeWidth={2.2} />
              <span>ROSTER ENGAGEMENT</span>
            </div>
            <div
              className="team-stat-main-num tabular-nums"
              style={{
                fontFamily: "var(--font-numeric)",
                fontSize: 32,
                fontWeight: 800,
                lineHeight: 1.1,
                color: "var(--ink)",
                marginTop: 6,
              }}
            >
              {activeMembersCount} / {members.length}
            </div>
          </div>
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 500,
              fontFamily: "var(--font-body)",
              color: "var(--muted)",
              marginTop: 6,
            }}
          >
            {rosterPct}% active this week
          </div>

          {/* Faint Seigaiha wave pattern in bottom-right corner */}
          <img
            src="/assets/art/seigaiha.svg"
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              right: -8,
              bottom: -8,
              width: 75,
              height: 44,
              objectFit: "contain",
              opacity: 0.08,
              pointerEvents: "none",
            }}
          />
        </div>
      </div>

      {/* =========================================================================
          5. TEAM ROSTER CARD (Matches Image 1)
          ========================================================================= */}
      <div
        className="team-roster-card"
        style={{
          background: "#FFFFFF",
          borderRadius: 24,
          border: "1px solid rgba(0, 0, 0, 0.06)",
          boxShadow: "0 4px 20px rgba(22, 22, 26, 0.05)",
          padding: "20px 22px 16px 22px",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Header: Red Icon + Title/Subtext + Search Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {/* Left: Red Team Icon + Title */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "rgba(179, 32, 42, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Users size={20} color="var(--crimson)" strokeWidth={2.2} />
            </div>
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
              <div
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                  marginTop: 2,
                }}
              >
                {members.length} WARRIORS ENROLLED · {activeMembersCount} ACTIVE
              </div>
            </div>
          </div>

          {/* Right: Rounded Search Pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "#F6F5F2",
              border: "1px solid rgba(0, 0, 0, 0.06)",
              borderRadius: 9999,
              padding: "7px 14px 7px 12px",
              minWidth: 190,
              flexShrink: 0,
            }}
          >
            <Search size={14} color="var(--muted)" strokeWidth={2.2} />
            <input
              type="text"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Search warrior..."
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: 12.5,
                fontFamily: "var(--font-body)",
                width: "100%",
                color: "var(--ink)",
              }}
            />
          </div>
        </div>

        {/* Member Rows */}
        {filteredMembers.length === 0 ? (
          <div style={{ padding: "28px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            No warriors found matching "{memberSearch}"
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {visibleMembers.map((mem, index) => {
              const rank = index + 1;
              const isFirst = rank === 1;
              const isSecond = rank === 2;
              const isThird = rank === 3;
              const sharePct = currentKarma > 0 ? Math.round(((mem.karma || 0) / currentKarma) * 100) : 0;

              return (
                <div
                  key={mem.id || mem.muid || index}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    padding: isFirst ? "12px 14px" : "10px 14px",
                    borderRadius: isFirst ? 16 : 10,
                    background: isFirst
                      ? "linear-gradient(90deg, #FFF9E6 0%, #FFFDF5 100%)"
                      : "transparent",
                    border: isFirst
                      ? "1px solid rgba(212, 175, 55, 0.35)"
                      : "none",
                    borderBottom: isFirst
                      ? "1px solid rgba(212, 175, 55, 0.35)"
                      : index < visibleMembers.length - 1
                        ? "1px solid rgba(0, 0, 0, 0.04)"
                        : "none",
                    transition: "background 150ms ease",
                  }}
                >
                  {/* Left: Rank Badge + Dark Avatar + Name & Email */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    {/* Rank Badge Circle */}
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12,
                        fontWeight: 800,
                        fontFamily: "var(--font-numeric)",
                        flexShrink: 0,
                        background: isFirst
                          ? "#F8E7A2"
                          : isSecond
                            ? "#E2E8F0"
                            : isThird
                              ? "#FED7AA"
                              : "#F1F5F9",
                        color: isFirst
                          ? "#8A6805"
                          : isSecond
                            ? "#475569"
                            : isThird
                              ? "#9A3412"
                              : "#64748B",
                      }}
                    >
                      {rank}
                    </div>

                    {/* Dark Circular Avatar with White Initials */}
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "50%",
                        background: "#16161A",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 12.5,
                        fontWeight: 800,
                        color: "#FFFFFF",
                        fontFamily: "var(--font-display)",
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(mem.name)}
                    </div>

                    {/* Name & Email */}
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13.5,
                          fontWeight: 700,
                          fontFamily: "var(--font-body)",
                          color: "var(--ink)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {mem.name}
                      </div>
                      <div
                        style={{
                          fontSize: 11.5,
                          color: "var(--muted)",
                          fontFamily: "var(--font-body)",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {mem.muid || `${mem.name.toLowerCase().replace(/\s+/g, "")}@mulearn`}
                      </div>
                    </div>
                  </div>

                  {/* Right: Progress Bar + Percentage + Karma */}
                  <div style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0 }}>
                    {/* Thin Progress Bar + Percentage */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div
                        style={{
                          width: 48,
                          height: 5,
                          borderRadius: 9999,
                          background: "#E2E8F0",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(100, sharePct)}%`,
                            height: "100%",
                            borderRadius: 9999,
                            background: isFirst ? "var(--gold)" : "#94A3B8",
                          }}
                        />
                      </div>
                      <span
                        className="tabular-nums"
                        style={{
                          fontSize: 11.5,
                          fontWeight: 600,
                          fontFamily: "var(--font-numeric)",
                          color: "var(--muted)",
                          width: 28,
                          textAlign: "right",
                        }}
                      >
                        {sharePct}%
                      </span>
                    </div>

                    {/* Bold Karma Value */}
                    <div
                      className="tabular-nums"
                      style={{
                        fontSize: 13,
                        fontWeight: 800,
                        fontFamily: "var(--font-numeric)",
                        color: isFirst ? "var(--gold)" : "var(--ink)",
                        whiteSpace: "nowrap",
                        minWidth: 85,
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
    </div>
  );
}
