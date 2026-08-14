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
  expect(css).toContain('margin: -4.35rem auto 0;')
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

it('lets hero action boxes adapt before their labels overflow', () => {
  const css = readFileSync(
    join(process.cwd(), 'src/components/landing/landing-page.module.css'),
    'utf8',
  )

  expect(css).toContain(
    'grid-template-columns: repeat(auto-fit, minmax(min(100%, 12rem), 1fr));',
  )
  expect(css).not.toContain(
    '.hero .actions { grid-template-columns: repeat(2, minmax(0, 1fr)); }',
  )
})

it('gives the hero WhatsApp action stronger conversion hierarchy', () => {
  const css = readFileSync(
    join(process.cwd(), 'src/components/landing/landing-page.module.css'),
    'utf8',
  )

  expect(css).toContain('.hero .primaryAction {')
  expect(css).toContain('min-height: 4.75rem;')
  expect(css).toContain('font-size: clamp(0.76rem, 1vw, 0.88rem);')
  expect(css).toContain('box-shadow: 0 0.8rem 1.8rem')
})

it('increases the primary navigation labels at tablet and compact desktop widths', () => {
  const css = readFileSync(
    join(process.cwd(), 'src/components/landing/landing-page.module.css'),
    'utf8',
  )

  expect(css).toContain(
    '.navigation a, .navigation button { font-size: clamp(0.68rem, 1vw, 0.76rem); }',
  )
  expect(css).toContain('.headerAction { font-size: 0.64rem; }')
  expect(css).not.toContain('.navigation a, .headerAction { font-size: 0.6rem; }')
})

it('sizes the official brand marks for header, about and footer contexts', () => {
  const css = readFileSync(
    join(process.cwd(), 'src/components/landing/landing-page.module.css'),
    'utf8',
  )

  expect(css).toContain('.headerLogo')
  expect(css).toContain('.aboutSignature')
  expect(css).toContain('.footerLogo')
  expect(css).toContain('width: clamp(6.9rem, 10vw, 8.75rem);')
  expect(css).toContain('width: clamp(6.75rem, 10vw, 8.75rem);')
})

it('centers the mobile brand between the menu and highlighted schedule action', () => {
  const css = readFileSync(
    join(process.cwd(), 'src/components/landing/landing-page.module.css'),
    'utf8',
  )

  expect(css).toContain('grid-template-columns: minmax(0, 1fr) auto auto;')
  expect(css).toContain('grid-column: 1;\n    grid-row: 1;')
  expect(css).toContain('left: 50%;')
  expect(css).toContain('justify-self: auto;')
  expect(css).toContain('transform: translateX(-50%);')
  expect(css).toContain('grid-column: 3;\n    grid-row: 1;')
  expect(css).toContain('background: var(--terracotta);\n    color: var(--cream);')
})

it('centers the mobile footer and uses a balanced two-column navigation', () => {
  const css = readFileSync(
    join(process.cwd(), 'src/components/landing/landing-page.module.css'),
    'utf8',
  )

  expect(css).toContain('grid-template-columns: repeat(2, minmax(0, 1fr));')
  expect(css).toContain('text-align: center;')
  expect(css).toContain('color: var(--cream);')
})

it('slightly relaxes the mobile recognition headline and tightens hero branding', () => {
  const css = readFileSync(
    join(process.cwd(), 'src/components/landing/landing-page.module.css'),
    'utf8',
  )

  expect(css).toContain('letter-spacing: -0.06em;')
  expect(css).toContain('margin-bottom: 0.35rem;')
})

it('anchors the mobile navigation panel to the left edge', () => {
  const css = readFileSync(
    join(process.cwd(), 'src/components/landing/landing-page.module.css'),
    'utf8',
  )

  expect(css).toContain('left: max(1rem, calc((100vw - 62rem) / 2));')
  expect(css).toContain('right: auto;\n    left: 1rem;')
})

it('keeps the branded WhatsApp shortcut dock fixed with a mobile safe-area offset', () => {
  const css = readFileSync(
    join(process.cwd(), 'src/components/landing/landing-page.module.css'),
    'utf8',
  )

  expect(css).toContain('.floatingWhatsAppDock {')
  expect(css).toContain('position: fixed;')
  expect(css).toContain('background: var(--terracotta);')
  expect(css).toContain('bottom: max(1rem, env(safe-area-inset-bottom));')
})

it('fits the final scheduling action to its label with a readable type size', () => {
  const css = readFileSync(
    join(process.cwd(), 'src/components/landing/landing-page.module.css'),
    'utf8',
  )

  expect(css).toContain('.closing .actions {\n  width: fit-content;')
  expect(css).toContain('.closing .primaryAction {\n  min-width: min(18rem, 100%);')
  expect(css).toContain('font-size: clamp(0.76rem, 1.2vw, 0.88rem);')
})

it('removes the native mobile tap highlight from clickable recognition cards', () => {
  const css = readFileSync(
    join(process.cwd(), 'src/components/landing/landing-page.module.css'),
    'utf8',
  )

  expect(css).toContain('-webkit-tap-highlight-color: transparent;')
  expect(css).toContain('user-select: none;')
})

it('keeps the mobile hero compact while making its scheduling action prominent', () => {
  const css = readFileSync(
    join(process.cwd(), 'src/components/landing/landing-page.module.css'),
    'utf8',
  )

  expect(css).toContain('margin: -4.35rem auto 0;')
  expect(css).toContain('font-size: 0.82rem;')
})

it('gives headlines slightly more breathing room and prepares the editorial carousel for smooth transforms', () => {
  const css = readFileSync(
    join(process.cwd(), 'src/components/landing/landing-page.module.css'),
    'utf8',
  )

  expect(css).toContain('letter-spacing: -0.062em;')
  expect(css).toContain('.editorialCarouselTrack')
  expect(css).toContain('will-change: transform;')
})

it('keeps the about signature close to its section label', () => {
  const css = readFileSync(
    join(process.cwd(), 'src/components/landing/landing-page.module.css'),
    'utf8',
  )

  expect(css).toContain('.aboutIdentity {\n  display: flex;\n  align-items: center;\n  gap: 0.7rem;')
  expect(css).toContain('margin-left: 0;')
})
