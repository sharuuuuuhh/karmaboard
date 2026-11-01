import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Trophy,
  Users,
  Clock,
  RotateCw,
} from "lucide-react";
import { motion } from "framer-motion";

export default function MobileDock({ isSyncing, onSync }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    {
      id: "overview",
      label: "Home",
      path: "/",
      icon: LayoutDashboard,
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
          transition: color 0.15s ease, transform 0.1s ease;
        }
        .mobile-dock-btn:active {
          transform: scale(0.92);
        }
        .mobile-dock-sync-btn:active {
          transform: scale(0.90);
        }
      `}</style>

      <nav
        className="mobile-dock-container"
        aria-label="Mobile Navigation Dock"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 9999,
          width: "100%",
          borderRadius: 0,
          background: "rgba(18, 20, 26, 0.98)",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "none",
          borderTop: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.35)",
          padding: "6px 12px calc(6px + env(safe-area-inset-bottom, 0px)) 12px",
          userSelect: "none",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 540,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          {/* Navigation Items */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              flex: 1,
              minWidth: 0,
              gap: 4,
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
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    flex: 1,
                    minWidth: 0,
                    height: 48,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    color: active ? "#FFFFFF" : "rgba(255, 255, 255, 0.6)",
                    transition: "color 0.15s ease",
                    padding: 0,
                    outline: "none",
                  }}
                >
                  {/* Active Indicator Background Pill */}
                  {active && (
                    <motion.div
                      layoutId="activeDockPill"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      style={{
                        position: "absolute",
                        inset: "2px 4px",
                        borderRadius: 10,
                        background: "rgba(255, 255, 255, 0.14)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                      }}
                    />
                  )}

                  <div
                    style={{
                      position: "relative",
                      zIndex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <Icon
                      size={19}
                      strokeWidth={active ? 2.4 : 1.9}
                      style={{
                        transform: active ? "scale(1.08)" : "scale(1)",
                        transition: "transform 0.15s ease",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: active ? 700 : 500,
                        letterSpacing: "0.01em",
                        lineHeight: 1,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "100%",
                      }}
                    >
                      {item.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Vertical Divider */}
          <div
            style={{
              width: 1,
              height: 28,
              backgroundColor: "rgba(255, 255, 255, 0.12)",
              flexShrink: 0,
            }}
          />

          {/* Sync Button Action */}
          <button
            type="button"
            onClick={onSync}
            disabled={isSyncing}
            title="Sync Karma"
            aria-label="Sync Karma"
            className="mobile-dock-sync-btn"
            style={{
              position: "relative",
              width: 42,
              height: 42,
              borderRadius: 10,
              background: isSyncing
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              cursor: isSyncing ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              transition: "all 0.15s ease",
              outline: "none",
              flexShrink: 0,
            }}
          >
            <RotateCw
              size={18}
              style={{
                animation: isSyncing ? "spin 0.8s linear infinite" : "none",
              }}
            />
          </button>
        </div>
      </nav>
    </>
  );
}

