'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

import styles from './journey.module.css'

gsap.registerPlugin(useGSAP)

export function JourneyPreparing() {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(() => {
    if (!scope.current || typeof window.matchMedia !== 'function' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const timeline = gsap.timeline({ defaults: { ease: 'power2.out' } })
    timeline
      .fromTo('[data-preparing-sketch]', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.7 })
      .fromTo('[data-preparing-copy]', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.65 }, 0.12)
      .fromTo('[data-preparing-loader] i', { opacity: 0.3, y: 0 }, { opacity: 1, y: -3, duration: 0.55, ease: 'sine.inOut', stagger: 0.14, repeat: 3, yoyo: true }, 0.7)
  }, { scope })

  return (
    <div
      aria-live="polite"
      className={styles.preparing}
      ref={scope}
      role="status"
    >
      <svg
        aria-hidden="true"
        className={styles.preparingSketch}
        data-preparing-sketch
        viewBox="0 0 180 100"
      >
        <path d="M18 76C47 42 73 30 105 36C129 40 142 28 162 16" />
        <path d="M105 36C111 19 122 11 138 10C134 24 124 33 105 36Z" />
        <path d="M80 37C72 21 61 15 47 17C53 29 64 36 80 37Z" />
      </svg>
      <div className={styles.preparingCopy} data-preparing-copy>
        <strong>Um instante para acolher o que você compartilhou.</strong>
        <p>Estamos preparando uma devolutiva para você olhar com calma.</p>
        <span className={styles.preparingLoader} data-preparing-loader aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      </div>
    </div>
  )
}
