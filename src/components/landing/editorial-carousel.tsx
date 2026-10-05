'use client'

import { useContentValues } from '@/components/cms/content'
import { useVisualEditing } from '@/components/cms/edit-context'

import Image from 'next/image'
import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

import styles from './landing-page.module.css'

type EditorialCover = {
  alt: string
  src: string
}

type EditorialCarouselProps = {
  covers: readonly EditorialCover[]
}

export function EditorialCarousel({ covers: originalCovers }: EditorialCarouselProps) {
  const values = useContentValues()
  const editing = useVisualEditing()
  const covers = values.editorial_collection ? JSON.parse(values.editorial_collection) as EditorialCover[] : originalCovers
  const carousel = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const viewport = carousel.current
      const track = viewport?.querySelector<HTMLElement>('[data-editorial-carousel-track]')

      if (
        editing ||
        !viewport ||
        !track ||
        (typeof window.matchMedia === 'function' &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      ) {
        return
      }

      const carouselTween = gsap.to(track, {
        duration: 30,
        ease: 'none',
        repeat: -1,
        xPercent: -50,
      })

      const pauseCarousel = () => carouselTween.pause()
      const resumeCarousel = () => carouselTween.resume()
      const pauseWhenFocusLeaves = (event: FocusEvent) => {
        if (!viewport.contains(event.relatedTarget as Node | null)) {
          resumeCarousel()
        }
      }

      viewport.addEventListener('pointerenter', pauseCarousel)
      viewport.addEventListener('pointerleave', resumeCarousel)
      viewport.addEventListener('focusin', pauseCarousel)
      viewport.addEventListener('focusout', pauseWhenFocusLeaves)

      return () => {
        viewport.removeEventListener('pointerenter', pauseCarousel)
        viewport.removeEventListener('pointerleave', resumeCarousel)
        viewport.removeEventListener('focusin', pauseCarousel)
        viewport.removeEventListener('focusout', pauseWhenFocusLeaves)
      }
    },
    { scope: carousel },
  )

  return (
    <div
      aria-label="Reflexões recentes de Iasmin Portugal"
      className={styles.editorialMosaic}
      data-cms-field={editing?.enabled ? 'editorial_collection' : undefined}
      ref={carousel}
      role="list"
    >
      <div className={styles.editorialCarouselTrack} data-editorial-carousel-track>
        {[false, true].map((isDuplicate) => (
          <div
            aria-hidden={isDuplicate || undefined}
            className={styles.editorialCarouselGroup}
            key={isDuplicate ? 'duplicate' : 'original'}
          >
            {covers.map((cover, index) => (
              <figure
                className={styles.editorialCover}
                data-editorial-cover={!isDuplicate ? '' : undefined}
                key={`${index}-${cover.src}`}
                role={!isDuplicate ? 'listitem' : undefined}
              >
                <Image
                  data-cms-photo-id={editing?.enabled&&!isDuplicate?`editorial_collection:${index}`:undefined}
                  alt={isDuplicate ? '' : cover.alt}
                  fill
                  sizes="(max-width: 560px) 68vw, (max-width: 1088px) 27vw, 15vw"
                  src={cover.src}
                  unoptimized={cover.src.startsWith('/api/media/')}
                />
              </figure>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
