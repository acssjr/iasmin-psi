import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import LandingPage from '@/components/landing/landing-page'

it('shows both first-step actions in the hero', () => {
  render(<LandingPage />)

  expect(screen.getByRole('link', { name: 'Agendar uma sessão' })).toBeVisible()
  expect(
    screen.getByRole('link', { name: 'Iniciar meu percurso de autoconhecimento' }),
  ).toBeVisible()
})
