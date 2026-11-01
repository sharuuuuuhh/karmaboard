import React from "react";
import { PollCard } from "../components/PollCard";

export default function PollsPage() {
  return (
    <div style={{ animation: "fadeIn 0.2s ease", display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)" }}>Prediction Polls</h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
          Community predictions for the monthly winning group
        </p>
      </div>

      <PollCard />
    </div>
  );
}
