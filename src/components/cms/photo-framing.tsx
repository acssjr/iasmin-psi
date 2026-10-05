'use client'
/* eslint-disable @next/next/no-img-element */
import { useRef, type PointerEvent } from 'react'
import styles from './photo-framing.module.css'

function coordinates(value:string) {
  const parts=value.split(' ')
  const named:Record<string,number>={left:0,top:0,center:50,right:100,bottom:100}
  return parts.map(part=>named[part]??parseFloat(part))
}
export function PhotoFraming({src,value,onChange,disabled,label,ratio=0.8}:{src:string;value:string;onChange:(value:string)=>void;disabled:boolean;label:string;ratio?:number}) {
  const surface=useRef<HTMLDivElement>(null)
  const [x,y]=coordinates(value)
  const update=(event:PointerEvent<HTMLDivElement>)=>{
    if(disabled||!surface.current)return
    const rect=surface.current.getBoundingClientRect()
    const bound=(v:number)=>Math.round(Math.max(0,Math.min(100,v)))
    onChange(`${bound((event.clientX-rect.left)/rect.width*100)}% ${bound((event.clientY-rect.top)/rect.height*100)}%`)
  }
  return <div className={styles.framing}>
    <div ref={surface} className={styles.surface} style={{aspectRatio:ratio}} role="slider" tabIndex={disabled?-1:0} aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={x} aria-valuetext={`Horizontal ${x}%, vertical ${y}%`} aria-disabled={disabled}
      onPointerDown={event=>{if(disabled)return;event.currentTarget.setPointerCapture(event.pointerId);update(event)}}
      onPointerMove={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))update(event)}}
      onPointerUp={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId)}}
      onKeyDown={event=>{const moves:Record<string,number[]>={ArrowLeft:[-2,0],ArrowRight:[2,0],ArrowUp:[0,-2],ArrowDown:[0,2]};const move=moves[event.key];if(disabled||!move)return;event.preventDefault();onChange(`${Math.max(0,Math.min(100,x+move[0]))}% ${Math.max(0,Math.min(100,y+move[1]))}%`)}}>
      <img src={src} alt="Prévia do enquadramento da foto" draggable={false} style={{objectPosition:value}}/>
      <span className={styles.grid}/><span className={styles.focus} style={{left:`${x}%`,top:`${y}%`}}/>
      <span className={styles.caption}>Arraste o ponto de foco</span>
    </div>
    <p>Toque ou arraste para ajustar. O site mostra o recorte ao vivo.</p>
    <div className={styles.presets}>{[['center center','Centro'],['center top','Topo'],['left center','Esquerda'],['right center','Direita']].map(([position,name])=><button key={position} type="button" disabled={disabled} aria-pressed={value===position} onClick={()=>onChange(position)}>{name}</button>)}</div>
  </div>
}
