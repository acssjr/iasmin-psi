# Calm Journey Transitions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar a entrada e a conclusão do percurso em transições terracota calmas, simplificando a tela inicial para um único botão.

**Architecture:** A transição entre rotas continua no `JourneyTransitionProvider`, com tempo de navegação controlado e animação GSAP escopada. O percurso troca o age gate por um início simples e ganha um componente de preparação que sincroniza o tempo mínimo de exibição com a resposta da API antes de revelar a devolutiva.

**Tech Stack:** Next.js 16 App Router, React, TypeScript, CSS Modules, GSAP com `useGSAP`, Vitest e Testing Library.

---

### Task 1: Transição terracota de entrada

**Files:**
- Modify: `src/components/journey-transition.tsx`
- Modify: `src/components/journey-transition.module.css`
- Test: `src/test/journey-transition.test.tsx`

- [ ] **Step 1: Escrever o teste que exige 3 segundos e o indicador discreto**

Atualizar o teste para procurar `[data-calm-loader]`, o monograma em tom creme e confirmar que `router.push('/percurso')` ainda não ocorreu com 2999 ms.

- [ ] **Step 2: Executar o teste e confirmar a falha**

Run: `npm test -- src/test/journey-transition.test.tsx --reporter=dot`
Expected: FAIL porque a navegação atual ocorre em 1900 ms e não existe `data-calm-loader`.

- [ ] **Step 3: Implementar a transição mínima**

Alterar o timer normal para 3000 ms, manter 220 ms em movimento reduzido, trocar o monograma para `tone="cream"` e renderizar:

```tsx
<span className={styles.loader} data-calm-loader aria-hidden="true">
  <i /><i /><i />
</span>
```

Usar fundo `var(--terracotta)`, texto `var(--cream)` e uma timeline GSAP baseada em `opacity` e `transform`, sem halo circular.

- [ ] **Step 4: Executar o teste e confirmar aprovação**

Run: `npm test -- src/test/journey-transition.test.tsx --reporter=dot`
Expected: PASS.

### Task 2: Início simplificado com assinatura Iasmin psi

**Files:**
- Modify: `src/components/percurso/journey-intro.tsx`
- Modify: `src/components/percurso/journey-shell.tsx`
- Modify: `src/components/percurso/journey.module.css`
- Test: `src/test/journey-shell.test.tsx`

- [ ] **Step 1: Escrever o teste do novo início**

O teste deve confirmar a presença de `[data-brand-variant="signature"]`, do botão “Iniciar as perguntas” e a ausência dos dois botões etários.

- [ ] **Step 2: Executar o teste e confirmar a falha**

Run: `npm test -- src/test/journey-shell.test.tsx --reporter=dot`
Expected: FAIL porque o age gate ainda mostra dois botões e o cabeçalho é textual.

- [ ] **Step 3: Implementar o início mínimo**

Substituir `AgeGate` por `JourneyIntro({ onStart })`, renderizar `BrandLogo variant="signature" tone="terracotta"`, usar apenas:

```tsx
<button className={styles.primaryButton} type="button" onClick={onStart}>
  Iniciar as perguntas
</button>
```

No cabeçalho de `JourneyShell`, substituir o texto por `BrandLogo variant="signature"`. Remover `minor-route` do tipo de estado e do fluxo.

- [ ] **Step 4: Atualizar os testes existentes para iniciar pelo botão único**

Trocar cliques em “Sou maior de 18 anos” por “Iniciar as perguntas” e remover o teste da rota de menor.

- [ ] **Step 5: Executar o teste e confirmar aprovação**

Run: `npm test -- src/test/journey-shell.test.tsx --reporter=dot`
Expected: PASS.

### Task 3: Preparação calma e temporizada da devolutiva

**Files:**
- Create: `src/components/percurso/journey-preparing.tsx`
- Modify: `src/components/percurso/journey-shell.tsx`
- Modify: `src/components/percurso/journey.module.css`
- Test: `src/test/journey-shell.test.tsx`

- [ ] **Step 1: Escrever o teste com tempo mínimo**

Usar timers falsos e uma resposta imediata da API. Após a quinta pergunta, confirmar o texto “Um instante para acolher o que você compartilhou”, avançar 3499 ms e garantir que a devolutiva não apareceu; avançar 1 ms e confirmar sua exibição.

- [ ] **Step 2: Executar o teste e confirmar a falha**

Run: `npm test -- src/test/journey-shell.test.tsx --reporter=dot`
Expected: FAIL porque o resultado aparece assim que o `fetch` resolve.

- [ ] **Step 3: Criar o componente de preparação**

Renderizar um `role="status"` terracota com texto, desenho minimalista baseado em três linhas curvas CSS e o mesmo loader discreto. Animar com `useGSAP`, referência de escopo e limpeza automática.

- [ ] **Step 4: Sincronizar API e tempo mínimo**

Em `submitJourney`, executar em paralelo a persistência e `minimumCalmDelay(3500)`. Em movimento reduzido, usar 220 ms. Só definir `view.kind = 'result'` depois que ambos concluírem; preservar o tratamento de erro atual.

- [ ] **Step 5: Executar o teste e confirmar aprovação**

Run: `npm test -- src/test/journey-shell.test.tsx --reporter=dot`
Expected: PASS.

### Task 4: Verificação e publicação

**Files:**
- Test: all affected files

- [ ] **Step 1: Executar lint**

Run: `npm run lint`
Expected: exit 0.

- [ ] **Step 2: Executar a suíte completa**

Run: `npm test -- --reporter=dot`
Expected: todos os testes aprovados.

- [ ] **Step 3: Executar build de produção**

Run: `npm run build`
Expected: compilação e geração das rotas concluídas.

- [ ] **Step 4: Commit e push**

Stage somente os arquivos do recurso, criar commit descritivo e executar `git push origin HEAD:main`.
