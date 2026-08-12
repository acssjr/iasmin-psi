# Motion and Layout Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refinar movimento, cursor, FAQ, distribuição do percurso e rodapé social sem prejudicar acessibilidade ou mobile.

**Architecture:** Componentes client-side isolados cuidarão do acordeão e cursor. `LandingMotion` coordenará ScrollSmoother e animações de seção. CSS responsivo ampliará o percurso somente em desktop.

**Tech Stack:** Next.js 16, React 19, TypeScript, CSS Modules, GSAP, ScrollTrigger, ScrollSmoother, Vitest e Testing Library.

---

### Task 1: Acordeão e rodapé

**Files:**
- Create: `src/components/landing/faq-accordion.tsx`
- Modify: `src/components/landing/landing-page.tsx`
- Modify: `src/components/landing/landing-page.module.css`
- Test: `src/test/landing-page.test.tsx`

- [ ] Escrever testes que exijam botões com `aria-expanded` e links externos para Instagram e LinkedIn.
- [ ] Executar `npm test -- src/test/landing-page.test.tsx` e confirmar falha.
- [ ] Implementar acordeão GSAP acessível e links sociais.
- [ ] Reexecutar o teste e confirmar aprovação.

### Task 2: Movimento global e cursor

**Files:**
- Create: `src/components/landing/custom-cursor.tsx`
- Modify: `src/components/landing/landing-motion.tsx`
- Modify: `src/components/landing/landing-page.tsx`
- Modify: `src/components/landing/landing-page.module.css`

- [ ] Adicionar estrutura testável do cursor e wrappers de suavização.
- [ ] Registrar ScrollSmoother e criar instância apenas no contexto desktop permitido.
- [ ] Implementar cursor com `gsap.quickTo`, estados interativos e limpeza completa.
- [ ] Adicionar detalhes orgânicos sutis e alinhar números da seção de reconhecimento.

### Task 3: Percurso desktop

**Files:**
- Modify: `src/components/percurso/journey-shell.tsx`
- Modify: `src/components/percurso/journey.module.css`
- Test: `src/test/journey-shell.test.tsx`

- [ ] Escrever teste para a classe de layout da devolutiva.
- [ ] Executar o teste e confirmar falha.
- [ ] Ampliar shell, colunas e escala tipográfica em desktop mantendo fluxo mobile.
- [ ] Reexecutar o teste e confirmar aprovação.

### Task 4: Verificação e publicação

**Files:**
- Verify all modified files.

- [ ] Executar `npm test`.
- [ ] Executar `npm run lint`.
- [ ] Executar `npm run build`.
- [ ] Inspecionar landing, FAQ, cursor, formulário e devolutiva em desktop e mobile.
- [ ] Criar commit e publicar em `main`.
