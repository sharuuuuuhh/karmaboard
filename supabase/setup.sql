-- ============================================================
-- FULL SETUP — Run this in Supabase SQL Editor
-- Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

-- 1. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
  user_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  muid        TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  karma       INTEGER DEFAULT 0,
  rank        INTEGER,
  department  TEXT,
  team        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CAMPUS DETAILS TABLE
CREATE TABLE IF NOT EXISTS campus_details (
  id             BIGSERIAL PRIMARY KEY,
  rank           INTEGER,
  karma          BIGINT DEFAULT 0,
  active_members INTEGER DEFAULT 0,
  total_members  INTEGER DEFAULT 0,
  updated_at     TIMESTAMPTZ DEFAULT NOW()
);

-- Insert a default row so the home page doesn't crash
INSERT INTO campus_details (rank, karma, active_members, total_members)
VALUES (0, 0, 0, 0)
ON CONFLICT DO NOTHING;

-- 3. KARMA HISTORY TABLE (for monthly tracking)
CREATE TABLE IF NOT EXISTS karma_history (
  id          BIGSERIAL PRIMARY KEY,
  muid        TEXT NOT NULL,
  karma       INTEGER NOT NULL,
  recorded_at DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS karma_history_muid_date_idx
  ON karma_history (muid, recorded_at);

-- 4. MONTHLY KARMA RPC FUNCTION
CREATE OR REPLACE FUNCTION get_students_with_monthly_karma(p_start_date DATE)
RETURNS TABLE (
  user_id       UUID,
  muid          TEXT,
  full_name     TEXT,
  karma         INTEGER,
  rank          INTEGER,
  department    TEXT,
  team          TEXT,
  monthly_karma INTEGER
)
LANGUAGE sql STABLE AS $$
  SELECT
    s.user_id,
    s.muid,
    s.full_name,
    s.karma,
    s.rank,
    s.department,
    s.team,
    GREATEST(0,
      s.karma - COALESCE(
        (SELECT kh.karma FROM karma_history kh
         WHERE kh.muid = s.muid AND kh.recorded_at >= p_start_date
         ORDER BY kh.recorded_at ASC LIMIT 1),
        s.karma
      )
    ) AS monthly_karma
  FROM students s
  ORDER BY monthly_karma DESC;
$$;

-- 5. ENABLE Row Level Security (allow public read, authenticated write)
ALTER TABLE students      ENABLE ROW LEVEL SECURITY;
ALTER TABLE campus_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE karma_history  ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read
CREATE POLICY "Public read students"
  ON students FOR SELECT USING (true);

CREATE POLICY "Public read campus_details"
  ON campus_details FOR SELECT USING (true);

CREATE POLICY "Public read karma_history"
  ON karma_history FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete students
CREATE POLICY "Auth insert students"
  ON students FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Auth update students"
  ON students FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth delete students"
  ON students FOR DELETE USING (auth.role() = 'authenticated');

-- Allow anon to update students (needed for sync-karma serverless function)
CREATE POLICY "Anon update karma"
  ON students FOR UPDATE USING (true);
