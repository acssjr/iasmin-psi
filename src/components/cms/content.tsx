'use client'

import { createContext, useContext, type ReactNode, type AnchorHTMLAttributes, type InputHTMLAttributes } from 'react'
import Image, { type ImageProps } from 'next/image'
import { fieldByDefault, resolveContent, type ContentValues } from '@/lib/cms/catalog'

const ContentContext = createContext<ContentValues>({})
export function ContentProvider({ values, children }: { values: ContentValues; children: ReactNode }) {
  return <ContentContext.Provider value={values}>{children}</ContentContext.Provider>
}
export function useContentValue() {
  const values = useContext(ContentContext)
  return (fallback: string) => resolveContent(values, fallback)
}
export function useContentValues() { return useContext(ContentContext) }
export function ContentText({ fallback }: { fallback: string }) {
  const text = useContentValue()
  return <>{text(fallback)}</>
}
export function ContentImage(props: ImageProps) {
  const text = useContentValue()
  const values = useContentValues()
  const positionKey = typeof props.src === 'string' ? `${fieldByDefault.get(props.src)?.id}-position` : ''
  return <Image {...props} src={typeof props.src === 'string' ? text(props.src) : props.src} alt={text(props.alt)} style={{ ...props.style, ...(values[positionKey] ? { objectPosition: values[positionKey] } : {}) }} unoptimized={typeof props.src === 'string' && text(props.src).startsWith('/api/media/')} />
}
export function ContentAnchor(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const text = useContentValue()
  return <a {...props} href={props.href ? text(props.href) : undefined} aria-label={props['aria-label'] ? text(props['aria-label']) : undefined} />
}
export function ContentInput(props: InputHTMLAttributes<HTMLInputElement>) {
  const text = useContentValue()
  return <input {...props} placeholder={props.placeholder ? text(props.placeholder) : undefined} aria-label={props['aria-label'] ? text(props['aria-label']) : undefined} />
}
