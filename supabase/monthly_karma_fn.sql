-- ============================================================
-- Run this once in your Supabase SQL Editor:
-- Dashboard → SQL Editor → New query → paste & run
-- ============================================================

-- 1. Ensure the students table has a monthly_karma column
--    (skip if it already exists — this is safe to re-run)
ALTER TABLE students ADD COLUMN IF NOT EXISTS monthly_karma INTEGER DEFAULT 0;

-- 2. Ensure a karma_history table exists so monthly totals can be computed.
--    Each row = one recorded karma value for a student on a given date.
CREATE TABLE IF NOT EXISTS karma_history (
  id          BIGSERIAL PRIMARY KEY,
  muid        TEXT NOT NULL,
  karma       INTEGER NOT NULL,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Index for fast per-date lookups
CREATE INDEX IF NOT EXISTS karma_history_muid_date_idx
  ON karma_history (muid, recorded_at);

-- 3. Function: get_students_with_monthly_karma(p_start_date DATE)
--    Returns every student with their karma earned since p_start_date.
--    monthly_karma = current karma minus the earliest recorded karma in the period.
CREATE OR REPLACE FUNCTION get_students_with_monthly_karma(p_start_date DATE)
RETURNS TABLE (
  user_id     UUID,
  muid        TEXT,
  full_name   TEXT,
  karma       INTEGER,
  rank        INTEGER,
  department  TEXT,
  team        TEXT,
  monthly_karma INTEGER
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    s.user_id,
    s.muid,
    s.full_name,
    s.karma,
    s.rank,
    s.department,
    s.team,
    -- karma earned this month = current karma minus earliest snapshot in period
    GREATEST(
      0,
      s.karma - COALESCE(
        (
          SELECT kh.karma
          FROM karma_history kh
          WHERE kh.muid = s.muid
            AND kh.recorded_at >= p_start_date
          ORDER BY kh.recorded_at ASC
          LIMIT 1
        ),
        s.karma   -- if no history, monthly karma = 0
      )
    ) AS monthly_karma
  FROM students s
  ORDER BY monthly_karma DESC;
$$;

-- 4. (Optional) Snapshot today's karma for all students into karma_history.
--    Run this daily (or set up a pg_cron job) to keep history up to date.
-- INSERT INTO karma_history (muid, karma, recorded_at)
-- SELECT muid, karma, CURRENT_DATE FROM students
-- ON CONFLICT DO NOTHING;
