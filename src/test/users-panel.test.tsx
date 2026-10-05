import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { UsersPanel } from '@/components/cms/users-panel'
import type { PublicUser } from '@/lib/cms/store'

const owner: PublicUser = { id: 'owner', username: 'admin', name: 'Responsável', role: 'admin', active: true, createdAt: null, lastLoginAt: '2026-10-05T02:03:00Z' }
const editor: PublicUser = { ...owner, id: 'editor', username: 'pessoa', name: 'Pessoa editora', role: 'editor', lastLoginAt: null }
afterEach(() => { cleanup(); vi.unstubAllGlobals() })
const response = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

it('shows each account and its last successful login in Bahia time', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response({ users: [owner, editor] })))
  render(<UsersPanel current={owner} onCurrentChange={vi.fn()} />)
  expect(await screen.findByText('@pessoa')).toBeVisible()
  expect(screen.getByText('04/10/2026, 23:03')).toBeVisible()
  expect(screen.getByText('Nenhum login registrado')).toBeVisible()
  expect(screen.queryByRole('button', { name: 'Revogar acesso de Responsável' })).not.toBeInTheDocument()
})

it('creates a username-based access and clears the password form after success', async () => {
  const fetch = vi.fn().mockResolvedValueOnce(response({ users: [owner] })).mockResolvedValueOnce(response({ users: [owner, editor] }))
  vi.stubGlobal('fetch', fetch)
  render(<UsersPanel current={owner} onCurrentChange={vi.fn()} />)
  await screen.findByText('@admin')
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Adicionar usuário' }))
  await user.type(screen.getByLabelText('Nome da pessoa'), editor.name)
  await user.type(screen.getByLabelText(/Usuário de acesso/), editor.username)
  await user.type(screen.getByLabelText(/^Senha/), 'Senha somente para teste!')
  await user.type(screen.getByLabelText('Repita a senha'), 'Senha somente para teste!')
  await user.click(screen.getByRole('button', { name: 'Criar acesso' }))
  expect(await screen.findByText('@pessoa')).toBeVisible()
  const sent = JSON.parse(fetch.mock.calls[1][1].body)
  expect(sent).toMatchObject({ action: 'create', name: editor.name, username: 'pessoa', role: 'editor' })
  expect(sent).not.toHaveProperty('email')
  expect(screen.queryByLabelText('Repita a senha')).not.toBeInTheDocument()
})

it('requires a confirmation before revoking access', async () => {
  const fetch = vi.fn().mockResolvedValueOnce(response({ users: [owner, editor] })).mockResolvedValueOnce(response({ users: [owner, { ...editor, active: false }] }))
  vi.stubGlobal('fetch', fetch)
  render(<UsersPanel current={owner} onCurrentChange={vi.fn()} />)
  await screen.findByText('@pessoa')
  const user = userEvent.setup()
  await user.click(screen.getByRole('button', { name: 'Revogar acesso de Pessoa editora' }))
  expect(fetch).toHaveBeenCalledTimes(1)
  await user.click(screen.getByRole('button', { name: 'Confirmar revogação' }))
  expect(await screen.findByRole('button', { name: 'Reativar acesso de Pessoa editora' })).toBeVisible()
  expect(JSON.parse(fetch.mock.calls[1][1].body)).toEqual({ action: 'access', id: editor.id, active: false })
})

it('offers a retry when the list cannot be loaded', async () => {
  const fetch = vi.fn().mockResolvedValueOnce(response({ error: 'Não foi possível carregar.' }, 503)).mockResolvedValueOnce(response({ users: [owner] }))
  vi.stubGlobal('fetch', fetch)
  render(<UsersPanel current={owner} onCurrentChange={vi.fn()} />)
  expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível carregar.')
  await waitFor(() => expect(screen.getByRole('button', { name: 'Atualizar lista' })).toBeEnabled())
  await userEvent.click(screen.getByRole('button', { name: 'Atualizar lista' }))
  expect(await screen.findByText('@admin')).toBeVisible()
  expect(screen.queryByRole('alert')).not.toBeInTheDocument()
})
