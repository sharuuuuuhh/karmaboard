import supabase from "../supabaseClient";
import React, { useState, useEffect, useCallback } from "react";
import StudentsTable from "../components/students";
import MonthlyKarma from "../components/monthlyKarma";
import TopTeam from "../components/topTeam";
import "./styles.css";

export default function Home() {
  const [campusDetails, setCampusDetails] = useState(null); // null = not yet loaded
  const [monthlyStudents, setMonthlyStudents] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null); // { ok, message }
  const [error, setError] = useState(null);

  // ── fetch all data in one shot ───────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    const today = new Date();
    const startDate = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .split("T")[0];

    const [monthlyResult, studentsResult, campusResult] = await Promise.allSettled([
      supabase.rpc("get_students_with_monthly_karma", { p_start_date: startDate }),
      supabase.from("students").select("*").order("karma", { ascending: false }),
      supabase.from("campus_details").select("*").order("id", { ascending: false }).limit(1),
    ]);

    // monthly students — RPC may not exist yet; fail gracefully
    if (monthlyResult.status === "fulfilled" && !monthlyResult.value.error) {
      setMonthlyStudents(monthlyResult.value.data ?? []);
    } else {
      const msg =
        monthlyResult.status === "rejected"
          ? monthlyResult.reason?.message
          : monthlyResult.value.error?.message;
      console.warn("Monthly karma RPC unavailable:", msg);
      setMonthlyStudents([]); // show empty instead of crashing
    }

    // all students
    if (studentsResult.status === "fulfilled" && !studentsResult.value.error) {
      setStudents(studentsResult.value.data ?? []);
    } else {
      const msg =
        studentsResult.status === "rejected"
          ? studentsResult.reason?.message
          : studentsResult.value.error?.message;
      setError(msg ?? "Failed to load students");
    }

    // campus details — may be empty; guard before rendering
    if (campusResult.status === "fulfilled" && !campusResult.value.error) {
      const rows = campusResult.value.data ?? [];
      setCampusDetails(rows.length > 0 ? rows[0] : null);
    } else {
      setCampusDetails(null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── karma sync via serverless function ───────────────────────────────────
  async function handleSync() {
    setSyncing(true);
    setSyncStatus(null);
    try {
      const res = await fetch("/api/sync-karma", { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Sync failed");
      
      setSyncStatus({ 
        ok: true, 
        message: `✓ Synced ${json.synced} students successfully.`,
        failed: json.failed ?? []
      });
      await fetchAll(); // refresh table after sync
    } catch (err) {
      setSyncStatus({ ok: false, message: `✗ ${err.message}`, failed: [] });
    } finally {
      setSyncing(false);
    }
  }

  // ── formatters ───────────────────────────────────────────────────────────
  const kFormatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 0,
  });

  // ── render ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Loading data…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-screen">
        <p>⚠ {error}</p>
        <button className="retry-btn" onClick={fetchAll}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      {/* ── navbar ── */}
      <nav className="navbar">
        <div className="title">Karmayodha</div>
        <img className="logo" src="/mutly.png" alt="Mulearn logo" />
      </nav>

      {/* ── campus stats ── */}
      <div className="campus-details">
        <div className="detailbox">
          <p>Campus Rank</p>
          {campusDetails ? campusDetails.rank ?? "—" : "—"}
        </div>
        <div className="detailbox">
          <p>Campus Karma</p>
          {campusDetails ? kFormatter.format(campusDetails.karma ?? 0) : "—"}
        </div>
        <div className="detailbox">
          <p>Active members</p>
          {campusDetails ? campusDetails.active_members ?? "—" : "—"}
        </div>
        <div className="detailbox">
          <p>Total members</p>
          {campusDetails ? campusDetails.total_members ?? "—" : "—"}
        </div>

        {/* sync button sits beside the stats */}
        <button
          className="sync-btn"
          onClick={handleSync}
          disabled={syncing}
          title="Fetch latest karma from muLearn API"
        >
          {syncing ? "Syncing…" : "⟳ Sync Karma"}
        </button>
      </div>

      {/* sync status toast */}
      {syncStatus && (
        <div className="sync-feedback-container">
          <p className={`sync-status ${syncStatus.ok ? "ok" : "fail"}`}>
            {syncStatus.message}
          </p>
          {syncStatus.failed && syncStatus.failed.length > 0 && (
            <div className="sync-failed-box">
              <p className="sync-failed-title">⚠️ Failed to sync ({syncStatus.failed.length}) profiles:</p>
              <ul className="sync-failed-list">
                {syncStatus.failed.map((f) => (
                  <li key={f.muid} className="sync-failed-item">
                    <code>{f.muid}</code> — {
                      f.error === "HTTP 400" ? "Private Profile (Change to public in muLearn settings)" :
                      f.error === "HTTP 500" ? "Invalid / Non-existent MUID" :
                      f.error || "Unknown error"
                    }
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* monthly leaderboard */}
      {monthlyStudents.length === 0 ? (
        <p className="no-monthly">
          Monthly ranking not available — run the SQL in{" "}
          <code>supabase/monthly_karma_fn.sql</code> to enable it.
        </p>
      ) : (
        <div className="main-container">
          <div className="monthly">
            <h2 className="monthly-heading">Monthly Ranking</h2>
            <MonthlyKarma students={monthlyStudents} />
          </div>
          <div className="team-section-container">
            <TopTeam students={monthlyStudents} />
          </div>
        </div>
      )}

      {/* overall rankings */}
      <div className="overall">
        <StudentsTable students={students} />
      </div>
    </div>
  );
}
