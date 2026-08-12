'use client'

import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

import { BrandLogo } from '@/components/brand-logo'

import styles from './landing-page.module.css'

const navigationItems = [
  { href: '#conheca-iasmin', label: 'Conheça Iasmin', target: 'conheca-iasmin' },
  { href: '#como-funciona', label: 'Como funciona', target: 'como-funciona' },
  { href: '#percurso', label: 'Percurso', target: 'percurso' },
] as const

const socialItems = [
  {
    href: 'https://www.instagram.com/iasminportugalpsi/',
    label: 'Instagram de Iasmin Portugal',
    name: 'instagram',
  },
  {
    href: 'https://www.linkedin.com/',
    label: 'LinkedIn de Iasmin Portugal',
    name: 'linkedin',
  },
] as const

function SocialIcon({ name }: { name: (typeof socialItems)[number]['name'] }) {
  if (name === 'instagram') {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24">
        <rect height="17" rx="5" width="17" x="3.5" y="3.5" />
        <circle cx="12" cy="12" r="4" />
        <circle className={styles.socialIconDot} cx="17.4" cy="6.7" r="1" />
      </svg>
    )
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M6.7 8.6v9.2M6.7 5.6v.1M11 17.8v-5.2c0-2.1 4.7-2.4 4.7.5v4.7M11 8.6v9.2" />
    </svg>
  )
}

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
  const [mounted, setMounted] = useState(false)
  const menu = useRef<HTMLDivElement>(null)
  const backdrop = useRef<HTMLButtonElement>(null)

  useGSAP(
    () => {
      if (!mounted || !open || !menu.current || !backdrop.current) return
      const reduceMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      const duration = reduceMotion ? 0 : 0.42
      gsap.timeline()
        .fromTo(
          backdrop.current,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: reduceMotion ? 0 : 0.24, ease: 'power2.out' },
          0,
        )
        .fromTo(
          menu.current,
          {
            autoAlpha: 0,
            scale: reduceMotion ? 1 : 0.965,
            transformOrigin: 'top right',
            y: reduceMotion ? 0 : -10,
          },
          {
            autoAlpha: 1,
            duration,
            ease: 'power3.out',
            scale: 1,
            y: 0,
          },
          0,
        )
        .fromTo(
          '[data-mobile-menu-item]',
          { opacity: 0, y: reduceMotion ? 0 : -5 },
          {
            duration: reduceMotion ? 0 : 0.3,
            ease: 'power2.out',
            opacity: 1,
            stagger: reduceMotion ? 0 : 0.035,
            y: 0,
          },
          reduceMotion ? 0 : 0.1,
        )
    },
    { dependencies: [mounted, open], scope: menu, revertOnUpdate: false },
  )

  const closeMenu = () => {
    setOpen(false)
    if (!menu.current || !backdrop.current) {
      setMounted(false)
      return
    }

    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    gsap.timeline({ onComplete: () => setMounted(false) })
      .to(menu.current, {
        autoAlpha: 0,
        duration: reduceMotion ? 0 : 0.26,
        ease: 'power2.in',
        scale: reduceMotion ? 1 : 0.98,
        transformOrigin: 'top right',
        y: reduceMotion ? 0 : -7,
      })
      .to(
        backdrop.current,
        { autoAlpha: 0, duration: reduceMotion ? 0 : 0.2, ease: 'power2.in' },
        0,
      )
  }

  const toggleMenu = () => {
    if (open) {
      closeMenu()
      return
    }
    setMounted(true)
    setOpen(true)
  }

  const navigate = (target: string) => {
    closeMenu()
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
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        className={styles.menuTrigger}
        onClick={toggleMenu}
        type="button"
      >
        <span />
        <span />
      </button>

      {mounted && typeof document !== 'undefined' ? createPortal(
        <>
          <button
            aria-label="Fechar menu ao tocar fora"
            className={styles.mobileMenuBackdrop}
            onClick={closeMenu}
            ref={backdrop}
            type="button"
          />
          <div aria-label="Navegação principal" className={styles.mobileMenu} ref={menu} role="dialog">
            <div className={styles.mobileMenuHeader} data-mobile-menu-item>
              <span>Navegue pela página</span>
              <BrandLogo
                className={styles.mobileMenuMonogram}
                label="Iasmin Portugal"
                tone="terracotta"
                variant="monogram"
              />
            </div>
            <div className={styles.mobileMenuLinks}>
              {navigationItems.map((item) => (
                <button data-mobile-menu-item key={item.target} onClick={() => navigate(item.target)} type="button">
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            <div aria-label="Redes sociais" className={styles.mobileMenuSocials}>
              {socialItems.map((item) => (
                <a
                  aria-label={item.label}
                  data-mobile-menu-item
                  href={item.href}
                  key={item.name}
                  onClick={closeMenu}
                  rel="noreferrer"
                  target="_blank"
                >
                  <SocialIcon name={item.name} />
                </a>
              ))}
            </div>
          </div>
        </>
      , document.body) : null}
    </>
  )
}
