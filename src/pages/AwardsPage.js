import React from "react";
import { UnderdogCard } from "../components/UnderdogCard";
import { GroupMVPsCard } from "../components/GroupMVPsCard";

export default function AwardsPage() {
  return (
    <div style={{ animation: "fadeIn 0.2s ease", display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)" }}>Awards</h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 2 }}>
          Weekly MVPs and Underdog Award recognitions
        </p>
      </div>

      <UnderdogCard />
      <GroupMVPsCard />
    </div>
  );
}
