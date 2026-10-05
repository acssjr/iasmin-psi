'use client'
/* eslint-disable @next/next/no-img-element */
import { fields, type ContentValues } from '@/lib/cms/catalog'
import { FaqEditor, GalleryEditor } from './collection-editors'
import styles from './admin-panel.module.css'
import { PhotoFraming } from './photo-framing'

export function FieldControl({field,values,onChange,onChoose,disabled=false,photoRatio}:{field:typeof fields[number];values:ContentValues;onChange:(id:string,value:string)=>void;onChoose:(id:string)=>void;disabled?:boolean;photoRatio?:number}) {
  const value=values[field.id]??field.default, id=`visual-field-${field.id}`
  const multiline=field.kind==='text'&&(field.default.length>70||/título|enunciado|apresentação|mensagem|devolutiva/i.test(field.label))
  return <div className={styles.field} data-field-control={field.id}>
    <div className={styles.fieldHeading}><label htmlFor={id}>{field.label.length>85?`${field.label.slice(0,82)}…`:field.label}</label><button type="button" disabled={disabled||value===field.default} onClick={()=>onChange(field.id,field.default)}>Restaurar</button></div>
    {field.kind==='faq'?<FaqEditor value={value} disabled={disabled} onChange={v=>onChange(field.id,v)}/>:field.kind==='gallery'?<GalleryEditor value={value} disabled={disabled} onChange={v=>onChange(field.id,v)} onChoose={i=>onChoose(`${field.id}:${i}`)}/>:field.kind==='image'?<div className={styles.imageField}>{!fields.some(f=>f.id===`${field.id}-position`)&&<img src={value} alt="Imagem usada nesta seção"/>}<button disabled={disabled} onClick={()=>onChoose(field.id)}>Trocar imagem</button></div>:field.kind==='position'?<PhotoFraming src={values[field.id.replace(/-position$/, '')]||fields.find(f=>f.id===field.id.replace(/-position$/, ''))?.default||''} value={value} disabled={disabled} label={field.label} ratio={photoRatio} onChange={v=>onChange(field.id,v)}/>:multiline?<textarea id={id} value={value} rows={4} maxLength={6000} disabled={disabled} onChange={e=>onChange(field.id,e.target.value)}/>:<input id={id} type={field.kind==='url'?'url':'text'} value={value} maxLength={6000} disabled={disabled} onChange={e=>onChange(field.id,e.target.value)}/>}
    {field.kind==='image'&&<small>Escolha da biblioteca ou envie uma nova foto. Ajuste o recorte na prévia de enquadramento abaixo.</small>}
    {field.kind==='url'&&<small>Use um endereço completo com https://.</small>}
  </div>
}
