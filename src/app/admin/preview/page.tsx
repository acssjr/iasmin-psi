import { redirect } from 'next/navigation'
import { authenticated } from '@/lib/cms/auth'
import { readState } from '@/lib/cms/store'
import { ContentProvider } from '@/components/cms/content'
import LandingPage from '@/components/landing/landing-page'
import { JourneyShell } from '@/components/percurso/journey-shell'
import PrivacyPage from '@/app/privacidade/page'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Prévia | Iasmin Portugal', robots: { index: false, follow: false } }
export default async function Preview({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  if (!await authenticated()) redirect('/admin')
  const state = await readState(), { page } = await searchParams
  return <ContentProvider values={state.draft}>{page === 'percurso' ? <JourneyShell /> : page === 'privacidade' ? <PrivacyPage /> : <LandingPage />}</ContentProvider>
}
