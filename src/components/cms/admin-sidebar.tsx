'use client'

import Link from 'next/link'
import { useRef, useSyncExternalStore, type MouseEvent } from 'react'
import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { BrandLogo } from '@/components/brand-logo'
import { LuckyForro } from './lucky-forro'
import styles from './admin-panel.module.css'

gsap.registerPlugin(useGSAP, CustomEase)
CustomEase.create('admin-navigation-out', '0.23,1,0.32,1')
const preferenceKey = 'iasmin-admin-sidebar'
let runtimePreference: boolean | null = null
function subscribe(callback: () => void) {
  const storage = () => { runtimePreference = null; callback() }
  window.addEventListener('resize', callback)
  window.addEventListener('storage', storage)
  window.addEventListener('admin-sidebar-toggle', callback)
  return () => { window.removeEventListener('resize', callback); window.removeEventListener('storage', storage); window.removeEventListener('admin-sidebar-toggle', callback) }
}
function snapshot() {
  if (window.innerWidth < 768) return false
  let preferred: string | null = null
  try { preferred = localStorage.getItem(preferenceKey) } catch { /* Use the responsive default when storage is blocked. */ }
  return preferred === 'collapsed' ? true : preferred === 'expanded' ? false : runtimePreference ?? window.innerWidth < 1200
}
export function useAdminSidebar() {
  const compact = useSyncExternalStore(subscribe, snapshot, () => false)
  const shell = useRef<HTMLDivElement>(null)
  const animateNext = useRef(false)
  const previousWidth = useRef<number | null>(null)
  useGSAP(() => {
    const node = shell.current
    if (!node) return
    const sidebar = node.querySelector<HTMLElement>('[data-admin-sidebar]')
    const workspace = node.querySelector<HTMLElement>('[data-admin-workspace]')
    if (!sidebar || !workspace) return
    const mobile = window.innerWidth < 768
    const width = mobile ? 0 : compact ? 80 : 248
    const duration = animateNext.current && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && !mobile ? .26 : 0
    const labels = sidebar.querySelectorAll('[data-nav-label]')
    const full = sidebar.querySelector('[data-brand-full]'), monogram = sidebar.querySelector('[data-brand-monogram]')
    const background = sidebar.querySelector('[data-sidebar-background]')
    gsap.killTweensOf([workspace, background, full, monogram, ...labels])
    if (previousWidth.current !== null && duration) {
      const currentX = Number(gsap.getProperty(workspace, 'x')) || 0
      gsap.set(workspace, { x: previousWidth.current + currentX - width })
    } else gsap.set(workspace, { x: 0 })
    const timeline = gsap.timeline({ defaults: { duration, ease: 'admin-navigation-out' } })
    timeline.to(workspace, { x: 0, clearProps: 'transform' }, 0)
      .to(background, { scaleX: compact && !mobile ? 80 / 248 : 1, transformOrigin: 'left center' }, 0)
      .to(labels, { autoAlpha: compact && !mobile ? 0 : 1, x: compact && !mobile ? -8 : 0 }, 0)
      .to(full, { autoAlpha: compact && !mobile ? 0 : 1, x: compact && !mobile ? -8 : 0 }, 0)
      .to(monogram, { autoAlpha: compact && !mobile ? 1 : 0, scale: compact && !mobile ? 1 : .95 }, 0)
    previousWidth.current = width; animateNext.current = false
  }, { scope: shell, dependencies: [compact] })
  function toggle(event: MouseEvent<HTMLButtonElement>) {
    animateNext.current = event.detail !== 0
    runtimePreference = !compact
    try { localStorage.setItem(preferenceKey, !compact ? 'collapsed' : 'expanded') } catch { /* The in-memory choice remains available. */ }
    window.dispatchEvent(new Event('admin-sidebar-toggle'))
  }
  return { compact, shell, toggle }
}
export function AdminIcon({ name }: { name: string }) {
  const paths: Record<string, React.ReactNode> = {
    visual: <><path d="m14 4 6 6M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15z"/></>,
    overview: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    content: <><path d="M4 6h16M4 12h16M4 18h16"/><circle cx="8" cy="6" r="2"/><circle cx="16" cy="12" r="2"/><circle cx="10" cy="18" r="2"/></>,
    media: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 4-6 5 7"/></>,
    history: <><path d="M3 10a9 9 0 1 1 2 8M3 4v6h6M12 7v5l3 2"/></>,
    responses: <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    users: <><circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6M17 13a5 5 0 0 1 4 5v3"/></>,
    account: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="9" r="3"/><path d="M5 18a7 7 0 0 1 14 0"/></>,
    external: <><path d="M14 3h7v7M21 3l-11 11M10 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5"/></>,
    logout: <><path d="M9 4H4v16h5M9 12h12M17 8l4 4-4 4"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  }
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>
}
export function AdminSidebar({ compact, toggle, mobileOpen, onClose, view, navigate, admin, busy, onLogout }: {
  compact: boolean; toggle: (event: MouseEvent<HTMLButtonElement>) => void; mobileOpen: boolean; onClose: () => void
  view: string; navigate: (view: string) => void; admin: boolean; busy: boolean; onLogout: () => void
}) {
  const links = [['visual','Editar no site'],['overview','Visão geral'],['content','Edição avançada'],['media','Biblioteca de imagens'],['history','Histórico de versões'],...(admin ? [['responses','Respostas da jornada'],['users','Usuários']] : []),['account','Minha conta']]
  return <aside id="admin-navigation" data-admin-sidebar="" className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ''}`}>
    <div className={styles.sidebarBackground} data-sidebar-background="" aria-hidden="true"/>
    <button className={styles.navClose} aria-label="Fechar navegação" onClick={onClose}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="m6 6 12 12M18 6 6 18"/></svg></button>
    <Link className={styles.sidebarBrand} href="/" aria-label="Iasmin Portugal — abrir site"><span data-brand-full=""><BrandLogo variant="horizontal" decorative/></span><span data-brand-monogram=""><BrandLogo variant="monogram" decorative/></span></Link>
    <button className={styles.collapseToggle} type="button" aria-label={compact ? 'Expandir menu de gestão' : 'Recolher menu de gestão'} aria-expanded={!compact} aria-controls="admin-navigation" title={compact ? 'Expandir menu' : 'Recolher menu'} onClick={toggle}><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/><path d={compact ? 'm13 9 3 3-3 3' : 'm16 9-3 3 3 3'}/></svg></button>
    <p className={styles.sidebarCaption} data-nav-label="">Espaço de gestão</p>
    <nav aria-label="Navegação do painel">{links.map(([key,label]) => <button key={key} aria-label={label} title={compact ? label : undefined} aria-current={view === key ? 'page' : undefined} onClick={() => navigate(key)}><span className={styles.navIcon}><AdminIcon name={key}/></span><span className={styles.navLabel} data-nav-label="">{label}</span></button>)}<LuckyForro /></nav>
    <div className={styles.sidebarBottom}><a href="/" target="_blank" rel="noreferrer" aria-label="Abrir site em outra aba" title={compact ? 'Abrir site' : undefined}><AdminIcon name="external"/><span data-nav-label="">Abrir site</span></a><button disabled={busy} aria-label="Sair da conta" title={compact ? 'Sair da conta' : undefined} onClick={onLogout}><AdminIcon name="logout"/><span data-nav-label="">Sair da conta</span></button></div>
  </aside>
}
