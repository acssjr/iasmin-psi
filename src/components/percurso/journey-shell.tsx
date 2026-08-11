'use client'

import type { ChangeEvent } from 'react'
import { useRef, useState } from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

import { journeyQuestions } from '@/lib/content'
import { trackSafeEvent } from '@/lib/analytics'
import { getReflectionTheme } from '@/lib/journey'
import { getSchedulingWhatsAppHref } from '@/lib/whatsapp'
import type { ReflectionTheme } from '@/lib/types'

import { AgeGate, ContactForm, MinorRoute, type ContactDetails } from './journey-intro'
import { JourneyQuestion } from './journey-question'
import { JourneyResult } from './journey-result'
import styles from './journey.module.css'

if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
  gsap.registerPlugin(useGSAP)
}

type JourneyView =
  | { kind: 'age-gate' }
  | { kind: 'contact-form' }
  | { kind: 'question'; index: number; answers: ReflectionTheme[] }
  | { kind: 'submitting'; answers: ReflectionTheme[] }
  | { kind: 'result'; theme: ReflectionTheme }
  | { kind: 'minor-route' }
  | { kind: 'submission-error'; answers: ReflectionTheme[] }

const initialContact: ContactDetails = {
  email: '',
  name: '',
  whatsapp: '',
}

const utmKeys = ['source', 'medium', 'campaign', 'term', 'content'] as const

function getUtmParameters() {
  if (typeof window === 'undefined') {
    return {}
  }

  const searchParameters = new URLSearchParams(window.location.search)

  return Object.fromEntries(
    utmKeys.flatMap((key) => {
      const value = searchParameters.get(`utm_${key}`)?.trim()
      return value ? [[key, value.slice(0, 128)]] : []
    }),
  )
}

function createSubmissionId() {
  return window.crypto.randomUUID()
}

export function JourneyShell() {
  const [contact, setContact] = useState<ContactDetails>(initialContact)
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([])
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [view, setView] = useState<JourneyView>({ kind: 'age-gate' })
  const scope = useRef<HTMLElement>(null)
  const questionIndex = view.kind === 'question' ? view.index : -1
  const scheduleHref = getSchedulingWhatsAppHref()

  useGSAP(
    () => {
      if (
        !scope.current ||
        typeof window === 'undefined' ||
        !window.matchMedia ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ) {
        return
      }

      gsap.fromTo(
        '[data-journey-step]',
        { autoAlpha: 0, x: 16 },
        { autoAlpha: 1, duration: 0.36, ease: 'power2.out', x: 0 },
      )
    },
    {
      dependencies: [view.kind, questionIndex],
      revertOnUpdate: true,
      scope,
    },
  )

  const handleContactChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget
    setContact((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const selectTheme = (theme: ReflectionTheme, optionId: string) => {
    setView((current) => {
      if (current.kind !== 'question') {
        return current
      }

      const answers = [...current.answers]
      answers[current.index] = theme

      return { ...current, answers }
    })

    setSelectedOptionIds((current) => {
      const optionIds = [...current]
      optionIds[view.kind === 'question' ? view.index : 0] = optionId
      return optionIds
    })
  }

  const showReflection = (answers: ReflectionTheme[]) => {
    const theme = getReflectionTheme(answers)
    trackSafeEvent('journey_completed', { surface: 'journey' })
    trackSafeEvent('journey_reflection_viewed', { surface: 'result', theme })
    setView({ kind: 'result', theme })
  }

  const continueQuestion = () => {
    if (view.kind !== 'question' || view.answers[view.index] === undefined) {
      return
    }

    if (view.index === journeyQuestions.length - 1) {
      trackSafeEvent('journey_step_completed', {
        step: view.index + 1,
        surface: 'journey',
      })
      void submitJourney(view.answers)
      return
    }

    trackSafeEvent('journey_step_completed', {
      step: view.index + 1,
      surface: 'journey',
    })
    setView({ ...view, index: view.index + 1 })
  }

  const submitJourney = async (answers: ReflectionTheme[]) => {
    if (!submissionId) {
      setView({ kind: 'submission-error', answers })
      return
    }

    setView({ kind: 'submitting', answers })

    try {
      const response = await fetch('/api/percursos', {
        body: JSON.stringify({
          adult: true,
          answers,
          contactPermission: false,
          email: contact.email,
          honeypot: '',
          name: contact.name,
          purposeConsent: true,
          submissionId,
          utm: getUtmParameters(),
          whatsapp: contact.whatsapp,
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })

      if (!response.ok && response.status < 500) {
        setView({ kind: 'submission-error', answers })
        return
      }

      if (!response.ok) {
        throw new Error('Journey submission failed.')
      }

      showReflection(answers)
    } catch {
      if (process.env.NODE_ENV !== 'production') {
        showReflection(answers)
        return
      }

      setView({ kind: 'submission-error', answers })
    }
  }

  const goBack = () => {
    if (view.kind !== 'question') {
      return
    }

    if (view.index === 0) {
      setSelectedOptionIds([])
      setView({ kind: 'contact-form' })
      return
    }

    setView({ ...view, index: view.index - 1 })
  }

  let content: React.ReactNode

  if (view.kind === 'age-gate') {
    content = (
      <AgeGate
        onAdult={() => {
          trackSafeEvent('journey_started', { surface: 'journey' })
          setView({ kind: 'contact-form' })
        }}
        onMinor={() => setView({ kind: 'minor-route' })}
      />
    )
  } else if (view.kind === 'contact-form') {
    content = (
      <ContactForm
        contact={contact}
        onChange={handleContactChange}
        onContinue={() => {
          setSelectedOptionIds([])
          setSubmissionId(createSubmissionId())
          trackSafeEvent('journey_contact_submitted', { surface: 'journey' })
          setView({ kind: 'question', index: 0, answers: [] })
        }}
      />
    )
  } else if (view.kind === 'minor-route') {
    content = (
      <MinorRoute
        onSchedule={() => trackSafeEvent('whatsapp_opened', { surface: 'minor-route' })}
        scheduleHref={scheduleHref}
      />
    )
  } else if (view.kind === 'question') {
    content = (
      <JourneyQuestion
        answers={view.answers}
        onBack={goBack}
        onSelect={selectTheme}
        onSubmit={continueQuestion}
        question={journeyQuestions[view.index]}
        selectedOptionId={selectedOptionIds[view.index]}
        total={journeyQuestions.length}
      />
    )
  } else if (view.kind === 'result') {
    content = <JourneyResult scheduleHref={scheduleHref} theme={view.theme} />
  } else if (view.kind === 'submission-error') {
    content = (
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Não foi possível concluir agora</p>
        <h1>Suas respostas continuam neste dispositivo enquanto esta página estiver aberta.</h1>
        <p>Tente novamente em alguns instantes ou converse com Iasmin pelo WhatsApp.</p>
        <button
          className={styles.primaryButton}
          type="button"
          onClick={() => void submitJourney(view.answers)}
        >
          Tentar novamente
        </button>
      </div>
    )
  } else {
    content = (
      <div className={styles.intro}>
        <p>Preparando sua devolutiva.</p>
      </div>
    )
  }

  return (
    <main className={styles.page} ref={scope}>
      <header className={styles.header}>
        <Link href="/">Iasmin Portugal</Link>
        <span>Psicologia clínica</span>
      </header>
      <section className={styles.shell} data-journey-step>
        {content}
      </section>
    </main>
  )
}
