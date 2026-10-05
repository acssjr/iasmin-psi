import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { AdminPanel } from '@/components/cms/admin-panel'

const router = vi.hoisted(() => ({ refresh: vi.fn(), replace: vi.fn() }))
vi.mock('next/navigation', () => ({ useRouter: () => router }))
vi.mock('@/components/brand-logo', () => ({ BrandLogo: () => <span /> }))
vi.mock('@/components/cms/admin-sidebar', () => ({ AdminSidebar: () => null, AdminIcon: () => null, useAdminSidebar: () => ({ shell: { current: null }, compact: false, toggle: vi.fn() }) }))
vi.mock('@/components/cms/use-journey-notifications', () => ({ useJourneyNotifications: () => ({ unread: 0 }) }))
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks() })

function submit() {
  fireEvent.change(screen.getByLabelText('Usuário', { exact: false }), { target: { value: 'admin' } })
  fireEvent.change(screen.getByLabelText('Senha', { exact: false }), { target: { value: 'password-test' } })
  fireEvent.submit(screen.getByRole('button', { name: 'Entrar no painel' }).closest('form')!)
}

it('keeps feedback visible between authentication and the server refresh without duplicate requests', async () => {
  let finish!: (response: Response) => void
  const fetcher = vi.fn(() => new Promise<Response>(resolve => { finish = resolve }))
  vi.stubGlobal('fetch', fetcher)
  const { container } = render(<AdminPanel mode="login" />)
  submit()
  expect(screen.getByRole('heading', { name: 'Verificando seu acesso' })).toBeVisible()
  expect(container.querySelector('main')).toHaveAttribute('inert')
  fireEvent.submit(container.querySelector('form')!)
  expect(fetcher).toHaveBeenCalledTimes(1)
  await act(async () => finish(new Response(JSON.stringify({ ok: true }))))
  expect(screen.getByRole('heading', { name: 'Abrindo o painel' })).toBeVisible()
  expect(screen.getByText('Acesso confirmado')).toBeVisible()
  expect(router.refresh).toHaveBeenCalledOnce()
  expect(container.querySelector('main')).toHaveAttribute('inert')
})

it('restores the form and entered username after authentication fails', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'Usuário ou senha incorretos.' }), { status: 401 })))
  const { container } = render(<AdminPanel mode="login" />)
  submit()
  await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Usuário ou senha incorretos.'))
  expect(container.querySelector('main')).not.toHaveAttribute('inert')
  expect(screen.getByLabelText('Usuário', { exact: false })).toHaveValue('admin')
  expect(screen.getByRole('button', { name: 'Entrar no painel' })).toBeEnabled()
  expect(router.refresh).not.toHaveBeenCalled()
})
