import React from "react";
import { Link } from "react-router-dom";
import Logo from "../brand/Logo";
import { LEGAL_CONFIG } from "../../data/legalContent";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="site-footer-root"
      style={{
        marginTop: 48,
        paddingTop: 28,
        paddingBottom: 24,
        borderTop: "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        userSelect: "none",
      }}
    >
      <style>{`
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

        @media (max-width: 640px) {
          .site-footer-root {
            margin-top: 36px !important;
            padding-top: 24px !important;
            padding-bottom: 20px !important;
            text-align: center !important;
            align-items: center !important;
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
      `}</style>

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
        <span>© {currentYear} {LEGAL_CONFIG.platformName}. All rights reserved.</span>
      </div>
    </footer>
  );
}

