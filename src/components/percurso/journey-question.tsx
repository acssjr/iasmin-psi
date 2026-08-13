import type { JourneyQuestion as JourneyQuestionData } from '@/lib/types'

import styles from './journey.module.css'

type JourneyQuestionProps = {
  onBack: () => void
  onSelect: (optionId: string) => void
  onSubmit: () => void
  question: JourneyQuestionData
  selectedOptionId?: string
  topicTitle: string
  total: number
}

export function JourneyQuestion({ onBack, onSelect, onSubmit, question, selectedOptionId, topicTitle, total }: JourneyQuestionProps) {
  return (
    <section className={styles.question} aria-labelledby={`question-${question.id}`}>
      <div className={styles.progressHeader}>
        <p>{topicTitle} · Pergunta {question.id} de {total}</p>
        <progress aria-label={`Progresso: pergunta ${question.id} de ${total}`} max={total} value={question.id} />
      </div>
      <h1 id={`question-${question.id}`}>{question.prompt}</h1>
      <p className={styles.questionHelp}>Escolha a alternativa que mais se aproxima do que você vive.</p>
      <fieldset>
        <legend className={styles.visuallyHidden}>Alternativas para a pergunta {question.id}</legend>
        {question.options.map((option) => (
          <label className={styles.option} key={option.id}>
            <input className={styles.optionInput} checked={selectedOptionId === option.id} name={`question-${question.id}`} onChange={() => onSelect(option.id)} type="radio" value={option.id} />
            <span aria-hidden="true" className={styles.optionIndicator} />
            <span className={styles.optionLabel}>{option.label}</span>
          </label>
        ))}
      </fieldset>
      <div className={styles.questionActions}>
        <button className={styles.backButton} type="button" onClick={onBack}>Voltar</button>
        <button className={styles.primaryButton} disabled={!selectedOptionId} type="button" onClick={onSubmit}>
          {question.id === total ? 'Ver minha devolutiva' : 'Continuar'}
        </button>
      </div>
    </section>
  )
}
