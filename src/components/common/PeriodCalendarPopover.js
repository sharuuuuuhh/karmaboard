import React, { useState, useRef, useEffect, useMemo } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { GlassCalendar } from "../ui/glass-calendar";
import { getMonthBoundaries, getWeekBoundaries } from "../../utils/dateUtils";

export default function PeriodCalendarPopover({
  period = "month",
  offset = 0,
  dateLabel,
  onPeriodChange,
  onOffsetChange,
  onDateSelect,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handlePeriodTab = (newPeriod) => {
    onPeriodChange?.(newPeriod);
  };

  const handleDatePick = (date) => {
    // When a specific date tile is clicked, let parent know and close popover
    onDateSelect?.(date);
    setIsOpen(false);
  };

  const handleMonthChange = (newMonthDate) => {
    // When navigating months via < or > buttons, update the data without closing the popover
    if (period === "month") {
      const now = new Date();
      const monthDiff =
        (newMonthDate.getFullYear() - now.getFullYear()) * 12 +
        (newMonthDate.getMonth() - now.getMonth());
      onOffsetChange?.(Math.min(0, monthDiff));
    } else if (period === "week") {
      const now = new Date();
      const msPerWeek = 7 * 24 * 60 * 60 * 1000;
      const weekDiff = Math.round(
        (newMonthDate.getTime() - now.getTime()) / msPerWeek
      );
      onOffsetChange?.(Math.min(0, weekDiff));
    }
    onDateSelect?.(newMonthDate);
  };

  // Compute selected date matching the current period and offset
  const currentSelectedDate = useMemo(() => {
    if (period === "month") {
      const b = getMonthBoundaries(offset);
      return b.start || new Date();
    }
    if (period === "week") {
      const b = getWeekBoundaries(offset);
      return b.start || new Date();
    }
    return new Date();
  }, [period, offset]);

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
      <style>{`
        .period-calendar-popover-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          z-index: 9999;
          animation: fadeIn 0.18s ease-out;
        }
        @media (max-width: 768px) {
          .period-calendar-popover-dropdown {
            position: fixed !important;
            top: 70px !important;
            left: 50% !important;
            right: auto !important;
            transform: translateX(-50%) !important;
            max-width: calc(100vw - 24px) !important;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25) !important;
          }
        }
      `}</style>
      {/* Trigger Bar - Prominent, minimal pill */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "#FFFFFF",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-pill)",
          padding: "4px 10px 4px 6px",
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
          height: 42,
          boxSizing: "border-box",
        }}
      >
        {period !== "all" && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOffsetChange?.(offset - 1);
            }}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--text-secondary)",
              cursor: "pointer",
              border: "none",
              background: "transparent",
              transition: "background 0.15s ease, color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            title="Previous period"
            aria-label="Previous period"
          >
            <ChevronLeft size={18} />
          </button>
        )}

        {/* Center clickable button to open calendar */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 14px",
            borderRadius: "var(--radius-pill)",
            fontSize: 13.5,
            fontWeight: 700,
            letterSpacing: "-0.01em",
            color: "var(--text-primary)",
            whiteSpace: "nowrap",
            background: isOpen ? "var(--surface-subtle)" : "transparent",
            border: "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          title="Click to open calendar"
          aria-expanded={isOpen}
        >
          <Calendar size={16} color="#4f46e5" />
          <span>{dateLabel || "Select Date"}</span>
          <ChevronDown
            size={14}
            color="var(--text-muted)"
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          />
        </button>

        {period !== "all" && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOffsetChange?.(Math.min(0, offset + 1));
            }}
            disabled={offset >= 0}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: offset >= 0 ? "var(--text-muted)" : "var(--text-secondary)",
              cursor: offset >= 0 ? "not-allowed" : "pointer",
              border: "none",
              background: "transparent",
              transition: "background 0.15s ease, color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (offset < 0) e.currentTarget.style.background = "#f1f5f9";
            }}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            title="Next period"
            aria-label="Next period"
          >
            <ChevronRight size={18} />
          </button>
        )}
      </div>

      {/* Pop-up Glass Calendar */}
      {isOpen && (
        <div className="period-calendar-popover-dropdown">
          <GlassCalendar
            activePeriod={period}
            selectedDate={currentSelectedDate}
            onPeriodChange={(newPeriod) => {
              handlePeriodTab(newPeriod);
            }}
            onMonthChange={handleMonthChange}
            onDateSelect={handleDatePick}
          />
        </div>
      )}
    </div>
  );
}

