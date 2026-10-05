'use client'

import { ContentText, ContentAnchor } from '@/components/cms/content'

import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'

import { BrandLogo } from '@/components/brand-logo'

import styles from './landing-page.module.css'
import { useHeaderDocked } from './sticky-site-header'

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
] as const

function SocialIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <rect height="17" rx="5" width="17" x="3.5" y="3.5" />
      <circle cx="12" cy="12" r="4" />
      <circle className={styles.socialIconDot} cx="17.4" cy="6.7" r="1" />
    </svg>
  )
}

function scrollToSection(targetId: string) {
  const target = document.getElementById(targetId)
  if (!target) return

  window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
  const smoother = window.__iasminScrollSmoother
  if (smoother) {
    const clearance = (document.querySelector('header')?.getBoundingClientRect().height ?? 80) + 48
    smoother.scrollTo(target, true, `top ${Math.ceil(clearance)}px`)
    return
  }
  target.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function SmoothSectionLink({
  children,
  className,
  target,
  'data-landing-brand': landingBrand,
}: {
  children: React.ReactNode
  className?: string
  target: string
  'data-landing-brand'?: boolean
}) {
  return (
    <ContentAnchor
      className={className}
      data-landing-brand={landingBrand}
      href={`#${target}`}
      onClick={(event) => {
        event.preventDefault()
        scrollToSection(target)
      }}
    >
      {children}
    </ContentAnchor>
  )
}

export function SiteNavigation() {
  const docked = useHeaderDocked()
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

      const duration = reduceMotion ? 0 : 0.64
      gsap.timeline({ defaults: { overwrite: 'auto' } })
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
            scaleX: reduceMotion ? 1 : 0.72,
            scaleY: reduceMotion ? 1 : 0.58,
            transformOrigin: docked ? 'top right' : 'top left',
            x: reduceMotion ? 0 : -8,
            y: reduceMotion ? 0 : -8,
          },
          {
            autoAlpha: 1,
            duration,
            ease: 'power4.out',
            scaleX: 1,
            scaleY: 1,
            x: 0,
            y: 0,
          },
          0,
        )
        .fromTo(
          '[data-mobile-menu-item]',
          { opacity: 0, x: reduceMotion ? 0 : -8, y: reduceMotion ? 0 : -4 },
          {
            duration: reduceMotion ? 0 : 0.36,
            ease: 'power3.out',
            opacity: 1,
            stagger: reduceMotion ? 0 : 0.045,
            x: 0,
            y: 0,
          },
          reduceMotion ? 0 : 0.16,
        )
    },
    { dependencies: [mounted], scope: menu, revertOnUpdate: false },
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
    gsap.timeline({
      onComplete: () => {
        setMounted(false)
      },
    })
      .to(menu.current, {
        autoAlpha: 0,
        duration: reduceMotion ? 0 : 0.3,
        ease: 'power3.in',
        scaleX: reduceMotion ? 1 : 0.9,
        scaleY: reduceMotion ? 1 : 0.86,
        transformOrigin: docked ? 'top right' : 'top left',
        x: reduceMotion ? 0 : -5,
        y: reduceMotion ? 0 : -5,
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
            <ContentAnchor
              aria-label={item.label}
              href={item.href}
              onClick={(event) => {
                event.preventDefault()
                navigate(item.target)
              }}
            >
              <ContentText fallback={item.label} />
            </ContentAnchor>
          </span>
        ))}
      </nav>

      <button
        aria-expanded={open}
        aria-label={open ? 'Fechar menu' : 'Abrir menu'}
        className={styles.menuTrigger}
        data-menu-trigger
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
          <div aria-label="Navegação principal" className={styles.mobileMenu} data-docked={docked} ref={menu} role="dialog">
            <div className={styles.mobileMenuHeader} data-mobile-menu-item>
              <span><ContentText fallback="Navegue pela página" /></span>
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
                  <span><ContentText fallback={item.label} /></span>
                </button>
              ))}
            </div>
            <div aria-label="Redes sociais" className={styles.mobileMenuSocials}>
              {socialItems.map((item) => (
                <ContentAnchor
                  aria-label={item.label}
                  data-mobile-menu-item
                  href={item.href}
                  key={item.name}
                  onClick={closeMenu}
                  rel="noreferrer"
                  target="_blank"
                >
                  <SocialIcon />
                </ContentAnchor>
              ))}
            </div>
          </div>
        </>
      , document.body) : null}
    </>
  )
}
