'use client'

import { ContentText, ContentAnchor, ContentInput } from '@/components/cms/content'

import type { ChangeEvent, FormEvent } from 'react'

import styles from './journey.module.css'

export type ContactDetails = {
  email: string
  name: string
  whatsapp: string
}

type ContactFormProps = {
  contact: ContactDetails
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onContinue: () => void
}

export function JourneyIntro({ onStart }: { onStart: () => void }) {
  return (
    <div className={styles.intro}>
      <p className={styles.eyebrow}><ContentText fallback="Antes de começar" /></p>
      <h1><ContentText fallback="Este espaço foi pensado para você se escutar com calma." /></h1>
      <p><ContentText fallback="Em cerca de cinco minutos, você percorre cinco perguntas de reflexão. Não há resposta certa e isso não substitui um atendimento psicológico." /></p>
      <div className={styles.introActions}>
        <button className={styles.primaryButton} type="button" onClick={onStart}><ContentText fallback="Iniciar as perguntas" /></button>
      </div>
    </div>
  )
}

export function ContactForm({ contact, onChange, onContinue }: ContactFormProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onContinue()
  }

  return (
    <form className={styles.contactForm} onSubmit={handleSubmit}>
      <div>
        <p className={styles.eyebrow}><ContentText fallback="Antes das perguntas" /></p>
        <h1><ContentText fallback="Vamos preparar sua devolutiva?" /></h1>
        <p><ContentText fallback="Seus dados são usados para gerar esta devolutiva e, se você decidir conversar com Iasmin, facilitar o contato que solicitar." /></p>
      </div>

      <label className={styles.field} htmlFor="journey-name">
        <span><ContentText fallback="Seu nome" /></span>
        <ContentInput
          autoComplete="name"
          id="journey-name"
          name="name"
          onChange={onChange}
          placeholder="Como posso te chamar?"
          required
          type="text"
          value={contact.name}
        />
      </label>
      <label className={styles.field} htmlFor="journey-email">
        <span><ContentText fallback="E-mail" /></span>
        <ContentInput
          autoComplete="email"
          id="journey-email"
          name="email"
          onChange={onChange}
          placeholder="voce@email.com"
          required
          type="email"
          value={contact.email}
        />
      </label>
      <label className={styles.field} htmlFor="journey-whatsapp">
        <span><ContentText fallback="WhatsApp" /></span>
        <ContentInput
          autoComplete="tel"
          id="journey-whatsapp"
          inputMode="tel"
          name="whatsapp"
          onChange={onChange}
          placeholder="(00) 00000-0000"
          required
          type="tel"
          value={contact.whatsapp}
        />
      </label>
      <ContentInput className={styles.honeypot} name="website" tabIndex={-1} type="text" />
      <p className={styles.consentNotice}><ContentText fallback="Ao continuar, você concorda com o uso dos seus dados para gerar esta devolutiva e viabilizar o contato que solicitar." />{' '}
        <ContentAnchor href="/privacidade"><ContentText fallback="Saiba como seus dados são tratados." /></ContentAnchor>
      </p>
      <button className={styles.primaryButton} type="submit"><ContentText fallback="Começar o percurso" /></button>
    </form>
  )
}
