'use client'
/* eslint-disable @next/next/no-img-element */
import { useId } from 'react'
import styles from './admin-panel.module.css'

function moveItem<T>(items: readonly T[], index: number, direction: number): T[] {
  const result = [...items]
  const target = index + direction
  if (target >= 0 && target < result.length) [result[index], result[target]] = [result[target], result[index]]
  return result
}
export function FaqEditor({value,onChange,disabled}:{value:string;onChange:(value:string)=>void;disabled:boolean}) {
  const id=useId()
  const items=JSON.parse(value) as {question:string;answer:string}[]
  const update=(index:number,key:'question'|'answer',text:string)=>onChange(JSON.stringify(items.map((item,i)=>i===index?{...item,[key]:text}:item)))
  return <div className={styles.collection}>{items.map((item,index)=><article key={index}><div className={styles.collectionHeading}><strong>Pergunta {index+1}</strong><div><button disabled={disabled||index===0} aria-label={`Mover pergunta ${index+1} para cima`} onClick={()=>{onChange(JSON.stringify(moveItem(items,index,-1)))}}>↑</button><button disabled={disabled||index===items.length-1} aria-label={`Mover pergunta ${index+1} para baixo`} onClick={()=>{onChange(JSON.stringify(moveItem(items,index,1)))}}>↓</button><button disabled={disabled||items.length===1} onClick={()=>onChange(JSON.stringify(items.filter((_,i)=>i!==index)))}>Remover</button></div></div><label htmlFor={`${id}-q-${index}`}>Pergunta</label><input id={`${id}-q-${index}`} disabled={disabled} value={item.question} maxLength={250} onChange={event=>update(index,'question',event.target.value)} /><label htmlFor={`${id}-a-${index}`}>Resposta</label><textarea id={`${id}-a-${index}`} disabled={disabled} value={item.answer} maxLength={2000} rows={4} onChange={event=>update(index,'answer',event.target.value)} /></article>)}<button disabled={disabled||items.length>=20} onClick={()=>onChange(JSON.stringify([...items,{question:'Nova pergunta',answer:'Escreva aqui a resposta.'}]))}>+ Adicionar pergunta</button><small>{items.length} de 20 perguntas · a ordem aqui é a ordem do site</small></div>
}
export function GalleryEditor({value,onChange,onChoose,disabled}:{value:string;onChange:(value:string)=>void;onChoose:(index:number)=>void;disabled:boolean}) {
  const id=useId(),items=JSON.parse(value) as {src:string;alt:string}[]
  return <div className={styles.collection}>{items.map((item,index)=><article key={index}><div className={styles.collectionHeading}><strong>Reflexão {index+1}</strong><div><button disabled={disabled||index===0} aria-label={`Mover imagem ${index+1} para cima`} onClick={()=>{onChange(JSON.stringify(moveItem(items,index,-1)))}}>↑</button><button disabled={disabled||index===items.length-1} aria-label={`Mover imagem ${index+1} para baixo`} onClick={()=>{onChange(JSON.stringify(moveItem(items,index,1)))}}>↓</button><button disabled={disabled||items.length===1} onClick={()=>onChange(JSON.stringify(items.filter((_,i)=>i!==index)))}>Remover</button></div></div><div className={styles.imageField}><img src={item.src} alt={item.alt}/><button disabled={disabled} onClick={()=>onChoose(index)}>Trocar imagem</button></div><label htmlFor={`${id}-alt-${index}`}>Descrição da imagem para acessibilidade</label><input id={`${id}-alt-${index}`} disabled={disabled} value={item.alt} maxLength={300} onChange={event=>onChange(JSON.stringify(items.map((image,i)=>i===index?{...image,alt:event.target.value}:image)))}/></article>)}<button disabled={disabled||items.length>=12} onClick={()=>onChange(JSON.stringify([...items,{src:items[0].src,alt:'Descreva o conteúdo desta imagem.'}]))}>+ Adicionar reflexão</button><small>{items.length} de 12 imagens · a ordem aqui é a ordem do site</small></div>
}
