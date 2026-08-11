'use client'

import type { ReactNode } from 'react'
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  gsap.registerPlugin(useGSAP, ScrollTrigger)
}

type LandingMotionProps = {
  children: ReactNode
}

export function LandingMotion({ children }: LandingMotionProps) {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!scope.current || typeof window === 'undefined' || !window.matchMedia) {
        return
      }

      const root = scope.current
      const media = gsap.matchMedia()

      media.add(
        {
          desktop: '(min-width: 960px)',
          mobile: '(max-width: 959px)',
          reducedMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { desktop, mobile, reducedMotion } = context.conditions as {
            desktop: boolean
            mobile: boolean
            reducedMotion: boolean
          }

          if (reducedMotion) {
            return
          }

          const eyebrow = root.querySelector('[data-hero-eyebrow]')
          const title = root.querySelector('[data-hero-title]')
          const copy = root.querySelector('[data-hero-copy]')
          const actions = root.querySelector('[data-hero-actions]')
          const portrait = root.querySelector('[data-hero-portrait]')
          const heroTrailPaths = root.querySelectorAll(
            '[data-motion-target="hero"] .contextTrailPath',
          )
          const careTrailPaths = root.querySelectorAll(
            '[data-motion-target="care"] .contextTrailPath',
          )

          gsap.set([heroTrailPaths, careTrailPaths], {
            strokeDasharray: 1,
            strokeDashoffset: 1,
          })

          gsap
            .timeline({ defaults: { duration: 0.72, ease: 'power3.out' } })
            .from(eyebrow, { autoAlpha: 0, y: 16 })
            .from(title, { autoAlpha: 0, y: 32 }, '-=0.44')
            .from(copy, { autoAlpha: 0, y: 18 }, '-=0.4')
            .from(actions, { autoAlpha: 0, y: 18 }, '-=0.46')
            .from(
              portrait,
              { autoAlpha: 0, clipPath: 'inset(12% 12% 12% 12%)' },
              '-=0.9',
            )
            .to(heroTrailPaths, { duration: 1.15, strokeDashoffset: 0 }, '-=0.55')

          const careSection = root.querySelector<HTMLElement>('[data-care-section]')
          const carePillars = root.querySelectorAll<HTMLElement>('[data-care-pillar]')

          if (desktop && careSection && carePillars.length > 0) {
            gsap.set(carePillars, { autoAlpha: 0, x: 30 })

            gsap
              .timeline({
                scrollTrigger: {
                  trigger: careSection,
                  start: 'top top',
                  end: '+=105%',
                  pin: true,
                  scrub: 0.6,
                  anticipatePin: 1,
                  invalidateOnRefresh: true,
                },
              })
              .to(carePillars, { autoAlpha: 1, x: 0, stagger: 0.18 }, 0)
              .to(careTrailPaths, { strokeDashoffset: 0, duration: 0.75 }, 0.16)
          }

          if (mobile && carePillars.length > 0) {
            gsap.set(carePillars, { autoAlpha: 0, y: 24 })
            let hasDrawnCareTrail = false

            ScrollTrigger.batch(carePillars, {
              start: 'top 86%',
              once: true,
              onEnter: (batch) => {
                const timeline = gsap.timeline().to(batch, {
                  autoAlpha: 1,
                  duration: 0.52,
                  ease: 'power2.out',
                  stagger: 0.1,
                  y: 0,
                })

                if (!hasDrawnCareTrail) {
                  timeline.to(careTrailPaths, { duration: 0.72, strokeDashoffset: 0 }, 0)
                  hasDrawnCareTrail = true
                }
              },
            })
          }

          const refreshAfterAssets = async () => {
            await document.fonts?.ready
            const images = Array.from(root.querySelectorAll('img'))
            await Promise.all(images.map((image) => image.decode().catch(() => undefined)))
            ScrollTrigger.refresh()
          }

          void refreshAfterAssets()
        },
      )

      return () => media.revert()
    },
    { scope },
  )

  return (
    <div ref={scope} data-testid="landing-motion">
      {children}
    </div>
  )
}
