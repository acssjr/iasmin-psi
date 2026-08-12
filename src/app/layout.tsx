import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Plus_Jakarta_Sans } from 'next/font/google'

import { SafeAnalytics } from '@/components/safe-analytics'

import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-plus-jakarta',
  weight: ['400', '500', '600', '700', '800'],
})

export const metadata: Metadata = {
  title: 'Iasmin Portugal | Psicóloga Clínica',
  description: 'Psicologia clínica on-line para adolescentes e adultos.',
  icons: {
    icon: '/brand/iasmin-portugal-monogram.svg',
    shortcut: '/brand/iasmin-portugal-monogram.svg',
  },
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={plusJakarta.variable}>
        {children}
        <SafeAnalytics />
      </body>
    </html>
  )
}
