import { defaults, fields, validateContent } from './catalog'

export function readEditorChange(message:unknown):{id:string;value:string}|null {
  if(!message||typeof message!=='object')return null
  const data=message as Record<string,unknown>
  if(data.channel!=='iasmin-editor'||data.type!=='change'||typeof data.id!=='string'||typeof data.value!=='string')return null
  const field=fields.find(f=>f.id===data.id)
  if(!field||!['text','faq','gallery'].includes(field.kind))return null
  if(field.kind==='text')return data.value.length<=6000?{id:data.id,value:data.value}:null
  if(data.value.length>50000)return null
  try {
    const items=JSON.parse(data.value)
    if(!Array.isArray(items))return null
    // Permit unfinished text while typing; saving still checks required fields.
    const check=JSON.stringify(items.map(item=>item&&typeof item==='object'?Object.fromEntries(Object.entries(item).map(([key,value])=>[key,['question','answer','alt'].includes(key)&&value===''?'Em edição':value])):item))
    validateContent({...defaults,[data.id]:check})
    return {id:data.id,value:data.value}
  }catch{return null}
}
