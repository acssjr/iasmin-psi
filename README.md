# Iasmin Portugal · Psicologia Clínica

Landing page em Next.js para Iasmin Portugal, psicóloga clínica. O projeto
apresenta a abordagem de Análise do Comportamento, atendimento on-line para
adolescentes e adultos e um percurso de autoconhecimento com dez perguntas de
reflexão.

## Desenvolvimento local

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Use estes valores em `.env.local`:

```dotenv
DATABASE_URL=postgresql://...
NEXT_PUBLIC_WHATSAPP_NUMBER=5571XXXXXXXXX
CRON_SECRET=um-segredo-longo-e-unico
```

`DATABASE_URL` e `CRON_SECRET` são privados. `NEXT_PUBLIC_WHATSAPP_NUMBER` é
o único valor exposto ao navegador e deve conter o número completo, com DDI e
apenas dígitos.

## Qualidade

```powershell
npm run test
npm run test:e2e
npm run lint
npm run build
```

Os testes cobrem a landing, a jornada para maiores de idade, o bloqueio para
menores, consentimento obrigatório, validação de submissões, idempotência,
retenção e redução de movimento.

## Dados e privacidade

O percurso coleta nome, e-mail, WhatsApp, respostas de reflexão, consentimentos
e parâmetros UTM quando existirem. Respostas brutas ficam guardadas por 180 dias
e depois são anonimizadas. Sem a permissão opcional de contato, os dados de
contato são excluídos nesse mesmo prazo. Com a permissão, o contato é mantido
até a pessoa solicitar exclusão.

O Web Analytics recebe somente eventos com `surface`, `step` ou `theme`. Ele não
recebe nome, e-mail, WhatsApp ou respostas. A explicação destinada ao público
está em [/privacidade](/privacidade).

## Preparação para produção na Vercel

1. Crie um banco Neon e aplique [sql/001_create_journey_submissions.sql](sql/001_create_journey_submissions.sql).
2. No projeto Vercel, use o plano Pro e ative Vercel Web Analytics com eventos personalizados.
3. Configure `DATABASE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER` e `CRON_SECRET` nos ambientes Preview e Production.
4. Confirme o cron diário definido em [vercel.json](vercel.json) para `/api/retencao` e confira os primeiros logs.
5. Crie uma regra de WAF para limitar `POST /api/percursos` a 10 requisições por minuto por IP.
6. Revise a página de privacidade e os textos de consentimento com a profissional antes de publicar.
7. Faça uma submissão real de teste somente após essa aprovação, confira a devolutiva e valide o WhatsApp.

Depois dos passos acima:

```powershell
vercel link
vercel env add DATABASE_URL production
vercel env add NEXT_PUBLIC_WHATSAPP_NUMBER production
vercel env add CRON_SECRET production --sensitive
vercel --prod
```

## Operação recorrente

Revise semanalmente os eventos de conversão, os logs do cron de retenção e as
solicitações de exclusão recebidas pelo WhatsApp. Em cada alteração de texto ou
formulário, rode a suíte de qualidade antes do deploy.
