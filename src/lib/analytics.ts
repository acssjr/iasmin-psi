'use client'

import { track } from '@vercel/analytics/react'

import { journeyTopicIds } from './journey-content'
import type { JourneyResultKey, JourneyTopicId } from './types'

const eventNames = ['cta_schedule_clicked', 'journey_started', 'journey_contact_submitted', 'journey_step_completed', 'journey_completed', 'journey_reflection_viewed', 'whatsapp_opened'] as const
export const analyticsSurfaces = ['header', 'hero', 'journey', 'journey-teaser', 'closing', 'result', 'minor-route'] as const

export type SafeEventName = (typeof eventNames)[number]
export type AnalyticsSurface = (typeof analyticsSurfaces)[number]
export type SafeAnalyticsProperties = { surface?: AnalyticsSurface; step?: number; theme?: JourneyTopicId; reflection?: JourneyResultKey }

export function trackSafeEvent(eventName: SafeEventName, properties: SafeAnalyticsProperties = {}) {
  if (!eventNames.includes(eventName)) throw new Error('Unsupported analytics event')
  for (const property of Object.keys(properties)) {
    if (!['surface', 'step', 'theme', 'reflection'].includes(property)) throw new Error(`Unsupported analytics property: ${property}`)
  }
  if (properties.surface && !analyticsSurfaces.includes(properties.surface)) throw new Error('Invalid analytics surface')
  if (properties.step !== undefined && (!Number.isInteger(properties.step) || properties.step < 1 || properties.step > 10)) throw new Error('Invalid analytics step')
  if (properties.theme && !journeyTopicIds.includes(properties.theme)) throw new Error('Invalid analytics theme')
  track(eventName, properties)
}
