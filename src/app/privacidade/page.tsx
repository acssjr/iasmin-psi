
import { ContentText, ContentAnchor } from '@/components/cms/content'
import type { Metadata } from 'next'
import Link from 'next/link'

import { getPrivacyWhatsAppHref } from '@/lib/whatsapp'
import { publicContent } from '@/lib/cms/store'
import { resolveContent } from '@/lib/cms/catalog'

import styles from './privacy.module.css'

export async function generateMetadata(): Promise<Metadata> {
  const values = await publicContent()
  return {
  title: resolveContent(values, 'Privacidade | Iasmin Portugal'),
  description: resolveContent(values, 'Como Iasmin Portugal trata os dados do percurso de autoconhecimento.'),
  }
}

export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/"><ContentText fallback="Iasmin Portugal" /></Link>
        <span><ContentText fallback="Psicologia clínica" /></span>
      </header>

      <article className={styles.article}>
        <p className={styles.eyebrow}><ContentText fallback="Privacidade e transparência" /></p>
        <h1><ContentText fallback="Seus dados merecem o mesmo cuidado que a sua história." /></h1>
        <p className={styles.lead}><ContentText fallback="Esta página explica de forma direta o que é coletado no percurso de autoconhecimento e como essas informações são tratadas." /></p>

        <section>
          <h2><ContentText fallback="O que é coletado" /></h2>
          <p><ContentText fallback="No percurso, são solicitados nome, e-mail, WhatsApp, o tema escolhido, os identificadores das cinco respostas de reflexão, o registro de consentimento e parâmetros de origem de campanha quando existirem. Esses dados são usados para gerar a devolutiva e organizar o contato que você pedir." /></p>
        </section>

        <section>
          <h2><ContentText fallback="Uma experiência de reflexão" /></h2>
          <p><ContentText fallback="O percurso apresenta perguntas de autoconhecimento e uma devolutiva acolhedora. Ele não realiza diagnóstico nem avaliação psicológica e não substitui a psicoterapia ou outro cuidado profissional." /></p>
        </section>

        <section>
          <h2><ContentText fallback="Como funciona o consentimento" /></h2>
          <p><ContentText fallback="Ao iniciar o percurso, você concorda com o uso dos dados para gerar a devolutiva, viabilizar o contato solicitado e registrar essa manifestação. O site não solicita autorização para comunicações futuras." /></p>
        </section>

        <section>
          <h2><ContentText fallback="Por quanto tempo os dados ficam guardados" /></h2>
          <p><ContentText fallback="As respostas brutas do percurso ficam disponíveis por 180 dias. Depois desse período, elas são anonimizadas. Nome, e-mail e WhatsApp também são excluídos ao fim dos 180 dias, ou antes, se você pedir a exclusão." /></p>
        </section>

        <section>
          <h2><ContentText fallback="Web Analytics sem informações sensíveis" /></h2>
          <p><ContentText fallback="O site usa eventos de navegação e de interação, como o início ou a conclusão do percurso. Respostas, nome, e-mail, WhatsApp e conteúdos digitados não são enviados ao Web Analytics." /></p>
        </section>

        <section>
          <h2><ContentText fallback="Como pedir exclusão" /></h2>
          <p><ContentText fallback="Para pedir acesso, correção ou exclusão dos seus dados, entre em contato diretamente pelo WhatsApp. A solicitação será tratada com cuidado e confirmação de identidade." />{' '}
            <ContentAnchor className={styles.privacyLink} href={getPrivacyWhatsAppHref()}><ContentText fallback="Falar sobre privacidade pelo WhatsApp" /></ContentAnchor>
          </p>
        </section>

        <section>
          <h2><ContentText fallback="Responsável pelo atendimento" /></h2>
          <p><ContentText fallback="Iasmin Portugal de Souza Costa · Psicóloga Clínica · CRP 03/33160." /></p>
        </section>

        <aside className={styles.emergency}>
          <h2><ContentText fallback="Em uma urgência" /></h2>
          <p><ContentText fallback="Este site não é um canal de emergência. Em risco imediato, ligue 192 para o SAMU ou 188 para o CVV." /></p>
        </aside>
      </article>
    </main>
  )
}
