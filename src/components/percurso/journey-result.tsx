'use client'

import Image from 'next/image'
import Link from 'next/link'

import { trackSafeEvent } from '@/lib/analytics'
import { getJourneyReflection, journeyTopics } from '@/lib/journey-content'
import type { JourneyResultKey, JourneyTopicId } from '@/lib/types'

import styles from './journey.module.css'

export function JourneyResult({ reflectionKey, scheduleHref, topicId }: { reflectionKey: JourneyResultKey; scheduleHref: string; topicId: JourneyTopicId }) {
  const reflection = getJourneyReflection(topicId, reflectionKey)
  return (
    <section className={styles.result} aria-labelledby="result-title" data-testid="journey-result-layout">
      <div className={styles.resultCopy}>
        <p className={styles.eyebrow}>{journeyTopics[topicId].title}</p>
        <h1 id="result-title">{reflection.title}</h1>
        <p>Obrigada por se permitir essa pausa. Suas respostas não definem você, mas podem ser um convite para olhar com mais cuidado para o que está vivendo.</p>
        <p>{reflection.body}</p>
        <p>{reflection.invitation}</p>
        <p className={styles.boundaryNote}>Esta devolutiva é um convite à reflexão. Ela não é diagnóstico nem avaliação psicológica.</p>
        <div className={styles.resultActions}>
          <a className={styles.primaryButton} href={scheduleHref} onClick={() => trackSafeEvent('whatsapp_opened', { surface: 'result', theme: topicId })}>Conversar com Iasmin pelo WhatsApp</a>
          <Link className={styles.secondaryButton} href="/">Voltar para a página</Link>
        </div>
      </div>
      <figure className={styles.resultArtwork}>
        <Image alt={reflection.illustration.alt} fill sizes="(max-width: 41.99rem) 100vw, 19rem" src={reflection.illustration.src} />
      </figure>
    </section>
  )
}
