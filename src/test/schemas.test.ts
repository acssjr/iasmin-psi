import { expect, it } from 'vitest'

import { journeySubmissionSchema } from '@/lib/schemas'

const validBody = {
  adult: true,
  answers: [
    'sobrecarrega',
    'autocritica',
    'reconexao',
    'sobrecarrega',
    'autocritica',
    'reconexao',
    'sobrecarrega',
    'autocritica',
    'reconexao',
    'sobrecarrega',
  ],
  contactPermission: false,
  email: 'ANA@EXAMPLE.COM',
  honeypot: '',
  name: 'Ana',
  purposeConsent: true,
  submissionId: '31d5fa8d-a11b-405e-8d33-7959ff021906',
  utm: { campaign: 'acolhimento', source: 'instagram' },
  whatsapp: '(71) 99999-9999',
}

it('normalizes the contact fields from a valid adult submission', () => {
  const parsed = journeySubmissionSchema.parse(validBody)

  expect(parsed.email).toBe('ana@example.com')
  expect(parsed.whatsapp).toBe('71999999999')
  expect(parsed.answers).toHaveLength(10)
})

it('rejects a submission without required purpose consent', () => {
  expect(() =>
    journeySubmissionSchema.parse({ ...validBody, purposeConsent: false }),
  ).toThrow()
})

it('rejects malformed answers, minor submissions, and populated honeypots', () => {
  expect(() =>
    journeySubmissionSchema.parse({ ...validBody, answers: validBody.answers.slice(0, 9) }),
  ).toThrow()
  expect(() => journeySubmissionSchema.parse({ ...validBody, adult: false })).toThrow()
  expect(() => journeySubmissionSchema.parse({ ...validBody, honeypot: 'bot' })).toThrow()
})
