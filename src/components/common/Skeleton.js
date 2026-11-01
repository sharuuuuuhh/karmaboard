import React from "react";
import { Inbox } from "lucide-react";
import Logo from "../brand/Logo";

export function Skeleton({ width = "100%", height = "16px", borderRadius = "4px", style = {} }) {
  return (
    <div
      className="skeleton"
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
    />
  );
}

export function LoadingScreen({ message = "Loading..." }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "40vh",
        gap: 16,
        color: "var(--text-muted)",
      }}
    >
      <Logo variant="mark" size="md" tone="dark" href={null} />
      <div style={{ fontSize: 13, fontWeight: 500 }}>{message}</div>
    </div>
  );
}

export function EmptyState({
  title = "No data available",
  description = "Check back once activities and karma are recorded.",
  icon,
}) {
  return (
    <div className="empty-state">
      <div style={{ color: "var(--text-muted)", marginBottom: "4px" }}>
        {icon || <Inbox size={28} strokeWidth={1.5} />}
      </div>
      <div className="empty-state-title">{title}</div>
      <div className="empty-state-desc">{description}</div>
    </div>
  );
}
