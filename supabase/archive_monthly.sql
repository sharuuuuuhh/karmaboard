-- ============================================================
-- AUTOMATED MONTHLY KARMA RESET, SNAPSHOTS, & ARCHIVING
-- Run this in your Supabase SQL Editor:
-- Dashboard → SQL Editor → New query → paste & run
-- ============================================================

-- 1. Enable pg_cron Extension (Required for scheduling on Supabase Pro)
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;

-- 2. Create the Monthly Archives Table
CREATE TABLE IF NOT EXISTS monthly_archives (
  id            BIGSERIAL PRIMARY KEY,
  archive_month DATE NOT NULL,          -- e.g., '2026-10-01' for October 2026
  muid          TEXT NOT NULL,
  full_name     TEXT,
  karma         INTEGER NOT NULL DEFAULT 0, -- Total overall karma at month end
  monthly_karma INTEGER NOT NULL DEFAULT 0, -- Karma points earned in that month
  rank          INTEGER,                -- Global rank at month end
  monthly_rank  INTEGER,                -- Campus monthly rank
  department    TEXT,
  team          TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT monthly_archives_month_muid_key UNIQUE (archive_month, muid)
);

-- Index for fast historical queries
CREATE INDEX IF NOT EXISTS monthly_archives_month_muid_idx 
  ON monthly_archives (archive_month, muid);

-- 3. Row Level Security Policies for monthly_archives
ALTER TABLE monthly_archives ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'monthly_archives' AND policyname = 'Public read monthly_archives') THEN
    CREATE POLICY "Public read monthly_archives" ON monthly_archives FOR SELECT USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'monthly_archives' AND policyname = 'Anon insert monthly_archives') THEN
    CREATE POLICY "Anon insert monthly_archives" ON monthly_archives FOR INSERT WITH CHECK (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'monthly_archives' AND policyname = 'Anon update monthly_archives') THEN
    CREATE POLICY "Anon update monthly_archives" ON monthly_archives FOR UPDATE USING (true);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'monthly_archives' AND policyname = 'Anon delete monthly_archives') THEN
    CREATE POLICY "Anon delete monthly_archives" ON monthly_archives FOR DELETE USING (true);
  END IF;
END $$;

-- 4. Create the Archiving Database Function
CREATE OR REPLACE FUNCTION archive_monthly_leaderboard()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_start_date DATE;
  v_end_date DATE;
BEGIN
  -- Identify the previous calendar month
  v_start_date := (DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month'))::DATE;
  v_end_date   := (DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day')::DATE;
  
  -- Calculate karma gained between start and end of that month from karma_history
  WITH month_start AS (
    SELECT DISTINCT ON (muid) muid, karma
    FROM karma_history
    WHERE recorded_at <= v_start_date
    ORDER BY muid, recorded_at DESC
  ),
  month_end AS (
    SELECT DISTINCT ON (muid) muid, karma
    FROM karma_history
    WHERE recorded_at <= v_end_date
    ORDER BY muid, recorded_at DESC
  ),
  month_stats AS (
    SELECT
      s.muid,
      s.full_name,
      COALESCE(me.karma, s.karma) AS karma,
      GREATEST(0, COALESCE(me.karma, s.karma) - COALESCE(ms.karma, 0)) AS monthly_karma,
      s.rank,
      s.department,
      s.team
    FROM students s
    LEFT JOIN month_start ms ON ms.muid = s.muid
    LEFT JOIN month_end me ON me.muid = s.muid
    WHERE GREATEST(0, COALESCE(me.karma, s.karma) - COALESCE(ms.karma, 0)) > 0
  )
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
    v_start_date,
    ms.muid,
    ms.full_name,
    ms.karma,
    ms.monthly_karma,
    ms.rank,
    ROW_NUMBER() OVER (ORDER BY ms.monthly_karma DESC)::INTEGER AS monthly_rank,
    ms.department,
    ms.team
  FROM month_stats ms
  ON CONFLICT (archive_month, muid)
  DO UPDATE SET
    karma = EXCLUDED.karma,
    monthly_karma = EXCLUDED.monthly_karma,
    monthly_rank = EXCLUDED.monthly_rank,
    department = EXCLUDED.department,
    team = EXCLUDED.team;
END;
$$;

-- 5. Backfill October 2026 Archive Immediately
-- (Computes exact October progress for all students who gained karma between Oct 1 and Oct 31)
WITH oct_start AS (
  SELECT DISTINCT ON (muid) muid, karma
  FROM karma_history
  WHERE recorded_at <= '2026-10-01'
  ORDER BY muid, recorded_at DESC
),
oct_end AS (
  SELECT DISTINCT ON (muid) muid, karma
  FROM karma_history
  WHERE recorded_at <= '2026-10-31'
  ORDER BY muid, recorded_at DESC
),
oct_stats AS (
  SELECT
    s.muid,
    s.full_name,
    COALESCE(oe.karma, s.karma) AS karma,
    GREATEST(0, COALESCE(oe.karma, s.karma) - COALESCE(os.karma, 0)) AS monthly_karma,
    s.rank,
    s.department,
    s.team
  FROM students s
  LEFT JOIN oct_start os ON os.muid = s.muid
  LEFT JOIN oct_end oe ON oe.muid = s.muid
  WHERE GREATEST(0, COALESCE(oe.karma, s.karma) - COALESCE(os.karma, 0)) > 0
)
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
  '2026-10-01'::DATE,
  os.muid,
  os.full_name,
  os.karma,
  os.monthly_karma,
  os.rank,
  ROW_NUMBER() OVER (ORDER BY os.monthly_karma DESC)::INTEGER AS monthly_rank,
  os.department,
  os.team
FROM oct_stats os
ON CONFLICT (archive_month, muid)
DO UPDATE SET
  karma = EXCLUDED.karma,
  monthly_karma = EXCLUDED.monthly_karma,
  monthly_rank = EXCLUDED.monthly_rank,
  department = EXCLUDED.department,
  team = EXCLUDED.team;

-- 6. Schedule Daily Snapshots (Runs every night at 11:55 PM)
-- Safe unschedule first to avoid duplicate schedules if re-running script
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule(jobname) FROM cron.job WHERE jobname = 'daily-karma-snapshot-job';
    PERFORM cron.schedule(
      'daily-karma-snapshot-job',
      '55 23 * * *',
      $cron$
      INSERT INTO karma_history (muid, karma, recorded_at)
      SELECT muid, karma, CURRENT_DATE FROM students
      ON CONFLICT DO NOTHING;
      $cron$
    );

    PERFORM cron.unschedule(jobname) FROM cron.job WHERE jobname = 'archive-monthly-leaderboard-job';
    PERFORM cron.schedule(
      'archive-monthly-leaderboard-job',
      '5 0 1 * *',
      $cron$SELECT archive_monthly_leaderboard();$cron$
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- pg_cron not available on free tier, snapshots handled via sync API
  NULL;
END $$;
