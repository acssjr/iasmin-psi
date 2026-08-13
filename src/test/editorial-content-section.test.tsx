import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'

import { EditorialContentSection } from '@/components/landing/editorial-content-section'

afterEach(cleanup)

it('presents four locally hosted reflections without sending visitors to Instagram', () => {
  render(<EditorialContentSection />)

  const section = screen.getByRole('region', { name: 'Reflexões para levar com você.' })
  const covers = within(section).getAllByRole('img')

  expect(covers).toHaveLength(4)
  covers.forEach((cover) => {
    expect(cover).toHaveAttribute('src', expect.stringContaining('%2Fimages%2Feditorial%2F'))
  })
  expect(within(section).queryByRole('link', { name: /Instagram/i })).not.toBeInTheDocument()
  expect(within(section).getByRole('link', { name: 'Conversar com Iasmin' })).toHaveAttribute(
    'href',
    expect.stringContaining('wa.me/5575981234176'),
  )
})
