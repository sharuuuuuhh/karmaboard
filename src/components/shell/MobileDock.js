import React, { useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Home,
  Trophy,
  Users,
  Activity,
  RotateCw,
} from "lucide-react";

function DockItem({ mouseX, item, active, onNavigate }) {
  const ref = useRef(null);

  // Proximity magnification inspired by FloatingDock
  const distance = useTransform(mouseX, (val) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  const scaleTransform = useTransform(distance, [-90, 0, 90], [1, 1.22, 1]);
  const yTransform = useTransform(distance, [-90, 0, 90], [0, -5, 0]);

  const scale = useSpring(scaleTransform, {
    mass: 0.1,
    stiffness: 220,
    damping: 16,
  });
  const y = useSpring(yTransform, {
    mass: 0.1,
    stiffness: 220,
    damping: 16,
  });

  const Icon = item.icon;

  return (
    <motion.button
      ref={ref}
      type="button"
      whileTap={{ scale: 0.88 }}
      onClick={() => onNavigate(item.path)}
      className="mobile-dock-btn"
      title={item.label}
      aria-label={item.label}
      aria-current={active ? "page" : undefined}
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
        position: "relative",
        userSelect: "none",
        y,
        scale,
      }}
    >
      {/* Icon Circle with Animated Sliding Active Bubble */}
      <div
        style={{
          position: "relative",
          width: active ? 42 : 36,
          height: active ? 42 : 36,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: active ? -6 : 0,
          transition: "margin-top 0.2s ease, width 0.2s ease, height 0.2s ease",
        }}
      >
        {active && (
          <motion.div
            layoutId="activeDockBubble"
            transition={{
              type: "spring",
              stiffness: 420,
              damping: 30,
            }}
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              background: "var(--crimson)",
              boxShadow: "0 4px 16px rgba(179, 32, 42, 0.65), 0 0 12px rgba(179, 32, 42, 0.45)",
            }}
          />
        )}

        <motion.div
          style={{ position: "relative", zIndex: 1, display: "flex" }}
          animate={{ scale: active ? [0.92, 1.1, 1] : 1 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
        >
          <Icon
            size={active ? 20 : 18}
            strokeWidth={active ? 2.2 : 1.8}
            color={active ? "#FFFFFF" : "rgba(255, 255, 255, 0.55)"}
          />
        </motion.div>
      </div>

      {/* Label with Smooth Opacity/Weight Transition */}
      <motion.span
        animate={{
          color: active ? "#FFFFFF" : "rgba(255, 255, 255, 0.5)",
          fontWeight: active ? 700 : 500,
        }}
        transition={{ duration: 0.18 }}
        style={{
          fontSize: 10.5,
          fontFamily: "var(--font-body)",
          lineHeight: 1,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          letterSpacing: "-0.01em",
        }}
      >
        {item.label}
      </motion.span>

      {/* Red underline bar under active item label */}
      {active && (
        <motion.div
          layoutId="activeDockUnderline"
          transition={{
            type: "spring",
            stiffness: 420,
            damping: 30,
          }}
          style={{
            width: 28,
            height: 2.5,
            background: "var(--crimson)",
            borderRadius: 9999,
            marginTop: 2,
          }}
        />
      )}
    </motion.button>
  );
}

export default function MobileDock({ isSyncing, onSync }) {
  const location = useLocation();
  const navigate = useNavigate();
  const mouseX = useMotionValue(Infinity);

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
      icon: Activity,
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
        @keyframes spinSync {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <nav
        className="mobile-dock-container"
        aria-label="Mobile Navigation Dock"
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        onTouchMove={(e) => {
          if (e.touches && e.touches[0]) {
            mouseX.set(e.touches[0].clientX);
          }
        }}
        onTouchEnd={() => mouseX.set(Infinity)}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          width: "100%",
          zIndex: 9999,
          borderRadius: 0,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          background: "#16161A",
          borderTop: "2px solid var(--crimson)",
          boxShadow: "0 -4px 24px rgba(0, 0, 0, 0.4)",
          padding: "6px 12px calc(8px + env(safe-area-inset-bottom, 0px)) 12px",
          userSelect: "none",
          boxSizing: "border-box",
          alignItems: "center",
          justifyContent: "space-between",
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
            gap: 6,
          }}
        >
          {/* Navigation Items with Proximity Spring & Sliding Bubble */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-around",
              flex: 1,
              minWidth: 0,
            }}
          >
            {navItems.map((item) => (
              <DockItem
                key={item.id}
                mouseX={mouseX}
                item={item}
                active={item.isActive}
                onNavigate={navigate}
              />
            ))}
          </div>

          {/* Thin Divider */}
          <div
            style={{
              width: 1,
              height: 28,
              background: "rgba(255, 255, 255, 0.15)",
              margin: "0 4px",
              flexShrink: 0,
            }}
          />

          {/* Refresh Action with Spring Tap & Rotation */}
          <motion.button
            type="button"
            onClick={onSync}
            disabled={isSyncing}
            whileTap={{ scale: 0.86, rotate: 90 }}
            title="Refresh Data"
            aria-label="Refresh Data"
            className="mobile-dock-sync-btn"
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              cursor: isSyncing ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: isSyncing ? "var(--crimson)" : "rgba(255, 255, 255, 0.8)",
              outline: "none",
              flexShrink: 0,
            }}
          >
            <RotateCw
              size={17}
              strokeWidth={1.8}
              style={{
                animation: isSyncing ? "spinSync 0.8s linear infinite" : "none",
              }}
            />
          </motion.button>
        </div>
      </nav>
    </>
  );
}
