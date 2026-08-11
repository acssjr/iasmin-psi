# Iasmin mobile conversion refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the mobile landing page and reduce the autoconhecimento journey to five low-friction, safely persisted questions.

**Architecture:** A shared WhatsApp helper supplies a real default number and generic messages. The journey remains a client state machine, but its client contract, schema and persistence move from ten answers plus checkbox state to five answers plus an affirmative submit action. Development may render the reflection after a failed API request when no database is configured; production keeps the failure path.

**Tech Stack:** Next.js App Router, React, CSS Modules, GSAP, Zod, Neon, Vitest and Playwright.

---

### Task 1: Make WhatsApp scheduling reliable and update page copy

**Files:**
- Create: `src/lib/whatsapp.ts`
- Modify: `src/components/landing/landing-page.tsx`
- Modify: `src/components/percurso/journey-shell.tsx`
- Modify: `src/components/percurso/journey-result.tsx`
- Test: `src/test/whatsapp.test.ts`
- Test: `src/test/landing-page.test.tsx`

- [ ] **Step 1: Write the failing helper test**

```ts
it('uses the Iasmin WhatsApp number when no environment value is set', () => {
  expect(getSchedulingWhatsAppHref()).toContain('5575981234176')
  expect(getSchedulingWhatsAppHref()).toContain(
    encodeURIComponent('Olá, Iasmin. Gostaria de agendar uma sessão de psicoterapia.'),
  )
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- src/test/whatsapp.test.ts`

Expected: FAIL because `getSchedulingWhatsAppHref` does not exist.

- [ ] **Step 3: Implement the shared helper and copy changes**

```ts
const DEFAULT_WHATSAPP_NUMBER = '5575981234176'
const schedulingMessage = 'Olá, Iasmin. Gostaria de agendar uma sessão de psicoterapia.'

export function getSchedulingWhatsAppHref() {
  const number = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? DEFAULT_WHATSAPP_NUMBER).replace(/\D/g, '')
  return `https://wa.me/${number}?text=${encodeURIComponent(schedulingMessage)}`
}
```

Replace page-local helpers. Change FAQ 2 to “Iasmin atende quais públicos?” and “Realizo atendimentos para adolescentes e adultos em todo o Brasil.” Change FAQ 4 to session scheduling. Wrap `Iasmin Portugal` in `strong` in the opening about paragraph.

- [ ] **Step 4: Run focused tests**

Run: `npm run test -- src/test/whatsapp.test.ts src/test/landing-page.test.tsx`

Expected: PASS.

### Task 2: Reduce the journey and remove the checkbox interaction

**Files:**
- Modify: `src/lib/content.ts`
- Modify: `src/lib/schemas.ts`
- Modify: `src/components/percurso/journey-intro.tsx`
- Modify: `src/components/percurso/journey-shell.tsx`
- Modify: `src/test/schemas.test.ts`
- Modify: `src/test/journey-shell.test.tsx`
- Modify: `tests/e2e/percurso.spec.ts`

- [ ] **Step 1: Write failing five-answer and no-checkbox tests**

```ts
expect(journeySubmissionSchema.parse({ ...validBody, answers: validBody.answers.slice(0, 5) }).answers).toHaveLength(5)
expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
expect(screen.getByText(/Ao continuar, você concorda/i)).toBeVisible()
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/test/schemas.test.ts src/test/journey-shell.test.tsx`

Expected: FAIL because ten answers and checkbox controls are still required.

- [ ] **Step 3: Implement the five-step client contract**

Keep original prompts 1, 3, 5, 8 and 10, renumbered from 1 through 5. Remove `purposeConsent` and `contactPermission` from the form. Render “Ao continuar, você concorda com o uso dos seus dados para gerar esta devolutiva e viabilizar o contato que solicitar.” above the button. Submit `purposeConsent: true` from the button action and `contactPermission: false` to preserve the agreed 180-day purge rule.

- [ ] **Step 4: Update browser coverage**

Change the end-to-end loop to five questions. Assert no checkbox and assert the POST body has five answers and `purposeConsent: true`.

- [ ] **Step 5: Run focused tests**

Run: `npm run test -- src/test/schemas.test.ts src/test/journey-shell.test.tsx && npx playwright test tests/e2e/percurso.spec.ts --project=chromium`

Expected: PASS.

### Task 3: Refine question selection, results and local development behavior

**Files:**
- Modify: `src/components/percurso/journey-question.tsx`
- Modify: `src/components/percurso/journey.module.css`
- Modify: `src/components/percurso/journey-shell.tsx`
- Modify: `src/components/percurso/journey-result.tsx`
- Test: `src/test/journey-shell.test.tsx`

- [ ] **Step 1: Write a failing selection-state test**

```ts
await user.click(screen.getAllByRole('radio')[1])
expect(screen.getAllByRole('radio')[1]).toBeChecked()
expect(screen.getAllByRole('radio')[0]).not.toBeChecked()
```

- [ ] **Step 2: Implement one indicator and compositor-friendly motion**

Visually hide the radio input while preserving keyboard behavior. Add an `optionIndicator` element. Transition only `transform`, `opacity`, `background-color` and `border-color`; remove the double native ring. Use scoped `useGSAP` transitions for question changes and bypass them under reduced motion.

- [ ] **Step 3: Make development result rendering explicit**

When `process.env.NODE_ENV === 'development'` and the API response is non-OK, continue to the reflection result with the selected answers. Keep `submission-error` for non-development failures.

- [ ] **Step 4: Update the result copy**

Add: “Obrigada por se permitir essa pausa. Suas respostas não definem você, mas podem ser um convite para olhar com mais cuidado para o que está vivendo.” before theme content.

- [ ] **Step 5: Run tests**

Run: `npm run test -- src/test/journey-shell.test.tsx && npx playwright test tests/e2e/percurso.spec.ts --project=chromium`

Expected: PASS.

### Task 4: Recompose the mobile hero and verify responsive behavior

**Files:**
- Modify: `src/components/landing/landing-page.module.css`
- Modify: `tests/e2e/landing.spec.ts`

- [ ] **Step 1: Add mobile-first regression checks**

```ts
await page.setViewportSize({ width: 390, height: 844 })
await expect(hero.getByRole('link', { name: 'Agendar uma sessão' })).toBeVisible()
expect(await page.locator('html').evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(true)
```

- [ ] **Step 2: Refine the mobile CSS**

At 560px and below, reserve less header space, put the title and both CTAs inside the opening viewport, use a shorter photo arc and keep each CTA at 44px or more.

- [ ] **Step 3: Run browser checks**

Run: `npx playwright test tests/e2e/landing.spec.ts --project=chromium`

Expected: PASS at 390px, 768px and 1440px.

### Task 5: Run complete verification

**Files:**
- Modify: `docs/superpowers/specs/2026-08-11-iasmin-mobile-conversion-refinement-design.md`

- [ ] **Step 1: Record final spec verification**

Confirm the implemented behavior: the only implied consent is recorded on the start action, contact retention remains disabled, and WhatsApp messages never include the answers.

- [ ] **Step 2: Run all checks**

Run: `npm run lint`, `npm run test`, `npx playwright test --project=chromium`, `npm run build`, `git diff --check`.

Expected: every command exits with code `0`.
