import { expect, it } from 'vitest'

import { journeyTopics } from '@/lib/journey-content'

it('provides four thematic journeys with five questions each', () => {
  expect(Object.keys(journeyTopics)).toEqual([
    'ansiedade-sobrecarga',
    'relacionamentos-limites',
    'luto-mudancas',
    'autoestima-autocritica',
  ])

  for (const topic of Object.values(journeyTopics)) {
    expect(topic.questions).toHaveLength(5)
    expect(topic.reflections.broad.title).toBeTruthy()
  }
})

it('keeps every answer id unique inside its topic', () => {
  for (const topic of Object.values(journeyTopics)) {
    const ids = topic.questions.flatMap((question) =>
      question.options.map((option) => option.id),
    )
    expect(new Set(ids).size).toBe(ids.length)
  }
})
