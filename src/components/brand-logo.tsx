import styles from './brand-logo.module.css'

type BrandLogoVariant = 'horizontal' | 'full' | 'signature' | 'monogram'
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
  const classNames = [styles.logo, styles[variant], styles[tone], className]
    .filter(Boolean)
    .join(' ')

  return (
    <span
      aria-hidden={decorative ? 'true' : undefined}
      aria-label={decorative ? undefined : label}
      className={classNames}
      data-brand-tone={tone}
      data-brand-variant={variant}
      role={decorative ? undefined : 'img'}
    />
  )
}
