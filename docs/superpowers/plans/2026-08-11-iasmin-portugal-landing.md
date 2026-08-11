# Iasmin Portugal Landing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy a responsive, editorial landing page for Iasmin Portugal with equal paths to WhatsApp scheduling and a privacy-conscious 10-question autoconhecimento journey.

**Architecture:** A Next.js App Router project renders the marketing page and a dedicated client-side journey. Route handlers validate and persist a completed journey to Neon, while Vercel Web Analytics receives only allowlisted, non-identifying conversion events. A scheduled Vercel Function applies the approved retention rules.

**Tech Stack:** Next.js, React, TypeScript, CSS Modules plus global tokens, `next/font` Plus Jakarta Sans, GSAP with `@gsap/react` and ScrollTrigger, Zod, Neon serverless driver, Vercel Web Analytics, Vitest, Testing Library, Playwright.

---

## Design implementation contract

- Subject: Iasmin Portugal, psicóloga clínica que atende adolescentes e adultos on-line no Brasil.
- Audience: a person seeking a first safe step in anxiety, self-esteem or self-acceptance related difficulty.
- Single job: help that person choose between starting a WhatsApp conversation and a non-clinical reflection journey.
- Visual thesis: the terracotta portrait is the hero. The page uses Plus Jakarta Sans only, with high-contrast weight and scale rather than a fine serif.
- Signature: a single animated `Trilha de Contextos` SVG. It emerges from the hero photograph, reappears beside the three care pillars, and binds `contexto`, `escolhas` and `cuidado`. It expresses Análise do Comportamento instead of adding generic leaf or sparkle decoration.
- Motion is one orchestrated hero sequence, one desktop-only contextual scroll moment, and restrained question transitions. No autoplay, parallax, confetti, or scroll hijacking.
- All visible UI copy avoids travessões and uses `Iniciar meu percurso de autoconhecimento`, never “check-in” or “teste”.

## Planned file structure

```text
public/images/iasmin/
  hero-terracotta.jpg
  garden-reading.jpg
  garden-portrait.jpg
src/app/
  api/percursos/route.ts
  api/retencao/route.ts
  percurso/page.tsx
  privacidade/page.tsx
  layout.tsx
  page.tsx
  globals.css
src/components/landing/
  landing-page.tsx
  landing-page.module.css
  context-trail.tsx
  landing-motion.tsx
src/components/percurso/
  journey-shell.tsx
  journey-intro.tsx
  journey-question.tsx
  journey-result.tsx
  journey.module.css
src/lib/
  analytics.ts
  content.ts
  data.ts
  journey.ts
  retention.ts
  schemas.ts
  types.ts
src/test/
  setup.ts
  journey.test.ts
  schemas.test.ts
  retention.test.ts
  analytics.test.ts
  landing-page.test.tsx
  journey-shell.test.tsx
  api-percursos.test.ts
  api-retencao.test.ts
tests/e2e/
  landing.spec.ts
  percurso.spec.ts
.env.example
next.config.ts
playwright.config.ts
vercel.json
vitest.config.ts
```

### Task 1: Bootstrap the isolated Next.js project and test harness

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `eslint.config.mjs`, `next-env.d.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `vitest.config.ts`, `src/test/setup.ts`, `src/test/landing-page.test.tsx`, `playwright.config.ts`, `tests/e2e/landing.spec.ts`
- Create: `.env.example`, `vercel.json`

- [ ] **Step 1: Create an implementation worktree and bootstrap dependencies**

```powershell
git worktree add -b codex/iasmin-landing ..\iasmin-portugal-psi-landing master
Set-Location ..\iasmin-portugal-psi-landing
npm init -y
npm install next@latest react@latest react-dom@latest gsap @gsap/react @neondatabase/serverless zod @vercel/analytics
npm install -D typescript @types/node @types/react @types/react-dom eslint eslint-config-next vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event @playwright/test
```

- [ ] **Step 2: Write the failing rendering test**

```tsx
// src/test/landing-page.test.tsx
import { render, screen } from '@testing-library/react'
import LandingPage from '@/components/landing/landing-page'

