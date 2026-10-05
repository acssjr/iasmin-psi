import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { drawForro, forroTracks } from '@/lib/cms/lucky-forro'
import { LuckyForro } from '@/components/cms/lucky-forro'

afterEach(() => { cleanup(); vi.restoreAllMocks() })
it('draws all 37 verified tracks without repetition and then begins a new round', () => {
  let remaining: string[] = []
  const drawn: string[] = []
  for (let index = 0; index < 37; index++) {
    const result = drawForro(remaining, () => .5)
    drawn.push(result.track.id); remaining = result.remaining
  }
  expect(new Set(drawn).size).toBe(37)
  expect(remaining).toEqual([])
  expect(drawForro(remaining).remaining).toHaveLength(36)
  expect(forroTracks.every(track => /^[a-zA-Z0-9]{22}$/.test(track.id))).toBe(true)
})
it('discards invalid and duplicate saved IDs', () => {
  const result = drawForro(['bad', forroTracks[0].id, forroTracks[0].id])
  expect(result.track.id).toBe(forroTracks[0].id)
  expect(result.remaining).toEqual([])
})
it('opens the selected HTTPS track synchronously and provides a matching app fallback', () => {
  const open = vi.spyOn(window, 'open').mockReturnValue(null)
  render(<LuckyForro />)
  fireEvent.click(screen.getByRole('button', { name: 'Estou com sorte' }))
  const web = screen.getByRole('link', { name: /Abrir no navegador/ }).getAttribute('href')!
  expect(open).toHaveBeenCalledWith(web, '_blank', 'noopener,noreferrer')
  expect(screen.getByRole('link', { name: /Abrir no aplicativo/ })).toHaveAttribute('href', `spotify:track:${web.split('/').pop()}`)
  fireEvent.click(screen.getByRole('button', { name: 'Estou com sorte' }))
  expect(open.mock.calls[1][0]).not.toBe(open.mock.calls[0][0])
})
