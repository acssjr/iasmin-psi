'use client'

import type { ChangeEvent, FormEvent } from 'react'

import styles from './journey.module.css'

export type ContactDetails = {
  contactPermission: boolean
  email: string
  name: string
  purposeConsent: boolean
  whatsapp: string
}

type ContactFormProps = {
  contact: ContactDetails
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onContinue: () => void
}

export function AgeGate({
  onAdult,
  onMinor,
}: {
  onAdult: () => void
  onMinor: () => void
}) {
  return (
    <div className={styles.intro}>
      <p className={styles.eyebrow}>Antes de começar</p>
      <h1>Este espaço foi pensado para você se escutar com calma.</h1>
      <p>
        Em cerca de cinco minutos, você percorre dez perguntas de reflexão.
        Não há resposta certa e isso não substitui um atendimento psicológico.
      </p>
      <div className={styles.ageActions}>
        <button className={styles.primaryButton} type="button" onClick={onAdult}>
          Sou maior de 18 anos
        </button>
        <button className={styles.secondaryButton} type="button" onClick={onMinor}>
          Sou menor de 18 anos
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
        <h1>Para quem enviamos sua devolutiva?</h1>
        <p>
          Seus dados são usados somente para entregar o percurso e viabilizar o
          contato que você solicitar.
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
      <label className={styles.consent} htmlFor="journey-purpose-consent">
        <input
          checked={contact.purposeConsent}
          id="journey-purpose-consent"
          name="purposeConsent"
          onChange={onChange}
          required
          type="checkbox"
        />
        <span>
          Concordo com o uso destes dados para receber esta devolutiva,
          viabilizar o contato solicitado e registrar meu consentimento.
        </span>
      </label>
      <label className={styles.consent} htmlFor="journey-contact-permission">
        <input
          checked={contact.contactPermission}
          id="journey-contact-permission"
          name="contactPermission"
          onChange={onChange}
          type="checkbox"
        />
        <span>
          Quero permitir que Iasmin mantenha meu contato para comunicações
          futuras relacionadas ao serviço. Esta escolha é opcional.
        </span>
      </label>
      <button className={styles.primaryButton} type="submit">
        Começar o percurso
      </button>
    </form>
  )
}

export function MinorRoute({ scheduleHref }: { scheduleHref: string }) {
  return (
    <div className={styles.intro}>
      <p className={styles.eyebrow}>Um cuidado com responsabilidade</p>
      <h1>Para seguir, peça que um responsável entre em contato.</h1>
      <p>
        Este percurso não coleta respostas de pessoas menores de 18 anos. Um
        responsável pode conversar com Iasmin pelo WhatsApp para entender como
        seguir.
      </p>
      <a className={styles.primaryButton} href={scheduleHref}>
        Conversar com Iasmin pelo WhatsApp
      </a>
    </div>
  )
}
