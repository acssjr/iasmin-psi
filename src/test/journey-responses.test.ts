// @vitest-environment node
import { afterAll, beforeAll, expect, it, vi } from 'vitest'
import { mkdtemp, rm } from 'node:fs/promises'
import path from 'node:path'
import { tmpdir } from 'node:os'
import { createJourneySubmission, listJourneySubmissions, readJourneySubmission, anonymizeJourneyAnswers } from '@/lib/data'
import { mutateLocalJourneys } from '@/lib/local-journey-store'
import { snapshotJourney } from '@/lib/journey-records'
import { journeySubmissionSchema } from '@/lib/schemas'
import { fields } from '@/lib/cms/catalog'

const actor = vi.hoisted(() => ({ user: null as null | { role: string; id: string } }))
vi.mock('@/lib/cms/auth', () => ({ currentUser: async () => actor.user, sameOrigin: (request: Request) => { if (request.headers.get('origin') !== 'http://localhost:3000') throw new Error('Origin') } }))
import { GET } from '@/app/api/admin/respostas/route'
import { GET as notifications, POST as acknowledge } from '@/app/api/admin/notificacoes/route'
let directory: string
const body = journeySubmissionSchema.parse({ adult: true, answers: ['ans-1-a','ans-2-a','ans-3-c','ans-4-c','ans-5-a'], contentVersion: '2026-08-13', email: 'qa@example.test', honeypot: '', name: 'Pessoa de teste', purposeConsent: true, submissionId: '31d5fa8d-a11b-405e-8d33-7959ff021906', topic: 'ansiedade-sobrecarga', utm: {}, whatsapp: '71999999999' })
beforeAll(async () => {
  directory = await mkdtemp(path.join(tmpdir(), 'journey-responses-'))
  vi.stubEnv('CMS_DATA_DIRECTORY', directory); vi.stubEnv('DATABASE_URL', ''); vi.stubEnv('NODE_ENV', 'test')
})
afterAll(async () => { vi.unstubAllEnvs(); await rm(directory, { recursive: true, force: true }) })
const request = (query = '') => new Request(`http://localhost:3000/api/admin/respostas${query}`)

it('blocks anonymous and editor access before reading personal data', async () => {
  expect((await GET(request())).status).toBe(401)
  actor.user = { role: 'editor', id: 'editor' }
  expect((await GET(request())).status).toBe(403)
  expect((await notifications()).status).toBe(403)
  actor.user = { role: 'admin', id: 'admin-1' }
  expect((await GET(request('?id=invalid'))).status).toBe(400)
  expect((await GET(request('?page=-1'))).status).toBe(400)
  expect((await GET(request('?topic=invalid'))).status).toBe(400)
})
it('stores an idempotent local submission with published text frozen in its snapshot', async () => {
  const original = snapshotJourney(body.topic, body.answers, 'ansiedade-sobrecarga:pace-step', {})!
  const field = fields.find(item => item.default === original.questions[0].question)!
  const snapshot = snapshotJourney(body.topic, body.answers, 'ansiedade-sobrecarga:pace-step', { [field.id]: 'Pergunta publicada de teste' })!
  const submission = { ...body, resultKey: 'ansiedade-sobrecarga:pace-step', answerSnapshot: snapshot }
  expect(await createJourneySubmission(submission)).toEqual({ created: true })
  expect(await createJourneySubmission(submission)).toEqual({ created: false })
  const record = await readJourneySubmission(body.submissionId)
  expect(record?.answer_snapshot?.questions[0].question).toBe('Pergunta publicada de teste')
  expect(record?.answer_snapshot?.questions).toHaveLength(5)
  expect(record?.answer_snapshot?.reflection?.title).toBeTruthy()
})
it('lists summaries, filters literally, paginates and returns authenticated detail without cache', async () => {
  const response = await GET(request('?search=PESSOA'))
  expect(response.status).toBe(200)
  expect(response.headers.get('Cache-Control')).toContain('no-store')
  const listing = await response.json()
  expect(listing.total).toBe(1)
  expect(listing.storage).toBe('local')
  expect(listing.items[0]).not.toHaveProperty('answers')
  expect((await listJourneySubmissions({ search: '%' })).total).toBe(0)
  expect((await listJourneySubmissions({ topic: 'luto-mudancas' })).total).toBe(0)
  expect((await listJourneySubmissions({ page: 2 })).items).toEqual([])
  const detail = await (await GET(request(`?id=${body.submissionId}`))).json()
  expect(detail.record.answers).toEqual(body.answers)
})
it('keeps notifications per administrator and marks a response only after explicit acknowledgement', async () => {
  expect((await (await notifications()).json()).unread).toBe(1)
  await GET(request())
  expect((await (await notifications()).json()).unread).toBe(1)
  const receipt = (origin: string) => new Request('http://localhost:3000/api/admin/notificacoes', { method: 'POST', headers: { Origin: origin }, body: JSON.stringify({ id: body.submissionId }) })
  expect((await acknowledge(receipt('https://other.example'))).status).toBe(400)
  expect((await acknowledge(receipt('http://localhost:3000'))).status).toBe(200)
  expect((await (await notifications()).json()).unread).toBe(0)
  actor.user = { role: 'admin', id: 'admin-2' }
  expect((await (await notifications()).json()).unread).toBe(1)
  expect((await readJourneySubmission(body.submissionId))).not.toHaveProperty('viewed_by')
})
it('hides expired submissions even before the retention job runs and erases snapshot on anonymization', async () => {
  await mutateLocalJourneys(records => { records[0].answers_expires_at = '2000-01-01T00:00:00Z' })
  expect((await listJourneySubmissions({})).total).toBe(0)
  expect(await readJourneySubmission(body.submissionId)).toBeNull()
  expect((await GET(request(`?id=${body.submissionId}`))).status).toBe(404)
  await anonymizeJourneyAnswers(body.submissionId)
  const { readLocalJourneys } = await import('@/lib/local-journey-store')
  const record = (await readLocalJourneys())[0]
  expect(record.answers).toBeNull(); expect(record.answer_snapshot).toBeNull()
})
it('refuses filesystem persistence in production without a database', async () => {
  vi.stubEnv('NODE_ENV', 'production')
  expect((await GET(request())).status).toBe(503)
  await expect(createJourneySubmission({ ...body, resultKey: 'ansiedade-sobrecarga:pace' })).rejects.toThrow('DATABASE_URL')
})
