import React, { useState, useMemo } from "react";
import { TrendingUp } from "lucide-react";
import { getDailyKarmaSeries } from "../../utils/dashboardHelpers";

export default function ChartCard({
  events = [],
  totalKarma = 0,
  percentageChange = "+14.2%",
  range = "week",
  baseDate = new Date(),
  title,
  showRangeSelector = false,
  onRangeChange,
}) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const dailyData = useMemo(() => {
    return getDailyKarmaSeries(events, range, baseDate);
  }, [events, range, baseDate]);

  // SVG Chart Geometry
  const width = 460;
  const height = 150;
  const paddingX = 24;
  const paddingTop = 20;
  const paddingBottom = 26;
  const chartH = height - paddingTop - paddingBottom;
  const chartW = width - paddingX * 2;
  const baselineY = paddingTop + chartH;

  const maxKarma = useMemo(() => {
    return Math.max(100, ...dailyData.map((d) => d.karma));
  }, [dailyData]);

  // Calculate coordinates for all days in the series
  const allPoints = useMemo(() => {
    if (dailyData.length === 0) return [];
    return dailyData.map((d, idx) => {
      const x = paddingX + (idx / Math.max(1, dailyData.length - 1)) * chartW;
      const y = paddingTop + chartH - (d.karma / maxKarma) * chartH;
      return { ...d, x, y };
    });
  }, [dailyData, chartW, chartH, maxKarma]);

  // Points that are past or today (not future)
  const activePoints = useMemo(() => {
    const active = allPoints.filter((p) => !p.isFuture);
    // If no points are marked non-future (e.g. edge case), fallback to all points
    return active.length > 0 ? active : allPoints;
  }, [allPoints]);

  // Generate SVG path string for active points
  const pathD = useMemo(() => {
    if (activePoints.length === 0) return "";
    if (activePoints.length === 1) {
      const p = activePoints[0];
      return `M ${paddingX} ${baselineY} Q ${(paddingX + p.x) / 2} ${p.y}, ${p.x} ${p.y}`;
    }
    return activePoints.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      // Smooth cubic bezier curve
      const prev = activePoints[i - 1];
      const cx = (prev.x + p.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
    }, "");
  }, [activePoints, baselineY, paddingX]);

  // Dashed projection path for future days
  const futurePathD = useMemo(() => {
    if (activePoints.length === 0 || activePoints.length === allPoints.length) return "";
    const lastActive = activePoints[activePoints.length - 1];
    const futurePts = allPoints.slice(activePoints.length);
    if (futurePts.length === 0) return "";

    return futurePts.reduce((acc, p, i) => {
      const prev = i === 0 ? lastActive : futurePts[i - 1];
      const cx = (prev.x + p.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
    }, `M ${lastActive.x} ${lastActive.y}`);
  }, [activePoints, allPoints]);

  // Filled area under active curve
  const areaD = useMemo(() => {
    if (!pathD || activePoints.length === 0) return "";
    const first = activePoints[0];
    const last = activePoints[activePoints.length - 1];
    if (activePoints.length === 1) {
      return `${pathD} L ${last.x} ${baselineY} L ${paddingX} ${baselineY} Z`;
    }
    return `${pathD} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
  }, [pathD, activePoints, baselineY, paddingX]);

  const ranges = [
    { id: "week", label: "Week" },
    { id: "month", label: "Month" },
    { id: "all", label: "All" },
  ];

  return (
    <div
      style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        boxShadow: "var(--shadow-soft)",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 280,
        height: "100%",
        position: "relative",
      }}
    >
      {/* Top Row: Title & Total Karma Metric */}
      <div>
        <div
          style={{
            fontSize: 16,
            fontWeight: 700,
            fontFamily: "var(--font-display)",
            color: "var(--ink)",
            letterSpacing: "-0.02em",
            marginBottom: 10,
          }}
        >
          {title ||
            (range === "month"
              ? "Karma this month"
              : range === "all"
              ? "Karma all time"
              : "Karma this week")}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            className="tabular-nums type-display"
            style={{
              fontSize: 48,
              fontWeight: 800,
              fontFamily: "var(--font-display)",
              color: "var(--ink)",
              letterSpacing: "-0.03em",
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {totalKarma.toLocaleString()}
          </span>
          <span
            className="tabular-nums"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "4px 10px",
              borderRadius: "var(--radius-pill)",
              background: "rgba(46, 158, 91, 0.12)",
              color: "var(--green)",
              fontSize: 12.5,
              fontWeight: 700,
              fontFamily: "var(--font-numeric)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <TrendingUp size={14} />
            <span>{percentageChange}</span>
          </span>
        </div>
      </div>

      {/* Center: Line & Area Chart */}
      <div
        style={{
          position: "relative",
          width: "100%",
          margin: "12px 0 0",
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: "100%", height: "auto", overflow: "visible" }}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#B3202A" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#B3202A" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Baseline guide line */}
          <line
            x1={paddingX}
            y1={baselineY}
            x2={paddingX + chartW}
            y2={baselineY}
            stroke="#E8E4DC"
            strokeWidth="2"
            strokeLinecap="round"
          />

          {/* Area Fill for active days */}
          {areaD && <path d={areaD} fill="url(#areaGradient)" />}

          {/* Future dashed projection line */}
          {futurePathD && (
            <path
              d={futurePathD}
              fill="none"
              stroke="#DCD7CC"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeOpacity="0.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Line Stroke for active days */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="var(--crimson)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Data Points & Labels */}
          {allPoints.map((p, idx) => {
            const isHovered = hoveredPoint === idx;
            return (
              <g key={idx}>
                {p.isFuture ? (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={3.5}
                    fill="#FFFFFF"
                    stroke="#DCD7CC"
                    strokeWidth="2"
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ) : (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 5.5 : 4}
                    fill="#FFFFFF"
                    stroke="var(--crimson)"
                    strokeWidth={isHovered ? 2.5 : 2}
                    style={{ cursor: "pointer", transition: "r 0.15s ease, stroke-width 0.15s ease" }}
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                )}

                {/* Day label below baseline */}
                <text
                  x={p.x}
                  y={height - 2}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={isHovered ? "700" : "600"}
                  fontFamily="var(--font-body)"
                  fill={p.isFuture ? "#A0A0A8" : isHovered ? "var(--crimson)" : "var(--muted)"}
                >
                  {p.name}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Pill */}
        {hoveredPoint !== null && allPoints[hoveredPoint] && (
          <div
            className="tabular-nums"
            style={{
              position: "absolute",
              top: Math.max(0, allPoints[hoveredPoint].y - 36),
              left: `${(allPoints[hoveredPoint].x / width) * 100}%`,
              transform: "translateX(-50%)",
              background: "#121214",
              color: "#FFFFFF",
              padding: "4px 10px",
              borderRadius: "var(--radius-pill)",
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "var(--font-numeric)",
              fontVariantNumeric: "tabular-nums",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              zIndex: 10,
            }}
          >
            {allPoints[hoveredPoint].karma.toLocaleString()} karma • {allPoints[hoveredPoint].name}
            {allPoints[hoveredPoint].label ? ` (${allPoints[hoveredPoint].label})` : ""}
          </div>
        )}
      </div>

      {/* Bottom Row: Range Filter Pills (hidden when controlled globally) */}
      {showRangeSelector && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "rgba(255, 255, 255, 0.45)",
            padding: 3,
            borderRadius: "var(--radius-pill)",
            width: "fit-content",
            alignSelf: "flex-start",
          }}
        >
          {ranges.map((r) => {
            const isActive = range === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => onRangeChange && onRangeChange(r.id)}
                style={{
                  padding: "4px 14px",
                  borderRadius: "var(--radius-pill)",
                  fontSize: 12,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                  background: isActive ? "#FFFFFF" : "transparent",
                  boxShadow: isActive ? "0 1px 3px rgba(0, 0, 0, 0.08)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

