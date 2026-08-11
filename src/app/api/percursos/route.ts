import { createJourneySubmission } from '@/lib/data'
import { journeySubmissionSchema } from '@/lib/schemas'

export const runtime = 'nodejs'

const invalidSubmission = () =>
  Response.json({ error: 'Não foi possível validar estes dados.' }, { status: 400 })

export async function POST(request: Request) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return invalidSubmission()
  }

  const parsed = journeySubmissionSchema.safeParse(body)

  if (!parsed.success) {
    return invalidSubmission()
  }

  try {
    await createJourneySubmission(parsed.data)
    return Response.json({ ok: true }, { status: 201 })
  } catch {
    return Response.json(
      { error: 'Não foi possível salvar agora.' },
      { status: 500 },
    )
  }
}
