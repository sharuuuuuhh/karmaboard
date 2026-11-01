import React from "react";

export function Avatar({ name, size = 32, tintColor = null }) {
  const initials = (name || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("") || "?";

  const style = {
    width: `${size}px`,
    height: `${size}px`,
    fontSize: `${size * 0.38}px`,
    backgroundColor: tintColor ? `${tintColor}15` : "var(--subtle-surface)",
    color: tintColor ? tintColor : "var(--text-secondary)",
    border: tintColor ? `1px solid ${tintColor}40` : "1px solid var(--border)",
  };

  return (
    <div className="avatar-circle" style={style} aria-label={name}>
      {initials}
    </div>
  );
}

export function GroupDot({ color, size = 8, title = "" }) {
  return (
    <span
      className="group-dot"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: color || "var(--text-muted)",
      }}
      title={title}
      aria-hidden="true"
    />
  );
}

