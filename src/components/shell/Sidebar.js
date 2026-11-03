import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
} from "../ui/sidebar";
import {
  LayoutDashboard,
  Trophy,
  Users,
  Clock,
  RotateCw,
} from "lucide-react";
import Logo from "../brand/Logo";

export default function AppSidebar({ isSyncing, onSync }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const links = [
    {
      label: "Overview",
      href: "/",
      icon: <LayoutDashboard size={20} />,
    },
    {
      label: "Leaderboard",
      href: "/leaderboard",
      icon: <Trophy size={20} />,
    },
    {
      label: "Groups",
      href: "/groups",
      icon: <Users size={20} />,
    },
    {
      label: "Activity",
      href: "/activity",
      icon: <Clock size={20} />,
    },
  ];

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody
        className="justify-between"
        style={{
          backgroundColor: "#18181B",
          borderRight: "1px solid #27272A",
          padding: "20px 12px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Top Section: Logo & Nav Links */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "4px 4px",
              marginBottom: 28,
              minHeight: 44,
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <Logo
                variant="mark"
                size="md"
                tone="light"
                href="/"
              />
              <motion.div
                animate={{
                  opacity: open ? 1 : 0,
                  width: open ? "auto" : 0,
                  x: open ? 0 : -8,
                }}
                transition={{
                  duration: 0.18,
                  ease: [0.16, 1, 0.3, 1],
                }}
                style={{
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: "#FFFFFF",
                    lineHeight: 1,
                  }}
                >
                  KARMAYODHA
                </span>
              </motion.div>
            </div>
          </div>

          {/* Nav Links */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {links.map((link) => {
              const isActive =
                link.href === "/"
                  ? location.pathname === "/"
                  : location.pathname.startsWith(link.href);

              return (
                <SidebarLink
                  key={link.href}
                  link={link}
                  active={isActive}
                  onClick={() => navigate(link.href)}
                />
              );
            })}
          </div>
        </div>

        {/* Bottom Section: Sync Karma Button Only */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 16 }}>
          <div
            onClick={onSync}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 12px",
              borderRadius: 12,
              cursor: isSyncing ? "not-allowed" : "pointer",
              color: isSyncing ? "#FFFFFF" : "#A1A1AA",
              transition: "all 0.15s ease",
            }}
            className="hover:bg-white/5"
            title="Click to refresh karma standings"
          >
            <div style={{ flexShrink: 0, display: "flex", alignItems: "center" }}>
              <RotateCw
                size={18}
                style={{
                  animation: isSyncing ? "spin 1s linear infinite" : "none",
                }}
              />
            </div>
            <motion.span
              animate={{
                opacity: open ? 1 : 0,
                width: open ? "auto" : 0,
                x: open ? 0 : -6,
              }}
              transition={{
                duration: 0.18,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                fontSize: 13,
                fontWeight: 500,
                whiteSpace: "nowrap",
                overflow: "hidden",
                display: "inline-block",
              }}
            >
              {isSyncing ? "Syncing..." : "Sync Karma"}
            </motion.span>
          </div>
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
