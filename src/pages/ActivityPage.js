import React, { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Users, ArrowRight, RotateCcw, LayoutGrid, Shield } from "lucide-react";
import PageHeader from "../components/shell/PageHeader";
import PageGrid, { PageCol } from "../components/common/PageGrid";
import { karmaStore } from "../data/karmaStore";
import { formatRelativeTime } from "../utils/dateUtils";
import { getGroupToken, isOfficialTeam } from "../utils/groupTokens";
import Crest, { CREST_REGISTRY, normalizeGroupSlug } from "../crests";

export default function ActivityPage() {
  const [dataVersion, setDataVersion] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();
  const filterParam = (searchParams.get("filter") || "").toLowerCase();
  const initialCategory = filterParam === "teams" || filterParam === "groups" ? filterParam : "all";
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const teamParam = (searchParams.get("team") || searchParams.get("group") || "").toUpperCase();
  const [selectedGroup, setSelectedGroup] = useState(teamParam || "all");
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredGroup, setHoveredGroup] = useState(null);

  useEffect(() => {
    if (teamParam && teamParam !== selectedGroup) {
      setSelectedGroup(teamParam);
      if (isOfficialTeam(teamParam)) {
        setCategoryFilter((prev) => (prev === "groups" ? "all" : prev));
      } else {
        setCategoryFilter((prev) => (prev === "teams" ? "all" : prev));
      }
    }
  }, [teamParam, selectedGroup]);

  const handleSelectCategory = (cat) => {
    setCategoryFilter(cat);
    setSelectedGroup("all");
    searchParams.delete("team");
    searchParams.delete("group");
    if (cat === "all") {
      searchParams.delete("filter");
    } else {
      searchParams.set("filter", cat);
    }
    setSearchParams(searchParams, { replace: true });
  };

  const handleSelectGroup = (team) => {
    setSelectedGroup(team);
    if (team === "all") {
      searchParams.delete("team");
      searchParams.delete("group");
      setSearchParams(searchParams, { replace: true });
    } else {
      searchParams.set("team", team);
      setSearchParams(searchParams, { replace: true });
    }
  };

  useEffect(() => {
    const unsub = karmaStore.subscribe(() => {
      setDataVersion((v) => v + 1);
    });
    return unsub;
  }, []);

  const allEvents = useMemo(() => {
    if (dataVersion < 0) return [];
    return karmaStore.karmaEvents || [];
  }, [dataVersion]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter((ev) => {
      let matchTeam = true;
      if (selectedGroup !== "all") {
        matchTeam =
          (ev.group_name && ev.group_name.toUpperCase() === selectedGroup.toUpperCase()) ||
          (ev.group_id && ev.group_id.toUpperCase().includes(selectedGroup.toUpperCase())) ||
          (ev.group_name && normalizeGroupSlug(ev.group_name) === normalizeGroupSlug(selectedGroup)) ||
          (ev.group_id && normalizeGroupSlug(ev.group_id) === normalizeGroupSlug(selectedGroup));
      } else if (categoryFilter === "teams") {
        matchTeam = isOfficialTeam(ev.group_name || ev.group_id);
      } else if (categoryFilter === "groups") {
        matchTeam = !isOfficialTeam(ev.group_name || ev.group_id);
      }

      const q = searchTerm.trim().toLowerCase();
      const matchSearch =
        !q ||
        (ev.member_name && ev.member_name.toLowerCase().includes(q)) ||
        (ev.student_name && ev.student_name.toLowerCase().includes(q)) ||
        (ev.name && ev.name.toLowerCase().includes(q)) ||
        (ev.muid && ev.muid.toLowerCase().includes(q)) ||
        (ev.group_name && ev.group_name.toLowerCase().includes(q)) ||
        (ev.task_name && ev.task_name.toLowerCase().includes(q)) ||
        (ev.description && ev.description.toLowerCase().includes(q));

      return matchTeam && matchSearch;
    });
  }, [allEvents, selectedGroup, categoryFilter, searchTerm]);

  // Group events into day categories: Today, Yesterday, This Week, Earlier
  const groupedEvents = useMemo(() => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    const groups = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      Earlier: [],
    };

    filteredEvents.forEach((ev) => {
      const ts = ev.timestamp || ev.created_at;
      if (!ts) {
        groups.Earlier.push(ev);
        return;
      }
      const diff = now - new Date(ts).getTime();
      if (diff < oneDay) {
        groups.Today.push(ev);
      } else if (diff < 2 * oneDay) {
        groups.Yesterday.push(ev);
      } else if (diff < 7 * oneDay) {
        groups["This Week"].push(ev);
      } else {
        groups.Earlier.push(ev);
      }
    });

    return groups;
  }, [filteredEvents]);

  // Activity summary stats
  const totalKarmaLogged = useMemo(() => {
    return filteredEvents.reduce(
      (sum, ev) => sum + (ev.delta || ev.karma_points || ev.points || 300),
      0
    );
  }, [filteredEvents]);

  // Stats for the currently selected team
  const selectedTeamToken = useMemo(() => {
    if (selectedGroup === "all") return null;
    return getGroupToken(selectedGroup);
  }, [selectedGroup]);

  const selectedTeamStats = useMemo(() => {
    if (selectedGroup === "all") return null;
    const teamEvents = allEvents.filter(
      (ev) =>
        (ev.group_name && ev.group_name.toUpperCase() === selectedGroup.toUpperCase()) ||
        (ev.group_id && ev.group_id.toUpperCase().includes(selectedGroup.toUpperCase())) ||
        (ev.group_name && normalizeGroupSlug(ev.group_name) === normalizeGroupSlug(selectedGroup)) ||
        (ev.group_id && normalizeGroupSlug(ev.group_id) === normalizeGroupSlug(selectedGroup))
    );
    const karma = teamEvents.reduce(
      (sum, ev) => sum + (ev.delta || ev.karma_points || ev.points || 300),
      0
    );
    return {
      count: teamEvents.length,
      karma,
    };
  }, [allEvents, selectedGroup]);

  const getMemberName = (act) => {
    if (act.member_name && act.member_name !== "Member") return act.member_name;
    if (act.student_name && act.student_name !== "Member") return act.student_name;
    if (act.name && act.name !== "Member") return act.name;
    if (act.muid) {
      const found = karmaStore.getMemberByMuid ? karmaStore.getMemberByMuid(act.muid) : null;
      if (found && found.name) return found.name;
      return act.muid.split("@")[0];
    }
    return "Warrior";
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // Full campus roster: 7 official teams + custom crest groups first, then remaining community groups
  const allGroupsList = useMemo(() => {
    const storeGroups = karmaStore.groups || [];
    const priorityOrder = [
      "TECH",
      "LEADS",
      "OPERATION",
      "MEDIA",
      "MARKETING",
      "CONTENT",
      "CREATIVE",
      "TECHASHI",
      "OFFGRID",
      "MUVERSE",
    ];

    if (storeGroups.length > 0) {
      const priority = [];
      const others = [];

      priorityOrder.forEach((name) => {
        const found = storeGroups.find(
          (g) =>
            (g.name || "").toUpperCase() === name ||
            normalizeGroupSlug(g.name || g.id) === normalizeGroupSlug(name)
        );
        if (found) {
          priority.push({
            id: found.id || `grp-${name.toLowerCase()}`,
            name: found.name,
            key: found.name.toUpperCase(),
          });
        } else {
          priority.push({
            id: `grp-${name.toLowerCase()}`,
            name,
            key: name,
          });
        }
      });

      storeGroups.forEach((g) => {
        const gName = (g.name || "").toUpperCase();
        const isPriority = priorityOrder.some(
          (p) => p === gName || normalizeGroupSlug(p) === normalizeGroupSlug(g.name || g.id)
        );
        if (!isPriority) {
          others.push({
            id: g.id,
            name: g.name,
            key: (g.name || g.id).toUpperCase(),
          });
        }
      });

      return [...priority, ...others];
    }

    // Fallback if store hasn't initialized yet
    const fallbackAll = [
      "TECH",
      "LEADS",
      "OPERATION",
      "MEDIA",
      "MARKETING",
      "CONTENT",
      "CREATIVE",
      "TECHASHI",
      "OFFGRID",
      "MUVERSE",
      "SFC",
      "INFINITEA",
      "NEXUS",
      "KAIZEN",
      "MUNIVERSE",
      "LA DECIMA",
    ];

    return fallbackAll.map((name) => ({
      id: `grp-${name.toLowerCase().replace(/\s+/g, "-")}`,
      name,
      key: name,
    }));
  }, [dataVersion]);

  const displayedGroupsList = useMemo(() => {
    if (categoryFilter === "teams") {
      return allGroupsList.filter((g) => isOfficialTeam(g));
    }
    if (categoryFilter === "groups") {
      return allGroupsList.filter((g) => !isOfficialTeam(g));
    }
    return allGroupsList;
  }, [allGroupsList, categoryFilter]);

  return (
    <div
      className="activity-page-root"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
      }}
    >
      <style>{`
        .activity-filter-bar {
          display: flex;
          align-items: flex-end;
          gap: 24px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding: 8px 0 16px 0;
          border-bottom: 1px solid var(--border);
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .activity-filter-bar::-webkit-scrollbar {
          display: none;
        }
        .activity-filter-btn {
          background: transparent;
          border: none;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          cursor: pointer;
          padding: 4px 6px;
          outline: none;
          flex-shrink: 0;
          transition: opacity 0.18s ease, filter 0.18s ease;
        }
        .activity-filter-btn:focus-visible {
          outline: 2px solid var(--border-strong);
          outline-offset: 4px;
          border-radius: 4px;
        }
        .activity-crest-wrapper {
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .activity-filter-crest {
          height: 80px;
          width: auto;
          max-width: 80px;
          object-fit: contain;
          display: block;
        }
        .activity-all-icon-box {
          height: 80px;
          width: 68px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .activity-points-desktop {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12.5px;
        }
        .activity-right-desktop {
          display: block;
        }
        .activity-right-mobile {
          display: none;
        }
        @media (max-width: 640px) {
          .activity-points-desktop {
            display: none !important;
          }
          .activity-right-desktop {
            display: none !important;
          }
          .activity-right-mobile {
            display: flex !important;
            flex-direction: column;
            align-items: flex-end;
            text-align: right;
            flex-shrink: 0;
            gap: 2px;
          }
          .activity-member-name-col {
            min-width: 0 !important;
            max-width: 140px !important;
          }
        }
        @media (max-width: 768px) {
          .activity-filter-bar {
            gap: 16px;
            padding-bottom: 12px;
          }
          .activity-crest-wrapper {
            height: 56px;
          }
          .activity-filter-crest {
            height: 56px;
            max-width: 56px;
          }
          .activity-all-icon-box {
            height: 56px;
            width: 48px;
          }
          .activity-feed-scroll {
            max-height: none !important;
            overflow-y: visible !important;
          }
        }
      `}</style>

      {/* Page Header */}
      <PageHeader
        title="Campus Activity"
        subtitle="Recent karma activity across campus teams."
        hideSearch={true}
      />

      {/* =========================================================================
          1. TEAM & GROUP FILTER BAR (Clean, no rings, large crests, subtle opacity)
          ========================================================================= */}
      <div className="activity-filter-bar">
        {/* Category Sort Options: ALL, TEAMS, GROUPS */}
        {[
          { id: "all", label: "All", icon: LayoutGrid, ariaLabel: "Filter by All Teams & Groups" },
          { id: "teams", label: "Teams", icon: Shield, ariaLabel: "Filter by Teams" },
          { id: "groups", label: "Groups", icon: Users, ariaLabel: "Filter by Groups" },
        ].map((cat) => {
          const isSelected = categoryFilter === cat.id && selectedGroup === "all";
          const isHovered = hoveredGroup === `cat-${cat.id}`;
          const opacity = isSelected ? 1 : isHovered ? 0.85 : 0.55;
          const filter = isSelected ? "none" : "grayscale(25%)";
          const Icon = cat.icon;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSelectCategory(cat.id)}
              onMouseEnter={() => setHoveredGroup(`cat-${cat.id}`)}
              onMouseLeave={() => setHoveredGroup(null)}
              aria-pressed={isSelected}
              aria-label={cat.ariaLabel}
              className="activity-filter-btn"
              style={{ opacity, filter }}
            >
              <div className="activity-all-icon-box">
                <Icon
                  size={28}
                  strokeWidth={1.75}
                  color={isSelected ? "var(--text-primary)" : "var(--text-secondary)"}
                />
              </div>

              {/* Label */}
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontVariationSettings: "'wdth' 112",
                  fontSize: 11,
                  fontWeight: isSelected ? 700 : 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                  marginTop: 8,
                  whiteSpace: "nowrap",
                }}
              >
                {cat.label}
              </span>

              {/* Subtle 2px underline in neutral color */}
              <div
                style={{
                  width: isSelected ? 18 : 0,
                  height: 2,
                  borderRadius: 1,
                  background: isSelected ? "var(--text-primary)" : "transparent",
                  marginTop: 4,
                  transition: "all 0.18s ease",
                }}
              />
            </button>
          );
        })}

        {/* Subtle vertical divider between Category Sorts and Crests */}
        <div
          aria-hidden="true"
          style={{
            width: 1,
            height: 48,
            background: "var(--border)",
            margin: "0 6px 14px 6px",
            flexShrink: 0,
            alignSelf: "center",
          }}
        />

        {/* Filtered Campus Teams & Community Groups Crests */}
        {displayedGroupsList.map((g) => {
          const isSelected =
            selectedGroup !== "all" &&
            (selectedGroup.toUpperCase() === g.key ||
              normalizeGroupSlug(selectedGroup) === normalizeGroupSlug(g.id || g.name));
          const isHovered = hoveredGroup === g.key;
          const token = getGroupToken(g.id || g.name);
          const slug = normalizeGroupSlug(g.id || g.name);
          const crestFiles = CREST_REGISTRY[slug];
          const opacity = isSelected ? 1 : isHovered ? 0.88 : 0.55;
          const filter = isSelected ? "none" : "grayscale(25%)";

          return (
            <button
              key={g.id || g.name}
              type="button"
              onClick={() => handleSelectGroup(isSelected ? "all" : g.key)}
              onMouseEnter={() => setHoveredGroup(g.key)}
              onMouseLeave={() => setHoveredGroup(null)}
              aria-pressed={isSelected}
              aria-label={`Filter by ${token.name}`}
              className="activity-filter-btn"
              style={{ opacity, filter }}
            >
              <div className="activity-crest-wrapper">
                {crestFiles ? (
                  <img
                    src={crestFiles["384"] || crestFiles["128"]}
                    srcSet={`${crestFiles["128"]} 128w, ${crestFiles["384"]} 384w`}
                    sizes="(max-width: 768px) 56px, 80px"
                    alt={`${token.name} crest`}
                    className="activity-filter-crest"
                  />
                ) : (
                  <Crest group={g.id || g.name} size="lg" alt="" />
                )}
              </div>

              {/* Group Name Label */}
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontVariationSettings: "'wdth' 112",
                  fontSize: 11,
                  fontWeight: isSelected ? 700 : 600,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: isSelected ? "var(--text-primary)" : "var(--text-secondary)",
                  marginTop: 8,
                  whiteSpace: "nowrap",
                }}
              >
                {token.name}
              </span>

              {/* Subtle 2px underline in neutral color */}
              <div
                style={{
                  width: isSelected ? 18 : 0,
                  height: 2,
                  borderRadius: 1,
                  background: isSelected ? "var(--text-primary)" : "transparent",
                  marginTop: 4,
                  transition: "all 0.18s ease",
                }}
              />
            </button>
          );
        })}
      </div>

      <PageGrid gap={20}>
        {/* =======================================================================
            LEFT COLUMN (Span 8): Search + Day-Grouped Activity List
            ======================================================================= */}
        <PageCol col={12} colLg={8}>
          {/* Minimal Search Bar */}
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 10,
              padding: "10px 16px",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-soft)",
              marginBottom: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ position: "relative", flex: 1 }}>
              <Search
                size={14}
                color="var(--text-muted)"
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
              />
              <input
                type="text"
                placeholder="Search by name or task..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px 8px 34px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: "var(--surface-subtle)",
                  color: "var(--text-primary)",
                  fontSize: 13,
                  outline: "none",
                }}
              />
            </div>

            {selectedGroup !== "all" && (
              <button
                type="button"
                onClick={() => handleSelectGroup("all")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "7px 12px",
                  borderRadius: 6,
                  background: "var(--surface-subtle)",
                  border: "1px solid var(--border)",
                  fontSize: 11,
                  fontFamily: "var(--font-display)",
                  fontVariationSettings: "'wdth' 112",
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--border-subtle)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--surface-subtle)";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
              >
                <RotateCcw size={12} />
                <span>Show All</span>
              </button>
            )}
          </div>

          {/* Activity Feed in Flat Surface Cards */}
          <div
            className="custom-scrollbar activity-feed-scroll"
            style={{
              maxHeight: "calc(100vh - 280px)",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              paddingRight: 4,
            }}
          >
            {filteredEvents.length === 0 ? (
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-soft)",
                  padding: "60px 20px",
                  textAlign: "center",
                  color: "var(--text-muted)",
                  fontSize: 13,
                }}
              >
                No activity matches your current filter.
              </div>
            ) : (
              Object.entries(groupedEvents).map(([sectionTitle, events]) => {
                if (events.length === 0) return null;

                return (
                  <div
                    key={sectionTitle}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: 10,
                      border: "1px solid var(--border)",
                      boxShadow: "var(--shadow-soft)",
                      padding: "18px 20px",
                    }}
                  >
                    {/* Section Header */}
                    <div
                      style={{
                        fontSize: 11,
                        fontFamily: "var(--font-display)",
                        fontVariationSettings: "'wdth' 112",
                        fontWeight: 700,
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "var(--text-secondary)",
                        marginBottom: 12,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span>{sectionTitle}</span>
                      <span
                        className="tabular-nums"
                        style={{
                          fontSize: 10.5,
                          fontWeight: 600,
                          color: "var(--text-secondary)",
                          padding: "1px 6px",
                          borderRadius: 3,
                          background: "var(--surface-subtle)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        {events.length}
                      </span>
                    </div>

                    {/* Table-like List */}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {events.slice(0, 30).map((act, idx) => {
                        const memberName = getMemberName(act);
                        const points = act.delta || act.karma_points || act.points || 300;
                        const isLast = idx === Math.min(events.length, 30) - 1;

                        return (
                          <div
                            key={act.id || idx}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "10px 8px",
                              borderBottom: isLast
                                ? "none"
                                : "1px solid var(--border-subtle, #f0f0f4)",
                              borderRadius: 6,
                              gap: 12,
                              transition: "background 0.15s ease",
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background = "var(--surface-subtle, #f8fafc)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background = "transparent")
                            }
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 10,
                                minWidth: 0,
                                flex: 1,
                              }}
                            >
                              {/* Avatar Initials */}
                              <div
                                style={{
                                  width: 30,
                                  height: 30,
                                  borderRadius: "50%",
                                  background: "var(--surface-subtle, #f4f5f7)",
                                  border: "1px solid var(--border)",
                                  color: "var(--text-primary)",
                                  fontSize: 11,
                                  fontWeight: 600,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                {getInitials(memberName)}
                              </div>

                              {/* Member Name */}
                              <div
                                className="activity-member-name-col"
                                style={{ minWidth: 0, maxWidth: 180, flex: 1 }}
                              >
                                {act.muid ? (
                                  <Link
                                    to={`/u/${encodeURIComponent(act.muid)}`}
                                    style={{
                                      fontWeight: 500,
                                      fontSize: 13.5,
                                      color: "var(--text-primary)",
                                      textDecoration: "none",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      display: "block",
                                      transition: "color 0.15s ease",
                                    }}
                                    onMouseEnter={(e) =>
                                      (e.currentTarget.style.color = "var(--text-secondary)")
                                    }
                                    onMouseLeave={(e) =>
                                      (e.currentTarget.style.color = "var(--text-primary)")
                                    }
                                  >
                                    {memberName}
                                  </Link>
                                ) : (
                                  <span
                                    style={{
                                      fontWeight: 500,
                                      fontSize: 13.5,
                                      color: "var(--text-primary)",
                                      whiteSpace: "nowrap",
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      display: "block",
                                    }}
                                  >
                                    {memberName}
                                  </span>
                                )}
                              </div>

                              {/* Team Crest Icon */}
                              <div
                                style={{
                                  width: 24,
                                  height: 24,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                <Crest group={act.group_name || act.group_id} size="xs" />
                              </div>

                              {/* Points Earned (Desktop view only) */}
                              <div className="activity-points-desktop">
                                <span style={{ color: "var(--text-muted)" }}>earned</span>
                                <span
                                  className="tabular-nums"
                                  style={{
                                    fontWeight: 600,
                                    color: "#059669",
                                  }}
                                >
                                  +{points} karma
                                </span>
                              </div>
                            </div>

                            {/* Relative Time (Desktop view only) */}
                            <span
                              className="activity-right-desktop"
                              style={{
                                fontSize: 12,
                                color: "var(--text-muted)",
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                              }}
                            >
                              {formatRelativeTime(act.timestamp || act.created_at)}
                            </span>

                            {/* Stacked points + time (Mobile view only) */}
                            <div className="activity-right-mobile">
                              <span
                                className="tabular-nums"
                                style={{
                                  fontSize: 12.5,
                                  fontWeight: 700,
                                  color: "#059669",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                +{points}
                              </span>
                              <span
                                style={{
                                  fontSize: 10.5,
                                  color: "var(--text-muted)",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {formatRelativeTime(act.timestamp || act.created_at)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </PageCol>

        {/* =======================================================================
            RIGHT COLUMN (Span 4): Spotlight (if filtered) + Summary
            ======================================================================= */}
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
            {/* If a team is selected: Flat Minimal Spotlight Card */}
            {selectedTeamToken && selectedTeamStats ? (
              <div
                style={{
                  background: "#FFFFFF",
                  borderRadius: 10,
                  border: "1px solid var(--border)",
                  boxShadow: "var(--shadow-soft)",
                  padding: "20px 22px",
                }}
              >
                {/* Header Row */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    marginBottom: 16,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    <Crest group={selectedGroup} size="sm" />
                    <div>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 700,
                          color: "var(--text-primary)",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span>{selectedTeamToken.name}</span>
                        <span
                          style={{
                            fontSize: 9.5,
                            fontFamily: "var(--font-display)",
                            fontVariationSettings: "'wdth' 112",
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            padding: "1px 6px",
                            borderRadius: 3,
                            border: "1px solid var(--border)",
                            background: "var(--surface-subtle)",
                            color: "var(--text-secondary)",
                          }}
                        >
                          SPOTLIGHT
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectGroup("all")}
                    style={{
                      background: "var(--surface-subtle)",
                      border: "1px solid var(--border)",
                      padding: "4px 8px",
                      borderRadius: 4,
                      fontSize: 10.5,
                      fontFamily: "var(--font-display)",
                      fontVariationSettings: "'wdth' 112",
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "var(--text-secondary)",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "var(--border-subtle)";
                      e.currentTarget.style.color = "var(--text-primary)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "var(--surface-subtle)";
                      e.currentTarget.style.color = "var(--text-secondary)";
                    }}
                  >
                    Clear Filter
                  </button>
                </div>

                {/* Metrics */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  <div
                    style={{
                      background: "var(--surface-subtle)",
                      border: "1px solid var(--border)",
                      padding: "12px 14px",
                      borderRadius: 6,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10.5,
                        fontFamily: "var(--font-display)",
                        fontVariationSettings: "'wdth' 112",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--text-secondary)",
                      }}
                    >
                      TEAM KARMA
                    </div>
                    <div
                      className="tabular-nums"
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#059669",
                        marginTop: 4,
                      }}
                    >
                      +{selectedTeamStats.karma.toLocaleString()}
                    </div>
                  </div>

                  <div
                    style={{
                      background: "var(--surface-subtle)",
                      border: "1px solid var(--border)",
                      padding: "12px 14px",
                      borderRadius: 6,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10.5,
                        fontFamily: "var(--font-display)",
                        fontVariationSettings: "'wdth' 112",
                        fontWeight: 700,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        color: "var(--text-secondary)",
                      }}
                    >
                      TOTAL ENTRIES
                    </div>
                    <div
                      className="tabular-nums"
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: "var(--text-primary)",
                        marginTop: 4,
                      }}
                    >
                      {selectedTeamStats.count}
                    </div>
                  </div>
                </div>

                {/* Team Page Link */}
                <Link
                  to={`/groups/grp-${selectedGroup.toLowerCase()}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    borderRadius: 6,
                    background: "var(--surface-subtle)",
                    border: "1px solid var(--border)",
                    color: "var(--text-primary)",
                    textDecoration: "none",
                    fontSize: 12,
                    fontWeight: 500,
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--border-subtle)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--surface-subtle)";
                  }}
                >
                  <span>View {selectedTeamToken.name} team page</span>
                  <ArrowRight size={13} color="var(--text-secondary)" />
                </Link>
              </div>
            ) : null}

            {/* General Activity Summary Card (Simple & Flat) */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 10,
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-soft)",
                padding: "20px 22px",
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
                  width: 170,
                  height: 95,
                  opacity: 0.08,
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
                <div
                  style={{
                    fontSize: 11,
                    fontFamily: "var(--font-display)",
                    fontVariationSettings: "'wdth' 112",
                    fontWeight: 700,
                    color: "var(--text-secondary)",
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    marginBottom: 14,
                  }}
                >
                  Summary
                </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div
                  style={{
                    background: "var(--surface-subtle)",
                    border: "1px solid var(--border)",
                    padding: "12px 14px",
                    borderRadius: 6,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10.5,
                      fontFamily: "var(--font-display)",
                      fontVariationSettings: "'wdth' 112",
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Karma Logged
                  </div>
                  <div
                    className="tabular-nums"
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#059669",
                      marginTop: 4,
                    }}
                  >
                    +{totalKarmaLogged.toLocaleString()}
                  </div>
                </div>

                <div
                  style={{
                    background: "var(--surface-subtle)",
                    border: "1px solid var(--border)",
                    padding: "12px 14px",
                    borderRadius: 6,
                  }}
                >
                  <div
                    style={{
                      fontSize: 10.5,
                      fontFamily: "var(--font-display)",
                      fontVariationSettings: "'wdth' 112",
                      fontWeight: 700,
                      color: "var(--text-secondary)",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Total Entries
                  </div>
                  <div
                    className="tabular-nums"
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      marginTop: 4,
                    }}
                  >
                    {filteredEvents.length}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  padding: "10px 14px",
                  borderRadius: 6,
                  background: "var(--surface-subtle)",
                  border: "1px solid var(--border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: 12,
                }}
              >
                <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>
                  Active filter:
                </span>
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--text-primary)",
                  }}
                >
                  {selectedTeamToken
                    ? selectedTeamToken.name
                    : categoryFilter === "teams"
                    ? "Official Teams"
                    : categoryFilter === "groups"
                    ? "Community Groups"
                    : "All Teams & Groups"}
                </span>
              </div>
              </div>
            </div>

            {/* Quick Link to Teams Index */}
            <div
              style={{
                background: "#FFFFFF",
                borderRadius: 10,
                border: "1px solid var(--border)",
                boxShadow: "var(--shadow-soft)",
                padding: "16px 20px",
              }}
            >
              <Link
                to="/groups"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  textDecoration: "none",
                  color: "var(--text-primary)",
                  fontSize: 12.5,
                  fontWeight: 500,
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-secondary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Users size={16} color="var(--text-secondary)" />
                  <span>All {allGroupsList.length} Campus Teams & Groups</span>
                </div>
                <span style={{ color: "var(--text-secondary)" }}>Explore →</span>
              </Link>
            </div>
          </div>
        </PageCol>
      </PageGrid>
    </div>
  );
}
