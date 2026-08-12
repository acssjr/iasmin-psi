'use client'

import Image from 'next/image'
import Link from 'next/link'

import { trackSafeEvent } from '@/lib/analytics'
import { reflectionContent } from '@/lib/content'
import type { ReflectionKey, ReflectionTheme } from '@/lib/types'

import styles from './journey.module.css'

export function JourneyResult({
  reflectionKey,
  scheduleHref,
  theme,
}: {
  reflectionKey: ReflectionKey
  scheduleHref: string
  theme: ReflectionTheme
}) {
  const reflection = reflectionContent[reflectionKey]

  return (
    <section
      className={styles.result}
      aria-labelledby="result-title"
      data-testid="journey-result-layout"
    >
      <div className={styles.resultCopy}>
        <p className={styles.eyebrow}>O que este percurso pode te mostrar</p>
        <h1 id="result-title">{reflection.title}</h1>
        <p>
          Obrigada por se permitir essa pausa. Suas respostas não definem você,
          mas podem ser um convite para olhar com mais cuidado para o que está
          vivendo.
        </p>
        <p>{reflection.body}</p>
        <p>{reflection.invitation}</p>
        <p className={styles.boundaryNote}>
          Esta é uma devolutiva de reflexão. Ela não é diagnóstico nem avaliação
          profissional.
        </p>
        <div className={styles.resultActions}>
          <a
            className={styles.primaryButton}
            href={scheduleHref}
            onClick={() => trackSafeEvent('whatsapp_opened', { surface: 'result', theme })}
          >
            Conversar com Iasmin pelo WhatsApp
          </a>
          <Link className={styles.secondaryButton} href="/">
            Voltar para a página
          </Link>
        </div>
      </div>
      <figure className={styles.resultArtwork}>
        <Image
          alt={reflection.illustration.alt}
          fill
          sizes="(max-width: 41.99rem) 100vw, 19rem"
          src={reflection.illustration.src}
        />
      </figure>
    </section>
  )
}
