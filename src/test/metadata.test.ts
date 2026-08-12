import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { expect, it } from 'vitest'

it('uses the official monogram as the site icon', () => {
  const layout = readFileSync(join(process.cwd(), 'src/app/layout.tsx'), 'utf8')

  expect(layout).toContain("icon: '/brand/iasmin-portugal-monogram.svg'")
  expect(layout).toContain("shortcut: '/brand/iasmin-portugal-monogram.svg'")
})
