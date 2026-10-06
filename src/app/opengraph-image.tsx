import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'Iasmin Portugal — Psicologia clínica on-line para adolescentes e adultos'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  const photo = await readFile(join(process.cwd(), 'public/images/iasmin/hero-terracotta.jpg'))
  return new ImageResponse(
    <div style={{ display: 'flex', width: '100%', height: '100%', background: '#f2eadf', color: '#402419' }}>
      <div style={{ display: 'flex', flexDirection: 'column', width: 700, padding: '64px 60px', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}><div style={{ fontFamily: 'serif', fontSize: 58, lineHeight: 1.05 }}>Iasmin Portugal</div><div style={{ fontSize: 18, letterSpacing: 3, marginTop: 14 }}>PSICÓLOGA CLÍNICA</div></div>
        <div style={{ display: 'flex', flexDirection: 'column' }}><div style={{ fontSize: 47, lineHeight: 1.2 }}>O cuidado começa no seu contexto.</div><div style={{ fontSize: 24, lineHeight: 1.5, marginTop: 22, color: '#796555' }}>Psicologia clínica on-line para adolescentes e adultos.</div></div>
        <div style={{ fontSize: 18, color: '#a65134' }}>iasminportugal.com.br</div>
      </div>
      {/* The supplied brand portrait retains its original framing. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={`data:image/jpeg;base64,${photo.toString('base64')}`} alt="" width={500} height={630} style={{ objectFit: 'cover', objectPosition: 'center' }} />
    </div>, size,
  )
}
