import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'

import LandingPage from '@/components/landing/landing-page'

afterEach(cleanup)

it('shows both first-step actions in the hero', () => {
  render(<LandingPage />)

  const brandMarks = screen.getAllByRole('img', {
    name: 'Iasmin Portugal, Psicóloga Clínica',
  })

  expect(brandMarks).toHaveLength(2)
  expect(brandMarks[0]).toHaveAttribute('data-brand-variant', 'horizontal')
  expect(brandMarks[1]).toHaveAttribute('data-brand-variant', 'full')
  expect(document.querySelector('[data-brand-variant="signature"]')).toHaveAttribute(
    'aria-hidden',
    'true',
  )

  const hero = screen.getByRole('region', {
    name: 'O cuidado que faz sentido começa no seu contexto.',
  })

  expect(within(hero).getByRole('link', { name: 'Agendar uma sessão' })).toBeVisible()
  expect(within(hero).getByRole('link', { name: 'Agendar uma sessão' })).toHaveAttribute(
    'href',
    expect.stringContaining('wa.me/5575981234176'),
  )
  expect(
    within(hero).getByRole('link', {
      name: 'Iniciar meu percurso de autoconhecimento',
    }),
  ).toBeVisible()
  expect(within(hero).getByAltText('Iasmin Portugal em atendimento')).toHaveAttribute(
    'src',
    expect.stringContaining('hero-terracotta.jpg'),
  )
  expect(
    within(screen.getByRole('navigation')).getByRole('link', {
      name: 'Conheça Iasmin',
    }),
  ).toBeVisible()
  expect(screen.getByRole('button', { name: 'Abrir menu' })).toHaveAttribute(
    'aria-expanded',
    'false',
  )
  expect(screen.getByRole('link', { name: 'Agendar' })).toBeVisible()
  expect(screen.queryByRole('link', { name: 'Agendar sessão' })).not.toBeInTheDocument()
  expect(
    screen.getByText(
      'Iasmin Portugal de Souza Costa · Psicóloga Clínica · CRP 03/33160',
    ),
  ).toBeVisible()
  expect(
    screen.getByText(/O percurso não é uma avaliação psicológica/i),
  ).toBeVisible()
  expect(screen.queryByText(/depoimento/i)).not.toBeInTheDocument()
  expect(screen.getByText('Iasmin atende quais públicos?')).toBeVisible()
  expect(
    screen.getByText('Realizo atendimentos para adolescentes e adultos em todo o Brasil.'),
  ).toBeInTheDocument()
  expect(screen.getByText('Iasmin Portugal', { selector: 'strong' })).toBeVisible()
  expect(
    within(
      screen.getByRole('region', { name: 'Um cuidado que olha para a sua história inteira.' }),
    ).getByText('Quem sou eu?'),
  ).toBeVisible()
  expect(screen.getByText('5 perguntas')).toBeVisible()
  expect(screen.getByRole('region', { name: 'Uma pausa guiada para olhar para você.' })).toHaveAttribute(
    'id',
    'percurso',
  )
  expect(
    screen.getByText(/experiência breve de reflexão com cinco perguntas/i),
  ).toBeInTheDocument()
  expect(screen.getByTestId('landing-motion')).toBeInTheDocument()
  expect(screen.getByTestId('hero-context-trail')).toBeInTheDocument()
  expect(screen.getByTestId('care-context-trail')).toBeInTheDocument()
})

it('exposes an accessible animated FAQ accordion', async () => {
  const user = userEvent.setup()
  render(<LandingPage />)

  const question = screen.getByRole('button', {
    name: 'Como funciona a psicoterapia on-line?',
  })

  expect(question).toHaveAttribute('aria-expanded', 'false')
  await user.click(question)
  expect(question).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getByText(/As sessões acontecem por videochamada/i)).toBeVisible()
})

it('provides external social links in the footer', () => {
  render(<LandingPage />)

  expect(screen.getByRole('link', { name: /Instagram de Iasmin Portugal/i })).toHaveAttribute(
    'href',
    'https://www.instagram.com/iasminportugalpsi/',
  )
  expect(screen.getByRole('link', { name: /LinkedIn de Iasmin Portugal/i })).toHaveAttribute(
    'target',
    '_blank',
  )
})

it('keeps landing sections clean and exposes the recognition carousel', () => {
  render(<LandingPage />)

  expect(screen.queryByTestId('section-motif')).not.toBeInTheDocument()
  const carousel = screen.getByLabelText('Sinais que podem fazer sentido para você')
  const situations = within(carousel).getByRole('list', { name: 'Situações de reconhecimento' })
  const indicators = within(carousel).getAllByRole('button', { name: /Mostrar sinal/i })

  expect(situations).toBeInTheDocument()
  expect(within(situations).getAllByRole('listitem')).toHaveLength(3)
  expect(indicators).toHaveLength(3)
  expect(indicators[0]).toHaveAttribute('aria-current', 'true')
  expect(carousel).toHaveAttribute('data-carousel-interval', '5000')
  expect(within(situations).getAllByRole('listitem')[0]).toHaveAttribute('tabindex', '0')
  expect(within(situations).getAllByRole('listitem')[0]).toHaveAttribute(
    'aria-label',
    'Sinal 1 de 3. Toque para avançar.',
  )
})
