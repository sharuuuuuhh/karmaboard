import React, { useState, useRef, useEffect, useMemo } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { GlassCalendar } from "../ui/glass-calendar";
import { getMonthBoundaries } from "../../utils/dateUtils";

export default function PeriodCalendarPopover({
  period = "month",
  offset = 0,
  dateLabel,
  onPeriodChange,
  onOffsetChange,
  onDateSelect,
  fullWidth = false,
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
    const now = new Date();
    const monthDiff =
      (newMonthDate.getFullYear() - now.getFullYear()) * 12 +
      (newMonthDate.getMonth() - now.getMonth());
    onOffsetChange?.(Math.min(0, monthDiff));
    onDateSelect?.(newMonthDate);
  };

  // Compute selected date matching the current period and offset
  const currentSelectedDate = useMemo(() => {
    if (period === "month") {
      const b = getMonthBoundaries(offset);
      return b.start || new Date();
    }
    return new Date();
  }, [period, offset]);

  return (
    <div
      ref={containerRef}
      className={`period-calendar-popover-root ${fullWidth ? "full-width" : ""}`}
      style={{
        position: "relative",
        display: fullWidth ? "block" : "inline-block",
        width: fullWidth ? "100%" : "auto",
        zIndex: isOpen ? 10000 : 1,
      }}
    >
      <style>{`
        .period-calendar-popover-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          z-index: 99999;
          animation: fadeIn 0.18s ease-out;
        }
        @media (max-width: 768px) {
          .period-calendar-popover-root {
            display: block !important;
            width: 100% !important;
          }
          .period-calendar-popover-pill {
            width: 100% !important;
            justify-content: space-between !important;
          }
          .period-calendar-popover-dropdown {
            position: fixed !important;
            top: 70px !important;
            left: 50% !important;
            right: auto !important;
            transform: translateX(-50%) !important;
            max-width: calc(100vw - 24px) !important;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.25) !important;
            z-index: 999999 !important;
          }
        }
      `}</style>
      {/* Trigger Bar - Refined Japanese Theme Pill */}
      <div
        className="period-calendar-popover-pill"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: fullWidth ? "space-between" : "flex-start",
          width: fullWidth ? "100%" : "auto",
          gap: 4,
          background: "rgba(255, 252, 246, 0.92)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-pill)",
          padding: fullWidth ? "4px 12px" : "3px 8px 3px 6px",
          boxShadow: "0 1px 2px rgba(22, 22, 26, 0.04), 0 4px 16px rgba(22, 22, 26, 0.04)",
          height: fullWidth ? 48 : 40,
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
              width: 28,
              height: 28,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink)",
              cursor: "pointer",
              border: "none",
              background: "transparent",
              transition: "background 0.15s ease, color 0.15s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-subtle)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            title="Previous period"
            aria-label="Previous period"
          >
            <ChevronLeft size={16} strokeWidth={2.2} />
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
            padding: "5px 12px",
            borderRadius: "var(--radius-pill)",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            fontFamily: "var(--font-body)",
            color: "var(--ink)",
            whiteSpace: "nowrap",
            background: isOpen ? "var(--surface-subtle)" : "transparent",
            border: "none",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            if (!isOpen) e.currentTarget.style.background = "var(--surface-subtle)";
          }}
          onMouseLeave={(e) => {
            if (!isOpen) e.currentTarget.style.background = "transparent";
          }}
          title="Click to open calendar"
          aria-expanded={isOpen}
        >
          <Calendar size={15} color="var(--crimson)" strokeWidth={2.2} />
          <span className="tabular-nums" style={{ fontFamily: "var(--font-body)" }}>
            {dateLabel || "Select Date"}
          </span>
          <ChevronDown
            size={13}
            strokeWidth={2}
            color={isOpen ? "var(--crimson)" : "var(--muted)"}
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease, color 0.15s ease",
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
              width: 28,
              height: 28,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: offset >= 0 ? "rgba(107, 107, 114, 0.35)" : "var(--ink)",
              cursor: offset >= 0 ? "not-allowed" : "pointer",
              border: "none",
              background: "transparent",
              transition: "background 0.15s ease, color 0.15s ease",
            }}
            onMouseEnter={(e) => {
              if (offset < 0) e.currentTarget.style.background = "var(--surface-subtle)";
            }}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            title="Next period"
            aria-label="Next period"
          >
            <ChevronRight size={16} strokeWidth={2.2} />
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

