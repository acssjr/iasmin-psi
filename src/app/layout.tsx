import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Plus_Jakarta_Sans } from 'next/font/google'

import { SafeAnalytics } from '@/components/safe-analytics'
import { ContentProvider } from '@/components/cms/content'
import { publicContent } from '@/lib/cms/store'
import { resolveContent } from '@/lib/cms/catalog'

import './globals.css'
import 'overlayscrollbars/overlayscrollbars.css'
import { OverlayScrollbarSetup } from '@/components/overlay-scrollbars'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700', '800'],
})
const defaultIcons = {
  icon: '/brand/iasmin-portugal-monogram.svg',
  shortcut: '/brand/iasmin-portugal-monogram.svg',
}

export const dynamic = 'force-dynamic'
export async function generateMetadata(): Promise<Metadata> {
  const values = await publicContent()
  const title = resolveContent(values, 'Iasmin Portugal | Psicóloga Clínica')
  const description = resolveContent(values, 'Psicologia clínica on-line para adolescentes e adultos.')
  return {
  metadataBase: new URL('https://iasminportugal.com.br'),
  title,
  description,
  openGraph: { type: 'website', locale: 'pt_BR', siteName: 'Iasmin Portugal', title, description },
  twitter: { card: 'summary_large_image', title, description, images: ['/opengraph-image'] },
  icons: {
    icon: resolveContent(values, defaultIcons.icon),
    shortcut: resolveContent(values, defaultIcons.shortcut),
  },
  }
}

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const values = await publicContent()
  return (
    <html lang="pt-BR" data-overlayscrollbars-initialize="">
      <body className={plusJakarta.variable} data-overlayscrollbars-initialize="">
        <ContentProvider values={values}>{children}</ContentProvider>
        <SafeAnalytics />
        <OverlayScrollbarSetup key="scroll-activity" />
      </body>
    </html>
  )
}
