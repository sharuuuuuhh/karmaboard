import React from "react";
import { Link } from "react-router-dom";
import Logo from "../brand/Logo";
import { LEGAL_CONFIG } from "../../data/legalContent";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer-root">
      <style>{`
        .site-footer-root {
          margin-top: auto;
          position: relative;
          width: calc(100% + 48px);
          margin-left: -24px;
          margin-right: -24px;
          box-sizing: border-box;
          padding: 44px 32px 32px 32px;
          background-color: var(--bg);
          overflow: hidden;
          user-select: none;
        }

        @media (min-width: 1600px) {
          .site-footer-root {
            width: calc(100% + 64px);
            margin-left: -32px;
            margin-right: -32px;
            padding: 50px 48px 36px 48px;
          }
        }

        @media (max-width: 768px) {
          .site-footer-root {
            width: calc(100% + 32px);
            margin-left: -16px;
            margin-right: -16px;
            padding: 38px 20px calc(104px + env(safe-area-inset-bottom, 0px)) 20px !important;
            text-align: center !important;
          }
          .site-footer-top-row {
            flex-direction: column !important;
            align-items: center !important;
            gap: 16px !important;
          }
          .site-footer-brand-stack {
            align-items: center !important;
            text-align: center !important;
          }
          .site-footer-links-group {
            justify-content: center !important;
          }
          .site-footer-bottom-row {
            justify-content: center !important;
            text-align: center !important;
          }
        }

        .site-footer-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .site-footer-top-row {
          display: flex;
          align-items: center;
          justifyContent: space-between;
          flex-wrap: wrap;
          gap: 20px;
          width: 100%;
        }

        .site-footer-links-group {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          font-size: 12.5px;
          font-family: var(--font-body);
          color: var(--muted);
        }

        .site-footer-link {
          color: var(--muted);
          text-decoration: none;
          font-weight: 500;
          transition: color 150ms ease, text-decoration-color 150ms ease;
          border-radius: 4px;
        }

        .site-footer-link:hover {
          color: var(--crimson);
          text-decoration: underline;
          text-decoration-thickness: 1.5px;
          text-underline-offset: 3px;
        }

        .site-footer-link:focus-visible {
          outline: 2px solid var(--crimson);
          outline-offset: 2px;
          color: var(--crimson);
        }

        .site-footer-bottom-row {
          display: flex;
          align-items: center;
          font-size: 11px;
          font-family: var(--font-body);
          color: var(--muted);
          opacity: 0.8;
          letter-spacing: 0.01em;
        }
      `}</style>

      {/* Full-bleed Seigaiha wave pattern merging seamlessly at the top of the footer */}
      <div
        className="site-footer-waves-strip"
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          height: 85,
          pointerEvents: "none",
          overflow: "hidden",
          zIndex: 0,
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.45) 25%, rgba(0, 0, 0, 0.95) 55%, rgba(0, 0, 0, 0.3) 85%, transparent 100%)",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.45) 25%, rgba(0, 0, 0, 0.95) 55%, rgba(0, 0, 0, 0.3) 85%, transparent 100%)",
        }}
      >
        <svg width="100%" height="100%" aria-hidden="true">
          <defs>
            <pattern
              id="footer-seigaiha-pattern"
              width="60"
              height="30"
              patternUnits="userSpaceOnUse"
            >
              <g fill="none" stroke="#8A3B43" strokeWidth="1" strokeLinecap="round" opacity="0.32">
                {/* y = -15 */}
                <path d="M -60 -15 A 30 30 0 0 1 0 -15 M -54 -15 A 24 24 0 0 1 -6 -15 M -48 -15 A 18 18 0 0 1 -12 -15 M -42 -15 A 12 12 0 0 1 -18 -15 M -36 -15 A 6 6 0 0 1 -24 -15" />
                <path d="M 0 -15 A 30 30 0 0 1 60 -15 M 6 -15 A 24 24 0 0 1 54 -15 M 12 -15 A 18 18 0 0 1 48 -15 M 18 -15 A 12 12 0 0 1 42 -15 M 24 -15 A 6 6 0 0 1 36 -15" />
                <path d="M 60 -15 A 30 30 0 0 1 120 -15 M 66 -15 A 24 24 0 0 1 114 -15 M 72 -15 A 18 18 0 0 1 108 -15 M 78 -15 A 12 12 0 0 1 102 -15 M 84 -15 A 6 6 0 0 1 96 -15" />

                {/* y = 0 */}
                <path d="M -30 0 A 30 30 0 0 1 30 0 M -24 0 A 24 24 0 0 1 24 0 M -18 0 A 18 18 0 0 1 18 0 M -12 0 A 12 12 0 0 1 12 0 M -6 0 A 6 6 0 0 1 6 0" />
                <path d="M 30 0 A 30 30 0 0 1 90 0 M 36 0 A 24 24 0 0 1 84 0 M 42 0 A 18 18 0 0 1 78 0 M 48 0 A 12 12 0 0 1 72 0 M 54 0 A 6 6 0 0 1 66 0" />

                {/* y = 15 */}
                <path d="M -60 15 A 30 30 0 0 1 0 15 M -54 15 A 24 24 0 0 1 -6 15 M -48 15 A 18 18 0 0 1 -12 15 M -42 15 A 12 12 0 0 1 -18 15 M -36 15 A 6 6 0 0 1 -24 15" />
                <path d="M 0 15 A 30 30 0 0 1 60 15 M 6 15 A 24 24 0 0 1 54 15 M 12 15 A 18 18 0 0 1 48 15 M 18 15 A 12 12 0 0 1 42 15 M 24 15 A 6 6 0 0 1 36 15" />
                <path d="M 60 15 A 30 30 0 0 1 120 15 M 66 15 A 24 24 0 0 1 114 15 M 72 15 A 18 18 0 0 1 108 15 M 78 15 A 12 12 0 0 1 102 15 M 84 15 A 6 6 0 0 1 96 15" />

                {/* y = 30 */}
                <path d="M -30 30 A 30 30 0 0 1 30 30 M -24 30 A 24 24 0 0 1 24 30 M -18 30 A 18 18 0 0 1 18 30 M -12 30 A 12 12 0 0 1 12 30 M -6 30 A 6 6 0 0 1 6 30" />
                <path d="M 30 30 A 30 30 0 0 1 90 30 M 36 30 A 24 24 0 0 1 84 30 M 42 30 A 18 18 0 0 1 78 30 M 48 30 A 12 12 0 0 1 72 30 M 54 30 A 6 6 0 0 1 66 30" />

                {/* y = 45 */}
                <path d="M -60 45 A 30 30 0 0 1 0 45 M -54 45 A 24 24 0 0 1 -6 45 M -48 45 A 18 18 0 0 1 -12 45 M -42 45 A 12 12 0 0 1 -18 45 M -36 45 A 6 6 0 0 1 -24 45" />
                <path d="M 0 45 A 30 30 0 0 1 60 45 M 6 45 A 24 24 0 0 1 54 45 M 12 45 A 18 18 0 0 1 48 45 M 18 45 A 12 12 0 0 1 42 45 M 24 45 A 6 6 0 0 1 36 45" />
                <path d="M 60 45 A 30 30 0 0 1 120 45 M 66 45 A 24 24 0 0 1 114 45 M 72 45 A 18 18 0 0 1 108 45 M 78 45 A 12 12 0 0 1 102 45 M 84 45 A 6 6 0 0 1 96 45" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-seigaiha-pattern)" />
        </svg>
      </div>

      <div className="site-footer-inner">
        {/* Top Row: Brand Info (Left) and Legal Links (Right) */}
        <div className="site-footer-top-row">
          {/* Left: Brand Identity */}
          <div
            className="site-footer-brand-stack"
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 4,
            }}
          >
            <Logo variant="horizontal" size="sm" tone="dark" href="/" />
            <span
              style={{
                fontSize: 11.5,
                fontWeight: 500,
                fontFamily: "var(--font-body)",
                color: "var(--muted)",
                letterSpacing: "0.02em",
              }}
            >
              {LEGAL_CONFIG.leagueName}
            </span>
          </div>

          {/* Right: Inline Navigation Links */}
          <nav
            aria-label="Footer Navigation"
            className="site-footer-links-group"
          >
            <Link to="/terms" className="site-footer-link">
              Terms & Conditions
            </Link>
            <span aria-hidden="true" style={{ opacity: 0.6 }}>·</span>
            <Link to="/privacy" className="site-footer-link">
              Privacy Policy
            </Link>
            <span aria-hidden="true" style={{ opacity: 0.6 }}>·</span>
            <a
              href={`mailto:${LEGAL_CONFIG.contactEmail}?subject=Karmayodha%20Inquiry`}
              className="site-footer-link"
            >
              Contact
            </a>
          </nav>
        </div>

        {/* Bottom Line: Copyright */}
        <div className="site-footer-bottom-row">
          © {currentYear} {LEGAL_CONFIG.appName}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
