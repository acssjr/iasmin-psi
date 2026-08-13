'use client'

import type { MouseEvent, ReactNode } from 'react'
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

import { trackSafeEvent, type AnalyticsSurface } from '@/lib/analytics'
import { BrandLogo } from '@/components/brand-logo'

import styles from './journey-transition.module.css'

gsap.registerPlugin(useGSAP)

const JourneyTransitionContext = createContext<(() => void) | null>(null)

export function JourneyTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [active, setActive] = useState(false)
  const overlay = useRef<HTMLDivElement>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    router.prefetch('/percurso')
    return () => { if (timer.current) clearTimeout(timer.current) }
  }, [router])

  useEffect(() => {
    if (!active) return
    const fallback = setTimeout(() => setActive(false), 5000)
    return () => clearTimeout(fallback)
  }, [active])

  const begin = useCallback(() => {
    if (active) return
    setActive(true)
    const reduced = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    timer.current = setTimeout(() => router.push('/percurso'), reduced ? 220 : 1900)
  }, [active, router])

  useGSAP(() => {
    if (!active || !overlay.current || (typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) return
    const timeline = gsap.timeline()
    timeline.fromTo(overlay.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: 'power2.out' })
      .fromTo('[data-transition-halo]', { scale: 0.72, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.8, ease: 'sine.inOut' }, 0)
      .fromTo('[data-transition-copy]', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65, ease: 'power2.out' }, 0.12)
      .to('[data-transition-halo]', { scale: 1.08, duration: 0.7, ease: 'sine.inOut' })
  }, { dependencies: [active], revertOnUpdate: true, scope: overlay })

  return (
    <JourneyTransitionContext.Provider value={begin}>
      {children}
      {active ? (
        <div className={styles.overlay} ref={overlay} role="status" aria-live="polite" aria-label="Abrindo o percurso">
          <div className={styles.halo} data-transition-halo />
          <div className={styles.copy} data-transition-copy>
            <BrandLogo
              className={styles.mark}
              decorative
              tone="terracotta"
              variant="monogram"
            />
            <strong>Uma pausa antes de começar.</strong>
            <p>Te levando para um espaço mais tranquilo.</p>
          </div>
        </div>
      ) : null}
    </JourneyTransitionContext.Provider>
  )
}

export function JourneyTransitionLink({ children, className, surface }: { children: ReactNode; className?: string; surface: AnalyticsSurface }) {
  const begin = useContext(JourneyTransitionContext)
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    trackSafeEvent('journey_started', { surface })
    begin?.()
  }
  return <Link className={className} href="/percurso" onClick={handleClick}>{children}</Link>
}
