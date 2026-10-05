import { randomUUID, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { currentUser, assertUser, sameOrigin, login, COOKIE, hashPassword, verifyPassword, createSession, validateUsername, validatePassword } from '@/lib/cms/auth'
import { readState, mutateState, publicUser, type CmsState, type CmsUser } from '@/lib/cms/store'
import { validateContent, validateMediaReferences } from '@/lib/cms/catalog'

export const runtime = 'nodejs'
function publicState(state: CmsState, user: CmsUser) {
  return { revision: state.contentRevision, draft: state.draft, published: state.published, publishedAt: state.publishedAt, history: state.history, media: state.media, user: publicUser(user), storage: process.env.DATABASE_URL ? 'database' : 'local' }
}
export async function GET() {
  try { const user = await currentUser(); if (!user) throw new Error('Acesse sua conta.'); return NextResponse.json(publicState(await readState(), user), { headers: { 'Cache-Control': 'no-store' } }) }
  catch { return NextResponse.json({ error: 'Acesse sua conta para continuar.' }, { status: 401 }) }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request)
    if (Number(request.headers.get('content-length') || 0) > 2_000_000) return NextResponse.json({ error: 'Conteúdo muito grande.' }, { status: 413 })
    const raw = await request.text()
    if (raw.length > 2_000_000) return NextResponse.json({ error: 'Conteúdo muito grande.' }, { status: 413 })
    const body = JSON.parse(raw)
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Solicitação inválida.')
    const cookieStore = await cookies()
    const setSession = (token: string) => cookieStore.set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', path: '/', maxAge: 8 * 60 * 60 })
    if (body.action === 'login') {
      if (typeof body.username !== 'string' || body.username.length > 32 || typeof body.password !== 'string' || body.password.length > 128) throw new Error('Informe usuário e senha.')
      const token = await login(body.username, body.password)
      if (!token) return NextResponse.json({ error: 'Usuário ou senha inválidos. Após várias tentativas, aguarde 15 minutos.' }, { status: 401 })
      setSession(token); return NextResponse.json({ ok: true })
    }
    if (body.action === 'setup') {
      const expected = process.env.ADMIN_SETUP_TOKEN
      const token = typeof body.token === 'string' ? body.token : ''
      if (!expected || token.length !== expected.length || !timingSafeEqual(Buffer.from(token), Buffer.from(expected))) throw new Error('Código de ativação inválido.')
      const username = validateUsername(body.username)
      validatePassword(body.password)
      const id = randomUUID(), session = createSession(id, 1)
      await mutateState(state => {
        if (state.users.length) throw new Error('O painel já foi ativado. Entre com sua conta.')
        const now = new Date().toISOString()
        state.users.push({ id, username, name: username, password: hashPassword(body.password), version: 1, role: 'admin', active: true, createdAt: now, lastLoginAt: now })
      }, false)
      setSession(session); return NextResponse.json({ ok: true })
    }
    const actor = await currentUser()
    if (!actor) return NextResponse.json({ error: 'Sua sessão expirou. Entre novamente.' }, { status: 401 })
    if (body.action === 'logout') {
      await mutateState(state => { assertUser(state, actor).version++ }, false)
      cookieStore.delete(COOKIE); return NextResponse.json({ ok: true })
    }
    if (body.action === 'password') {
      if (typeof body.current !== 'string' || typeof body.password !== 'string' || body.password.length < 8 || body.password.length > 128) throw new Error('A nova senha deve ter de 8 a 128 caracteres.')
      const version = await mutateState(state => {
        const user = assertUser(state, actor)
        if (!verifyPassword(body.current, user.password)) throw new Error('Senha atual inválida.')
        user.password = hashPassword(body.password); return ++user.version
      }, false)
      setSession(createSession(actor.id, version)); return NextResponse.json({ ok: true })
    }
    const values = body.action === 'save' || body.action === 'publish' ? validateContent(body.values) : null
    await mutateState(state => {
      assertUser(state, actor)
      if (body.revision !== state.contentRevision) throw new Error('O conteúdo mudou em outra janela. Atualize o painel antes de continuar.')
      if (values) validateMediaReferences(values, new Set(state.media.map(item=>item.id)))
      if (body.action === 'save' && values) state.draft = values
      else if (body.action === 'publish' && values) {
        const date = new Date().toISOString()
        state.history.unshift({ id: randomUUID(), date, label: typeof body.label === 'string' ? body.label.slice(0, 100) : 'Publicação', values: state.published })
        state.history = state.history.slice(0, 30)
        state.draft = values; state.published = values; state.publishedAt = date
      } else if (body.action === 'restore') {
        const version = state.history.find(item => item.id === body.id)
        if (!version) throw new Error('Versão não encontrada.')
        state.draft = validateContent({ ...state.draft, ...version.values })
      } else throw new Error('Ação inválida.')
    })
    return NextResponse.json(publicState(await readState(), actor))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Não foi possível salvar. Tente novamente.' }, { status: 400 })
  }
}
