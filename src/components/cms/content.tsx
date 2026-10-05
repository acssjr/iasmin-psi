'use client'

import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type AnchorHTMLAttributes, type InputHTMLAttributes } from 'react'
import Image, { type ImageProps } from 'next/image'
import { fieldByDefault, resolveContent, type ContentValues } from '@/lib/cms/catalog'
import { useVisualEditing, type VisualEditing } from './edit-context'

const ContentContext = createContext<ContentValues>({})
export function ContentProvider({ values, children }: { values: ContentValues; children: ReactNode }) {
  return <ContentContext.Provider value={values}>{children}</ContentContext.Provider>
}
export function useContentValue() {
  const values = useContext(ContentContext)
  return (fallback: string) => resolveContent(values, fallback)
}
export function useContentValues() { return useContext(ContentContext) }
export function ContentText({ fallback }: { fallback: string }) {
  const text = useContentValue()
  const editing = useVisualEditing()
  const field = fieldByDefault.get(fallback.trim().replace(/\s+/g, ' '))
  if (editing?.enabled && field?.kind === 'text') return <EditableText id={field.id} label={field.label} value={text(fallback)} editing={editing} />
  return <>{text(fallback)}</>
}
function EditableText({id,value,editing,label='Texto',limit=6000}:{id:string;value:string;editing:VisualEditing;label?:string;limit?:number}) {
  const element = useRef<HTMLSpanElement>(null)
  const [initial] = useState(value)
  useEffect(()=>{ if (element.current && (!document.hasFocus()||document.activeElement!==element.current)) element.current.textContent=value },[value])
  return <span ref={element} data-cms-field={id} data-cms-selected={editing.selected===id} contentEditable suppressContentEditableWarning role="textbox" aria-label={`Editar: ${label}`} aria-multiline="true" tabIndex={0} onFocus={()=>editing.select(id)} onInput={event=>{
    const next=(event.currentTarget.innerText??event.currentTarget.textContent??'').slice(0,limit)
    if((event.currentTarget.innerText??event.currentTarget.textContent??'').length>limit)event.currentTarget.innerText=next
    editing.change(id,next)
  }} onPaste={event=>{
    event.preventDefault()
    const text=event.clipboardData.getData('text/plain').slice(0,limit)
    const selection=window.getSelection(), range=selection?.rangeCount?selection.getRangeAt(0):null
    if(range){range.deleteContents();const node=document.createTextNode(text);range.insertNode(node);range.setStartAfter(node);range.collapse(true);selection?.removeAllRanges();selection?.addRange(range)}
    const next=(event.currentTarget.innerText??event.currentTarget.textContent??'').slice(0,limit)
    if((event.currentTarget.innerText??event.currentTarget.textContent??'').length>limit)event.currentTarget.innerText=next
    editing.change(id,next)
  }}>{initial}</span>
}
export function ContentCollectionText({id,index,property,value}:{id:string;index:number;property:string;value:string}) {
  const editing=useVisualEditing(), values=useContentValues()
  if(!editing?.enabled)return <>{value}</>
  return <EditableText id={id} label={`${property==='question'?'Pergunta':'Resposta'} ${index+1}`} limit={property==='question'?250:2000} value={value} editing={{...editing,change:(_id,next)=>{
    const items=JSON.parse(values[id]) as Record<string,string>[]
    if(!items[index])return
    items[index]={...items[index],[property]:next}
    editing.change(id,JSON.stringify(items))
  }}}/>
}
export function ContentImage(props: ImageProps) {
  const text = useContentValue()
  const values = useContentValues()
  const editing = useVisualEditing()
  const field = typeof props.src === 'string' ? fieldByDefault.get(props.src) : undefined
  const positionKey = typeof props.src === 'string' ? `${fieldByDefault.get(props.src)?.id}-position` : ''
  return <Image {...props} data-cms-field={editing?.enabled ? field?.id : undefined} src={typeof props.src === 'string' ? text(props.src) : props.src} alt={text(props.alt)} style={{ ...props.style, ...(values[positionKey] ? { objectPosition: values[positionKey] } : {}) }} unoptimized={typeof props.src === 'string' && text(props.src).startsWith('/api/media/')} />
}
export function ContentAnchor(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const text = useContentValue()
  return <a {...props} href={props.href ? text(props.href) : undefined} aria-label={props['aria-label'] ? text(props['aria-label']) : undefined} />
}
export function ContentInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const text = useContentValue()
  return <input {...props} placeholder={props.placeholder ? text(props.placeholder) : undefined} aria-label={props['aria-label'] ? text(props['aria-label']) : undefined} />
}
