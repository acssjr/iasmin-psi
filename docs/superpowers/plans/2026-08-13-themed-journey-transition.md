# Themed Journey and Calm Transition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a two-second calm transition to every journey CTA and replace the generic quiz with four five-question, non-diagnostic thematic journeys.

**Architecture:** A typed content module owns topics, questions, answer directions, and reflection copy; a pure scorer derives the server-verifiable result key. The journey state machine adds topic selection before contact collection, while a client transition provider intercepts only ordinary internal `/percurso` navigation. Persistence evolves through an additive SQL migration and the API recalculates every result instead of trusting the browser.

**Tech Stack:** Next.js 16.3 App Router, React 19, TypeScript, GSAP with `@gsap/react`, Zod 4, Neon PostgreSQL, Vitest, Testing Library, Playwright.

---

### Task 1: Typed topic content and deterministic reflections

**Files:**
- Create: `src/lib/journey-content.ts`
- Modify: `src/lib/types.ts`
- Modify: `src/lib/journey.ts`
- Test: `src/test/journey-content.test.ts`
- Test: `src/test/journey.test.ts`

- [ ] Write failing tests asserting four topics, five questions per topic, unique option ids and simple, combined and broad result keys.
- [ ] Run `npm test -- --run src/test/journey-content.test.ts src/test/journey.test.ts` and confirm failures refer to missing topic exports and scorer behavior.
- [ ] Add the approved Portuguese content, typed direction ids and topic-specific reflection records.
- [ ] Replace the legacy scorer with `getJourneyResult(topic, answerIds)` that validates membership and deterministically returns a topic-scoped result key.
- [ ] Run the two focused test files and confirm they pass.

### Task 2: Topic-first journey flow

**Files:**
- Create: `src/components/percurso/journey-topic.tsx`
- Modify: `src/components/percurso/journey-shell.tsx`
- Modify: `src/components/percurso/journey-question.tsx`
- Modify: `src/components/percurso/journey-result.tsx`
- Modify: `src/components/percurso/journey.module.css`
- Test: `src/test/journey-shell.test.tsx`

- [ ] Rewrite the journey-shell tests so the expected flow is age, topic, contact, five questions and topic-specific result.
- [ ] Run `npm test -- --run src/test/journey-shell.test.tsx` and confirm it fails because topic selection is absent.
- [ ] Add an accessible four-option topic selector and include topic in the state union.
- [ ] Store answer option ids instead of legacy reflection themes and show the topic label above each question.
- [ ] Render the approved topic-specific reflection and explicit non-diagnostic boundary copy.
- [ ] Run the focused flow tests and confirm all pass.

### Task 3: Calm route transition

**Files:**
- Create: `src/components/journey-transition.tsx`
- Create: `src/components/journey-transition.module.css`
- Modify: `src/components/landing/landing-page.tsx`
- Test: `src/test/journey-transition.test.tsx`
- Modify: `src/test/landing-page.test.tsx`

- [ ] Write failing tests for ordinary click interception, modified-click preservation, duplicate-click prevention and reduced-motion timing.
- [ ] Run `npm test -- --run src/test/journey-transition.test.tsx` and confirm failure because the transition component is missing.
- [ ] Implement a provider and link using Next.js `router.prefetch()` and `router.push()`, `Link.onNavigate`, a fixed cream overlay and scoped GSAP transforms/opacity.
- [ ] Replace all three landing journey CTAs with the new link while preserving analytics.
- [ ] Run transition and landing tests and confirm they pass.

### Task 4: Server validation and additive persistence

**Files:**
- Create: `sql/002_add_themed_journey.sql`
- Modify: `src/lib/schemas.ts`
- Modify: `src/lib/data.ts`
- Modify: `src/app/api/percursos/route.ts`
- Test: `src/test/schemas.test.ts`
- Test: `src/test/data.test.ts`
- Test: `src/test/api-percursos.test.ts`

- [ ] Write failing schema and API tests for topic, content version, option membership and server-side result recalculation.
- [ ] Run the three focused test files and confirm the new payload is rejected or unsupported.
- [ ] Add the additive migration for `journey_topic`, `result_key`, and `content_version`, and make the legacy reflection column nullable.
- [ ] Validate the new submission shape with Zod refinements against the selected topic.
- [ ] Recalculate result keys in the API and insert the new fields through the persistence boundary.
- [ ] Run the focused tests and confirm they pass.
- [ ] Apply the migration to Neon and verify the new columns without exposing credentials.

### Task 5: Privacy copy and responsive verification

**Files:**
- Modify: `src/app/privacidade/page.tsx`
- Modify: `src/test/privacy-page.test.tsx`
- Modify: `e2e/landing.spec.ts` if present

- [ ] Write a failing privacy-page test that expects thematic choice, reflective purpose and non-diagnostic wording.
- [ ] Update the page copy without changing the approved 180-day retention policy.
- [ ] Run the privacy test and confirm it passes.
- [ ] Run the complete unit suite, lint and production build.
- [ ] Inspect landing transition and journey at 430×932, 1024×1366 and a desktop viewport; correct only issues introduced by this work.
- [ ] Run `git diff --check` and review the complete diff for secrets, accidental generated files and legacy behavior regressions.
- [ ] Commit and push the completed feature to `main` after all verification commands pass.
