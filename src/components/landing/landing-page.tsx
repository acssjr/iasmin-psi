
import { ContentText, ContentAnchor } from '@/components/cms/content'
import { ContentImage as Image } from '@/components/cms/content'
import Link from 'next/link'

import { BrandLogo } from '@/components/brand-logo'
import { JourneyTransitionLink, JourneyTransitionProvider } from '@/components/journey-transition'
import { TrackedLink } from '@/components/tracked-link'
import { getSchedulingWhatsAppHref } from '@/lib/whatsapp'

import { ContextTrail } from './context-trail'
import { CustomCursor } from './custom-cursor'
import { EditorialContentSection } from './editorial-content-section'
import { FaqAccordion } from './faq-accordion'
import { FloatingWhatsAppAction } from './floating-whatsapp-action'
import { LandingMotion } from './landing-motion'
import { LandingIntro } from './landing-intro'
import { RecognitionCarousel } from './recognition-carousel'
import { SiteNavigation, SmoothSectionLink } from './site-navigation'
import styles from './landing-page.module.css'

const socialLinks = [
  {
    href: 'https://www.instagram.com/iasminportugalpsi/',
    label: 'Instagram de Iasmin Portugal',
    name: 'Instagram',
    path: 'M7.8 2h8.4A5.8 5.8 0 0 1 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8A5.8 5.8 0 0 1 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8Zm9.45 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  },
  {
    href: 'https://www.linkedin.com/',
    label: 'LinkedIn de Iasmin Portugal',
    name: 'LinkedIn',
    path: 'M5.5 3.5A2.5 2.5 0 1 1 5.5 8a2.5 2.5 0 0 1 0-4.5ZM3.5 9.5h4V21h-4V9.5Zm6.5 0h3.8v1.58h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.2c0-1.24-.02-2.84-1.73-2.84-1.73 0-2 1.35-2 2.75V21h-4V9.5Z',
  },
] as const

function SiteHeader() {
  const scheduleHref = getSchedulingWhatsAppHref()

  return (
    <header className={styles.siteHeader}>
      <SmoothSectionLink className={styles.brandLink} target="top">
        <BrandLogo className={styles.headerLogo} variant="horizontal" />
      </SmoothSectionLink>
      <SiteNavigation />
      <TrackedLink
        className={styles.headerAction}
        eventName="cta_schedule_clicked"
        href={scheduleHref}
        properties={{ surface: 'header' }}
      ><ContentText fallback="Agendar" /></TrackedLink>
    </header>
  )
}

function HeroSection() {
  const scheduleHref = getSchedulingWhatsAppHref()

  return (
    <section className={styles.hero} id="top" aria-labelledby="hero-title">
      <div className={styles.heroCopy}>
        <p className={styles.eyebrow} data-hero-eyebrow><ContentText fallback="Psicologia clínica on-line" /></p>
        <h1 id="hero-title" data-hero-title><ContentText fallback="O cuidado que faz sentido começa no seu contexto." /></h1>
        <p className={styles.intro} data-hero-copy><ContentText fallback="Um espaço de escuta para adolescentes e adultos que desejam olhar para a ansiedade, a autoestima e a aceitação com mais presença." /></p>
        <div className={styles.actions} data-hero-actions>
          <TrackedLink
            className={styles.primaryAction}
            eventName="cta_schedule_clicked"
            href={scheduleHref}
            properties={{ surface: 'hero' }}
          ><ContentText fallback="Agendar uma sessão" /></TrackedLink>
          <JourneyTransitionLink
            className={styles.secondaryAction}
            surface="hero"
          ><ContentText fallback="5 perguntas para se conhecer melhor" /></JourneyTransitionLink>
        </div>
        <ol className={styles.trailLabels} aria-label="Uma trilha de cuidado">
          <li><ContentText fallback="Contexto" /></li>
          <li><ContentText fallback="Escolhas" /></li>
          <li><ContentText fallback="Cuidado" /></li>
        </ol>
      </div>

      <figure className={styles.heroPortrait} data-hero-portrait>
        <Image
          alt="Iasmin Portugal em atendimento"
          fill
          priority
          sizes="(max-width: 899px) 100vw, 46vw"
          src="/images/iasmin/hero-terracotta.jpg"
        />
        <ContextTrail className={styles.heroTrail} motionTarget="hero" />
        <figcaption><ContentText fallback="Psicóloga clínica · Análise do Comportamento" /></figcaption>
      </figure>
    </section>
  )
}

function RecognitionSection() {
  return (
    <section className={styles.recognition} aria-labelledby="recognition-title">
      <div>
        <p className={styles.sectionKicker}><ContentText fallback="Pode ser que você se reconheça aqui" /></p>
        <h2 id="recognition-title"><ContentText fallback="Nem tudo o que pesa precisa ser carregado em silêncio." /></h2>
      </div>
      <RecognitionCarousel />
    </section>
  )
}

function AboutIasminSection() {
  return (
    <section className={styles.about} id="conheca-iasmin" aria-labelledby="about-title">
      <div className={styles.aboutPhotos}>
        <figure className={styles.aboutPrimaryPhoto}>
          <Image
            alt="Iasmin Portugal sentada ao ar livre com um livro sobre behaviorismo"
            fill
            sizes="(max-width: 899px) 88vw, 40vw"
            src="/images/iasmin/garden-reading.jpg"
          />
        </figure>
        <figure className={styles.aboutSecondaryPhoto}>
          <Image
            alt="Retrato de Iasmin Portugal com um livro sobre behaviorismo"
            fill
            sizes="(max-width: 899px) 35vw, 16vw"
            src="/images/iasmin/garden-portrait.jpg"
          />
        </figure>
      </div>
      <div className={styles.aboutCopy}>
        <div className={styles.aboutIdentity}>
          <p className={styles.sectionKicker}><ContentText fallback="Sobre mim" /></p>
          <BrandLogo
            className={styles.aboutSignature}
            decorative
            tone="terracotta"
            variant="signature"
          />
        </div>
        <h2 id="about-title"><ContentText fallback="Um cuidado que olha para a sua história inteira." /></h2>
        <p><ContentText fallback="Sou " /><strong><ContentText fallback="Iasmin Portugal" /></strong><ContentText fallback=", psicóloga clínica. No atendimento on-line, trabalho com adolescentes e adultos a partir da Análise do Comportamento." /></p>
        <p><ContentText fallback="Meu olhar parte da sua realidade, das relações que você vive e dos caminhos que já encontrou. A terapia pode ser um lugar para construir escolhas possíveis, respeitando o seu tempo." /></p>
        <dl className={styles.credentials}>
          <div>
            <dt><ContentText fallback="Atendimento" /></dt>
            <dd><ContentText fallback="On-line para todo o Brasil" /></dd>
          </div>
          <div>
            <dt><ContentText fallback="Temas de escuta" /></dt>
            <dd><ContentText fallback="Ansiedade, autoestima e aceitação" /></dd>
          </div>
          <div>
            <dt><ContentText fallback="Formação em andamento" /></dt>
            <dd><ContentText fallback="Pós-graduação em Neuropsicologia" /></dd>
          </div>
        </dl>
      </div>
    </section>
  )
}

const listeningThemes = [
  {
    title: 'Ansiedade e sobrecarga',
    copy: 'Para compreender preocupações, cansaço, pressão e o que tem ocupado espaço demais nos seus dias.',
  },
  {
    title: 'Relacionamentos e limites',
    copy: 'Para olhar para sua voz, seus vínculos e os limites que ajudam a construir relações mais honestas.',
  },
  {
    title: 'Luto, perdas e mudanças',
    copy: 'Para acolher o que mudou, respeitar o seu tempo e encontrar formas possíveis de seguir sem apagar o que foi importante.',
  },
  {
    title: 'Autoestima e autocrítica',
    copy: 'Para perceber padrões de cobrança e desenvolver uma forma mais justa e cuidadosa de se relacionar consigo.',
  },
] as const

function ListeningThemesSection() {
  return (
    <section className={styles.listeningThemes} aria-labelledby="listening-themes-title">
      <div className={styles.listeningThemesIntro}>
        <p className={styles.sectionKicker}><ContentText fallback="Temas de escuta" /></p>
        <h2 id="listening-themes-title"><ContentText fallback="Temas que podem encontrar espaço na terapia." /></h2>
        <p><ContentText fallback="A abordagem clínica é a Análise do Comportamento. A partir dela, o cuidado considera sua história, seus contextos e o que você vive hoje." /></p>
      </div>
      <ol className={styles.listeningThemesList}>
        {listeningThemes.map((theme, index) => (
          <li key={theme.title}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div>
              <h3><ContentText fallback={theme.title} /></h3>
              <p><ContentText fallback={theme.copy} /></p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}

const carePillars = [
  {
    number: '01',
    title: 'Compreender seus contextos',
    copy: 'Olhar para o que acontece ao redor, para as relações e para os aprendizados que fazem parte da sua experiência.',
  },
  {
    number: '02',
    title: 'Construir caminhos possíveis',
    copy: 'Explorar alternativas que façam sentido para a vida real, sem fórmulas prontas e sem promessas vazias.',
  },
  {
    number: '03',
    title: 'Respeitar o seu ritmo',
    copy: 'Criar um espaço em que você possa se aproximar de si com mais cuidado e autonomia.',
  },
]

function CarePillarsSection() {
  return (
    <section className={styles.care} id="como-funciona" data-care-section aria-labelledby="care-title">
      <div className={styles.careIntro}>
        <p className={styles.sectionKicker}><ContentText fallback="Uma escuta situada" /></p>
        <h2 id="care-title"><ContentText fallback="Cuidar também é entender o que acontece antes, durante e depois." /></h2>
        <p><ContentText fallback="A Análise do Comportamento parte da ideia de que cada pessoa tem uma trajetória e um contexto. Na terapia, isso ajuda a criar caminhos mais possíveis para a sua vida." /></p>
      </div>
      <div className={styles.carePath}>
        <ContextTrail className={styles.careTrail} motionTarget="care" />
        <ol className={styles.carePillars}>
          {carePillars.map((pillar) => (
            <li key={pillar.number} className={styles.carePillar} data-care-pillar>
              <span className={styles.pillarNumber}>{pillar.number}</span>
              <div>
                <h3><ContentText fallback={pillar.title} /></h3>
                <p><ContentText fallback={pillar.copy} /></p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function JourneyTeaserSection() {
  return (
    <section className={styles.journeyTeaser} id="percurso" aria-labelledby="journey-title">
      <div>
        <p className={styles.sectionKicker}><ContentText fallback="Um primeiro passo possível" /></p>
        <h2 id="journey-title"><ContentText fallback="Uma pausa guiada para olhar para você." /></h2>
      </div>
      <div className={styles.journeySurface}>
        <span className={styles.journeyCount}><ContentText fallback="5 perguntas" /></span>
        <p><ContentText fallback="O percurso convida você a observar algumas situações do cotidiano e recebe uma devolutiva de reflexão ao final." /></p>
        <p className={styles.boundaryCopy}><ContentText fallback="O percurso não é uma avaliação psicológica e não substitui a psicoterapia." /></p>
        <JourneyTransitionLink
          className={styles.primaryAction}
          surface="journey-teaser"
        ><ContentText fallback="Iniciar o percurso" /></JourneyTransitionLink>
      </div>
    </section>
  )
}

const faqItems = [
  {
    question: 'Como funciona a terapia on-line?',
    answer: 'As sessões acontecem por videochamada, em um ambiente reservado. No primeiro contato, você pode tirar dúvidas sobre disponibilidade, frequência e como começar.',
  },
  {
    question: 'Iasmin atende quais públicos?',
    answer: 'Realizo atendimentos para adolescentes e adultos em todo o Brasil.',
  },
  {
    question: 'O que é o percurso de autoconhecimento?',
    answer: 'É uma experiência breve de reflexão com cinco perguntas. Ele não faz diagnóstico e não substitui um atendimento psicológico.',
  },
  {
    question: 'Como posso agendar uma sessão?',
    answer: 'Você pode clicar em “Agendar uma sessão” para falar comigo pelo WhatsApp e entender os próximos passos.',
  },
]

function FaqSection() {
  return (
    <section className={styles.faq} aria-labelledby="faq-title">
      <div>
        <p className={styles.sectionKicker}><ContentText fallback="Perguntas frequentes" /></p>
        <h2 id="faq-title"><ContentText fallback="Talvez você queira saber." /></h2>
      </div>
      <FaqAccordion items={faqItems} />
    </section>
  )
}

function ClosingSection() {
  const scheduleHref = getSchedulingWhatsAppHref()

  return (
    <section className={styles.closing} id="agendar" aria-labelledby="closing-title">
      <p className={styles.sectionKicker}><ContentText fallback="Quando fizer sentido" /></p>
      <h2 id="closing-title"><ContentText fallback="Você não precisa ter tudo resolvido para começar." /></h2>
      <p><ContentText fallback="Podemos conversar sobre o que você está vivendo e entender, com calma, se este é um bom momento para iniciar a terapia." /></p>
      <div className={styles.actions}>
        <TrackedLink
          className={styles.primaryAction}
          eventName="cta_schedule_clicked"
          href={scheduleHref}
          properties={{ surface: 'closing' }}
        ><ContentText fallback="Agendar uma sessão" /></TrackedLink>
      </div>
    </section>
  )
}

function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <BrandLogo className={styles.footerLogo} tone="cream" variant="full" />
        <p><ContentText fallback="Iasmin Portugal de Souza Costa · Psicóloga Clínica · CRP 03/33160" /></p>
      </div>
      <div className={styles.footerLinks}>
        <SmoothSectionLink target="conheca-iasmin"><ContentText fallback="Conheça Iasmin" /></SmoothSectionLink>
        <SmoothSectionLink target="como-funciona"><ContentText fallback="Como funciona" /></SmoothSectionLink>
        <SmoothSectionLink target="percurso"><ContentText fallback="Percurso" /></SmoothSectionLink>
        <Link href="/privacidade"><ContentText fallback="Privacidade" /></Link>
      </div>
      <div className={styles.socialLinks} aria-label="Redes sociais">
        {socialLinks.map((social) => (
          <ContentAnchor
            aria-label={social.label}
            href={social.href}
            key={social.name}
            rel="noreferrer"
            target="_blank"
          >
            <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
              <path d={social.path} />
            </svg>
            <span>{social.name}</span>
          </ContentAnchor>
        ))}
      </div>
      <p className={styles.emergencyNotice}><ContentText fallback="Este site não é um canal de emergência. Em risco imediato, ligue 192 para o SAMU ou 188 para o CVV." /></p>
      <p className={styles.copyright}><ContentText fallback="© " />{new Date().getFullYear()}<ContentText fallback=" Iasmin Portugal. Todos os direitos reservados." /></p>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <>
    <LandingIntro />
    <JourneyTransitionProvider>
    <div className={styles.page}>
      <CustomCursor />
      <LandingMotion>
        <div data-smooth-content>
          <SiteHeader />
          <main>
            <HeroSection />
            <RecognitionSection />
            <AboutIasminSection />
            <CarePillarsSection />
            <ListeningThemesSection />
            <EditorialContentSection />
            <JourneyTeaserSection />
            <FaqSection />
            <ClosingSection />
          </main>
          <SiteFooter />
        </div>
      </LandingMotion>
      <FloatingWhatsAppAction />
    </div>
    </JourneyTransitionProvider>
    </>
  )
}
