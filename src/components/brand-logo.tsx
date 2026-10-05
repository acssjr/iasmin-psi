'use client'
import Image from 'next/image'
import { useContentValue } from '@/components/cms/content'
import styles from './brand-logo.module.css'
import { fieldByDefault } from '@/lib/cms/catalog'
import { useVisualEditing } from '@/components/cms/edit-context'

type BrandLogoVariant = 'horizontal' | 'vertical' | 'full' | 'signature' | 'monogram'
type BrandLogoTone = 'espresso' | 'cream' | 'terracotta'

type BrandLogoProps = {
  className?: string
  decorative?: boolean
  label?: string
  tone?: BrandLogoTone
  variant: BrandLogoVariant
}

export function BrandLogo({
  className,
  decorative = false,
  label = 'Iasmin Portugal, Psicóloga Clínica',
  tone = 'espresso',
  variant,
}: BrandLogoProps) {
  const text = useContentValue()
  const editing = useVisualEditing()
  const original = variant === 'signature' ? '/brand/iasmin-psi-signature.svg' : `/brand/iasmin-portugal-${variant}.svg`
  const configuredSource = text(original)
  // Existing sites used the horizontal asset for this same editable header slot.
  const source = variant === 'vertical' && configuredSource === '/brand/iasmin-portugal-horizontal.svg'
    ? original : configuredSource
  const classNames = [styles.logo, styles[variant], styles[tone], className]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      aria-hidden={decorative ? 'true' : undefined}
      aria-label={decorative ? undefined : text(label)}
      className={classNames}
      data-brand-tone={tone}
      data-brand-variant={variant}
      data-cms-field={editing?.enabled ? fieldByDefault.get(original)?.id : undefined}
      role={decorative ? undefined : 'img'}
      style={source !== original ? { mask: 'none', WebkitMask: 'none', background: 'transparent', position: 'relative' } : undefined}
    >
      {source !== original && <Image src={source} alt="" fill unoptimized style={{ objectFit: 'contain' }} />}
    </span>
  )
}
