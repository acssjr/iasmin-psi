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
