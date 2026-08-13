import { neon } from '@neondatabase/serverless'

import type { JourneySubmission } from './schemas'

const PURPOSE_CONSENT_VERSION = '2026-08-11'
const RETENTION_DAYS = 180

type SqlClient = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<readonly Record<string, unknown>[]>

export type JourneyPersistenceResult = {
  created: boolean
}

export type ExpiredJourneySubmission = {
  answers_anonymized_at: string | null
  answers_expires_at: string
  contact_expires_at: string | null
  contact_permission: boolean
  id: string
}

function getSqlClient(): SqlClient {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL is not configured.')
  }

  return neon(connectionString) as unknown as SqlClient
}

function addRetentionWindow(now: Date) {
  const expiration = new Date(now)
  expiration.setUTCDate(expiration.getUTCDate() + RETENTION_DAYS)
  return expiration
}

export async function createJourneySubmission(
  submission: JourneySubmission & { resultKey: string },
): Promise<JourneyPersistenceResult> {
  const sql = getSqlClient()
  const now = new Date()
  const answersExpiresAt = addRetentionWindow(now)
  const contactExpiresAt = answersExpiresAt
  const result = await sql`
    INSERT INTO journey_submissions (
      id,
      name,
      email,
      whatsapp,
      answers,
      reflection_theme,
      journey_topic,
      result_key,
      content_version,
      purpose_consent_version,
      purpose_consented_at,
      contact_permission,
      contact_expires_at,
      answers_expires_at,
      utm
    ) VALUES (
      ${submission.submissionId}::uuid,
      ${submission.name},
      ${submission.email},
      ${submission.whatsapp},
      ${JSON.stringify(submission.answers)}::jsonb,
      ${null},
      ${submission.topic},
      ${submission.resultKey},
      ${submission.contentVersion},
      ${PURPOSE_CONSENT_VERSION},
      ${now.toISOString()}::timestamptz,
      ${false},
      ${contactExpiresAt?.toISOString() ?? null}::timestamptz,
      ${answersExpiresAt.toISOString()}::timestamptz,
      ${JSON.stringify(submission.utm)}::jsonb
    )
    ON CONFLICT (id) DO NOTHING
    RETURNING id
  `

  return { created: result.length > 0 }
}

export async function findExpiredJourneySubmissions(
  limit = 100,
): Promise<readonly ExpiredJourneySubmission[]> {
  const sql = getSqlClient()
  const result = await sql`
    SELECT id,
           answers_anonymized_at,
           answers_expires_at,
           contact_expires_at,
           contact_permission
    FROM journey_submissions
    WHERE deleted_at IS NULL
      AND (
        (answers_anonymized_at IS NULL AND answers_expires_at <= now())
        OR (
          contact_permission = false
          AND contact_expires_at IS NOT NULL
          AND contact_expires_at <= now()
        )
      )
    ORDER BY answers_expires_at ASC
    LIMIT ${Math.min(Math.max(limit, 1), 500)}
  `

  return result as readonly ExpiredJourneySubmission[]
}

export async function anonymizeJourneyAnswers(id: string) {
  const sql = getSqlClient()

  await sql`
    UPDATE journey_submissions
    SET answers = NULL, answers_anonymized_at = now()
    WHERE id = ${id}::uuid
      AND answers_anonymized_at IS NULL
  `
}

export async function purgeExpiredJourneyContact(id: string) {
  const sql = getSqlClient()

  await sql`
    UPDATE journey_submissions
    SET name = NULL,
        email = NULL,
        whatsapp = NULL,
        deleted_at = now()
    WHERE id = ${id}::uuid
      AND contact_permission = false
      AND deleted_at IS NULL
  `
}
