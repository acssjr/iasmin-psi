import { journeyTopics } from './journey-content'
import { resolveContent, type ContentValues } from './cms/catalog'

export type JourneyAnswerSnapshot = {
  topic: string
  questions: { question: string; answer: string; answerId: string }[]
  reflection: { title: string; body: string; invitation: string } | null
}
export type JourneyRecordSummary = {
  id: string; name: string | null; email: string | null; whatsapp: string | null
  created_at: string; journey_topic: string | null; reflection_theme: string | null
}
export type JourneyRecord = JourneyRecordSummary & {
  answers: string[] | null; result_key: string | null; content_version: string | null
  purpose_consent_version: string; purpose_consented_at: string
  contact_permission: boolean; contact_expires_at: string | null; answers_expires_at: string
  answers_anonymized_at: string | null; deleted_at: string | null
  answer_snapshot: JourneyAnswerSnapshot | null
  utm?: Record<string, string | undefined>
}
export function snapshotJourney(topicId: string, answers: readonly string[], resultKey: string, values: ContentValues): JourneyAnswerSnapshot | null {
  const topic = journeyTopics[topicId as keyof typeof journeyTopics]
  if (!topic) return null
  const text = (fallback: string) => resolveContent(values, fallback)
  const reflection = topic.reflections[resultKey.split(':')[1]]
  return {
    topic: text(topic.title),
    questions: topic.questions.map((question, index) => ({
      question: text(question.prompt), answerId: answers[index],
      answer: text(question.options.find(option => option.id === answers[index])?.label || answers[index]),
    })),
    reflection: reflection ? { title: text(reflection.title), body: text(reflection.body), invitation: text(reflection.invitation) } : null,
  }
}
export function journeyTopicLabel(record: JourneyRecordSummary) {
  const topic = journeyTopics[record.journey_topic as keyof typeof journeyTopics]
  const legacy: Record<string, string> = { sobrecarrega: 'Sobrecarga', autocritica: 'Autocrítica', reconexao: 'Reconexão' }
  return topic?.title || legacy[record.reflection_theme || ''] || 'Tema anterior'
}
