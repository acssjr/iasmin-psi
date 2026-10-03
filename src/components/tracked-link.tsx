'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { useContentValue } from '@/components/cms/content'

import { trackSafeEvent, type SafeAnalyticsProperties, type SafeEventName } from '@/lib/analytics'

type TrackedLinkProps = {
  children: ReactNode
  className?: string
  eventName: SafeEventName
  href: string
  properties: SafeAnalyticsProperties
}

export function TrackedLink({
  children,
  className,
  eventName,
  href,
  properties,
}: TrackedLinkProps) {
  const text = useContentValue()
  href = text(href)
  const onClick = () => trackSafeEvent(eventName, properties)

  if (href.startsWith('http') || href.startsWith('#')) {
    return (
      <a className={className} href={href} onClick={onClick}>
        {children}
      </a>
    )
  }

  return (
    <Link className={className} href={href} onClick={onClick}>
      {children}
    </Link>
  )
}
