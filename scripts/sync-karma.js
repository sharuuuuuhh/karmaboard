// scripts/sync-karma.js
// Direct sync runner that can be run from CLI (npm run sync) or imported by api/sync-karma.js
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const MULEARN_SEARCH = "https://mulearn.org/api/v1/dashboard/user/search/?search=";
const MULEARN_PROFILE = "https://mulearn.org/api/v1/dashboard/profile/user-profile/";

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.REACT_APP_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase URL or Key in environment");
  }
  return createClient(url, key);
}

async function fetchOne(muid) {
  try {
    const searchRes = await fetch(`${MULEARN_SEARCH}${encodeURIComponent(muid)}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    });
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

    // Fallback to profile API
    const res = await fetch(`${MULEARN_PROFILE}${encodeURIComponent(muid)}/`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const json = await res.json();
      const r = json?.response ?? json ?? {};
      const karma = r.karma ?? r.karma_points ?? r.total_karma ?? null;
      return {
        muid,
        ok: karma !== null,
        karma,
        rank: r.rank ?? null,
        full_name: r.full_name ?? r.name ?? null,
        error: null,
      };
    }
    return { muid, ok: false, error: "Not found in search or profile" };
  } catch (err) {
    return { muid, ok: false, error: err.message };
  }
}

async function syncAllKarma() {
  const supabase = getSupabase();
  const t0 = Date.now();

  console.log("Fetching student list from Supabase...");
  const { data: students, error: err } = await supabase
    .from("students")
    .select("muid");

  if (err || !students || students.length === 0) {
    console.error("Failed to load students:", err);
    return;
  }

  console.log(`Found ${students.length} students. Scraping muLearn with 6 workers...`);
  const queue = [...students.map((s) => s.muid)];
  const results = [];
  let processed = 0;

  async function worker() {
    while (queue.length > 0) {
      const muid = queue.shift();
      const res = await fetchOne(muid);
      results.push(res);
      processed++;
      if (processed % 25 === 0 || processed === students.length) {
        console.log(`Progress: ${processed}/${students.length} (${Math.round((Date.now() - t0) / 1000)}s)`);
      }
      await new Promise((r) => setTimeout(r, 60));
    }
  }

  const WORKERS = 6;
  await Promise.all(Array.from({ length: WORKERS }, worker));

  const successful = results.filter((r) => r.ok);
  console.log(`Scraped ${successful.length}/${students.length} successfully in ${Math.round((Date.now() - t0) / 1000)}s.`);

  // Determine monthly baseline from karma_history
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

  const { data: monthSnapshots } = await supabase
    .from("karma_history")
    .select("muid, karma, recorded_at")
    .gte("recorded_at", monthStart)
    .order("recorded_at", { ascending: true });

  const baselineMap = new Map();
  (monthSnapshots || []).forEach((row) => {
    if (!baselineMap.has(row.muid)) {
      baselineMap.set(row.muid, row.karma);
    }
  });

  console.log("Updating Supabase students table...");
  const BATCH_UPDATE = 20;
  for (let i = 0; i < successful.length; i += BATCH_UPDATE) {
    const batch = successful.slice(i, i + BATCH_UPDATE);
    await Promise.all(
      batch.map(async ({ muid, karma, rank, full_name }) => {
        const baseline = baselineMap.get(muid);
        const monthlyKarma = baseline !== undefined ? Math.max(0, karma - baseline) : 0;

        const update = { karma, monthly_karma: monthlyKarma };
        if (rank !== null) update.rank = rank;
        if (full_name) update.full_name = full_name;

        await supabase.from("students").update(update).eq("muid", muid);
      })
    );
  }

  // Snapshot today's karma
  console.log("Recording today's snapshots in karma_history...");
  const { data: existingToday } = await supabase
    .from("karma_history")
    .select("muid")
    .eq("recorded_at", today);

  const alreadySnapped = new Set((existingToday || []).map((r) => r.muid));
  const newSnapshots = successful
    .filter((r) => !alreadySnapped.has(r.muid))
    .map((r) => ({ muid: r.muid, karma: r.karma, recorded_at: today }));

  if (newSnapshots.length > 0) {
    await supabase.from("karma_history").insert(newSnapshots);
    console.log(`Inserted ${newSnapshots.length} new snapshots for ${today}.`);
  }

  console.log(`Sync completed successfully in ${Math.round((Date.now() - t0) / 1000)}s!`);
}

if (require.main === module) {
  syncAllKarma().catch(console.error);
}

module.exports = { syncAllKarma, fetchOne };
