'use client'

import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

import styles from './landing-page.module.css'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP)
}

type FaqItem = {
  answer: string
  question: string
}

export function FaqAccordion({ items }: { items: readonly FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const scope = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!scope.current) return

      const panels = Array.from(
        scope.current.querySelectorAll<HTMLElement>('[data-faq-panel]'),
      )

      panels.forEach((panel, index) => {
        const answer = panel.firstElementChild
        const isOpen = index === openIndex

        if (
          typeof window.matchMedia !== 'function' ||
          window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
          gsap.set(panel, { height: isOpen ? 'auto' : 0 })
          gsap.set(answer, { autoAlpha: isOpen ? 1 : 0 })
          return
        }

        if (isOpen) {
          gsap.set(panel, { height: 'auto' })
          const targetHeight = panel.offsetHeight
          gsap.fromTo(
            panel,
            { height: 0 },
            { duration: 0.5, ease: 'power3.inOut', height: targetHeight },
          )
          gsap.fromTo(
            answer,
            { autoAlpha: 0, y: -8 },
            { autoAlpha: 1, duration: 0.34, ease: 'power2.out', y: 0 },
          )
        } else {
          gsap.to(answer, { autoAlpha: 0, duration: 0.18, y: -6 })
          gsap.to(panel, { duration: 0.42, ease: 'power3.inOut', height: 0 })
        }
      })
    },
    { dependencies: [openIndex], revertOnUpdate: false, scope },
  )

  return (
    <div className={styles.faqList} ref={scope}>
      {items.map((item, index) => {
        const isOpen = openIndex === index
        const panelId = `faq-panel-${index}`

        return (
          <div className={styles.faqItem} key={item.question}>
            <button
              aria-controls={panelId}
              aria-expanded={isOpen}
              className={styles.faqQuestion}
              onClick={() => setOpenIndex(isOpen ? null : index)}
              type="button"
            >
              <span>{item.question}</span>
              <span aria-hidden="true" className={styles.faqToggle} />
            </button>
            <div
              aria-hidden={!isOpen}
              className={styles.faqAnswer}
              data-faq-panel
              id={panelId}
            >
              <p>{item.answer}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
