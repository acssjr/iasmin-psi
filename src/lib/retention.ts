import {
  anonymizeJourneyAnswers,
  findExpiredJourneySubmissions,
  purgeExpiredJourneyContact,
} from './data'

export async function applyRetention() {
  const overdueSubmissions = await findExpiredJourneySubmissions(500)

  for (const submission of overdueSubmissions) {
    if (!submission.answers_anonymized_at) {
      await anonymizeJourneyAnswers(submission.id)
    }

    if (!submission.contact_permission) {
      await purgeExpiredJourneyContact(submission.id)
    }
  }

  return { processed: overdueSubmissions.length }
}
