// @vitest-environment node
import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest'
import { mkdtemp, rm, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { defaults, fields, resolveContent, validateContent } from '@/lib/cms/catalog'

const cookies = vi.hoisted(() => new Map<string, string>())
vi.mock('next/headers', () => ({ cookies: async () => ({ get: (name: string) => cookies.has(name) ? { value: cookies.get(name) } : undefined, set: (name: string, value: string) => cookies.set(name, value), delete: (name: string) => cookies.delete(name) }) }))
let directory: string
let route: typeof import('@/app/api/admin/route')
let store: typeof import('@/lib/cms/store')
let auth: typeof import('@/lib/cms/auth')
const request = (body: unknown, origin='http://localhost:3000') => new Request('http://localhost:3000/api/admin', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
beforeAll(async () => {
  directory = await mkdtemp(path.join(tmpdir(), 'iasmin-cms-'))
  vi.stubEnv('CMS_DATA_DIRECTORY', directory); vi.stubEnv('DATABASE_URL', '')
  vi.stubEnv('ADMIN_SESSION_SECRET', 'a'.repeat(64)); vi.stubEnv('ADMIN_SETUP_TOKEN', 'b'.repeat(64))
  route = await import('@/app/api/admin/route'); store = await import('@/lib/cms/store'); auth = await import('@/lib/cms/auth')
})
afterAll(async () => { vi.unstubAllEnvs(); await rm(directory, { recursive: true, force: true }) })
describe('conteúdo editável', () => {
  it('valida todos os campos originais e rejeita campos vazios e links inseguros', () => {
    expect(validateContent(defaults)).toEqual(defaults)
    expect(() => validateContent({})).toThrow()
    const url = fields.find(field => field.kind === 'url')!
    expect(() => validateContent({ ...defaults, [url.id]: 'javascript:alert(1)' })).toThrow()
    const image = fields.find(field => field.kind === 'image')!
    expect(() => validateContent({ ...defaults, [image.id]: '/../secret' })).toThrow()
    expect(() => validateContent({ ...defaults, faq_collection: '[{"question":"","answer":""}]' })).toThrow()
    expect(() => validateContent({ ...defaults, editorial_collection: '[{"src":"https://evil.example/x","alt":"x"}]' })).toThrow()
  })
  it('resolve textos compartilhados preservando espaços e a configuração de WhatsApp', () => {
    const title = fields.find(field => field.default === 'Iasmin Portugal | Psicóloga Clínica')!
    expect(resolveContent({ [title.id]: 'Novo título' }, ` ${title.default} `)).toBe(' Novo título ')
    const whatsapp = fields.find(field => field.default.startsWith('https://wa.me/'))!
    const configured = whatsapp.default.replace('5575981234176', '5511999999999')
    expect(resolveContent(defaults, configured)).toBe(configured)
    expect(resolveContent({ ...defaults, [whatsapp.id]: 'https://wa.me/5511888888888' }, configured)).toBe('https://wa.me/5511888888888')
  })
})
describe('painel protegido e persistente', () => {
  it('bloqueia leitura e edição sem sessão e rejeita ativação de outra origem', async () => {
    expect((await route.GET()).status).toBe(401)
    expect((await route.POST(request({ action: 'save', values: defaults }))).status).toBe(401)
    expect((await route.POST(request({ action: 'setup' }, 'https://other.example'))).status).toBe(400)
  })
  it('ativa uma única conta com hash e bloqueia reativação', async () => {
    expect((await route.POST(request({ action: 'setup', username: 'cliente', password: 'Uma senha de teste longa!', token: 'b'.repeat(64) }))).status).toBe(200)
    const state = await store.readState()
    expect(state.users[0]?.password).not.toContain('Uma senha')
    expect(auth.verifyPassword('Uma senha de teste longa!', state.users[0].password)).toBe(true)
    expect((await route.POST(request({ action: 'setup', username: 'outro', password: 'Outra senha bastante longa', token: 'b'.repeat(64) }))).status).toBe(400)
  })
  it('mantém rascunho separado, publica e recupera histórico sem republicar', async () => {
    const title = fields.find(field => field.group === 'Abertura' && field.default.length > 40)!
    let state = await store.readState()
    const values = { ...state.draft, [title.id]: 'Texto editado para verificar a publicação.' }
    expect((await route.POST(request({ action: 'save', revision: state.contentRevision, values }))).status).toBe(200)
    state = await store.readState()
    expect(state.published[title.id]).toBe(title.default)
    expect((await route.POST(request({ action: 'publish', revision: state.contentRevision, values }))).status).toBe(200)
    state = await store.readState()
    expect((await store.publicContent())[title.id]).toBe(values[title.id])
    expect(state.history).toHaveLength(1)
    expect((await route.POST(request({ action: 'restore', revision: state.contentRevision, id: state.history[0].id }))).status).toBe(200)
    state = await store.readState()
    expect(state.draft[title.id]).toBe(title.default)
    expect(state.published[title.id]).toBe(values[title.id])
    expect((await route.POST(request({ action: 'save', revision: 0, values }))).status).toBe(400)
  })
  it('troca a senha e invalida sessões anteriores', async () => {
    const oldToken = cookies.get(auth.COOKIE)!
    expect((await route.POST(request({ action: 'password', current: 'Uma senha de teste longa!', password: 'Uma nova senha bem longa!' }))).status).toBe(200)
    const state = await store.readState()
    expect(auth.validSession(oldToken, state.users[0].id, state.users[0].version)).toBe(false)
    expect(auth.validSession(cookies.get(auth.COOKIE)!, state.users[0].id, state.users[0].version)).toBe(true)
    expect((await route.POST(request({ action: 'logout' }))).status).toBe(200)
    expect((await route.GET()).status).toBe(401)
  })
  it('limita tentativas incorretas mesmo com senha correta após o bloqueio', async () => {
    for (let i=0;i<5;i++) expect(await auth.login('cliente', 'incorreta')).toBeNull()
    expect(await auth.login('cliente', 'Uma nova senha bem longa!')).toBeNull()
  })
  it('armazena e recupera imagens com identificador estável', async () => {
    const id = '8b9b3cef-d1be-4b37-a9be-d612636e840e', bytes = Buffer.from('fixture')
    await store.saveMedia(id, 'image/png', bytes)
    await store.mutateState(state => state.media.push({ id, name: 'teste.png', type: 'image/png', size: bytes.length, date: new Date().toISOString() }))
    expect((await store.readMedia(id))?.bytes).toEqual(bytes)
  })
  it('protege upload, verifica o tipo real e serve a imagem persistida', async () => {
    const mediaRoute=await import('@/app/api/admin/media/route')
    const mediaRequest=(form:FormData)=>new Request('http://localhost:3000/api/admin/media',{method:'POST',headers:{Origin:'http://localhost:3000'},body:form})
    expect((await mediaRoute.POST(mediaRequest(new FormData()))).status).toBe(401)
    let state=await store.readState()
    cookies.set(auth.COOKIE,auth.createSession(state.users[0].id, state.users[0].version))
    const invalid=new FormData();invalid.append('revision',String(state.contentRevision));invalid.append('file',new File(['<svg/>'],'fake.png',{type:'image/png'}))
    expect((await mediaRoute.POST(mediaRequest(invalid))).status).toBe(400)
    const bytes=await readFile(path.join(process.cwd(),'public/images/iasmin/hero-terracotta.jpg'))
    const form=new FormData();form.append('revision',String(state.contentRevision));form.append('file',new File([new Uint8Array(bytes)],'foto.jpg',{type:'image/jpeg'}))
    const response=await mediaRoute.POST(mediaRequest(form))
    expect(response.status).toBe(201)
    const result=await response.json()
    expect(result.snapshot).not.toHaveProperty('account')
    state=await store.readState()
    expect(state.media.some(media=>media.id===result.media.id)).toBe(true)
    const publicMedia=await import('@/app/api/media/[id]/route')
    const image=await publicMedia.GET(new Request('http://localhost:3000'),{params:Promise.resolve({id:result.media.id})})
    expect(image.status).toBe(200)
    expect(image.headers.get('Content-Type')).toBe('image/jpeg')
    expect(image.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(Buffer.from(await image.arrayBuffer())).toEqual(bytes)
  })
})
