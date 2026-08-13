import { z } from 'zod'

import { JOURNEY_CONTENT_VERSION, journeyTopicIds, journeyTopics } from './journey-content'

const utmValue = z.string().trim().max(128)
export const journeyUtmSchema = z.object({ campaign: utmValue.optional(), content: utmValue.optional(), medium: utmValue.optional(), source: utmValue.optional(), term: utmValue.optional() }).strict()
const normalizedWhatsApp = z.string().trim().transform((value) => value.replace(/\D/g, '')).refine((value) => /^\d{10,15}$/.test(value), { message: 'Informe um WhatsApp válido.' })

export const journeySubmissionSchema = z.object({
  adult: z.literal(true),
  answers: z.array(z.string().min(1).max(32)).length(5),
  contentVersion: z.literal(JOURNEY_CONTENT_VERSION),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  honeypot: z.literal(''),
  name: z.string().trim().min(2).max(120),
  purposeConsent: z.literal(true),
  submissionId: z.string().uuid(),
  topic: z.enum(journeyTopicIds as [typeof journeyTopicIds[number], ...typeof journeyTopicIds]),
  utm: journeyUtmSchema.default({}),
  whatsapp: normalizedWhatsApp,
}).superRefine((value, context) => {
  const topic = journeyTopics[value.topic]
  value.answers.forEach((answerId, index) => {
    if (!topic.questions[index]?.options.some((option) => option.id === answerId)) {
      context.addIssue({ code: 'custom', message: 'Resposta incompatível com o tema selecionado.', path: ['answers', index] })
    }
  })
})

export type JourneySubmission = z.output<typeof journeySubmissionSchema>
export type JourneyUtm = z.output<typeof journeyUtmSchema>
