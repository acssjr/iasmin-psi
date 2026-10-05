import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { Modal } from '@/components/cms/modal'

const originalShow = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal')
const originalClose = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close')
beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: vi.fn(function (this: HTMLDialogElement) { this.setAttribute('open', '') }) })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: vi.fn(function (this: HTMLDialogElement) { this.removeAttribute('open') }) })
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})
afterEach(() => {
  cleanup(); vi.restoreAllMocks()
  if (originalShow) Object.defineProperty(HTMLDialogElement.prototype, 'showModal', originalShow)
  else Reflect.deleteProperty(HTMLDialogElement.prototype, 'showModal')
  if (originalClose) Object.defineProperty(HTMLDialogElement.prototype, 'close', originalClose)
  else Reflect.deleteProperty(HTMLDialogElement.prototype, 'close')
})

it('locks the background, keeps the close button available and restores previous styles', () => {
  document.body.style.position = 'relative'
  const close = vi.fn()
  const { unmount } = render(<Modal title="Prévia" onClose={close}><p>Conteúdo</p></Modal>)
  expect(document.body.style.position).toBe('fixed')
  expect(document.documentElement.style.overflow).toBe('hidden')
  fireEvent.click(screen.getByRole('button', { name: 'Fechar janela' }))
  expect(close).toHaveBeenCalledTimes(1)
  unmount()
  expect(document.body.style.position).toBe('relative')
  expect(document.documentElement.style.overflow).toBe('')
  expect(window.scrollTo).toHaveBeenCalledWith({ left: 0, top: 0, behavior: 'instant' })
  document.body.style.position = ''
})

it('closes from the backdrop and Escape but not from inside the dialog', () => {
  const close = vi.fn()
  render(<Modal title="Prévia" onClose={close}><p>Conteúdo</p></Modal>)
  const dialog = screen.getByRole('dialog')
  vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({ left: 100, right: 500, top: 100, bottom: 500 } as DOMRect)
  // jsdom lacks PointerEvent coordinates; use MouseEvent with pointer event names.
  dialog.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientX: 10, clientY: 10 }))
  dialog.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, clientX: 10, clientY: 10 }))
  expect(close).toHaveBeenCalledTimes(1)
  dialog.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, clientX: 200, clientY: 200 }))
  dialog.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, clientX: 200, clientY: 200 }))
  expect(close).toHaveBeenCalledTimes(1)
  fireEvent(dialog, new Event('cancel', { bubbles: false, cancelable: true }))
  expect(close).toHaveBeenCalledTimes(2)
})

it('keeps the background locked until the last dialog is removed', () => {
  const first = render(<Modal title="Primeiro" onClose={vi.fn()}>Um</Modal>)
  const second = render(<Modal title="Segundo" onClose={vi.fn()}>Dois</Modal>)
  first.unmount()
  expect(document.body.style.position).toBe('fixed')
  second.unmount()
  expect(document.body.style.position).toBe('')
})
