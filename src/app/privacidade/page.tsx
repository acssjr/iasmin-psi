import type { Metadata } from 'next'
import Link from 'next/link'

import styles from './privacy.module.css'

export const metadata: Metadata = {
  title: 'Privacidade | Iasmin Portugal',
  description: 'Como Iasmin Portugal trata os dados do percurso de autoconhecimento.',
}

export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/">Iasmin Portugal</Link>
        <span>Psicologia clínica</span>
      </header>

      <article className={styles.article}>
        <p className={styles.eyebrow}>Privacidade e transparência</p>
        <h1>Seus dados merecem o mesmo cuidado que a sua história.</h1>
        <p className={styles.lead}>
          Esta página explica de forma direta o que é coletado no percurso de
          autoconhecimento e como essas informações são tratadas.
        </p>

        <section>
          <h2>O que é coletado</h2>
          <p>
            No percurso, são solicitados nome, e-mail, WhatsApp, as dez
            respostas de reflexão, as escolhas de consentimento e parâmetros
            de origem de campanha quando existirem. Esses dados são usados
            para entregar a devolutiva e organizar o contato que você pedir.
          </p>
        </section>

        <section>
          <h2>Como funcionam os consentimentos</h2>
          <p>
            O consentimento obrigatório permite usar os dados para entregar a
            devolutiva, viabilizar o contato solicitado e registrar essa
            escolha. A permissão para comunicações futuras é opcional. Sem
            ela, Iasmin não mantém seus dados de contato após o prazo do
            percurso.
          </p>
        </section>

        <section>
          <h2>Por quanto tempo os dados ficam guardados</h2>
          <p>
            As respostas brutas do percurso ficam disponíveis por 180 dias.
            Depois desse período, elas são anonimizadas. Se você não autorizar
            comunicações futuras, nome, e-mail e WhatsApp também são excluídos
            ao fim dos 180 dias. Se autorizar, o contato pode ser mantido até
            você pedir a exclusão.
          </p>
        </section>

        <section>
          <h2>Web Analytics sem informações sensíveis</h2>
          <p>
            O site usa eventos de navegação e de interação, como o início ou
            a conclusão do percurso. Respostas, nome, e-mail, WhatsApp e
            conteúdos digitados não são enviados ao Web Analytics.
          </p>
        </section>

        <section>
          <h2>Como pedir exclusão</h2>
          <p>
            Para pedir acesso, correção ou exclusão dos seus dados, entre em
            contato pelo WhatsApp informado nos canais de Iasmin Portugal.
            A solicitação será tratada com cuidado e confirmação de identidade.
          </p>
        </section>

        <section>
          <h2>Responsável pelo atendimento</h2>
          <p>Iasmin Portugal de Souza Costa · Psicóloga Clínica · CRP 03/33160.</p>
        </section>

        <aside className={styles.emergency}>
          <h2>Em uma urgência</h2>
          <p>
            Este site não é um canal de emergência. Em risco imediato, ligue
            192 para o SAMU ou 188 para o CVV.
          </p>
        </aside>
      </article>
    </main>
  )
}
