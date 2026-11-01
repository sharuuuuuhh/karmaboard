import React from "react";
import { CREST_REGISTRY } from "../../crests";

/**
 * TeamPageCard
 * Reusable chamfered solid card with 3-layer overlay for Team Detail Page (/groups/:id).
 * Follows the solid team cards design system:
 * - 6px border radius with one chamfered top-right corner (14px standard, 18px hero)
 * - 1px inner border (cardLine)
 * - 3-layer overlay: giant monochrome watermark (7%), facet lines (5%), film-grain noise (4%)
 */
export default function TeamPageCard({
  token,
  slug,
  chamfer = 14,
  bg,
  showWatermark = true,
  children,
  style = {},
  className = "",
  uniqueId = "card",
}) {
  const crestFiles = CREST_REGISTRY[slug];
  const cardBackground = bg || token?.cardDeep || "#1B1F27";
  const cardLine = token?.cardLine || "rgba(255, 255, 255, 0.12)";
  const cardText = token?.cardText || "#FFFFFF";
  const isLight = cardText === "#1F2A4D";

  // Diagonal line length: hypotenuse = chamfer * sqrt(2)
  const diagLength = chamfer * 1.4142;

  return (
    <div
      className={`team-page-card ${isLight ? "light-card" : ""} ${className}`}
      style={{
        position: "relative",
        background: cardBackground,
        color: cardText,
        borderRadius: 6,
        clipPath: `polygon(0 0, calc(100% - ${chamfer}px) 0, 100% ${chamfer}px, 100% 100%, 0 100%)`,
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.08)",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* 1px Inner Border */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: `inset 0 0 0 1px ${cardLine}`,
          clipPath: `polygon(0 0, calc(100% - ${chamfer}px) 0, 100% ${chamfer}px, 100% 100%, 0 100%)`,
          pointerEvents: "none",
          zIndex: 3,
        }}
      />

      {/* Diagonal Chamfer 1px Line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: chamfer,
          width: diagLength,
          height: 1,
          transformOrigin: "top left",
          transform: "rotate(45deg)",
          background: cardLine,
          pointerEvents: "none",
          zIndex: 4,
        }}
      />

      {/* Layer A: Giant Watermark Crest (7% opacity monochrome) */}
      {showWatermark && (
        crestFiles ? (
          <img
            src={crestFiles["384"] || crestFiles["128"]}
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              right: -25,
              bottom: -25,
              width: chamfer > 14 ? 260 : 180,
              height: chamfer > 14 ? 260 : 180,
              objectFit: "contain",
              pointerEvents: "none",
              opacity: 0.07,
              filter: token?.watermarkFilter || "brightness(0) invert(1)",
              userSelect: "none",
              zIndex: 0,
            }}
          />
        ) : (
          <svg
            viewBox="0 0 100 100"
            style={{
              position: "absolute",
              right: -25,
              bottom: -25,
              width: chamfer > 14 ? 260 : 180,
              height: chamfer > 14 ? 260 : 180,
              pointerEvents: "none",
              opacity: 0.07,
              filter: token?.watermarkFilter || "brightness(0) invert(1)",
              userSelect: "none",
              zIndex: 0,
            }}
            fill="none"
          >
            <path
              d="M50 8 L85 22 C85 62 50 90 50 90 C50 90 15 62 15 22 Z"
              stroke="#FFFFFF"
              strokeWidth="5"
              fill="white"
            />
          </svg>
        )
      )}

      {/* Layer B: Faint Angular Facet Pattern (5% opacity) */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          opacity: 0.05,
          zIndex: 0,
        }}
        viewBox="0 0 400 300"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <polygon
          points="0,0 140,0 220,180 70,300 0,300"
          fill={token?.facetColor || "#FFFFFF"}
        />
        <line
          x1="0"
          y1="70"
          x2="400"
          y2="230"
          stroke={token?.facetColor || "#FFFFFF"}
          strokeWidth="1.5"
        />
        <line
          x1="200"
          y1="0"
          x2="400"
          y2="130"
          stroke={token?.facetColor || "#FFFFFF"}
          strokeWidth="1.5"
        />
      </svg>

      {/* Layer C: Film-grain Noise Overlay (4% opacity) */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          opacity: 0.04,
          mixBlendMode: "overlay",
          zIndex: 0,
        }}
        aria-hidden="true"
      >
        <filter id={`grain-${uniqueId}`}>
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${uniqueId})`} />
      </svg>

      {/* Card Content (Relative zIndex 1) */}
      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}

