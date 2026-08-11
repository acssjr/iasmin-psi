import { afterEach, expect, it, vi } from 'vitest'

import { getSchedulingWhatsAppHref } from '@/lib/whatsapp'

afterEach(() => {
  vi.unstubAllEnvs()
})

it('uses Iasmin WhatsApp as the default scheduling destination', () => {
  vi.stubEnv('NEXT_PUBLIC_WHATSAPP_NUMBER', '')

  expect(getSchedulingWhatsAppHref()).toBe(
    `https://wa.me/5575981234176?text=${encodeURIComponent(
      'Olá, Iasmin. Gostaria de agendar uma sessão de psicoterapia.',
    )}`,
  )
})

it('allows the configured scheduling number to replace the default', () => {
  vi.stubEnv('NEXT_PUBLIC_WHATSAPP_NUMBER', '(71) 99999-9999')

  expect(getSchedulingWhatsAppHref()).toContain('https://wa.me/71999999999')
})