it('shows both first-step actions in the hero', () => {
  render(<LandingPage />)

  expect(screen.getByRole('link', { name: 'Agendar uma sessão' })).toBeVisible()
  expect(screen.getByRole('link', { name: 'Iniciar meu percurso de autoconhecimento' })).toBeVisible()
})
```

- [ ] **Step 3: Run the test and confirm it fails because the component does not exist**

Run: `npm run test -- src/test/landing-page.test.tsx`

Expected: FAIL with an unresolved import for `@/components/landing/landing-page`.

- [ ] **Step 4: Add the project scripts, aliases and minimal rendering implementation**

Use these scripts in `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

Create `src/components/landing/landing-page.tsx` as the default export and make `src/app/page.tsx` render it. Configure TypeScript `@/*` to resolve to `src/*`, then configure Vitest with `environment: 'jsdom'`, the same alias, and `src/test/setup.ts` importing `@testing-library/jest-dom/vitest`. Create `eslint.config.mjs` with `import nextConfig from 'eslint-config-next/core-web-vitals'` and `export default [...nextConfig]`.

- [ ] **Step 5: Add required environment and platform configuration**

```dotenv
# .env.example
DATABASE_URL=
NEXT_PUBLIC_WHATSAPP_NUMBER=
CRON_SECRET=
```

```json
// vercel.json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [{ "path": "/api/retencao", "schedule": "0 3 * * *" }]
}
```

Configure the production Vercel project as Pro or higher, with `DATABASE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER` and `CRON_SECRET` marked sensitive where applicable. Configure one Vercel Firewall rule for `/api/percursos`: fixed window, 10 requests per minute per IP, action `429`.

- [ ] **Step 6: Run baseline verification**

Run: `npm run test -- src/test/landing-page.test.tsx && npm run build`

Expected: PASS and a successful Next.js production build.

- [ ] **Step 7: Commit the foundation**

```powershell
git add package.json package-lock.json tsconfig.json next.config.ts vitest.config.ts playwright.config.ts vercel.json .env.example src tests
git commit -m "chore: bootstrap Iasmin landing project"
```

### Task 2: Add source photography, Plus Jakarta Sans and the Terracota Solar system

**Files:**
- Create: `public/images/iasmin/hero-terracotta.jpg`, `public/images/iasmin/garden-reading.jpg`, `public/images/iasmin/garden-portrait.jpg`
- Modify: `src/app/layout.tsx`, `src/app/globals.css`
- Create: `src/components/landing/landing-page.module.css`
- Modify: `src/test/landing-page.test.tsx`

- [ ] **Step 1: Copy the approved photos into stable public paths**

```powershell
New-Item -ItemType Directory -Force public\images\iasmin
Copy-Item 'C:\Users\antonio.santos\Downloads\SaveClip.App_763277104_18612780430055895_7882989347282670241_n.jpg' public\images\iasmin\hero-terracotta.jpg
Copy-Item 'C:\Users\antonio.santos\Downloads\SaveClip.App_753105448_18608557969055895_5109156330355241243_n.jpg' public\images\iasmin\garden-reading.jpg
Copy-Item 'C:\Users\antonio.santos\Downloads\SaveClip.App_754046426_18608557981055895_9075767487875293738_n.jpg' public\images\iasmin\garden-portrait.jpg
```

- [ ] **Step 2: Extend the failing test for the real hero image and font class**

```tsx
expect(screen.getByAltText('Iasmin Portugal em atendimento')).toHaveAttribute(
  'src',
  expect.stringContaining('hero-terracotta.jpg'),
)
```

- [ ] **Step 3: Implement the design foundation**

Load `Plus_Jakarta_Sans` in `src/app/layout.tsx` using `next/font/google` with `latin`, `display: 'swap'`, `variable: '--font-plus-jakarta'`, and weights `400`, `500`, `600`, `700`, `800`.

