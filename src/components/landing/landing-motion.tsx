'use client'

import type { ReactNode } from 'react'
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ScrollSmoother } from 'gsap/ScrollSmoother'

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  gsap.registerPlugin(useGSAP, ScrollTrigger, ScrollSmoother)
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

          let smoother: ScrollSmoother | undefined

          if (desktop && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
            const smoothContent = root.querySelector<HTMLElement>('[data-smooth-content]')
            if (smoothContent) {
              smoother = ScrollSmoother.create({
                content: smoothContent,
                effects: false,
                normalizeScroll: false,
                smooth: 0.85,
                smoothTouch: 0,
                wrapper: root,
              })
              window.__iasminScrollSmoother = smoother
            }
          }

          const eyebrow = root.querySelector('[data-hero-eyebrow]')
          const title = root.querySelector('[data-hero-title]')
          const copy = root.querySelector('[data-hero-copy]')
          const actions = root.querySelector('[data-hero-actions]')
          const portrait = root.querySelector('[data-hero-portrait]')
          const heroTrailPaths = root.querySelectorAll(
            '[data-motion-target="hero"] .contextTrailPath',
          )
          const careTrailSegments = root.querySelectorAll<SVGPathElement>(
            '[data-care-trail-segment]',
          )
          const careTrailNodes = root.querySelectorAll<SVGCircleElement>(
            '[data-care-trail-node]',
          )

          gsap.set(heroTrailPaths, {
            strokeDasharray: 1,
            strokeDashoffset: 1,
          })
          careTrailSegments.forEach((segment) => {
            const length = segment.getTotalLength()
            gsap.set(segment, { strokeDasharray: length, strokeDashoffset: length })
          })

          const heroTimeline = gsap.timeline({ defaults: { duration: 0.72, ease: 'power3.out' } })

          if (mobile) {
            heroTimeline
              .from(portrait, { autoAlpha: 0, y: 14 }, 0)
              .from(eyebrow, { autoAlpha: 0, y: 10 }, 0.08)
              .from(title, { autoAlpha: 0, y: 18 }, 0.12)
              .from(copy, { autoAlpha: 0, y: 12 }, 0.18)
              .from(actions, { autoAlpha: 0, y: 12 }, 0.24)
          } else {
            heroTimeline
              .from(eyebrow, { autoAlpha: 0, y: 16 })
              .from(title, { autoAlpha: 0, y: 32 }, '-=0.44')
              .from(copy, { autoAlpha: 0, y: 18 }, '-=0.4')
              .from(actions, { autoAlpha: 0, y: 18 }, '-=0.46')
              .from(
                portrait,
                { autoAlpha: 0, clipPath: 'inset(12% 12% 12% 12%)' },
                '-=0.9',
              )
          }

          heroTimeline.to(heroTrailPaths, { duration: 1.15, strokeDashoffset: 0 }, '-=0.55')

          const careSection = root.querySelector<HTMLElement>('[data-care-section]')
          const carePillars = root.querySelectorAll<HTMLElement>('[data-care-pillar]')

          if (careSection && carePillars.length === 3) {
            const horizontalOffset = desktop ? 30 : 0
            const verticalOffset = mobile ? 24 : 0

            gsap.set(carePillars, {
              autoAlpha: 0,
              x: horizontalOffset,
              y: verticalOffset,
            })
            gsap.set(careTrailNodes, {
              autoAlpha: 0,
              scale: 0.35,
              transformOrigin: '50% 50%',
            })

            const careTimeline = gsap
              .timeline({
                scrollTrigger: {
                  trigger: careSection,
                  start: desktop ? 'top top' : 'top 72%',
                  end: desktop ? '+=105%' : 'bottom 84%',
                  pin: desktop,
                  scrub: desktop ? 0.6 : 0.45,
                  anticipatePin: desktop ? 1 : 0,
                  invalidateOnRefresh: true,
                },
              })
              .to(carePillars[0], { autoAlpha: 1, duration: 0.42, x: 0, y: 0 })
              .to(careTrailNodes[0], { autoAlpha: 1, duration: 0.16, scale: 1 }, '<0.08')
              .to(careTrailSegments[0], { duration: 0.72, strokeDashoffset: 0 }, '+=0.06')
              .to(careTrailNodes[1], { autoAlpha: 1, duration: 0.16, scale: 1 }, '<0.62')
              .to(carePillars[1], { autoAlpha: 1, duration: 0.42, x: 0, y: 0 }, '<0.02')
              .to(careTrailSegments[1], { duration: 0.72, strokeDashoffset: 0 }, '+=0.08')
              .to(careTrailNodes[2], { autoAlpha: 1, duration: 0.16, scale: 1 }, '<0.62')
              .to(carePillars[2], { autoAlpha: 1, duration: 0.42, x: 0, y: 0 }, '<0.02')

            if (mobile) {
              careTimeline.scrollTrigger?.refresh()
            }
          }

          const editorialSection = root.querySelector<HTMLElement>('[data-editorial-section]')
          const editorialCovers = root.querySelectorAll<HTMLElement>('[data-editorial-cover]')

          if (editorialSection && editorialCovers.length) {
            gsap.from(editorialCovers, {
              autoAlpha: 0,
              duration: 0.72,
              ease: 'power2.out',
              stagger: 0.08,
              scrollTrigger: {
                once: true,
                start: 'top 78%',
                trigger: editorialSection,
              },
              y: 24,
            })
          }

          const revealSections = root.querySelectorAll<HTMLElement>(
            'main > section:not(:first-child)',
          )

          revealSections.forEach((section) => {
            gsap.from(section, {
              autoAlpha: 0.78,
              duration: 0.8,
              ease: 'power2.out',
              scrollTrigger: {
                once: true,
                start: 'top 88%',
                trigger: section,
              },
              y: 24,
            })
          })

          const refreshAfterAssets = async () => {
            await document.fonts?.ready
            const images = Array.from(root.querySelectorAll('img'))
            await Promise.all(images.map((image) => image.decode().catch(() => undefined)))
            ScrollTrigger.refresh()
          }

          void refreshAfterAssets()

          return () => {
            if (window.__iasminScrollSmoother === smoother) {
              window.__iasminScrollSmoother = undefined
            }
            smoother?.kill()
          }
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
