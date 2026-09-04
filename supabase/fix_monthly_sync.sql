-- ============================================================
-- FIX: Monthly Leaderboard Sync
-- Run this ONCE in Supabase → SQL Editor → New query → Run
-- ============================================================

-- ── Fix 1: Add UNIQUE constraint on karma_history(muid, recorded_at) ─────────
-- The ON CONFLICT DO NOTHING in the pg_cron job needs a unique constraint to
-- work correctly. Without it the clause is a no-op and duplicates accumulate.
ALTER TABLE karma_history
  ADD CONSTRAINT karma_history_muid_date_unique
  UNIQUE (muid, recorded_at);

-- ── Fix 2: Allow the serverless function to INSERT into karma_history ─────────
-- setup.sql only created a SELECT policy. The sync-karma API (running under the
-- anon key) was silently blocked from writing snapshots by RLS.
CREATE POLICY "Anon insert karma_history"
  ON karma_history FOR INSERT WITH CHECK (true);

-- (Optional) Also allow authenticated users to insert, in case you run manual
-- snapshots from the dashboard while logged in.
CREATE POLICY "Auth insert karma_history"
  ON karma_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ── Fix 3: Allow the serverless function to READ karma_history ────────────────
-- Needed so sync-karma.js can check which (muid, date) pairs already exist
-- before inserting (to avoid writing over the start-of-day baseline).
-- Note: "Public read karma_history" already exists in setup.sql — this is a
-- safety net in case it was missed.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'karma_history' AND policyname = 'Public read karma_history'
  ) THEN
    CREATE POLICY "Public read karma_history"
      ON karma_history FOR SELECT USING (true);
  END IF;
END $$;

-- ── Sanity check: preview the monthly leaderboard right now ──────────────────
-- Run this after the fixes to verify monthly_karma values are non-zero.
SELECT
  full_name,
  karma,
  monthly_karma
FROM get_students_with_monthly_karma(DATE_TRUNC('month', CURRENT_DATE)::DATE)
LIMIT 10;
