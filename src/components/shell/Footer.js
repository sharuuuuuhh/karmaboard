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
          min-height: clamp(280px, 20vw, 360px);
          padding: 48px 48px 36px 48px;
          background-color: var(--bg);
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
            padding: 56px 64px 40px 64px;
          }
        }

        @media (max-width: 768px) {
          .site-footer-root {
            width: calc(100% + 32px);
            margin-left: -16px;
            margin-right: -16px;
            min-height: 220px !important;
            padding: 32px 20px calc(104px + env(safe-area-inset-bottom, 0px)) 20px !important;
            justify-content: center !important;
          }
          .site-footer-inner {
            align-items: center !important;
            text-align: center !important;
            max-width: 100% !important;
          }
          .site-footer-brand-stack {
            align-items: center !important;
            text-align: center !important;
          }
          .site-footer-nav-row {
            justify-content: center !important;
          }
          .site-footer-copyright {
            text-align: center !important;
          }
        }

        /* 4-Edge Faded Sumi-e Samurai Art Layer */
        .site-footer-art-outer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 35%, black 95%, transparent 100%);
          mask-image: linear-gradient(to bottom, transparent 0%, black 35%, black 95%, transparent 100%);
        }

        .site-footer-art-picture {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 25%, black 95%, transparent 100%);
          mask-image: linear-gradient(to right, transparent 0%, black 25%, black 95%, transparent 100%);
        }

        .site-footer-art-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: right bottom;
          display: block;
          mix-blend-mode: multiply;
          opacity: 0.96;
          filter: saturate(1.05) contrast(1.02);
        }

        @media (max-width: 768px) {
          .site-footer-art-img {
            object-position: 85% bottom !important;
            opacity: 0.6 !important;
          }
        }

        /* Content Stack */
        .site-footer-inner {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 520px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .site-footer-brand-stack {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }

        .site-footer-subtitle {
          font-size: 11.5px;
          font-weight: 500;
          font-family: var(--font-body);
          color: var(--muted);
          letter-spacing: 0.02em;
        }

        .site-footer-nav-row {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          font-size: 12.5px;
          font-family: var(--font-body);
          color: var(--muted);
          margin-top: 4px;
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
          opacity: 0.55;
          user-select: none;
        }

        .site-footer-copyright {
          font-size: 11px;
          font-family: var(--font-body);
          color: var(--muted);
          opacity: 0.8;
          letter-spacing: 0.01em;
          margin-top: 2px;
        }
      `}</style>

      {/* Decorative Sumi-e Samurai Artwork with Seamless 4-Edge Fade */}
      <div className="site-footer-art-outer" aria-hidden="true">
        <picture className="site-footer-art-picture">
          <source
            media="(max-width: 768px)"
            srcSet="/assets/art/footer-samurai-mobile.webp 1200w"
            type="image/webp"
          />
          <source
            srcSet="/assets/art/footer-samurai.webp 2400w"
            type="image/webp"
          />
          <img
            src="/assets/art/footer-samurai.png"
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

      {/* Real HTML Content Stack (Left-aligned on desktop away from artwork, centered on mobile) */}
      <div className="site-footer-inner">
        <div className="site-footer-brand-stack">
          <Logo variant="horizontal" size="sm" tone="dark" href="/" />
          <span className="site-footer-subtitle">
            {LEGAL_CONFIG.leagueName}
          </span>
        </div>

        <nav aria-label="Footer Navigation" className="site-footer-nav-row">
          <Link to="/terms" className="site-footer-link">
            Terms & Conditions
          </Link>
          <span aria-hidden="true" className="site-footer-dot">·</span>
          <Link to="/privacy" className="site-footer-link">
            Privacy Policy
          </Link>
          <span aria-hidden="true" className="site-footer-dot">·</span>
          <a
            href={`mailto:${LEGAL_CONFIG.contactEmail}?subject=Karmayodha%20Inquiry`}
            className="site-footer-link"
          >
            Contact
          </a>
        </nav>

        <div className="site-footer-copyright">
          © {currentYear} Karmayodha. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
