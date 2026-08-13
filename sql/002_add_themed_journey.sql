ALTER TABLE journey_submissions
  ADD COLUMN IF NOT EXISTS journey_topic TEXT,
  ADD COLUMN IF NOT EXISTS result_key TEXT,
  ADD COLUMN IF NOT EXISTS content_version TEXT;

ALTER TABLE journey_submissions
  ALTER COLUMN reflection_theme DROP NOT NULL;

CREATE INDEX IF NOT EXISTS journey_submissions_topic_idx
  ON journey_submissions (journey_topic, created_at DESC)
  WHERE deleted_at IS NULL;
