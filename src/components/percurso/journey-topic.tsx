import { journeyTopicIds, journeyTopics } from '@/lib/journey-content'
import type { JourneyTopicId } from '@/lib/types'

import styles from './journey.module.css'

export function JourneyTopicSelection({ onSelect }: { onSelect: (topic: JourneyTopicId) => void }) {
  return (
    <section className={styles.topicSelection} aria-labelledby="topic-title">
      <p className={styles.eyebrow}>Escolha seu ponto de partida</p>
      <h1 id="topic-title">Sobre o que você quer olhar hoje?</h1>
      <p className={styles.topicIntroduction}>Escolha o tema que mais se aproxima do seu momento. Você poderá voltar antes de responder.</p>
      <div className={styles.topicGrid}>
        {journeyTopicIds.map((topicId) => {
          const topic = journeyTopics[topicId]
          return (
            <button className={styles.topicCard} key={topicId} type="button" onClick={() => onSelect(topicId)}>
              <strong>{topic.title}</strong>
              <span>{topic.description}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
