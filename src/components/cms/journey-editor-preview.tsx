'use client'
import Link from 'next/link'
import { journeyTopics, journeyTopicIds } from '@/lib/journey-content'
import { JourneyIntro, ContactForm } from '@/components/percurso/journey-intro'
import { JourneyQuestion } from '@/components/percurso/journey-question'
import { JourneyResult } from '@/components/percurso/journey-result'
import { JourneyTopicSelection } from '@/components/percurso/journey-topic'
import { JourneyPreparing } from '@/components/percurso/journey-preparing'
import { BrandLogo } from '@/components/brand-logo'
import { ContentText } from './content'
import type { JourneyTopicId, JourneyResultKey } from '@/lib/types'
import styles from '@/components/percurso/journey.module.css'

export function JourneyEditorPreview({ topic: requestedTopic, screen='intro' }: {topic?:string;screen?:string}) {
  const topicId=journeyTopicIds.includes(requestedTopic as JourneyTopicId)?requestedTopic as JourneyTopicId:journeyTopicIds[0]
  const topic=journeyTopics[topicId]
  let content
  if(screen==='intro') content=<JourneyIntro onStart={()=>{}} />
  else if(screen==='themes') content=<JourneyTopicSelection onSelect={()=>{}} />
  else if(screen==='contact') content=<ContactForm contact={{name:'',email:'',whatsapp:''}} onChange={()=>{}} onContinue={()=>{}} />
  else if(screen==='preparing') content=<JourneyPreparing />
  else if(screen.startsWith('result-')) {
    const reflection=topic.directions[Number(screen.slice(7))] || topic.directions[0]
    content=<JourneyResult reflectionKey={`${topicId}:${reflection}` as JourneyResultKey} topicId={topicId} scheduleHref="https://wa.me/5575981234176" />
  } else {
    const question=topic.questions[Number(screen.replace('question-',''))-1] || topic.questions[0]
    content=<JourneyQuestion question={question} topicTitle={topic.title} total={topic.questions.length} onBack={()=>{}} onSelect={()=>{}} onSubmit={()=>{}} />
  }
  return <main className={styles.page}><header className={styles.header}><Link href="/" aria-label="Voltar para a página inicial"><BrandLogo className={styles.headerLogo} variant="signature" tone="terracotta" /></Link><span><ContentText fallback="Psicologia clínica" /></span></header><section className={styles.shell}>{content}</section></main>
}
