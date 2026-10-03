import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { readState, mutateState } from './store'

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
export function createSession(version: number) {
  const payload = Buffer.from(JSON.stringify({ version, expires: Date.now() + 8 * 60 * 60 * 1000 })).toString('base64url')
  return `${payload}.${createHmac('sha256', secret()).update(payload).digest('base64url')}`
}
export function validSession(token: string, version: number) {
  try {
    const [payload, signature] = token.split('.')
    const expected = createHmac('sha256', secret()).update(payload).digest('base64url')
    if (!signature || signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString())
    return session.version === version && session.expires > Date.now()
  } catch { return false }
}
export async function authenticated() {
  const state = await readState(), token = (await cookies()).get(COOKIE)?.value
  return Boolean(state.account && token && validSession(token, state.account.version))
}
export async function requireAdmin() { if (!await authenticated()) throw new Error('Acesse sua conta para continuar.') }
export function sameOrigin(request: Request) {
  const url = new URL(request.url)
  const expected = `${url.protocol}//${request.headers.get('host') || url.host}`
  if (request.headers.get('origin') !== expected) throw new Error('Origem da solicitação inválida.')
}
export async function login(email: string, password: string) {
  // Persistent account-based throttling also works across serverless instances.
  return mutateState(state => {
    const key = 'login', attempt = state.attempts[key]
    if (attempt && attempt.until > Date.now() && attempt.count >= 5) return null
    if (state.account?.email === email.toLowerCase() && verifyPassword(password, state.account.password)) {
      delete state.attempts[key]; return createSession(state.account.version)
    }
    state.attempts[key] = { count: attempt && attempt.until > Date.now() ? attempt.count + 1 : 1, until: Date.now() + 15 * 60 * 1000 }
    return null
  })
}
