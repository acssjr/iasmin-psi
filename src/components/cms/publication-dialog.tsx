'use client'

import { useEffect, useRef, useState } from 'react'
import { Modal } from './modal'
import panel from './admin-panel.module.css'
import styles from './publication-dialog.module.css'

export type PublicationReceipt = { publishedAt: string; local: boolean; count: number }
export function PublicationDialog({ stage, receipt, groups, local, error, onPublish, onClose }: {
  stage: 'confirm' | 'publishing' | 'success'; receipt: PublicationReceipt | null
  groups: { name: string; count: number }[]; local: boolean; error: string
  onPublish: () => void; onClose: () => void
}) {
  const count = groups.reduce((sum, group) => sum + group.count, 0)
  const [slow, setSlow] = useState(false)
  const status = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (stage === 'confirm') return
    status.current?.focus({ preventScroll: true })
    if (stage !== 'publishing') return
    const timer = window.setTimeout(() => setSlow(true), 12_000)
    return () => window.clearTimeout(timer)
  }, [stage])
  return <Modal title={stage === 'confirm' ? 'Confirmar publicação' : stage === 'publishing' ? 'Publicação em andamento' : 'Publicação concluída'} onClose={onClose}>
    {stage === 'confirm' ? <>
      <p>{local ? 'As alterações serão aplicadas apenas neste site local.' : 'As alterações serão aplicadas ao site público.'} São {count} {count === 1 ? 'alteração' : 'alterações'}.</p>
      <div className={panel.changeList}>{groups.map(group => <p key={group.name}>{group.name}<span>{group.count} {group.count === 1 ? 'campo' : 'campos'}</span></p>)}</div>
      <p className={panel.hint}>Uma cópia da versão atual será guardada no histórico.</p>
      {error && <p role="alert" className={panel.error}>{error}</p>}
      <div className={`${panel.modalActions} ${styles.actions}`}><button onClick={onClose}>Continuar revisando</button><button className={panel.primary} onClick={() => { setSlow(false); onPublish() }}>Publicar alterações</button></div>
    </> : <div className={styles.feedback}>
      <div className={`${styles.symbol} ${stage === 'success' ? styles.success : ''}`} aria-hidden="true">{stage === 'success' ? <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="2"><path d="m8 16 5 5 11-11" /></svg> : <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M16 22V6m-6 6 6-6 6 6M7 21v6h18v-6" /></svg>}</div>
      <div ref={status} className={styles.status} tabIndex={-1} role="status" aria-live="polite" aria-atomic="true">
        <h3>{stage === 'publishing' ? 'Publicando alterações' : receipt?.local ? 'Publicado no site local' : 'Seu site foi atualizado'}</h3>
        <p>{stage === 'publishing' ? 'Aguardando a confirmação do servidor.' : receipt?.local ? 'As alterações estão disponíveis neste ambiente. O domínio oficial continua como estava.' : 'As alterações já estão disponíveis para os visitantes.'}</p>
      </div>
      {stage === 'publishing' ? <>
        <div className={styles.track} aria-hidden="true"><span /></div>
        <p className={styles.detail}>{slow ? 'Está levando mais tempo que o habitual. A publicação continua em andamento.' : 'Você pode fechar esta janela. A confirmação aparecerá quando a publicação terminar.'}</p>
      </> : receipt && <>
        <p className={styles.detail}>{receipt.count} {receipt.count === 1 ? 'alteração publicada' : 'alterações publicadas'} · {new Date(receipt.publishedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Bahia' })}</p>
        <div className={`${panel.modalActions} ${styles.actions}`}><button onClick={onClose}>Voltar à edição</button><a className={styles.visit} href="/" target="_blank" rel="noopener noreferrer">Ver site em outra janela <span aria-hidden="true">↗</span></a></div>
      </>}
    </div>}
  </Modal>
}
