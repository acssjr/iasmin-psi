import { authenticated } from '@/lib/cms/auth'
import { readState, type CmsState } from '@/lib/cms/store'
import { AdminPanel } from '@/components/cms/admin-panel'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Painel | Iasmin Portugal', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'
export default async function AdminPage() {
  let state: CmsState | null = null
  let loggedIn = false
  try {
    state = await readState(); loggedIn = await authenticated()
  } catch { /* Configuration errors are shown without exposing credentials. */ }
  if (!state) return <AdminPanel mode="unavailable" />
  return <AdminPanel key={loggedIn ? 'editor' : 'access'} mode={loggedIn ? 'editor' : state.account ? 'login' : 'setup'} initial={loggedIn ? { revision: state.revision, draft: state.draft, published: state.published, publishedAt: state.publishedAt, history: state.history, media: state.media, email: state.account?.email } : undefined} />
}
