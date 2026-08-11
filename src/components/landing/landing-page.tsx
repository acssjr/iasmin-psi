import Image from 'next/image'

import styles from './landing-page.module.css'

export default function LandingPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Psicologia clínica on-line</p>
          <h1 id="hero-title">
            O cuidado que faz sentido começa no seu contexto.
          </h1>
          <p className={styles.intro}>
            Um espaço de escuta para adolescentes e adultos que desejam olhar
            para a ansiedade, a autoestima e a aceitação com mais presença.
          </p>
          <div className={styles.actions}>
            <a className={styles.primaryAction} href="#agendar">
              Agendar uma sessão
            </a>
            <a className={styles.secondaryAction} href="/percurso">
              Iniciar meu percurso de autoconhecimento
            </a>
          </div>
        </div>

        <figure className={styles.heroPortrait}>
          <Image
            alt="Iasmin Portugal em atendimento"
            fill
            priority
            sizes="(max-width: 899px) 100vw, 46vw"
            src="/images/iasmin/hero-terracotta.jpg"
          />
          <figcaption>Psicóloga clínica · Análise do Comportamento</figcaption>
        </figure>
      </section>
    </main>
  )
}
