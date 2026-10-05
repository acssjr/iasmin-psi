import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { readState, mutateState, type CmsState, type CmsUser } from './store'

export const COOKIE = 'iasmin_admin'
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`
}
export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(':')
  if (!salt || !hash || hash.length !== 128) return false
  return timingSafeEqual(Buffer.from(hash, 'hex'), scryptSync(password, salt, 64))
}
function secret() {
  const value = process.env.ADMIN_SESSION_SECRET
  if (!value || value.length < 32) throw new Error('Configure ADMIN_SESSION_SECRET com pelo menos 32 caracteres.')
  return value
}
export function createSession(userId: string, version: number) {
  const payload = Buffer.from(JSON.stringify({ userId, version, expires: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url')
  return `${payload}.${createHmac('sha256', secret()).update(payload).digest('base64url')}`
}
function sessionPayload(token: string): { userId: string; version: number; expires: number } | null {
  try {
    const [payload, signature, extra] = token.split('.')
    if (!payload || extra) return null
    const expected = createHmac('sha256', secret()).update(payload).digest('base64url')
    if (!signature || signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return typeof session.userId === 'string' && Number.isInteger(session.version) && session.expires > Date.now() ? session : null
  } catch { return null }
}
export function validSession(token: string, userId: string, version: number) {
  const session = sessionPayload(token)
  return Boolean(session && session.userId === userId && session.version === version)
}
export async function currentUser() {
  const state = await readState(), token = (await cookies()).get(COOKIE)?.value
  const session = token ? sessionPayload(token) : null
  return session ? state.users.find(user => user.id === session.userId && user.active && user.version === session.version) || null : null
}
export async function authenticated() {
  return Boolean(await currentUser())
}
export function assertUser(state: CmsState, actor: CmsUser, manageUsers = false) {
  const current = state.users.find(user => user.id === actor.id && user.active && user.version === actor.version)
  if (!current) throw new Error('Sua sessão expirou. Entre novamente.')
  if (manageUsers && current.role !== 'admin') throw new Error('Somente administradores podem gerenciar usuários.')
  return current
}
export function validateUsername(value: unknown) {
  if (typeof value !== 'string' || !/^[a-z0-9][a-z0-9._-]{2,31}$/.test(value.trim().toLowerCase())) throw new Error('Use um usuário de 3 a 32 caracteres, com letras, números, ponto, hífen ou sublinhado.')
  return value.trim().toLowerCase()
}
export function validatePassword(value: unknown): asserts value is string {
  if (typeof value !== 'string' || value.length < 8 || value.length > 128) throw new Error('A senha deve ter de 8 a 128 caracteres.')
}
export async function requireAdmin() { if (!await authenticated()) throw new Error('Acesse sua conta para continuar.') }
export function sameOrigin(request: Request) {
  const url = new URL(request.url)
  const expected = `${url.protocol}//${request.headers.get('host') || url.host}`
  if (request.headers.get('origin') !== expected) throw new Error('Origem da solicitação inválida.')
}
export async function login(username: string, password: string) {
  // Persistent account-based throttling also works across serverless instances.
  return mutateState(state => {
    const normalized = username.trim().toLowerCase()
    // Bounded keys keep unknown usernames from growing the persistent state.
    const user = state.users.find(user => user.username === normalized)
    const key = user ? `login:${user.id}` : 'login:unknown', attempt = state.attempts[key]
    if (attempt && attempt.until > Date.now() && attempt.count >= 5) return null
    if (user?.active && verifyPassword(password, user.password)) {
      const token = createSession(user.id, user.version)
      user.lastLoginAt = new Date().toISOString()
      delete state.attempts[key]; return token
    }
    state.attempts[key] = { count: attempt && attempt.until > Date.now() ? attempt.count + 1 : 1, until: Date.now() + 15 * 60 * 1000 }
    return null
  }, false)
}
