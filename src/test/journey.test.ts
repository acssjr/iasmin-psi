import { expect, it } from 'vitest'

import { getReflectionTheme } from '@/lib/journey'

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
