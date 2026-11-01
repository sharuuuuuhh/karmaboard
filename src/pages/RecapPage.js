import React, { useState } from "react";
import { RecapModal } from "../components/RecapModal";

export default function RecapPage() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div style={{ animation: "fadeIn 0.2s ease", textAlign: "center", padding: "40px 16px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)" }}>Recap Card Generator</h1>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 6, marginBottom: 24 }}>
        Generate shareable recap cards for yourself or your group
      </p>

      <button
        onClick={() => setIsOpen(true)}
        style={{
          padding: "10px 24px",
          borderRadius: "var(--radius-pill)",
          background: "var(--accent)",
          color: "#FFFFFF",
          border: "none",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Open Recap Card
      </button>

      {isOpen && (
        <RecapModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
