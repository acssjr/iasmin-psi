'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { journeyTopics } from '@/lib/journey-content'
import { journeyTopicLabel, snapshotJourney, type JourneyRecord, type JourneyRecordSummary } from '@/lib/journey-records'
import styles from './journey-responses-panel.module.css'

type Listing = { items: JourneyRecordSummary[]; total: number; page: number; storage: 'local' | 'database' }
const date = (value: string | null) => value ? new Date(value).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bahia' }) : 'Não registrado'
export function JourneyResponsesPanel() {
  const [filters, setFilters] = useState({ search: '', topic: '', page: 1 })
  const [refresh, setRefresh] = useState(0)
  const [listing, setListing] = useState<Listing | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [record, setRecord] = useState<JourneyRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const detailHeading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    const controller = new AbortController()
    const params = selected ? new URLSearchParams({ id: selected }) : new URLSearchParams({ search: filters.search, topic: filters.topic, page: String(filters.page) })
    fetch(`/api/admin/respostas?${params}`, { cache: 'no-store', signal: controller.signal }).then(async response => {
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      if (controller.signal.aborted) return
      if (selected) setRecord(data.record); else setListing(data)
      setLoading(false)
    }).catch(failure => { if (!controller.signal.aborted) { setError(failure instanceof Error ? failure.message : 'Não foi possível consultar as respostas.'); setLoading(false) } })
    return () => controller.abort()
  }, [filters, selected, refresh])
  useEffect(() => { if (record) detailHeading.current?.focus() }, [record])
  useEffect(() => {
    if (!record) return
    const controller = new AbortController()
    fetch('/api/admin/notificacoes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: record.id }), signal: controller.signal })
      .then(response => { if (response.ok && !controller.signal.aborted) window.dispatchEvent(new Event('journey-response-viewed')) })
      .catch(() => { /* A failed receipt leaves the response unread; no false acknowledgement. */ })
    return () => controller.abort()
  }, [record])
  function begin() { setLoading(true); setError(''); setRecord(null) }
  function reload() { begin(); setRefresh(value => value + 1) }
  function open(id: string | null) { begin(); setSelected(id) }
  function turnPage(page: number) { begin(); setFilters(current => ({ ...current, page })) }
  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); begin()
    const form = new FormData(event.currentTarget)
    setFilters({ search: String(form.get('search') || '').trim(), topic: String(form.get('topic') || ''), page: 1 })
  }
  const snapshot = record?.answer_snapshot || (record?.answers ? snapshotJourney(record.journey_topic || '', record.answers, record.result_key || '', {}) : null)
  return <section className={styles.panel} aria-label="Respostas da jornada">
    <div className={styles.heading}><div><h1>Respostas da jornada</h1><p>Consulte os envios dos questionários. Horários da Bahia.</p></div><button type="button" disabled={loading} onClick={reload}>Atualizar respostas</button></div>
    {listing?.storage === 'local' && <p className={styles.notice}>Ambiente local: estes envios ficam neste computador. As respostas do site oficial dependem do banco configurado na Vercel.</p>}
    {selected ? <button type="button" className={styles.back} onClick={() => open(null)}>Voltar à lista</button> : <form className={styles.filters} onSubmit={search}>
      <label>Buscar por nome ou contato<input name="search" defaultValue={filters.search} maxLength={120} type="search" placeholder="Nome, e-mail ou WhatsApp" /></label>
      <label>Tema<select name="topic" defaultValue={filters.topic}><option value="">Todos os temas</option>{Object.values(journeyTopics).map(topic => <option key={topic.id} value={topic.id}>{topic.title}</option>)}</select></label>
      <button type="submit" disabled={loading}>Buscar</button>
    </form>}
    {error && <div role="alert" className={styles.error}><p>{error}</p><button type="button" onClick={reload}>Tentar novamente</button></div>}
    {loading && <div role="status" className={styles.loading}><p>Carregando respostas…</p><div/><div/><div/></div>}
    {!loading && !error && !selected && listing && <>
      <p className={styles.count} aria-live="polite">{listing.total} {listing.total === 1 ? 'envio encontrado' : 'envios encontrados'}</p>
      {!listing.items.length ? <div className={styles.empty}><h2>{listing.total ? 'Nenhum envio nesta página' : 'Nenhum envio encontrado'}</h2><p>{filters.search || filters.topic ? 'Altere os filtros para consultar outros envios.' : 'Os questionários concluídos aparecerão aqui. Clique em Atualizar respostas para buscar novos envios.'}</p></div> : <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th scope="col">Pessoa</th><th scope="col">Tema</th><th scope="col">Enviado em</th><th scope="col"><span className={styles.srOnly}>Detalhes</span></th></tr></thead><tbody>{listing.items.map(item => <tr key={item.id}><td><strong>{item.name || 'Nome não registrado'}</strong><span>{item.email || item.whatsapp || 'Contato não registrado'}</span></td><td><span className={styles.mobileLabel}>Tema</span>{journeyTopicLabel(item)}</td><td><span className={styles.mobileLabel}>Enviado em</span><time dateTime={item.created_at}>{date(item.created_at)}</time></td><td><button type="button" aria-label={`Ver respostas de ${item.name || 'pessoa sem nome'}`} onClick={() => open(item.id)}>Ver respostas</button></td></tr>)}</tbody></table></div>}
      {listing.total > 25 && <nav className={styles.pagination} aria-label="Páginas de respostas"><button disabled={filters.page <= 1} onClick={() => turnPage(filters.page - 1)}>Anterior</button><span>Página {filters.page} de {Math.ceil(listing.total / 25)}</span><button disabled={filters.page * 25 >= listing.total} onClick={() => turnPage(filters.page + 1)}>Próxima</button></nav>}
      <p className={styles.help}>Envios fora do prazo de retenção não são exibidos. O consentimento da jornada não autoriza contato promocional.</p>
    </>}
    {!loading && !error && record && <article className={styles.detail}>
      <h2 ref={detailHeading} tabIndex={-1}>{record.name || 'Nome não registrado'}</h2>
      <dl className={styles.metadata}>
        <div><dt>Enviado em</dt><dd>{date(record.created_at)}</dd></div><div><dt>Tema</dt><dd>{snapshot?.topic || journeyTopicLabel(record)}</dd></div>
        <div><dt>E-mail</dt><dd>{record.email ? <a href={`mailto:${encodeURIComponent(record.email)}`}>{record.email}</a> : 'Não registrado'}</dd></div><div><dt>WhatsApp</dt><dd>{record.whatsapp || 'Não registrado'}</dd></div>
      </dl>
      <h3>Respostas</h3>
      {!record.answer_snapshot && <p className={styles.notice}>Este envio não possui uma cópia dos textos da época. Quando disponíveis, as perguntas e alternativas abaixo usam a redação original do sistema; os códigos das escolhas foram preservados.</p>}
      {snapshot ? <ol className={styles.answers}>{snapshot.questions.map((answer, index) => <li key={index}><h4>{answer.question}</h4><p>{answer.answer}</p><small>Código: {answer.answerId}</small></li>)}</ol> : record.answers?.length ? <ul className={styles.answers}>{record.answers.map((answer, index) => <li key={index}>Resposta {index + 1}: {answer}</li>)}</ul> : <p>As respostas não estão mais disponíveis.</p>}
      {snapshot?.reflection && <section className={styles.reflection}><h3>{record.answer_snapshot ? 'Devolutiva registrada' : 'Devolutiva na redação original do sistema'}</h3><h4>{snapshot.reflection.title}</h4><p>{snapshot.reflection.body}</p><p>{snapshot.reflection.invitation}</p></section>}
      <h3>Registro do envio</h3><dl className={styles.metadata}><div><dt>Consentimento para a jornada</dt><dd>{date(record.purpose_consented_at)}</dd></div><div><dt>Versão do consentimento</dt><dd>{record.purpose_consent_version}</dd></div><div><dt>Retenção das respostas até</dt><dd>{date(record.answers_expires_at)}</dd></div><div><dt>Contato promocional autorizado</dt><dd>{record.contact_permission ? 'Sim' : 'Não'}</dd></div></dl>
      <p className={styles.help}>Identificador do envio: {record.id}</p>
    </article>}
  </section>
}
