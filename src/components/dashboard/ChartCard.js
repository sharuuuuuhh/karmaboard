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

  // Points that are past or today (not future)
  const activeDays = dailyData.filter((d) => !d.isFuture);
  const maxKarma = Math.max(100, ...dailyData.map((d) => d.karma));

  // SVG Chart Geometry
  const width = 460;
  const height = 150;
  const paddingX = 24;
  const paddingTop = 20;
  const paddingBottom = 26;
  const chartH = height - paddingTop - paddingBottom;
  const chartW = width - paddingX * 2;

  // Calculate coordinates
  const points = useMemo(() => {
    if (activeDays.length === 0) return [];
    return activeDays.map((d, idx) => {
      const x = paddingX + (idx / Math.max(1, dailyData.length - 1)) * chartW;
      const y = paddingTop + chartH - (d.karma / maxKarma) * chartH;
      return { ...d, x, y };
    });
  }, [activeDays, dailyData.length, chartW, chartH, maxKarma]);

  // Generate SVG path strings
  const pathD = useMemo(() => {
    if (points.length === 0) return "";
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
    return points.reduce((acc, p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      // Smooth cubic bezier curve
      const prev = points[i - 1];
      const cx = (prev.x + p.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${p.y}, ${p.x} ${p.y}`;
    }, "");
  }, [points]);

  const areaD = useMemo(() => {
    if (points.length === 0) return "";
    const first = points[0];
    const last = points[points.length - 1];
    const baselineY = paddingTop + chartH;
    return `${pathD} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`;
  }, [pathD, points, chartH]);

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
              <stop offset="0%" stopColor="#4C9AEE" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#4C9AEE" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          {areaD && <path d={areaD} fill="url(#areaGradient)" />}

          {/* Line Stroke */}
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

          {/* Interactive Data Points */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredPoint === idx ? 5 : 3.5}
                fill="#FFFFFF"
                stroke="var(--chart-line)"
                strokeWidth={hoveredPoint === idx ? 2.5 : 2}
                style={{ cursor: "pointer", transition: "r 0.15s ease" }}
                onMouseEnter={() => setHoveredPoint(idx)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              {/* Day label below baseline */}
              <text
                x={p.x}
                y={height - 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight="500"
                fill={p.isFuture ? "var(--text-muted)" : "var(--text-secondary)"}
              >
                {p.name}
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Pill */}
        {hoveredPoint !== null && points[hoveredPoint] && (
          <div
            style={{
              position: "absolute",
              top: Math.max(0, points[hoveredPoint].y - 36),
              left: `${(points[hoveredPoint].x / width) * 100}%`,
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
            {points[hoveredPoint].karma.toLocaleString()} karma • {points[hoveredPoint].name}
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

