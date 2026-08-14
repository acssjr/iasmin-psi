import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'

import { JourneyShell } from '@/components/percurso/journey-shell'

vi.mock('@gsap/react', () => ({ useGSAP: vi.fn() }))

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

it('starts with the Iasmin psi signature and one clear action', async () => {
  const user = userEvent.setup()
  render(<JourneyShell />)

  expect(screen.getByText(/Em cerca de cinco minutos, você percorre cinco perguntas/i)).toBeVisible()
  expect(document.querySelector('[data-brand-variant="signature"]')).toHaveAttribute(
    'aria-label',
    'Iasmin psi',
  )
  expect(screen.queryByRole('button', { name: 'Sou maior de 18 anos' })).not.toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Sou menor de 18 anos' })).not.toBeInTheDocument()

  await user.click(screen.getByRole('button', { name: 'Iniciar as perguntas' }))
  expect(screen.getByRole('heading', { name: 'Sobre o que você quer olhar hoje?' })).toBeVisible()
})

it('marks the exact option chosen when two options share a reflection theme', async () => {
  const user = userEvent.setup()
  render(<JourneyShell />)

  await user.click(screen.getByRole('button', { name: 'Iniciar as perguntas' }))
  expect(screen.getByRole('heading', { name: 'Sobre o que você quer olhar hoje?' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: /Ansiedade e sobrecarga/i }))
  expect(
    screen.getByRole('heading', { name: 'Vamos preparar sua devolutiva?' }),
  ).toBeVisible()
  expect(
    screen.getByText(/Seus dados são usados para gerar esta devolutiva/i),
  ).toBeVisible()
  await user.type(screen.getByLabelText('Seu nome'), 'Ana Silva')
  await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
  await user.type(screen.getByLabelText('WhatsApp'), '71999999999')
  expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
  expect(screen.getByText(/Ao continuar, você concorda com o uso dos seus dados/i)).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Começar o percurso' }))

  const options = screen.getAllByRole('radio')
  await user.click(options[0])

  expect(options[0]).toBeChecked()
  expect(options[3]).not.toBeChecked()
})

it('shows the reflection locally when the persistence service is unavailable outside production', async () => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
  const fetchMock = vi.fn().mockRejectedValue(new Error('Database unavailable'))
  vi.stubGlobal('fetch', fetchMock)
  render(<JourneyShell />)

  await user.click(screen.getByRole('button', { name: 'Iniciar as perguntas' }))
  await user.click(screen.getByRole('button', { name: /Ansiedade e sobrecarga/i }))
  await user.type(screen.getByLabelText('Seu nome'), 'Ana Silva')
  await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
  await user.type(screen.getByLabelText('WhatsApp'), '71999999999')
  await user.click(screen.getByRole('button', { name: 'Começar o percurso' }))

  for (let question = 1; question <= 5; question += 1) {
    await user.click(screen.getAllByRole('radio')[0])
    await user.click(
      screen.getByRole('button', {
        name: question === 5 ? 'Ver minha devolutiva' : 'Continuar',
      }),
    )
  }

  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(screen.getByRole('status')).toHaveTextContent(
    'Um instante para acolher o que você compartilhou.',
  )
  expect(screen.queryByText(/Obrigada por se permitir essa pausa/i)).not.toBeInTheDocument()

  await act(async () => { await vi.advanceTimersByTimeAsync(3000) })
  expect(screen.queryByText(/Obrigada por se permitir essa pausa/i)).not.toBeInTheDocument()

  await act(async () => { await vi.advanceTimersByTimeAsync(500) })
  expect(
    await screen.findByText(/Obrigada por se permitir essa pausa/i),
  ).toBeVisible()
  expect(screen.getByTestId('journey-result-layout')).toBeVisible()
  expect(screen.getByRole('img', { name: /Ilustração abstrata/i })).toBeVisible()
})

it('keeps client-side submission failures visible outside production', async () => {
  const user = userEvent.setup()
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 400 }))
  render(<JourneyShell />)

  await user.click(screen.getByRole('button', { name: 'Iniciar as perguntas' }))
  await user.click(screen.getByRole('button', { name: /Ansiedade e sobrecarga/i }))
  await user.type(screen.getByLabelText('Seu nome'), 'Ana Silva')
  await user.type(screen.getByLabelText('E-mail'), 'ana@example.com')
  await user.type(screen.getByLabelText('WhatsApp'), '71999999999')
  await user.click(screen.getByRole('button', { name: 'Começar o percurso' }))

  for (let question = 1; question <= 5; question += 1) {
    await user.click(screen.getAllByRole('radio')[0])
    await user.click(
      screen.getByRole('button', {
        name: question === 5 ? 'Ver minha devolutiva' : 'Continuar',
      }),
    )
  }

  expect(
    await screen.findByText(/Não foi possível concluir agora/i),
  ).toBeVisible()
})
