import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { expect, it } from 'vitest'

it('keeps the floating WhatsApp action hidden until the visitor starts scrolling', () => {
  const source = readFileSync(
    join(process.cwd(), 'src/components/landing/floating-whatsapp-action.tsx'),
    'utf8',
  )

  expect(source).toContain("start: 'top -96px'")
  expect(source).toContain("toggleActions: 'play none none reverse'")
  expect(source).toContain('autoAlpha: 0')
  expect(source).toContain("pointerEvents: 'none'")
})
