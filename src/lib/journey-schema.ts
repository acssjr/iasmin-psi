import { neon } from '@neondatabase/serverless'

// Only additive, idempotent changes. Existing submissions and CMS users are preserved.
export const journeySchemaStatements = [
  `CREATE TABLE IF NOT EXISTS journey_submissions (
    id UUID PRIMARY KEY, name TEXT, email TEXT, whatsapp TEXT, answers JSONB,
    reflection_theme TEXT CHECK (reflection_theme IN ('sobrecarrega','autocritica','reconexao')),
    purpose_consent_version TEXT NOT NULL, purpose_consented_at TIMESTAMPTZ NOT NULL,
    contact_permission BOOLEAN NOT NULL, contact_expires_at TIMESTAMPTZ,
    answers_expires_at TIMESTAMPTZ NOT NULL, answers_anonymized_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ, utm JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now())`,
  `ALTER TABLE journey_submissions ADD COLUMN IF NOT EXISTS journey_topic TEXT,
    ADD COLUMN IF NOT EXISTS result_key TEXT, ADD COLUMN IF NOT EXISTS content_version TEXT,
    ADD COLUMN IF NOT EXISTS answer_snapshot JSONB`,
  `ALTER TABLE journey_submissions ALTER COLUMN reflection_theme DROP NOT NULL`,
  `CREATE INDEX IF NOT EXISTS journey_submissions_retention_idx ON journey_submissions
    (answers_expires_at,contact_expires_at) WHERE deleted_at IS NULL`,
  `CREATE INDEX IF NOT EXISTS journey_submissions_topic_idx ON journey_submissions
    (journey_topic,created_at DESC) WHERE deleted_at IS NULL`,
  `CREATE TABLE IF NOT EXISTS journey_submission_reads (
    submission_id UUID NOT NULL REFERENCES journey_submissions(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL, viewed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (submission_id,user_id))`,
  `CREATE INDEX IF NOT EXISTS journey_submission_reads_user_idx ON journey_submission_reads(user_id,submission_id)`,
]
let initialized: Promise<void> | undefined
export async function ensureJourneySchema() {
  if (!process.env.DATABASE_URL) return
  initialized ??= (async () => {
    const sql = neon(process.env.DATABASE_URL!)
    await sql`CREATE TABLE IF NOT EXISTS site_schema_migrations (version integer PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`
    const applied = await sql`SELECT version FROM site_schema_migrations WHERE version=4`
    if (applied.length) return
    await sql.transaction(txn => [
      txn`SELECT pg_advisory_xact_lock(735021)`,
      ...journeySchemaStatements.map(statement => txn.query(statement)),
      txn`INSERT INTO site_schema_migrations(version) VALUES(4) ON CONFLICT DO NOTHING`,
    ])
    console.info('Migração da jornada 004 concluída.')
  })()
  try { await initialized } catch (error) { initialized = undefined; throw error }
}
