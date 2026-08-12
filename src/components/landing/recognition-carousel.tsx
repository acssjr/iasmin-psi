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
          let currentIndex = 0
          let pointerStartX: number | null = null
          let suppressClick = false

          const updateActiveIndex = (index: number) => {
            currentIndex = index
            setActiveIndex(index)
          }

          sequence
            .addLabel('slide-0')
            .to(track, { duration: 4.2, x: 0 })
            .to(track, { duration: 0.8, ease: 'power2.inOut', x: -step, onStart: () => updateActiveIndex(1) })
            .addLabel('slide-1')
            .to(track, { duration: 4.2, x: -step })
            .to(track, { duration: 0.8, ease: 'power2.inOut', x: -step * 2, onStart: () => updateActiveIndex(2) })
            .addLabel('slide-2')
            .to(track, { duration: 4.2, x: -step * 2 })
            .to(track, {
              duration: 0.8,
              ease: 'power2.inOut',
              x: -step * 3,
              onStart: () => updateActiveIndex(0),
            })
            .set(track, { x: 0 })

          const pause = () => sequence.pause()
          const resume = () => sequence.play()
          const moveTo = (index: number, forward = false) => {
            sequence.pause()
            updateActiveIndex(index)
            const wrapsForward = forward && currentIndex === 0 && index === 0
            const targetX = wrapsForward ? -step * items.length : -step * index

            gsap.to(track, {
              duration: 0.65,
              ease: 'power2.inOut',
              x: targetX,
              onComplete: () => {
                if (wrapsForward) gsap.set(track, { x: 0 })
                sequence.seek(`slide-${index}`).play()
              },
            })
          }
          const advance = () => {
            const previousIndex = currentIndex
            const nextIndex = (previousIndex + 1) % items.length
            sequence.pause()
            updateActiveIndex(nextIndex)
            const wrapsForward = previousIndex === items.length - 1

            gsap.to(track, {
              duration: 0.65,
              ease: 'power2.inOut',
              x: -step * (wrapsForward ? items.length : nextIndex),
              onComplete: () => {
                if (wrapsForward) gsap.set(track, { x: 0 })
                sequence.seek(`slide-${nextIndex}`).play()
              },
            })
          }
          const showSlide = (event: Event) => {
            const indicator = event.currentTarget as HTMLButtonElement
            const index = Number(indicator.dataset.carouselIndicator)
            if (!Number.isInteger(index)) return
            moveTo(index)
          }
          const onSlideClick = () => {
            if (suppressClick) {
              suppressClick = false
              return
            }
            advance()
          }
          const onSlideKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Enter' && event.key !== ' ') return
            event.preventDefault()
            advance()
          }
          const onPointerDown = (event: PointerEvent) => {
            pointerStartX = event.clientX
            suppressClick = false
            sequence.pause()
          }
          const onPointerUp = (event: PointerEvent) => {
            if (pointerStartX === null) return
            const distance = Math.abs(event.clientX - pointerStartX)
            pointerStartX = null
            if (distance >= 32) {
              suppressClick = true
              advance()
            } else {
              sequence.play()
            }
          }
          const onPointerCancel = () => {
            pointerStartX = null
            sequence.play()
          }
          const interactiveSlides = Array.from(slides).slice(0, items.length)
          root.addEventListener('pointerenter', pause)
          root.addEventListener('pointerleave', resume)
          root.addEventListener('focusin', pause)
          root.addEventListener('focusout', resume)
          root.addEventListener('pointerdown', onPointerDown)
          root.addEventListener('pointerup', onPointerUp)
          root.addEventListener('pointercancel', onPointerCancel)
          indicators.forEach((indicator) => indicator.addEventListener('click', showSlide))
          interactiveSlides.forEach((slide) => {
            slide.addEventListener('click', onSlideClick)
            slide.addEventListener('keydown', onSlideKeyDown)
          })

          return () => {
            root.removeEventListener('pointerenter', pause)
            root.removeEventListener('pointerleave', resume)
            root.removeEventListener('focusin', pause)
            root.removeEventListener('focusout', resume)
            root.removeEventListener('pointerdown', onPointerDown)
            root.removeEventListener('pointerup', onPointerUp)
            root.removeEventListener('pointercancel', onPointerCancel)
            indicators.forEach((indicator) => indicator.removeEventListener('click', showSlide))
            interactiveSlides.forEach((slide) => {
              slide.removeEventListener('click', onSlideClick)
              slide.removeEventListener('keydown', onSlideKeyDown)
            })
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
      data-carousel-interval="5000"
      ref={scope}
    >
      <ol aria-label="Situações de reconhecimento" className={styles.recognitionList} data-carousel-track>
        {[...items, items[0]].map((copy, index) => (
          <li
            aria-hidden={index === items.length ? 'true' : undefined}
            aria-label={index < items.length ? `Sinal ${index + 1} de ${items.length}. Toque para avançar.` : undefined}
            data-carousel-slide
            key={`${index}-${copy}`}
            tabIndex={index < items.length ? 0 : undefined}
          >
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
