import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths, isToday, getDate, getDaysInMonth, startOfMonth } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { getStartOfWeekIST } from "../../utils/dateUtils";

// --- MAIN COMPONENT ---
export const GlassCalendar = React.forwardRef(
  ({
    className,
    selectedDate: propSelectedDate,
    onDateSelect,
    onMonthChange,
    activePeriod = "month",
    onPeriodChange,
    selectedWeekOffset = 0,
    ...props
  }, ref) => {
    const [currentMonth, setCurrentMonth] = React.useState(propSelectedDate || new Date());
    const [selectedDate, setSelectedDate] = React.useState(propSelectedDate || new Date());
    const [viewMode, setViewMode] = React.useState(activePeriod === "week" ? "month" : activePeriod);
    const [hoveredWeekStart, setHoveredWeekStart] = React.useState(null);

    React.useEffect(() => {
      if (propSelectedDate) {
        setSelectedDate(propSelectedDate);
        setCurrentMonth(propSelectedDate);
      }
    }, [propSelectedDate]);

    React.useEffect(() => {
      if (activePeriod) {
        setViewMode(activePeriod === "week" ? "month" : activePeriod);
      }
    }, [activePeriod]);

    // Calculate start of selected week (Monday 00:00:00 IST)
    const selectedWeekStart = React.useMemo(() => {
      return getStartOfWeekIST(selectedDate);
    }, [selectedDate]);

    // Check if a date belongs to the selected week (Mon to Sun)
    const isInSelectedWeek = React.useCallback(
      (date) => {
        const weekStart = getStartOfWeekIST(date);
        return Math.abs(weekStart.getTime() - selectedWeekStart.getTime()) < 3600000 * 12;
      },
      [selectedWeekStart]
    );

    // Check if a date belongs to the hovered week
    const isInHoveredWeek = React.useCallback(
      (date) => {
        if (!hoveredWeekStart || viewMode !== "week") return false;
        const weekStart = getStartOfWeekIST(date);
        return Math.abs(weekStart.getTime() - hoveredWeekStart.getTime()) < 3600000 * 12;
      },
      [hoveredWeekStart, viewMode]
    );

    // Generate days for the current displayed month
    const monthDays = React.useMemo(() => {
      const start = startOfMonth(currentMonth);
      const totalDays = getDaysInMonth(currentMonth);
      const days = [];
      for (let i = 0; i < totalDays; i++) {
        const date = new Date(start.getFullYear(), start.getMonth(), i + 1);
        const dayOfWeek = date.getDay(); // 0 is Sun, 1 is Mon ... 6 is Sat
        days.push({
          date,
          dayOfWeek,
          isToday: isToday(date),
        });
      }
      return days;
    }, [currentMonth]);

    const isCurrentOrFutureMonth = React.useMemo(() => {
      const now = new Date();
      return (
        currentMonth.getFullYear() > now.getFullYear() ||
        (currentMonth.getFullYear() === now.getFullYear() &&
          currentMonth.getMonth() >= now.getMonth())
      );
    }, [currentMonth]);

    const handleDateClick = (date) => {
      setSelectedDate(date);
      onDateSelect?.(date);
    };

    const handlePrevMonth = () => {
      const newMonth = subMonths(currentMonth, 1);
      setCurrentMonth(newMonth);
      setSelectedDate(newMonth);
      onMonthChange?.(newMonth);
    };

    const handleNextMonth = () => {
      const now = new Date();
      const nextMonth = addMonths(currentMonth, 1);
      if (
        nextMonth.getFullYear() > now.getFullYear() ||
        (nextMonth.getFullYear() === now.getFullYear() && nextMonth.getMonth() > now.getMonth())
      ) {
        return;
      }
      setCurrentMonth(nextMonth);
      setSelectedDate(nextMonth);
      onMonthChange?.(nextMonth);
    };

    const handlePeriodTab = (tab) => {
      setViewMode(tab);
      onPeriodChange?.(tab);
    };

    return (
      <div
        ref={ref}
        style={{
          background: "#FFFFFF",
          border: "1px solid var(--border)",
          boxShadow: "0 16px 40px rgba(22, 22, 26, 0.12), 0 2px 6px rgba(22, 22, 26, 0.04)",
          borderRadius: "20px",
          padding: "20px",
          width: "320px",
          color: "var(--ink)",
          fontFamily: "var(--font-body)",
          zIndex: 1000,
        }}
        className={cn("glass-calendar-popup", className)}
        {...props}
      >
        {/* Header Bar: Period Switcher */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "12px", marginBottom: "12px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", gap: "3px", background: "var(--surface-subtle)", border: "1px solid var(--border)", padding: "3px", borderRadius: "var(--radius-pill)", fontSize: "12px", fontWeight: "600" }}>
            <button
              type="button"
              onClick={() => handlePeriodTab("month")}
              style={{
                border: "none",
                cursor: "pointer",
                padding: "4px 12px",
                borderRadius: "var(--radius-pill)",
                background: viewMode === "month" ? "#FFFFFF" : "transparent",
                color: viewMode === "month" ? "var(--ink)" : "var(--muted)",
                boxShadow: viewMode === "month" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                fontWeight: viewMode === "month" ? "700" : "500",
                fontFamily: "var(--font-body)",
                transition: "all 0.15s ease",
              }}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => handlePeriodTab("all")}
              style={{
                border: "none",
                cursor: "pointer",
                padding: "4px 12px",
                borderRadius: "var(--radius-pill)",
                background: viewMode === "all" ? "#FFFFFF" : "transparent",
                color: viewMode === "all" ? "var(--ink)" : "var(--muted)",
                boxShadow: viewMode === "all" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                fontWeight: viewMode === "all" ? "700" : "500",
                fontFamily: "var(--font-body)",
                transition: "all 0.15s ease",
              }}
            >
              All Time
            </button>
          </div>

          <span className="tabular-nums" style={{ fontSize: "11px", fontWeight: "700", fontFamily: "var(--font-numeric)", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)" }}>
            {format(selectedDate, "MMM yyyy")}
          </span>
        </div>

        {/* Month Navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <div>
            <div style={{ fontWeight: "800", fontSize: "16px", color: "var(--ink)", fontFamily: "var(--font-display)", letterSpacing: "-0.01em" }}>
              {format(currentMonth, "MMMM yyyy")}
            </div>
            <div style={{ fontSize: "11px", color: "var(--muted)", fontFamily: "var(--font-body)" }}>
              Pick month to inspect stats
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{
                border: "1px solid var(--border)",
                background: "var(--surface-subtle)",
                padding: "6px",
                borderRadius: "8px",
                cursor: "pointer",
                color: "var(--ink)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#EDE8DF")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface-subtle)")}
              aria-label="Previous month"
            >
              <ChevronLeft size={16} strokeWidth={2.2} />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              disabled={isCurrentOrFutureMonth}
              style={{
                border: "1px solid var(--border)",
                background: "var(--surface-subtle)",
                padding: "6px",
                borderRadius: "8px",
                cursor: isCurrentOrFutureMonth ? "not-allowed" : "pointer",
                color: isCurrentOrFutureMonth ? "rgba(107, 107, 114, 0.4)" : "var(--ink)",
                opacity: isCurrentOrFutureMonth ? 0.45 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => {
                if (!isCurrentOrFutureMonth) e.currentTarget.style.background = "#EDE8DF";
              }}
              onMouseLeave={(e) => (e.currentTarget.style.background = "var(--surface-subtle)")}
              aria-label="Next month"
            >
              <ChevronRight size={16} strokeWidth={2.2} />
            </button>
          </div>
        </div>

        {/* Day-of-week header */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", marginBottom: "8px" }}>
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <span key={day} style={{ fontSize: "11px", fontWeight: "700", color: "var(--muted)", textTransform: "uppercase", padding: "4px 0", fontFamily: "var(--font-body)" }}>
              {day}
            </span>
          ))}
        </div>

        {/* Days Grid */}
        <div
          style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px 0", textAlign: "center" }}
          onMouseLeave={() => setHoveredWeekStart(null)}
        >
          {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, idx) => (
            <div key={`empty-${idx}`} style={{ height: "34px" }} />
          ))}

          {monthDays.map((day) => {
            const isWeekActive = viewMode === "week" && isInSelectedWeek(day.date);
            const isWeekHovered = isInHoveredWeek(day.date);
            const isExactDay = viewMode !== "week" && (
              day.date.getFullYear() === selectedDate.getFullYear() &&
              day.date.getMonth() === selectedDate.getMonth() &&
              day.date.getDate() === selectedDate.getDate()
            );
            const isCurrentToday = day.isToday;

            // Highlight bar shapes for week view: rounded corners on the ends (Sunday and Saturday, or month start/end)
            const isFirstDayOfWeek = day.dayOfWeek === 0 || day.date.getDate() === 1;
            const isLastDayOfWeek = day.dayOfWeek === 6 || day.date.getDate() === getDaysInMonth(currentMonth);

            let bg = "transparent";
            let textColor = "var(--ink)";
            let borderRadius = "8px";

            if (isWeekActive) {
              bg = "var(--ink)";
              textColor = "#FFFFFF";
              borderRadius = `${isFirstDayOfWeek ? "12px" : "0"} ${isLastDayOfWeek ? "12px" : "0"} ${isLastDayOfWeek ? "12px" : "0"} ${isFirstDayOfWeek ? "12px" : "0"}`;
            } else if (isWeekHovered) {
              bg = "var(--surface-subtle)";
              textColor = "var(--ink)";
              borderRadius = `${isFirstDayOfWeek ? "12px" : "0"} ${isLastDayOfWeek ? "12px" : "0"} ${isLastDayOfWeek ? "12px" : "0"} ${isFirstDayOfWeek ? "12px" : "0"}`;
            } else if (isExactDay) {
              bg = "var(--ink)";
              textColor = "#FFFFFF";
              borderRadius = "10px";
            } else if (isCurrentToday) {
              bg = "rgba(179, 32, 42, 0.08)";
              textColor = "var(--crimson)";
              borderRadius = "10px";
            }

            return (
              <div
                key={day.date.toISOString()}
                onMouseEnter={() => {
                  if (viewMode === "week") {
                    setHoveredWeekStart(getStartOfWeekIST(day.date));
                  }
                }}
                style={{
                  padding: "1px 0",
                  background: bg,
                  borderRadius,
                  transition: "background 0.12s ease",
                }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => handleDateClick(day.date)}
                  style={{
                    height: "32px",
                    width: "32px",
                    margin: "0 auto",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "12.5px",
                    fontWeight: isWeekActive || isExactDay || isCurrentToday ? "700" : "500",
                    cursor: "pointer",
                    border: "none",
                    background: "transparent",
                    color: textColor,
                    position: "relative",
                    fontFamily: "var(--font-numeric)",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {getDate(day.date)}
                  {isCurrentToday && !isWeekActive && !isExactDay && (
                    <span style={{ position: "absolute", bottom: "3px", width: "4px", height: "4px", borderRadius: "50%", background: "var(--crimson)" }} />
                  )}
                </motion.button>
              </div>
            );
          })}
        </div>

        {/* Quick presets footer */}
        <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: "var(--muted)" }}>
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              handlePeriodTab("month");
              setCurrentMonth(now);
              setSelectedDate(now);
              onMonthChange?.(now);
              onDateSelect?.(now);
            }}
            style={{ border: "none", background: "none", color: "var(--crimson)", fontWeight: "700", cursor: "pointer", padding: 0, fontFamily: "var(--font-body)" }}
          >
            Current Month
          </button>
          <span style={{ fontFamily: "var(--font-numeric)" }}>Asia/Kolkata</span>
        </div>
      </div>
    );
  }
);

GlassCalendar.displayName = "GlassCalendar";
