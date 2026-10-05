import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { assertUser, currentUser, hashPassword, sameOrigin, validatePassword, validateUsername } from '@/lib/cms/auth'
import { mutateState, publicUser, readState } from '@/lib/cms/store'

export const runtime = 'nodejs'
const noStore = { 'Cache-Control': 'no-store' }
export async function GET() {
  const actor = await currentUser()
  if (!actor) return NextResponse.json({ error: 'Entre novamente para continuar.' }, { status: 401, headers: noStore })
  if (actor.role !== 'admin') return NextResponse.json({ error: 'Somente administradores podem gerenciar usuários.' }, { status: 403, headers: noStore })
  const state = await readState()
  return NextResponse.json({ users: state.users.map(publicUser) }, { headers: noStore })
}

export async function POST(request: Request) {
  try {
    sameOrigin(request)
    const actor = await currentUser()
    if (!actor) return NextResponse.json({ error: 'Entre novamente para continuar.' }, { status: 401 })
    if (actor.role !== 'admin') return NextResponse.json({ error: 'Somente administradores podem gerenciar usuários.' }, { status: 403 })
    const raw = await request.text()
    if (raw.length > 10_000) throw new Error('Solicitação muito grande.')
    const body = JSON.parse(raw)
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Solicitação inválida.')
    await mutateState(state => {
      assertUser(state, actor, true)
      if (body.action === 'create' || body.action === 'update') {
        const username = validateUsername(body.username)
        if (typeof body.name !== 'string' || !body.name.trim() || body.name.trim().length > 80) throw new Error('Informe um nome de até 80 caracteres.')
        if (body.role !== 'admin' && body.role !== 'editor') throw new Error('Escolha Administrador ou Editor.')
        if (state.users.some(user => user.username === username && user.id !== (body.action === 'update' ? body.id : null))) throw new Error('Esse usuário já existe. Escolha outro nome de acesso.')
        if (body.action === 'create') {
          if (state.users.length >= 50) throw new Error('O painel permite até 50 usuários.')
          validatePassword(body.password)
          state.users.push({ id: randomUUID(), username, name: body.name.trim(), role: body.role, password: hashPassword(body.password), version: 1, active: true, createdAt: new Date().toISOString(), lastLoginAt: null })
          return
        }
        const target = state.users.find(user => user.id === body.id)
        if (!target) throw new Error('Usuário não encontrado.')
        if (target.id === actor.id && body.role !== target.role) throw new Error('Você não pode alterar sua própria permissão.')
        if (target.active && target.role === 'admin' && body.role !== 'admin' && !state.users.some(user => user.id !== target.id && user.active && user.role === 'admin')) throw new Error('Mantenha pelo menos um administrador ativo.')
        if (target.username !== username || target.role !== body.role) target.version++
        target.username = username; target.name = body.name.trim(); target.role = body.role
      } else {
        const target = state.users.find(user => user.id === body.id)
        if (!target) throw new Error('Usuário não encontrado.')
        if (body.action === 'access') {
          if (typeof body.active !== 'boolean') throw new Error('Informe o status do acesso.')
          if (target.id === actor.id && !body.active) throw new Error('Você não pode revogar seu próprio acesso.')
          if (!body.active && target.role === 'admin' && target.active && !state.users.some(user => user.id !== target.id && user.active && user.role === 'admin')) throw new Error('Mantenha pelo menos um administrador ativo.')
          target.active = body.active; target.version++
        } else if (body.action === 'password') {
          if (target.id === actor.id) throw new Error('Altere sua própria senha em Minha conta.')
          validatePassword(body.password)
          target.password = hashPassword(body.password); target.version++
          delete state.attempts[`login:${target.id}`]
        } else throw new Error('Ação inválida.')
      }
    }, false)
    return NextResponse.json({ users: (await readState()).users.map(publicUser) }, { headers: noStore })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Não foi possível atualizar o acesso.' }, { status: 400 })
  }
}
