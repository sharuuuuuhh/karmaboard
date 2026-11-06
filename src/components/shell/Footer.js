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
          min-height: 140px;
          padding: 32px 48px 24px 48px;
          background-color: transparent;
          overflow: hidden;
          user-select: none;
          display: flex;
          flex-direction: column;
          justifyContent: center;
        }

        @media (min-width: 1600px) {
          .site-footer-root {
            width: calc(100% + 64px);
            margin-left: -32px;
            margin-right: -32px;
            padding: 36px 64px 28px 64px;
          }
        }

        @media (max-width: 768px) {
          .site-footer-root {
            width: calc(100% + 32px);
            margin-left: -16px;
            margin-right: -16px;
            min-height: 160px !important;
            padding: 24px 20px calc(88px + env(safe-area-inset-bottom, 0px)) 20px !important;
            justify-content: center !important;
          }
          .site-footer-inner {
            align-items: center !important;
            text-align: center !important;
            max-width: 100% !important;
          }
          .site-footer-row-top {
            flex-direction: column !important;
            gap: 12px !important;
            align-items: center !important;
          }
          .site-footer-brand-divider {
            display: none !important;
          }
          .site-footer-nav-row {
            justify-content: center !important;
          }
          .site-footer-subtitle {
            text-align: center !important;
          }
          .site-footer-copyright {
            text-align: center !important;
          }
        }

        /* Faded Sumi-e Mountains Footer Artwork */
        .site-footer-art-outer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 25%, black 100%);
          mask-image: linear-gradient(to bottom, transparent 0%, black 25%, black 100%);
        }

        .site-footer-art-picture {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 30%, black 100%);
          mask-image: linear-gradient(to right, transparent 0%, black 30%, black 100%);
        }

        .site-footer-art-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: right bottom;
          display: block;
          mix-blend-mode: multiply;
          opacity: 0.95;
        }

        @media (max-width: 768px) {
          .site-footer-art-img {
            object-position: 90% bottom !important;
            opacity: 0.55 !important;
          }
        }

        /* Content Stack confined to left side to prevent artwork overlap */
        .site-footer-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 620px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 6px;
        }

        /* Row 1: Logo + Divider + Nav Links */
        .site-footer-row-top {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 14px;
        }

        .site-footer-brand-divider {
          width: 1px;
          height: 13px;
          background: rgba(0, 0, 0, 0.22);
          flex-shrink: 0;
        }

        .site-footer-nav-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 10px;
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

        .site-footer-dot {
          opacity: 0.5;
          user-select: none;
          font-size: 11px;
        }

        /* Row 2: Subtitle */
        .site-footer-subtitle {
          font-size: 12px;
          font-weight: 500;
          font-family: var(--font-body);
          color: var(--muted);
          letter-spacing: 0.01em;
          opacity: 0.9;
        }

        /* Row 3: Copyright */
        .site-footer-copyright {
          font-size: 11px;
          font-family: var(--font-body);
          color: var(--muted);
          opacity: 0.75;
          letter-spacing: 0.01em;
          margin-top: 1px;
        }
      `}</style>

      {/* Decorative Sumi-e Mountains Artwork (No samurai, soft fade into paper) */}
      <div className="site-footer-art-outer" aria-hidden="true">
        <picture className="site-footer-art-picture">
          <source
            media="(max-width: 768px)"
            srcSet="/assets/art/footer-art-mobile.webp 1200w"
            type="image/webp"
          />
          <source
            srcSet="/assets/art/footer-art.webp 2400w"
            type="image/webp"
          />
          <img
            src="/assets/art/footer-art.webp"
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            width="2400"
            height="800"
            className="site-footer-art-img"
          />
        </picture>
      </div>

      {/* Content: Row 1 Logo + Links, Row 2 League, Row 3 Copyright */}
      <div className="site-footer-inner">
        <div className="site-footer-row-top">
          <Logo variant="horizontal" size="sm" tone="dark" href="/" />
          <span className="site-footer-brand-divider" aria-hidden="true" />
          <nav aria-label="Footer Navigation" className="site-footer-nav-row">
            <Link to="/terms" className="site-footer-link">
              Terms & Conditions
            </Link>
            <span aria-hidden="true" className="site-footer-dot">|</span>
            <Link to="/privacy" className="site-footer-link">
              Privacy Policy
            </Link>
            <span aria-hidden="true" className="site-footer-dot">|</span>
            <a
              href={`mailto:${LEGAL_CONFIG.contactEmail}?subject=Karmayodha%20Inquiry`}
              className="site-footer-link"
            >
              Contact
            </a>
          </nav>
        </div>

        <div className="site-footer-subtitle">
          {LEGAL_CONFIG.leagueName}
        </div>

        <div className="site-footer-copyright">
          © {currentYear} Karmayodha. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
