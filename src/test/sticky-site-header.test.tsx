import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it } from 'vitest'
import { StickySiteHeader } from '@/components/landing/sticky-site-header'
import { SiteNavigation } from '@/components/landing/site-navigation'

afterEach(() => {
  cleanup()
  Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
})

it('keeps navigation available after scrolling and restores the initial header at the top', async () => {
  const user = userEvent.setup()
  render(<StickySiteHeader><SiteNavigation /></StickySiteHeader>)
  const header = screen.getByRole('banner')
  expect(header).toHaveAttribute('data-docked', 'false')

  Object.defineProperty(window, 'scrollY', { configurable: true, value: 400 })
  fireEvent.scroll(window)
  await waitFor(() => expect(header).toHaveAttribute('data-docked', 'true'))
  await user.click(screen.getByRole('button', { name: 'Abrir menu' }))
  expect(screen.getByRole('dialog')).toHaveAttribute('data-docked', 'true')
  await user.click(screen.getByRole('button', { name: 'Fechar menu' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())

  Object.defineProperty(window, 'scrollY', { configurable: true, value: 0 })
  fireEvent.scroll(window)
  await waitFor(() => expect(header).toHaveAttribute('data-docked', 'false'))
})

it('recomputes the hamburger destination when the available width changes', () => {
  render(<StickySiteHeader><button data-menu-trigger>Menu</button><span data-header-action>Agendar</span></StickySiteHeader>)
  const button = screen.getByRole('button')
  const action = screen.getByText('Agendar')
  Object.defineProperties(button, {
    offsetLeft: { configurable: true, value: 180 },
    offsetWidth: { configurable: true, value: 44 },
  })
  Object.defineProperties(action, {
    offsetLeft: { configurable: true, value: 240 },
    offsetWidth: { configurable: true, value: 100 },
  })
  fireEvent(window, new Event('resize'))
  expect(button.style.getPropertyValue('--menu-dock-shift')).toBe('116px')
  Object.defineProperty(action, 'offsetLeft', { configurable: true, value: 280 })
  fireEvent(window, new Event('resize'))
  expect(button.style.getPropertyValue('--menu-dock-shift')).toBe('156px')
})
