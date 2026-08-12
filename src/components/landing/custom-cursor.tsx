'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

import styles from './landing-page.module.css'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP)
}

export function CustomCursor() {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (
        !scope.current ||
        typeof window.matchMedia !== 'function' ||
        !window.matchMedia('(hover: hover) and (pointer: fine)').matches ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        return
      }

      const dot = scope.current.querySelector<HTMLElement>('[data-cursor-dot]')
      const halo = scope.current.querySelector<HTMLElement>('[data-cursor-halo]')
      if (!dot || !halo) return

      gsap.set(scope.current, { autoAlpha: 1 })

      const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3.out' })
      const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3.out' })
      const haloX = gsap.quickTo(halo, 'x', { duration: 0.42, ease: 'power3.out' })
      const haloY = gsap.quickTo(halo, 'y', { duration: 0.42, ease: 'power3.out' })

      const onPointerMove = (event: PointerEvent) => {
        dotX(event.clientX)
        dotY(event.clientY)
        haloX(event.clientX)
        haloY(event.clientY)
      }
      const onPointerOver = (event: PointerEvent) => {
        const interactive = (event.target as Element | null)?.closest(
          'a, button, summary, input, label, [data-cursor="focus"]',
        )
        gsap.to(halo, {
          borderColor: interactive ? 'rgba(194, 99, 63, 0.86)' : 'rgba(194, 99, 63, 0.5)',
          duration: 0.28,
          scale: interactive ? 1.65 : 1,
        })
        gsap.to(dot, { duration: 0.22, scale: interactive ? 0.65 : 1 })
      }

      window.addEventListener('pointermove', onPointerMove, { passive: true })
      document.addEventListener('pointerover', onPointerOver, { passive: true })

      return () => {
        window.removeEventListener('pointermove', onPointerMove)
        document.removeEventListener('pointerover', onPointerOver)
      }
    },
    { scope },
  )

  return (
    <div aria-hidden="true" className={styles.customCursor} ref={scope}>
      <span className={styles.cursorHalo} data-cursor-halo />
      <span className={styles.cursorDot} data-cursor-dot />
    </div>
  )
}
