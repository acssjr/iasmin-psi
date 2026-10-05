import { currentUser } from '@/lib/cms/auth'
import { listJourneySubmissions, readJourneySubmission } from '@/lib/data'
import { journeyTopicIds } from '@/lib/journey-content'

export const runtime = 'nodejs'
const headers = { 'Cache-Control': 'private, no-store', 'Vary': 'Cookie' }
export async function GET(request: Request) {
  try {
    const actor = await currentUser()
    if (!actor) return Response.json({ error: 'Entre novamente para continuar.' }, { status: 401, headers })
    if (actor.role !== 'admin') return Response.json({ error: 'Somente administradores podem consultar as respostas.' }, { status: 403, headers })
    const params = new URL(request.url).searchParams, id = params.get('id')
    if (id !== null) {
      if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return Response.json({ error: 'Envio inválido.' }, { status: 400, headers })
      const record = await readJourneySubmission(id)
      return record ? Response.json({ record }, { headers }) : Response.json({ error: 'Resposta não encontrada ou fora do prazo de retenção.' }, { status: 404, headers })
    }
    const search = (params.get('search') || '').trim(), topic = params.get('topic') || '', page = Number(params.get('page') || 1)
    if (search.length > 120 || (topic && !journeyTopicIds.includes(topic as typeof journeyTopicIds[number])) || !Number.isInteger(page) || page < 1 || page > 100000) {
      return Response.json({ error: 'Confira os filtros de busca.' }, { status: 400, headers })
    }
    const result = await listJourneySubmissions({ search, topic, page })
    return Response.json({ ...result, storage: process.env.DATABASE_URL ? 'database' : 'local' }, { headers })
  } catch {
    return Response.json({ error: 'Não foi possível consultar as respostas. Tente novamente; se persistir, verifique o banco e suas migrações.' }, { status: 503, headers })
  }
}
