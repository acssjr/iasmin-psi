'use client'
import { useEffect, useState } from 'react'

export function useJourneyNotifications(enabled: boolean) {
  const [notification, setNotification] = useState<{ unread: number | null; unavailable: boolean }>({ unread: null, unavailable: false })
  useEffect(() => {
    if (!enabled) return
    let pending = false
    const controller = new AbortController()
    async function update() {
      if (pending || document.visibilityState === 'hidden') return
      pending = true
      try {
        const response = await fetch('/api/admin/notificacoes', { cache: 'no-store', signal: controller.signal })
        if (!response.ok) throw new Error('Indisponível')
        const data = await response.json()
        if (!controller.signal.aborted) setNotification({ unread: data.unread, unavailable: false })
      } catch { if (!controller.signal.aborted) setNotification(current => ({ ...current, unavailable: true })) }
      finally { pending = false }
    }
    void update()
    const interval = window.setInterval(update, 45000)
    window.addEventListener('focus', update)
    document.addEventListener('visibilitychange', update)
    window.addEventListener('journey-response-viewed', update)
    return () => {
      controller.abort(); clearInterval(interval)
      window.removeEventListener('focus', update)
      document.removeEventListener('visibilitychange', update)
      window.removeEventListener('journey-response-viewed', update)
    }
  }, [enabled])
  return notification
}
