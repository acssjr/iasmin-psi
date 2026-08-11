# Iasmin Portugal | Psicologia Clínica

Landing page comercial de Iasmin Portugal, psicóloga clínica. O projeto apresenta
o atendimento on-line, a abordagem de Análise do Comportamento e um percurso de
autoconhecimento breve para adolescentes e adultos.

## Escopo

Esta aplicação foi construída para a operação de Iasmin Portugal. Ela inclui:

- página institucional responsiva, com agendamento pelo WhatsApp;
- percurso de autoconhecimento com cinco perguntas de reflexão;
- registro de submissões no Neon e rotina de retenção de dados;
- eventos de conversão sem envio de dados pessoais ao Web Analytics;
- política pública de privacidade e canal direto para pedidos de exclusão.

O percurso é informativo. Não realiza diagnóstico e não substitui psicoterapia
ou atendimento de urgência.

## Stack

- Next.js App Router e React
- TypeScript e CSS Modules
- GSAP para movimentos com suporte a redução de movimento
- Neon Postgres para dados do percurso
- Vercel Web Analytics, Vitest e Playwright
- Vercel para hospedagem e cron de retenção

## Desenvolvimento local

Pré-requisito: Node.js LTS e npm.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Abra `http://localhost:3000`.

### Variáveis de ambiente

| Variável | Uso | Exposição |
| --- | --- | --- |
| `DATABASE_URL` | Conexão com o banco Neon para registrar o percurso | Privada |
| `CRON_SECRET` | Autentica a execução de `/api/retencao` | Privada |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Sobrescreve o WhatsApp de agendamento | Pública no navegador |

Use somente dígitos, incluindo DDI, em `NEXT_PUBLIC_WHATSAPP_NUMBER`. Se ela
não for configurada, a aplicação usa o número comercial padrão definido no
código. Nunca versione `.env.local`, chaves, tokens ou dados reais de pacientes.

## Qualidade

Antes de abrir uma revisão ou fazer deploy, execute:

```powershell
npm run lint
npm run test
npm run test:e2e
npm run build
```

Os testes cobrem a landing, a responsividade, o percurso para maiores de idade,
o bloqueio para menores, a retenção, o WhatsApp, a acessibilidade dos seletores
e a proteção contra dados pessoais em URLs e analytics.

## Dados e operação

O percurso coleta nome, e-mail, WhatsApp, cinco respostas de reflexão, o
registro de consentimento e parâmetros UTM quando existirem. As respostas são
anonimizadas após 180 dias. Os dados de contato são excluídos no mesmo prazo ou
antes, mediante pedido de exclusão.

O Web Analytics recebe somente eventos técnicos de navegação, com propriedades
seguras como `surface`, `step` e `theme`. Nome, e-mail, WhatsApp e respostas não
são enviados ao analytics.

Revise periodicamente os eventos de conversão, os logs do cron e os pedidos de
exclusão recebidos pelo WhatsApp. A explicação destinada ao público está em
[`/privacidade`](src/app/privacidade/page.tsx).

## Deploy na Vercel

1. Crie o banco Neon e aplique [sql/001_create_journey_submissions.sql](sql/001_create_journey_submissions.sql).
2. Importe este repositório em um projeto Vercel.
3. Configure `DATABASE_URL`, `CRON_SECRET` e, se necessário, `NEXT_PUBLIC_WHATSAPP_NUMBER` em Preview e Production.
4. Confirme o cron de [vercel.json](vercel.json), que executa `/api/retencao` diariamente.
5. Faça um deploy de Preview, valide a jornada e execute a suíte de qualidade.
6. Publique em Production somente após revisar textos, privacidade, WhatsApp e variáveis de ambiente.

Alterações em variáveis da Vercel exigem um novo deploy para entrarem em vigor.

## Propriedade intelectual e uso

Este é um ativo comercial proprietário, não um template ou boilerplate. Código,
identidade visual, textos, imagens, estrutura de conversão e materiais de marca
pertencem aos seus respectivos titulares.

Nenhuma permissão de cópia, redistribuição, adaptação, revenda ou uso comercial é
concedida por este repositório sem autorização prévia e expressa por escrito. O
acesso ao código não concede licença sobre a marca nem sobre os materiais
publicados. Se a política for restringir o acesso ao código, mantenha o
repositório privado no GitHub.

## Manutenção

Mudanças de conteúdo, dados ou integrações devem ser revisadas pela pessoa
responsável pelo projeto antes da publicação. Para dúvidas técnicas, utilize os
canais definidos pelo responsável pelo repositório.
