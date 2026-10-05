// @vitest-environment node
import { afterAll, beforeAll, expect, it, vi } from 'vitest'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { defaults } from '@/lib/cms/catalog'

const cookies = vi.hoisted(() => new Map<string, string>())
vi.mock('next/headers', () => ({ cookies: async () => ({ get: (name: string) => cookies.has(name) ? { value: cookies.get(name) } : undefined, set: (name: string, value: string) => cookies.set(name, value), delete: (name: string) => cookies.delete(name) }) }))
let directory: string
let store: typeof import('@/lib/cms/store')
let auth: typeof import('@/lib/cms/auth')
let admin: typeof import('@/app/api/admin/route')
let users: typeof import('@/app/api/admin/users/route')
let ownerToken: string, editorToken: string, editorId: string
const request = (body: unknown, origin = 'http://localhost:3000') => new Request('http://localhost:3000/api/admin/users', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
const password = 'Uma frase de acesso longa!'
beforeAll(async () => {
  directory = await mkdtemp(path.join(tmpdir(), 'iasmin-users-'))
  vi.stubEnv('CMS_DATA_DIRECTORY', directory); vi.stubEnv('DATABASE_URL', '')
  vi.stubEnv('ADMIN_SESSION_SECRET', 'a'.repeat(64)); vi.stubEnv('ADMIN_SETUP_TOKEN', 'b'.repeat(64))
  store = await import('@/lib/cms/store'); auth = await import('@/lib/cms/auth')
  admin = await import('@/app/api/admin/route'); users = await import('@/app/api/admin/users/route')
})
afterAll(async () => { vi.unstubAllEnvs(); await rm(directory, { recursive: true, force: true }) })

it('migrates a legacy account without changing its password or existing content', async () => {
  await store.readState()
  const hash = auth.hashPassword(password)
  await writeFile(path.join(directory, 'state.json'), JSON.stringify({ revision: 7, account: { email: 'Dona@example.com', password: hash, version: 3 }, attempts: {}, draft: { ...defaults, custom: 'Rascunho existente' }, published: defaults, publishedAt: null, history: [], media: [] }))
  const migrated = await store.readState()
  expect(migrated.users[0]).toMatchObject({ id: 'legacy-admin', username: 'dona', role: 'admin', password: hash, version: 3, lastLoginAt: null, createdAt: null })
  expect(migrated).not.toHaveProperty('account')
  expect(migrated.draft.custom).toBe('Rascunho existente')
  expect(migrated.contentRevision).toBe(7)
  expect(await auth.login('DONA', password)).toBeTruthy()
  ownerToken = (await auth.login('dona', password))!
  cookies.set(auth.COOKIE, ownerToken)
  expect((await store.readState()).contentRevision).toBe(7)
})

it('creates a separate user with a hashed password and no fabricated last access', async () => {
  const response = await users.POST(request({ action: 'create', username: 'Pessoa', name: 'Pessoa editora', role: 'editor', password }))
  expect(response.status).toBe(200)
  const data = await response.json()
  const editor = data.users.find((user: { username: string }) => user.username === 'pessoa')
  editorId = editor.id
  expect(editor.lastLoginAt).toBeNull()
  expect(JSON.stringify(data)).not.toContain('password')
  expect(JSON.stringify(data)).not.toContain('version')
  expect((await store.readState()).users[1].password).not.toBe(password)
  expect((await store.readState()).contentRevision).toBe(7)
  expect((await users.POST(request({ action: 'create', username: 'PESSOA', name: 'Duplicado', role: 'editor', password }))).status).toBe(400)
  expect((await users.POST(request({ action: 'create', username: 'bad@name', name: 'Nome', role: 'editor', password }))).status).toBe(400)
})

it('records successful logins only and binds sessions to individual users', async () => {
  expect(await auth.login('pessoa', 'incorreta')).toBeNull()
  expect((await store.readState()).users[1].lastLoginAt).toBeNull()
  editorToken = (await auth.login(' pessoa ', password))!
  const editor = (await store.readState()).users[1]
  expect(Number.isNaN(Date.parse(editor.lastLoginAt!))).toBe(false)
  expect(auth.validSession(ownerToken, editor.id, editor.version)).toBe(false)
  expect(auth.validSession(editorToken, editor.id, editor.version)).toBe(true)
  expect(await auth.login('pessoa', 'incorreta')).toBeNull()
  expect((await store.readState()).users[1].lastLoginAt).toBe(editor.lastLoginAt)
})

it('allows editors to change content but forbids user management on the server', async () => {
  cookies.set(auth.COOKIE, editorToken)
  expect((await users.GET()).status).toBe(403)
  expect((await users.POST(request({ action: 'access', id: 'legacy-admin', active: false }))).status).toBe(403)
  const snapshot = await (await admin.GET()).json()
  expect(snapshot.user.username).toBe('pessoa')
  expect(snapshot).not.toHaveProperty('users')
  expect((await admin.POST(request({ action: 'save', revision: snapshot.revision, values: defaults }))).status).toBe(200)
  cookies.set(auth.COOKIE, ownerToken)
})

it('revokes active sessions, prevents login and can reactivate the same account', async () => {
  expect((await users.POST(request({ action: 'access', id: editorId, active: false }))).status).toBe(200)
  cookies.set(auth.COOKIE, editorToken)
  expect((await admin.GET()).status).toBe(401)
  expect((await admin.POST(request({ action: 'save', revision: 8, values: defaults }))).status).toBe(401)
  expect(await auth.login('pessoa', password)).toBeNull()
  cookies.set(auth.COOKIE, ownerToken)
  expect((await users.POST(request({ action: 'access', id: editorId, active: true }))).status).toBe(200)
  expect(await auth.login('pessoa', password)).toBeTruthy()
  // Reactivation never restores previously issued sessions.
  cookies.set(auth.COOKIE, editorToken)
  expect((await admin.GET()).status).toBe(401)
  cookies.set(auth.COOKIE, ownerToken)
})

it('resets another user password and logout affects only the signed-in user', async () => {
  editorToken = (await auth.login('pessoa', password))!
  const newPassword = 'Outra frase de acesso longa!'
  expect((await users.POST(request({ action: 'password', id: editorId, password: newPassword }))).status).toBe(200)
  cookies.set(auth.COOKIE, editorToken)
  expect((await admin.GET()).status).toBe(401)
  expect(await auth.login('pessoa', password)).toBeNull()
  editorToken = (await auth.login('pessoa', newPassword))!
  cookies.set(auth.COOKIE, editorToken)
  expect((await admin.POST(request({ action: 'logout' }))).status).toBe(200)
  cookies.set(auth.COOKIE, ownerToken)
  expect((await admin.GET()).status).toBe(200)
})

it('prevents self-revocation and privilege changes and validates requests', async () => {
  expect((await users.POST(request({ action: 'access', id: 'legacy-admin', active: false }))).status).toBe(400)
  expect((await users.POST(request({ action: 'update', id: 'legacy-admin', name: 'Dona', username: 'dona', role: 'editor' }))).status).toBe(400)
  expect((await users.POST(request({ action: 'password', id: 'legacy-admin', password }))).status).toBe(400)
  expect((await users.POST(request({ action: 'create', username: 'invasor', role: 'admin', name: 'Pessoa', password }, 'https://other.example'))).status).toBe(400)
  cookies.clear()
  expect((await users.GET()).status).toBe(401)
  expect((await users.POST(request({ action: 'create', username: 'invasor', role: 'admin', name: 'Pessoa', password }))).status).toBe(401)
})

it('invalidates existing sessions after changing a user role or username', async () => {
  cookies.set(auth.COOKIE, ownerToken)
  const token = (await auth.login('pessoa', 'Outra frase de acesso longa!'))!
  expect((await users.POST(request({ action: 'update', id: editorId, name: 'Pessoa editora', username: 'pessoa.nova', role: 'admin' }))).status).toBe(200)
  cookies.set(auth.COOKIE, token)
  expect((await admin.GET()).status).toBe(401)
  expect(await auth.login('pessoa', 'Outra frase de acesso longa!')).toBeNull()
  expect(await auth.login('pessoa.nova', 'Outra frase de acesso longa!')).toBeTruthy()
})

it('accepts eight-character passwords and rejects shorter ones in every management flow', async () => {
  expect(() => auth.validatePassword('1234567')).toThrow()
  expect(() => auth.validatePassword('12345678')).not.toThrow()
  cookies.set(auth.COOKIE, ownerToken)
  const newUser = { action: 'create', username: 'oito', name: 'Teste de limite', role: 'editor' }
  expect((await users.POST(request({ ...newUser, password: '1234567' }))).status).toBe(400)
  expect((await users.POST(request({ ...newUser, password: '12345678' }))).status).toBe(200)
  expect((await users.POST(request({ action: 'password', id: editorId, password: '1234567' }))).status).toBe(400)
  expect((await users.POST(request({ action: 'password', id: editorId, password: '12345678' }))).status).toBe(200)
  expect((await admin.POST(request({ action: 'password', current: password, password: '1234567' }))).status).toBe(400)
  expect((await admin.POST(request({ action: 'password', current: password, password: '12345678' }))).status).toBe(200)
})
