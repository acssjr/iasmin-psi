import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, expect, it } from 'vitest'

import { BrandLogo } from '@/components/brand-logo'

afterEach(cleanup)

it('exposes an accessible name for a meaningful brand mark', () => {
  render(<BrandLogo variant="horizontal" />)

  const logo = screen.getByRole('img', {
    name: 'Iasmin Portugal, Psicóloga Clínica',
  })

  expect(logo).toHaveAttribute('data-brand-variant', 'horizontal')
})

it('hides a decorative brand mark from assistive technology', () => {
  const { container } = render(
    <BrandLogo decorative tone="terracotta" variant="signature" />,
  )

  const logo = container.querySelector('[data-brand-variant="signature"]')

  expect(logo).toHaveAttribute('aria-hidden', 'true')
  expect(logo).not.toHaveAttribute('role')
  expect(logo).toHaveAttribute('data-brand-tone', 'terracotta')
})

it('supports every approved logo variant', () => {
  const { container } = render(
    <>
      <BrandLogo decorative variant="horizontal" />
      <BrandLogo decorative variant="full" />
      <BrandLogo decorative variant="signature" />
      <BrandLogo decorative variant="monogram" />
    </>,
  )

  expect(container.querySelectorAll('[data-brand-variant]')).toHaveLength(4)
})
