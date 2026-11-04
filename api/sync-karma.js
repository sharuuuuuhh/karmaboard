// api/sync-karma.js
// Vercel serverless function — fetches karma from muLearn API and writes to Supabase.
// Called by the React frontend via POST /api/sync-karma.
// Node.js runtime (no Playwright, no Flask).

const { createClient } = require("@supabase/supabase-js");

const MULEARN_API =
  "https://mulearn.org/api/v1/dashboard/profile/user-profile/";

function getSupabase() {
  const url =
    process.env.SUPABASE_URL ||
    process.env.REACT_APP_SUPABASE_URL;

  const key =
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      `Supabase env vars missing. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY.`
    );
  }
  return createClient(url, key);
}

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
    // 1. Primary: muLearn user search API is fast, reliable, and supports both public & private profiles
    const searchRes = await fetch(
      `https://mulearn.org/api/v1/dashboard/user/search/?search=${encodeURIComponent(muid)}`,
      {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(6000),
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

    // 2. Fallback: profile API in case search didn't index them
    const res = await fetch(`${MULEARN_API}${encodeURIComponent(muid)}/`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const json = await res.json();
      const { karma, rank, full_name } = extract(json);
      return { muid, ok: karma !== null, karma, rank, full_name, error: null };
    }
    return { muid, ok: false, error: `Student not found: ${muid}` };
  } catch (err) {
    return { muid, ok: false, karma: null, rank: null, full_name: null, error: String(err) };
  }
}

module.exports = async function handler(req, res) {
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

    // 2. Hit muLearn API concurrently in efficient batches of 25
    const BATCH = 25;
    const results = [];
    for (let i = 0; i < students.length; i += BATCH) {
      const batch = students.slice(i, i + BATCH);
      const batchResults = await Promise.all(batch.map((s) => fetchOne(s.muid)));
      results.push(...batchResults);
    }

    // 3. Determine month start baseline for monthly_karma calculation
    // A student's baseline for the current month is their karma BEFORE this month started (recorded_at < monthStart).
    // If they have no records before this month, they joined in this month, so their baseline is 0.
    const now = new Date();
    const today = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    const successfulResults = results.filter((r) => r.ok);

    // Fetch latest snapshot BEFORE current month for each student
    const { data: preMonthSnapshots } = await supabase
      .from("karma_history")
      .select("muid, karma, recorded_at")
      .lt("recorded_at", monthStart)
      .order("recorded_at", { ascending: false });

    const baselineMap = new Map();
    (preMonthSnapshots || []).forEach((row) => {
      if (!baselineMap.has(row.muid)) {
        baselineMap.set(row.muid, row.karma);
      }
    });

    // 4. Write successful results back to Supabase (including monthly_karma)
    const updates = await Promise.all(
      successfulResults.map(async ({ muid, karma, rank, full_name }) => {
        const baseline = baselineMap.get(muid) || 0;
        const monthlyKarma = Math.max(0, karma - baseline);

        const update = { karma, monthly_karma: monthlyKarma };
        if (rank !== null) update.rank = rank;
        if (full_name) update.full_name = full_name;

        const { error } = await supabase
          .from("students")
          .update(update)
          .eq("muid", muid);

        return { muid, success: !error, error: error?.message ?? null };
      })
    );

    // 5. Snapshot today's karma into karma_history (only first snapshot of the day)
    try {
      if (successfulResults.length > 0) {
        const { data: existingToday } = await supabase
          .from("karma_history")
          .select("muid")
          .eq("recorded_at", today);

        const alreadySnapped = new Set(
          (existingToday ?? []).map((row) => row.muid)
        );

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

    // 6. Update Campus Details (non-blocking with short timeout)
    try {
      const CAMPUS_CODE = process.env.CAMPUS_CODE || "TLY";
      const leaderboardRes = await fetch(
        "https://mulearn.org/api/v1/leaderboard/college/",
        { signal: AbortSignal.timeout(4000) }
      );
      if (leaderboardRes.ok) {
        const leaderboardJson = await leaderboardRes.json();
        const colleges = leaderboardJson?.response ?? [];
        const campusIndex = colleges.findIndex((c) => c.code === CAMPUS_CODE);

        if (campusIndex !== -1) {
          const campusData = colleges[campusIndex];
          const campusRank = campusIndex + 1;
          const campusKarma = campusData.total_karma ?? 0;
          const campusTotalMembers = campusData.total_students ?? 0;

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
            updated_at: new Date().toISOString(),
          };

          if (existingDetails && existingDetails.length > 0) {
            await supabase
              .from("campus_details")
              .update(updatePayload)
              .eq("id", existingDetails[0].id);
          } else {
            await supabase.from("campus_details").insert(updatePayload);
          }
        }
      }
    } catch (campusErr) {
      // Non-critical, ignore timeout
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
