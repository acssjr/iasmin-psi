import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { expect, it } from 'vitest'

it('moves the editorial covers in a calm, continuous GSAP loop', () => {
  const source = readFileSync(
    join(process.cwd(), 'src/components/landing/editorial-carousel.tsx'),
    'utf8',
  )

  expect(source).toContain('repeat: -1')
  expect(source).toContain('xPercent: -50')
  expect(source).toContain("ease: 'none'")
  expect(source).toContain('prefers-reduced-motion: reduce')
  expect(source).toContain('pauseCarousel')
  expect(source).toContain('resumeCarousel')
})
