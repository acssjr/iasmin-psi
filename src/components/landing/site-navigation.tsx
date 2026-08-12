'use client'

import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

import styles from './landing-page.module.css'

const navigationItems = [
  { href: '#conheca-iasmin', label: 'Conheça Iasmin', target: 'conheca-iasmin' },
  { href: '#como-funciona', label: 'Como funciona', target: 'como-funciona' },
  { href: '#percurso', label: 'Percurso', target: 'percurso' },
] as const

function scrollToSection(targetId: string) {
  const target = document.getElementById(targetId)
  if (!target) return

  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
  const smoother = window.__iasminScrollSmoother
  if (smoother) {
    smoother.scrollTo(target, true, 'top top')
    return
  }
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function SmoothSectionLink({
  children,
  className,
  target,
}: {
  children: React.ReactNode
  className?: string
  target: string
}) {
  return (
    <a
      className={className}
      href={`#${target}`}
      onClick={(event) => {
        event.preventDefault()
        scrollToSection(target)
      }}
    >
      {children}
    </a>
  )
}

export function SiteNavigation() {
  const [open, setOpen] = useState(false)
  const menu = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!menu.current) return
      const reduceMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      gsap.fromTo(
        menu.current,
        { autoAlpha: 0, y: reduceMotion ? 0 : -12 },
        { autoAlpha: 1, duration: reduceMotion ? 0 : 0.35, ease: 'power3.out', y: 0 },
      )
    },
    { dependencies: [open], scope: menu, revertOnUpdate: true },
  )

  const navigate = (target: string) => {
    setOpen(false)
    scrollToSection(target)
  }

  return (
    <>
      <nav className={styles.navigation} aria-label="Navegação principal">
        {navigationItems.map((item) => (
          <span className={styles.navigationItem} key={item.target}>
            <a
              aria-label={item.label}
              href={item.href}
              onClick={(event) => {
                event.preventDefault()
                navigate(item.target)
              }}
            >
              {item.label}
            </a>
          </span>
        ))}
      </nav>

      <button
        aria-expanded={open}
        aria-label="Abrir menu"
        className={styles.menuTrigger}
        onClick={() => setOpen(true)}
        type="button"
      >
        <span />
        <span />
      </button>

      {open && typeof document !== 'undefined' ? createPortal(
        <div aria-label="Navegação principal" className={styles.mobileMenu} ref={menu} role="dialog">
          <div className={styles.mobileMenuHeader}>
            <span>Para onde você quer ir?</span>
            <button aria-label="Fechar menu" onClick={() => setOpen(false)} type="button">
              Fechar
            </button>
          </div>
          <div className={styles.mobileMenuLinks}>
            {navigationItems.map((item) => (
              <button key={item.target} onClick={() => navigate(item.target)} type="button">
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      , document.body) : null}
    </>
  )
}
