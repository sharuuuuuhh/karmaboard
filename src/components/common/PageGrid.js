import React from "react";

/**
 * PageGrid
 * Fluid 12-column responsive grid system for Karmayodha.
 * Breakpoints:
 *   < 768px:   1 column
 *   768-1199px: 2 columns / 6-col simplified
 *   1200-1599px: 12 columns
 *   >= 1600px: 12 columns (ultra-wide fluid layout)
 */
export default function PageGrid({
  children,
  gap = 20,
  style = {},
  className = "",
  columns = 12,
  alignItems = "stretch",
}) {
  return (
    <div
      className={`page-grid ${className}`}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap,
        alignItems,
        width: "100%",
        minWidth: 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/**
 * PageCol
 * Column item with responsive span capabilities.
 */
export function PageCol({
  children,
  span,
  col,
  spanXl,
  colXl,
  spanLg,
  colLg,
  spanMd,
  colMd,
  spanSm,
  colSm,
  style = {},
  className = "",
}) {
  const s = col ?? span ?? 12;
  const sLg = colLg ?? spanLg;
  const sXl = colXl ?? spanXl;
  const sMd = colMd ?? spanMd;
  const sSm = colSm ?? spanSm;

  const colClass = [
    "page-col",
    s ? `col-${s}` : "",
    sLg ? `col-lg-${sLg}` : "",
    sXl ? `col-xl-${sXl}` : "",
    sMd ? `col-md-${sMd}` : "",
    sSm ? `col-sm-${sSm}` : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={colClass}
      style={{
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

