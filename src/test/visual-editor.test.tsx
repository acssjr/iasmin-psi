import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import { VisualEditor } from '@/components/cms/visual-editor'
import { ContentProvider, ContentText } from '@/components/cms/content'
import { defaults, fields } from '@/lib/cms/catalog'
import { editorSections, fieldsForSection } from '@/lib/cms/editor-structure'
import { readEditorChange } from '@/lib/cms/editor-messages'
import { validateContent } from '@/lib/cms/catalog'
import { PhotoFraming } from '@/components/cms/photo-framing'

afterEach(cleanup)
it('adjusts photo framing with the keyboard and validates precise positions for saving',()=>{
  const change=vi.fn()
  render(<PhotoFraming src="/images/hero-terracotta.jpg" value="center center" onChange={change} disabled={false} label="Enquadramento"/>)
  fireEvent.keyDown(screen.getByRole('slider'),{key:'ArrowRight'})
  expect(change).toHaveBeenCalledWith('52% 50%')
  const position=fields.find(f=>f.kind==='position')!
  expect(validateContent({...defaults,[position.id]:'52% 50%'})[position.id]).toBe('52% 50%')
  expect(()=>validateContent({...defaults,[position.id]:'101% 50%'})).toThrow()
})
const title=fields.find(f=>f.label==='Título principal')!
it('covers every editable field with real sections and keeps the complete hero together',()=>{
  expect(fields.filter(f=>!editorSections.some(s=>fieldsForSection(s.id).includes(f)))).toEqual([])
  const hero=fieldsForSection('hero')
  expect(hero).toContain(title)
  expect(hero.some(f=>f.kind==='image')).toBe(true)
  expect(hero.some(f=>f.kind==='position')).toBe(true)
  expect(hero.some(f=>f.default==='Agendar uma sessão')).toBe(true)
})
it('keeps editing markers out of the public site',()=>{
  const {container}=render(<ContentProvider values={defaults}><h1><ContentText fallback={title.default}/></h1></ContentProvider>)
  expect(container.querySelector('[contenteditable]')).toBeNull()
  expect(container.querySelector('[data-cms-field]')).toBeNull()
  expect(screen.getByRole('heading')).toHaveTextContent(title.default)
})
it('accepts editable text and valid collections while rejecting unknown ids and unsafe galleries',()=>{
  const change=(id:string,value:unknown)=>readEditorChange({channel:'iasmin-editor',type:'change',id,value})
  expect(change(title.id,'Um novo texto')).toEqual({id:title.id,value:'Um novo texto'})
  expect(change('nonexistent','abc')).toBeNull()
  expect(change(title.id,123)).toBeNull()
  expect(change(title.id,'a'.repeat(6001))).toBeNull()
  expect(change('faq_collection',JSON.stringify([{question:'Como funciona?',answer:'Vamos conversar.'}]))).not.toBeNull()
  expect(change('faq_collection','invalid')).toBeNull()
  expect(change('editorial_collection',JSON.stringify([{src:'https://evil.example/x.jpg',alt:'Foto'}]))).toBeNull()
})
it('only accepts editor changes from its own iframe on the same origin',async()=>{
  const onChange=vi.fn()
  render(<VisualEditor values={defaults} onChange={onChange} onChoose={()=>{}} onSave={()=>{}} busy={false} dirty={false}/>)
  const frame=screen.getByTitle('Site com edição visual') as HTMLIFrameElement
  const data={channel:'iasmin-editor',type:'change',id:title.id,value:'Texto editado'}
  fireEvent(window,new MessageEvent('message',{origin:'https://evil.example',source:frame.contentWindow,data}))
  fireEvent(window,new MessageEvent('message',{origin:window.location.origin,source:window,data}))
  expect(onChange).not.toHaveBeenCalled()
  fireEvent(window,new MessageEvent('message',{origin:window.location.origin,source:frame.contentWindow,data}))
  expect(onChange).toHaveBeenCalledWith(title.id,'Texto editado')
  fireEvent(window,new MessageEvent('message',{origin:window.location.origin,source:frame.contentWindow,data:{channel:'iasmin-editor',type:'ready'}}))
  await waitFor(()=>expect(screen.queryByText('Preparando seu site para editar…')).not.toBeInTheDocument())
})
it('opens any quiz question directly without asking for visitor contact details',async()=>{
  const user=userEvent.setup()
  render(<VisualEditor values={defaults} onChange={()=>{}} onChoose={()=>{}} onSave={()=>{}} busy={false} dirty={false}/>)
  await user.selectOptions(screen.getByLabelText('Página'),'percurso')
  await user.selectOptions(screen.getByLabelText('Tela'),'question-4')
  expect(screen.getByTitle('Site com edição visual')).toHaveAttribute('src',expect.stringContaining('screen=question-4'))
  expect(screen.getByTitle('Site com edição visual')).toHaveAttribute('src',expect.stringContaining('edit=1'))
})
