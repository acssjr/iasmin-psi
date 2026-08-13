'use client'

import type { ChangeEvent } from 'react'
import { useRef, useState } from 'react'
import Link from 'next/link'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

import { trackSafeEvent } from '@/lib/analytics'
import { JOURNEY_CONTENT_VERSION, journeyTopics } from '@/lib/journey-content'
import { getJourneyResult } from '@/lib/journey'
import { getSchedulingWhatsAppHref } from '@/lib/whatsapp'
import type { JourneyResultKey, JourneyTopicId } from '@/lib/types'

import { AgeGate, ContactForm, MinorRoute, type ContactDetails } from './journey-intro'
import { JourneyQuestion } from './journey-question'
import { JourneyResult } from './journey-result'
import { JourneyTopicSelection } from './journey-topic'
import styles from './journey.module.css'

gsap.registerPlugin(useGSAP)

type JourneyView =
  | { kind: 'age-gate' }
  | { kind: 'topic-selection' }
  | { kind: 'contact-form' }
  | { kind: 'question'; index: number }
  | { kind: 'submitting' }
  | { kind: 'result'; reflectionKey: JourneyResultKey }
  | { kind: 'minor-route' }
  | { kind: 'submission-error' }

const initialContact: ContactDetails = { email: '', name: '', whatsapp: '' }
const utmKeys = ['source', 'medium', 'campaign', 'term', 'content'] as const

function getUtmParameters() {
  if (typeof window === 'undefined') return {}
  const searchParameters = new URLSearchParams(window.location.search)
  return Object.fromEntries(utmKeys.flatMap((key) => {
    const value = searchParameters.get(`utm_${key}`)?.trim()
    return value ? [[key, value.slice(0, 128)]] : []
  }))
}

export function JourneyShell() {
  const [contact, setContact] = useState<ContactDetails>(initialContact)
  const [answers, setAnswers] = useState<string[]>([])
  const [submissionId, setSubmissionId] = useState<string | null>(null)
  const [topicId, setTopicId] = useState<JourneyTopicId | null>(null)
  const [view, setView] = useState<JourneyView>({ kind: 'age-gate' })
  const scope = useRef<HTMLElement>(null)
  const questionIndex = view.kind === 'question' ? view.index : -1
  const scheduleHref = getSchedulingWhatsAppHref()

  useGSAP(() => {
    if (!scope.current || typeof window.matchMedia !== 'function' || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.fromTo('[data-journey-step]', { autoAlpha: 0, x: 16 }, { autoAlpha: 1, duration: 0.36, ease: 'power2.out', x: 0 })
  }, { dependencies: [view.kind, questionIndex], revertOnUpdate: true, scope })

  const handleContactChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.currentTarget
    setContact((current) => ({ ...current, [name]: value }))
  }

  const submitJourney = async () => {
    if (!submissionId || !topicId) return setView({ kind: 'submission-error' })
    const resultKey = getJourneyResult(topicId, answers)
    setView({ kind: 'submitting' })
    try {
      const response = await fetch('/api/percursos', {
        body: JSON.stringify({ adult: true, answers, contentVersion: JOURNEY_CONTENT_VERSION, email: contact.email, honeypot: '', name: contact.name, purposeConsent: true, submissionId, topic: topicId, utm: getUtmParameters(), whatsapp: contact.whatsapp }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      })
      if (!response.ok && response.status < 500) return setView({ kind: 'submission-error' })
      if (!response.ok) throw new Error('Journey submission failed.')
      trackSafeEvent('journey_completed', { surface: 'journey' })
      trackSafeEvent('journey_reflection_viewed', { reflection: resultKey, surface: 'result', theme: topicId })
      setView({ kind: 'result', reflectionKey: resultKey })
    } catch {
      if (process.env.NODE_ENV !== 'production') {
        trackSafeEvent('journey_reflection_viewed', { reflection: resultKey, surface: 'result', theme: topicId })
        setView({ kind: 'result', reflectionKey: resultKey })
      }
      else setView({ kind: 'submission-error' })
    }
  }

  const continueQuestion = () => {
    if (view.kind !== 'question' || !answers[view.index] || !topicId) return
    trackSafeEvent('journey_step_completed', { step: view.index + 1, surface: 'journey' })
    if (view.index === journeyTopics[topicId].questions.length - 1) void submitJourney()
    else setView({ kind: 'question', index: view.index + 1 })
  }

  let content: React.ReactNode
  if (view.kind === 'age-gate') content = <AgeGate onAdult={() => { trackSafeEvent('journey_started', { surface: 'journey' }); setView({ kind: 'topic-selection' }) }} onMinor={() => setView({ kind: 'minor-route' })} />
  else if (view.kind === 'topic-selection') content = <JourneyTopicSelection onSelect={(selectedTopic) => { setTopicId(selectedTopic); setView({ kind: 'contact-form' }) }} />
  else if (view.kind === 'contact-form') content = <ContactForm contact={contact} onChange={handleContactChange} onContinue={() => { setAnswers([]); setSubmissionId(window.crypto.randomUUID()); trackSafeEvent('journey_contact_submitted', { surface: 'journey' }); setView({ kind: 'question', index: 0 }) }} />
  else if (view.kind === 'minor-route') content = <MinorRoute onSchedule={() => trackSafeEvent('whatsapp_opened', { surface: 'minor-route' })} scheduleHref={scheduleHref} />
  else if (view.kind === 'question' && topicId) {
    const topic = journeyTopics[topicId]
    content = <JourneyQuestion onBack={() => { if (view.index === 0) { setAnswers([]); setView({ kind: 'topic-selection' }) } else setView({ kind: 'question', index: view.index - 1 }) }} onSelect={(optionId) => setAnswers((current) => { const next = [...current]; next[view.index] = optionId; return next })} onSubmit={continueQuestion} question={topic.questions[view.index]} selectedOptionId={answers[view.index]} topicTitle={topic.title} total={topic.questions.length} />
  } else if (view.kind === 'result' && topicId) content = <JourneyResult reflectionKey={view.reflectionKey} scheduleHref={scheduleHref} topicId={topicId} />
  else if (view.kind === 'submission-error') content = <div className={styles.intro}><p className={styles.eyebrow}>Não foi possível concluir agora</p><h1>Suas respostas continuam neste dispositivo enquanto esta página estiver aberta.</h1><p>Tente novamente em alguns instantes ou converse com Iasmin pelo WhatsApp.</p><button className={styles.primaryButton} type="button" onClick={() => void submitJourney()}>Tentar novamente</button></div>
  else content = <div className={styles.intro}><p>Preparando sua devolutiva.</p></div>

  return <main className={styles.page} ref={scope}><header className={styles.header}><Link href="/">Iasmin Portugal</Link><span>Psicologia clínica</span></header><section className={styles.shell} data-journey-step>{content}</section></main>
}
