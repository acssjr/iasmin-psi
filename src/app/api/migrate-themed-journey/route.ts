import { neon } from '@neondatabase/serverless'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return Response.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  if (!process.env.DATABASE_URL) {
    return Response.json({ error: 'Banco não configurado.' }, { status: 500 })
  }

  const sql = neon(process.env.DATABASE_URL)
  await sql`ALTER TABLE journey_submissions ADD COLUMN IF NOT EXISTS journey_topic TEXT, ADD COLUMN IF NOT EXISTS result_key TEXT, ADD COLUMN IF NOT EXISTS content_version TEXT`
  await sql`ALTER TABLE journey_submissions ALTER COLUMN reflection_theme DROP NOT NULL`
  await sql`CREATE INDEX IF NOT EXISTS journey_submissions_topic_idx ON journey_submissions (journey_topic, created_at DESC) WHERE deleted_at IS NULL`

  return Response.json({ ok: true })
}
