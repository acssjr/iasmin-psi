import { applyRetention } from '@/lib/retention'

export const runtime = 'nodejs'

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET
  return Boolean(secret) && request.headers.get('authorization') === `Bearer ${secret}`
}

async function handleRetention(request: Request) {
  if (!isAuthorized(request)) {
    return Response.json({ error: 'Não autorizado.' }, { status: 401 })
  }

  try {
    const result = await applyRetention()
    return Response.json({ ok: true, processed: result.processed })
  } catch {
    return Response.json({ error: 'Não foi possível concluir a retenção.' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  return handleRetention(request)
}

export async function POST(request: Request) {
  return handleRetention(request)
}
