import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it } from 'vitest'

import { JourneyShell } from '@/components/percurso/journey-shell'

it('does not collect answers from a minor', async () => {
  const user = userEvent.setup()
  render(<JourneyShell />)

  await user.click(screen.getByRole('button', { name: 'Sou menor de 18 anos' }))

  expect(screen.getByRole('heading', { name: /responsável/i })).toBeVisible()
  expect(screen.queryByText('Pergunta 1 de 10')).not.toBeInTheDocument()
})

it('marks the exact option chosen when two options share a reflection theme', async () => {
  const user = userEvent.setup()
  render(<JourneyShell />)

  await user.click(screen.getByRole('button', { name: 'Sou maior de 18 anos' }))
  await user.type(screen.getByLabelText('Seu nome'), 'Ana Silva')
  await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
  await user.type(screen.getByLabelText('WhatsApp'), '71999999999')
  await user.click(
    screen.getByRole('checkbox', { name: /concordo com o uso destes dados/i }),
  )
  await user.click(screen.getByRole('button', { name: 'Começar o percurso' }))

  const options = screen.getAllByRole('radio')
  await user.click(options[0])

  expect(options[0]).toBeChecked()
  expect(options[3]).not.toBeChecked()
})
