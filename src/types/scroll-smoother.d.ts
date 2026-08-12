import type { ScrollSmoother } from 'gsap/ScrollSmoother'

declare global {
  interface Window {
    __iasminScrollSmoother?: ScrollSmoother
  }
}

export {}
