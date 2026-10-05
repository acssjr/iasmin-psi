'use client'

/* Admin thumbnails preserve the original framing; public pages use next/image. */
/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useId, type FormEvent } from 'react'
import { fields, defaults, type ContentValues } from '@/lib/cms/catalog'
import type { Media, Version } from '@/lib/cms/store'
import { BrandLogo } from '@/components/brand-logo'
import { VisualEditor } from './visual-editor'
import { editorSections, fieldsForSection, subsectionForField } from '@/lib/cms/editor-structure'
import { PhotoFraming } from './photo-framing'
import { FaqEditor, GalleryEditor } from './collection-editors'
import styles from './admin-panel.module.css'

type Snapshot = { revision: number; draft: ContentValues; published: ContentValues; publishedAt: string | null; history: Version[]; media: Media[]; email?: string }
type Mode = 'editor' | 'login' | 'setup' | 'unavailable'
const originalImages = [
  ...fields.filter(field=>field.kind==='image').map(field=>({src:field.default,name:field.default.split('/').pop() || 'Imagem original'})),
  ...fields.filter(field=>field.kind==='gallery').flatMap(field=>(JSON.parse(field.default) as {src:string;alt:string}[]).map(item=>({src:item.src,name:item.src.split('/').pop() || 'Imagem original'}))),
]
const date = (value: string | null) => value ? new Date(value).toLocaleString('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }) : 'Ainda não publicada pelo painel'
export function AdminPanel({ mode, initial }: { mode: Mode; initial?: Snapshot }) {
  const router = useRouter()
  const [snapshot, setSnapshot] = useState(initial)
  const [values, setValues] = useState(initial?.draft || defaults)
  const [view, setView] = useState('visual')
  const [group, setGroup] = useState('hero')
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
  const dirty = fields.some(field=>values[field.id] !== (snapshot?.draft || defaults)[field.id])
  const changes = fields.filter(field => values[field.id] !== snapshot?.published[field.id])
  const pending = Boolean(snapshot && fields.some(field=>snapshot.draft[field.id] !== snapshot.published[field.id]))
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
  const activeSection = editorSections.find(section=>section.id===group||section.groups.includes(group)) || editorSections[1]
  const matchingFields = search ? fields.filter(field=>`${field.group} ${field.label} ${values[field.id]}`.toLowerCase().includes(search.toLowerCase())) : fieldsForSection(activeSection.id)
  const fieldBlocks = [...new Set(matchingFields.map(subsectionForField))]
  const visibleFields = [...matchingFields].sort((a,b)=>fieldBlocks.indexOf(subsectionForField(a))-fieldBlocks.indexOf(subsectionForField(b)))
  const navigate = (next: string) => { setView(next); setMenu(false); setSearch('') }
  return (
    <div className={styles.shell}>
      <aside className={`${styles.sidebar} ${menu ? styles.sidebarOpen : ''}`}>
        <button className={styles.navClose} aria-label="Fechar navegação" onClick={()=>setMenu(false)}>×</button>
        <Link href="/" aria-label="Abrir site"><BrandLogo variant="horizontal" /></Link><p className={styles.sidebarCaption}>ESPAÇO DE GESTÃO</p>
        <nav aria-label="Navegação do painel">
          {[['visual','Editar no site','✎'],['overview','Visão geral','◉'],['content','Edição avançada','☷'],['media','Biblioteca de imagens','▧'],['history','Histórico de versões','↶'],['account','Minha conta','◎']].map(([key,label,icon]) => <button key={key} aria-current={view === key ? 'page' : undefined} onClick={() => navigate(key)}><span aria-hidden="true">{icon}</span>{label}</button>)}
        </nav>
        <div className={styles.sidebarBottom}><span className={styles.liveDot} /> Seu site merece cuidado<p>Iasmin Portugal<br /><small>Painel de conteúdo</small></p><a href="/" target="_blank" rel="noreferrer">Abrir site ↗</a><button disabled={busy} onClick={async () => { const leave = async () => { if (await call('logout')) router.refresh() }; if (dirty) setConfirmation({message:'Há alterações sem salvar. Sair e descartá-las?',run:leave}); else await leave() }}>Sair da conta</button></div>
      </aside>
      {menu && <button className={styles.navScrim} aria-label="Fechar navegação ao tocar fora" onClick={()=>setMenu(false)} />}
      <div className={styles.workspace}>
        <header className={styles.topbar}><button className={styles.mobileToggle} onClick={() => setMenu(!menu)} aria-expanded={menu} aria-label="Abrir navegação">☰</button><span>Seu site / <strong>{view === 'visual' ? 'Edição visual' : view === 'overview' ? 'Visão geral' : view === 'content' ? 'Edição avançada' : view === 'media' ? 'Imagens' : view === 'history' ? 'Histórico' : 'Minha conta'}</strong></span><div><span className={styles.saveState}>{dirty ? 'Alterações sem salvar' : 'Rascunho salvo'}</span><button disabled={busy} onClick={async () => { if (!dirty || await save()) setPreview(true) }}>Prévia ↗</button><button className={styles.primary} disabled={busy || changes.length === 0} onClick={() => setPublishing(true)}>Publicar{changes.length > 0 && <span>{changes.length}</span>}</button></div></header>
        <main className={`${styles.main} ${view === 'visual' ? styles.visualMain : ''}`}>
          <div aria-live="polite">{notice && <p className={styles.success}>{notice}</p>}{error && <p className={styles.error} role="alert">{error}</p>}</div>
          {view === 'visual' && <VisualEditor values={values} onChange={(id,value)=>setValues(current=>({...current,[id]:value}))} onChoose={setMediaField} onSave={()=>void save()} busy={busy} dirty={dirty}/>}
          {view === 'overview' && <>
            <div className={styles.pageHeading}><div><p className={styles.eyebrow}>BEM-VINDA AO SEU PAINEL</p><h1>Vamos cuidar<br />do seu espaço?</h1><p>Pequenas mudanças mantêm seu site próximo de quem você é.<br />Escolha uma seção e comece por onde fizer sentido.</p></div><div className={styles.welcomeMark}><BrandLogo variant="monogram" tone="terracotta" /></div></div>
            <div className={styles.statusGrid}><article><span>VERSÃO NO AR</span><strong>{snapshot?.publishedAt ? 'Site atualizado' : 'Conteúdo original'}</strong><p>{date(snapshot?.publishedAt || null)}</p><a href="/" target="_blank" rel="noreferrer">Visitar seu site ↗</a></article><article><span>EM PREPARAÇÃO</span><strong>{changes.length} {changes.length === 1 ? 'alteração' : 'alterações'}</strong><p>{pending || dirty ? 'Prontas para revisar antes de publicar.' : 'Tudo em dia. Você pode editar quando quiser.'}</p><button onClick={() => navigate('content')}>Continuar editando →</button></article><article><span>SUA BIBLIOTECA</span><strong>{(snapshot?.media.length || 0) + originalImages.length} imagens</strong><p>Fotos e reflexões que dão vida ao seu site.</p><button onClick={() => navigate('media')}>Organizar imagens →</button></article></div>
            <div className={styles.sectionHeading}><h2>Por onde começar?</h2><span>Seu conteúdo, organizado por seção</span></div>
            <div className={styles.quickGrid}>{[['Abertura','A primeira impressão','Sua mensagem principal, foto e convite ao cuidado.','01'],['Sobre Iasmin','Sua história e presença','Apresente sua trajetória e suas credenciais.','02'],['Conteúdos e reflexões','Palavras que acompanham','Troque as imagens e atualize seus conteúdos.','03'],['Percurso · Ansiedade e sobrecarga','Um convite à reflexão','Perguntas, alternativas e devolutivas do percurso.','04']].map(([key,title,description,num]) => <button key={key} onClick={() => { setGroup(key); navigate('content') }}><span>{num}</span><h3>{title}</h3><p>{description}</p><strong>Editar seção ↗</strong></button>)}</div>
            <div className={styles.guide}><span aria-hidden="true">✳</span><div><h3>Edite com tranquilidade.</h3><p>As alterações ficam em rascunho. Salve, confira a prévia e publique quando estiver pronta. As versões anteriores ficam no histórico.</p></div></div>
          </>}
          {view === 'content' && <>
            <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>PALAVRAS, FOTOS E DETALHES</p><h1>Edição avançada</h1><p>Campos organizados pelas seções reais da página. Para editar vendo o site, use a edição visual.</p></div><button className={styles.primary} disabled={busy || !dirty} onClick={save}>{busy ? 'Salvando…' : 'Salvar rascunho'}</button></div>
            <label className={styles.search}>Buscar um texto, campo ou seção<input type="search" placeholder="Ex.: ansiedade, foto, WhatsApp…" value={search} onChange={event => setSearch(event.target.value)} /></label>
            <div className={styles.editorLayout}><nav className={styles.sections} aria-label="Seções do site">{editorSections.map(section => <button key={section.id} aria-current={!search && section.id === activeSection.id ? 'page' : undefined} onClick={() => { setGroup(section.id); setSearch('') }}>{section.title}<span>{fieldsForSection(section.id).length}</span></button>)}</nav><section className={styles.editor}>
              <div className={styles.editorHeading}><p className={styles.eyebrow}>{search ? `${visibleFields.length} CAMPOS ENCONTRADOS` : 'EDITANDO ESTA SEÇÃO'}</p><h2>{search ? 'Resultados da busca' : activeSection.title}</h2><p>{activeSection.note}</p></div>
              {!visibleFields.length && <p>Nenhum campo encontrado. Tente outra palavra.</p>}
              {visibleFields.map((field,index) => <div className={styles.field} key={field.id}>{(index===0 || subsectionForField(visibleFields[index-1])!==subsectionForField(field))&&<h3 className={styles.fieldBlockHeading}>{subsectionForField(field)}</h3>}
                <div className={styles.fieldHeading}><label htmlFor={`field-${field.id}`}>{field.label.length > 90 ? `${field.label.slice(0,87)}…` : field.label}</label><button disabled={busy || values[field.id] === field.default} onClick={() => setValues(current => ({ ...current, [field.id]: field.default }))}>Restaurar original</button></div>
                {search && <small>{field.group}</small>}
                {field.kind === 'faq' ? <FaqEditor value={values[field.id]} disabled={busy} onChange={value=>setValues(current=>({...current,[field.id]:value}))} /> : field.kind === 'gallery' ? <GalleryEditor value={values[field.id]} disabled={busy} onChange={value=>setValues(current=>({...current,[field.id]:value}))} onChoose={index=>setMediaField(field.id+':'+index)} /> : field.kind === 'position' ? <PhotoFraming src={values[field.id.replace(/-position$/, '')]||''} value={values[field.id]} disabled={busy} label={field.label} onChange={value=>setValues(current=>({...current,[field.id]:value}))}/> : field.kind === 'image' ? <div className={styles.imageField}><img src={values[field.id]} alt={`Prévia da imagem ${index + 1}`} /><div><p>Escolha uma foto ou conteúdo da biblioteca.</p><button disabled={busy} onClick={() => setMediaField(field.id)}>Trocar imagem</button><small>JPG, PNG ou WebP · até 3 MB</small></div></div> : field.default.length > 110 ? <textarea disabled={busy} id={`field-${field.id}`} rows={4} maxLength={6000} value={values[field.id]} onChange={event => setValues(current => ({ ...current, [field.id]: event.target.value }))} /> : <input disabled={busy} id={`field-${field.id}`} type={field.kind === 'url' ? 'url' : 'text'} maxLength={6000} value={values[field.id]} onChange={event => setValues(current => ({ ...current, [field.id]: event.target.value }))} />}
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
function Modal({ title, children, onClose, wide=false }: {title:string;children:React.ReactNode;onClose:()=>void;wide?:boolean}) {
  const dialog=useRef<HTMLDialogElement>(null)
  const headingId = useId()
  useEffect(()=>{dialog.current?.showModal(); const node=dialog.current; return()=>node?.close()},[])
  return <dialog ref={dialog} aria-labelledby={headingId} className={`${styles.modal} ${wide?styles.modalWide:''}`} onCancel={onClose}><div className={styles.modalHeader}><h2 id={headingId}>{title}</h2><button onClick={onClose} aria-label="Fechar janela">×</button></div>{children}</dialog>
}
