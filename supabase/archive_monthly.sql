-- ============================================================
-- AUTOMATED MONTHLY KARMA RESET, SNAPSHOTS, & ARCHIVING
-- Run this in your Supabase SQL Editor:
-- Dashboard → SQL Editor → New query → paste & run
-- ============================================================

-- 1. Enable pg_cron Extension (Required for scheduling)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- 2. Create the Monthly Archives Table
CREATE TABLE IF NOT EXISTS monthly_archives (
  id            BIGSERIAL PRIMARY KEY,
  archive_month DATE NOT NULL,          -- e.g., '2026-08-01' for August 2026
  muid          TEXT NOT NULL,
  full_name     TEXT,
  karma         INTEGER NOT NULL DEFAULT 0, -- Total overall karma at month end
  monthly_karma INTEGER NOT NULL DEFAULT 0, -- Karma points earned in that month
  rank          INTEGER,                -- Global rank at month end
  monthly_rank  INTEGER,                -- Campus monthly rank
  department    TEXT,
  team          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast historical queries
CREATE INDEX IF NOT EXISTS monthly_archives_month_muid_idx 
  ON monthly_archives (archive_month, muid);

-- 3. Create the Archiving Database Function
CREATE OR REPLACE FUNCTION archive_monthly_leaderboard()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date DATE;
  v_archive_month DATE;
BEGIN
  -- Identify the start of the previous month (e.g. if today is Sept 1, start date is Aug 1)
  v_start_date := (DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'))::DATE;
  v_archive_month := v_start_date;
  
  -- Insert previous month's final rankings
  INSERT INTO monthly_archives (
    archive_month,
    muid,
    full_name,
    karma,
    monthly_karma,
    rank,
    monthly_rank,
    department,
    team
  )
  SELECT
    v_archive_month,
    r.muid,
    r.full_name,
    r.karma,
    r.monthly_karma,
    r.rank,
    ROW_NUMBER() OVER (ORDER BY r.monthly_karma DESC)::INTEGER AS monthly_rank,
    r.department,
    r.team
  FROM get_students_with_monthly_karma(v_start_date) r;
END;
$$;

-- 4. Schedule Daily Snapshots (Runs every night at 11:55 PM)
-- Safe unschedule first to avoid duplicate schedules if re-running script
SELECT cron.unschedule(jobname) FROM cron.job WHERE jobname = 'daily-karma-snapshot-job';
SELECT cron.schedule(
  'daily-karma-snapshot-job',
  '55 23 * * *', -- 11:55 PM every day
  $$
  INSERT INTO karma_history (muid, karma, recorded_at)
  SELECT muid, karma, CURRENT_DATE FROM students
  ON CONFLICT DO NOTHING;
  $$
);

-- 5. Schedule Monthly Archiving (Runs on the 1st of every month at 12:05 AM)
-- Safe unschedule first to avoid duplicate schedules if re-running script
SELECT cron.unschedule(jobname) FROM cron.job WHERE jobname = 'archive-monthly-leaderboard-job';
SELECT cron.schedule(
  'archive-monthly-leaderboard-job',
  '5 0 1 * *', -- 12:05 AM on the 1st of every month
  $$SELECT archive_monthly_leaderboard();$$
);
