'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BrandLogo } from '@/components/brand-logo'
import styles from './access-loading.module.css'

export function AccessLoading({ stage = 'loading' }: { stage?: 'authenticating' | 'opening' | 'loading' }) {
  const [slow, setSlow] = useState(false)
  const router = useRouter()
  const status = useRef<HTMLDivElement>(null)
  useEffect(() => {
    status.current?.focus({ preventScroll: true })
    const timer = window.setTimeout(() => setSlow(true), 12_000)
    return () => window.clearTimeout(timer)
  }, [stage])

  return <div className={styles.screen}>
    <div className={styles.content}>
      <div className={styles.mark} aria-hidden="true"><BrandLogo variant="monogram" decorative tone="terracotta" /></div>
      <p className={styles.eyebrow}>PAINEL ADMINISTRATIVO</p>
      <div ref={status} tabIndex={-1} role="status" aria-live="polite" aria-atomic="true" className={styles.status}>
        <h1>{stage === 'authenticating' ? 'Verificando seu acesso' : 'Abrindo o painel'}</h1>
        <p>{stage === 'authenticating' ? 'Conferindo usuário e senha.' : 'Carregando o conteúdo e as ferramentas de gestão.'}</p>
      </div>
      <div className={styles.track} aria-hidden="true"><span /></div>
      {stage !== 'loading' && <ol className={styles.steps} aria-label="Etapas de acesso">
        <li data-current={stage === 'authenticating'} data-complete={stage === 'opening'}><span aria-hidden="true">{stage === 'opening' ? '✓' : '1'}</span>{stage === 'opening' ? 'Acesso confirmado' : 'Verificar acesso'}</li>
        <li data-current={stage === 'opening'}><span aria-hidden="true">2</span>Abrir painel</li>
      </ol>}
      {slow && <div className={styles.slow} role="status"><p>Está levando mais tempo que o habitual. A solicitação continua em andamento.</p>{stage !== 'authenticating' && <button onClick={() => { router.replace('/admin'); router.refresh() }}>Tentar abrir novamente</button>}</div>}
    </div>
  </div>
}
