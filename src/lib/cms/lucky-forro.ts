import tracks from './lucky-forro-tracks.json'

export const forroTracks = tracks
export const forroPlaylistUrl = 'https://open.spotify.com/playlist/1BNo6bzXGqxVaECrCTVTZI'
export type ForroTrack = typeof tracks[number]

export function drawForro(previous: string[], random = Math.random): { track: ForroTrack; remaining: string[] } {
  const valid = [...new Set(previous)].filter(id => tracks.some(track => track.id === id))
  const pool = valid.length ? valid : tracks.map(track => track.id)
  const index = Math.min(pool.length - 1, Math.max(0, Math.floor(random() * pool.length)))
  const id = pool[index]
  return { track: tracks.find(track => track.id === id)!, remaining: pool.filter(item => item !== id) }
}
