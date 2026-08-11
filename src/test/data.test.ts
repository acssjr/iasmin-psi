import { beforeEach, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  neon: vi.fn(),
  sql: vi.fn(),
}))

vi.mock('@neondatabase/serverless', () => ({ neon: mocks.neon }))

import { createJourneySubmission } from '@/lib/data'
import { journeySubmissionSchema } from '@/lib/schemas'

const submission = journeySubmissionSchema.parse({
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
})

beforeEach(() => {
  process.env.DATABASE_URL = 'postgresql://example.test/iasmin'
  mocks.neon.mockReset()
  mocks.sql.mockReset()
  mocks.neon.mockReturnValue(mocks.sql)
})

it('uses the database idempotency constraint for duplicate submission ids', async () => {
  mocks.sql.mockResolvedValueOnce([{ id: submission.submissionId }]).mockResolvedValueOnce([])

  const first = await createJourneySubmission(submission)
  const duplicate = await createJourneySubmission(submission)

  expect(first).toEqual({ created: true })
  expect(duplicate).toEqual({ created: false })
  expect(mocks.sql.mock.calls[0][0].join(' ')).toContain('ON CONFLICT (id) DO NOTHING')
})
