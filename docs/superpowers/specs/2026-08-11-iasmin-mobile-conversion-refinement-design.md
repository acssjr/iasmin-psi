# Refinamento mobile e percurso de conversão

## Objetivo

Priorizar a experiência em telas pequenas, corrigir todos os caminhos de
agendamento e diminuir a fricção do percurso de autoconhecimento.

## Decisões aprovadas

- Usar `5575981234176` como destino padrão do WhatsApp. Uma variável de
  ambiente continua podendo substituir o valor em produção.
- Todos os CTAs de agendamento devem abrir o WhatsApp com a mensagem: “Olá,
  Iasmin. Gostaria de agendar uma sessão de psicoterapia.”
- O percurso terá cinco perguntas, selecionadas para manter a distribuição
  entre sobrecarga, autocrítica e reconexão.
- Não haverá checkbox de consentimento. Antes do botão de início, haverá o
  aviso: “Ao continuar, você concorda com o uso dos seus dados para gerar esta
  devolutiva e viabilizar o contato que solicitar.” O clique no botão é a ação
  que registra a concordância.
- A devolutiva não traz diagnóstico. Ela agradece a pausa, apresenta o tema de
  reflexão e convida a pessoa a conversar com Iasmin sem enviar respostas no
  link do WhatsApp.

## Mobile

- Hero com cabeçalho discreto, bloco de marca único, título com tamanho e
  entrelinha mais confortáveis e CTA de sessão imediatamente visível.
- Foto em arco mais baixa e próxima da primeira dobra, sem competir com os
  dois CTAs.
- Espaçamento vertical menor entre introdução, CTAs e trilha, mantendo áreas de
  toque de 44px ou mais.

## Percurso

- Formulário inicial enxuto, sem campos ou consentimentos duplicados.
- Cinco perguntas: as originais 1, 3, 5, 8 e 10, com numeração sequencial de
  1 a 5.
- Cada opção vira um cartão com um único indicador circular construído em CSS.
  O estado selecionado altera borda, fundo e indicador com transições de
  transform e opacidade. Nenhum input nativo fica visível.
- A mudança de pergunta usa uma transição curta e reversível com GSAP,
  respeitando `prefers-reduced-motion`.
- Em desenvolvimento, sem `DATABASE_URL`, o percurso mostra a devolutiva após
  as respostas e não tenta fingir que houve persistência. Em produção, a
  persistência continua obrigatória e erros reais continuam visíveis.

## Copy

- FAQ 2: “Iasmin atende quais públicos?” Resposta em primeira pessoa:
  “Realizo atendimentos para adolescentes e adultos em todo o Brasil.”
- FAQ 4 troca urgência por “Como posso agendar uma sessão?” com uma resposta
  que orienta a usar o WhatsApp.
- O primeiro parágrafo da seção de apresentação destaca **Iasmin Portugal**.

## Verificação

- Testar CTAs com o número padrão e mensagem codificada.
- Testar a versão de cinco respostas no cliente e no schema da API.
- Testar o modo local sem banco, a rota de produção com banco indisponível e a
  ausência de dados pessoais na URL e no WhatsApp.
- Revisar 390px, 768px e 1440px, fluxo de teclado e redução de movimento.
