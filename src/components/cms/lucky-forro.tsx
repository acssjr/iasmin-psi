'use client'

import { useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { drawForro, forroPlaylistUrl, type ForroTrack } from '@/lib/cms/lucky-forro'
import styles from './lucky-forro.module.css'
import panel from './admin-panel.module.css'
import { Modal } from './modal'

const storageKey = 'iasmin-forro-remaining-v1'
export function LuckyForro() {
  const [selected, setSelected] = useState<ForroTrack | null>(null)
  const remaining = useRef<string[] | null>(null)
  function draw() {
    if (remaining.current === null) {
      try {
        const stored: unknown = JSON.parse(localStorage.getItem(storageKey) || '[]')
        remaining.current = Array.isArray(stored) ? stored.filter((item): item is string => typeof item === 'string') : []
      } catch { remaining.current = [] }
    }
    const result = drawForro(remaining.current)
    remaining.current = result.remaining
    try { localStorage.setItem(storageKey, JSON.stringify(result.remaining)) } catch { /* Keep the draw working when storage is unavailable. */ }
    setSelected(result.track)
    // Keep navigation synchronous with the tap so iOS retains user activation.
    window.open(`https://open.spotify.com/track/${result.track.id}`, '_blank', 'noopener,noreferrer')
  }
  return <div className={styles.container}>
    <button type="button" className={styles.draw} aria-label="Estou com sorte" onClick={draw} title="Estou com sorte — sortear um forró"><span className={panel.navIcon} aria-hidden="true">🪞</span><span className={panel.navLabel} data-nav-label="">Estou com sorte</span></button>
    {selected && createPortal(<Modal title="Seu forró sorteado" onClose={() => setSelected(null)}><div className={styles.result}>
      <p role="status" aria-live="polite"><strong>{selected.title}</strong><span>{selected.artist}</span></p>
      <div className={styles.links}><a href={`spotify:track:${selected.id}`}>Abrir no aplicativo ↗</a><a href={`https://open.spotify.com/track/${selected.id}`} target="_blank" rel="noopener noreferrer">Abrir no navegador ↗</a><a href={forroPlaylistUrl} target="_blank" rel="noopener noreferrer">Ver playlist ↗</a></div>
      <small>Toque em Play no Spotify para ouvir. Se abriu apenas a tela inicial, use “Abrir no aplicativo”.</small>
    </div></Modal>, document.body)}
  </div>
}
