import React from "react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

export function MovementBadge({ movement }) {
  if (!movement) {
    return (
      <span className="movement-badge neutral" title="No movement data">
        <Minus size={12} />
      </span>
    );
  }

  const { type, places, tooltip } = movement;

  if (type === "new") {
    return (
      <span className="movement-badge new" title={tooltip}>
        NEW
      </span>
    );
  }

  if (type === "up") {
    return (
      <span className="movement-badge up" title={tooltip}>
        <ArrowUp size={11} strokeWidth={2.5} />
        <span className="tabular-nums">{places}</span>
      </span>
    );
  }

  if (type === "down") {
    return (
      <span className="movement-badge down" title={tooltip}>
        <ArrowDown size={11} strokeWidth={2.5} />
        <span className="tabular-nums">{places}</span>
      </span>
    );
  }

  return (
    <span className="movement-badge neutral" title={tooltip}>
      <Minus size={12} />
    </span>
  );
}
