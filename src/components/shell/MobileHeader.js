import React from "react";
import Logo from "../brand/Logo";

export default function MobileHeader() {
  return (
    <>
      <style>{`
        .mobile-header-root {
          display: none !important;
        }
        @media (max-width: 768px) {
          .mobile-header-root {
            display: flex !important;
          }
        }
      `}</style>

      <header
        className="mobile-header-root"
        style={{
          height: 54,
          padding: "0 16px",
          background: "#FFFFFF",
          borderBottom: "1px solid var(--border)",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          zIndex: 800,
          width: "100%",
        }}
      >
        {/* Brand Logo & Name */}
        <Logo variant="full" size="sm" tone="dark" href="/" />
      </header>
    </>
  );
}
