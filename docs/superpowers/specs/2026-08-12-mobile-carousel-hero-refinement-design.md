# Refinamento mobile do carrossel e hero

## Objetivo

Refinar a experiência mobile da landing page para tornar o carrossel de reconhecimento mais calmo e previsível e deixar a entrada do hero mais contemporânea e compacta.

## Escopo responsivo

As mudanças estruturais se aplicam a telas de até `35rem`. Desktop e tablet mantêm o layout atual. Em `prefers-reduced-motion: reduce`, os conteúdos permanecem estáticos, legíveis e sem reprodução automática.

## Carrossel de reconhecimento

- Exibir somente os três cards reais, sem um quarto card duplicado visível ou espaço vazio ao concluir o ciclo.
- Manter cada card em repouso por aproximadamente seis segundos.
- Fazer a transição entre cards em aproximadamente `0.8s`, usando transformação horizontal e easing suave.
- Ao sair do terceiro card, retornar ao primeiro sem revelar área vazia.
- Exibir três indicadores abaixo do carrossel. O indicador ativo deve ser preenchido e os demais apenas contornados.
- Atualizar o indicador ativo a cada mudança automática.
- Pausar a reprodução automática durante interação por ponteiro ou foco.
- Os indicadores devem comunicar semanticamente a posição atual por meio de `aria-current`.

## Contraste da seção

O kicker “Pode ser que você se reconheça aqui” recebe a cor `#fff9f1` dentro da seção terracota. A mudança pertence à seção e não altera globalmente outros kickers.

## Hero mobile

- Foto, eyebrow, título, texto e ações entram na mesma timeline, com sobreposição temporal.
- Remover o recorte animado da foto no mobile. A foto usa apenas `autoAlpha` e deslocamento vertical pequeno.
- Evitar qualquer sensação de painel deslizando depois do texto.
- Reduzir sutilmente a altura da foto e aumentar levemente a sobreposição do bloco textual, fazendo a próxima informação aparecer antes sem comprimir o conteúdo.
- Manter o enquadramento, a legibilidade e os alvos de toque atuais.

## Implementação

O carrossel permanece em `RecognitionCarousel`, com estado visual do indicador atualizado pela timeline GSAP. A animação continua dentro de `useGSAP`, limitada por `gsap.matchMedia` e com limpeza automática. A timeline principal do hero recebe valores diferentes para mobile e desktop, evitando duplicar componentes.

## Verificação

- Teste de componente para três indicadores e primeiro indicador ativo.
- Teste estrutural para garantir três cards reais e ausência de clone acessível.
- Teste de CSS para o contraste e os ajustes de dimensão mobile.
- Testes completos, lint e build.
- Inspeção visual em `379x698` e `430x932`.
