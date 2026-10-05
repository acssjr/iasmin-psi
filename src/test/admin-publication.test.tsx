import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { AdminPanel } from '@/components/cms/admin-panel'
import { defaults, fields } from '@/lib/cms/catalog'

vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: vi.fn(), replace: vi.fn() }) }))
vi.mock('@/components/brand-logo', () => ({ BrandLogo: () => <span /> }))
vi.mock('@/components/cms/visual-editor', () => ({ VisualEditor: () => null }))
vi.mock('@/components/cms/admin-sidebar', () => ({ AdminSidebar: () => null, AdminIcon: () => null, useAdminSidebar: () => ({ shell: { current: null }, compact: false, toggle: vi.fn() }) }))
vi.mock('@/components/cms/use-journey-notifications', () => ({ useJourneyNotifications: () => ({ unread: 0 }) }))

beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function (this: HTMLDialogElement) { this.setAttribute('open', '') } })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function (this: HTMLDialogElement) { this.removeAttribute('open') } })
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal'); Reflect.deleteProperty(HTMLDialogElement.prototype, 'close') })

const initial = {
  revision: 1, draft: { ...defaults, [fields.find(field => field.kind === 'text')!.id]: 'Texto de teste' }, published: defaults,
  publishedAt: null, history: [], media: [], storage: 'database' as const,
  user: { id: 'test', username: 'admin', name: 'Admin', active: true, role: 'admin' as const, createdAt: null, lastLoginAt: null },
}
function openPublication() {
  render(<AdminPanel mode="editor" initial={initial} />)
  fireEvent.click(screen.getByRole('button', { name: /^Publicar/ }))
  fireEvent.click(screen.getByRole('button', { name: 'Publicar alterações' }))
}

it('waits for server confirmation, prevents repeated publication and uses the returned date for success', async () => {
  let finish!: (response: Response) => void
  const fetcher = vi.fn(() => new Promise<Response>(resolve => { finish = resolve }))
  vi.stubGlobal('fetch', fetcher)
  openPublication()
  expect(screen.getByRole('heading', { name: 'Publicando alterações' })).toBeVisible()
  expect(screen.queryByText('Seu site foi atualizado')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: /^Publicar/ })).toBeDisabled()
  expect(fetcher).toHaveBeenCalledTimes(1)
  await act(async () => finish(new Response(JSON.stringify({ ...initial, revision: 2, published: initial.draft, publishedAt: '2026-10-05T18:30:00.000Z' }))))
  expect(screen.getByRole('heading', { name: 'Seu site foi atualizado' })).toBeVisible()
  const dialog = screen.getByRole('dialog')
  expect(within(dialog).getByText(/1 alteração publicada.*05\/10\/2026.*15:30/)).toBeVisible()
  expect(within(dialog).getByRole('link', { name: /Ver site em outra janela/ })).toHaveAttribute('target', '_blank')
  expect(within(dialog).getByRole('link', { name: /Ver site em outra janela/ })).toHaveAttribute('href', '/')
  fireEvent.click(within(dialog).getByRole('button', { name: 'Voltar à edição' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

it('shows the server error and restores confirmation without showing success', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'O conteúdo mudou em outra janela.' }), { status: 400 })))
  openPublication()
  await waitFor(() => expect(screen.getByRole('dialog', { name: 'Confirmar publicação' })).toBeVisible())
  expect(within(screen.getByRole('dialog')).getByRole('alert')).toHaveTextContent('O conteúdo mudou em outra janela.')
  expect(screen.queryByText('Seu site foi atualizado')).not.toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Publicar alterações' })).toBeEnabled()
})

it('keeps the publication running when the dialog is closed and shows its confirmed result afterwards', async () => {
  let finish!: (response: Response) => void
  vi.stubGlobal('fetch', vi.fn(() => new Promise<Response>(resolve => { finish = resolve })))
  openPublication()
  fireEvent.click(screen.getByRole('button', { name: 'Fechar janela' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getByText('Publicando alterações. Aguardando confirmação do servidor.')).toBeVisible()
  await act(async () => finish(new Response(JSON.stringify({ ...initial, revision: 2, published: initial.draft, publishedAt: '2026-10-05T18:30:00.000Z' }))))
  expect(screen.getByRole('dialog', { name: 'Publicação concluída' })).toBeVisible()
})
