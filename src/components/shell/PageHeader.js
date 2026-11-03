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
          min-height: 140px;
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
        /* Mobile (<= 768px): center actions, hide art banner */
        @media (max-width: 768px) {
          .page-header-root {
            min-height: auto;
            gap: 14px;
          }
          .page-header-art-layer {
            display: none !important;
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
