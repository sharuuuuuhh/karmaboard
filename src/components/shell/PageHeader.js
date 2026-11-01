import React from "react";
import SearchExpand from "./SearchExpand";

export default function PageHeader({
  title,
  subtitle,
  rightActions,
  centerActions = false,
  hideSearch = false,
}) {
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
        }
        .page-header-title-col {
          display: flex;
          flex-direction: column;
        }
        .page-header-actions-col {
          display: flex;
          align-items: center;
          gap: 12px;
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

      {/* Column 1: Title & Subtitle */}
      <div className="page-header-title-col">
        <h1
          className="type-display"
          style={{
            margin: 0,
            fontSize: 32,
            fontWeight: 800,
            fontFamily: "var(--font-display)",
            fontVariationSettings: '"wdth" var(--display-wdth)',
            letterSpacing: "-0.01em",
            color: "var(--text-primary)",
            lineHeight: 1.02,
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
              color: "var(--text-secondary)",
            }}
          >
            {subtitle}
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
