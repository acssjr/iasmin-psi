
import { ContentText } from '@/components/cms/content'
import { journeyTopicIds, journeyTopics } from '@/lib/journey-content'
import type { JourneyTopicId } from '@/lib/types'

import styles from './journey.module.css'

export function JourneyTopicSelection({ onSelect }: { onSelect: (topic: JourneyTopicId) => void }) {
  return (
    <section className={styles.topicSelection} aria-labelledby="topic-title">
      <p className={styles.eyebrow}><ContentText fallback="Escolha seu ponto de partida" /></p>
      <h1 id="topic-title"><ContentText fallback="Sobre o que você quer olhar hoje?" /></h1>
      <p className={styles.topicIntroduction}><ContentText fallback="Escolha o tema que mais se aproxima do seu momento. Você poderá voltar antes de responder." /></p>
      <div className={styles.topicGrid}>
        {journeyTopicIds.map((topicId) => {
          const topic = journeyTopics[topicId]
          return (
            <button className={styles.topicCard} key={topicId} type="button" onClick={() => onSelect(topicId)}>
              <strong><ContentText fallback={topic.title} /></strong>
              <span><ContentText fallback={topic.description} /></span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
