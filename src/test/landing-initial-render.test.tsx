import { StrictMode } from 'react'
import { cleanup, render } from '@testing-library/react'
import { renderToString } from 'react-dom/server'
import { afterEach, expect, it, vi } from 'vitest'

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
})

it.each(['mobile', 'desktop'])('keeps server-rendered hero content visible during %s hydration', async (viewport) => {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: query.includes(viewport === 'mobile' ? 'max-width: 959px' : 'min-width: 960px'),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
  const { LandingMotion } = await import('@/components/landing/landing-motion')
  const content = (
    <StrictMode>
      <LandingMotion>
        <main>
          <section>
            <p data-hero-eyebrow>Psicologia clínica on-line</p>
            <h1 data-hero-title>O cuidado começa no seu contexto.</h1>
            <p data-hero-copy>Um espaço de escuta.</p>
            <div data-hero-actions><a href="#agendar">Agendar</a></div>
            <figure data-hero-portrait>Retrato de Iasmin</figure>
          </section>
        </main>
      </LandingMotion>
    </StrictMode>
  )
  const container = document.createElement('div')
  container.innerHTML = renderToString(content)
  document.body.append(container)
  const originalTitle = container.querySelector('h1')

  render(content, { container, hydrate: true })

  expect(container.querySelector('h1')).toBe(originalTitle)
  for (const element of container.querySelectorAll('section > *')) {
    const style = getComputedStyle(element)
    expect(style.visibility).not.toBe('hidden')
    expect(Number(style.opacity || '1')).toBe(1)
    expect(style.transform === '' || style.transform === 'none').toBe(true)
    expect(style.clipPath === '' || style.clipPath === 'none').toBe(true)
  }
})
