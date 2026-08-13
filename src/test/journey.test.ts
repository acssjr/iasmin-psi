import { expect, it } from 'vitest'

import { getJourneyResult } from '@/lib/journey'

it('returns a simple topic-scoped result for a dominant direction', () => {
  expect(
    getJourneyResult('ansiedade-sobrecarga', ['ans-1-a', 'ans-2-a', 'ans-3-a', 'ans-4-a', 'ans-5-a']),
  ).toBe('ansiedade-sobrecarga:pace')
})

it('combines two directions when both are present', () => {
  expect(
    getJourneyResult('ansiedade-sobrecarga', ['ans-1-a', 'ans-2-a', 'ans-3-c', 'ans-4-c', 'ans-5-a']),
  ).toBe('ansiedade-sobrecarga:pace-step')
})

it('returns a broad reflection for a balanced pattern', () => {
  expect(
    getJourneyResult('ansiedade-sobrecarga', ['ans-1-a', 'ans-2-c', 'ans-3-d', 'ans-4-a', 'ans-5-c']),
  ).toBe('ansiedade-sobrecarga:broad')
})

it('rejects an answer that does not belong to the selected topic', () => {
  expect(() =>
    getJourneyResult('ansiedade-sobrecarga', ['rel-1-a', 'ans-2-a', 'ans-3-a', 'ans-4-a', 'ans-5-a']),
  ).toThrow('Resposta incompatível com o tema selecionado.')
})
