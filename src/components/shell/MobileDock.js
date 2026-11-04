import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  Trophy,
  Users,
  Clock,
  RotateCw,
} from "lucide-react";

export default function MobileDock({ isSyncing, onSync }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      id: "overview",
      label: "Home",
      path: "/",
      icon: Home,
      isActive: location.pathname === "/",
    },
    {
      id: "leaderboard",
      label: "Ranks",
      path: "/leaderboard",
      icon: Trophy,
      isActive: location.pathname.startsWith("/leaderboard"),
    },
    {
      id: "groups",
      label: "Teams",
      path: "/groups",
      icon: Users,
      isActive: location.pathname.startsWith("/groups"),
    },
    {
      id: "activity",
      label: "Activity",
      path: "/activity",
      icon: Clock,
      isActive: location.pathname.startsWith("/activity"),
    },
  ];

  return (
    <>
      <style>{`
        .mobile-dock-container {
          display: none !important;
        }
        @media (max-width: 768px) {
          .mobile-dock-container {
            display: flex !important;
          }
        }
        .mobile-dock-btn {
          transition: transform 0.15s ease, opacity 0.15s ease;
        }
        .mobile-dock-btn:active {
          transform: scale(0.92);
        }
        .mobile-dock-sync-btn:active {
          transform: scale(0.92);
        }
        @media (prefers-reduced-motion: reduce) {
          .mobile-dock-btn, .mobile-dock-sync-btn {
            transition: none !important;
            transform: none !important;
          }
        }
        @keyframes spinSync {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <nav
        className="mobile-dock-container"
        aria-label="Mobile Navigation Dock"
        style={{
          position: "fixed",
          bottom: 12,
          left: 12,
          right: 12,
          zIndex: 9999,
          maxWidth: 480,
          margin: "0 auto",
          borderRadius: 28,
          background: "rgba(255, 255, 255, 0.92)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid var(--border)",
          boxShadow: "0 8px 32px rgba(22, 22, 26, 0.08)",
          padding: "6px 10px calc(6px + env(safe-area-inset-bottom, 0px)) 10px",
          userSelect: "none",
          boxSizing: "border-box",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 6,
          }}
        >
          {/* 4 Navigation Items */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              flex: 1,
              minWidth: 0,
            }}
          >
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.isActive;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className="mobile-dock-btn"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 3,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px 8px",
                    flex: 1,
                    minWidth: 0,
                    outline: "none",
                  }}
                  title={item.label}
                  aria-label={item.label}
                  aria-current={active ? "page" : undefined}
                >
                  {/* Icon Circle (Pine filled circle for active) */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: active ? "var(--pine, #1F4A38)" : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: active ? "#FFFFFF" : "var(--muted)",
                      transition: "background 0.18s ease, color 0.18s ease",
                      flexShrink: 0,
                    }}
                  >
                    <Icon size={19} strokeWidth={1.5} />
                  </div>

                  {/* Label */}
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: active ? 700 : 500,
                      fontFamily: "var(--font-body)",
                      color: active ? "var(--pine, #1F4A38)" : "var(--muted)",
                      lineHeight: 1,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      letterSpacing: "-0.01em",
                      transition: "color 0.18s ease",
                    }}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Thin Divider */}
          <div
            style={{
              width: 1,
              height: 32,
              background: "var(--border)",
              margin: "0 4px",
              flexShrink: 0,
            }}
          />

          {/* Refresh Action in Rounded Light Gray Square */}
          <button
            type="button"
            onClick={onSync}
            disabled={isSyncing}
            title="Refresh Data"
            aria-label="Refresh Data"
            className="mobile-dock-sync-btn"
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              background: "#FAF8F4",
              border: "1px solid var(--border)",
              cursor: isSyncing ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--ink)",
              transition: "background 0.15s ease, transform 0.15s ease",
              outline: "none",
              flexShrink: 0,
            }}
          >
            <RotateCw
              size={17}
              strokeWidth={1.5}
              style={{
                animation: isSyncing ? "spinSync 0.8s linear infinite" : "none",
              }}
            />
          </button>
        </div>
      </nav>
    </>
  );
}
