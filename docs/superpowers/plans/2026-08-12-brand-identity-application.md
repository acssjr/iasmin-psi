# Brand Identity Application Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply Iasmin Portugal's approved official logo system to the landing page without disturbing its existing layout or responsive behavior.

**Architecture:** Optimized SVGs live in `public/brand` and a focused `BrandLogo` component exposes four semantic variants through CSS masks and `currentColor`. Landing regions select the approved variant, while Next metadata references the monogram directly as the site icon.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, Vitest, Testing Library, Playwright.

---

### Task 1: Add official brand assets

**Files:**
- Create: `public/brand/iasmin-portugal-horizontal.svg`
- Create: `public/brand/iasmin-portugal-full.svg`
- Create: `public/brand/iasmin-psi-signature.svg`
- Create: `public/brand/iasmin-portugal-monogram.svg`

- [ ] Copy the four optimized SVG files from the approved branding source directory using stable web-safe filenames.
- [ ] Verify each asset contains a `viewBox`, has no embedded bitmap, and is served as valid SVG.

### Task 2: Build the reusable logo component with tests

**Files:**
- Create: `src/components/brand-logo.tsx`
- Create: `src/components/brand-logo.module.css`
- Create: `src/test/brand-logo.test.tsx`

- [ ] Write tests confirming semantic logos expose an accessible name, decorative logos are hidden, and each variant receives its own class.
- [ ] Run `npm test -- --run src/test/brand-logo.test.tsx` and confirm the missing component causes failure.
- [ ] Implement `BrandLogo` with `variant`, `tone`, `decorative`, and `className` properties.
- [ ] Define variant-specific mask URLs and aspect ratios, using `currentColor` for the approved espresso, cream, and terracotta tones.
- [ ] Re-run the component test and confirm it passes.

### Task 3: Apply the approved logo hierarchy

**Files:**
- Modify: `src/components/landing/landing-page.tsx`
- Modify: `src/components/landing/landing-page.module.css`
- Modify: `src/test/landing-page.test.tsx`
- Modify: `src/test/landing-layout-css.test.ts`

- [ ] Extend landing tests to require the horizontal header logo, hero signature, and complete footer logo.
- [ ] Run the targeted landing tests and confirm they fail against the provisional text mark.
- [ ] Replace `BrandMark` with `BrandLogo`: horizontal in the header, signature in the hero, and full in the footer.
- [ ] Add responsive dimensions and spacing so the mobile header controls remain separated and the signature yields first on narrow screens.
- [ ] Re-run the targeted tests and confirm they pass.

### Task 4: Add monogram metadata

**Files:**
- Modify: `src/app/layout.tsx`
- Create: `src/test/metadata.test.ts`

- [ ] Add a metadata test requiring `/brand/iasmin-portugal-monogram.svg` as the icon.
- [ ] Run the metadata test and confirm it fails.
- [ ] Add the official monogram to the Next.js metadata icon configuration.
- [ ] Re-run the metadata test and confirm it passes.

### Task 5: Verify the complete application

**Files:**
- Modify only if verification exposes a scoped defect in the brand application.

- [ ] Run `npm test` and confirm all unit tests pass.
- [ ] Run `npm run lint` and confirm there are no errors.
- [ ] Run `npm run build` and confirm the production build succeeds.
- [ ] Inspect the landing at desktop, 1024×1366, and 430×932, checking logo proportions, contrast, header separation, hero hierarchy, and footer alignment.
- [ ] Run `git diff --check`, review the final diff, then commit the implementation.
