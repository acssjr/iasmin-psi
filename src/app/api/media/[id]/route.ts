import { readMedia } from '@/lib/cms/store'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  if (!/^[a-f0-9-]{36}$/.test(id)) return new Response(null, { status: 404 })
  try {
    const media = await readMedia(id)
    if (!media) return new Response(null, { status: 404 })
    return new Response(new Uint8Array(media.bytes), { headers: { 'Content-Type': media.mime, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'" } })
  } catch { return new Response(null, { status: 404 }) }
}
