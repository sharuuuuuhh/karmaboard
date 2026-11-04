import React, { useState, useEffect, useMemo } from "react";
import PageHeader from "../components/shell/PageHeader";
import PageGrid, { PageCol } from "../components/common/PageGrid";
import PeriodCalendarPopover from "../components/common/PeriodCalendarPopover";
import ChartCard from "../components/dashboard/ChartCard";
import TopGroupsCards from "../components/dashboard/TopGroupsCards";
import LeaderboardTableCard from "../components/dashboard/LeaderboardTableCard";
import DarkPromoCard from "../components/dashboard/DarkPromoCard";
import RecentActivityCard from "../components/dashboard/RecentActivityCard";
import { karmaStore } from "../data/karmaStore";
import {
  getWeekBoundaries,
  getMonthBoundaries,
  getISTDate,
  getWeekCountdown,
} from "../utils/dateUtils";

export default function HomePage() {
  const [dataVersion, setDataVersion] = useState(0);
  const [period, setPeriod] = useState("month");
  const [offset, setOffset] = useState(0);
  const [selectedGroupId, setSelectedGroupId] = useState("all");

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

  // Boundaries & Countdown
  const weekInfo = useMemo(() => getWeekBoundaries(offset), [offset]);
  const countdown = useMemo(() => getWeekCountdown(weekInfo.end), [weekInfo]);

  // Real store data with period and offset applied
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

  const rawIndividualStandings = useMemo(() => {
    return karmaStore.getLeaderboard
      ? karmaStore.getLeaderboard({
          period,
          view: "individuals",
          weekOffset: period === "week" ? offset : 0,
          monthOffset: period === "month" ? offset : 0,
        })
      : [];
  }, [period, offset, dataVersion]);

  const allEvents = useMemo(() => karmaStore.karmaEvents || [], [dataVersion]);

  // Filter individuals by group if a chip is selected
  const displayedIndividuals = useMemo(() => {
    if (selectedGroupId === "all") return rawIndividualStandings;
    return rawIndividualStandings.filter(
      (m) => m.group_id === selectedGroupId || m.group_name === selectedGroupId
    );
  }, [rawIndividualStandings, selectedGroupId]);

  // Filter activities by group if selected
  const displayedActivities = useMemo(() => {
    if (selectedGroupId === "all") return allEvents;
    return allEvents.filter(
      (act) => act.group_id === selectedGroupId || act.group_name === selectedGroupId
    );
  }, [allEvents, selectedGroupId]);

  // Total weekly campus karma
  const totalWeeklyKarma = useMemo(() => {
    return groupStandings.reduce((sum, g) => sum + (g.karma || 0), 0);
  }, [groupStandings]);

  // Active members with > 0 karma this week
  const activeMembersCount = useMemo(() => {
    return rawIndividualStandings.filter((m) => (m.karma || 0) > 0).length;
  }, [rawIndividualStandings]);

  // Subtitle format
  const subtitle = useMemo(() => {
    if (period === "all") {
      return "All Time • Overall campus standings";
    }
    if (period === "month") {
      return offset === 0
        ? `${dateRangeInfo.fullLabel || dateRangeInfo.label} • ${countdown}`
        : `${dateRangeInfo.fullLabel || dateRangeInfo.label} • Past month`;
    }
    return offset === 0
      ? `${weekInfo.label} • ${countdown}`
      : `${weekInfo.label} • Past week`;
  }, [period, offset, weekInfo, countdown, dateRangeInfo]);

  const chartBaseDate = useMemo(() => {
    if (period === "week") {
      // For past weeks (offset < 0), use the end of that week so all 7 days are treated as completed
      return offset < 0 ? weekInfo.end : new Date();
    }
    if (period === "month") {
      const mb = getMonthBoundaries(offset);
      return offset < 0 ? mb.end : new Date();
    }
    return new Date();
  }, [period, offset, weekInfo]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page Header: Title + Subtitle + Single Prominent Period Popover Selector (Centered) */}
      <PageHeader
        title="Overview"
        subtitle={subtitle}
        centerActions={
          <PeriodCalendarPopover
            period={period}
            offset={offset}
            dateLabel={dateRangeInfo.label}
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

      {/* Row 1: Karma Chart (span 5) | Top Groups Stack (span 4) | Promo Card (span 3) */}
      <PageGrid gap={20}>
        <PageCol span={5} spanLg={5} spanMd={2} spanSm={1}>
          <ChartCard
            events={allEvents}
            totalKarma={totalWeeklyKarma}
            percentageChange="+14.2%"
            range={period}
            baseDate={chartBaseDate}
          />
        </PageCol>

        <PageCol span={4} spanLg={4} spanMd={1} spanSm={1}>
          <TopGroupsCards groups={groupStandings} />
        </PageCol>

        <PageCol span={3} spanLg={3} spanMd={1} spanSm={1}>
          <DarkPromoCard
            groups={groupStandings}
            countdown={countdown}
            activeMemberCount={activeMembersCount}
            period={period}
          />
        </PageCol>
      </PageGrid>

      {/* Row 2: Leaderboard Table (span 7) | Recent Activity (span 5) */}
      <PageGrid gap={20}>
        <PageCol span={7} spanLg={7} spanMd={2} spanSm={1}>
          <LeaderboardTableCard
            individuals={displayedIndividuals}
            groups={groupStandings}
            period={period}
            selectedGroupId={selectedGroupId}
            onSelectGroup={(id) => setSelectedGroupId(id)}
          />
        </PageCol>

        <PageCol span={5} spanLg={5} spanMd={2} spanSm={1}>
          <RecentActivityCard activities={displayedActivities} maxRows={6} />
        </PageCol>
      </PageGrid>
    </div>
  );
}
