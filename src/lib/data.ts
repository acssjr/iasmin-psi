import { neon } from '@neondatabase/serverless'

import type { JourneySubmission } from './schemas'
import type { JourneyAnswerSnapshot, JourneyRecord, JourneyRecordSummary } from './journey-records'
import { readLocalJourneys, mutateLocalJourneys } from './local-journey-store'
import { ensureJourneySchema } from './journey-schema'

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
  submission: JourneySubmission & { resultKey: string; answerSnapshot?: JourneyAnswerSnapshot | null },
): Promise<JourneyPersistenceResult> {
  const now = new Date()
  const answersExpiresAt = addRetentionWindow(now)
  const contactExpiresAt = answersExpiresAt
  if (!process.env.DATABASE_URL) return mutateLocalJourneys(records => {
    if (records.some(record => record.id === submission.submissionId)) return { created: false }
    records.push({ id: submission.submissionId, name: submission.name, email: submission.email, whatsapp: submission.whatsapp,
      answers: submission.answers, created_at: now.toISOString(), journey_topic: submission.topic, reflection_theme: null,
      result_key: submission.resultKey, content_version: submission.contentVersion,
      purpose_consent_version: PURPOSE_CONSENT_VERSION, purpose_consented_at: now.toISOString(), contact_permission: false,
      contact_expires_at: contactExpiresAt.toISOString(), answers_expires_at: answersExpiresAt.toISOString(),
      answers_anonymized_at: null, deleted_at: null, answer_snapshot: submission.answerSnapshot || null, utm: submission.utm })
    return { created: true }
  })
  await ensureJourneySchema()
  const sql = getSqlClient()
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
      utm,
      answer_snapshot
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
      ${JSON.stringify(submission.utm)}::jsonb,
      ${JSON.stringify(submission.answerSnapshot || null)}::jsonb
    )
    ON CONFLICT (id) DO NOTHING
    RETURNING id
  `

  return { created: result.length > 0 }
}

export async function findExpiredJourneySubmissions(
  limit = 100,
): Promise<readonly ExpiredJourneySubmission[]> {
  if (!process.env.DATABASE_URL) return (await readLocalJourneys()).filter(record => !record.deleted_at && (
    (!record.answers_anonymized_at && Date.parse(record.answers_expires_at) <= Date.now()) ||
    (!record.contact_permission && record.contact_expires_at && Date.parse(record.contact_expires_at) <= Date.now())
  )).slice(0, Math.min(Math.max(limit, 1), 500))
  await ensureJourneySchema()
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
  if (!process.env.DATABASE_URL) return mutateLocalJourneys(records => {
    const record = records.find(item => item.id === id)
    if (record && !record.answers_anonymized_at) { record.answers = null; record.answer_snapshot = null; record.answers_anonymized_at = new Date().toISOString() }
  })
  await ensureJourneySchema()
  const sql = getSqlClient()

  await sql`
    UPDATE journey_submissions
    SET answers = NULL, answer_snapshot = NULL, answers_anonymized_at = now()
    WHERE id = ${id}::uuid
      AND answers_anonymized_at IS NULL
  `
}

export async function purgeExpiredJourneyContact(id: string) {
  if (!process.env.DATABASE_URL) return mutateLocalJourneys(records => {
    const record = records.find(item => item.id === id)
    if (record && !record.contact_permission && !record.deleted_at) {
      record.name = null; record.email = null; record.whatsapp = null; record.deleted_at = new Date().toISOString()
    }
  })
  await ensureJourneySchema()
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

function visibleJourney(record: JourneyRecord) {
  return !record.deleted_at && Date.parse(record.answers_expires_at) > Date.now() &&
    (record.contact_permission || !record.contact_expires_at || Date.parse(record.contact_expires_at) > Date.now())
}
export async function listJourneySubmissions({ search = '', topic = '', page = 1 }: { search?: string; topic?: string; page?: number }) {
  const limit = 25, offset = (page - 1) * limit
  if (!process.env.DATABASE_URL) {
    const records = (await readLocalJourneys()).filter(record => visibleJourney(record) && (!topic || record.journey_topic === topic) &&
      [record.name, record.email, record.whatsapp].some(value => (value || '').toLowerCase().includes(search.toLowerCase())))
      .sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id.localeCompare(a.id))
    return { total: records.length, page, items: records.slice(offset, offset + limit).map(({ id, name, email, whatsapp, created_at, journey_topic, reflection_theme }) =>
      ({ id, name, email, whatsapp, created_at, journey_topic, reflection_theme })) }
  }
  await ensureJourneySchema()
  const sql = getSqlClient()
  // COUNT and page selection share one statement/snapshot, including empty pages.
  const rows = await sql`
    WITH filtered AS (
      SELECT id, name, email, whatsapp, created_at, journey_topic, reflection_theme
      FROM journey_submissions
      WHERE deleted_at IS NULL AND answers_expires_at > now()
        AND (contact_permission OR contact_expires_at IS NULL OR contact_expires_at > now())
        AND (${topic} = '' OR journey_topic = ${topic})
        AND (${search} = '' OR strpos(lower(coalesce(name,'') || ' ' || coalesce(email,'') || ' ' || coalesce(whatsapp,'')), lower(${search})) > 0)
    )
    SELECT (SELECT count(*) FROM filtered)::integer AS total,
      coalesce((SELECT jsonb_agg(paged) FROM (SELECT * FROM filtered ORDER BY created_at DESC, id DESC LIMIT ${limit} OFFSET ${offset}) paged), '[]'::jsonb) AS items
  `
  return { total: Number(rows[0].total), page, items: rows[0].items as JourneyRecordSummary[] }
}
export async function readJourneySubmission(id: string): Promise<JourneyRecord | null> {
  if (!process.env.DATABASE_URL) {
    const record = (await readLocalJourneys()).find(record => record.id === id && visibleJourney(record))
    if (!record) return null
    const { viewed_by, ...publicRecord } = record
    void viewed_by
    return publicRecord
  }
  await ensureJourneySchema()
  const sql = getSqlClient()
  const rows = await sql`
    SELECT id, name, email, whatsapp, created_at, journey_topic, reflection_theme, answers, result_key, content_version,
      purpose_consent_version, purpose_consented_at, contact_permission, contact_expires_at, answers_expires_at,
      answers_anonymized_at, deleted_at, answer_snapshot
    FROM journey_submissions WHERE id = ${id}::uuid AND deleted_at IS NULL AND answers_expires_at > now()
      AND (contact_permission OR contact_expires_at IS NULL OR contact_expires_at > now())
  `
  return (rows[0] as JourneyRecord | undefined) || null
}

export async function unreadJourneyCount(userId: string): Promise<number> {
  if (!process.env.DATABASE_URL) return (await readLocalJourneys()).filter(record => visibleJourney(record) && !record.viewed_by?.includes(userId)).length
  await ensureJourneySchema()
  const sql = getSqlClient()
  const rows = await sql`SELECT count(*)::integer AS unread FROM journey_submissions s
    WHERE s.deleted_at IS NULL AND s.answers_expires_at > now()
      AND (s.contact_permission OR s.contact_expires_at IS NULL OR s.contact_expires_at > now())
      AND NOT EXISTS (SELECT 1 FROM journey_submission_reads r WHERE r.submission_id=s.id AND r.user_id=${userId})`
  return Number(rows[0].unread)
}
export async function markJourneyViewed(id: string, userId: string): Promise<boolean> {
  if (!process.env.DATABASE_URL) return mutateLocalJourneys(records => {
    const record = records.find(item => item.id === id && visibleJourney(item))
    if (!record) return false
    record.viewed_by ??= []
    if (!record.viewed_by.includes(userId)) record.viewed_by.push(userId)
    return true
  })
  await ensureJourneySchema()
  const sql = getSqlClient()
  const rows = await sql`INSERT INTO journey_submission_reads(submission_id,user_id)
    SELECT id, ${userId} FROM journey_submissions WHERE id=${id}::uuid
      AND deleted_at IS NULL AND answers_expires_at > now()
      AND (contact_permission OR contact_expires_at IS NULL OR contact_expires_at > now())
    ON CONFLICT(submission_id,user_id) DO UPDATE SET viewed_at=now() RETURNING submission_id`
  return rows.length > 0
}
