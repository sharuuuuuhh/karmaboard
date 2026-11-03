import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Crown,
  Trophy,
  Users,
  ChevronRight,
} from "lucide-react";
import PageHeader from "../components/shell/PageHeader";
import PageGrid, { PageCol } from "../components/common/PageGrid";
import PeriodCalendarPopover from "../components/common/PeriodCalendarPopover";
import { karmaStore } from "../data/karmaStore";
import { getWeekBoundaries, getMonthBoundaries } from "../utils/dateUtils";
import { getGroupToken, isOfficialTeam } from "../utils/groupTokens";
import Crest from "../crests";

export default function LeaderboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialView =
    searchParams.get("view") === "teams" || searchParams.get("view") === "groups"
      ? "groups"
      : "individuals";
  const [view, setView] = useState(initialView);

  const initialFilter = ["all", "teams", "groups"].includes(searchParams.get("filter"))
    ? searchParams.get("filter")
    : "all";
  const [filter, setFilter] = useState(initialFilter);

  const handleFilterSelect = (newFilter) => {
    setFilter(newFilter);
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        if (newFilter === "all") {
          p.delete("filter");
        } else {
          p.set("filter", newFilter);
        }
        return p;
      },
      { replace: true }
    );
  };

  const handleViewSelect = (newView) => {
    setView(newView);
    setSearchParams(
      (prev) => {
        const p = new URLSearchParams(prev);
        p.set("view", newView === "groups" ? "teams" : "individuals");
        return p;
      },
      { replace: true }
    );
  };
  const [period, setPeriod] = useState("month"); // 'month' | 'all'
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [dataVersion, setDataVersion] = useState(0);

  useEffect(() => {
    const unsub = karmaStore.subscribe(() => {
      setDataVersion((v) => v + 1);
    });
    return unsub;
  }, []);

  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
    setOffset(0);
  };

  const periodLabel = useMemo(() => {
    if (period === "all") return "All Time";
    if (period === "week") {
      const b = getWeekBoundaries(offset);
      return b.label;
    }
    const b = getMonthBoundaries(offset);
    return b.label;
  }, [period, offset]);

  const standings = useMemo(() => {
    return karmaStore.getLeaderboard
      ? karmaStore.getLeaderboard({
          period,
          view,
          weekOffset: period === "week" ? offset : 0,
          monthOffset: period === "month" ? offset : 0,
        })
      : [];
  }, [period, view, offset, dataVersion]);

  // Group standings for the right-hand sidebar
  const groupStandings = useMemo(() => {
    return karmaStore.getLeaderboard
      ? karmaStore.getLeaderboard({
          period,
          view: "groups",
          weekOffset: period === "week" ? offset : 0,
          monthOffset: period === "month" ? offset : 0,
        })
      : [];
  }, [period, offset, dataVersion]);

  // Counts for All, Teams, and Groups filters
  const filterCounts = useMemo(() => {
    const isTeam = (item) =>
      view === "individuals"
        ? isOfficialTeam(item.group_name || item.group_id)
        : isOfficialTeam(item);
    const teamsCount = standings.filter(isTeam).length;
    const groupsCount = standings.filter((item) => !isTeam(item)).length;
    return {
      all: standings.length,
      teams: teamsCount,
      groups: groupsCount,
    };
  }, [standings, view]);

  // Filter standings by category: all | teams | groups
  const categoryStandings = useMemo(() => {
    if (filter === "teams") {
      return standings.filter((item) =>
        view === "individuals"
          ? isOfficialTeam(item.group_name || item.group_id)
          : isOfficialTeam(item)
      );
    }
    if (filter === "groups") {
      return standings.filter((item) =>
        view === "individuals"
          ? !isOfficialTeam(item.group_name || item.group_id)
          : !isOfficialTeam(item)
      );
    }
    return standings;
  }, [standings, filter, view]);

  const filteredStandings = useMemo(() => {
    if (!search.trim()) return categoryStandings;
    const q = search.toLowerCase().trim();
    return categoryStandings.filter((item) => {
      const name = (item.name || "").toLowerCase();
      const muid = (item.muid || "").toLowerCase();
      const grp = (item.group_name || item.group_id || "").toLowerCase();
      return name.includes(q) || muid.includes(q) || grp.includes(q);
    });
  }, [categoryStandings, search]);

  // Group standings filtered for sidebar
  const displayedGroupStandings = useMemo(() => {
    if (filter === "teams") return groupStandings.filter((g) => isOfficialTeam(g));
    if (filter === "groups") return groupStandings.filter((g) => !isOfficialTeam(g));
    return groupStandings;
  }, [groupStandings, filter]);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const getTeamBorderColor = (teamName, rank) => {
    const norm = String(teamName || "").toLowerCase();
    if (norm.includes("tech")) return "var(--gold)";
    if (norm.includes("market")) return "var(--green)";
    if (norm.includes("operat")) return "#4F46E5";
    if (norm.includes("lead")) return "var(--crimson)";
    if (norm.includes("creativ")) return "#0EA5E9";
    if (norm.includes("media")) return "#71717A";
    if (norm.includes("content")) return "#D97706";
    if (norm.includes("muniverse")) return "#C9A227";
    if (norm.includes("infinitea")) return "#6366F1";
    if (norm.includes("sfc")) return "#8B5CF6";
    if (norm.includes("muverse")) return "#EC4899";
    if (rank === 1) return "var(--gold)";
    if (rank === 2) return "var(--green)";
    if (rank === 3) return "#4F46E5";
    if (rank === 4) return "var(--crimson)";
    return "#DCD7CC";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @media (max-width: 640px) {
          .leaderboard-controls-wrap {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .leaderboard-search-input-wrap {
            max-width: 100% !important;
            width: 100% !important;
          }
          .hide-on-mobile {
            display: none !important;
          }
          .leaderboard-table-scroll {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            max-height: none !important;
            overflow-y: visible !important;
          }
        }
      `}</style>

      {/* Page Header with Japanese Sumi-e Artwork Banner and Period Popover on Right */}
      <PageHeader
        title="Leaderboard"
        subtitle={`Standings across all teams and campus warriors • ${periodLabel}`}
        showJapaneseBanner={true}
        rightActions={
          <PeriodCalendarPopover
            period={period}
            offset={offset}
            dateLabel={periodLabel}
            onPeriodChange={handlePeriodChange}
            onOffsetChange={(newOffset) => setOffset(newOffset)}
            onDateSelect={(selectedDate) => {
              const now = new Date();
              const monthDiff =
                (selectedDate.getFullYear() - now.getFullYear()) * 12 +
                (selectedDate.getMonth() - now.getMonth());
              setOffset(Math.min(0, monthDiff));
            }}
          />
        }
      />

      <PageGrid gap={20}>
        {/* Left Zone (Span 8): Main Table Card */}
        <PageCol span={8} spanLg={8} spanMd={2} spanSm={1}>
          <div
            style={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-card)",
              boxShadow: "var(--shadow-soft)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Table Control Header */}
            <div
              className="leaderboard-controls-wrap"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                padding: "16px 20px",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {/* Left Controls: 3 Filter Tabs + View Switcher */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {/* 3 Sorts / Filters: All, Teams, Groups */}
                <div
                  role="tablist"
                  aria-label="Filter leaderboard"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {[
                    { id: "all", label: "All", count: filterCounts.all },
                    { id: "teams", label: "Teams", count: filterCounts.teams },
                    { id: "groups", label: "Groups", count: filterCounts.groups },
                  ].map((opt) => {
                    const isActive = filter === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        onClick={() => handleFilterSelect(opt.id)}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "var(--radius-pill)",
                          fontSize: 12.5,
                          fontWeight: 600,
                          fontFamily: "var(--font-body)",
                          color: isActive ? "#FFFFFF" : "var(--muted)",
                          background: isActive ? "var(--ink)" : "#FFFFFF",
                          border: isActive ? "1px solid var(--ink)" : "1px solid var(--border)",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 6,
                          boxShadow: isActive ? "0 1px 3px rgba(0, 0, 0, 0.12)" : "none",
                          transition: "all 150ms ease",
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.borderColor = "#CCC6BA";
                            e.currentTarget.style.color = "var(--ink)";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.borderColor = "var(--border)";
                            e.currentTarget.style.color = "var(--muted)";
                          }
                        }}
                      >
                        <span>{opt.label}</span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            fontFamily: "var(--font-numeric)",
                            padding: "1px 6px",
                            borderRadius: "var(--radius-pill)",
                            background: isActive ? "rgba(255, 255, 255, 0.2)" : "#F0EDE6",
                            color: isActive ? "#FFFFFF" : "var(--muted)",
                          }}
                        >
                          {opt.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* View Switcher: Warriors vs Teams */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                    background: "#F4F1EA",
                    padding: 3,
                    borderRadius: "var(--radius-pill)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleViewSelect("individuals")}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "var(--radius-pill)",
                      fontSize: 12,
                      fontWeight: view === "individuals" ? 700 : 500,
                      fontFamily: "var(--font-body)",
                      color: view === "individuals" ? "var(--ink)" : "var(--muted)",
                      background: view === "individuals" ? "#FFFFFF" : "transparent",
                      boxShadow: view === "individuals" ? "0 1px 2px rgba(0, 0, 0, 0.08)" : "none",
                      border: "none",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      transition: "all 150ms ease",
                    }}
                  >
                    <Trophy size={13} />
                    <span>Warriors</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleViewSelect("groups")}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "var(--radius-pill)",
                      fontSize: 12,
                      fontWeight: view === "groups" ? 700 : 500,
                      fontFamily: "var(--font-body)",
                      color: view === "groups" ? "var(--ink)" : "var(--muted)",
                      background: view === "groups" ? "#FFFFFF" : "transparent",
                      boxShadow: view === "groups" ? "0 1px 2px rgba(0, 0, 0, 0.08)" : "none",
                      border: "none",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      transition: "all 150ms ease",
                    }}
                  >
                    <Users size={13} />
                    <span>Teams</span>
                  </button>
                </div>
              </div>

              {/* Search Filter */}
              <div
                className="leaderboard-search-input-wrap"
                style={{ position: "relative", minWidth: 200, flex: 1, maxWidth: 300 }}
              >
                <Search
                  size={14}
                  color="var(--muted)"
                  style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  type="text"
                  placeholder="Filter by name, muid or team..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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

            {/* Scrollable Table Area */}
            <div
              className="custom-scrollbar leaderboard-table-scroll"
              style={{
                maxHeight: "calc(100vh - 240px)",
                overflowY: "auto",
                overflowX: "auto",
              }}
            >
              {filteredStandings.length === 0 ? (
                <div style={{ padding: "60px 16px", textAlign: "center", color: "var(--muted)", fontSize: 13, fontFamily: "var(--font-body)" }}>
                  No matches found for this period.
                </div>
              ) : view === "individuals" ? (
                <table className="clean-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 520 }}>
                  <thead
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      background: "#FFFFFF",
                      boxShadow: "0 1px 0 var(--border)",
                    }}
                  >
                    <tr style={{ height: 40 }}>
                      <th style={{ width: 64, padding: "8px 16px", fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase", textAlign: "left" }}>Rank</th>
                      <th style={{ padding: "8px 16px", fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase", textAlign: "left" }}>Warrior</th>
                      <th style={{ width: 160, padding: "8px 16px", fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase", textAlign: "left" }}>Team</th>
                      <th style={{ textAlign: "right", padding: "8px 16px", fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Karma</th>
                      <th className="hide-on-mobile" style={{ width: 80, textAlign: "center", padding: "8px 12px", fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Streak</th>
                      <th className="hide-on-mobile" style={{ width: 70, textAlign: "center", padding: "8px 12px", fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStandings.map((mem, idx) => {
                      const token = getGroupToken(mem.group_name || mem.group_id);
                      const rankNum = idx + 1;
                      const changeVal = mem.movement || 0;
                      const streakCount =
                        typeof mem.streak === "object"
                          ? mem.streak?.currentStreak || 0
                          : typeof mem.streak === "number"
                          ? mem.streak
                          : 0;

                      const rankColor =
                        rankNum === 1
                          ? "var(--gold)"
                          : rankNum === 3
                          ? "var(--crimson)"
                          : rankNum === 2
                          ? "var(--muted)"
                          : "var(--ink)";

                      return (
                        <tr
                          key={mem.muid || idx}
                          style={{
                            height: 56,
                            borderBottom: "1px solid var(--border)",
                            transition: "background 150ms ease",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#FAF8F4")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <td
                            className="tabular-nums"
                            style={{
                              padding: "8px 16px",
                              fontSize: 13,
                              fontWeight: 700,
                              fontFamily: "var(--font-numeric)",
                              color: rankColor,
                            }}
                          >
                            #{rankNum}
                          </td>

                          <td style={{ padding: "8px 16px" }}>
                            <Link
                              to={`/u/${encodeURIComponent(mem.muid)}`}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                textDecoration: "none",
                                color: "inherit",
                              }}
                            >
                              <div
                                style={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: "50%",
                                  background: "#F0ECE4",
                                  color: "var(--ink)",
                                  fontSize: 11.5,
                                  fontWeight: 700,
                                  fontFamily: "var(--font-body)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                {getInitials(mem.name)}
                              </div>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                  <span
                                    style={{
                                      fontSize: 13.5,
                                      fontWeight: 700,
                                      fontFamily: "var(--font-body)",
                                      color: "var(--ink)",
                                      whiteSpace: "nowrap",
                                    }}
                                  >
                                    {mem.name}
                                  </span>
                                  {mem.is_group_mvp && (
                                    <Crown size={12} color="var(--gold)" fill="currentColor" />
                                  )}
                                </div>
                                <div
                                  style={{
                                    fontSize: 11.5,
                                    color: "var(--muted)",
                                    fontFamily: "var(--font-body)",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {mem.muid}
                                </div>
                              </div>
                            </Link>
                          </td>

                          {/* Team Crest + Team Name */}
                          <td style={{ padding: "8px 16px" }}>
                            <Link
                              to={`/groups/${mem.group_name || mem.group_id}`}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 10,
                                textDecoration: "none",
                              }}
                            >
                              <div style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Crest group={mem.group_name || mem.group_id} size="xs" />
                              </div>
                              <span
                                style={{
                                  fontSize: 12.5,
                                  fontWeight: 700,
                                  fontFamily: "var(--font-display)",
                                  letterSpacing: "-0.01em",
                                  color: "var(--ink)",
                                  textTransform: "uppercase",
                                }}
                              >
                                {token.name}
                              </span>
                            </Link>
                          </td>

                          {/* Karma */}
                          <td
                            className="tabular-nums"
                            style={{
                              padding: "8px 16px",
                              textAlign: "right",
                              fontSize: 13.5,
                              fontWeight: 700,
                              fontFamily: "var(--font-numeric)",
                              color: "var(--ink)",
                            }}
                          >
                            {(mem.karma || 0).toLocaleString()}
                          </td>

                          {/* Streak */}
                          <td className="hide-on-mobile" style={{ textAlign: "center", padding: "8px 12px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 3,
                                fontSize: 12,
                                fontWeight: 700,
                                fontFamily: "var(--font-numeric)",
                                color: "#D97706",
                              }}
                            >
                              <Flame size={12} fill="#D97706" />
                              <span>{streakCount}d</span>
                            </span>
                          </td>

                          {/* Trend */}
                          <td className="hide-on-mobile" style={{ textAlign: "center", padding: "8px 12px" }}>
                            {changeVal > 0 ? (
                              <span style={{ color: "var(--green)", display: "inline-flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 700, fontFamily: "var(--font-numeric)" }}>
                                <ArrowUpRight size={13} />
                                <span>{changeVal}</span>
                              </span>
                            ) : changeVal < 0 ? (
                              <span style={{ color: "var(--crimson)", display: "inline-flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 700, fontFamily: "var(--font-numeric)" }}>
                                <ArrowDownRight size={13} />
                                <span>{Math.abs(changeVal)}</span>
                              </span>
                            ) : (
                              <span style={{ color: "var(--muted)", fontSize: 13 }}>—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                /* Groups / Teams View Table */
                <table className="clean-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 460 }}>
                  <thead
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      background: "#FFFFFF",
                      boxShadow: "0 1px 0 var(--border)",
                    }}
                  >
                    <tr style={{ height: 40 }}>
                      <th style={{ width: 64, padding: "8px 16px", fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase", textAlign: "left" }}>Rank</th>
                      <th style={{ padding: "8px 16px", fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase", textAlign: "left" }}>Team</th>
                      <th style={{ padding: "8px 16px", fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase", textAlign: "left" }}>Margin / Gap</th>
                      <th className="hide-on-mobile" style={{ width: 100, textAlign: "center", padding: "8px 12px", fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Members</th>
                      <th style={{ textAlign: "right", padding: "8px 16px", fontSize: 11, fontWeight: 600, color: "var(--muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Total Karma</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStandings.map((grp, idx) => {
                      const token = getGroupToken(grp);
                      const rank = idx + 1;
                      const nextGrp = idx > 0 ? filteredStandings[idx - 1] : null;
                      const prevGrp = idx < filteredStandings.length - 1 ? filteredStandings[idx + 1] : null;

                      let gapText = "";
                      if (idx === 0 && prevGrp) {
                        const diff = (grp.karma || 0) - (prevGrp.karma || 0);
                        gapText = diff > 0 ? `+${diff.toLocaleString()} ahead of #2` : "Tied";
                      } else if (idx > 0 && nextGrp) {
                        const diff = (nextGrp.karma || 0) - (grp.karma || 0);
                        gapText = diff > 0 ? `${diff.toLocaleString()} behind #${idx}` : "Tied";
                      }

                      const borderColor = getTeamBorderColor(grp.name || grp.id, rank);

                      return (
                        <tr
                          key={grp.id || grp.name || idx}
                          style={{
                            height: 56,
                            borderBottom: "1px solid var(--border)",
                            background: rank === 1 ? "var(--gold-tint)" : "transparent",
                            transition: "background 150ms ease",
                          }}
                          onMouseEnter={(e) => {
                            if (rank !== 1) e.currentTarget.style.background = "#FAF8F4";
                          }}
                          onMouseLeave={(e) => {
                            if (rank !== 1) e.currentTarget.style.background = "transparent";
                          }}
                        >
                          <td
                            className="tabular-nums"
                            style={{
                              padding: "8px 16px",
                              fontSize: 13,
                              fontWeight: 700,
                              fontFamily: "var(--font-numeric)",
                              color: rank === 1 ? "var(--gold)" : "var(--ink)",
                            }}
                          >
                            #{rank}
                          </td>

                          <td style={{ padding: "8px 16px" }}>
                            <Link
                              to={`/groups/${grp.slug || grp.id || grp.name}`}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 12,
                                textDecoration: "none",
                                color: "inherit",
                              }}
                            >
                              <div style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                <Crest group={grp} size="xs" />
                              </div>
                              <span
                                style={{
                                  fontSize: 13.5,
                                  fontWeight: 800,
                                  color: "var(--ink)",
                                  fontFamily: "var(--font-display)",
                                  letterSpacing: "-0.01em",
                                  textTransform: "uppercase",
                                }}
                              >
                                {token.name}
                              </span>
                            </Link>
                          </td>

                          <td style={{ padding: "8px 16px" }}>
                            <span
                              style={{
                                fontSize: 12,
                                fontWeight: 600,
                                color: "var(--muted)",
                                fontFamily: "var(--font-body)",
                              }}
                            >
                              {gapText || "Tied"}
                            </span>
                          </td>

                          <td className="hide-on-mobile" style={{ textAlign: "center", padding: "8px 12px", fontSize: 12, fontWeight: 600, color: "var(--muted)", fontFamily: "var(--font-body)" }}>
                            {grp.member_count || grp.members_count || 6} warriors
                          </td>

                          <td
                            className="tabular-nums"
                            style={{
                              padding: "8px 16px",
                              textAlign: "right",
                              fontSize: 13.5,
                              fontWeight: 700,
                              fontFamily: "var(--font-numeric)",
                              color: rank === 1 ? "var(--gold)" : "var(--ink)",
                            }}
                          >
                            {(grp.karma || 0).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </PageCol>

        {/* Right Zone (Span 4): TEAM STANDINGS Card with Subtle Sumi-e Wash */}
        <PageCol span={4} spanLg={4} spanMd={2} spanSm={1}>
          <div
            style={{
              position: "sticky",
              top: 24,
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-card)",
              padding: "22px 20px",
              boxShadow: "var(--shadow-soft)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Header: Title + All Teams Link */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 16,
                position: "relative",
                zIndex: 1,
              }}
            >
              <span
                style={{
                  fontSize: 13.5,
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  color: "var(--ink)",
                  letterSpacing: "-0.01em",
                  textTransform: "uppercase",
                }}
              >
                Team Standings
              </span>

              <Link
                to={filter === "all" ? "/groups" : `/groups?filter=${filter}`}
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  fontFamily: "var(--font-body)",
                  color: "var(--crimson)",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  transition: "opacity 150ms ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              >
                <span>{filter === "teams" ? "All 7 Teams" : filter === "groups" ? "All 9 Groups" : "All Teams"}</span>
                <ChevronRight size={13} />
              </Link>
            </div>

            {/* List of Teams with 3px left border and Rank #1 highlight */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                position: "relative",
                zIndex: 1,
              }}
            >
              {displayedGroupStandings.map((grp, idx) => {
                const rank = idx + 1;
                const isRank1 = rank === 1;
                const token = getGroupToken(grp);
                const borderColor = getTeamBorderColor(token.name || grp.name || grp.id, rank);
                const nextGrp = idx > 0 ? displayedGroupStandings[idx - 1] : null;
                const prevGrp = idx < displayedGroupStandings.length - 1 ? displayedGroupStandings[idx + 1] : null;

                let gapText = "Tied";
                if (idx === 0 && prevGrp) {
                  const diff = (grp.karma || 0) - (prevGrp.karma || 0);
                  gapText = diff > 0 ? `+${diff} ahead` : "Tied";
                } else if (idx > 0 && nextGrp) {
                  const diff = (nextGrp.karma || 0) - (grp.karma || 0);
                  gapText = diff > 0 ? `-${diff} pts` : "Tied";
                }

                return (
                  <Link
                    key={grp.id || grp.name || idx}
                    to={`/groups/${grp.slug || grp.id || grp.name}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px 8px 10px",
                      borderRadius: 8,
                      background: isRank1 ? "var(--gold-tint)" : "#FAF9F6",
                      borderLeft: `3px solid ${borderColor}`,
                      textDecoration: "none",
                      transition: "background 150ms ease, transform 150ms ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = isRank1 ? "#F7E9C6" : "#F3F0EA";
                      e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = isRank1 ? "var(--gold-tint)" : "#FAF9F6";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Left: Rank + Crest + Name + Status */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                      <span
                        className="tabular-nums"
                        style={{
                          fontSize: 12.5,
                          fontWeight: 700,
                          fontFamily: "var(--font-numeric)",
                          color: isRank1 ? "var(--gold)" : "var(--ink)",
                          width: 22,
                          flexShrink: 0,
                        }}
                      >
                        #{rank}
                      </span>

                      <div
                        style={{
                          width: 26,
                          height: 26,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Crest group={grp} size="xs" />
                      </div>

                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: "var(--font-display)",
                            fontWeight: 800,
                            fontSize: 12.5,
                            color: "var(--ink)",
                            letterSpacing: "-0.01em",
                            textTransform: "uppercase",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {token.name}
                        </div>
                        <div
                          style={{
                            fontSize: 10.5,
                            fontWeight: 500,
                            fontFamily: "var(--font-body)",
                            color: "var(--muted)",
                          }}
                        >
                          {gapText}
                        </div>
                      </div>
                    </div>

                    {/* Right: Points */}
                    <span
                      className="tabular-nums"
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        fontFamily: "var(--font-numeric)",
                        color: isRank1 ? "var(--gold)" : "var(--ink)",
                        marginLeft: 8,
                        flexShrink: 0,
                      }}
                    >
                      {(grp.karma || 0).toLocaleString()}
                    </span>
                  </Link>
                );
              })}
            </div>

            {/* Subtle Sumi-e Misty Mountain Silhouette in bottom-right */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                right: -30,
                bottom: -20,
                width: 240,
                height: 140,
                opacity: 0.12,
                pointerEvents: "none",
                zIndex: 0,
                overflow: "hidden",
                mixBlendMode: "multiply",
              }}
            >
              <img
                src="/assets/art/empty-state.webp"
                alt=""
                aria-hidden="true"
                width={1200}
                height={600}
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
          </div>
        </PageCol>
      </PageGrid>
    </div>
  );
}
