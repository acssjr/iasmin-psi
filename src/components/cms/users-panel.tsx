'use client'

import { useEffect, useState, type FormEvent } from 'react'
import type { PublicUser } from '@/lib/cms/store'
import styles from './users-panel.module.css'

const roleLabel = (role: PublicUser['role']) => role === 'admin' ? 'Administrador' : 'Editor'
const lastAccess = (date: string | null) => date ? new Date(date).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Bahia' }) : 'Nenhum login registrado'
type FormMode = { kind: 'create' } | { kind: 'update' | 'password'; user: PublicUser }

export function UsersPanel({ current, onCurrentChange }: { current: PublicUser; onCurrentChange: (user: PublicUser) => void }) {
  const [users, setUsers] = useState<PublicUser[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [form, setForm] = useState<FormMode | null>(null)
  const [revoke, setRevoke] = useState<string | null>(null)
  const [refresh, setRefresh] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/admin/users', { cache: 'no-store', signal: controller.signal }).then(async response => {
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      setUsers(result.users)
    }).catch(error => { if (!controller.signal.aborted) setError(error instanceof Error ? error.message : 'Não foi possível carregar os usuários. Tente atualizar a lista.') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [refresh])

  async function change(body: Record<string, unknown>, message: string) {
    setBusy(true); setError(''); setNotice('')
    try {
      const response = await fetch('/api/admin/users', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error)
      setUsers(result.users); setNotice(message); setForm(null); setRevoke(null)
      const self = (result.users as PublicUser[]).find(user => user.id === current.id)
      if (self) onCurrentChange(self)
    } catch (error) { setError(error instanceof Error ? error.message : 'Não foi possível atualizar. Tente novamente.') }
    finally { setBusy(false) }
  }
  function open(next: FormMode) { setForm(next); setError(''); setNotice(''); setRevoke(null) }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!form) return
    const data = Object.fromEntries(new FormData(event.currentTarget))
    if (form.kind !== 'update' && data.password !== data.confirm) { setError('As senhas precisam ser iguais.'); return }
    await change({ ...data, action: form.kind, ...(form.kind === 'create' ? {} : { id: form.user.id }) }, form.kind === 'create' ? 'Acesso criado. Compartilhe o usuário e a senha com essa pessoa por um canal privado.' : form.kind === 'password' ? 'Senha atualizada. As sessões dessa pessoa foram encerradas.' : 'Dados do usuário atualizados.')
  }
  return <section className={styles.panel} aria-labelledby="users-title">
    <div className={styles.heading}><div><h1 id="users-title">Usuários</h1><p>Gerencie os usuários, as permissões e os acessos ao painel.</p></div><button className={styles.primary} disabled={busy || loading} onClick={() => open({ kind: 'create' })}>Adicionar usuário</button></div>
    <div aria-live="polite">{notice && <p className={styles.success} role="status">{notice}</p>}{error && <p className={styles.error} role="alert">{error}</p>}</div>
    {form && <form key={form.kind === 'create' ? 'create' : `${form.kind}-${form.user.id}`} className={styles.form} onSubmit={submit}>
      <h2>{form.kind === 'create' ? 'Novo acesso' : form.kind === 'password' ? `Nova senha para ${form.user.name}` : `Editar ${form.user.name}`}</h2>
      {form.kind !== 'password' && <div className={styles.fields}>
        <label>Nome da pessoa<input name="name" autoComplete="off" required maxLength={80} defaultValue={form.kind === 'update' ? form.user.name : ''} /></label>
        <label>Usuário de acesso<input name="username" autoComplete="off" required minLength={3} maxLength={32} pattern="[a-zA-Z0-9][a-zA-Z0-9._\-]{2,31}" defaultValue={form.kind === 'update' ? form.user.username : ''} /><small>De 3 a 32 caracteres. Letras, números, ponto, hífen ou sublinhado.</small></label>
        <label>Permissão<select name="role" defaultValue={form.kind === 'update' ? form.user.role : 'editor'} disabled={form.kind === 'update' && form.user.id === current.id}><option value="editor">Editor</option><option value="admin">Administrador</option></select>{form.kind === 'update' && form.user.id === current.id && <input type="hidden" name="role" value={form.user.role} />}<small>Editor altera e publica o site. Administrador também gerencia usuários.</small></label>
      </div>}
      {form.kind !== 'update' && <><div className={styles.fields}><label>Senha<input name="password" type="password" autoComplete="new-password" required minLength={8} maxLength={128} /><small>Use pelo menos 8 caracteres.</small></label><label>Repita a senha<input name="confirm" type="password" autoComplete="new-password" required minLength={8} maxLength={128} /></label></div>{form.kind === 'password' && <p>Ao salvar, essa pessoa precisará entrar novamente com a nova senha.</p>}</>}
      {form.kind === 'update' && form.user.id === current.id && <p>Se alterar seu usuário de acesso, será necessário entrar novamente. Sua senha continua a mesma.</p>}
      <div className={styles.formActions}><button className={styles.primary} disabled={busy}>{busy ? 'Salvando…' : form.kind === 'create' ? 'Criar acesso' : 'Salvar alterações'}</button><button type="button" disabled={busy} onClick={() => { setForm(null); setError('') }}>Cancelar</button></div>
    </form>}
    <div className={styles.listHeading}><h2>Acessos ao painel</h2><button disabled={busy || loading} onClick={() => { setLoading(true); setError(''); setRefresh(value => value + 1) }}>{loading ? 'Carregando…' : 'Atualizar lista'}</button></div>
    <p className={styles.help}>Último acesso é o último login bem-sucedido, no horário da Bahia. Contas antigas começam sem registro.</p>
    {loading ? <p role="status">Carregando os acessos…</p> : <ul className={styles.list} aria-label="Usuários do painel">{users.map(user => <li key={user.id} className={styles.row}>
      <div className={styles.person}><strong>{user.name}{user.id === current.id && <span> · Você</span>}</strong><span>@{user.username}</span></div>
      <div><span className={styles.label}>Permissão e acesso</span><strong>{roleLabel(user.role)}</strong><span className={user.active ? styles.active : styles.inactive}>{user.active ? 'Ativo' : 'Revogado'}</span></div>
      <div className={styles.lastAccess}><span className={styles.label}>Último acesso</span>{user.lastLoginAt ? <time dateTime={user.lastLoginAt}>{lastAccess(user.lastLoginAt)}</time> : <span>{lastAccess(null)}</span>}</div>
      <div className={styles.actions}><button disabled={busy} onClick={() => open({ kind: 'update', user })} aria-label={`Editar ${user.name}`}>Editar</button>{user.id !== current.id && <><button disabled={busy} onClick={() => open({ kind: 'password', user })} aria-label={`Redefinir senha de ${user.name}`}>Nova senha</button><button disabled={busy} onClick={() => user.active ? setRevoke(user.id) : void change({ action: 'access', id: user.id, active: true }, `Acesso de ${user.name} reativado.`)} aria-label={`${user.active ? 'Revogar' : 'Reativar'} acesso de ${user.name}`}>{user.active ? 'Revogar' : 'Reativar'}</button></>}</div>
      {revoke === user.id && <div className={styles.confirmation}><p>Revogar o acesso de <strong>{user.name}</strong>? As sessões serão encerradas. Você poderá reativar o acesso depois.</p><div><button className={styles.primary} disabled={busy} onClick={() => void change({ action: 'access', id: user.id, active: false }, `Acesso de ${user.name} revogado.`)}>Confirmar revogação</button><button disabled={busy} onClick={() => setRevoke(null)}>Cancelar</button></div></div>}
    </li>)}</ul>}
  </section>
}
