import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Logo from "../components/brand/Logo";

export default function NotFoundPage() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: 460,
          width: "100%",
          padding: "44px 32px",
          textAlign: "center",
          background: "#FFFFFF",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-soft)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <Logo variant="mark" size="lg" tone="dark" href="/" />
        </div>

        <div
          className="tabular-nums"
          style={{
            fontSize: 48,
            fontWeight: 800,
            color: "var(--text-primary)",
            lineHeight: 1,
            marginBottom: 8,
          }}
        >
          404
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
          Page Not Found
        </h2>

        <p
          style={{
            fontSize: 13,
            color: "var(--text-secondary)",
            marginTop: 8,
            marginBottom: 24,
            lineHeight: 1.5,
          }}
        >
          The page you're looking for doesn't exist or was moved. Head back to the Overview
          to explore live campus karma standings.
        </p>

        <Link
          to="/"
          className="interactive-btn"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 22px",
            borderRadius: "var(--radius-pill)",
            background: "var(--btn-primary-bg)",
            color: "var(--btn-primary-text)",
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Overview</span>
        </Link>
      </div>
    </div>
  );
}
