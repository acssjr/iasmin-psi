import type { JourneyQuestion as JourneyQuestionData, ReflectionTheme } from '@/lib/types'

import styles from './journey.module.css'

type JourneyQuestionProps = {
  answers: readonly ReflectionTheme[]
  onBack: () => void
  onSelect: (theme: ReflectionTheme, optionId: string) => void
  onSubmit: () => void
  question: JourneyQuestionData
  selectedOptionId?: string
  total: number
}

export function JourneyQuestion({
  answers,
  onBack,
  onSelect,
  onSubmit,
  question,
  selectedOptionId,
  total,
}: JourneyQuestionProps) {
  const selectedTheme = answers[question.id - 1]

  return (
    <section className={styles.question} aria-labelledby={`question-${question.id}`}>
      <div className={styles.progressHeader}>
        <p>Pergunta {question.id} de {total}</p>
        <progress aria-label={`Progresso: pergunta ${question.id} de ${total}`} max={total} value={question.id} />
      </div>
      <h1 id={`question-${question.id}`}>{question.prompt}</h1>
      <p className={styles.questionHelp}>Escolha a alternativa que mais se aproxima do que você vive.</p>
      <fieldset>
        <legend className={styles.visuallyHidden}>Alternativas para a pergunta {question.id}</legend>
        {question.options.map((option) => (
          <label className={styles.option} key={option.id}>
            <input
              className={styles.optionInput}
              checked={selectedOptionId === option.id}
              name={`question-${question.id}`}
              onChange={() => onSelect(option.theme, option.id)}
              type="radio"
              value={option.id}
            />
            <span aria-hidden="true" className={styles.optionIndicator} />
            <span className={styles.optionLabel}>{option.label}</span>
          </label>
        ))}
      </fieldset>
      <div className={styles.questionActions}>
        <button className={styles.backButton} type="button" onClick={onBack}>
          Voltar
        </button>
        <button
          className={styles.primaryButton}
          disabled={selectedTheme === undefined}
          type="button"
          onClick={onSubmit}
        >
          {question.id === total ? 'Ver minha devolutiva' : 'Continuar'}
        </button>
      </div>
    </section>
  )
}