Declare these variables in `globals.css` and use them throughout the page:

```css
:root {
  --ivory: #f5eee3;
  --terracotta: #b65e3d;
  --espresso: #402419;
  --olive: #72754c;
  --sand: #eadbc8;
  --cream: #fff9f1;
  --font-sans: var(--font-plus-jakarta), system-ui, sans-serif;
}
```

Use `font-weight: 700` or `800` for display text, `500` for long copy, and `700` for interface labels. Never use a display serif, italic title, thin weight, generic gradient, floating blob or decorative leaf.

- [ ] **Step 4: Verify visual assets and font loading**

Run: `npm run test -- src/test/landing-page.test.tsx && npm run dev`

Expected: PASS. Inspect the local hero at desktop and 390px widths; the portrait is visible, cropped without covering the CTA, and type remains readable.

- [ ] **Step 5: Commit the visual foundation**

```powershell
git add public/images/iasmin src/app src/components/landing src/test/landing-page.test.tsx
git commit -m "feat: add Terracota Solar visual foundation"
```

### Task 3: Model the approved content and non-clinical reflection logic

**Files:**
- Create: `src/lib/types.ts`, `src/lib/content.ts`, `src/lib/journey.ts`
- Create: `src/test/journey.test.ts`

- [ ] **Step 1: Write failing reflection tests**

```ts
import { getReflectionTheme } from '@/lib/journey'

it('uses question ten to resolve a score tie', () => {
  expect(getReflectionTheme(['sobrecarrega', 'autocritica', 'reconexao', 'autocritica', 'sobrecarrega', 'reconexao', 'reconexao', 'sobrecarrega', 'autocritica', 'reconexao'])).toBe('reconexao')
})

it('never returns a clinical label', () => {
  expect(['sobrecarrega', 'autocritica', 'reconexao']).toContain(getReflectionTheme(['sobrecarrega']))
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm run test -- src/test/journey.test.ts`

Expected: FAIL because `getReflectionTheme` is not exported.

- [ ] **Step 3: Implement the content boundary**

Create a `ReflectionTheme` union of `sobrecarrega | autocritica | reconexao`, a `JourneyQuestion` type with four answer choices, and a `journeyQuestions` array with the exact ten prompts from the approved design spec. Each choice has a short visible label and one `ReflectionTheme` key. Make question 10's choice the deterministic tie breaker.

Implement `getReflectionTheme(themes: ReflectionTheme[]): ReflectionTheme` by counting only the first nine entries and returning the tenth entry when multiple themes share the highest count. Define the three approved reflection titles and non-clinical explanatory texts in `content.ts`.

- [ ] **Step 4: Run the unit tests**

Run: `npm run test -- src/test/journey.test.ts`

Expected: PASS with tie handling and only approved themes returned.

- [ ] **Step 5: Commit the domain content**

```powershell
git add src/lib/content.ts src/lib/journey.ts src/lib/types.ts src/test/journey.test.ts
git commit -m "feat: add autoconhecimento journey content"
```

### Task 4: Build the accessible static landing composition

**Files:**
- Modify: `src/components/landing/landing-page.tsx`, `src/components/landing/landing-page.module.css`
- Create: `src/components/landing/context-trail.tsx`
- Modify: `src/test/landing-page.test.tsx`

- [ ] **Step 1: Add failing tests for mandatory identity and responsible content**

```tsx
expect(screen.getByRole('navigation').getByRole('link', { name: 'Conheça Iasmin' })).toBeVisible()
expect(screen.getByText('Iasmin Portugal de Souza Costa · Psicóloga Clínica · CRP 03/33160')).toBeVisible()
expect(screen.getByText(/O percurso não é uma avaliação psicológica/i)).toBeVisible()
expect(screen.queryByText(/depoimento/i)).not.toBeInTheDocument()
```

- [ ] **Step 2: Implement each approved section as a focused component within `LandingPage`**

