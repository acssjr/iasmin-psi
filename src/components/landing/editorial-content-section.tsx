import { TrackedLink } from '@/components/tracked-link'
import { getSchedulingWhatsAppHref } from '@/lib/whatsapp'

import { EditorialCarousel } from './editorial-carousel'
import styles from './landing-page.module.css'

const editorialCovers = [
  {
    alt: 'Reflexão de Iasmin Portugal sobre como amadurecer pode ser difícil',
    src: '/images/editorial/amadurecer.png',
  },
  {
    alt: 'Reflexão de Iasmin Portugal sobre sentimentos que não são besteira',
    src: '/images/editorial/nao-e-besteira.png',
  },
  {
    alt: 'Reflexão de Iasmin Portugal sobre a importância da comunicação',
    src: '/images/editorial/comunicacao.png',
  },
  {
    alt: 'Reflexão de Iasmin Portugal sobre o direito de sair e encerrar ciclos',
    src: '/images/editorial/sair.png',
  },
] as const

export function EditorialContentSection() {
  return (
    <section
      aria-labelledby="editorial-content-title"
      className={styles.editorialContent}
      data-editorial-section
    >
      <div className={styles.editorialContentIntro}>
        <p className={styles.sectionKicker}>Conteúdos para continuar a conversa</p>
        <h2 id="editorial-content-title">Reflexões para levar com você.</h2>
        <p>
          No Instagram, Iasmin também abre espaço para conversar sobre relações,
          mudanças, comunicação e amadurecimento com cuidado e proximidade.
        </p>
        <TrackedLink
          className={styles.editorialContentAction}
          eventName="cta_schedule_clicked"
          href={getSchedulingWhatsAppHref()}
          properties={{ surface: 'editorial' }}
        >
          Conversar com Iasmin
        </TrackedLink>
      </div>
      <EditorialCarousel covers={editorialCovers} />
    </section>
  )
}
