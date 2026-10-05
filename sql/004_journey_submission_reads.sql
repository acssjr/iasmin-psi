CREATE TABLE IF NOT EXISTS journey_submission_reads (
  submission_id UUID NOT NULL REFERENCES journey_submissions(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (submission_id, user_id)
);
CREATE INDEX IF NOT EXISTS journey_submission_reads_user_idx
  ON journey_submission_reads(user_id, submission_id);
