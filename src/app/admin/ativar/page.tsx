import { redirect } from 'next/navigation'
import { readState, type CmsState } from '@/lib/cms/store'
import { AdminPanel } from '@/components/cms/admin-panel'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Ativar painel | Iasmin Portugal', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

export default async function ActivationPage() {
  let state: CmsState | null = null
  try { state = await readState() } catch { /* Keep configuration details private. */ }
  if (!state) return <AdminPanel mode="unavailable" />
  if (state.users.length) redirect('/admin')
  return <AdminPanel mode="setup" />
}
