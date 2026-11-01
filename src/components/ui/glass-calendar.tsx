import * as React from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { format, addMonths, subMonths, isToday, getDate, getDaysInMonth, startOfMonth } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { getStartOfWeekIST } from "../../utils/dateUtils";

// --- TYPE DEFINITIONS ---
export interface Day {
  date: Date;
  dayOfWeek: number;
  isToday: boolean;
}

export interface GlassCalendarProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onMonthChange?: (date: Date) => void;
  className?: string;
  activePeriod?: "week" | "month" | "all";
  onPeriodChange?: (period: "week" | "month" | "all") => void;
  selectedWeekOffset?: number;
}

// --- MAIN COMPONENT ---
export const GlassCalendar = React.forwardRef<HTMLDivElement, GlassCalendarProps>(
  ({ className, selectedDate: propSelectedDate, onDateSelect, onMonthChange, activePeriod = "week", onPeriodChange, ...props }, ref) => {
    const [currentMonth, setCurrentMonth] = React.useState<Date>(propSelectedDate || new Date());
    const [selectedDate, setSelectedDate] = React.useState<Date>(propSelectedDate || new Date());
    const [viewMode, setViewMode] = React.useState<"week" | "month" | "all">(activePeriod);
    const [hoveredWeekStart, setHoveredWeekStart] = React.useState<Date | null>(null);

    React.useEffect(() => {
      if (propSelectedDate) {
        setSelectedDate(propSelectedDate);
        setCurrentMonth(propSelectedDate);
      }
    }, [propSelectedDate]);

    React.useEffect(() => {
      if (activePeriod) {
        setViewMode(activePeriod);
      }
    }, [activePeriod]);

    // Calculate start of selected week (Monday 00:00:00 IST)
    const selectedWeekStart = React.useMemo(() => {
      return getStartOfWeekIST(selectedDate);
    }, [selectedDate]);

    // Check if a date belongs to the selected week (Mon to Sun)
    const isInSelectedWeek = React.useCallback(
      (date: Date) => {
        const weekStart = getStartOfWeekIST(date);
        return Math.abs(weekStart.getTime() - selectedWeekStart.getTime()) < 3600000 * 12;
      },
      [selectedWeekStart]
    );

    // Check if a date belongs to the hovered week
    const isInHoveredWeek = React.useCallback(
      (date: Date) => {
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
      const days: Day[] = [];
      for (let i = 0; i < totalDays; i++) {
        const date = new Date(start.getFullYear(), start.getMonth(), i + 1);
        days.push({
          date,
          dayOfWeek: date.getDay(),
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

    const handleDateClick = (date: Date) => {
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

    const handlePeriodTab = (tab: "week" | "month" | "all") => {
      setViewMode(tab);
      onPeriodChange?.(tab);
    };

    return (
      <div
        ref={ref}
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(226, 232, 240, 0.95)",
          boxShadow: "0 20px 45px -10px rgba(15, 23, 42, 0.18), 0 0 0 1px rgba(0,0,0,0.04)",
          borderRadius: "22px",
          padding: "22px 24px",
          width: "360px",
          maxWidth: "calc(100vw - 32px)",
          color: "#0f172a",
          fontFamily: "inherit",
          zIndex: 1000,
          boxSizing: "border-box",
        }}
        className={cn("glass-calendar-popup", className)}
        {...props}
      >
        {/* Header Bar: Period Switcher Tabs & Date Chip */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingBottom: "14px",
            marginBottom: "14px",
            borderBottom: "1px solid #f1f5f9",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "4px",
              background: "#f1f5f9",
              padding: "4px",
              borderRadius: "12px",
            }}
          >
            {[
              { id: "week" as const, label: "Weekly" },
              { id: "month" as const, label: "Monthly" },
              { id: "all" as const, label: "All Time" },
            ].map((tab) => {
              const isActive = viewMode === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handlePeriodTab(tab.id)}
                  style={{
                    border: "none",
                    cursor: "pointer",
                    padding: "6px 14px",
                    borderRadius: "8px",
                    background: isActive ? "#ffffff" : "transparent",
                    color: isActive ? "#0f172a" : "#64748b",
                    boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                    fontSize: "13px",
                    fontWeight: isActive ? "700" : "500",
                    transition: "all 0.15s ease",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <span
            style={{
              fontSize: "11px",
              fontWeight: "700",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "#4f46e5",
              background: "rgba(99, 102, 241, 0.08)",
              padding: "4px 8px",
              borderRadius: "6px",
            }}
          >
            {format(selectedDate, "dd MMM")}
          </span>
        </div>

        {/* Month Navigation Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "14px",
          }}
        >
          <div>
            <div
              style={{
                fontWeight: "800",
                fontSize: "17px",
                color: "#0f172a",
                letterSpacing: "-0.015em",
              }}
            >
              {format(currentMonth, "MMMM yyyy")}
            </div>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>
              {viewMode === "week"
                ? "Click any day in a week to select it"
                : viewMode === "month"
                ? "Click any date to inspect monthly stats"
                : "Overall campus scores across all time"}
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              type="button"
              onClick={handlePrevMonth}
              style={{
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                padding: "6px",
                borderRadius: "8px",
                cursor: "pointer",
                color: "#475569",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.15s ease",
              }}
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              disabled={isCurrentOrFutureMonth}
              style={{
                border: "1px solid #e2e8f0",
                background: "#f8fafc",
                padding: "6px",
                borderRadius: "8px",
                cursor: isCurrentOrFutureMonth ? "not-allowed" : "pointer",
                color: isCurrentOrFutureMonth ? "#cbd5e1" : "#475569",
                opacity: isCurrentOrFutureMonth ? 0.45 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
              }}
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Day-of-Week Column Headers */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            textAlign: "center",
            marginBottom: "8px",
          }}
        >
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <span
              key={day}
              style={{
                fontSize: "11px",
                fontWeight: "700",
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                padding: "4px 0",
              }}
            >
              {day}
            </span>
          ))}
        </div>

        {/* Days Grid with Highlighted Weeks */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "3px 0",
            textAlign: "center",
          }}
          onMouseLeave={() => setHoveredWeekStart(null)}
        >
          {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, idx) => (
            <div key={`empty-${idx}`} style={{ height: "36px" }} />
          ))}

          {monthDays.map((day) => {
            const isWeekActive = viewMode === "week" && isInSelectedWeek(day.date);
            const isWeekHovered = isInHoveredWeek(day.date);
            const isExactDay =
              viewMode !== "week" &&
              day.date.getFullYear() === selectedDate.getFullYear() &&
              day.date.getMonth() === selectedDate.getMonth() &&
              day.date.getDate() === selectedDate.getDate();
            const isCurrentToday = day.isToday;

            const isFirstDayOfWeek = day.dayOfWeek === 0 || day.date.getDate() === 1;
            const isLastDayOfWeek =
              day.dayOfWeek === 6 || day.date.getDate() === getDaysInMonth(currentMonth);

            let textColor = "#334155";
            let borderRadius = "8px";

            if (isWeekActive) {
              textColor = "#ffffff";
              borderRadius = `${isFirstDayOfWeek ? "14px" : "0"} ${
                isLastDayOfWeek ? "14px" : "0"
              } ${isLastDayOfWeek ? "14px" : "0"} ${isFirstDayOfWeek ? "14px" : "0"}`;
            } else if (isWeekHovered) {
              textColor = "#0f172a";
              borderRadius = `${isFirstDayOfWeek ? "14px" : "0"} ${
                isLastDayOfWeek ? "14px" : "0"
              } ${isLastDayOfWeek ? "14px" : "0"} ${isFirstDayOfWeek ? "14px" : "0"}`;
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
                  background: isWeekActive ? "#0f172a" : isWeekHovered ? "#f1f5f9" : "transparent",
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
                    height: "34px",
                    width: "34px",
                    margin: "0 auto",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "13px",
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
                    <span
                      style={{
                        position: "absolute",
                        bottom: "3px",
                        width: "4px",
                        height: "4px",
                        borderRadius: "50%",
                        background: "#4f46e5",
                      }}
                    />
                  )}
                </motion.button>
              </div>
            );
          })}
        </div>

        {/* Quick Presets & Timezone Footer */}
        <div
          style={{
            marginTop: "16px",
            paddingTop: "12px",
            borderTop: "1px solid #f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "12px",
            color: "#64748b",
          }}
        >
          <button
            type="button"
            onClick={() => handleDateClick(new Date())}
            style={{
              border: "none",
              background: "none",
              color: "#4f46e5",
              fontWeight: "700",
              cursor: "pointer",
              padding: "2px 0",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <RotateCcw size={12} />
            <span>Current Week</span>
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#10b981",
                display: "inline-block",
              }}
            />
            <span style={{ fontSize: "11px", fontWeight: "500" }}>Asia/Kolkata (IST)</span>
          </div>
        </div>
      </div>
    );
  }
);

GlassCalendar.displayName = "GlassCalendar";

GlassCalendar.displayName = "GlassCalendar";
