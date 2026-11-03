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
  Medal,
  ChevronRight,
} from "lucide-react";
import PageHeader from "../components/shell/PageHeader";
import PageGrid, { PageCol } from "../components/common/PageGrid";
import PeriodCalendarPopover from "../components/common/PeriodCalendarPopover";
import { karmaStore } from "../data/karmaStore";
import { getWeekBoundaries, getMonthBoundaries } from "../utils/dateUtils";
import { getGroupToken, isOfficialTeam } from "../utils/groupTokens";
import { formatRankLabel } from "../utils/dashboardHelpers";
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
  const [period, setPeriod] = useState("week"); // 'week' | 'month' | 'all'
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

  // Top 3 for Podium
  const activeStandings = filteredStandings.filter((item) => (item.karma || 0) > 0);
  const topThree = activeStandings.slice(0, 3);

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
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

      {/* Page Header with Time Period Selector at TOP for both Desktop and Mobile */}
      <PageHeader
        title="Leaderboard"
        subtitle={`Standings across all teams and campus warriors • ${periodLabel}`}
        centerActions={true}
        rightActions={
          <PeriodCalendarPopover
            period={period}
            offset={offset}
            dateLabel={periodLabel}
            onPeriodChange={handlePeriodChange}
            onOffsetChange={(newOffset) => setOffset(newOffset)}
            onDateSelect={(selectedDate) => {
              const now = new Date();
              if (period === "month") {
                const monthDiff =
                  (selectedDate.getFullYear() - now.getFullYear()) * 12 +
                  (selectedDate.getMonth() - now.getMonth());
                setOffset(Math.min(0, monthDiff));
              } else if (period === "week") {
                const msPerWeek = 7 * 24 * 60 * 60 * 1000;
                const weekDiff = Math.round(
                  (selectedDate.getTime() - now.getTime()) / msPerWeek
                );
                setOffset(Math.min(0, weekDiff));
              }
            }}
          />
        }
      />

      <PageGrid gap={20}>
        {/* Left Zone (Span 8): Main Table with Sticky Headers & Dense 52px rows */}
        <PageCol col={12} colLg={8}>
          <div
            style={{
              background: "#FFFFFF",
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
                background: "#FAFAFA",
              }}
            >
              {/* Left Controls: 3 Sorts (All, Teams, Groups) + View Switcher (Warriors vs Teams) */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                {/* 3 Sorts / Filters: All, Teams, Groups */}
                <div
                  role="tablist"
                  aria-label="Filter leaderboard"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    background: "#FFFFFF",
                    borderRadius: "var(--radius-pill)",
                    padding: 3,
                    border: "1px solid var(--border)",
                    boxShadow: "var(--shadow-soft)",
                    gap: 3,
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
                          fontSize: 13,
                          fontWeight: isActive ? 700 : 500,
                          color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                          background: isActive ? "var(--surface-subtle)" : "transparent",
                          boxShadow: isActive ? "0 1px 3px rgba(0, 0, 0, 0.06)" : "none",
                          border: isActive ? "1px solid var(--border-strong)" : "1px solid transparent",
                          cursor: "pointer",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 7,
                          transition: "all 0.18s cubic-bezier(0.16, 1, 0.3, 1)",
                        }}
                      >
                        <span>{opt.label}</span>
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "1px 6px",
                            borderRadius: "var(--radius-pill)",
                            background: isActive ? "#FFFFFF" : "rgba(0, 0, 0, 0.05)",
                            color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                            boxShadow: isActive ? "0 1px 2px rgba(0, 0, 0, 0.06)" : "none",
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
                    background: "var(--surface-subtle)",
                    padding: 3,
                    borderRadius: "var(--radius-pill)",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => handleViewSelect("individuals")}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "var(--radius-pill)",
                      fontSize: 12.5,
                      fontWeight: view === "individuals" ? 700 : 500,
                      color: view === "individuals" ? "var(--text-primary)" : "var(--text-secondary)",
                      background: view === "individuals" ? "#FFFFFF" : "transparent",
                      boxShadow: view === "individuals" ? "0 1px 3px rgba(0, 0, 0, 0.08)" : "none",
                      border: "none",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Trophy size={13} />
                    <span>Warriors</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleViewSelect("groups")}
                    style={{
                      padding: "6px 14px",
                      borderRadius: "var(--radius-pill)",
                      fontSize: 12.5,
                      fontWeight: view === "groups" ? 700 : 500,
                      color: view === "groups" ? "var(--text-primary)" : "var(--text-secondary)",
                      background: view === "groups" ? "#FFFFFF" : "transparent",
                      boxShadow: view === "groups" ? "0 1px 3px rgba(0, 0, 0, 0.08)" : "none",
                      border: "none",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Users size={13} />
                    <span>Teams</span>
                  </button>
                </div>
              </div>

              {/* Search Filter */}
              <div className="leaderboard-search-input-wrap" style={{ position: "relative", minWidth: 200, flex: 1, maxWidth: 320 }}>
                <Search
                  size={14}
                  color="var(--text-muted)"
                  style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
                />
                <input
                  type="text"
                  placeholder="Filter by name, muid or team..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "7px 12px 7px 34px",
                    borderRadius: "var(--radius-pill)",
                    border: "1px solid var(--border)",
                    background: "#FFFFFF",
                    fontSize: 12.5,
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* Scrollable Table Area with Sticky Headers */}
            <div
              className="custom-scrollbar leaderboard-table-scroll"
              style={{
                maxHeight: "calc(100vh - 240px)",
                overflowY: "auto",
                overflowX: "auto",
              }}
            >
              {filteredStandings.length === 0 ? (
                <div style={{ padding: "60px 16px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
                  No matches found for this period.
                </div>
              ) : view === "individuals" ? (
                <table className="clean-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 480 }}>
                  <thead
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      background: "#FFFFFF",
                      boxShadow: "0 1px 0 var(--border)",
                    }}
                  >
                    <tr style={{ height: 42 }}>
                      <th style={{ width: 60, padding: "8px 16px" }}>Rank</th>
                      <th style={{ padding: "8px 16px" }}>Warrior</th>
                      <th style={{ width: 140, padding: "8px 16px" }}>Team</th>
                      <th style={{ textAlign: "right", padding: "8px 16px" }}>Karma</th>
                      <th className="hide-on-mobile" style={{ width: 80, textAlign: "center", padding: "8px 12px" }}>Streak</th>
                      <th className="hide-on-mobile" style={{ width: 70, textAlign: "center", padding: "8px 12px" }}>Trend</th>
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

                      return (
                        <tr
                          key={mem.muid || idx}
                          style={{
                            height: 52,
                            borderBottom: "1px solid var(--border-subtle, #F1F3F5)",
                            transition: "background 0.12s ease",
                          }}
                        >
                          <td
                            className="tabular-nums"
                            style={{
                              padding: "6px 16px",
                              fontSize: 13,
                              fontWeight: 700,
                              color: rankNum <= 3 ? "var(--chart-line)" : "var(--text-secondary)",
                            }}
                          >
                            {formatRankLabel(rankNum, mem.is_tie)}
                          </td>

                          <td style={{ padding: "6px 16px" }}>
                            <Link
                              to={`/u/${encodeURIComponent(mem.muid)}`}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                textDecoration: "none",
                                color: "inherit",
                              }}
                            >
                              <div
                                style={{
                                  width: 32,
                                  height: 32,
                                  borderRadius: "50%",
                                  background: token.cardBg || "#1B1F27",
                                  color: token.cardText || "#FFFFFF",
                                  fontSize: 11.5,
                                  fontWeight: 700,
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
                                  <span style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap" }}>{mem.name}</span>
                                  {mem.is_group_mvp && (
                                    <Crown size={12} color="var(--ink-operation)" fill="currentColor" />
                                  )}
                                </div>
                                <div style={{ fontSize: 11, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {mem.muid}
                                </div>
                              </div>
                            </Link>
                          </td>

                          {/* Team Crest: Enlarged to size="md" */}
                          <td style={{ padding: "6px 16px" }}>
                            <Link
                              to={`/groups/${mem.group_name || mem.group_id}`}
                              style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}
                            >
                              <Crest group={mem.group_name || mem.group_id} size="md" />
                              <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{token.name}</span>
                            </Link>
                          </td>

                          <td
                            className="tabular-nums"
                            style={{
                              padding: "6px 16px",
                              textAlign: "right",
                              fontSize: 13.5,
                              fontWeight: 700,
                              color: "var(--text-primary)",
                            }}
                          >
                            {(mem.karma || 0).toLocaleString()}
                          </td>

                          <td className="hide-on-mobile" style={{ textAlign: "center", padding: "6px 12px" }}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 3,
                                fontSize: 12,
                                fontWeight: 700,
                                color: "#FF9F0A",
                              }}
                            >
                              <Flame size={12} />
                              <span>{streakCount}d</span>
                            </span>
                          </td>

                          <td className="hide-on-mobile" style={{ textAlign: "center", padding: "6px 12px" }}>
                            {changeVal > 0 ? (
                              <span style={{ color: "var(--status-up)", display: "inline-flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 700 }}>
                                <ArrowUpRight size={13} />
                                <span>{changeVal}</span>
                              </span>
                            ) : changeVal < 0 ? (
                              <span style={{ color: "var(--status-down)", display: "inline-flex", alignItems: "center", gap: 2, fontSize: 12, fontWeight: 700 }}>
                                <ArrowDownRight size={13} />
                                <span>{Math.abs(changeVal)}</span>
                              </span>
                            ) : (
                              <Minus size={13} color="var(--text-muted)" />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                /* Groups View Table: Bigger Crest (size="md"), No Description Subtitle */
                <table className="clean-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 420 }}>
                  <thead
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 2,
                      background: "#FFFFFF",
                      boxShadow: "0 1px 0 var(--border)",
                    }}
                  >
                    <tr style={{ height: 44 }}>
                      <th style={{ width: 60, padding: "8px 16px" }}>Rank</th>
                      <th style={{ padding: "8px 16px" }}>Team</th>
                      <th style={{ padding: "8px 16px" }}>Margin / Gap</th>
                      <th className="hide-on-mobile" style={{ width: 100, textAlign: "center", padding: "8px 12px" }}>Members</th>
                      <th style={{ textAlign: "right", padding: "8px 16px" }}>Total Karma</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStandings.map((grp, idx) => {
                      const token = getGroupToken(grp);
                      const nextGrp = idx > 0 ? filteredStandings[idx - 1] : null;
                      const prevGrp = idx < filteredStandings.length - 1 ? filteredStandings[idx + 1] : null;

                      let gapText = "";
                      if (idx === 0 && prevGrp) {
                        const diff = (grp.karma || 0) - (prevGrp.karma || 0);
                        gapText = diff > 0 ? `+${diff.toLocaleString()} ahead of #2` : "Tied with #2";
                      } else if (idx > 0 && nextGrp) {
                        const diff = (nextGrp.karma || 0) - (grp.karma || 0);
                        gapText = diff > 0 ? `${diff.toLocaleString()} behind #${idx}` : `Tied with #${idx}`;
                      }

                      return (
                        <tr
                          key={grp.id || grp.name || idx}
                          style={{
                            height: 60,
                            borderBottom: "1px solid var(--border-subtle, #F1F3F5)",
                          }}
                        >
                          <td
                            className="tabular-nums"
                            style={{
                              padding: "8px 16px",
                              fontSize: 14,
                              fontWeight: 800,
                              color: "var(--text-primary)",
                            }}
                          >
                            #{idx + 1}
                          </td>

                          {/* Team Name + Bigger Crest (size="md"), NO Description Subtitle */}
                          <td style={{ padding: "8px 16px" }}>
                            <Link
                              to={`/groups/${grp.id || grp.name}`}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 14,
                                textDecoration: "none",
                                color: "inherit",
                              }}
                            >
                              <Crest group={grp} size="md" />
                              <span
                                style={{
                                  fontSize: 14,
                                  fontWeight: 800,
                                  color: "var(--text-primary)",
                                  fontFamily: "var(--font-display)",
                                  fontVariationSettings: "'wdth' 115",
                                  letterSpacing: "0.02em",
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
                                fontSize: 12.5,
                                fontWeight: 700,
                                color: idx === 0 ? "var(--status-up)" : "var(--text-secondary)",
                              }}
                            >
                              {gapText || "—"}
                            </span>
                          </td>

                          <td className="hide-on-mobile" style={{ textAlign: "center", padding: "8px 12px", fontSize: 12.5, fontWeight: 600, color: "var(--text-secondary)" }}>
                            {grp.member_count || grp.members_count || 6} warriors
                          </td>

                          <td
                            className="tabular-nums"
                            style={{
                              padding: "8px 16px",
                              textAlign: "right",
                              fontSize: 15,
                              fontWeight: 800,
                              color: "var(--text-primary)",
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

        {/* Right Zone (Span 4): Sticky Sidebar with Top-3 Podium and Group Standings (Period Selector moved to TOP) */}
        <PageCol col={12} colLg={4}>
          <div
            style={{
              position: "sticky",
              top: 24,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            {/* 1. Top-3 Podium Card */}
            {topThree.length >= 3 && !search.trim() && (
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-card)",
                  padding: "18px 20px",
                  boxShadow: "var(--shadow-soft)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <Medal size={16} color="var(--chart-line)" />
                    <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      Top 3 Podium
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>
                    {view === "individuals" ? "Warriors" : "Teams"}
                  </span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                  {/* #2 Silver (Left) */}
                  <PodiumCard
                    item={topThree[1]}
                    rank={2}
                    medalColor="#A1A1AA"
                    medalLabel="2nd"
                    view={view}
                  />

                  {/* #1 Gold (Center, elevated) */}
                  <PodiumCard
                    item={topThree[0]}
                    rank={1}
                    medalColor="#F59E0B"
                    medalLabel="1st 👑"
                    view={view}
                    featured
                  />

                  {/* #3 Bronze (Right) */}
                  <PodiumCard
                    item={topThree[2]}
                    rank={3}
                    medalColor="#D97706"
                    medalLabel="3rd"
                    view={view}
                  />
                </div>
              </div>
            )}

            {/* 2. Group Standings Quick Board with Larger Crests */}
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-card)",
                padding: "18px 20px",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 800, color: "var(--text-primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {filter === "teams" ? "Team Standings" : filter === "groups" ? "Group Standings" : "Team Standings"}
                </span>
                <Link
                  to={filter === "all" ? "/groups" : `/groups?filter=${filter}`}
                  style={{
                    fontSize: 11.5,
                    fontWeight: 700,
                    color: "var(--chart-line)",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <span>{filter === "teams" ? "All 7 Teams" : filter === "groups" ? "All 9 Groups" : "All Teams"}</span>
                  <ChevronRight size={13} />
                </Link>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {displayedGroupStandings.map((grp, idx) => {
                  const token = getGroupToken(grp);
                  const nextGrp = idx > 0 ? displayedGroupStandings[idx - 1] : null;
                  const prevGrp = idx < displayedGroupStandings.length - 1 ? displayedGroupStandings[idx + 1] : null;

                  let gapText = "";
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
                      to={`/groups/${grp.id || grp.name}`}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "9px 12px",
                        borderRadius: 6,
                        background: token.cardBg,
                        color: token.cardText || "#FFFFFF",
                        border: `1px solid ${token.cardBorder || "rgba(255, 255, 255, 0.12)"}`,
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.08)",
                        textDecoration: "none",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-1px)";
                        e.currentTarget.style.boxShadow = "0 3px 8px rgba(0, 0, 0, 0.16)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 1px 2px rgba(0, 0, 0, 0.08)";
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <span
                          className="tabular-nums"
                          style={{
                            fontSize: 12,
                            fontWeight: 800,
                            color: token.cardAccent || "rgba(255, 255, 255, 0.8)",
                            width: 20,
                          }}
                        >
                          #{idx + 1}
                        </span>
                        <Crest group={grp} size="sm" />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: token.cardText || "#FFFFFF" }}>
                            {token.name}
                          </div>
                          {gapText && (
                            <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255, 255, 255, 0.7)" }}>
                              {gapText}
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        className="tabular-nums"
                        style={{
                          fontSize: 13.5,
                          fontWeight: 800,
                          fontFamily: "var(--font-display)",
                          fontVariationSettings: "'wdth' 125",
                          color: token.cardAccent || token.cardText || "#FFFFFF",
                        }}
                      >
                        {(grp.karma || 0).toLocaleString()}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </PageCol>
      </PageGrid>
    </div>
  );
}

function PodiumCard({ item, rank, medalColor, medalLabel, view, featured = false }) {
  if (!item) return null;
  const token = getGroupToken(item.group_name || item.group_id || item.name);
  const href = view === "individuals" ? `/u/${encodeURIComponent(item.muid)}` : `/groups/${item.id || item.name}`;

  return (
    <Link
      to={href}
      className="interactive-card"
      style={{
        background: token.cardBg || "#1B1F27",
        color: token.cardText || "#FFFFFF",
        borderRadius: "var(--radius-card)",
        padding: featured ? "14px 8px" : "10px 6px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        textDecoration: "none",
        boxShadow: featured ? "0 4px 12px rgba(0, 0, 0, 0.15)" : "none",
        border: `1px solid ${token.cardBorder || "rgba(255, 255, 255, 0.12)"}`,
      }}
    >
      <div
        style={{
          display: "inline-block",
          padding: "2px 6px",
          borderRadius: "var(--radius-pill)",
          background: "rgba(0, 0, 0, 0.35)",
          color: token.cardAccent || medalColor,
          border: `1px solid ${token.cardBorder || "rgba(255, 255, 255, 0.15)"}`,
          fontSize: 10,
          fontWeight: 800,
          marginBottom: 6,
        }}
      >
        {medalLabel}
      </div>

      <div style={{ marginBottom: 6 }}>
        <Crest group={item.group_name || item.group_id || item.name || item} size="sm" />
      </div>

      <div style={{ fontSize: 11.5, fontWeight: 700, color: token.cardText || "#FFFFFF", maxWidth: 84, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {item.name}
      </div>

      <div
        className="tabular-nums"
        style={{
          fontSize: featured ? 14 : 12.5,
          fontWeight: 800,
          color: token.cardAccent || token.cardText || "#FFFFFF",
          marginTop: 4,
        }}
      >
        {(item.karma || 0).toLocaleString()}
      </div>
    </Link>
  );
}
