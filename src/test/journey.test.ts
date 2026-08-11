import { expect, it } from 'vitest'

import { getReflectionKey, getReflectionTheme } from '@/lib/journey'

it('uses question ten to resolve a score tie', () => {
  expect(
    getReflectionTheme([
      'sobrecarrega',
      'autocritica',
      'reconexao',
      'autocritica',
      'sobrecarrega',
      'reconexao',
      'reconexao',
      'sobrecarrega',
      'autocritica',
      'reconexao',
    ]),
  ).toBe('reconexao')
})

it('never returns a clinical label', () => {
  expect(['sobrecarrega', 'autocritica', 'reconexao']).toContain(
    getReflectionTheme(['sobrecarrega']),
  )
})

it('varies the reflection when the dominant answer pattern changes', () => {
  expect(
    getReflectionKey([
      'sobrecarrega',
      'sobrecarrega',
      'sobrecarrega',
      'autocritica',
      'reconexao',
    ]),
  ).toBe('sobrecarrega')

  expect(
    getReflectionKey([
      'autocritica',
      'autocritica',
      'autocritica',
      'sobrecarrega',
      'reconexao',
    ]),
  ).toBe('autocritica')
})

it('uses a combined reflection when two answer themes appear together', () => {
  expect(
    getReflectionKey([
      'sobrecarrega',
      'sobrecarrega',
      'autocritica',
      'autocritica',
      'reconexao',
    ]),
  ).toBe('sobrecarrega-autocritica')
})

it('uses an integrated reflection for a balanced answer pattern', () => {
  expect(
    getReflectionKey([
      'sobrecarrega',
      'autocritica',
      'reconexao',
      'sobrecarrega',
      'autocritica',
    ]),
  ).toBe('olhar-ampliado')
})
