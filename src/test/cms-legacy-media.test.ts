import { expect, it } from 'vitest'
import { defaults, fields, validateContent, validateMediaReferences } from '@/lib/cms/catalog'
it('publishes the still-bundled legacy header logo without allowing arbitrary image paths', () => {
  const header = fields.find(field => field.kind === 'image' && field.label === 'Logo do cabeçalho')!
  const values = validateContent({ ...defaults, [header.id]: '/brand/iasmin-portugal-horizontal.svg' })
  expect(() => validateMediaReferences(values, new Set())).not.toThrow()
  expect(() => validateMediaReferences({ ...values, [header.id]: '/brand/unknown.svg' }, new Set())).toThrow('biblioteca')
})
