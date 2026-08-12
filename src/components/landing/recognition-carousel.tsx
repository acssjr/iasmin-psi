'use client'

import { useRef, useState } from 'react'
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
  const [activeIndex, setActiveIndex] = useState(0)

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
          const indicators = root.querySelectorAll<HTMLButtonElement>('[data-carousel-indicator]')
          if (!track || slides.length < 2) return

          const step = slides[1].offsetLeft - slides[0].offsetLeft
          const sequence = gsap.timeline({ repeat: -1 })

          sequence
            .addLabel('slide-0')
            .to(track, { duration: 5.2, x: 0 })
            .to(track, { duration: 0.8, ease: 'power2.inOut', x: -step, onStart: () => setActiveIndex(1) })
            .addLabel('slide-1')
            .to(track, { duration: 5.2, x: -step })
            .to(track, { duration: 0.8, ease: 'power2.inOut', x: -step * 2, onStart: () => setActiveIndex(2) })
            .addLabel('slide-2')
            .to(track, { duration: 5.2, x: -step * 2 })
            .to(track, {
              duration: 0.8,
              ease: 'power2.inOut',
              x: -step * 3,
              onStart: () => setActiveIndex(0),
            })
            .set(track, { x: 0 })

          const pause = () => sequence.pause()
          const resume = () => sequence.play()
          const showSlide = (event: Event) => {
            const indicator = event.currentTarget as HTMLButtonElement
            const index = Number(indicator.dataset.carouselIndicator)
            if (!Number.isInteger(index)) return

            sequence.pause()
            setActiveIndex(index)
            gsap.to(track, {
              duration: 0.65,
              ease: 'power2.inOut',
              x: -step * index,
              onComplete: () => sequence.seek(`slide-${index}`).play(),
            })
          }
          root.addEventListener('pointerenter', pause)
          root.addEventListener('pointerleave', resume)
          root.addEventListener('focusin', pause)
          root.addEventListener('focusout', resume)
          indicators.forEach((indicator) => indicator.addEventListener('click', showSlide))

          return () => {
            root.removeEventListener('pointerenter', pause)
            root.removeEventListener('pointerleave', resume)
            root.removeEventListener('focusin', pause)
            root.removeEventListener('focusout', resume)
            indicators.forEach((indicator) => indicator.removeEventListener('click', showSlide))
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
      <ol aria-label="Situações de reconhecimento" className={styles.recognitionList} data-carousel-track>
        {[...items, items[0]].map((copy, index) => (
          <li aria-hidden={index === items.length ? 'true' : undefined} data-carousel-slide key={`${index}-${copy}`}>
            <span>{String((index % items.length) + 1).padStart(2, '0')}</span>
            <p>{copy}</p>
          </li>
        ))}
      </ol>
      <div aria-label="Posição no carrossel" className={styles.carouselIndicators}>
        {items.map((_, index) => (
          <button
            aria-current={activeIndex === index ? 'true' : undefined}
            aria-label={`Mostrar sinal ${index + 1} de ${items.length}`}
            data-carousel-indicator={index}
            key={index}
            type="button"
          />
        ))}
      </div>
    </div>
  )
}
