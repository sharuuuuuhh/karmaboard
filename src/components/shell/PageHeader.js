import React from "react";
import SearchExpand from "./SearchExpand";
import Logo from "../brand/Logo";

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
          z-index: 60;
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
          z-index: 60;
          flex: 1;
          margin: 0 16px;
        }
        .page-header-right-col {
          display: flex;
          align-items: center;
          gap: 12px;
          position: relative;
          z-index: 60;
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

        /* Mobile (<= 768px): clean transparent top-to-bottom layout */
        .mobile-brand-container {
          display: none;
        }
        .mobile-header-art-layer {
          display: none;
        }
        .page-header-actions-wrap {
          display: contents;
        }

        @media (max-width: 768px) {
          .page-header-root {
            min-height: auto;
            gap: 0;
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
            margin-bottom: 20px !important;
            padding-top: 10px !important;
            position: relative;
            z-index: 60;
            width: 100%;
          }
          .page-header-art-layer {
            display: none !important;
          }

          /* Mobile Brand Logo at Top-Left */
          .mobile-brand-container {
            display: flex !important;
            align-items: center;
            margin-bottom: 12px;
            position: relative;
            z-index: 2;
          }

          /* Mobile Header Art (top-right anchored, 300px, dual gradient mask) */
          .mobile-header-art-layer {
            display: block !important;
            position: absolute;
            top: -16px;
            right: -16px;
            left: -16px;
            height: 300px;
            pointer-events: none;
            z-index: 0;
            overflow: hidden;
            mix-blend-mode: multiply;
            mask-image: linear-gradient(to bottom, #000 60%, transparent 100%), linear-gradient(to right, transparent 0%, #000 55%);
            -webkit-mask-image: linear-gradient(to bottom, #000 60%, transparent 100%), linear-gradient(to right, transparent 0%, #000 55%);
            mask-composite: intersect;
            -webkit-mask-composite: source-in;
          }

          .page-header-title-col {
            width: 100%;
            position: relative;
            z-index: 2;
          }
          .page-header-title {
            font-size: 38px !important;
            font-weight: 800 !important;
            letter-spacing: -0.03em !important;
            line-height: 1.08 !important;
            margin: 0 0 6px 0 !important;
            color: var(--ink) !important;
            font-family: var(--font-display) !important;
          }
          .page-header-subtitle {
            font-size: 13px !important;
            color: var(--muted) !important;
            margin: 0 0 16px 0 !important;
            line-height: 1.4 !important;
            font-family: var(--font-body) !important;
          }

          /* Mobile Controls Row (Month selector + search button in one row) */
          .page-header-actions-wrap {
            display: flex !important;
            align-items: center;
            gap: 10px;
            width: 100%;
            position: relative;
            z-index: 60;
            margin-top: 2px;
          }
          .page-header-center-col {
            flex: 1 !important;
            min-width: 0 !important;
            display: flex !important;
            justify-content: flex-start !important;
          }
          .page-header-center-col > * {
            width: 100%;
          }
          .page-header-right-col {
            flex-shrink: 0 !important;
          }
        }
      `}</style>

      {/* Desktop Japanese Sumi-e Landscape Banner */}
      {isOverview && (
        <div className="page-header-art-layer" aria-hidden="true">
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

      {/* Mobile Japanese Sumi-e Landscape Art (Portrait-ish crop, anchored top-right) */}
      {isOverview && (
        <div className="mobile-header-art-layer" aria-hidden="true">
          <picture>
            <source
              type="image/avif"
              srcSet="/assets/art/mobile/m-header-art@1x.avif 458w, /assets/art/mobile/m-header-art@2x.avif 917w, /assets/art/mobile/m-header-art@3x.avif 1376w"
              sizes="(max-width: 768px) 100vw, 460px"
            />
            <source
              type="image/webp"
              srcSet="/assets/art/mobile/m-header-art@1x.webp 458w, /assets/art/mobile/m-header-art@2x.webp 917w, /assets/art/mobile/m-header-art@3x.webp 1376w"
              sizes="(max-width: 768px) 100vw, 460px"
            />
            <img
              src="/assets/art/mobile/m-header-art.webp"
              alt=""
              aria-hidden="true"
              width={1376}
              height={768}
              loading="eager"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "top right",
                display: "block",
              }}
            />
          </picture>
        </div>
      )}

      {/* Mobile Top Brand Row (Preserves existing app logo and KARMAYODHA wordmark) */}
      <div className="mobile-brand-container">
        <Logo variant="horizontal" size="sm" tone="dark" href="/" />
      </div>

      {/* Title & Subtitle Column */}
      <div className="page-header-title-col">
        <h1
          className="page-header-title"
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
            className="page-header-subtitle"
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

      {/* Header Actions (Desktop: split between center & right; Mobile: single row via flex) */}
      {(centerContent || rightContent || !hideSearch) && (
        <div className="page-header-actions-wrap">
          {centerContent && (
            <div className="page-header-center-col">
              {centerContent}
            </div>
          )}
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
        </div>
      )}
    </header>
  );
}
