import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'Iasmin Portugal — Psicologia clínica on-line para adolescentes e adultos'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const [photo, logo, regular, semibold] = await Promise.all([
    readFile(join(process.cwd(), 'public/images/iasmin/hero-terracotta.jpg')),
    readFile(join(process.cwd(), 'public/brand/iasmin-portugal-full.svg')),
    readFile(join(process.cwd(), 'src/assets/fonts/saans-regular.otf')),
    readFile(join(process.cwd(), 'src/assets/fonts/saans-semibold.otf')),
  ])
  return new ImageResponse(
    <div style={{ display: 'flex', width: '100%', height: '100%', background: '#f2eadf', color: '#402419', fontFamily: 'Saans' }}>
      <div style={{ display: 'flex', flexDirection: 'column', width: 700, padding: '48px 60px', justifyContent: 'space-between' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/svg+xml;base64,${logo.toString('base64')}`} alt="" width={320} height={160} />
        <div style={{ display: 'flex', flexDirection: 'column' }}><div style={{ fontSize: 47, fontWeight: 600, lineHeight: 1.2 }}>O cuidado começa no seu contexto.</div><div style={{ fontSize: 24, lineHeight: 1.5, marginTop: 22, color: '#796555' }}>Psicologia clínica on-line para adolescentes e adultos.</div></div>
        <div style={{ fontSize: 18, color: '#a65134' }}>iasminportugal.com.br</div>
      </div>
      <div style={{ display: 'flex', width: 500, padding: 24 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`data:image/jpeg;base64,${photo.toString('base64')}`} alt="" width={452} height={582} style={{ objectFit: 'cover', objectPosition: 'center', borderRadius: 40 }} />
      </div>
    </div>, {
      ...size,
      fonts: [
        { name: 'Saans', data: regular.buffer.slice(regular.byteOffset, regular.byteOffset + regular.byteLength) as ArrayBuffer, weight: 400, style: 'normal' },
        { name: 'Saans', data: semibold.buffer.slice(semibold.byteOffset, semibold.byteOffset + semibold.byteLength) as ArrayBuffer, weight: 600, style: 'normal' },
      ],
    },
  )
}

