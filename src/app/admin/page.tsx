import { currentUser } from '@/lib/cms/auth'
import { readState, publicUser, type CmsState, type CmsUser } from '@/lib/cms/store'
import { AdminPanel } from '@/components/cms/admin-panel'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Painel | Iasmin Portugal', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'
export default async function AdminPage() {
  let state: CmsState | null = null
  let user: CmsUser | null = null
  try {
    state = await readState(); user = await currentUser()
  } catch { /* Configuration errors are shown without exposing credentials. */ }
  if (!state) return <AdminPanel mode="unavailable" />
  return <AdminPanel key={user ? user.id : 'access'} mode={user ? 'editor' : 'login'} initial={user ? { revision: state.contentRevision, draft: state.draft, published: state.published, publishedAt: state.publishedAt, history: state.history, media: state.media, user: publicUser(user), storage: process.env.DATABASE_URL ? 'database' : 'local' } : undefined} />
}
