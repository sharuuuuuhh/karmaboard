import React from "react";
import SearchExpand from "./SearchExpand";

export default function PageHeader({
  title,
  subtitle,
  rightActions,
  centerActions = false,
  hideSearch = false,
  showJapaneseBanner = true,
}) {
  const isOverview = title === "Overview" || showJapaneseBanner;

  const renderSubtitle = () => {
    if (!subtitle) return null;
    if (typeof subtitle !== "string") return subtitle;
    const match = subtitle.match(/(.*?\bResets in\s+)([\w\s]+)/i);
    if (match) {
      return (
        <>
          <span>{match[1]}</span>
          <span style={{ color: "var(--crimson)", fontWeight: 700 }}>{match[2]}</span>
        </>
      );
    }
    return subtitle;
  };

  return (
    <header className={`page-header-root ${centerActions ? "page-header-has-center" : ""}`}>
      <style>{`
        .page-header-root {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
          position: relative;
        }
        .page-header-title-col {
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 2;
        }
        .page-header-actions-col {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 2;
        }

        /* Desktop: when centerActions is true */
        @media (min-width: 769px) {
          .page-header-has-center {
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .page-header-has-center .page-header-actions-col {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
          }
          .page-header-has-center .page-header-search-slot {
            margin-left: auto;
          }
        }

        /* Mobile (<= 768px): center the actions row horizontally across the viewport */
        @media (max-width: 768px) {
          .page-header-root {
            gap: 14px;
          }
          .page-header-actions-col {
            width: 100% !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            margin: 4px auto 0 auto !important;
          }
          .page-header-has-center .page-header-search-slot {
            margin-left: 0;
          }
        }
      `}</style>

      {/* Decorative Traditional Japanese Landscape Banner behind right side */}
      {isOverview && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: 0,
            top: -18,
            height: 120,
            width: 480,
            maxWidth: "60%",
            pointerEvents: "none",
            zIndex: 0,
            overflow: "hidden",
            maskImage: "linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage: "linear-gradient(to left, rgba(0,0,0,1) 50%, rgba(0,0,0,0) 100%)",
          }}
        >
          <svg
            viewBox="0 0 480 120"
            fill="none"
            style={{ width: "100%", height: "100%", display: "block" }}
          >
            <defs>
              <linearGradient id="headerSunGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#D9383A" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#B3202A" stopOpacity="0.55" />
              </linearGradient>
              <linearGradient id="mistGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C8C2B8" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#F6F4F0" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Rising Soft Red Sun */}
            <circle cx="270" cy="58" r="46" fill="url(#headerSunGrad)" />

            {/* Distant Mountain Layer */}
            <path
              d="M 120 120 L 190 75 Q 240 50 300 82 L 390 48 L 480 92 L 480 120 Z"
              fill="#D4CFC6"
              opacity="0.45"
            />

            {/* Mid Mountain Layer */}
            <path
              d="M 180 120 L 250 86 Q 310 65 370 92 L 450 68 L 480 85 L 480 120 Z"
              fill="#B8B1A4"
              opacity="0.4"
            />

            {/* Traditional Multi-tier Pagoda Silhouette */}
            <g transform="translate(355, 18)" fill="#2C2A32" opacity="0.38">
              {/* Spire / Finial */}
              <rect x="23" y="0" width="2" height="14" rx="1" />
              <circle cx="24" cy="4" r="2.5" />
              <circle cx="24" cy="9" r="2" />
              {/* Roof 1 (Top) */}
              <path d="M 16 14 Q 24 16 32 14 L 30 18 L 18 18 Z" />
              <rect x="20" y="18" width="8" height="6" />
              {/* Roof 2 */}
              <path d="M 12 24 Q 24 27 36 24 L 33 29 L 15 29 Z" />
              <rect x="18" y="29" width="12" height="7" />
              {/* Roof 3 */}
              <path d="M 8 36 Q 24 40 40 36 L 37 42 L 11 42 Z" />
              <rect x="16" y="42" width="16" height="8" />
              {/* Roof 4 */}
              <path d="M 4 50 Q 24 55 44 50 L 41 57 L 7 57 Z" />
              <rect x="14" y="57" width="20" height="9" />
              {/* Roof 5 (Base) */}
              <path d="M 0 66 Q 24 72 48 66 L 44 74 L 4 74 Z" />
              <rect x="12" y="74" width="24" height="28" />
            </g>

            {/* Smaller distant pagoda silhouette */}
            <g transform="translate(315, 62) scale(0.6)" fill="#2C2A32" opacity="0.25">
              <rect x="23" y="0" width="2" height="12" rx="1" />
              <path d="M 12 12 Q 24 15 36 12 L 33 17 L 15 17 Z" />
              <rect x="18" y="17" width="12" height="6" />
              <path d="M 8 23 Q 24 27 40 23 L 37 29 L 11 29 Z" />
              <rect x="16" y="29" width="16" height="7" />
              <path d="M 4 36 Q 24 41 44 36 L 40 43 L 8 43 Z" />
              <rect x="14" y="43" width="20" height="18" />
            </g>

            {/* Gentle Drifting Sakura Petals */}
            <g fill="#D9383A" opacity="0.55">
              <path d="M 150 45 C 152 42, 156 43, 155 46 C 154 48, 151 47, 150 45 Z" />
              <path d="M 195 35 C 197 32, 201 33, 200 36 C 199 38, 196 37, 195 35 Z" />
              <path d="M 230 65 C 232 63, 235 64, 234 66 C 233 68, 231 67, 230 65 Z" />
              <path d="M 430 40 C 432 38, 435 39, 434 41 C 433 43, 431 42, 430 40 Z" />
              <path d="M 445 58 C 447 56, 450 57, 449 59 C 448 61, 446 60, 445 58 Z" />
            </g>

            {/* Foreground Mist Wash */}
            <rect x="0" y="70" width="480" height="50" fill="url(#mistGrad)" />
          </svg>
        </div>
      )}

      {/* Column 1: Title & Subtitle */}
      <div className="page-header-title-col">
        <h1
          className="type-display"
          style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 800,
            fontFamily: "var(--font-display)",
            letterSpacing: "-0.03em",
            color: "var(--text-primary)",
            lineHeight: 1.05,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 13,
              fontWeight: 500,
              fontFamily: "var(--font-body)",
              color: "var(--text-secondary)",
            }}
          >
            {renderSubtitle()}
          </p>
        )}
      </div>

      {(rightActions || !hideSearch) && (
        <div className="page-header-actions-col">
          {rightActions}
          {!hideSearch && (
            <div className="page-header-search-slot">
              <SearchExpand />
            </div>
          )}
        </div>
      )}
    </header>
  );
}
