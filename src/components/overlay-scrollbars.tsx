'use client'

import { useEffect } from 'react'
import { OverlayScrollbars, type OverlayScrollbars as ScrollbarInstance, type PartialOptions } from 'overlayscrollbars'

const scrollbars: PartialOptions['scrollbars'] = { theme: 'os-theme-iasmin', autoHide: 'scroll', autoHideDelay: 500, autoHideSuspend: false, dragScroll: true }

// Keep the existing element as its own viewport: no wrappers around React content.
export function OverlayScrollbarSetup() {
  useEffect(() => {
    const instances = new Map<HTMLElement, ScrollbarInstance>()
    const hideTimers = new Map<HTMLElement, number>()
    let frame = 0
    const onScroll = (event: Event) => {
      const target = event.target === window || event.target === document || event.target === document.documentElement ? document.body : event.target
      if (!(target instanceof HTMLElement) || !instances.has(target)) return
      target.setAttribute('data-scroll-active', '')
      window.clearTimeout(hideTimers.get(target))
      hideTimers.set(target, window.setTimeout(() => { target.removeAttribute('data-scroll-active'); hideTimers.delete(target) }, 500))
    }
    function scan() {
      frame = 0
      for (const [element, instance] of instances) {
        if (!element.isConnected) { instance.destroy(); instances.delete(element) }
      }
      const candidates = [document.body, ...document.querySelectorAll<HTMLElement>('body *')]
      for (const element of candidates) {
        // Streamed admin content must hydrate before a library adds DOM children.
        if (instances.has(element) || element.closest('[data-scroll-ready="false"], .os-scrollbar') || element.tagName === 'TEXTAREA' || element.tagName === 'INPUT' || element.tagName === 'SELECT') continue
        const style = getComputedStyle(element)
        if (element !== document.body && !/auto|scroll/.test(`${style.overflowX} ${style.overflowY}`)) continue
        const instance = OverlayScrollbars({ target: element, elements: { viewport: element } }, {
          scrollbars,
          overflow: { x: element === document.body ? 'hidden' : 'scroll', y: 'scroll' },
        })
        // Existing instances can survive development refreshes; update their options too.
        instance.options({ scrollbars })
        instances.set(element, instance)
      }
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(scan) }
    const observer = new MutationObserver(records => {
      if (records.some(record => record.type === 'attributes' || [...record.addedNodes, ...record.removedNodes].some(node => node instanceof HTMLElement && !node.matches('.os-scrollbar, .os-scrollbar *')))) schedule()
    })
    scan()
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-scroll-ready'] })
    window.addEventListener('resize', schedule)
    window.addEventListener('scroll', onScroll, { capture: true, passive: true })
    return () => {
      observer.disconnect(); window.removeEventListener('resize', schedule); window.removeEventListener('scroll', onScroll, true); cancelAnimationFrame(frame)
      hideTimers.forEach((timer, element) => { window.clearTimeout(timer); element.removeAttribute('data-scroll-active') })
      instances.forEach(instance => instance.destroy())
    }
  }, [])
  return null
}
