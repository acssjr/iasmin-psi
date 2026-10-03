import definitions from './catalog.json'

export type ContentValues = Record<string, string>
export const fields = definitions as { id: string; group: string; label: string; kind: string; default: string }[]
export const fieldByDefault = new Map(fields.map(field => [field.default, field]))
export const defaults: ContentValues = Object.fromEntries(fields.map(field => [field.id, field.default]))
export function resolveContent(values: ContentValues, fallback: string): string {
  const field = fieldByDefault.get(fallback.trim().replace(/\s+/g, ' '))
    || (fallback.startsWith('https://wa.me/') ? fields.find(item => item.kind === 'url' && item.default.startsWith('https://wa.me/') && item.default.split('?')[1] === fallback.split('?')[1]) : undefined)
  const key = field?.id
  if (!key || values[key] === undefined) return fallback
  if (fallback.startsWith('https://wa.me/') && field && values[key] === field.default) return fallback
  const leading = fallback.startsWith(' ') ? ' ' : ''
  const trailing = fallback.endsWith(' ') ? ' ' : ''
  return leading + values[key] + trailing
}
export function validateContent(input: unknown): ContentValues {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Conteúdo inválido.')
  const values = input as ContentValues
  const output: ContentValues = {}
  for (const field of fields) {
    const value = values[field.id]
    if (typeof value !== 'string' || !value.trim() || value.length > (field.kind === 'faq' || field.kind === 'gallery' ? 50000 : 6000)) throw new Error(`Revise o campo: ${field.label}.`)
    if (field.kind === 'image' && !/^\/(?:images|brand)\/[a-zA-Z0-9/_.-]+$|^\/api\/media\/[a-f0-9-]{36}$/.test(value)) throw new Error('Selecione uma imagem da biblioteca.')
    if (field.kind === 'url') {
      let url: URL
      try { url = new URL(value) } catch { throw new Error('Informe um endereço completo com https://.') }
      if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Use um endereço seguro com https://.')
    }
    if (field.kind === 'position' && !/^(left|center|right) (top|center|bottom)$/.test(value)) throw new Error('Escolha um enquadramento válido.')
    if (field.kind === 'faq') {
      let items: { question: string; answer: string }[]
      try { items = JSON.parse(value) } catch { throw new Error('Revise as perguntas frequentes.') }
      if (!Array.isArray(items) || items.length < 1 || items.length > 20 || items.some(item => !item || typeof item.question !== 'string' || !item.question.trim() || item.question.length > 250 || typeof item.answer !== 'string' || !item.answer.trim() || item.answer.length > 2000)) throw new Error('Preencha pergunta e resposta de todos os itens (até 20 perguntas).')
    }
    if (field.kind === 'gallery') {
      let items: { src: string; alt: string }[]
      try { items = JSON.parse(value) } catch { throw new Error('Revise as imagens da galeria.') }
      if (!Array.isArray(items) || items.length < 1 || items.length > 12 || items.some(item => !item || typeof item.alt !== 'string' || !item.alt.trim() || item.alt.length > 300 || typeof item.src !== 'string' || !/^\/(?:images|brand)\/[a-zA-Z0-9/_.-]+$|^\/api\/media\/[a-f0-9-]{36}$/.test(item.src))) throw new Error('Escolha de 1 a 12 imagens com uma descrição para cada uma.')
    }
    output[field.id] = value.trim()
  }
  return output
}
export function validateMediaReferences(values: ContentValues, mediaIds: Set<string>) {
  const originals = new Set(fields.filter(field=>field.kind==='image').map(field=>field.default))
  for (const field of fields.filter(field=>field.kind==='gallery')) {
    for (const item of JSON.parse(field.default) as {src:string}[]) originals.add(item.src)
  }
  const sources = fields.flatMap(field => field.kind === 'image' ? [values[field.id]] : field.kind === 'gallery' ? (JSON.parse(values[field.id]) as {src:string}[]).map(item=>item.src) : [])
  for (const source of sources) {
    if (source.startsWith('/api/media/') ? !mediaIds.has(source.slice('/api/media/'.length)) : !originals.has(source)) throw new Error('Uma imagem do conteúdo não está nesta biblioteca. Envie o arquivo e selecione-o novamente.')
  }
}