Create explicit section components named `HeroSection`, `RecognitionSection`, `AboutIasminSection`, `CarePillarsSection`, `JourneyTeaserSection`, `FaqSection`, `ClosingSection`, and `SiteFooter`. Do not create a variant component controlled by boolean props.

Use local `next/image` assets with accurate alt text. Make both hero CTAs visually equivalent. The scheduling CTA points to `https://wa.me/${NEXT_PUBLIC_WHATSAPP_NUMBER}?text=${encodeURIComponent('Olá, Iasmin. Gostaria de agendar uma sessão.')}`. The journey CTA links to `/percurso`.

Render `ContextTrail` as a labelled, decorative SVG with `aria-hidden="true"`; its three visible labels are adjacent HTML text, not SVG-only content. Use it only in the hero and care pillars, where it explains the progression from context to choices to care.

- [ ] **Step 3: Add responsive CSS with an editorial rather than card-grid layout**

Use a two-column desktop hero with the terracotta portrait in a tall, rounded-uneven frame. Stack image after text on mobile. Use one contained information surface only for the FAQ and one for the journey invitation. Do not build uniform rows of generic rounded cards.

- [ ] **Step 4: Run static page tests and inspect responsive layout**

Run: `npm run test -- src/test/landing-page.test.tsx`

Expected: PASS.

Run: `npx playwright test tests/e2e/landing.spec.ts --project=chromium`

Expected: the hero has both CTAs, footer identity and emergency links at 1440px and 390px without horizontal overflow.

- [ ] **Step 5: Commit the landing composition**

```powershell
git add src/components/landing src/test/landing-page.test.tsx tests/e2e/landing.spec.ts
git commit -m "feat: build Iasmin landing composition"
```

### Task 5: Add deliberate GSAP motion with React-safe cleanup

**Files:**
- Create: `src/components/landing/landing-motion.tsx`
- Modify: `src/components/landing/landing-page.tsx`, `src/components/landing/landing-page.module.css`
- Modify: `src/test/landing-page.test.tsx`

- [ ] **Step 1: Write a failing integration assertion for the motion boundary**

```tsx
expect(screen.getByTestId('landing-motion')).toBeInTheDocument()
expect(screen.getByTestId('context-trail')).toBeInTheDocument()
```

- [ ] **Step 2: Implement a client-only `LandingMotion` component**

Use `'use client'`, `useRef`, `useGSAP`, `gsap`, and `ScrollTrigger`. Register `useGSAP` and `ScrollTrigger` once within the client module. Scope all selectors to the component root ref.

Create one hero timeline with defaults `{ duration: 0.72, ease: 'power3.out' }`: reveal eyebrow, headline, copy and both CTAs with a small `y` stagger; reveal photo using `clipPath`; animate the context trail's `strokeDashoffset`. Use only `autoAlpha`, `x`, `y`, `scale`, `clipPath`, and SVG stroke properties.

Use `gsap.matchMedia()` with three conditions: desktop at `min-width: 960px`, mobile below it, and reduced motion. On desktop only, create one top-level ScrollTrigger timeline for the care-pillar section. Pin only its outer section and animate child labels and trail progression with `scrub: 0.6`. On mobile, use one-time batch entrances. Under reduced motion, render final states immediately and create no ScrollTrigger.

Call `ScrollTrigger.refresh()` once after `document.fonts.ready` and image decode. Rely on `useGSAP` cleanup on unmount. Never use unscoped selectors, child-level ScrollTriggers inside a timeline, `markers`, layout-property animation, or perpetual loops.

- [ ] **Step 3: Add focused CSS performance hints**

```css
.heroCopy, .heroPortrait, .contextTrailPath, .carePillarLabel {
  will-change: transform, opacity;
}
```

Remove `will-change` from all other elements and ensure the pinned outer section has a stable minimum height.

- [ ] **Step 4: Verify motion behavior**

Run: `npm run test -- src/test/landing-page.test.tsx && npm run build`

Expected: PASS.

