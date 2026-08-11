import { z } from 'zod'

const reflectionThemes = ['sobrecarrega', 'autocritica', 'reconexao'] as const

const utmValue = z.string().trim().max(128)

export const journeyUtmSchema = z
  .object({
    campaign: utmValue.optional(),
    content: utmValue.optional(),
    medium: utmValue.optional(),
    source: utmValue.optional(),
    term: utmValue.optional(),
  })
  .strict()

const normalizedWhatsApp = z
  .string()
  .trim()
  .transform((value) => value.replace(/\D/g, ''))
  .refine((value) => /^\d{10,15}$/.test(value), {
    message: 'Informe um WhatsApp válido.',
  })

export const journeySubmissionSchema = z.object({
  adult: z.literal(true),
  answers: z.array(z.enum(reflectionThemes)).length(10),
  contactPermission: z.boolean(),
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  honeypot: z.literal(''),
  name: z.string().trim().min(2).max(120),
  purposeConsent: z.literal(true),
  submissionId: z.string().uuid(),
  utm: journeyUtmSchema.default({}),
  whatsapp: normalizedWhatsApp,
})

export type JourneySubmission = z.output<typeof journeySubmissionSchema>
export type JourneyUtm = z.output<typeof journeyUtmSchema>
