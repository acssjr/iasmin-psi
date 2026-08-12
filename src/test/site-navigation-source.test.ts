import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { expect, it } from 'vitest'

it('keeps the GSAP dependency signature stable during Fast Refresh', () => {
  const source = readFileSync(
    resolve('src/components/landing/site-navigation.tsx'),
    'utf8',
  )

  expect(source).toContain('dependencies: [mounted, open]')
})