Manual verification: use desktop and mobile throttling. Confirm no flash before hero reveal, no pinned layout jump, no animation when `prefers-reduced-motion: reduce` is emulated, and no animation markers in production.

- [ ] **Step 5: Commit the motion system**

```powershell
git add src/components/landing src/test/landing-page.test.tsx
git commit -m "feat: add purposeful GSAP landing motion"
```

### Task 6: Build the journey client experience and age gate

**Files:**
- Create: `src/components/percurso/journey-shell.tsx`, `journey-intro.tsx`, `journey-question.tsx`, `journey-result.tsx`, `journey.module.css`
- Create: `src/app/percurso/page.tsx`
- Create: `src/test/journey-shell.test.tsx`, `tests/e2e/percurso.spec.ts`

- [ ] **Step 1: Write failing journey tests**

```tsx
it('does not collect answers from a minor', async () => {
  const user = userEvent.setup()
  render(<JourneyShell />)
  await user.click(screen.getByRole('button', { name: 'Sou menor de 18 anos' }))

  expect(screen.getByText(/responsável/i)).toBeVisible()
  expect(screen.queryByText('Pergunta 1 de 10')).not.toBeInTheDocument()
})
```

- [ ] **Step 2: Run the test and confirm it fails**

Run: `npm run test -- src/test/journey-shell.test.tsx`

Expected: FAIL because `JourneyShell` does not exist.

- [ ] **Step 3: Implement explicit journey states**

Use a discriminated union, not boolean flags:

```ts
type JourneyView =
  | { kind: 'age-gate' }
  | { kind: 'contact-form' }
  | { kind: 'question'; index: number; answers: ReflectionTheme[] }
  | { kind: 'submitting'; answers: ReflectionTheme[] }
  | { kind: 'result'; theme: ReflectionTheme }
  | { kind: 'minor-route' }
  | { kind: 'submission-error'; answers: ReflectionTheme[] }
```

The contact form contains name, e-mail, WhatsApp, mandatory purpose consent and optional future-contact consent. Keep all answers in React state only. The minor route has no answer fields and provides a WhatsApp link for the responsible adult.

Each question uses native radio inputs, visible labels, `Pergunta X de 10`, a semantic progress element, back action, and disabled continue action until a choice is made. The final result uses only approved reflection content and clearly says it is not a clinical evaluation.

Use a separate GSAP client hook inside `JourneyShell` for brief `autoAlpha` and `x` transitions when `view.kind === 'question'`. Derive `const questionIndex = view.kind === 'question' ? view.index : -1`, then pass `dependencies: [view.kind, questionIndex]`, `scope`, and `revertOnUpdate: true`. Skip motion for reduced-motion users.

- [ ] **Step 4: Add browser-level journey coverage**

Run: `npx playwright test tests/e2e/percurso.spec.ts --project=chromium`

The test must cover: under-18 route; required consent validation; ten selections; back navigation; result copy; and confirm no query string contains answer content.

- [ ] **Step 5: Commit the client journey**

```powershell
git add src/app/percurso src/components/percurso src/test/journey-shell.test.tsx tests/e2e/percurso.spec.ts
git commit -m "feat: add autoconhecimento journey interface"
```

### Task 7: Add validated Neon persistence and safe WhatsApp handoff

**Files:**
- Create: `src/lib/schemas.ts`, `src/lib/data.ts`
- Create: `src/app/api/percursos/route.ts`
- Create: `src/test/schemas.test.ts`, `src/test/api-percursos.test.ts`
- Create: `sql/001_create_journey_submissions.sql`

- [ ] **Step 1: Write failing schema and route tests**

