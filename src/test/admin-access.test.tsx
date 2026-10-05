// @vitest-environment node
import { beforeEach, expect, it, vi } from 'vitest'
import AdminPage from '@/app/admin/page'
import ActivationPage from '@/app/admin/ativar/page'

const mocks = vi.hoisted(() => ({ readState: vi.fn(), currentUser: vi.fn(), redirect: vi.fn() }))
vi.mock('@/lib/cms/store', () => ({ readState: mocks.readState }))
vi.mock('@/lib/cms/auth', () => ({ currentUser: mocks.currentUser }))
vi.mock('next/navigation', () => ({ redirect: mocks.redirect }))
vi.mock('@/components/cms/admin-panel', () => ({ AdminPanel: () => null }))

beforeEach(() => {
  vi.resetAllMocks()
  mocks.currentUser.mockResolvedValue(null)
  mocks.readState.mockResolvedValue({ users: [] })
  mocks.redirect.mockImplementation(() => { throw new Error('redirect') })
})

it('opens the regular login even before an account exists', async () => {
  expect((await AdminPage()).props.mode).toBe('login')
})

it('keeps first activation on its dedicated route', async () => {
  expect((await ActivationPage()).props.mode).toBe('setup')
})

it('redirects activation to admin once an account exists', async () => {
  mocks.readState.mockResolvedValue({ users: [{ username: 'admin' }] })
  await expect(ActivationPage()).rejects.toThrow('redirect')
  expect(mocks.redirect).toHaveBeenCalledWith('/admin')
})
