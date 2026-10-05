'use client'
import { useEffect, useState } from 'react'

type PhotoAction={id:string;key:string;left:number;top:number}
export function PreviewPhotoActions({enabled}:{enabled:boolean}) {
  const [photos,setPhotos]=useState<PhotoAction[]>([])
  useEffect(()=>{
    if(!enabled)return
    let frame=0
    const measure=()=>{
      frame=0
      const next=Array.from(document.querySelectorAll<HTMLImageElement>('img[data-cms-field],img[data-cms-photo-id]')).flatMap((image,index)=>{
        const rect=image.getBoundingClientRect(),id=image.dataset.cmsPhotoId||image.dataset.cmsField
        if(!id||rect.width<80||rect.height<60||rect.bottom<110||rect.top>window.innerHeight-60||rect.right<0||rect.left>window.innerWidth)return []
        return [{id,key:`${id}-${index}`,left:Math.max(12,rect.left+12),top:Math.min(window.innerHeight-12,Math.max(150,rect.bottom-12))}]
      })
      setPhotos(current=>JSON.stringify(current)===JSON.stringify(next)?current:next)
    }
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(measure)}
    const observer=new ResizeObserver(schedule)
    document.querySelectorAll('img').forEach(image=>observer.observe(image))
    const mutations=new MutationObserver(schedule)
    mutations.observe(document.body,{subtree:true,attributes:true,attributeFilter:['src','style']})
    window.addEventListener('scroll',schedule,{passive:true})
    window.addEventListener('resize',schedule)
    document.addEventListener('load',schedule,true)
    schedule()
    return()=>{cancelAnimationFrame(frame);observer.disconnect();mutations.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);document.removeEventListener('load',schedule,true)}
  },[enabled])
  if(!enabled)return null
  return <div>{photos.map(photo=><button key={photo.key} type="button" className="cms-photo-action" data-cms-photo-action={photo.id} style={{left:photo.left,top:photo.top}}>↗ Alterar foto</button>)}</div>
}