```ts
const validBody = {
  submissionId: '31d5fa8d-a11b-405e-8d33-7959ff021906',
  name: 'Ana',
  email: 'ana@example.com',
  whatsapp: '5571999999999',
  adult: true,
  answers: ['sobrecarrega', 'autocritica', 'reconexao', 'sobrecarrega', 'autocritica', 'reconexao', 'sobrecarrega', 'autocritica', 'reconexao', 'sobrecarrega'],
  purposeConsent: true,
  contactPermission: false,
  honeypot: ''
}

it('rejects a submission without required purpose consent', () => {
  expect(() => journeySubmissionSchema.parse({ ...validBody, purposeConsent: false })).toThrow()
})

it('does not persist duplicate client submission ids twice', async () => {
  await submitJourney(validBody)
  await submitJourney(validBody)
  expect(mockInsert).toHaveBeenCalledTimes(1)
})
```

- [ ] **Step 2: Implement the schema and database boundary**

Use Zod to require `submissionId`, name, valid e-mail, normalized WhatsApp, `adult: true`, exactly ten approved `ReflectionTheme` answer values, `purposeConsent: true`, boolean `contactPermission`, UTM string fields capped at 128 characters, and a `honeypot` that must be empty.

Create this migration, then apply it with the Neon SQL console before production deployment:

```sql
CREATE TABLE journey_submissions (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  answers JSONB,
  reflection_theme TEXT NOT NULL CHECK (reflection_theme IN ('sobrecarrega', 'autocritica', 'reconexao')),
  purpose_consent_version TEXT NOT NULL,
  purpose_consented_at TIMESTAMPTZ NOT NULL,
  contact_permission BOOLEAN NOT NULL,
  contact_expires_at TIMESTAMPTZ,
  answers_expires_at TIMESTAMPTZ NOT NULL,
  answers_anonymized_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  utm JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX journey_submissions_retention_idx
  ON journey_submissions (answers_expires_at, contact_expires_at)
  WHERE deleted_at IS NULL;
```

`data.ts` owns the Neon connection and exposes only `createJourneySubmission()` and `findExpiredJourneySubmissions()`. The route returns `{ ok: true }` only after the insert succeeds. The browser opens WhatsApp only after that response.

- [ ] **Step 3: Run API and schema tests**

Run: `npm run test -- src/test/schemas.test.ts src/test/api-percursos.test.ts`

Expected: PASS for valid adult submission, invalid consent, malformed answer list, duplicate id, and storage failure.

- [ ] **Step 4: Commit persistence**

```powershell
git add src/lib/schemas.ts src/lib/data.ts src/app/api/percursos/route.ts src/test/schemas.test.ts src/test/api-percursos.test.ts sql/001_create_journey_submissions.sql
git commit -m "feat: persist journey submissions in Neon"
```

### Task 8: Enforce analytics boundaries, retention and privacy page

**Files:**
- Create: `src/lib/analytics.ts`, `src/lib/retention.ts`
- Create: `src/app/api/retencao/route.ts`, `src/app/privacidade/page.tsx`
- Create: `src/test/analytics.test.ts`, `src/test/retention.test.ts`, `src/test/api-retencao.test.ts`
- Modify: `src/app/layout.tsx`, `src/components/percurso/journey-shell.tsx`

- [ ] **Step 1: Write failing tests for allowlisted events and retention**

```ts
it('rejects analytics properties outside the allowlist', () => {
  expect(() => trackSafeEvent('journey_completed', { email: 'iasmin@example.com' } as never)).toThrow('Unsupported analytics property')
})

it('anonymizes expired answers while retaining a permitted contact', async () => {
  await applyRetention(expiredAnswerWithPermittedContact)
  expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ answers: null, answersAnonymizedAt: expect.any(Date) }))
})
```

- [ ] **Step 2: Implement safe analytics**

Render Vercel `Analytics` once from the root layout. `trackSafeEvent()` must accept only these event names: `cta_schedule_clicked`, `journey_started`, `journey_contact_submitted`, `journey_step_completed`, `journey_completed`, `journey_reflection_viewed`, and `whatsapp_opened`. Permit only `surface`, numeric `step`, and `theme` properties. Reject any other key before calling Vercel `track()`.

- [ ] **Step 3: Implement the approved retention rules**

