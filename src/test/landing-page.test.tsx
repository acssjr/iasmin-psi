import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'

import LandingPage from '@/components/landing/landing-page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ prefetch: vi.fn(), push: vi.fn() }),
}))

afterEach(cleanup)

it('shows both first-step actions in the hero', () => {
  render(<LandingPage />)

  const brandMarks = screen.getAllByRole('img', {
    name: 'Iasmin Portugal, Psicóloga Clínica',
  })

  expect(brandMarks).toHaveLength(2)
  expect(brandMarks[0]).toHaveAttribute('data-brand-variant', 'horizontal')
  expect(brandMarks[1]).toHaveAttribute('data-brand-variant', 'full')
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
      name: '5 perguntas para se conhecer melhor',
    }),
  ).toBeVisible()
  expect(hero.querySelector('[data-brand-variant="signature"]')).not.toBeInTheDocument()
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
  const about = screen.getByRole('region', {
    name: 'Um cuidado que olha para a sua história inteira.',
  })
  expect(within(about).getByText('Sobre mim')).toBeVisible()
  expect(about.querySelector('[data-brand-variant="signature"]')).toHaveAttribute(
    'aria-hidden',
    'true',
  )
  expect(
    screen.getByRole('region', { name: 'Temas que podem encontrar espaço na terapia.' }),
  ).toBeVisible()
  expect(screen.getByText('Ansiedade e sobrecarga')).toBeVisible()
  expect(screen.getByText('Relacionamentos e limites')).toBeVisible()
  expect(screen.getByText('Luto, perdas e mudanças')).toBeVisible()
  expect(screen.getByText('Autoestima e autocrítica')).toBeVisible()
  const editorial = screen.getByRole('region', { name: 'Reflexões para levar com você.' })
  const journey = screen.getByRole('region', { name: 'Uma pausa guiada para olhar para você.' })
  expect(
    editorial.compareDocumentPosition(journey) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy()
  expect(screen.getByText('5 perguntas')).toBeVisible()
  expect(journey).toHaveAttribute('id', 'percurso')
  expect(within(journey).getByRole('link', { name: 'Iniciar o percurso' })).toBeVisible()
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
    name: 'Como funciona a terapia on-line?',
  })

  expect(question).toHaveAttribute('aria-expanded', 'false')
  await user.click(question)
  expect(question).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getByText(/As sessões acontecem por videochamada/i)).toBeVisible()
})

it('keeps a branded WhatsApp conversion shortcut available across the page', () => {
  render(<LandingPage />)

  const floatingCta = screen.getByRole('link', {
    name: 'Agendar uma sessão pelo WhatsApp',
  })

  expect(floatingCta).toHaveAttribute('href', expect.stringContaining('wa.me/5575981234176'))
  expect(floatingCta.querySelector('[data-brand-variant="monogram"]')).toHaveAttribute(
    'data-brand-tone',
    'cream',
  )
})

it('keeps the closing section focused on scheduling', () => {
  render(<LandingPage />)

  const closing = screen.getByRole('region', {
    name: 'Você não precisa ter tudo resolvido para começar.',
  })

  expect(within(closing).getByRole('link', { name: 'Agendar uma sessão' })).toBeVisible()
  expect(
    within(closing).queryByRole('link', { name: 'Iniciar meu percurso de autoconhecimento' }),
  ).not.toBeInTheDocument()
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
