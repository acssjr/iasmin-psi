import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { expect, it } from 'vitest'

const stylesheet = readFileSync(resolve(process.cwd(), 'src/app/globals.css'), 'utf8')

it('defines the Plus Jakarta font token where the Next font class can resolve it', () => {
  expect(stylesheet).toMatch(
    /body\s*\{[^}]*--font-sans:\s*var\(--font-plus-jakarta\)/s,
  )
})
