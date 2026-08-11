import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'

import PrivacyPage from '@/app/privacidade/page'

it('offers a direct WhatsApp channel for privacy and deletion requests', () => {
  render(<PrivacyPage />)

  expect(
    screen.getByRole('link', { name: 'Falar sobre privacidade pelo WhatsApp' }),
  ).toHaveAttribute('href', expect.stringContaining('wa.me/5575981234176'))
})
