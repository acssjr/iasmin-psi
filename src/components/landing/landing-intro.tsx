
import { BrandLogo } from '@/components/brand-logo'
import styles from './landing-intro.module.css'

// Rendered with the initial HTML: CSS finishes the welcome even before
// hydration, so the page never flashes first or waits for JavaScript.
export function LandingIntro() {
  return (
    <div className={styles.intro} aria-hidden="true" data-landing-intro>
      <div className={styles.backdrop} />
      <div className={styles.centerMark}>
        <BrandLogo className={styles.monogram} decorative tone="cream" variant="monogram" />
        <span className={styles.wordmark}>
          <BrandLogo decorative tone="cream" variant="horizontal" />
        </span>
      </div>
      <span className={styles.progress}><span /></span>
      <div className={styles.arrival}>
        <BrandLogo decorative tone="espresso" variant="vertical" />
      </div>
    </div>
  )
}
