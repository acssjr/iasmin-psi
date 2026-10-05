import { redirect } from 'next/navigation'
import { authenticated } from '@/lib/cms/auth'
import { readState } from '@/lib/cms/store'
import { ContentProvider } from '@/components/cms/content'
import LandingPage from '@/components/landing/landing-page'
import { JourneyShell } from '@/components/percurso/journey-shell'
import PrivacyPage from '@/app/privacidade/page'
import type { Metadata } from 'next'
import { VisualPreview } from '@/components/cms/visual-preview'
import { JourneyEditorPreview } from '@/components/cms/journey-editor-preview'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Prévia | Iasmin Portugal', robots: { index: false, follow: false } }
export default async function Preview({ searchParams }: { searchParams: Promise<{ page?: string; edit?:string; topic?:string; screen?:string }> }) {
  if (!await authenticated()) redirect('/admin')
  const state = await readState(), { page,edit,topic,screen } = await searchParams
  if(edit==='1') return <VisualPreview initial={state.draft}>{page==='percurso'?<JourneyEditorPreview topic={topic} screen={screen}/>:page==='privacidade'?<PrivacyPage/>:<LandingPage/>}</VisualPreview>
  return <ContentProvider values={state.draft}>{page === 'percurso' ? <JourneyShell /> : page === 'privacidade' ? <PrivacyPage /> : <LandingPage />}</ContentProvider>
}
