import { randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { authenticated, sameOrigin } from '@/lib/cms/auth'
import { mutateState, saveMedia } from '@/lib/cms/store'

export const runtime = 'nodejs'
export async function POST(request: Request) {
  try {
    sameOrigin(request)
    if (!await authenticated()) return NextResponse.json({ error: 'Sua sessão expirou. Entre novamente.' }, { status: 401 })
    if (Number(request.headers.get('content-length') || 0) > 3_200_000) throw new Error('A imagem deve ter até 3 MB.')
    const form = await request.formData(), file = form.get('file')
    const expectedRevision = Number(form.get('revision'))
    if (!(file instanceof File) || file.size > 3_000_000 || file.size === 0) throw new Error('Selecione uma imagem de até 3 MB.')
    const bytes = Buffer.from(await file.arrayBuffer())
    const mime = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) ? 'image/png'
      : bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255 ? 'image/jpeg'
      : bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP' ? 'image/webp' : null
    if (!mime) throw new Error('Envie uma imagem JPG, PNG ou WebP válida.')
    const id = randomUUID(), media = { id, name: file.name.slice(0, 120), type: mime, size: bytes.length, date: new Date().toISOString() }
    await saveMedia(id, mime, bytes)
    const snapshot = await mutateState(state => {
      if (expectedRevision !== state.revision) throw new Error('O conteúdo mudou em outra janela. Atualize o painel antes de enviar a imagem.')
      state.media.unshift(media)
      return { revision: state.revision + 1, draft: state.draft, published: state.published, publishedAt: state.publishedAt, history: state.history, media: state.media, email: state.account?.email }
    })
    return NextResponse.json({ media, snapshot }, { status: 201 })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Falha ao enviar imagem.' }, { status: 400 }) }
}
