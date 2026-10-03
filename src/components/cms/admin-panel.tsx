'use client'

/* Admin thumbnails preserve the original framing; public pages use next/image. */
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useId, type FormEvent } from 'react'
import { fields, defaults, type ContentValues } from '@/lib/cms/catalog'
import type { Media, Version } from '@/lib/cms/store'
import { BrandLogo } from '@/components/brand-logo'
import styles from './admin-panel.module.css'

type Snapshot = { revision: number; draft: ContentValues; published: ContentValues; publishedAt: string | null; history: Version[]; media: Media[]; email?: string }
type Mode = 'editor' | 'login' | 'setup' | 'unavailable'
const groupOrder = ['Identidade visual','Cabeçalho','Navegação e redes sociais','Abertura','Abertura e transições','Identificação','Sobre Iasmin','Como funciona','Temas de escuta','Conteúdos e reflexões','Convite ao percurso','Perguntas frequentes','Contato','Rodapé','Contatos','Percurso · telas','Percurso · perguntas e resultados','Percurso · Ansiedade e sobrecarga','Percurso · Relacionamentos e limites','Percurso · Luto, perdas e mudanças','Percurso · Autoestima e autocrítica','Privacidade','Busca e compartilhamento']
const groups = [...new Set(fields.map(field => field.group))].sort((a,b)=>groupOrder.indexOf(a)-groupOrder.indexOf(b))
const originalImages = [
  ...fields.filter(field=>field.kind==='image').map(field=>({src:field.default,name:field.default.split('/').pop() || 'Imagem original'})),
  ...fields.filter(field=>field.kind==='gallery').flatMap(field=>(JSON.parse(field.default) as {src:string;alt:string}[]).map(item=>({src:item.src,name:item.src.split('/').pop() || 'Imagem original'}))),
]
const date = (value: string | null) => value ? new Date(value).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }) : 'Ainda não publicada pelo painel'
const groupNotes: Record<string, string> = {
  Abertura: 'A primeira impressão do seu site. Apresente seu trabalho com uma mensagem clara e uma foto acolhedora.',
  'Sobre Iasmin': 'Sua história, formação e experiência. Mantenha os dados profissionais atualizados.',
  Privacidade: 'Revise estes textos com cuidado. O prazo de armazenamento do percurso continua sendo de 180 dias.',
  'Percurso · perguntas e resultados': 'Você pode alterar os textos. A quantidade de perguntas e a lógica das respostas são preservadas.',
  Contatos: 'Use o endereço completo do WhatsApp com o código do país e DDD. Exemplo: https://wa.me/5575981234176',
}
export function AdminPanel({ mode, initial }: { mode: Mode; initial?: Snapshot }) {
  const router = useRouter()
  const [snapshot, setSnapshot] = useState(initial)
  const [values, setValues] = useState(initial?.draft || defaults)
  const [view, setView] = useState('overview')
  const [group, setGroup] = useState('Abertura')
  const [search, setSearch] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [mediaField, setMediaField] = useState<string | null>(null)
  const [preview, setPreview] = useState(false)
  const [previewPage, setPreviewPage] = useState('inicio')
  const [previewWidth, setPreviewWidth] = useState('desktop')
  const [previewKey, setPreviewKey] = useState(0)
  const [menu, setMenu] = useState(false)
  const [confirmation, setConfirmation] = useState<{ message: string; run: () => void } | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)
  const dirty = JSON.stringify(values) !== JSON.stringify(snapshot?.draft || defaults)
  const changes = fields.filter(field => values[field.id] !== snapshot?.published[field.id])
  const pending = Boolean(snapshot && JSON.stringify(snapshot.draft) !== JSON.stringify(snapshot.published))
  function selectImage(target: string, src: string) {
    setValues(current => {
      if (!target.includes(':')) return { ...current, [target]: src }
      const [key,index] = target.split(':')
      const gallery = JSON.parse(current[key]) as {src:string;alt:string}[]
      gallery[Number(index)].src=src
      return { ...current, [key]: JSON.stringify(gallery) }
    })
    setMediaField(null)
  }
  useEffect(() => {
    if (!dirty) return
    const handler = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty])
  async function call(action: string, extra: Record<string, unknown> = {}) {
    setError(''); setNotice(''); setBusy(true)
    try {
      const response = await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action, revision: snapshot?.revision, ...extra }) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      if (result.draft) { setSnapshot(result); setValues(result.draft) }
      return result
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Não foi possível concluir.'); return null }
    finally { setBusy(false) }
  }
  async function save() { const result = await call('save', { values }); if (result) { setNotice('Rascunho salvo. O site publicado continua como estava.'); setPreviewKey(key => key + 1) } return result }
  async function upload(file: File) {
    if (file.size > 3_000_000) { setError('A imagem deve ter até 3 MB. Escolha uma versão menor.'); return }
    setBusy(true); setError('')
    try {
      const form = new FormData(); form.append('file', file); form.append('revision', String(snapshot?.revision))
      const response = await fetch('/api/admin/media', { method: 'POST', body: form }), result = await response.json()
      if (!response.ok) throw new Error(result.error)
      setSnapshot(result.snapshot)
      if (mediaField) selectImage(mediaField, `/api/media/${result.media.id}`)
      setNotice('Imagem enviada. Salve o rascunho para aplicá-la à prévia.')
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Falha ao enviar imagem.') }
    finally { setBusy(false); if (fileInput.current) fileInput.current.value = '' }
  }
  async function access(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget)
    const result = await call(mode, Object.fromEntries(form))
    if (result) router.refresh()
  }
  function downloadBackup() {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), values }, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a'); link.href = url; link.download = 'iasmin-conteudo.json'; link.click(); URL.revokeObjectURL(url)
  }
  if (mode !== 'editor') return (
    <main className={styles.access}>
      <div className={styles.accessStory}><BrandLogo variant="full" /><span>SEU ESPAÇO DE CUIDADO</span><h1>Seu site,<br />do seu jeito.</h1><p>Um lugar para atualizar suas palavras, compartilhar novas fotos e cuidar da sua presença on-line.</p><div className={styles.orbit} aria-hidden="true" /></div>
      <div className={styles.accessForm}>
        <Link href="/">← Voltar ao site</Link><p className={styles.eyebrow}>PAINEL ADMINISTRATIVO</p>
        <h2>{mode === 'setup' ? 'Vamos preparar seu acesso.' : mode === 'unavailable' ? 'O painel precisa ser configurado.' : 'Bem-vinda de volta.'}</h2>
        <p>{mode === 'setup' ? 'Use o código de ativação fornecido na entrega e escolha uma senha para proteger seu conteúdo.' : mode === 'unavailable' ? 'O armazenamento ou as credenciais ainda não estão disponíveis. Consulte o guia de configuração entregue com o projeto.' : 'Entre para continuar cuidando do seu site.'}</p>
        {mode !== 'unavailable' && <form onSubmit={access}>
          {mode === 'setup' && <label>Código de ativação<input required name="token" type="password" autoComplete="off" /></label>}
          <label>E-mail<input required name="email" type="email" autoComplete="username" placeholder="Seu e-mail de acesso" /></label>
          <label>Senha<input required name="password" type="password" minLength={mode === 'setup' ? 12 : 1} maxLength={128} autoComplete={mode === 'setup' ? 'new-password' : 'current-password'} /><small>{mode === 'setup' ? 'Use pelo menos 12 caracteres.' : 'A sessão dura até 8 horas.'}</small></label>
          <button className={styles.primary} disabled={busy}>{busy ? 'Aguarde…' : mode === 'setup' ? 'Ativar meu painel' : 'Entrar no painel'}</button>
        </form>}
        {error && <p className={styles.error} role="alert">{error}</p>}
      </div>
    </main>
  )
  const visibleFields = fields.filter(field => search ? `${field.group} ${field.label} ${values[field.id]}`.toLowerCase().includes(search.toLowerCase()) : field.group === group)
  const navigate = (next: string) => { setView(next); setMenu(false); setSearch('') }
  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${menu ? styles.sidebarOpen : ''}`}>
        <button className={styles.navClose} aria-label="Fechar navegação" onClick={()=>setMenu(false)}>×</button>
        <Link href="/" aria-label="Abrir site"><BrandLogo variant="horizontal" /></Link><p className={styles.sidebarCaption}>ESPAÇO DE GESTÃO</p>
        <nav aria-label="Navegação do painel">
          {[['overview','Visão geral','◉'],['content','Conteúdo do site','✎'],['media','Biblioteca de imagens','▧'],['history','Histórico de versões','↶'],['account','Minha conta','◎']].map(([key,label,icon]) => <button key={key} aria-current={view === key ? 'page' : undefined} onClick={() => navigate(key)}><span aria-hidden="true">{icon}</span>{label}</button>)}
        </nav>
        <div className={styles.sidebarBottom}><span className={styles.liveDot} /> Seu site merece cuidado<p>Iasmin Portugal<br /><small>Painel de conteúdo</small></p><a href="/" target="_blank" rel="noreferrer">Abrir site ↗</a><button disabled={busy} onClick={async () => { const leave = async () => { if (await call('logout')) router.refresh() }; if (dirty) setConfirmation({message:'Há alterações sem salvar. Sair e descartá-las?',run:leave}); else await leave() }}>Sair da conta</button></div>
      </aside>
      {menu && <button className={styles.navScrim} aria-label="Fechar navegação ao tocar fora" onClick={()=>setMenu(false)} />}
      <div className={styles.workspace}>
        <header className={styles.topbar}><button className={styles.mobileToggle} onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label="Abrir navegação">☰</button><span>Seu site / <strong>{view === 'overview' ? 'Visão geral' : view === 'content' ? 'Conteúdo' : view === 'media' ? 'Imagens' : view === 'history' ? 'Histórico' : 'Minha conta'}</strong></span><div><span className={styles.saveState}>{dirty ? 'Alterações sem salvar' : 'Rascunho salvo'}</span><button disabled={busy} onClick={async () => { if (!dirty || await save()) setPreview(true) }}>Prévia ↗</button><button className={styles.primary} disabled={busy || changes.length === 0} onClick={() => setPublishing(true)}>Publicar{changes.length > 0 && <span>{changes.length}</span>}</button></div></header>
        <main className={styles.main}>
          <div aria-live="polite">{notice && <p className={styles.success}>{notice}</p>}{error && <p className={styles.error} role="alert">{error}</p>}</div>
          {view === 'overview' && <>
            <div className={styles.pageHeading}><div><p className={styles.eyebrow}>BEM-VINDA AO SEU PAINEL</p><h1>Vamos cuidar<br />do seu espaço?</h1><p>Pequenas mudanças mantêm seu site próximo de quem você é.<br />Escolha uma seção e comece por onde fizer sentido.</p></div><div className={styles.welcomeMark}><BrandLogo variant="monogram" tone="terracotta" /></div></div>
            <div className={styles.statusGrid}><article><span>VERSÃO NO AR</span><strong>{snapshot?.publishedAt ? 'Site atualizado' : 'Conteúdo original'}</strong><p>{date(snapshot?.publishedAt || null)}</p><a href="/" target="_blank" rel="noreferrer">Visitar seu site ↗</a></article><article><span>EM PREPARAÇÃO</span><strong>{changes.length} {changes.length === 1 ? 'alteração' : 'alterações'}</strong><p>{pending || dirty ? 'Prontas para revisar antes de publicar.' : 'Tudo em dia. Você pode editar quando quiser.'}</p><button onClick={() => navigate('content')}>Continuar editando →</button></article><article><span>SUA BIBLIOTECA</span><strong>{(snapshot?.media.length || 0) + originalImages.length} imagens</strong><p>Fotos e reflexões que dão vida ao seu site.</p><button onClick={() => navigate('media')}>Organizar imagens →</button></article></div>
            <div className={styles.sectionHeading}><h2>Por onde começar?</h2><span>Seu conteúdo, organizado por seção</span></div>
            <div className={styles.quickGrid}>{[['Abertura','A primeira impressão','Sua mensagem principal, foto e convite ao cuidado.','01'],['Sobre Iasmin','Sua história e presença','Apresente sua trajetória e suas credenciais.','02'],['Conteúdos e reflexões','Palavras que acompanham','Troque as imagens e atualize seus conteúdos.','03'],['Percurso · Ansiedade e sobrecarga','Um convite à reflexão','Perguntas, alternativas e devolutivas do percurso.','04']].map(([key,title,description,num]) => <button key={key} onClick={() => { setGroup(key); navigate('content') }}><span>{num}</span><h3>{title}</h3><p>{description}</p><strong>Editar seção ↗</strong></button>)}</div>
            <div className={styles.guide}><span aria-hidden="true">✳</span><div><h3>Edite com tranquilidade.</h3><p>As alterações ficam em rascunho. Salve, confira a prévia e publique quando estiver pronta. As versões anteriores ficam no histórico.</p></div></div>
          </>}
          {view === 'content' && <>
            <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>PALAVRAS, FOTOS E DETALHES</p><h1>Conteúdo do site</h1><p>Altere os campos e confira o resultado na prévia.</p></div><button className={styles.primary} disabled={busy || !dirty} onClick={save}>{busy ? 'Salvando…' : 'Salvar rascunho'}</button></div>
            <label className={styles.search}>Buscar um texto, campo ou seção<input type="search" placeholder="Ex.: ansiedade, foto, WhatsApp…" value={search} onChange={event => setSearch(event.target.value)} /></label>
            <div className={styles.editorLayout}><nav className={styles.sections} aria-label="Seções do site">{groups.map(name => <button key={name} aria-current={!search && name === group ? 'page' : undefined} onClick={() => { setGroup(name); setSearch('') }}>{name}<span>{fields.filter(f => f.group === name).length}</span></button>)}</nav><section className={styles.editor}>
              <div className={styles.editorHeading}><p className={styles.eyebrow}>{search ? `${visibleFields.length} CAMPOS ENCONTRADOS` : 'EDITANDO ESTA SEÇÃO'}</p><h2>{search ? 'Resultados da busca' : group}</h2><p>{groupNotes[group] || (group.startsWith('Percurso · ') ? 'Atualize a redação das perguntas, alternativas e devolutivas. A lógica das respostas e as cinco perguntas por tema são preservadas. Os nomes dos temas também aparecem na página inicial.' : 'Atualize os textos e imagens desta parte do site. Campos repetidos são compartilhados entre as páginas.')}</p></div>
              {!visibleFields.length && <p>Nenhum campo encontrado. Tente outra palavra.</p>}
              {visibleFields.map((field,index) => <div className={styles.field} key={field.id}>
                <div className={styles.fieldHeading}><label htmlFor={`field-${field.id}`}>{field.label.length > 90 ? `${field.label.slice(0,87)}…` : field.label}</label><button disabled={busy || values[field.id] === field.default} onClick={() => setValues(current => ({ ...current, [field.id]: field.default }))}>Restaurar original</button></div>
                {search && <small>{field.group}</small>}
                {field.kind === 'faq' ? <FaqEditor value={values[field.id]} disabled={busy} onChange={value=>setValues(current=>({...current,[field.id]:value}))} /> : field.kind === 'gallery' ? <GalleryEditor value={values[field.id]} disabled={busy} onChange={value=>setValues(current=>({...current,[field.id]:value}))} onChoose={index=>setMediaField(field.id+':'+index)} /> : field.kind === 'position' ? <select id={`field-${field.id}`} disabled={busy} value={values[field.id]} onChange={event=>setValues(current=>({...current,[field.id]:event.target.value}))}>{[['center center','Centralizado'],['center top','Parte superior'],['center bottom','Parte inferior'],['left center','À esquerda'],['right center','À direita']].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select> : field.kind === 'image' ? <div className={styles.imageField}><img src={values[field.id]} alt={`Prévia da imagem ${index + 1}`} /><div><p>Escolha uma foto ou conteúdo da biblioteca.</p><button disabled={busy} onClick={() => setMediaField(field.id)}>Trocar imagem</button><small>JPG, PNG ou WebP · até 3 MB</small></div></div> : field.default.length > 110 ? <textarea disabled={busy} id={`field-${field.id}`} rows={4} maxLength={6000} value={values[field.id]} onChange={event => setValues(current => ({ ...current, [field.id]: event.target.value }))} /> : <input disabled={busy} id={`field-${field.id}`} type={field.kind === 'url' ? 'url' : 'text'} maxLength={6000} value={values[field.id]} onChange={event => setValues(current => ({ ...current, [field.id]: event.target.value }))} />}
                {['text','url'].includes(field.kind) && <small>{values[field.id]?.length || 0} caracteres{field.kind === 'url' ? ' · endereço completo com https://' : ''}</small>}
              </div>)}
              <div className={styles.editorFooter}><span>{dirty ? 'Você tem alterações sem salvar.' : 'Seu rascunho está salvo.'}</span><button className={styles.primary} disabled={busy || !dirty} onClick={save}>Salvar rascunho</button></div>
            </section></div>
          </>}
          {view === 'media' && <><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>IMAGENS QUE CONTAM HISTÓRIAS</p><h1>Sua biblioteca</h1><p>As imagens ficam disponíveis para todas as seções. Troque-as pelo editor de conteúdo.</p></div><button className={styles.primary} disabled={busy} onClick={() => fileInput.current?.click()}>+ Enviar imagem</button></div><p className={styles.hint}>JPG, PNG ou WebP, até 3 MB. Textos desenhados dentro de uma imagem são alterados substituindo o arquivo.</p><div className={styles.mediaGrid}>{[...(snapshot?.media || []).map(media => ({ src:`/api/media/${media.id}`, name:media.name })),...originalImages].map(image => <figure key={image.src}><img loading="lazy" src={image.src} alt={image.name} /><figcaption>{image.name}</figcaption></figure>)}</div></>}
          {view === 'history' && <><p className={styles.eyebrow}>SEMPRE HÁ COMO VOLTAR</p><h1>Histórico de versões</h1><p>Restaurar recupera uma versão como rascunho. Confira a prévia e publique para colocá-la no ar.</p><div className={styles.historyCurrent}><span className={styles.liveDot} /> Versão atual no ar <strong>{date(snapshot?.publishedAt || null)}</strong></div>{!snapshot?.history.length && <div className={styles.empty}><h2>Sua história começa aqui.</h2><p>Depois da primeira publicação, as versões anteriores aparecerão neste espaço.</p></div>}{snapshot?.history.map((version,index) => <article className={styles.historyRow} key={version.id}><div><span>VERSÃO ANTERIOR {index + 1}</span><h3>{version.label || 'Publicação'}</h3><p>Substituída em {date(version.date)}</p></div><button disabled={busy} onClick={async () => { setConfirmation({message:'Recuperar esta versão como rascunho? Isso substitui as alterações do rascunho atual.',run:async()=>{if (await call('restore', { id: version.id })) { setNotice('Versão recuperada como rascunho. Revise antes de publicar.'); navigate('content') }}}) }}>Restaurar rascunho</button></article>)}<div className={styles.guide}><div><h3>Uma cópia para guardar.</h3><p>Exporte seus textos e referências de imagens. O arquivo não inclui as imagens em si.</p><button onClick={downloadBackup}>Baixar cópia do conteúdo</button><label className={styles.importLabel}>Importar conteúdo para o rascunho<input type="file" accept="application/json,.json" onChange={async event => { const file = event.target.files?.[0]; if (!file) return; try { const data = JSON.parse(await file.text()); setConfirmation({message:'Substituir o rascunho pelo conteúdo deste arquivo?',run:async()=>{if (await call('save',{ values: data.values })) setNotice('Conteúdo importado como rascunho.')}}) } catch { setError('O arquivo de conteúdo não é válido.') } event.target.value = '' }} /></label></div></div></>}
          {view === 'account' && <><p className={styles.eyebrow}>SEU ACESSO, SEU CONTROLE</p><h1>Minha conta</h1><p>Seu e-mail de acesso: <strong>{snapshot?.email}</strong></p><form className={styles.accountForm} onSubmit={async event => { event.preventDefault(); const form=event.currentTarget, data=new FormData(form); if (data.get('password') !== data.get('confirm')) { setError('As novas senhas precisam ser iguais.'); return } if (await call('password',Object.fromEntries(data))) { setNotice('Senha alterada. Outras sessões foram encerradas.'); form.reset() } }}><h2>Alterar senha</h2><label>Senha atual<input name="current" type="password" autoComplete="current-password" required maxLength={128} /></label><label>Nova senha<input name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} /><small>Pelo menos 12 caracteres. Prefira uma frase longa e exclusiva.</small></label><label>Repita a nova senha<input name="confirm" type="password" autoComplete="new-password" required minLength={12} maxLength={128} /></label><button className={styles.primary} disabled={busy}>Atualizar senha</button></form></>}
          <footer className={styles.panelFooter}>Feito para cuidar da sua presença. <span>Iasmin Portugal · Psicologia clínica</span></footer>
        </main>
      </div>
      {confirmation && <Modal title="Confirmar alteração" onClose={()=>setConfirmation(null)}><p>{confirmation.message}</p><div className={styles.modalActions}><button onClick={()=>setConfirmation(null)}>Cancelar</button><button className={styles.primary} onClick={()=>{confirmation.run();setConfirmation(null)}}>Continuar</button></div></Modal>}
      <input hidden ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" onChange={event => { const file = event.target.files?.[0]; if (file) void upload(file) }} />
      {publishing && <Modal title="Pronta para colocar no ar?" onClose={() => setPublishing(false)}><p>Ao publicar, estas {changes.length} alterações ficam visíveis para todos os visitantes do seu site.</p><div className={styles.changeList}>{[...new Set(changes.map(field => field.group))].map(name => <p key={name}>{name}<span>{changes.filter(field => field.group === name).length} campos</span></p>)}</div><p className={styles.hint}>Uma cópia da versão atual será guardada no histórico.</p><div className={styles.modalActions}><button onClick={() => setPublishing(false)}>Continuar revisando</button><button className={styles.primary} disabled={busy} onClick={async () => { if (await call('publish', { values, label: `Publicação de ${new Date().toLocaleDateString('pt-BR')}` })) { setPublishing(false); setNotice('Seu site foi atualizado. As alterações já estão no ar.'); setPreviewKey(key => key+1) } }}>{busy ? 'Publicando…' : 'Publicar alterações'}</button></div>{error && <p role="alert" className={styles.error}>{error}</p>}</Modal>}
      {mediaField && <Modal title="Escolha uma imagem" onClose={() => setMediaField(null)}><p>Envie uma nova imagem ou escolha uma da biblioteca.</p><button className={styles.primary} disabled={busy} onClick={() => fileInput.current?.click()}>{busy ? 'Enviando…' : '+ Enviar imagem'}</button><div className={styles.mediaGrid}>{[...(snapshot?.media || []).map(media => ({src:`/api/media/${media.id}`,name:media.name})),...originalImages].map(image => <button key={image.src} onClick={() => { selectImage(mediaField,image.src) }}><img src={image.src} alt={image.name}/><span>{image.name}</span></button>)}</div>{error&&<p className={styles.error} role="alert">{error}</p>}</Modal>}
      {preview && <Modal wide title="Prévia do rascunho" onClose={()=>setPreview(false)}><div className={styles.previewToolbar}><label>Página<select value={previewPage} onChange={event=>setPreviewPage(event.target.value)}><option value="inicio">Página inicial</option><option value="percurso">Percurso</option><option value="privacidade">Privacidade</option></select></label><label>Tela<select value={previewWidth} onChange={event=>setPreviewWidth(event.target.value)}><option value="desktop">Computador</option><option value="mobile">Celular</option></select></label><button onClick={()=>setPreviewKey(key=>key+1)}>Atualizar prévia</button><a href={`/admin/preview?page=${previewPage}`} target="_blank" rel="noreferrer">Abrir em outra aba ↗</a></div><iframe key={previewKey} title="Prévia do site" className={previewWidth==='mobile'?styles.mobilePreview:styles.previewFrame} src={`/admin/preview?page=${previewPage}`} /><p className={styles.hint}>Esta prévia mostra o rascunho salvo. Os links abrem a versão pública das outras páginas.</p></Modal>}
    </div>
  )
}
function moveItem<T>(items: readonly T[], index: number, direction: number): T[] {
  const result = [...items]
  const target = index + direction
  if (target >= 0 && target < result.length) [result[index], result[target]] = [result[target], result[index]]
  return result
}
function FaqEditor({value,onChange,disabled}:{value:string;onChange:(value:string)=>void;disabled:boolean}) {
  const id=useId()
  const items=JSON.parse(value) as {question:string;answer:string}[]
  const update=(index:number,key:'question'|'answer',text:string)=>onChange(JSON.stringify(items.map((item,i)=>i===index?{...item,[key]:text}:item)))
  return <div className={styles.collection}>{items.map((item,index)=><article key={index}><div className={styles.collectionHeading}><strong>Pergunta {index+1}</strong><div><button disabled={disabled||index===0} aria-label={`Mover pergunta ${index+1} para cima`} onClick={()=>{onChange(JSON.stringify(moveItem(items,index,-1)))}}>↑</button><button disabled={disabled||index===items.length-1} aria-label={`Mover pergunta ${index+1} para baixo`} onClick={()=>{onChange(JSON.stringify(moveItem(items,index,1)))}}>↓</button><button disabled={disabled||items.length===1} onClick={()=>onChange(JSON.stringify(items.filter((_,i)=>i!==index)))}>Remover</button></div></div><label htmlFor={`${id}-q-${index}`}>Pergunta</label><input id={`${id}-q-${index}`} disabled={disabled} value={item.question} maxLength={250} onChange={event=>update(index,'question',event.target.value)} /><label htmlFor={`${id}-a-${index}`}>Resposta</label><textarea id={`${id}-a-${index}`} disabled={disabled} value={item.answer} maxLength={2000} rows={4} onChange={event=>update(index,'answer',event.target.value)} /></article>)}<button disabled={disabled||items.length>=20} onClick={()=>onChange(JSON.stringify([...items,{question:'Nova pergunta',answer:'Escreva aqui a resposta.'}]))}>+ Adicionar pergunta</button><small>{items.length} de 20 perguntas · a ordem aqui é a ordem do site</small></div>
}
function GalleryEditor({value,onChange,onChoose,disabled}:{value:string;onChange:(value:string)=>void;onChoose:(index:number)=>void;disabled:boolean}) {
  const id=useId(),items=JSON.parse(value) as {src:string;alt:string}[]
  return <div className={styles.collection}>{items.map((item,index)=><article key={index}><div className={styles.collectionHeading}><strong>Reflexão {index+1}</strong><div><button disabled={disabled||index===0} aria-label={`Mover imagem ${index+1} para cima`} onClick={()=>{onChange(JSON.stringify(moveItem(items,index,-1)))}}>↑</button><button disabled={disabled||index===items.length-1} aria-label={`Mover imagem ${index+1} para baixo`} onClick={()=>{onChange(JSON.stringify(moveItem(items,index,1)))}}>↓</button><button disabled={disabled||items.length===1} onClick={()=>onChange(JSON.stringify(items.filter((_,i)=>i!==index)))}>Remover</button></div></div><div className={styles.imageField}><img src={item.src} alt={item.alt}/><button disabled={disabled} onClick={()=>onChoose(index)}>Trocar imagem</button></div><label htmlFor={`${id}-alt-${index}`}>Descrição da imagem para acessibilidade</label><input id={`${id}-alt-${index}`} disabled={disabled} value={item.alt} maxLength={300} onChange={event=>onChange(JSON.stringify(items.map((image,i)=>i===index?{...image,alt:event.target.value}:image)))}/></article>)}<button disabled={disabled||items.length>=12} onClick={()=>onChange(JSON.stringify([...items,{src:items[0].src,alt:'Descreva o conteúdo desta imagem.'}]))}>+ Adicionar reflexão</button><small>{items.length} de 12 imagens · a ordem aqui é a ordem do site</small></div>
}
function Modal({ title, children, onClose, wide=false }: {title:string;children:React.ReactNode;onClose:()=>void;wide?:boolean}) {
  const dialog=useRef<HTMLDialogElement>(null)
  const headingId = useId()
  useEffect(()=>{dialog.current?.showModal(); const node=dialog.current; return()=>node?.close()},[])
  return <dialog ref={dialog} aria-labelledby={headingId} className={`${styles.modal} ${wide?styles.modalWide:''}`} onCancel={onClose}><div className={styles.modalHeader}><h2 id={headingId}>{title}</h2><button onClick={onClose} aria-label="Fechar janela">×</button></div>{children}</dialog>
}
