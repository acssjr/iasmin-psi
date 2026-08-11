'use client'

import { track } from '@vercel/analytics/react'

import type { ReflectionTheme } from './types'

const eventNames = [
  'cta_schedule_clicked',
  'journey_started',
  'journey_contact_submitted',
  'journey_step_completed',
  'journey_completed',
  'journey_reflection_viewed',
  'whatsapp_opened',
] as const

const surfaces = [
  'header',
  'hero',
  'journey',
  'journey-teaser',
  'closing',
  'result',
  'minor-route',
] as const

const themes: readonly ReflectionTheme[] = [
  'sobrecarrega',
  'autocritica',
  'reconexao',
]

export type SafeEventName = (typeof eventNames)[number]
export type SafeAnalyticsProperties = {
  surface?: (typeof surfaces)[number]
  step?: number
  theme?: ReflectionTheme
}

export function trackSafeEvent(
  eventName: SafeEventName,
  properties: SafeAnalyticsProperties = {},
) {
  if (!eventNames.includes(eventName)) {
    throw new Error('Unsupported analytics event')
  }

  for (const property of Object.keys(properties)) {
    if (property !== 'surface' && property !== 'step' && property !== 'theme') {
      throw new Error(`Unsupported analytics property: ${property}`)
    }
  }

  if (properties.surface && !surfaces.includes(properties.surface)) {
    throw new Error('Invalid analytics surface')
  }

  if (
    properties.step !== undefined &&
    (!Number.isInteger(properties.step) || properties.step < 1 || properties.step > 10)
  ) {
    throw new Error('Invalid analytics step')
  }

  if (properties.theme && !themes.includes(properties.theme)) {
    throw new Error('Invalid analytics theme')
  }

  track(eventName, properties)
}
