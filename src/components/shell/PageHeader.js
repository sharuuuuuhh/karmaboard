import React from "react";
import SearchExpand from "./SearchExpand";

export default function PageHeader({
  title,
  subtitle,
  rightActions,
  centerActions,
  hideSearch = false,
  showJapaneseBanner = true,
}) {
  const isOverview = title === "Overview" || showJapaneseBanner;

  // Resolve center content vs right content
  const centerContent =
    React.isValidElement(centerActions)
      ? centerActions
      : centerActions === true
      ? rightActions
      : null;

  const rightContent =
    React.isValidElement(centerActions)
      ? rightActions
      : centerActions === true
      ? null
      : rightActions;

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
    <header className="page-header-root">
      <style>{`
        .page-header-root {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
          position: relative;
          min-height: 140px;
        }
        .page-header-title-col {
          display: flex;
          flex-direction: column;
          position: relative;
          z-index: 2;
          flex-shrink: 0;
        }
        .page-header-center-col {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
          flex: 1;
          margin: 0 16px;
        }
        .page-header-right-col {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 2;
          flex-shrink: 0;
        }

        .page-header-art-layer {
          position: absolute;
          top: -24px;
          right: -24px;
          height: 180px;
          width: min(calc(100% + 48px), 1150px);
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }
        @media (min-width: 1600px) {
          .page-header-art-layer {
            top: -32px;
            right: -32px;
            width: min(calc(100% + 64px), 1300px);
            height: 200px;
          }
        }
        /* Mobile (<= 768px): center actions below title, hide art banner */
        @media (max-width: 768px) {
          .page-header-root {
            min-height: auto;
            gap: 14px;
            flex-wrap: wrap;
          }
          .page-header-art-layer {
            display: none !important;
          }
          .page-header-title-col {
            flex: 1;
            min-width: 0;
          }
          .page-header-center-col {
            width: 100% !important;
            display: flex !important;
            justify-content: center !important;
            align-items: center !important;
            margin: 6px auto 0 auto !important;
            order: 3;
          }
          .page-header-right-col {
            flex-shrink: 0;
          }
        }
      `}</style>

      {/* Japanese Sumi-e Landscape Banner (Transparent RGBA, Full Bleed to Top/Right Edge) */}
      {isOverview && (
        <div
          className="page-header-art-layer"
          aria-hidden="true"
        >
          <img
            src="/assets/art/header-banner.webp"
            alt=""
            aria-hidden="true"
            width={2400}
            height={466}
            loading="eager"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "right top",
              display: "block",
            }}
          />
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

      {/* Column 2: Center Actions (e.g. Date Range / Period Popover almost in the middle) */}
      {centerContent && (
        <div className="page-header-center-col">
          {centerContent}
        </div>
      )}

      {/* Column 3: Right Actions & Search */}
      {(rightContent || !hideSearch) && (
        <div className="page-header-right-col">
          {rightContent}
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
