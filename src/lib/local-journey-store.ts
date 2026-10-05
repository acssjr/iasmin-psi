import { promises as fs } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import type { JourneyRecord } from './journey-records'
type LocalJourneyRecord = JourneyRecord & { viewed_by?: string[] }

function filename() {
  if (process.env.NODE_ENV === 'production') throw new Error('Configure DATABASE_URL para armazenar as respostas em produção.')
  return path.join(process.env.CMS_DATA_DIRECTORY || path.join(process.cwd(), '.cms'), 'journey-submissions.json')
}
export async function readLocalJourneys(): Promise<LocalJourneyRecord[]> {
  const file = filename()
  try { return JSON.parse(await fs.readFile(file, 'utf8')) }
  catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []; throw error }
}
let queue: Promise<unknown> = Promise.resolve()
export function mutateLocalJourneys<T>(change: (records: LocalJourneyRecord[]) => T): Promise<T> {
  const operation = queue.then(async () => {
    const records = await readLocalJourneys(), result = change(records), file = filename()
    await fs.mkdir(path.dirname(file), { recursive: true })
    const temp = path.join(path.dirname(file), `${randomUUID()}.tmp`)
    await fs.writeFile(temp, JSON.stringify(records), { mode: 0o600 })
    await fs.rename(temp, file)
    return result
  })
  queue = operation.catch(() => {})
  return operation
}
