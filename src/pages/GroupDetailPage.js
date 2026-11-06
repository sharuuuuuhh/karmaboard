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
    >
      <style>{`
        /* Full width page container on desktop up to 1600px */
        .team-detail-page-container {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 18px;
          padding: 0 0 20px 0;
          position: relative;
          box-sizing: border-box;
        }

        @media (min-width: 1024px) {
          .team-detail-page-container {
            gap: 22px;
            padding: 0 4px 28px 4px;
          }
        }

        @media (max-width: 640px) {
          .team-detail-page-container {
            gap: 14px;
            padding: 0 0 16px 0;
          }
        }

        /* Page Background Art Layer: Spans smoothly across top right of viewport */
        .team-detail-bg-art {
          position: absolute;
          top: -24px;
          right: -24px;
          width: min(calc(100% + 48px), 1250px);
          height: 250px;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
          opacity: 0.92;
          -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.35) 20%, rgba(0, 0, 0, 1) 45%, rgba(0, 0, 0, 1) 100%);
          mask-image: linear-gradient(to right, transparent 0%, rgba(0, 0, 0, 0.35) 20%, rgba(0, 0, 0, 1) 45%, rgba(0, 0, 0, 1) 100%);
        }

        @media (min-width: 1600px) {
          .team-detail-bg-art {
            top: -32px;
            right: -32px;
            width: min(calc(100% + 64px), 1450px);
            height: 280px;
          }
        }

        @media (max-width: 768px) {
          .team-detail-bg-art {
            top: -16px;
            right: -16px;
            width: clamp(280px, 85vw, 550px);
            height: 190px;
          }
        }

        /* Cherry blossom branch: Anchored to top right */
        .team-detail-sakura-branch {
          position: absolute;
          top: -24px;
          right: -24px;
          width: clamp(220px, 25vw, 420px);
          pointer-events: none;
          z-index: 1;
          user-select: none;
          opacity: 0.92;
        }

        @media (min-width: 1600px) {
          .team-detail-sakura-branch {
            top: -32px;
            right: -32px;
            width: clamp(280px, 24vw, 460px);
          }
        }

        @media (max-width: 768px) {
          .team-detail-sakura-branch {
            top: -16px;
            right: -16px;
            width: 200px;
          }
        }

        /* Drifting petals: Confined to branch area near top-right */
        .team-detail-petals {
          position: absolute;
          top: -24px;
          right: -24px;
          width: clamp(220px, 26vw, 380px);
          height: 220px;
          pointer-events: none;
          z-index: 1;
          user-select: none;
          overflow: hidden;
        }

        @media (min-width: 1600px) {
          .team-detail-petals {
            top: -32px;
            right: -32px;
          }
        }

        @media (max-width: 768px) {
          .team-detail-petals {
            top: -16px;
            right: -16px;
            width: 200px;
            height: 180px;
          }
        }

        /* Responsive Stat Cards Row */
        .team-detail-stats-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          width: 100%;
        }

        .team-stat-card-box {
          background: #FFFFFF;
          border-radius: 22px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          border-left: 4px solid var(--crimson);
          box-shadow: 0 2px 14px rgba(22, 22, 26, 0.04);
          padding: 20px 22px 18px 22px;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          min-height: 120px;
        }

        @media (max-width: 768px) {
          .team-detail-stats-row {
            gap: 8px !important;
          }
          .team-stat-card-box {
            padding: 14px 12px !important;
            border-radius: 16px !important;
            min-height: 105px !important;
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
          .team-roster-header-row {
            display: none !important;
          }
          .roster-col-progress {
            display: none !important;
          }
          .team-roster-member-row {
            padding: 10px 10px !important;
            gap: 10px !important;
          }
        }
      `}</style>

      {/* Shared SVG Defs for crisp Seigaiha wave pattern */}
      <svg
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <pattern
            id="team-seigaiha-pattern"
            width="60"
            height="30"
            patternUnits="userSpaceOnUse"
          >
            <g fill="none" stroke="#8A3B43" strokeWidth="1" strokeLinecap="round" opacity="0.32">
              {/* y = -15 */}
              <path d="M -60 -15 A 30 30 0 0 1 0 -15 M -54 -15 A 24 24 0 0 1 -6 -15 M -48 -15 A 18 18 0 0 1 -12 -15 M -42 -15 A 12 12 0 0 1 -18 -15 M -36 -15 A 6 6 0 0 1 -24 -15" />
              <path d="M 0 -15 A 30 30 0 0 1 60 -15 M 6 -15 A 24 24 0 0 1 54 -15 M 12 -15 A 18 18 0 0 1 48 -15 M 18 -15 A 12 12 0 0 1 42 -15 M 24 -15 A 6 6 0 0 1 36 -15" />
              <path d="M 60 -15 A 30 30 0 0 1 120 -15 M 66 -15 A 24 24 0 0 1 114 -15 M 72 -15 A 18 18 0 0 1 108 -15 M 78 -15 A 12 12 0 0 1 102 -15 M 84 -15 A 6 6 0 0 1 96 -15" />

              {/* y = 0 */}
              <path d="M -30 0 A 30 30 0 0 1 30 0 M -24 0 A 24 24 0 0 1 24 0 M -18 0 A 18 18 0 0 1 18 0 M -12 0 A 12 12 0 0 1 12 0 M -6 0 A 6 6 0 0 1 6 0" />
              <path d="M 30 0 A 30 30 0 0 1 90 0 M 36 0 A 24 24 0 0 1 84 0 M 42 0 A 18 18 0 0 1 78 0 M 48 0 A 12 12 0 0 1 72 0 M 54 0 A 6 6 0 0 1 66 0" />

              {/* y = 15 */}
              <path d="M -60 15 A 30 30 0 0 1 0 15 M -54 15 A 24 24 0 0 1 -6 15 M -48 15 A 18 18 0 0 1 -12 15 M -42 15 A 12 12 0 0 1 -18 15 M -36 15 A 6 6 0 0 1 -24 15" />
              <path d="M 0 15 A 30 30 0 0 1 60 15 M 6 15 A 24 24 0 0 1 54 15 M 12 15 A 18 18 0 0 1 48 15 M 18 15 A 12 12 0 0 1 42 15 M 24 15 A 6 6 0 0 1 36 15" />
              <path d="M 60 15 A 30 30 0 0 1 120 15 M 66 15 A 24 24 0 0 1 114 15 M 72 15 A 18 18 0 0 1 108 15 M 78 15 A 12 12 0 0 1 102 15 M 84 15 A 6 6 0 0 1 96 15" />

              {/* y = 30 */}
              <path d="M -30 30 A 30 30 0 0 1 30 30 M -24 30 A 24 24 0 0 1 24 30 M -18 30 A 18 18 0 0 1 18 30 M -12 30 A 12 12 0 0 1 12 30 M -6 30 A 6 6 0 0 1 6 30" />
              <path d="M 30 30 A 30 30 0 0 1 90 30 M 36 30 A 24 24 0 0 1 84 30 M 42 30 A 18 18 0 0 1 78 30 M 48 30 A 12 12 0 0 1 72 30 M 54 30 A 6 6 0 0 1 66 30" />

              {/* y = 45 */}
              <path d="M -60 45 A 30 30 0 0 1 0 45 M -54 45 A 24 24 0 0 1 -6 45 M -48 45 A 18 18 0 0 1 -12 45 M -42 45 A 12 12 0 0 1 -18 45 M -36 45 A 6 6 0 0 1 -24 45" />
              <path d="M 0 45 A 30 30 0 0 1 60 45 M 6 45 A 24 24 0 0 1 54 45 M 12 45 A 18 18 0 0 1 48 45 M 18 45 A 12 12 0 0 1 42 45 M 24 45 A 6 6 0 0 1 36 45" />
              <path d="M 60 45 A 30 30 0 0 1 120 45 M 66 45 A 24 24 0 0 1 114 45 M 72 45 A 18 18 0 0 1 108 45 M 78 45 A 12 12 0 0 1 102 45 M 84 45 A 6 6 0 0 1 96 45" />
            </g>
          </pattern>
        </defs>
      </svg>

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

      {/* Falling sakura petals overlay (confined strictly to top-right branch area) */}
      <img
        src="/assets/art/falling-petals.svg"
        alt=""
        aria-hidden="true"
        className="team-detail-petals"
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
          padding: "22px 28px",
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
              top: 0,
              bottom: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "right center",
              opacity: 0.92,
            }}
          />
          {/* Subtle gradient vignette to keep text on left ultra crisp */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to right, #141416 0%, #141416 28%, rgba(20, 20, 22, 0.85) 48%, rgba(20, 20, 22, 0.25) 75%, rgba(20, 20, 22, 0.05) 100%)",
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
                fontSize: "clamp(22px, 3.4vw, 30px)",
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
                  fontSize: "clamp(30px, 4.2vw, 40px)",
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
            borderLeft: "4px solid var(--crimson)",
          }}
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "var(--font-body)",
                fontSize: "clamp(10px, 0.9vw, 11.5px)",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#5A5A62",
                lineHeight: 1.25,
              }}
              className="team-stat-lbl-text"
            >
              <Users size={14} color="#5A5A62" strokeWidth={2.2} style={{ flexShrink: 0 }} />
              <span>CAMPUS STANDING</span>
            </div>
            <div
              className="team-stat-main-num tabular-nums"
              style={{
                fontFamily: "var(--font-numeric)",
                fontSize: "clamp(28px, 3.2vw, 40px)",
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
              position: "relative",
              zIndex: 1,
              fontSize: "clamp(11.5px, 0.95vw, 13px)",
              fontWeight: 500,
              fontFamily: "var(--font-body)",
              color: "var(--muted)",
              marginTop: 6,
            }}
          >
            of {sameTypeCount} {isOfficial ? "teams" : "groups"}
          </div>

          {/* Crisp, subtle Seigaiha wave pattern in bottom-right corner with smooth gradient fade */}
          <div
            className="team-stat-seigaiha-corner"
            aria-hidden="true"
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: "55%",
              height: "70%",
              maxWidth: 160,
              maxHeight: 90,
              pointerEvents: "none",
              overflow: "hidden",
              WebkitMaskImage: "linear-gradient(135deg, transparent 20%, rgba(0, 0, 0, 0.35) 60%, rgba(0, 0, 0, 0.95) 100%)",
              maskImage: "linear-gradient(135deg, transparent 20%, rgba(0, 0, 0, 0.35) 60%, rgba(0, 0, 0, 0.95) 100%)",
              zIndex: 0,
            }}
          >
            <svg width="100%" height="100%" aria-hidden="true">
              <rect width="100%" height="100%" fill="url(#team-seigaiha-pattern)" />
            </svg>
          </div>
        </div>

        {/* Stat Card 2: Points to Overtake / Lead Margin */}
        <div
          className="team-stat-card-box"
          style={{
            borderLeft: "4px solid var(--crimson)",
          }}
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "var(--font-body)",
                fontSize: "clamp(9.5px, 0.85vw, 11px)",
                fontWeight: 700,
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                color: "#5A5A62",
                lineHeight: 1.25,
              }}
              className="team-stat-lbl-text"
            >
              <Trophy size={14} color="#5A5A62" strokeWidth={2.2} style={{ flexShrink: 0 }} />
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
                fontSize: "clamp(28px, 3.2vw, 40px)",
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

          {/* Crisp, subtle Seigaiha wave pattern in bottom-right corner with smooth gradient fade */}
          <div
            className="team-stat-seigaiha-corner"
            aria-hidden="true"
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: "55%",
              height: "70%",
              maxWidth: 160,
              maxHeight: 90,
              pointerEvents: "none",
              overflow: "hidden",
              WebkitMaskImage: "linear-gradient(135deg, transparent 20%, rgba(0, 0, 0, 0.35) 60%, rgba(0, 0, 0, 0.95) 100%)",
              maskImage: "linear-gradient(135deg, transparent 20%, rgba(0, 0, 0, 0.35) 60%, rgba(0, 0, 0, 0.95) 100%)",
              zIndex: 0,
            }}
          >
            <svg width="100%" height="100%" aria-hidden="true">
              <rect width="100%" height="100%" fill="url(#team-seigaiha-pattern)" />
            </svg>
          </div>
        </div>

        {/* Stat Card 3: Roster Engagement */}
        <div
          className="team-stat-card-box"
          style={{
            borderLeft: "4px solid var(--crimson)",
          }}
        >
          <div style={{ position: "relative", zIndex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "var(--font-body)",
                fontSize: "clamp(10px, 0.9vw, 11.5px)",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                color: "#5A5A62",
                lineHeight: 1.25,
              }}
              className="team-stat-lbl-text"
            >
              <TrendingUp size={14} color="#5A5A62" strokeWidth={2.2} style={{ flexShrink: 0 }} />
              <span>ROSTER ENGAGEMENT</span>
            </div>
            <div
              className="team-stat-main-num tabular-nums"
              style={{
                fontFamily: "var(--font-numeric)",
                fontSize: "clamp(28px, 3.2vw, 40px)",
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
              position: "relative",
              zIndex: 1,
              fontSize: "clamp(11.5px, 0.95vw, 13px)",
              fontWeight: 500,
              fontFamily: "var(--font-body)",
              color: "var(--muted)",
              marginTop: 6,
            }}
          >
            {rosterPct}% active this week
          </div>

          {/* Crisp, subtle Seigaiha wave pattern in bottom-right corner with smooth gradient fade */}
          <div
            className="team-stat-seigaiha-corner"
            aria-hidden="true"
            style={{
              position: "absolute",
              right: 0,
              bottom: 0,
              width: "55%",
              height: "70%",
              maxWidth: 160,
              maxHeight: 90,
              pointerEvents: "none",
              overflow: "hidden",
              WebkitMaskImage: "linear-gradient(135deg, transparent 20%, rgba(0, 0, 0, 0.35) 60%, rgba(0, 0, 0, 0.95) 100%)",
              maskImage: "linear-gradient(135deg, transparent 20%, rgba(0, 0, 0, 0.35) 60%, rgba(0, 0, 0, 0.95) 100%)",
              zIndex: 0,
            }}
          >
            <svg width="100%" height="100%" aria-hidden="true">
              <rect width="100%" height="100%" fill="url(#team-seigaiha-pattern)" />
            </svg>
          </div>
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
          padding: "22px 24px 18px 24px",
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
            marginBottom: 18,
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

        {/* Desktop Table Column Headers */}
        <div
          className="team-roster-header-row"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px 10px 16px",
            borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
            marginBottom: 6,
            fontFamily: "var(--font-body)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "var(--muted)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <span style={{ width: 28, textAlign: "center" }}>#</span>
            <span style={{ marginLeft: 38 }}>WARRIOR</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span className="roster-col-progress" style={{ width: 110, textAlign: "left" }}>
              PROGRESS
            </span>
            <span style={{ width: 44, textAlign: "right" }}>SHARE</span>
            <span style={{ width: 115, textAlign: "right" }}>KARMA</span>
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
                  className={`team-roster-member-row ${isFirst ? "is-first-rank" : ""}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    padding: isFirst ? "14px 16px" : "12px 16px",
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
                  <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0, flex: 1 }}>
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

                    {/* Name & Email (No truncation on desktop, clean wrapping without cutoff) */}
                    <div style={{ minWidth: 0, flex: 1, paddingRight: 8 }}>
                      <div
                        style={{
                          fontSize: "clamp(13px, 1.05vw, 15px)",
                          fontWeight: 700,
                          fontFamily: "var(--font-body)",
                          color: "var(--ink)",
                          wordBreak: "break-word",
                          lineHeight: 1.25,
                        }}
                      >
                        {mem.name}
                      </div>
                      <div
                        style={{
                          fontSize: "clamp(11px, 0.85vw, 12px)",
                          color: "var(--muted)",
                          fontFamily: "var(--font-body)",
                          wordBreak: "break-word",
                          marginTop: 2,
                        }}
                      >
                        {mem.muid || `${mem.name.toLowerCase().replace(/\s+/g, "")}@mulearn`}
                      </div>
                    </div>
                  </div>

                  {/* Right: Progress Bar + Percentage + Karma with strict column alignment */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 20,
                      flexShrink: 0,
                    }}
                  >
                    {/* Progress Bar (Hidden on mobile < 640px) */}
                    <div
                      className="roster-col-progress"
                      style={{
                        width: 110,
                        height: 6,
                        borderRadius: 9999,
                        background: "#E2E8F0",
                        overflow: "hidden",
                        flexShrink: 0,
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

                    {/* Percentage Column */}
                    <span
                      className="tabular-nums"
                      style={{
                        fontSize: "clamp(11.5px, 0.9vw, 13px)",
                        fontWeight: 600,
                        fontFamily: "var(--font-numeric)",
                        color: isFirst ? "var(--gold)" : "var(--muted)",
                        width: 44,
                        textAlign: "right",
                        flexShrink: 0,
                      }}
                    >
                      {sharePct}%
                    </span>

                    {/* Bold Karma Value */}
                    <div
                      className="tabular-nums"
                      style={{
                        fontSize: "clamp(12.5px, 0.95vw, 14.5px)",
                        fontWeight: 800,
                        fontFamily: "var(--font-numeric)",
                        color: isFirst ? "var(--gold)" : "var(--ink)",
                        width: 115,
                        textAlign: "right",
                        flexShrink: 0,
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
