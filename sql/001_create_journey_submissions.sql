CREATE TABLE journey_submissions (
  id UUID PRIMARY KEY,
  name TEXT,
  email TEXT,
  whatsapp TEXT,
  answers JSONB,
  reflection_theme TEXT NOT NULL CHECK (reflection_theme IN ('sobrecarrega', 'autocritica', 'reconexao')),
  purpose_consent_version TEXT NOT NULL,
  purpose_consented_at TIMESTAMPTZ NOT NULL,
  contact_permission BOOLEAN NOT NULL,
  contact_expires_at TIMESTAMPTZ,
  answers_expires_at TIMESTAMPTZ NOT NULL,
  answers_anonymized_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  utm JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX journey_submissions_retention_idx
  ON journey_submissions (answers_expires_at, contact_expires_at)
  WHERE deleted_at IS NULL;
