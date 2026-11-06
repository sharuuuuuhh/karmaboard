import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import { LEGAL_CONFIG, PRIVACY_SECTIONS } from "../data/legalContent";

export default function PrivacyPage() {
  useEffect(() => {
    document.title = "Privacy Policy | Karmayodha";
    try {
      if (typeof window !== "undefined" && typeof window.scrollTo === "function") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (_) {}
  }, []);

  return (
    <div
      className="legal-page-root"
      style={{
        width: "100%",
        maxWidth: 780,
        margin: "0 auto",
        padding: "16px 16px 40px 16px",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      <style>{`
        .legal-page-card {
          background: #FFFFFF;
          border-radius: 24px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: 0 4px 24px rgba(22, 22, 26, 0.04);
          padding: 36px 40px;
          position: relative;
          overflow: hidden;
        }

        .legal-toc-list {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px 16px;
          margin: 16px 0 24px 0;
          padding: 16px 18px;
          background: #FAF8F5;
          border-radius: 14px;
          border: 1px solid rgba(0, 0, 0, 0.04);
        }

        .legal-toc-link {
          font-size: 13px;
          color: var(--muted);
          text-decoration: none;
          font-family: var(--font-body);
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: color 150ms ease;
        }

        .legal-toc-link:hover {
          color: var(--crimson);
          text-decoration: underline;
        }

        .legal-section-block {
          padding-top: 24px;
          border-top: 1px solid rgba(0, 0, 0, 0.05);
          margin-top: 24px;
        }

        .legal-section-block:first-of-type {
          border-top: none;
          margin-top: 0;
          padding-top: 12px;
        }

        @media (max-width: 640px) {
          .legal-page-card {
            padding: 24px 20px !important;
            border-radius: 18px !important;
          }
          .legal-toc-list {
            grid-template-columns: 1fr !important;
            gap: 6px !important;
            padding: 12px 14px !important;
          }
        }
      `}</style>

      {/* Back Link */}
      <div style={{ marginBottom: 16 }}>
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "var(--font-body)",
            color: "var(--ink)",
            textDecoration: "none",
            transition: "color 150ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--crimson)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink)")}
        >
          <ArrowLeft size={16} strokeWidth={2.4} />
          <span>Back to Leaderboard</span>
        </Link>
      </div>

      {/* Main Card */}
      <article className="legal-page-card">
        {/* Subtle decorative wave watermark */}
        <img
          src="/assets/art/seigaiha.svg"
          alt=""
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -12,
            right: -12,
            width: 140,
            height: 70,
            opacity: 0.06,
            pointerEvents: "none",
          }}
        />

        {/* Page Header */}
        <header style={{ marginBottom: 20 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "var(--crimson)",
              marginBottom: 8,
            }}
          >
            <Lock size={14} />
            <span>Privacy & Transparency</span>
          </div>

          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontSize: "clamp(26px, 4vw, 34px)",
              fontWeight: 800,
              color: "var(--ink)",
              lineHeight: 1.15,
            }}
          >
            Privacy Policy
          </h1>

          <div
            style={{
              fontSize: 13,
              color: "var(--muted)",
              marginTop: 6,
              fontFamily: "var(--font-body)",
            }}
          >
            Last updated: {LEGAL_CONFIG.lastUpdated}
          </div>
        </header>

        {/* Table of Contents */}
        <nav aria-label="Table of Contents">
          <div
            style={{
              fontSize: 11.5,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "var(--muted)",
            }}
          >
            Contents
          </div>
          <div className="legal-toc-list">
            {PRIVACY_SECTIONS.map((sec) => (
              <a key={sec.id} href={`#${sec.id}`} className="legal-toc-link">
                <span style={{ fontWeight: 700, color: "var(--crimson)" }}>
                  {sec.number}.
                </span>
                <span>{sec.title}</span>
              </a>
            ))}
          </div>
        </nav>

        {/* Numbered Sections */}
        <div>
          {PRIVACY_SECTIONS.map((sec) => (
            <section
              key={sec.id}
              id={sec.id}
              className="legal-section-block"
            >
              <h2
                style={{
                  margin: "0 0 10px 0",
                  fontFamily: "var(--font-display)",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--ink)",
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                }}
              >
                <span style={{ color: "var(--crimson)", fontSize: 16 }}>
                  {sec.number}.
                </span>
                <span>{sec.title}</span>
              </h2>

              {sec.content.map((p, idx) => (
                <p
                  key={idx}
                  style={{
                    margin: "0 0 12px 0",
                    fontSize: 14.5,
                    lineHeight: 1.65,
                    color: "#3A3A40",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {p}
                </p>
              ))}

              {sec.list && (
                <ul
                  style={{
                    margin: "8px 0 16px 20px",
                    padding: 0,
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "#3A3A40",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {sec.list.map((item, lIdx) => (
                    <li key={lIdx} style={{ marginBottom: 6 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {sec.contactLink && (
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 8,
                    padding: "10px 16px",
                    borderRadius: 12,
                    background: "#FAF8F5",
                    border: "1px solid rgba(0, 0, 0, 0.06)",
                  }}
                >
                  <Mail size={16} color="var(--crimson)" />
                  <a
                    href={`mailto:${LEGAL_CONFIG.contactEmail}?subject=Karmayodha%20Privacy%20Inquiry`}
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "var(--crimson)",
                      textDecoration: "none",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                    onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                  >
                    {LEGAL_CONFIG.contactEmail}
                  </a>
                </div>
              )}
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}

