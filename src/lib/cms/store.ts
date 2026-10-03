import { neon } from '@neondatabase/serverless'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { defaults, type ContentValues } from './catalog'

export type Version = { id: string; date: string; label: string; values: ContentValues }
export type Media = { id: string; name: string; type: string; size: number; date: string }
export type CmsState = {
  revision: number; draft: ContentValues; published: ContentValues; publishedAt: string | null
  history: Version[]; media: Media[]
  account: { email: string; password: string; version: number } | null
  attempts: Record<string, { count: number; until: number }>
}
const directory = process.env.CMS_DATA_DIRECTORY || path.join(process.cwd(), '.cms')
const initial = (): CmsState => ({ revision: 0, draft: { ...defaults }, published: { ...defaults }, publishedAt: null, history: [], media: [], account: null, attempts: {} })
let initialized: Promise<void> | undefined
function database() { return process.env.DATABASE_URL ? neon(process.env.DATABASE_URL) : null }
async function init() {
  const sql = database()
  if (sql) {
    await sql`CREATE TABLE IF NOT EXISTS site_cms (id integer PRIMARY KEY, revision integer NOT NULL, state jsonb NOT NULL)`
    await sql`CREATE TABLE IF NOT EXISTS site_media (id uuid PRIMARY KEY, mime text NOT NULL, bytes bytea NOT NULL)`
    await sql`INSERT INTO site_cms (id,revision,state) VALUES (1,0,${JSON.stringify(initial())}::jsonb) ON CONFLICT DO NOTHING`
  } else {
    if (process.env.NODE_ENV === 'production') throw new Error('Configure DATABASE_URL para armazenar o painel em produção.')
    await fs.mkdir(path.join(directory, 'media'), { recursive: true })
    try { await fs.writeFile(path.join(directory, 'state.json'), JSON.stringify(initial()), { flag: 'wx', mode: 0o600 }) } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error }
  }
}
async function ready() { initialized ??= init(); try { await initialized } catch (error) { initialized = undefined; throw error } }
export async function readState(): Promise<CmsState> {
  await ready()
  const sql = database()
  const state = sql ? (await sql`SELECT state FROM site_cms WHERE id=1`)[0].state as CmsState : JSON.parse(await fs.readFile(path.join(directory, 'state.json'), 'utf8')) as CmsState
  state.draft = { ...defaults, ...state.draft }; state.published = { ...defaults, ...state.published }
  return state
}
let queue: Promise<unknown> = Promise.resolve()
export function mutateState<T>(change: (state: CmsState) => T): Promise<T> {
  const operation = queue.then(async () => {
    const state = await readState(), oldRevision = state.revision
    const result = change(state)
    state.revision++
    const sql = database()
    if (sql) {
      const rows = await sql`UPDATE site_cms SET state=${JSON.stringify(state)}::jsonb,revision=${state.revision} WHERE id=1 AND revision=${oldRevision} RETURNING id`
      if (!rows.length) throw new Error('O conteúdo mudou em outra janela. Atualize o painel antes de continuar.')
    } else {
      const temporary = path.join(directory, `${randomUUID()}.tmp`)
      await fs.writeFile(temporary, JSON.stringify(state), { mode: 0o600 })
      await fs.rename(temporary, path.join(directory, 'state.json'))
    }
    return result
  })
  queue = operation.catch(() => {})
  return operation
}
export async function publicContent() {
  try { return (await readState()).published } catch (error) {
    // Public defaults stay available when the CMS has not yet been provisioned.
    console.error('CMS indisponível:', error instanceof Error ? error.message : 'armazenamento')
    return { ...defaults }
  }
}
export async function saveMedia(id: string, mime: string, bytes: Buffer) {
  await ready(); const sql = database()
  if (sql) await sql`INSERT INTO site_media(id,mime,bytes) VALUES(${id}::uuid,${mime},decode(${bytes.toString('hex')},'hex'))`
  else await fs.writeFile(path.join(directory, 'media', id), bytes, { flag: 'wx' })
}
export async function readMedia(id: string) {
  await ready(); const sql = database()
  if (sql) {
    const row = (await sql`SELECT mime,encode(bytes,'base64') AS data FROM site_media WHERE id=${id}::uuid`)[0]
    return row ? { mime: row.mime as string, bytes: Buffer.from(row.data as string, 'base64') } : null
  }
  const media = (await readState()).media.find(item => item.id === id)
  if (!media) return null
  return { mime: media.type, bytes: await fs.readFile(path.join(directory, 'media', id)) }
}
