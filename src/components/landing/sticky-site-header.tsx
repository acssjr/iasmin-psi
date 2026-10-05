'use client'

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import styles from './landing-page.module.css'

const HeaderDockedContext = createContext(false)

export function useHeaderDocked() {
  return useContext(HeaderDockedContext)
}

export function StickySiteHeader({ children }: { children: ReactNode }) {
  const header = useRef<HTMLElement>(null)
  const [docked, setDocked] = useState(false)

  useEffect(() => {
    const element = header.current
    if (!element) return
    let frame = 0

    const measureMenu = () => {
      const trigger = element.querySelector<HTMLButtonElement>('[data-menu-trigger]')
      const action = element.querySelector<HTMLElement>('[data-header-action]')
      if (!trigger || !action) return
      // Read layout offsets, which stay stable while the button transforms.
      const shift = action.offsetLeft + action.offsetWidth - trigger.offsetLeft - trigger.offsetWidth
      trigger.style.setProperty('--menu-dock-shift', `${Math.max(0, shift)}px`)
    }
    const updateScroll = () => {
      frame = 0
      setDocked(window.scrollY > 96)
    }
    const scheduleScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(updateScroll)
    }

    measureMenu()
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(measureMenu)
    observer?.observe(element)
    const action = element.querySelector<HTMLElement>('[data-header-action]')
    if (action) observer?.observe(action)
    window.addEventListener('resize', measureMenu)
    window.addEventListener('scroll', scheduleScroll, { passive: true })
    scheduleScroll()

    return () => {
      window.cancelAnimationFrame(frame)
      observer?.disconnect()
      window.removeEventListener('resize', measureMenu)
      window.removeEventListener('scroll', scheduleScroll)
    }
  }, [])

  return (
    <HeaderDockedContext.Provider value={docked}>
      <header className={styles.siteHeader} data-docked={docked} ref={header}>
        <span className={styles.headerBackdrop} aria-hidden="true" />
        {children}
      </header>
    </HeaderDockedContext.Provider>
  )
}
