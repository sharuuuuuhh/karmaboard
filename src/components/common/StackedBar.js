import React from "react";

export function StackedBar({ items = [], total = 0, height = 12 }) {
  if (!items.length || total <= 0) {
    return (
      <div
        className="stacked-bar-container"
        style={{ height: `${height}px`, backgroundColor: "var(--subtle-surface)" }}
      />
    );
  }

  // Pre-defined sequence of subtle tints for slices
  const sliceColors = [
    "#4F46E5", "#059669", "#D97706", "#E11D48", "#7C3AED",
    "#0891B2", "#EA580C", "#0D9488", "#C026D3", "#2563EB",
    "#65A30D", "#475569"
  ];

  return (
    <div className="stacked-bar-container" style={{ height: `${height}px` }}>
      {items.map((item, idx) => {
        if (!item.karma || item.karma <= 0) return null;
        const widthPercent = (item.karma / total) * 100;
        const color = sliceColors[idx % sliceColors.length];

        return (
          <div
            key={item.id || idx}
            className="stacked-bar-slice"
            style={{
              width: `${widthPercent}%`,
              backgroundColor: color,
            }}
            title={`${item.name}: ${item.karma.toLocaleString("en-IN")} karma (${Math.round(widthPercent)}%)`}
          />
        );
      })}
    </div>
  );
}

