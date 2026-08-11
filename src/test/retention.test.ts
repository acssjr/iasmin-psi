import { beforeEach, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  anonymizeJourneyAnswers: vi.fn(),
  findExpiredJourneySubmissions: vi.fn(),
  purgeExpiredJourneyContact: vi.fn(),
}))

vi.mock('@/lib/data', () => mocks)

import { applyRetention } from '@/lib/retention'

beforeEach(() => {
  mocks.anonymizeJourneyAnswers.mockReset()
  mocks.findExpiredJourneySubmissions.mockReset()
  mocks.purgeExpiredJourneyContact.mockReset()
})

it('anonymizes expired answers while retaining a permitted contact', async () => {
  mocks.findExpiredJourneySubmissions.mockResolvedValue([
    {
      answers_anonymized_at: null,
      answers_expires_at: '2026-01-01T00:00:00.000Z',
      contact_expires_at: null,
      contact_permission: true,
      id: '31d5fa8d-a11b-405e-8d33-7959ff021906',
    },
  ])

  await applyRetention()

  expect(mocks.anonymizeJourneyAnswers).toHaveBeenCalledWith(
    '31d5fa8d-a11b-405e-8d33-7959ff021906',
  )
  expect(mocks.purgeExpiredJourneyContact).not.toHaveBeenCalled()
})

it('processes every overdue record and purges contact without permission', async () => {
  mocks.findExpiredJourneySubmissions.mockResolvedValue([
    {
      answers_anonymized_at: null,
      answers_expires_at: '2026-01-01T00:00:00.000Z',
      contact_expires_at: '2026-01-01T00:00:00.000Z',
      contact_permission: false,
      id: '31d5fa8d-a11b-405e-8d33-7959ff021906',
    },
    {
      answers_anonymized_at: '2026-01-02T00:00:00.000Z',
      answers_expires_at: '2026-01-01T00:00:00.000Z',
      contact_expires_at: '2026-01-01T00:00:00.000Z',
      contact_permission: false,
      id: 'beefbeef-a11b-405e-8d33-7959ff021906',
    },
  ])

  await expect(applyRetention()).resolves.toEqual({ processed: 2 })
  expect(mocks.anonymizeJourneyAnswers).toHaveBeenCalledTimes(1)
  expect(mocks.purgeExpiredJourneyContact).toHaveBeenCalledTimes(2)
})
