import React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export function StatCard({ title, value, delta, deltaLabel = "vs last period", icon }) {
  const isPositive = delta && delta.startsWith("+");
  const isNegative = delta && delta.startsWith("-");

  const formattedValue = typeof value === "number" ? value.toLocaleString("en-IN") : value;

  return (
    <div className="ky-card" style={{ padding: "var(--space-4) var(--space-5)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--space-2)" }}>
        <span style={{ fontSize: "0.8125rem", fontWeight: 500, color: "var(--text-secondary)" }}>
          {title}
        </span>
        {icon && (
          <span style={{ color: "var(--text-muted)", display: "inline-flex" }}>
            {icon}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--space-3)" }}>
        <span className="stat-value tabular-nums" style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)" }}>
          {formattedValue}
        </span>

        {delta && (
          <span
            className="tabular-nums"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "2px",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: isPositive ? "var(--status-up)" : isNegative ? "var(--status-down)" : "var(--status-neutral)",
              backgroundColor: isPositive ? "var(--status-up-bg)" : isNegative ? "var(--status-down-bg)" : "var(--status-neutral-bg)",
              padding: "1px 6px",
              borderRadius: "var(--radius-full)",
            }}
            title={`${delta} ${deltaLabel}`}
          >
            {isPositive && <ArrowUpRight size={12} strokeWidth={2.5} />}
            {isNegative && <ArrowDownRight size={12} strokeWidth={2.5} />}
            {!isPositive && !isNegative && <Minus size={10} />}
            {delta}
          </span>
        )}
      </div>
    </div>
  );
}

