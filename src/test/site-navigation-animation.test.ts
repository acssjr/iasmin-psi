import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { expect, it } from 'vitest'

it('grows the mobile navigation organically from its top-left origin', () => {
  const source = readFileSync(
    join(process.cwd(), 'src/components/landing/site-navigation.tsx'),
    'utf8',
  )

  expect(source).toContain("transformOrigin: 'top left'")
  expect(source).toContain('scaleX: reduceMotion ? 1 : 0.72')
  expect(source).toContain('scaleY: reduceMotion ? 1 : 0.58')
  expect(source).toContain("ease: 'power4.out'")
})

it('keeps the menu mounted until its closing timeline completes without restarting GSAP', () => {
  const source = readFileSync(
    join(process.cwd(), 'src/components/landing/site-navigation.tsx'),
    'utf8',
  )
  const closeBlock = source.match(/const closeMenu = \(\) => \{([\s\S]*?)\n  \}/)?.[1] ?? ''

  expect(source).toContain('dependencies: [mounted]')
  expect(source).not.toContain('dependencies: [mounted, open]')
  expect(closeBlock).toContain('setOpen(false)')
  expect(closeBlock).toContain('setMounted(false)')
  expect(closeBlock).toContain('onComplete: () => {\n        setMounted(false)')
})
