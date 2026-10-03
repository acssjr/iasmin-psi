import { render, screen, cleanup } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import LandingPage from '@/components/landing/landing-page'
import { JourneyQuestion } from '@/components/percurso/journey-question'
import { JourneyResult } from '@/components/percurso/journey-result'
import { ContentProvider } from '@/components/cms/content'
import { defaults, fields } from '@/lib/cms/catalog'
import { journeyTopics, getJourneyReflection } from '@/lib/journey-content'

vi.mock('next/navigation', () => ({ useRouter: () => ({ prefetch: vi.fn(), push: vi.fn() }) }))
afterEach(cleanup)
const fieldId = (original: string) => fields.find(field => field.default === original)!.id
it('exibe título, foto, contato, FAQ e galeria editados no site real', () => {
  const image='/api/media/8b9b3cef-d1be-4b37-a9be-d612636e840e'
  const values={...defaults,
    [fieldId('O cuidado que faz sentido começa no seu contexto.')]: 'Um título publicado pelo painel',
    [fieldId('/images/iasmin/hero-terracotta.jpg')]: image,
    [fieldId('Iasmin Portugal em atendimento')]: 'Retrato atualizado',
    [fields.find(field=>field.default.startsWith('https://wa.me/'))!.id]: 'https://wa.me/5511999999999',
    faq_collection: JSON.stringify([{question:'Uma nova pergunta no painel?',answer:'Uma resposta editável.'}]),
    editorial_collection: JSON.stringify([{src:image,alt:'Uma reflexão nova'}]),
  }
  render(<ContentProvider values={values}><LandingPage /></ContentProvider>)
  expect(screen.getByRole('heading',{name:'Um título publicado pelo painel'})).toBeVisible()
  expect(screen.getByAltText('Retrato atualizado')).toHaveAttribute('src',image)
  expect(screen.getAllByRole('link',{name:'Agendar uma sessão'})[0]).toHaveAttribute('href','https://wa.me/5511999999999')
  expect(screen.getByRole('button',{name:'Uma nova pergunta no painel?'})).toBeVisible()
  expect(screen.getByAltText('Uma reflexão nova')).toHaveAttribute('src',image)
})
it('edita redação do percurso mantendo o identificador enviado ao selecionar uma opção', async () => {
  const topic=journeyTopics['ansiedade-sobrecarga'],question=topic.questions[0],selected=vi.fn()
  const values={...defaults,[fieldId(question.prompt)]:'O que você gostaria de observar hoje?',[fieldId(question.options[0].label)]:'Minha alternativa editada'}
  render(<ContentProvider values={values}><JourneyQuestion question={question} total={5} topicTitle={topic.title} onSelect={selected} onBack={vi.fn()} onSubmit={vi.fn()} /></ContentProvider>)
  expect(screen.getByRole('heading',{name:'O que você gostaria de observar hoje?'})).toBeVisible()
  await userEvent.click(screen.getByRole('radio',{name:'Minha alternativa editada'}))
  expect(selected).toHaveBeenCalledWith(question.options[0].id)
})
it('aplica a redação editada à devolutiva correspondente ao resultado original', () => {
  const reflection=getJourneyReflection('ansiedade-sobrecarga','ansiedade-sobrecarga:pace')
  const values={...defaults,[fieldId(reflection.title)]:'Uma devolutiva atualizada',[fieldId(reflection.body)]:'Texto do resultado editado no painel.'}
  render(<ContentProvider values={values}><JourneyResult topicId="ansiedade-sobrecarga" reflectionKey="ansiedade-sobrecarga:pace" scheduleHref="https://wa.me/5511999999999" /></ContentProvider>)
  expect(screen.getByRole('heading',{name:'Uma devolutiva atualizada'})).toBeVisible()
  expect(screen.getByText('Texto do resultado editado no painel.')).toBeVisible()
})
