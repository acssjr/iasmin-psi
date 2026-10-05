import { currentUser, sameOrigin } from '@/lib/cms/auth'
import { markJourneyViewed, unreadJourneyCount } from '@/lib/data'

export const runtime = 'nodejs'
const headers = { 'Cache-Control': 'private, no-store', Vary: 'Cookie' }
async function actor() {
  const user = await currentUser()
  if (!user) return Response.json({ error: 'Entre novamente para continuar.' }, { status: 401, headers })
  if (user.role !== 'admin') return Response.json({ error: 'Somente administradores podem consultar as notificações.' }, { status: 403, headers })
  return user
}
export async function GET() {
  try {
    const user = await actor()
    if (user instanceof Response) return user
    return Response.json({ unread: await unreadJourneyCount(user.id) }, { headers })
  } catch { return Response.json({ error: 'Não foi possível consultar as notificações.' }, { status: 503, headers }) }
}
export async function POST(request: Request) {
  try {
    sameOrigin(request)
    const user = await actor()
    if (user instanceof Response) return user
    const raw = await request.text()
    if (raw.length > 500) return Response.json({ error: 'Solicitação inválida.' }, { status: 400, headers })
    const body = JSON.parse(raw)
    if (!body || typeof body.id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.id)) return Response.json({ error: 'Envio inválido.' }, { status: 400, headers })
    if (!await markJourneyViewed(body.id, user.id)) return Response.json({ error: 'Envio não encontrado.' }, { status: 404, headers })
    return Response.json({ unread: await unreadJourneyCount(user.id) }, { headers })
  } catch { return Response.json({ error: 'Não foi possível registrar a leitura.' }, { status: 400, headers }) }
}
