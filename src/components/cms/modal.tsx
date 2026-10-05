'use client'

import { useEffect, useId, useRef, type ReactNode } from 'react'
import styles from './admin-panel.module.css'

let locks = 0
let restoreScroll: (() => void) | undefined
function lockBackground() {
  if (locks++ === 0) {
    const body = document.body, html = document.documentElement
    const x = window.scrollX, y = window.scrollY
    const previous = { position: body.style.position, top: body.style.top, left: body.style.left, width: body.style.width, overflow: html.style.overflow }
    body.style.position = 'fixed'; body.style.top = `${-y}px`; body.style.left = `${-x}px`; body.style.width = '100%'; html.style.overflow = 'hidden'
    restoreScroll = () => {
      Object.assign(body.style, { position: previous.position, top: previous.top, left: previous.left, width: previous.width })
      html.style.overflow = previous.overflow
      window.scrollTo({ left: x, top: y, behavior: 'instant' })
    }
  }
  return () => { if (--locks === 0) { restoreScroll?.(); restoreScroll = undefined } }
}

export function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null)
  const outside = useRef(false)
  const headingId = useId()
  useEffect(() => {
    const node = dialog.current
    if (!node) return
    const unlock = lockBackground()
    node.showModal()
    return () => { node.close(); unlock() }
  }, [])
  const isOutside = (x: number, y: number) => {
    const rect = dialog.current!.getBoundingClientRect()
    return x < rect.left || x > rect.right || y < rect.top || y > rect.bottom
  }
  return <dialog ref={dialog} aria-labelledby={headingId} className={`${styles.modal} ${wide ? styles.modalWide : ''}`}
    onCancel={event => { event.preventDefault(); onClose() }}
    onPointerDown={event => { outside.current = event.target === event.currentTarget && isOutside(event.clientX, event.clientY) }}
    onPointerUp={event => { if (outside.current && event.target === event.currentTarget && isOutside(event.clientX, event.clientY)) onClose(); outside.current = false }}>
    <div className={styles.modalHeader}><h2 id={headingId}>{title}</h2><button type="button" onClick={onClose} aria-label="Fechar janela"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" /></svg></button></div>
    <div className={styles.modalBody}>{children}</div>
  </dialog>
}
