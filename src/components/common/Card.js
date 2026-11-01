import React from "react";

export function Card({ children, className = "", ...props }) {
  return (
    <div className={`ky-card ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ title, icon, action, children }) {
  return (
    <div className="ky-card-header">
      <div className="ky-card-title">
        {icon && <span style={{ display: "inline-flex", color: "var(--text-secondary)" }}>{icon}</span>}
        <span>{title}</span>
        {children}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardBody({ children, className = "", style }) {
  return (
    <div className={`ky-card-body ${className}`} style={style}>
      {children}
    </div>
  );
}

