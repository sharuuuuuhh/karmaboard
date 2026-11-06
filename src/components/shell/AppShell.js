import React, { useState } from "react";
import AppSidebar from "./Sidebar";
import MobileHeader from "./MobileHeader";
import MobileDock from "./MobileDock";
import Footer from "./Footer";
import { karmaStore } from "../../data/karmaStore";

export default function AppShell({ children }) {
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      if (karmaStore.syncKarma) {
        await karmaStore.syncKarma();
      }
    } catch (err) {
      console.error("Sync error:", err);
    } finally {
      setTimeout(() => setIsSyncing(false), 600);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "var(--bg)",
        color: "var(--text-primary)",
        position: "relative",
      }}
      className="app-shell-root"
    >
      <style>{`
        @media (max-width: 768px) {
          .app-shell-root {
            flex-direction: column !important;
            overflow-x: hidden !important;
            width: 100% !important;
            max-width: 100vw !important;
          }
          .desktop-sidebar-wrapper {
            display: none !important;
          }
        }
      `}</style>

      {/* Mobile Top Header (Clean light bar with logo & user badge, replaces old dark bar) */}
      <MobileHeader />

      {/* Desktop Expanding Dark Sidebar (Hidden on mobile) */}
      <div className="desktop-sidebar-wrapper" style={{ height: "100%", minHeight: "100%", flexShrink: 0 }}>
        <AppSidebar isSyncing={isSyncing} onSync={handleSync} />
      </div>

      {/* Main Fluid Content Panel */}
      <main
        style={{
          flex: 1,
          height: "100%",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "24px 24px 0 24px",
          backgroundColor: "var(--bg)",
          backgroundImage: "url('/assets/art/paper-texture.webp')",
          backgroundRepeat: "repeat",
          minWidth: 0,
        }}
        className="app-main-panel"
      >
        <style>{`
          .app-main-panel {
            padding: 24px 24px 0 24px;
          }
          @media (min-width: 1600px) {
            .app-main-panel {
              padding: 32px 32px 0 32px !important;
            }
          }
          @media (max-width: 768px) {
            .app-main-panel {
              padding: 16px 16px 0 16px !important;
              height: 100% !important;
              min-height: 100dvh !important;
              overflow-x: hidden;
            }
          }
          .app-content-container {
            width: 100%;
            display: flex;
            flex-direction: column;
            min-height: 100%;
          }
          @media (min-width: 2201px) {
            .app-content-container {
              max-width: 2000px;
              margin: 0 auto;
            }
          }
        `}</style>

        <div className="app-content-container">
          <div style={{ flex: 1, minWidth: 0, paddingBottom: 24 }}>{children}</div>

          {/* Seamless Full-Bleed Footer */}
          <Footer />
        </div>
      </main>

      {/* Floating Modern Mobile Dock at Bottom */}
      <MobileDock isSyncing={isSyncing} onSync={handleSync} />
    </div>
  );
}
