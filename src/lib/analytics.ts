'use client'

import { track } from '@vercel/analytics/react'

import type { ReflectionKey, ReflectionTheme } from './types'

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

const reflections: readonly ReflectionKey[] = [
  'sobrecarrega',
  'autocritica',
  'reconexao',
  'sobrecarrega-autocritica',
  'sobrecarrega-reconexao',
  'autocritica-reconexao',
  'olhar-ampliado',
]

export type SafeEventName = (typeof eventNames)[number]
export type SafeAnalyticsProperties = {
  surface?: (typeof surfaces)[number]
  step?: number
  theme?: ReflectionTheme
  reflection?: ReflectionKey
}

export function trackSafeEvent(
  eventName: SafeEventName,
  properties: SafeAnalyticsProperties = {},
) {
  if (!eventNames.includes(eventName)) {
    throw new Error('Unsupported analytics event')
  }

  for (const property of Object.keys(properties)) {
    if (
      property !== 'surface' &&
      property !== 'step' &&
      property !== 'theme' &&
      property !== 'reflection'
    ) {
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

  if (properties.reflection && !reflections.includes(properties.reflection)) {
    throw new Error('Invalid analytics reflection')
  }

  track(eventName, properties)
}
