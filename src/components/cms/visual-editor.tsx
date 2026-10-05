'use client'
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { fields, type ContentValues } from '@/lib/cms/catalog'
import { editorSections, fieldsForSection, subsectionForField } from '@/lib/cms/editor-structure'
import { journeyTopics, journeyTopicIds } from '@/lib/journey-content'
import { readEditorChange } from '@/lib/cms/editor-messages'
import { FieldControl } from './field-control'
import styles from './visual-editor.module.css'

export function VisualEditor({values,onChange,onChoose,onSave,busy,dirty}:{values:ContentValues;onChange:(id:string,value:string)=>void;onChoose:(id:string)=>void;onSave:()=>void;busy:boolean;dirty:boolean}) {
  const [page,setPage]=useState('inicio')
  const [section,setSection]=useState('hero')
  const [selected,setSelected]=useState<string|null>(null)
  const [width,setWidth]=useState('desktop')
  const [enabled,setEnabled]=useState(true)
  const [ready,setReady]=useState(false)
  const [failed,setFailed]=useState(false)
  const [reloadKey,setReloadKey]=useState(0)
  const [topic,setTopic]=useState(journeyTopicIds[0])
  const [screen,setScreen]=useState('intro')
  const [inspector,setInspector]=useState(true)
  const [visibleIds,setVisibleIds]=useState<string[]>([])
  const [photoRatios,setPhotoRatios]=useState<Record<string,number>>({})
  const sentValues=useRef<ContentValues>({})
  const [zoom,setZoom]=useState('fit')
  const [canvasSize,setCanvasSize]=useState({width:960,height:720})
  const canvas=useRef<HTMLDivElement>(null)
  const frame=useRef<HTMLIFrameElement>(null)
  const latest=useRef({values,onChange,onChoose,enabled,selected,section,page})
  useLayoutEffect(()=>{latest.current={values,onChange,onChoose,enabled,selected,section,page}},[values,onChange,onChoose,enabled,selected,section,page])
  const url=`/admin/preview?edit=1&page=${page}&topic=${topic}&screen=${screen}`
  const send=useCallback((message:Record<string,unknown>)=>{frame.current?.contentWindow?.postMessage({channel:'iasmin-editor',...message},window.location.origin)},[])
  const sync=useCallback((full=false)=>{
    const changes=Object.fromEntries(Object.entries(latest.current.values).filter(([id,value])=>full||sentValues.current[id]!==value))
    sentValues.current={...sentValues.current,...changes}
    send({type:'sync',values:changes,enabled:latest.current.enabled,selected:latest.current.selected})
  },[send])

  useEffect(()=>{
    const receive=(event:MessageEvent)=>{
      if(event.origin!==window.location.origin||event.source!==frame.current?.contentWindow||!event.data||event.data.channel!=='iasmin-editor')return
      const message=event.data
      if(message.type==='ready'){setReady(true);setFailed(false);sync(true);send({type:'focus',section:latest.current.section})}
      if(message.type==='inventory'&&Array.isArray(message.ids)&&latest.current.enabled){
        const ids=message.ids.filter((id:unknown)=>typeof id==='string'&&fields.some(f=>f.id===id))
        setVisibleIds(current=>JSON.stringify(current)===JSON.stringify(ids)?current:ids)
      }
      const field=fields.find(f=>f.id===message.id)
      if(!field)return
      const change=readEditorChange(message)
      if(change){sentValues.current[change.id]=change.value;latest.current.onChange(change.id,change.value)}
      if(message.type==='photo-frame'&&field.kind==='image'&&typeof message.ratio==='number'&&message.ratio>0&&message.ratio<10)setPhotoRatios(current=>({...current,[field.id]:message.ratio}))
      if(message.type==='choose-image'&&(field.kind==='image'||field.kind==='gallery')){
        const index=message.index
        if(field.kind==='gallery'&&(!Number.isInteger(index)||index<0||index>=JSON.parse(latest.current.values[field.id]||field.default).length))return
        setSelected(field.id);setInspector(true)
        latest.current.onChoose(field.kind==='gallery'?`${field.id}:${index}`:field.id)
      }
      if(message.type==='select'){
        setSelected(field.id);setInspector(true)
        setSection(current=>latest.current.page==='percurso'?'journey':latest.current.page==='privacidade'?'privacy':fieldsForSection(current).some(f=>f.id===field.id)?current:editorSections.find(s=>s.groups.includes(field.group))?.id||current)
      }
    }
    window.addEventListener('message',receive)
    return()=>window.removeEventListener('message',receive)
  },[sync,send])
  useEffect(()=>{sync()},[values,enabled,selected,sync])
  useEffect(()=>{const timer=setTimeout(()=>setFailed(true),12000);return()=>clearTimeout(timer)},[url,reloadKey])
  useEffect(()=>{
    const node=canvas.current
    if(!node)return
    const measure=()=>{const rect=node.getBoundingClientRect();if(rect.width>0&&rect.height>0)setCanvasSize({width:rect.width,height:rect.height})}
    const first=requestAnimationFrame(measure)
    const mobile=requestAnimationFrame(()=>{if(typeof window.matchMedia==='function'&&window.matchMedia('(max-width:800px)').matches)setWidth('mobile')})
    const observer=typeof ResizeObserver==='undefined'?undefined:new ResizeObserver(measure)
    observer?.observe(node)
    window.addEventListener('resize',measure)
    return()=>{cancelAnimationFrame(first);cancelAnimationFrame(mobile);observer?.disconnect();window.removeEventListener('resize',measure)}
  },[])

  function chooseSection(id:string){
    const next=editorSections.find(s=>s.id===id)!
    setSection(id);setSelected(null);setInspector(true)
    if(next.page!==page){setPage(next.page);setReady(false);setFailed(false)}
    else send({type:'focus',section:id})
  }
  const current=editorSections.find(s=>s.id===section)!
  let sectionFields=fieldsForSection(section)
  if(page==='percurso'){
    sectionFields=fields.filter(f=>visibleIds.includes(f.id))
  }
  const selectedField=fields.find(f=>f.id===selected)
  const positionField=selectedField?.kind==='image'?fields.find(f=>f.id===`${selectedField.id}-position`):undefined
  sectionFields=sectionFields.filter(f=>f.id!==selected&&f.id!==positionField?.id)
  const sections=editorSections.filter(s=>s.page===page)
  const blocks=[...new Set(sectionFields.map(subsectionForField))]
  const frameWidth=width==='mobile'?390:1280
  const scale=zoom==='fit'?Math.min(1,canvasSize.width/frameWidth):1
  useEffect(()=>{if(ready)send({type:'scale',value:scale})},[scale,ready,send])
  const changeField=(id:string,value:string)=>onChange(id,value)
  return <div className={styles.editor}>
    <div className={styles.heading}><div><p>EDIÇÃO VISUAL</p><h1>Veja, clique e personalize.</h1><span>Clique em um texto para escrever no próprio site. Fotos e perguntas abrem seus controles ao lado.</span></div><button disabled={busy||!dirty} onClick={onSave}>{busy?'Salvando…':'Salvar rascunho'}</button></div>
    <div className={styles.toolbar}>
      <label>Página<select value={page} onChange={e=>{const next=e.target.value;setPage(next);setSection(next==='inicio'?'hero':next==='percurso'?'journey':'privacy');setSelected(null);setReady(false);setFailed(false)}}><option value="inicio">Página inicial</option><option value="percurso">Percurso</option><option value="privacidade">Privacidade</option></select></label>
      <label>Visualização<select value={width} onChange={e=>setWidth(e.target.value)}><option value="desktop">Computador</option><option value="mobile">Celular</option></select></label>
      <label>Zoom<select value={zoom} onChange={e=>setZoom(e.target.value)}><option value="fit">Ajustar à tela</option><option value="actual">100% · tamanho real</option></select></label>
      <button aria-pressed={enabled} onClick={()=>setEnabled(v=>!v)}>{enabled?'✎ Editar conteúdo':'↗ Explorar prévia'}</button><button aria-expanded={inspector} onClick={()=>setInspector(v=>!v)}>Seções e controles</button>
      {page==='percurso'&&<><label>Tema<select value={topic} onChange={e=>{setTopic(e.target.value as typeof topic);setSelected(null);setReady(false)}}>{journeyTopicIds.map(id=><option key={id} value={id}>{journeyTopics[id].title}</option>)}</select></label><label>Tela<select value={screen} onChange={e=>{setScreen(e.target.value);setSelected(null);setReady(false)}}><option value="intro">Boas-vindas</option><option value="themes">Escolha de tema</option><option value="contact">Cadastro</option>{[1,2,3,4,5].map(n=><option key={n} value={`question-${n}`}>Pergunta {n}</option>)}<option value="preparing">Carregamento</option>{journeyTopics[topic].directions.map((_,i)=><option key={i} value={`result-${i}`}>Devolutiva {i+1}</option>)}</select></label></>}
    </div>
    <div className={`${styles.layout} ${!inspector?styles.canvasOnly:''}`}>
      <div className={styles.canvas}><div className={styles.canvasCaption}><span className={styles.dot}/>{enabled?'Clique para editar · alterações em rascunho':'Prévia interativa · links externos desativados'}<span>{width==='mobile'?'390 px':'Tela ampla'}</span></div>
        {!ready&&<div className={styles.loading}>{failed?<><p>A prévia não respondeu. Confira sua sessão e tente recarregar.</p><button onClick={()=>{setFailed(false);setReloadKey(n=>n+1)}}>Recarregar prévia</button></>:'Preparando seu site para editar…'}</div>}
        <div className={styles.frameViewport} ref={canvas} style={{overflow:zoom==='fit'?'hidden':'auto'}}><iframe key={`${url}-${reloadKey}`} ref={frame} title="Site com edição visual" src={url} className={styles.siteFrame} style={{width:frameWidth,height:canvasSize.height/scale,transform:`scale(${scale})`,left:Math.max(0,(canvasSize.width-frameWidth*scale)/2)}} onLoad={()=>{sync(true);send({type:'focus',section})}}/></div>
      </div>
      {inspector&&<aside className={styles.inspector} data-selected={Boolean(selectedField)} aria-label="Controles da seção">
        <label className={styles.sectionSelect}>Parte do site<select value={section} onChange={e=>chooseSection(e.target.value)}>{sections.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select></label>
        <div className={styles.context}><h2>{current.title}</h2><p>{current.note}</p><button onClick={()=>send({type:'focus',section})}>Localizar no site ↗</button></div>
        {selectedField&&<div className={styles.selection}><div><strong>Você selecionou</strong><button aria-label="Limpar seleção" onClick={()=>setSelected(null)}>×</button></div><FieldControl field={selectedField} values={values} onChange={changeField} onChoose={onChoose} disabled={busy}/>{positionField&&<FieldControl field={positionField} photoRatio={photoRatios[selectedField.id]} values={values} onChange={changeField} onChoose={onChoose} disabled={busy}/>}<button onClick={()=>send({type:'focus',id:selectedField.id})}>Destacar na página ↗</button></div>}
        <p className={styles.hint}>Todos os campos desta seção</p>
        {blocks.map((name,index)=><details key={`${section}-${name}`} open={index===0} className={styles.block}><summary>{name}<span>{sectionFields.filter(f=>subsectionForField(f)===name).length}</span></summary>{sectionFields.filter(f=>subsectionForField(f)===name).map(field=><FieldControl key={field.id} field={field} photoRatio={photoRatios[field.id.replace(/-position$/, '')]} values={values} onChange={changeField} onChoose={onChoose} disabled={busy}/>)}</details>)}
      </aside>}
    </div>
    <p className={styles.footer}>Editar muda o rascunho. Salvar guarda suas alterações. Publicar atualiza o site dos visitantes.</p>
  </div>
}
