import { afterEach, beforeEach, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ applyRetention: vi.fn() }))

vi.mock('@/lib/retention', () => ({ applyRetention: mocks.applyRetention }))

import { GET, POST } from '@/app/api/retencao/route'

const authorizedRequest = () =>
  new Request('http://localhost/api/retencao', {
    headers: { authorization: 'Bearer cron-secret' },
    method: 'POST',
  })

beforeEach(() => {
  process.env.CRON_SECRET = 'cron-secret'
  mocks.applyRetention.mockReset()
})

afterEach(() => {
  delete process.env.CRON_SECRET
})

it('rejects calls without the cron authorization header', async () => {
  const response = await POST(new Request('http://localhost/api/retencao', { method: 'POST' }))

  expect(response.status).toBe(401)
  expect(mocks.applyRetention).not.toHaveBeenCalled()
})

it('runs the retention cycle for an authorized cron call', async () => {
  mocks.applyRetention.mockResolvedValue({ processed: 4 })

  const response = await GET(authorizedRequest())

  expect(response.status).toBe(200)
  await expect(response.json()).resolves.toEqual({ ok: true, processed: 4 })
})
