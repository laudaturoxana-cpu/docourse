-- Lesson progress tracking
-- Tracks which lessons each student has completed
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS lesson_progress (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id    uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed    boolean NOT NULL DEFAULT false,
  completed_at timestamptz,
  last_seen_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user
  ON lesson_progress (user_id);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson
  ON lesson_progress (lesson_id);

-- RLS: users can only read/write their own progress
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own progress"
  ON lesson_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users update own progress"
  ON lesson_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own progress update"
  ON lesson_progress FOR UPDATE
  USING (auth.uid() = user_id);
