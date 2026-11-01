import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutGrid, Trophy, Users, Clock } from "lucide-react";

export default function BottomTabBar() {
  const tabs = [
    { to: "/", label: "Home", icon: LayoutGrid, end: true },
    { to: "/leaderboard", label: "Board", icon: Trophy, end: false },
    { to: "/groups", label: "Groups", icon: Users, end: false },
    { to: "/activity", label: "Activity", icon: Clock, end: false },
  ];

  return (
    <nav
      className="mobile-bottom-tab-bar"
      style={{
        position: "fixed",
        bottom: 12,
        left: 16,
        right: 16,
        height: 60,
        borderRadius: 24,
        display: "none", // toggled in media query
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 900,
        padding: "0 8px",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        background: "#FFFFFF",
        border: "1px solid var(--border)",
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
      }}
    >
      <style>{`
        @media (max-width: 1199px) {
          .mobile-bottom-tab-bar {
            display: flex !important;
          }
        }
      `}</style>
      {tabs.map((tab) => {
        const IconComponent = tab.icon;
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            style={({ isActive }) => ({
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              flex: 1,
              height: "100%",
              textDecoration: "none",
              color: isActive ? "var(--text-primary)" : "var(--text-muted)",
              transition: "color 0.15s ease",
            })}
          >
            {({ isActive }) => (
              <>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px 14px",
                    borderRadius: "var(--radius-pill)",
                    background: isActive ? "var(--chart-tint)" : "transparent",
                    color: isActive ? "var(--chart-line)" : "inherit",
                    transition: "all 0.15s ease",
                  }}
                >
                  <IconComponent size={18} strokeWidth={isActive ? 2.4 : 1.9} />
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {tab.label}
                </span>
              </>
            )}
          </NavLink>
        );
      })}
    </nav>
  );
}
