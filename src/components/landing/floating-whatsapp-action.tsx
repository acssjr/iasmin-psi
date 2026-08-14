'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import { BrandLogo } from '@/components/brand-logo'
import { TrackedLink } from '@/components/tracked-link'
import { getSchedulingWhatsAppHref } from '@/lib/whatsapp'

import styles from './landing-page.module.css'

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  gsap.registerPlugin(useGSAP, ScrollTrigger)
}

export function FloatingWhatsAppAction() {
  const dock = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!dock.current || typeof window.matchMedia !== 'function') {
        return
      }

      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const reveal = gsap.fromTo(
        dock.current,
        {
          autoAlpha: 0,
          pointerEvents: 'none',
          scale: reduceMotion ? 1 : 0.88,
          y: reduceMotion ? 0 : 10,
        },
        {
          autoAlpha: 1,
          duration: reduceMotion ? 0 : 0.48,
          ease: 'power2.out',
          paused: true,
          pointerEvents: 'auto',
          scale: 1,
          y: 0,
        },
      )

      const trigger = ScrollTrigger.create({
        animation: reveal,
        start: 'top -96px',
        toggleActions: 'play none none reverse',
        trigger: '#top',
      })

      return () => {
        trigger.kill()
        reveal.kill()
      }
    },
    { scope: dock },
  )

  return (
    <div className={styles.floatingWhatsAppDock} ref={dock}>
      <TrackedLink
        className={styles.floatingWhatsApp}
        eventName="cta_schedule_clicked"
        href={getSchedulingWhatsAppHref()}
        properties={{ surface: 'floating' }}
      >
        <BrandLogo decorative tone="cream" variant="monogram" />
        <span className={styles.srOnly}>Agendar uma sessão pelo WhatsApp</span>
      </TrackedLink>
    </div>
  )
}
