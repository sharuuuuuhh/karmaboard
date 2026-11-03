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
        background: "var(--chart-tint)",
        borderRadius: "var(--radius-card)",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        minHeight: 280,
        position: "relative",
      }}
    >
      {/* Top Row: Title & Total Karma Metric */}
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--text-secondary)",
            marginBottom: 6,
          }}
        >
          {title ||
            (range === "month"
              ? "Karma this month"
              : range === "all"
              ? "Karma all time"
              : "Karma this week")}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <span
            className="tabular-nums type-display"
            style={{
              fontSize: 34,
              fontWeight: 800,
              fontFamily: "var(--font-display)",
              fontVariationSettings: '"wdth" var(--display-wdth)',
              color: "var(--text-primary)",
              letterSpacing: "-0.01em",
              lineHeight: 1.02,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {totalKarma.toLocaleString()}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 3,
              fontSize: 12,
              fontWeight: 700,
              color: "var(--status-up)",
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
          margin: "8px 0 0",
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: "100%", height: "auto", overflow: "visible" }}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4C9AEE" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#4C9AEE" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Baseline guide line */}
          <line
            x1={paddingX}
            y1={baselineY}
            x2={paddingX + chartW}
            y2={baselineY}
            stroke="currentColor"
            strokeOpacity="0.08"
            strokeWidth="1"
          />

          {/* Area Fill for active days */}
          {areaD && <path d={areaD} fill="url(#areaGradient)" />}

          {/* Future dashed projection line */}
          {futurePathD && (
            <path
              d={futurePathD}
              fill="none"
              stroke="var(--chart-line)"
              strokeWidth="2"
              strokeDasharray="4 4"
              strokeOpacity="0.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Line Stroke for active days */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="var(--chart-line)"
              strokeWidth="2.8"
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
                    r={2.5}
                    fill="none"
                    stroke="currentColor"
                    strokeOpacity="0.25"
                    strokeWidth="1.5"
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                ) : (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 5.5 : 3.5}
                    fill="#FFFFFF"
                    stroke="var(--chart-line)"
                    strokeWidth={isHovered ? 2.5 : 2}
                    style={{ cursor: "pointer", transition: "r 0.15s ease, stroke-width 0.15s ease" }}
                    onMouseEnter={() => setHoveredPoint(idx)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  />
                )}

                {/* Day label below baseline */}
                <text
                  x={p.x}
                  y={height - 4}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={isHovered ? "700" : "600"}
                  fill={p.isFuture ? "var(--text-muted)" : "var(--text-secondary)"}
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

