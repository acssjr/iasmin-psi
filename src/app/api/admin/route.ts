import { randomUUID, timingSafeEqual } from 'node:crypto'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { authenticated, requireAdmin, sameOrigin, login, COOKIE, hashPassword, verifyPassword, createSession } from '@/lib/cms/auth'
import { readState, mutateState, type CmsState } from '@/lib/cms/store'
import { validateContent, validateMediaReferences } from '@/lib/cms/catalog'

export const runtime = 'nodejs'
function publicState(state: CmsState) {
  return { revision: state.revision, draft: state.draft, published: state.published, publishedAt: state.publishedAt, history: state.history, media: state.media, email: state.account?.email }
}
export async function GET() {
  try { await requireAdmin(); return NextResponse.json(publicState(await readState()), { headers: { 'Cache-Control': 'no-store' } }) }
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
      if (typeof body.email !== 'string' || typeof body.password !== 'string' || body.password.length > 128) throw new Error('Informe e-mail e senha.')
      const token = await login(body.email.trim(), body.password)
      if (!token) return NextResponse.json({ error: 'E-mail ou senha inválidos. Após várias tentativas, aguarde 15 minutos.' }, { status: 401 })
      setSession(token); return NextResponse.json({ ok: true })
    }
    if (body.action === 'setup') {
      const expected = process.env.ADMIN_SETUP_TOKEN
      const token = typeof body.token === 'string' ? body.token : ''
      if (!expected || token.length !== expected.length || !timingSafeEqual(Buffer.from(token), Buffer.from(expected))) throw new Error('Código de ativação inválido.')
      if (typeof body.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email) || typeof body.password !== 'string' || body.password.length < 12 || body.password.length > 128) throw new Error('Informe um e-mail válido e uma senha de 12 a 128 caracteres.')
      const session = createSession(1)
      await mutateState(state => {
        if (state.account) throw new Error('O painel já foi ativado. Entre com sua conta.')
        state.account = { email: body.email.trim().toLowerCase(), password: hashPassword(body.password), version: 1 }
      })
      setSession(session); return NextResponse.json({ ok: true })
    }
    if (!await authenticated()) return NextResponse.json({ error: 'Sua sessão expirou. Entre novamente.' }, { status: 401 })
    if (body.action === 'logout') {
      await mutateState(state => { if (state.account) state.account.version++ })
      cookieStore.delete(COOKIE); return NextResponse.json({ ok: true })
    }
    if (body.action === 'password') {
      if (typeof body.current !== 'string' || typeof body.password !== 'string' || body.password.length < 12 || body.password.length > 128) throw new Error('A nova senha deve ter de 12 a 128 caracteres.')
      const version = await mutateState(state => {
        if (!state.account || !verifyPassword(body.current, state.account.password)) throw new Error('Senha atual inválida.')
        state.account.password = hashPassword(body.password); return ++state.account.version
      })
      setSession(createSession(version)); return NextResponse.json({ ok: true })
    }
    const values = body.action === 'save' || body.action === 'publish' ? validateContent(body.values) : null
    await mutateState(state => {
      if (body.revision !== state.revision) throw new Error('O conteúdo mudou em outra janela. Atualize o painel antes de continuar.')
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
    return NextResponse.json(publicState(await readState()))
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Não foi possível salvar. Tente novamente.' }, { status: 400 })
  }
}
