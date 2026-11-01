import React from "react";

export function SegmentedControl({ options, value, onChange, ariaLabel = "Filter selection" }) {
  return (
    <div className="segmented-control" role="group" aria-label={ariaLabel}>
      {options.map((opt) => {
        const isActive = value === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            className={`segmented-option ${isActive ? "active" : ""}`}
            onClick={() => onChange(opt.value)}
            aria-pressed={isActive}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

