// api/sync-karma.js
// Vercel serverless function — fetches karma from muLearn API and writes to Supabase.
// Called by the React frontend via POST /api/sync-karma.
// Node.js runtime (no Playwright, no Flask).

const { createClient } = require("@supabase/supabase-js");

const MULEARN_API =
  "https://api.mulearn.org/api/v1/dashboard/profile/user-profile/";

// Server-side Supabase client — uses the service key when available so RLS
// doesn't block writes; falls back to the anon key if only that is set.
function getSupabase() {
  const url = process.env.REACT_APP_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing REACT_APP_SUPABASE_URL or SUPABASE_SERVICE_KEY env vars"
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

    return res.status(200).json({
      synced: updates.filter((u) => u.success).length,
      failed: results.filter((r) => !r.ok),
      results,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
