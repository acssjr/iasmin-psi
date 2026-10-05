import { readFileSync as readSource } from 'node:fs'
import { join } from 'node:path'

import { expect, it } from 'vitest'

// Source assertions must behave the same on Windows and Linux checkouts.
const readFileSync = (file: string, encoding: 'utf8') => readSource(file, encoding).replace(/\r\n/g, '\n')

it('grows the mobile navigation from the button side before and after docking', () => {
  const source = readFileSync(
    join(process.cwd(), 'src/components/landing/site-navigation.tsx'),
    'utf8',
  )

  expect(source).toContain("transformOrigin: docked ? 'top right' : 'top left'")
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
