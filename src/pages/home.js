import supabase from "../supabaseClient";
import React, { useState, useEffect, useCallback } from "react";
import StudentsTable from "../components/students";
import MonthlyKarma from "../components/monthlyKarma";
import TopTeam from "../components/topTeam";
import "./styles.css";

export default function Home() {
  const [campusDetails, setCampusDetails] = useState(null); // null = not yet loaded
  const [monthlyStudents, setMonthlyStudents] = useState([]);
  const [lastMonthStudents, setLastMonthStudents] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState("current"); // "current" | "last"
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null); // { ok, message }
  const [error, setError] = useState(null);

  const today = new Date();
  const currentMonthStart = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`;
  const lastMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthStart = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, "0")}-01`;

  const currentMonthLabel = today.toLocaleString("en-US", { month: "long", year: "numeric" });
  const lastMonthLabel = lastMonthDate.toLocaleString("en-US", { month: "long", year: "numeric" });

  // ── fetch all data in one shot ───────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [monthlyResult, lastMonthArchiveResult, lastMonthRpcResult, studentsResult, campusResult] =
      await Promise.allSettled([
        supabase.rpc("get_students_with_monthly_karma", { p_start_date: currentMonthStart }),
        supabase
          .from("monthly_archives")
          .select("*")
          .eq("archive_month", lastMonthStart)
          .order("monthly_karma", { ascending: false }),
        supabase.rpc("get_students_with_monthly_karma", { p_start_date: lastMonthStart }),
        supabase.from("students").select("*").order("karma", { ascending: false }),
        supabase.from("campus_details").select("*").order("id", { ascending: false }).limit(1),
      ]);

    // current month students
    if (monthlyResult.status === "fulfilled" && !monthlyResult.value.error) {
      setMonthlyStudents(monthlyResult.value.data ?? []);
    } else {
      const msg =
        monthlyResult.status === "rejected"
          ? monthlyResult.reason?.message
          : monthlyResult.value.error?.message;
      console.warn("Current monthly karma RPC unavailable:", msg);
      setMonthlyStudents([]);
    }

    // last month students: prioritize monthly_archives table, fallback to RPC
    let lastMonthData = [];
    if (
      lastMonthArchiveResult.status === "fulfilled" &&
      !lastMonthArchiveResult.value.error &&
      lastMonthArchiveResult.value.data &&
      lastMonthArchiveResult.value.data.length > 0
    ) {
      lastMonthData = lastMonthArchiveResult.value.data.map((r, i) => ({
        user_id: r.muid || `archive-${r.id || i}`,
        muid: r.muid,
        full_name: r.full_name,
        karma: r.karma,
        rank: r.rank,
        monthly_karma: r.monthly_karma,
        department: r.department,
        team: r.team,
      }));
    } else if (lastMonthRpcResult.status === "fulfilled" && !lastMonthRpcResult.value.error) {
      lastMonthData = lastMonthRpcResult.value.data ?? [];
    }
    setLastMonthStudents(lastMonthData);

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

    // campus details
    if (campusResult.status === "fulfilled" && !campusResult.value.error) {
      const rows = campusResult.value.data ?? [];
      setCampusDetails(rows.length > 0 ? rows[0] : null);
    } else {
      setCampusDetails(null);
    }

    setLoading(false);
  }, [currentMonthStart, lastMonthStart]);

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
        failed: json.failed ?? [],
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

  const activeMonthlyStudents = selectedPeriod === "last" ? lastMonthStudents : monthlyStudents;

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

        {/* Action buttons sitting beside stats */}
        <div className="header-action-buttons">
          <button
            className={`period-toggle-quick-btn ${selectedPeriod === "last" ? "active-period" : ""}`}
            onClick={() => setSelectedPeriod(selectedPeriod === "current" ? "last" : "current")}
            title={selectedPeriod === "current" ? `View progress for ${lastMonthLabel}` : `View progress for ${currentMonthLabel}`}
          >
            {selectedPeriod === "current" ? "📅 View Last Month Progress" : "⚡ View Current Month"}
          </button>

          <button
            className="sync-btn"
            onClick={handleSync}
            disabled={syncing}
            title="Fetch latest karma from muLearn API"
          >
            {syncing ? "Syncing…" : "⟳ Sync Karma"}
          </button>
        </div>
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
      <div className="main-container">
        <div className="monthly">
          {/* Header with Title & Period Selector */}
          <div className="monthly-header-bar">
            <div className="monthly-heading-group">
              <h2 className="monthly-heading">
                {selectedPeriod === "last" ? "Last Month Ranking" : "Monthly Ranking"}
              </h2>
              <span className="period-badge">
                {selectedPeriod === "last" ? lastMonthLabel : currentMonthLabel}
              </span>
            </div>

            {/* Toggle Switch Tabs */}
            <div className="period-tabs">
              <button
                type="button"
                className={`period-tab ${selectedPeriod === "current" ? "active" : ""}`}
                onClick={() => setSelectedPeriod("current")}
              >
                ⚡ This Month
              </button>
              <button
                type="button"
                className={`period-tab ${selectedPeriod === "last" ? "active" : ""}`}
                onClick={() => setSelectedPeriod("last")}
              >
                📅 Last Month
              </button>
            </div>
          </div>

          {activeMonthlyStudents.length === 0 ? (
            <div className="empty-monthly-state">
              <p className="no-monthly">
                {selectedPeriod === "last"
                  ? `No recorded progress found for ${lastMonthLabel} yet.`
                  : "Monthly ranking not available — run the SQL in supabase/monthly_karma_fn.sql to enable it."}
              </p>
              {selectedPeriod === "last" && (
                <button
                  type="button"
                  className="switch-back-btn"
                  onClick={() => setSelectedPeriod("current")}
                >
                  ← Switch to This Month ({currentMonthLabel})
                </button>
              )}
            </div>
          ) : (
            <MonthlyKarma students={activeMonthlyStudents} />
          )}
        </div>

        <div className="team-section-container">
          <TopTeam students={activeMonthlyStudents} />
        </div>
      </div>

      {/* overall rankings */}
      <div className="overall">
        <StudentsTable students={students} />
      </div>
    </div>
  );
}
