import type { Metadata } from 'next'

import { JourneyShell } from '@/components/percurso/journey-shell'
import { publicContent } from '@/lib/cms/store'
import { resolveContent } from '@/lib/cms/catalog'

export async function generateMetadata(): Promise<Metadata> {
  const values = await publicContent()
  return {
  title: resolveContent(values, 'Percurso de autoconhecimento | Iasmin Portugal'),
  description: resolveContent(values, 'Um percurso de reflexão com cinco perguntas.'),
  }
}

export default function JourneyPage() {
  return <JourneyShell />
}
