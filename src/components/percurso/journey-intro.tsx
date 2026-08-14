'use client'

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
      <p className={styles.eyebrow}>Antes de começar</p>
      <h1>Este espaço foi pensado para você se escutar com calma.</h1>
      <p>
        Em cerca de cinco minutos, você percorre cinco perguntas de reflexão.
        Não há resposta certa e isso não substitui um atendimento psicológico.
      </p>
      <div className={styles.introActions}>
        <button className={styles.primaryButton} type="button" onClick={onStart}>
          Iniciar as perguntas
        </button>
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
        <p className={styles.eyebrow}>Antes das perguntas</p>
        <h1>Vamos preparar sua devolutiva?</h1>
        <p>
          Seus dados são usados para gerar esta devolutiva e, se você decidir
          conversar com Iasmin, facilitar o contato que solicitar.
        </p>
      </div>

      <label className={styles.field} htmlFor="journey-name">
        <span>Seu nome</span>
        <input
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
        <span>E-mail</span>
        <input
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
        <span>WhatsApp</span>
        <input
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
      <input className={styles.honeypot} name="website" tabIndex={-1} type="text" />
      <p className={styles.consentNotice}>
        Ao continuar, você concorda com o uso dos seus dados para gerar esta
        devolutiva e viabilizar o contato que solicitar.{' '}
        <a href="/privacidade">Saiba como seus dados são tratados.</a>
      </p>
      <button className={styles.primaryButton} type="submit">
        Começar o percurso
      </button>
    </form>
  )
}
