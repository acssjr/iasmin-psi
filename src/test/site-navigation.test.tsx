import { cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'

import { SiteNavigation } from '@/components/landing/site-navigation'

afterEach(() => {
  cleanup()
  document.getElementById('conheca-iasmin')?.remove()
})

it('navigates to sections without mutating the URL hash', async () => {
  const user = userEvent.setup()
  const scrollIntoView = vi.fn()
  const target = document.createElement('section')
  target.id = 'conheca-iasmin'
  target.scrollIntoView = scrollIntoView
  document.body.append(target)

  window.history.replaceState(null, '', '/')
  render(<SiteNavigation />)

  await user.click(screen.getByRole('link', { name: 'Conheça Iasmin' }))

  expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'start' })
  expect(window.location.hash).toBe('')
})

it('opens and closes the mobile navigation accessibly', async () => {
  const user = userEvent.setup()
  render(<SiteNavigation />)

  const trigger = screen.getByRole('button', { name: 'Abrir menu' })
  await user.click(trigger)
  expect(trigger).toHaveAttribute('aria-expanded', 'true')
  const dialog = screen.getByRole('dialog', { name: 'Navegação principal' })
  expect(dialog).toBeVisible()
  expect(screen.getByRole('link', { name: 'Instagram de Iasmin Portugal' })).toBeVisible()
  expect(screen.getByRole('link', { name: 'LinkedIn de Iasmin Portugal' })).toBeVisible()
  await user.click(screen.getByRole('button', { name: 'Fechar menu' }))
  expect(trigger).toHaveAttribute('aria-expanded', 'false')
})

it('collapses the compact menu after selecting a destination', async () => {
  const user = userEvent.setup()
  const target = document.createElement('section')
  target.id = 'conheca-iasmin'
  target.scrollIntoView = vi.fn()
  document.body.append(target)
  render(<SiteNavigation />)

  const trigger = screen.getByRole('button', { name: 'Abrir menu' })
  await user.click(trigger)
  await user.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Conheça Iasmin' }))

  expect(trigger).toHaveAttribute('aria-expanded', 'false')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

it('treats percurso as an in-page destination without decorative numbering', () => {
  render(<SiteNavigation />)

  expect(screen.getByRole('link', { name: 'Percurso' })).toHaveAttribute(
    'href',
    '#percurso',
  )
  expect(screen.queryByText('01')).not.toBeInTheDocument()
  expect(screen.queryByText('02')).not.toBeInTheDocument()
  expect(screen.queryByText('03')).not.toBeInTheDocument()
})
