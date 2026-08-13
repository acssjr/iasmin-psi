import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'

import PrivacyPage from '@/app/privacidade/page'

afterEach(cleanup)

it('offers a direct WhatsApp channel for privacy and deletion requests', () => {
  render(<PrivacyPage />)

  expect(
    screen.getByRole('link', { name: 'Falar sobre privacidade pelo WhatsApp' }),
  ).toHaveAttribute('href', expect.stringContaining('wa.me/5575981234176'))
})

it('explains thematic choices and the non-diagnostic purpose', () => {
  render(<PrivacyPage />)
  expect(screen.getByText(/tema escolhido/i)).toBeVisible()
  expect(screen.getByText(/não realiza diagnóstico nem avaliação psicológica/i)).toBeVisible()
  expect(screen.getByText(/180 dias/i)).toBeVisible()
})
