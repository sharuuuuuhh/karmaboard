import React, { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { RotateCw } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { karmaStore } from "../../data/karmaStore";
import { formatRelativeTime } from "../../utils/dateUtils";

export default function TopNav({ isSyncing, onSync }) {
  const [lastSynced, setLastSynced] = useState(() =>
    karmaStore.getLastSynced ? karmaStore.getLastSynced() : karmaStore.lastSyncedAt
  );

  useEffect(() => {
    const unsub = karmaStore.subscribe(() => {
      setLastSynced(
        karmaStore.getLastSynced ? karmaStore.getLastSynced() : karmaStore.lastSyncedAt
      );
    });
    return unsub;
  }, []);

  const navLinkStyle = ({ isActive }) => ({
    padding: "6px 14px",
    borderRadius: "var(--radius-pill)",
    fontSize: 13,
    fontWeight: 600,
    textDecoration: "none",
    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
    background: isActive ? "var(--surface-2)" : "transparent",
    transition: "all 0.15s ease",
    display: "inline-flex",
    alignItems: "center",
  });

  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 20px",
        }}
      >
        {/* Left: Brand Wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              textDecoration: "none",
            }}
          >
            <span
              style={{
                fontSize: 19,
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--text-primary)",
              }}
            >
              Karmayodha
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
              }}
            >
              MuLearn TLY
            </span>
          </Link>

          {/* Desktop Navigation Links (Home, Leaderboard, Groups, Activity) */}
          <nav
            className="desktop-nav-links"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <NavLink to="/" end style={navLinkStyle}>
              Home
            </NavLink>
            <NavLink to="/leaderboard" style={navLinkStyle}>
              Leaderboard
            </NavLink>
            <NavLink to="/groups" style={navLinkStyle}>
              Groups
            </NavLink>
            <NavLink to="/activity" style={navLinkStyle}>
              Activity
            </NavLink>
          </nav>
        </div>

        {/* Right: Sync status, Sync button, Theme Toggle, This-is-me chip */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Last synced label */}
          <span
            className="last-synced-label"
            style={{
              fontSize: 11,
              color: "var(--text-muted)",
              letterSpacing: "0.02em",
            }}
          >
            Synced {lastSynced ? formatRelativeTime(lastSynced) : "recently"}
          </span>

          {/* Sync Button */}
          <button
            type="button"
            onClick={onSync}
            disabled={isSyncing}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 14px",
              borderRadius: "var(--radius-pill)",
              border: "1px solid var(--border)",
              background: "var(--surface-2)",
              color: "var(--text-primary)",
              fontSize: 12,
              fontWeight: 600,
              cursor: isSyncing ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
            }}
            title="Fetch latest karma from MuLearn via Supabase"
          >
            <RotateCw
              size={13}
              style={{
                animation: isSyncing ? "spin 1s linear infinite" : "none",
              }}
            />
            <span className="sync-button-text">
              {isSyncing ? "Syncing..." : "Sync Karma"}
            </span>
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </header>
    </>
  );
}
