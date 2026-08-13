import { journeyTopics } from './journey-content'
import type { JourneyDirectionId, JourneyResultKey, JourneyTopicId } from './types'

export function getJourneyResult(
  topicId: JourneyTopicId,
  answerIds: readonly string[],
): JourneyResultKey {
  const topic = journeyTopics[topicId]
  if (!topic) throw new Error('Tema inválido.')

  const optionDirections = new Map(
    topic.questions.flatMap((question) =>
      question.options.map((option) => [option.id, option.direction] as const),
    ),
  )
  const answers = answerIds.map((answerId) => {
    const direction = optionDirections.get(answerId)
    if (!direction) throw new Error('Resposta incompatível com o tema selecionado.')
    return direction
  })

  if (answers.length !== topic.questions.length) {
    throw new Error('Responda às cinco perguntas antes de continuar.')
  }

  const scores = new Map<JourneyDirectionId, number>(
    topic.directions.map((direction) => [direction, 0]),
  )
  for (const direction of answers) scores.set(direction, (scores.get(direction) ?? 0) + 1)

  const ranked = [...topic.directions].sort((first, second) =>
    (scores.get(second) ?? 0) - (scores.get(first) ?? 0),
  )
  const [first, second, third] = ranked
  const firstScore = scores.get(first) ?? 0
  const secondScore = scores.get(second) ?? 0
  const thirdScore = scores.get(third) ?? 0

  if (firstScore === 2 && secondScore === 2 && thirdScore === 1) {
    const lastDirection = answers.at(-1)
    if (lastDirection !== third) return `${topicId}:broad`
  }

  if (firstScore - secondScore <= 1) {
    const orderedPair = topic.directions.filter(
      (direction) => direction === first || direction === second,
    )
    return `${topicId}:${orderedPair.join('-')}`
  }

  return `${topicId}:${first}`
}
