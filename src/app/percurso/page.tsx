import type { Metadata } from 'next'

import { JourneyShell } from '@/components/percurso/journey-shell'

export const metadata: Metadata = {
  title: 'Percurso de autoconhecimento | Iasmin Portugal',
  description: 'Um percurso de reflexão com cinco perguntas.',
}

export default function JourneyPage() {
  return <JourneyShell />
}
