import { expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ track: vi.fn() }))

vi.mock('@vercel/analytics/react', () => ({ track: mocks.track }))

import { trackSafeEvent } from '@/lib/analytics'

it('sends allowlisted analytics properties only', () => {
  trackSafeEvent('journey_step_completed', { step: 3, surface: 'journey' })

  expect(mocks.track).toHaveBeenCalledWith('journey_step_completed', {
    step: 3,
    surface: 'journey',
  })
})

it('rejects analytics properties outside the allowlist', () => {
  expect(() =>
    trackSafeEvent('journey_completed', { email: 'iasmin@example.com' } as never),
  ).toThrow('Unsupported analytics property')
})

it('rejects properties with an invalid shape', () => {
  expect(() => trackSafeEvent('journey_step_completed', { step: 11 })).toThrow(
    'Invalid analytics step',
  )
})
