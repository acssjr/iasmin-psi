'use client'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { fields, type ContentValues } from '@/lib/cms/catalog'
import { editorSections } from '@/lib/cms/editor-structure'
import { readEditorChange } from '@/lib/cms/editor-messages'
import { ContentProvider } from './content'
import { VisualEditingContext } from './edit-context'
import './visual-preview.css'
import { PreviewPhotoActions } from './preview-photo-actions'

const fieldIds=new Set(fields.map(f=>f.id))
function send(message:Record<string,unknown>) { if(window.parent!==window) window.parent.postMessage({channel:'iasmin-editor',...message},window.location.origin) }
export function VisualPreview({initial,children}:{initial:ContentValues;children:ReactNode}) {
  const [values,setValues]=useState(initial)
  const [selected,setSelected]=useState<string|null>(null)
  const [enabled,setEnabled]=useState(true)
  const current=useRef(values)
  const select=useCallback((id:string) => {
    if(!fieldIds.has(id))return
    setSelected(id);send({type:'select',id})
    const image=document.querySelector<HTMLImageElement>(`img[data-cms-field="${id}"]`)
    if(image){const rect=image.getBoundingClientRect();if(rect.height>0)send({type:'photo-frame',id,ratio:rect.width/rect.height})}
  },[])
  function change(id:string,value:string) { const change=readEditorChange({channel:'iasmin-editor',type:'change',id,value});if(!change)return;current.current={...current.current,[id]:value};setValues(current.current);send({type:'change',id,value}) }

  useEffect(()=>{
    document.documentElement.dataset.visualEditor='true'
    const receive=(event:MessageEvent)=>{
      if(event.origin!==window.location.origin||event.source!==window.parent||!event.data||event.data.channel!=='iasmin-editor')return
      const message=event.data
      if(message.type==='scale'&&typeof message.value==='number'&&message.value>0&&message.value<=1)document.documentElement.style.setProperty('--cms-action-scale',String(1/message.value))
      if(message.type==='sync'&&message.values&&typeof message.values==='object') {
        const next={...current.current}
        for(const field of fields) if(typeof message.values[field.id]==='string'&&message.values[field.id].length<=50000)next[field.id]=message.values[field.id]
        current.current=next;setValues(next);setEnabled(message.enabled!==false)
        setSelected(typeof message.selected==='string'&&fieldIds.has(message.selected)?message.selected:null)
      }
      if(message.type==='focus') {
        const section=editorSections.find(s=>s.id===message.section)
        const target=typeof message.id==='string'&&fieldIds.has(message.id)?document.querySelector(`[data-cms-field="${message.id}"]`):section?.selector?document.querySelector(section.selector):null
        target?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})
      }
      if(message.type==='flush'&&typeof message.request==='string')send({type:'flushed',request:message.request,values:current.current})
    }
    window.addEventListener('message',receive)
    send({type:'ready'})
    return()=>{window.removeEventListener('message',receive);delete document.documentElement.dataset.visualEditor}
  },[])

  useEffect(()=>{
    const click=(event:MouseEvent)=>{
      if(!(event.target instanceof Element))return
      const photo=event.target.closest<HTMLElement>('[data-cms-photo-action]')
      if(enabled&&photo?.dataset.cmsPhotoAction){
        event.preventDefault();event.stopPropagation()
        const [id,index]=photo.dataset.cmsPhotoAction.split(':')
        if(!fieldIds.has(id))return
        select(id);send({type:'choose-image',id,index:index===undefined?undefined:Number(index)})
        return
      }
      const field=event.target.closest<HTMLElement>('[data-cms-field]')
      if(enabled&&field?.dataset.cmsField) {
        event.stopPropagation()
        if(event.target.closest('a,button,label')){event.preventDefault();if(field.isContentEditable)field.focus()}
        select(field.dataset.cmsField)
        return
      }
      const interactive=event.target.closest('a,form,button')
      if(interactive?.tagName==='A') { event.preventDefault();event.stopPropagation() }
    }
    const submit=(event:Event)=>event.preventDefault()
    document.addEventListener('click',click,true)
    document.addEventListener('submit',submit,true)
    return()=>{document.removeEventListener('click',click,true);document.removeEventListener('submit',submit,true)}
  },[enabled,select])

  useEffect(()=>{
    const frame=requestAnimationFrame(()=>send({type:'inventory',ids:[...new Set(Array.from(document.querySelectorAll<HTMLElement>('[data-cms-field]')).map(el=>el.dataset.cmsField).filter(Boolean))]}))
    return()=>cancelAnimationFrame(frame)
  },[values,enabled])

  return <VisualEditingContext.Provider value={{enabled,selected,select,change}}><ContentProvider values={values}>{children}<PreviewPhotoActions enabled={enabled}/></ContentProvider></VisualEditingContext.Provider>
}
