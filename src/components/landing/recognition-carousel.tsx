'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

import styles from './landing-page.module.css'

const items = [
  'Você parece estar sempre resolvendo algo, mesmo quando já está cansada.',
  'A ansiedade ocupa espaço e torna as pequenas escolhas mais difíceis.',
  'Você se cobra tanto que às vezes perde de vista o que também precisa.',
]

export function RecognitionCarousel() {
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const root = scope.current
      if (!root || typeof window.matchMedia !== 'function') return

      const media = gsap.matchMedia()
      media.add(
        {
          mobile: '(max-width: 35rem)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const { mobile, reduceMotion } = context.conditions ?? {}
          if (!mobile || reduceMotion) return

          const track = root.querySelector<HTMLElement>('[data-carousel-track]')
          const slides = root.querySelectorAll<HTMLElement>('[data-carousel-slide]')
          if (!track || slides.length < 2) return

          const step = slides[1].offsetLeft - slides[0].offsetLeft
          const sequence = gsap.timeline({ repeat: -1, repeatDelay: 1.4 })

          sequence.to(track, { duration: 1.8, x: 0 })

          for (let index = 1; index <= items.length; index += 1) {
            sequence.to(track, {
              duration: 0.9,
              ease: 'power3.inOut',
              x: -step * index,
            })
          }

          sequence.set(track, { x: 0 })

          const pause = () => sequence.pause()
          const resume = () => sequence.play()
          root.addEventListener('pointerenter', pause)
          root.addEventListener('pointerleave', resume)
          root.addEventListener('focusin', pause)
          root.addEventListener('focusout', resume)

          return () => {
            root.removeEventListener('pointerenter', pause)
            root.removeEventListener('pointerleave', resume)
            root.removeEventListener('focusin', pause)
            root.removeEventListener('focusout', resume)
            sequence.kill()
          }
        },
      )

      return () => media.revert()
    },
    { scope },
  )

  return (
    <div
      aria-label="Sinais que podem fazer sentido para você"
      className={styles.recognitionViewport}
      ref={scope}
    >
      <ol className={styles.recognitionList} data-carousel-track>
        {[...items, items[0]].map((copy, index) => (
          <li aria-hidden={index === items.length ? 'true' : undefined} data-carousel-slide key={`${index}-${copy}`}>
            <span>{String((index % items.length) + 1).padStart(2, '0')}</span>
            <p>{copy}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
