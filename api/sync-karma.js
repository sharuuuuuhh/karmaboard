// api/sync-karma.js
// Vercel serverless function — fetches karma from muLearn API and writes to Supabase.
// Called by the React frontend via POST /api/sync-karma.
// Node.js runtime (no Playwright, no Flask).

const { createClient } = require("@supabase/supabase-js");

const MULEARN_API =
  "https://mulearn.org/api/v1/dashboard/profile/user-profile/";

// Server-side Supabase client — uses the service key when available so RLS
// doesn't block writes; falls back to the anon key if only that is set.
function getSupabase() {
  // Try multiple env var names — Vercel exposes all dashboard vars to serverless
  const url =
    process.env.SUPABASE_URL ||
    process.env.REACT_APP_SUPABASE_URL;

  const key =
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      `Supabase env vars missing. Got url=${!!url}, key=${!!key}. ` +
      `Set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel environment variables.`
    );
  }
  return createClient(url, key);
}

/**
 * Extract karma/name/rank from the muLearn user-profile API response.
 * Adjust the key paths here if muLearn ever changes their response shape.
 */
function extract(data) {
  const r = data?.response ?? data ?? {};
  return {
    karma: r.karma ?? r.karma_points ?? r.total_karma ?? null,
    rank: r.rank ?? null,
    full_name: r.full_name ?? r.name ?? null,
  };
}

async function fetchOne(muid) {
  try {
    const res = await fetch(`${MULEARN_API}${encodeURIComponent(muid)}/`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) {
      if (res.status === 400 || res.status === 403) {
        try {
          const searchRes = await fetch(
            `https://mulearn.org/api/v1/dashboard/user/search/?search=${encodeURIComponent(muid)}`,
            {
              headers: { Accept: "application/json" },
              signal: AbortSignal.timeout(12_000),
            }
          );
          if (searchRes.ok) {
            const searchJson = await searchRes.json();
            const results = searchJson?.response?.data ?? [];
            const found = results.find(
              (r) => r.muid?.toLowerCase() === muid.toLowerCase()
            );
            if (found) {
              const karma =
                found.karma !== undefined && found.karma !== null
                  ? parseInt(found.karma, 10)
                  : null;
              return {
                muid,
                ok: karma !== null,
                karma,
                rank: null,
                full_name: found.full_name ?? null,
                error: null,
              };
            }
          }
        } catch (searchErr) {
          // Fall back to original HTTP error reporting
        }
      }
      return { muid, ok: false, error: `HTTP ${res.status}` };
    }
    const json = await res.json();
    const { karma, rank, full_name } = extract(json);
    return { muid, ok: karma !== null, karma, rank, full_name, error: null };
  } catch (err) {
    return { muid, ok: false, karma: null, rank: null, full_name: null, error: String(err) };
  }
}

module.exports = async function handler(req, res) {
  // Allow CORS from the same Vercel deployment
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = getSupabase();

    // 1. Load all tracked MUIDs from students table
    const { data: students, error: fetchErr } = await supabase
      .from("students")
      .select("muid");

    if (fetchErr) {
      return res.status(500).json({ error: fetchErr.message });
    }
    if (!students || students.length === 0) {
      return res.status(200).json({ message: "No students to sync", updated: [] });
    }

    // 2. Hit muLearn API concurrently (batched to avoid rate limits)
    const BATCH = 5;
    const results = [];
    for (let i = 0; i < students.length; i += BATCH) {
      const batch = students.slice(i, i + BATCH);
      const batchResults = await Promise.all(batch.map((s) => fetchOne(s.muid)));
      results.push(...batchResults);
    }

    // 3. Write successful results back to Supabase
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const updates = await Promise.all(
      results
        .filter((r) => r.ok)
        .map(async ({ muid, karma, rank, full_name }) => {
          const update = { karma };
          if (rank !== null) update.rank = rank;
          if (full_name) update.full_name = full_name;

          const { error } = await supabase
            .from("students")
            .update(update)
            .eq("muid", muid);

          return { muid, success: !error, error: error?.message ?? null };
        })
    );

    // 3b. Snapshot today's karma into karma_history so the monthly RPC has a
    //     baseline. We only record the FIRST snapshot of each day — if a row
    //     for (muid, today) already exists we leave it alone so the baseline
    //     stays at the start-of-day value, not the latest sync value.
    try {
      const successfulResults = results.filter((r) => r.ok);
      if (successfulResults.length > 0) {
        // Check which (muid, today) pairs already have a snapshot
        const muids = successfulResults.map((r) => r.muid);
        const { data: existingSnapshots } = await supabase
          .from("karma_history")
          .select("muid")
          .in("muid", muids)
          .eq("recorded_at", today);

        const alreadySnapped = new Set(
          (existingSnapshots ?? []).map((row) => row.muid)
        );

        // Only insert rows that don't have a snapshot yet today
        const newSnapshots = successfulResults
          .filter((r) => !alreadySnapped.has(r.muid))
          .map((r) => ({ muid: r.muid, karma: r.karma, recorded_at: today }));

        if (newSnapshots.length > 0) {
          const { error: histErr } = await supabase
            .from("karma_history")
            .insert(newSnapshots);
          if (histErr) {
            console.warn("karma_history insert failed:", histErr.message);
          }
        }
      }
    } catch (histErr) {
      console.warn("Failed to snapshot karma_history:", histErr.message);
    }

    // 4. Update Campus Details — uses public leaderboard API (single fast request)
    try {
      const CAMPUS_CODE = process.env.CAMPUS_CODE || "TLY";
      const leaderboardRes = await fetch(
        "https://mulearn.org/api/v1/leaderboard/college/",
        { signal: AbortSignal.timeout(8000) }
      );
      if (leaderboardRes.ok) {
        const leaderboardJson = await leaderboardRes.json();
        const colleges = leaderboardJson?.response ?? [];
        const campusIndex = colleges.findIndex(c => c.code === CAMPUS_CODE);
        
        if (campusIndex !== -1) {
          const campusData = colleges[campusIndex];
          const campusRank = campusIndex + 1;
          const campusKarma = campusData.total_karma ?? 0;
          const campusTotalMembers = campusData.total_students ?? 0;

          // Count active members locally (tracked students with karma > 0)
          const { count: localActiveCount } = await supabase
            .from("students")
            .select("*", { count: "exact", head: true })
            .gt("karma", 0);

          const { data: existingDetails } = await supabase
            .from("campus_details")
            .select("*")
            .order("id", { ascending: false })
            .limit(1);

          const updatePayload = {
            rank: campusRank,
            karma: campusKarma,
            active_members: localActiveCount ?? 0,
            total_members: campusTotalMembers,
            updated_at: new Date().toISOString()
          };

          if (existingDetails && existingDetails.length > 0) {
            await supabase
              .from("campus_details")
              .update(updatePayload)
              .eq("id", existingDetails[0].id);
          } else {
            await supabase
              .from("campus_details")
              .insert(updatePayload);
          }
        }
      }
    } catch (campusErr) {
      console.warn("Failed to sync campus details:", campusErr.message);
    }

    return res.status(200).json({
      synced: updates.filter((u) => u.success).length,
      failed: results.filter((r) => !r.ok),
      results,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
