import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { expect, it } from 'vitest'

it('reveals editorial covers with compositor-friendly staggered motion', () => {
  const source = readFileSync(
    join(process.cwd(), 'src/components/landing/landing-motion.tsx'),
    'utf8',
  )

  expect(source).toContain('[data-editorial-cover]')
  expect(source).toContain('autoAlpha: 0')
  expect(source).toContain('stagger: 0.08')
})
