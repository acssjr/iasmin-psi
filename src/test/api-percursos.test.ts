import { beforeEach, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createJourneySubmission: vi.fn(),
}))

vi.mock('@/lib/data', () => ({
  createJourneySubmission: mocks.createJourneySubmission,
}))

import { POST } from '@/app/api/percursos/route'

const validBody = {
  adult: true,
  answers: [
    'sobrecarrega',
    'autocritica',
    'reconexao',
    'sobrecarrega',
    'autocritica',
  ],
  contactPermission: false,
  email: 'ana@example.com',
  honeypot: '',
  name: 'Ana',
  purposeConsent: true,
  submissionId: '31d5fa8d-a11b-405e-8d33-7959ff021906',
  utm: {},
  whatsapp: '71999999999',
}

const requestFor = (body: unknown) =>
  new Request('http://localhost/api/percursos', {
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  })

beforeEach(() => {
  mocks.createJourneySubmission.mockReset()
})

it('persists a valid submission before reporting success', async () => {
  mocks.createJourneySubmission.mockResolvedValue({ created: true })

  const response = await POST(requestFor(validBody))

  expect(response.status).toBe(201)
  await expect(response.json()).resolves.toEqual({ ok: true })
  expect(mocks.createJourneySubmission).toHaveBeenCalledWith(
    expect.objectContaining({ email: 'ana@example.com', purposeConsent: true }),
  )
})

it('rejects invalid consent and does not call the persistence boundary', async () => {
  const response = await POST(requestFor({ ...validBody, purposeConsent: false }))

  expect(response.status).toBe(400)
  expect(mocks.createJourneySubmission).not.toHaveBeenCalled()
})

it('returns a generic failure when storage is unavailable', async () => {
  mocks.createJourneySubmission.mockRejectedValue(new Error('database unavailable'))

  const response = await POST(requestFor(validBody))

  expect(response.status).toBe(500)
  await expect(response.json()).resolves.toEqual({ error: 'Não foi possível salvar agora.' })
})
