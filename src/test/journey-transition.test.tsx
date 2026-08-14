import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'

import { JourneyTransitionLink, JourneyTransitionProvider } from '@/components/journey-transition'

const push = vi.fn()
const prefetch = vi.fn()
const router = { prefetch, push }

vi.mock('next/navigation', () => ({ useRouter: () => router }))
vi.mock('@gsap/react', () => ({ useGSAP: vi.fn() }))

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }))
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

it('shows the calm transition before navigating', async () => {
  render(<JourneyTransitionProvider><JourneyTransitionLink className="cta" surface="hero">Começar</JourneyTransitionLink></JourneyTransitionProvider>)

  fireEvent.click(screen.getByRole('link', { name: 'Começar' }))
  const transition = screen.getByRole('status', { hidden: true })
  expect(transition).toHaveTextContent('Uma pausa antes de começar.')
  expect(transition.querySelector('[data-brand-variant="monogram"]')).toHaveAttribute(
    'data-brand-tone',
    'cream',
  )
  expect(transition.querySelector('[data-calm-loader]')).toBeInTheDocument()
  expect(push).not.toHaveBeenCalled()

  await act(async () => { await vi.advanceTimersByTimeAsync(2900) })
  expect(push).not.toHaveBeenCalled()

  await act(async () => { await vi.advanceTimersByTimeAsync(100) })
  expect(push).toHaveBeenCalledWith('/percurso')
})

it('preserves modified clicks without opening the transition', () => {
  render(<JourneyTransitionProvider><JourneyTransitionLink surface="hero">Começar</JourneyTransitionLink></JourneyTransitionProvider>)
  screen.getByRole('link', { name: 'Começar' }).dispatchEvent(new MouseEvent('click', { bubbles: true, ctrlKey: true }))
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  expect(push).not.toHaveBeenCalled()
})

it('uses a brief transition when reduced motion is preferred', async () => {
  vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }))
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  render(<JourneyTransitionProvider><JourneyTransitionLink surface="hero">Começar</JourneyTransitionLink></JourneyTransitionProvider>)
  await user.click(screen.getByRole('link', { name: 'Começar' }))
  await act(async () => { await vi.advanceTimersByTimeAsync(250) })
  expect(push).toHaveBeenCalledWith('/percurso')
})
