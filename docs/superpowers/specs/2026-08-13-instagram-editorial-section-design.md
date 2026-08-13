# Seção editorial do Instagram

## Objetivo

Mostrar que Iasmin mantém uma presença ativa no Instagram e aborda temas diversos, sem retirar o visitante da landing page nem competir com a conversão principal pelo WhatsApp.

## Posição e narrativa

A seção entra depois de “Temas que podem encontrar espaço na terapia” e antes da dobra das cinco perguntas. Essa posição reforça repertório e presença profissional antes de apresentar a experiência de autoconhecimento.

## Composição aprovada

- Direção visual: mosaico editorial.
- Desktop: uma capa principal ocupando duas linhas e três capas secundárias ao lado.
- Mobile: carrossel manual com as quatro capas, indicadores de posição e suporte a gesto horizontal.
- Sem autoplay, embed, API do Instagram ou links nas capas.
- Um único CTA, “Conversar com Iasmin”, direcionado ao WhatsApp.
- Imagens hospedadas localmente e renderizadas com `next/image`.

## Conteúdo

- Kicker: “Conteúdos para continuar a conversa”.
- Headline: “Reflexões para levar com você.”
- Texto de apoio: apresenta o Instagram como outro espaço de acolhimento e reflexão sobre relações, mudanças, comunicação e amadurecimento.
- Capas: amadurecimento, comportamentos que parecem besteira, comunicação e encerramento de ciclos.

## Ajustes relacionados

- Aumentar muito levemente o espaçamento entre letras das headlines para reduzir a sensação de texto truncado, preservando o caráter compacto da identidade.
- Na dobra das cinco perguntas, usar “Iniciar o percurso” no CTA para evitar repetição de “5 perguntas para se conhecer melhor”.

## Interação, acessibilidade e desempenho

- Textos alternativos descritivos nas quatro capas.
- Carrossel mobile navegável por toque e teclado, sem movimento automático.
- Respeito a `prefers-reduced-motion` nas animações de entrada.
- Animação de revelação discreta por GSAP, usando apenas `opacity` e `transform`.
- Nenhum script de terceiros, cookie adicional ou dependência nova.

## Verificação

- Teste de renderização do conteúdo, das quatro capas e do CTA para WhatsApp.
- Teste estrutural da responsividade e do novo espaçamento tipográfico.
- Execução da suíte completa, lint e build de produção.
