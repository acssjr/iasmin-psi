import { createJourneySubmission } from '@/lib/data'
import { getJourneyResult } from '@/lib/journey'
import { journeySubmissionSchema } from '@/lib/schemas'
import { publicContent } from '@/lib/cms/store'
import { snapshotJourney } from '@/lib/journey-records'

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
    const resultKey = getJourneyResult(parsed.data.topic, parsed.data.answers)
    await createJourneySubmission({
      ...parsed.data,
      resultKey,
      answerSnapshot: snapshotJourney(parsed.data.topic, parsed.data.answers, resultKey, await publicContent()),
    })
    return Response.json({ ok: true }, { status: 201 })
  } catch {
    return Response.json(
      { error: 'Não foi possível salvar agora.' },
      { status: 500 },
    )
  }
}
