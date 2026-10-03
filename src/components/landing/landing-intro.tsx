
import { ContentText } from '@/components/cms/content'
import { BrandLogo } from '@/components/brand-logo'
import styles from '../journey-transition.module.css'

// Rendered with the initial HTML: CSS finishes the welcome even before
// hydration, so the page never flashes first or waits for JavaScript.
export function LandingIntro() {
  return (
    <div className={`${styles.overlay} ${styles.introOverlay}`} aria-hidden="true" data-landing-intro>
      <div className={`${styles.copy} ${styles.introCopy}`}>
        <BrandLogo className={styles.mark} decorative tone="cream" variant="monogram" />
        <strong><ContentText fallback="Boas-vindas a um espaço de cuidado e calma." /></strong>
        <span className={styles.loader}>
          <i />
          <i />
          <i />
        </span>
      </div>
    </div>
  )
}
