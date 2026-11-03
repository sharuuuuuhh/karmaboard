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
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(226, 232, 240, 0.9)",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.18), 0 0 0 1px rgba(0,0,0,0.05)",
          borderRadius: "24px",
          padding: "20px",
          width: "320px",
          color: "#1e293b",
          fontFamily: "inherit",
          zIndex: 1000,
        }}
        className={cn("glass-calendar-popup", className)}
        {...props}
      >
        {/* Header Bar: Period Switcher */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "12px", marginBottom: "12px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", gap: "4px", background: "#f1f5f9", padding: "4px", borderRadius: "10px", fontSize: "12px", fontWeight: "600" }}>
            <button
              type="button"
              onClick={() => handlePeriodTab("month")}
              style={{
                border: "none",
                cursor: "pointer",
                padding: "4px 12px",
                borderRadius: "7px",
                background: viewMode === "month" ? "#ffffff" : "transparent",
                color: viewMode === "month" ? "#0f172a" : "#64748b",
                boxShadow: viewMode === "month" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                fontWeight: "600",
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
                borderRadius: "7px",
                background: viewMode === "all" ? "#ffffff" : "transparent",
                color: viewMode === "all" ? "#0f172a" : "#64748b",
                boxShadow: viewMode === "all" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                fontWeight: "600",
              }}
            >
              All Time
            </button>
          </div>

          <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.05em", color: "#94a3b8" }}>
            {format(selectedDate, "MMM yyyy")}
          </span>
        </div>

        {/* Month Navigation */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
          <div>
            <div style={{ fontWeight: "700", fontSize: "16px", color: "#0f172a" }}>
              {format(currentMonth, "MMMM yyyy")}
            </div>
            <div style={{ fontSize: "11px", color: "#94a3b8" }}>
              Pick month to inspect stats
            </div>
          </div>
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{ border: "none", background: "#f8fafc", padding: "6px", borderRadius: "8px", cursor: "pointer", color: "#475569" }}
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              disabled={isCurrentOrFutureMonth}
              style={{
                border: "none",
                background: "#f8fafc",
                padding: "6px",
                borderRadius: "8px",
                cursor: isCurrentOrFutureMonth ? "not-allowed" : "pointer",
                color: isCurrentOrFutureMonth ? "#cbd5e1" : "#475569",
                opacity: isCurrentOrFutureMonth ? 0.45 : 1,
              }}
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Day-of-week header */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center", marginBottom: "8px" }}>
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <span key={day} style={{ fontSize: "11px", fontWeight: "600", color: "#94a3b8", textTransform: "uppercase", padding: "4px 0" }}>
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
            let textColor = "#334155";
            let borderRadius = "8px";

            if (isWeekActive) {
              bg = "#0f172a";
              textColor = "#ffffff";
              borderRadius = `${isFirstDayOfWeek ? "12px" : "0"} ${isLastDayOfWeek ? "12px" : "0"} ${isLastDayOfWeek ? "12px" : "0"} ${isFirstDayOfWeek ? "12px" : "0"}`;
            } else if (isWeekHovered) {
              bg = "#f1f5f9";
              textColor = "#0f172a";
              borderRadius = `${isFirstDayOfWeek ? "12px" : "0"} ${isLastDayOfWeek ? "12px" : "0"} ${isLastDayOfWeek ? "12px" : "0"} ${isFirstDayOfWeek ? "12px" : "0"}`;
            } else if (isExactDay) {
              bg = "#0f172a";
              textColor = "#ffffff";
              borderRadius = "12px";
            } else if (isCurrentToday) {
              bg = "#eef2ff";
              textColor = "#4f46e5";
              borderRadius = "12px";
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
                    fontSize: "12px",
                    fontWeight: isWeekActive || isExactDay || isCurrentToday ? "700" : "500",
                    cursor: "pointer",
                    border: "none",
                    background: "transparent",
                    color: textColor,
                    position: "relative",
                  }}
                >
                  {getDate(day.date)}
                  {isCurrentToday && !isWeekActive && !isExactDay && (
                    <span style={{ position: "absolute", bottom: "3px", width: "4px", height: "4px", borderRadius: "50%", background: "#4f46e5" }} />
                  )}
                </motion.button>
              </div>
            );
          })}
        </div>

        {/* Quick presets footer */}
        <div style={{ marginTop: "14px", paddingTop: "10px", borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", color: "#64748b" }}>
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
            style={{ border: "none", background: "none", color: "#4f46e5", fontWeight: "700", cursor: "pointer", padding: 0 }}
          >
            Current Month
          </button>
          <span>Asia/Kolkata</span>
        </div>
      </div>
    );
  }
);

GlassCalendar.displayName = "GlassCalendar";
