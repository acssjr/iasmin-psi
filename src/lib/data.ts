import { neon } from '@neondatabase/serverless'

import { getReflectionTheme } from './journey'
import type { JourneySubmission } from './schemas'

const PURPOSE_CONSENT_VERSION = '2026-08-11'
const RETENTION_DAYS = 180

type SqlClient = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<readonly { id: string }[]>

export type JourneyPersistenceResult = {
  created: boolean
}

export type ExpiredJourneySubmission = {
  answers_expires_at: string
  contact_expires_at: string | null
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
  submission: JourneySubmission,
): Promise<JourneyPersistenceResult> {
  const sql = getSqlClient()
  const now = new Date()
  const answersExpiresAt = addRetentionWindow(now)
  const contactExpiresAt = submission.contactPermission ? null : answersExpiresAt
  const result = await sql`
    INSERT INTO journey_submissions (
      id,
      name,
      email,
      whatsapp,
      answers,
      reflection_theme,
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
      ${getReflectionTheme(submission.answers)},
      ${PURPOSE_CONSENT_VERSION},
      ${now.toISOString()}::timestamptz,
      ${submission.contactPermission},
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
    SELECT id, answers_expires_at, contact_expires_at
    FROM journey_submissions
    WHERE deleted_at IS NULL
      AND (
        answers_expires_at <= now()
        OR (contact_expires_at IS NOT NULL AND contact_expires_at <= now())
      )
    ORDER BY answers_expires_at ASC
    LIMIT ${Math.min(Math.max(limit, 1), 500)}
  `

  return result as readonly ExpiredJourneySubmission[]
}
