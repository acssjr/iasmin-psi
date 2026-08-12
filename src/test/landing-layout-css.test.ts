import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { expect, it } from 'vitest'

it('centers the journey teaser columns on the same vertical axis', () => {
  const css = readFileSync(
    join(process.cwd(), 'src/components/landing/landing-page.module.css'),
    'utf8',
  )
  const journeyBlock = css.match(/\.journeyTeaser\s*\{([\s\S]*?)\}/)?.[1]

  expect(journeyBlock).toContain('align-items: center')
  expect(journeyBlock).not.toContain('align-items: end')
})

it('aligns the footer identity from the top edge', () => {
  const css = readFileSync(
    join(process.cwd(), 'src/components/landing/landing-page.module.css'),
    'utf8',
  )
  const footerTopBlock = css.match(/\.footerTop\s*\{([\s\S]*?)\}/)?.[1]

  expect(footerTopBlock).toContain('align-items: start')
  expect(footerTopBlock).not.toContain('align-items: end')
})

it('uses higher contrast and a more compact mobile hero', () => {
  const css = readFileSync(
    join(process.cwd(), 'src/components/landing/landing-page.module.css'),
    'utf8',
  )

  expect(css).toContain('.recognition .sectionKicker {\n  color: #fff9f1;')
  expect(css).toContain('aspect-ratio: 0.98;')
  expect(css).toContain('max-height: 29.5rem;')
  expect(css).toContain('margin: -3.65rem auto 0;')
  expect(css).toContain('.carouselIndicators')
  expect(css).toContain('touch-action: pan-y;')
})

it('keeps the mobile header controls separated and uses a compact cream menu', () => {
  const css = readFileSync(
    join(process.cwd(), 'src/components/landing/landing-page.module.css'),
    'utf8',
  )

  expect(css).toContain('grid-template-columns: minmax(0, 1fr) auto auto;')
  expect(css).toContain('background: var(--cream);')
  expect(css).toContain('max-height: calc(100svh - 6rem);')
  expect(css).not.toContain('inset: 0;\n    display: grid;\n    align-content: start;\n    padding: 1.25rem;\n    background: var(--espresso);')
})