At 180 days, set `answers` to `NULL`, mark `answers_anonymized_at`, and retain contact only when `contact_permission` is true. When the contact has no permission and is expired, null name, e-mail and WhatsApp, set `deleted_at`, and preserve only minimum consent audit metadata. Verify the `Authorization: Bearer ${CRON_SECRET}` header in `/api/retencao`; return `401` for any other caller. Process all overdue records so a missed daily invocation self-heals.

- [ ] **Step 4: Write the concrete privacy page**

The page must state: which fields are collected; the purpose of the mandatory and optional consents; that raw answers do not go to Web Analytics; 180-day answer retention; optional-contact retention until revocation; how to request deletion using the WhatsApp contact; the responsible identification; and emergency guidance with CVV 188 and SAMU 192.

- [ ] **Step 5: Run privacy tests**

Run: `npm run test -- src/test/analytics.test.ts src/test/retention.test.ts src/test/api-retencao.test.ts && npm run build`

Expected: PASS and successful build.

- [ ] **Step 6: Commit privacy and retention**

```powershell
git add src/lib/analytics.ts src/lib/retention.ts src/app/api/retencao/route.ts src/app/privacidade/page.tsx src/test/analytics.test.ts src/test/retention.test.ts src/test/api-retencao.test.ts src/app/layout.tsx src/components/percurso/journey-shell.tsx
git commit -m "feat: add privacy controls and data retention"
```

### Task 9: Run full verification and deploy the production-safe version

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Document exact setup and operational checks**

Document these commands and production steps in `README.md`:

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
npm run test
npm run test:e2e
npm run lint
npm run build
```

The production checklist must include Neon migration application, Vercel Pro analytics confirmation, sensitive variable setup, WAF rate limit rule, Vercel Web Analytics custom-event inspection, the daily cron log, and review of the privacy page with the practitioner.

- [ ] **Step 2: Run the full test and quality suite**

Run:

```powershell
npm run lint
npm run test
npx playwright test
npm run build
git diff --check
```

Expected: every command exits with code `0`.

- [ ] **Step 3: Perform responsive and reduced-motion review**

Use Chromium at 390px, 768px and 1440px. Verify hero photography, equal CTA prominence, readable Plus Jakarta Sans, keyboard flow, form errors, no visible PII in URLs or analytics requests, no horizontal overflow, desktop scroll sequence, and reduced-motion final states.

- [ ] **Step 4: Deploy only after project settings are configured**

Run:

```powershell
vercel link
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_WHATSAPP_NUMBER production
vercel env add CRON_SECRET production --sensitive
vercel --prod
```

Expected: production deployment succeeds, `/api/retencao` is registered in Vercel Cron Jobs, and the URL is tested with a real adult-form submission only after practitioner approval.

- [ ] **Step 5: Commit documentation**

```powershell
git add README.md
git commit -m "docs: add landing setup and deployment guide"
```

## Plan self-review

### Spec coverage

| Approved requirement | Plan task |
| --- | --- |
| Terracota Solar, real photos, Plus Jakarta Sans | Tasks 2 and 4 |
| Two equally visible first-step CTAs | Tasks 1 and 4 |
| Distinctive, non-templated visual signature | Tasks 2, 4 and 5 |
| Advanced but reduced-motion-safe GSAP | Task 5 and Task 6 |
| Ten-question non-clinical journey | Tasks 3 and 6 |
| WhatsApp handoff without URL leakage | Tasks 4, 6 and 7 |
| Neon, Vercel, retention and analytics boundaries | Tasks 7 and 8 |
| Compliance footer, emergency route and privacy page | Tasks 4 and 8 |
| Automated and visual verification | Tasks 1 through 9 |

### Consistency check

- The reflection union uses `sobrecarrega`, `autocritica` and `reconexao` in Task 3, Task 6 and Task 7.
- The server route is consistently `/api/percursos`; the retention route is consistently `/api/retencao`.
- The journey opens WhatsApp only after persistence reports success.
- Analytics never receives answers or contact values.
- Vercel Pro is explicitly required for custom funnel events.
