"use client";

import { cn } from "../../lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "../brand/Logo";

const SidebarContext = createContext(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props) => {
  return (
    <>
      <style>{`
        .sidebar-desktop-view {
          display: flex !important;
          flex-direction: column;
        }
        .sidebar-mobile-view {
          display: none !important;
        }
        @media (max-width: 768px) {
          .sidebar-desktop-view {
            display: none !important;
          }
          .sidebar-mobile-view {
            display: none !important;
          }
        }
      `}</style>
      <DesktopSidebar {...props} className={cn("sidebar-desktop-view", props.className)} />
      <MobileSidebar {...props} className={cn("sidebar-mobile-view", props.className)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  style,
  ...props
}) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(className)}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        flexShrink: 0,
        ...style,
      }}
      animate={{
        width: animate ? (open ? "260px" : "68px") : "260px",
      }}
      transition={{
        duration: 0.22,
        ease: [0.16, 1, 0.3, 1],
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  style,
  ...props
}) => {
  const { open, setOpen } = useSidebar();
  return (
    <div
      className={cn(className)}
      style={{
        height: "56px",
        padding: "0 16px",
        display: "none",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#18181B",
        borderBottom: "1px solid #27272A",
        width: "100%",
        flexShrink: 0,
        ...style,
      }}
      {...props}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Logo variant="mark" size="sm" tone="light" href="/" />
        <Menu
          style={{ color: "#FFFFFF", cursor: "pointer" }}
          onClick={() => setOpen(!open)}
        />
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ x: "-100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "-100%", opacity: 0 }}
            transition={{
              duration: 0.25,
              ease: "easeInOut",
            }}
            style={{
              position: "fixed",
              height: "100%",
              width: "100%",
              inset: 0,
              backgroundColor: "#18181B",
              padding: "24px 20px",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                position: "absolute",
                right: 20,
                top: 20,
                zIndex: 50,
                color: "#FFFFFF",
                cursor: "pointer",
              }}
              onClick={() => setOpen(false)}
            >
              <X size={24} />
            </div>
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const SidebarLink = ({
  link,
  className,
  onClick,
  active = false,
  ...props
}) => {
  const { open, animate } = useSidebar();
  return (
    <div
      onClick={onClick}
      className={cn(className)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "10px 12px",
        borderRadius: 12,
        cursor: "pointer",
        textDecoration: "none",
        color: active ? "#FFFFFF" : "#9A9AA0",
        backgroundColor: active ? "rgba(255, 255, 255, 0.08)" : "transparent",
        transition: "all 0.18s ease",
      }}
      {...props}
    >
      <div style={{ flexShrink: 0 }}>{link.icon}</div>
      <motion.span
        animate={{
          opacity: animate ? (open ? 1 : 0) : 1,
          width: animate ? (open ? "auto" : 0) : "auto",
          x: animate ? (open ? 0 : -6) : 0,
        }}
        transition={{
          duration: 0.18,
          ease: [0.16, 1, 0.3, 1],
        }}
        style={{
          fontSize: 14,
          fontWeight: active ? 600 : 500,
          whiteSpace: "nowrap",
          overflow: "hidden",
          display: "inline-block",
        }}
      >
        {link.label}
      </motion.span>
    </div>
  );
};
