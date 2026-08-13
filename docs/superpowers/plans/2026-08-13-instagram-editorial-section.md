# Instagram Editorial Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a locally hosted editorial content section that demonstrates Iasmin's active content production without sending visitors away from the landing page.

**Architecture:** A focused server-rendered section owns its content and responsive markup. Desktop uses a four-cover mosaic; mobile exposes the same covers as a manual scroll-snap carousel. Existing landing motion reveals the section with transform and opacity only.

**Tech Stack:** Next.js 16 App Router, React 19, CSS Modules, `next/image`, GSAP, Vitest, Testing Library.

---

### Task 1: Copy and render editorial assets

**Files:**
- Create: `public/images/editorial/*.png`
- Create: `src/components/landing/editorial-content-section.tsx`
- Test: `src/test/editorial-content-section.test.tsx`

- [ ] Write a failing component test asserting four covers, local optimized images and a WhatsApp CTA.
- [ ] Run `npm test -- src/test/editorial-content-section.test.tsx --reporter=dot` and confirm it fails because the component does not exist.
- [ ] Copy the four supplied covers into `public/images/editorial` and implement the content section with semantic headings, alternative text and `TrackedLink`.
- [ ] Run the targeted test and confirm it passes.

### Task 2: Integrate responsive layout and copy refinements

**Files:**
- Modify: `src/components/landing/landing-page.tsx`
- Modify: `src/components/landing/landing-page.module.css`
- Modify: `src/test/landing-page.test.tsx`
- Modify: `src/test/landing-layout-css.test.ts`

- [ ] Write failing tests for section order, “Iniciar o percurso”, headline tracking and mobile scroll-snap behavior.
- [ ] Run the targeted tests and confirm the new assertions fail.
- [ ] Insert the editorial section between listening themes and the journey teaser.
- [ ] Add the desktop mosaic and mobile manual carousel styles without external scripts or dependencies.
- [ ] Increase headline letter spacing slightly and change the journey teaser CTA to “Iniciar o percurso”.
- [ ] Run the targeted tests and confirm they pass.

### Task 3: Motion and complete verification

**Files:**
- Modify: `src/components/landing/landing-motion.tsx`
- Modify: `src/test/landing-motion-source.test.ts`

- [ ] Write a failing source test for a scoped editorial cover reveal using opacity, `y` and stagger.
- [ ] Run the motion test and confirm it fails.
- [ ] Add a single ScrollTrigger reveal for the cover group and preserve reduced-motion behavior and automatic GSAP cleanup.
- [ ] Run the full test suite, `npm run lint` and `npm run build`.
- [ ] Inspect desktop and mobile localhost rendering, including the WhatsApp CTA and manual carousel.
