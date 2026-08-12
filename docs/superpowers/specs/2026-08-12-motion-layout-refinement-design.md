# Refinamento de movimento e layout

## Objetivo

Deixar a landing e o percurso mais fluidos, acolhedores e bem distribuídos em desktop, preservando desempenho, acessibilidade e a identidade terracota solar.

## Direção visual

- O acordeão do FAQ terá abertura e fechamento controlados por GSAP, com altura, opacidade e ícone sincronizados.
- A seção de reconhecimento alinhará os números ao centro vertical de cada texto.
- O scroll terá suavização moderada via ScrollSmoother apenas em desktop com mouse e sem preferência por movimento reduzido. Mobile e touch manterão scroll nativo.
- O cursor personalizado será formado por um ponto e um halo orgânico em terracota. Em elementos interativos, o halo cresce de modo suave. Ele não aparecerá em touch nem para quem prefere movimento reduzido.
- As dobras receberão marcas orgânicas discretas, derivadas dos pontos e caminhos já presentes na marca.

## Percurso

No desktop, formulário e devolutiva usarão uma largura maior. A devolutiva será uma composição horizontal com texto, ilustração e ações visíveis na mesma área útil, evitando que o título forme uma coluna estreita. No mobile, a ordem continuará linear e confortável.

## Rodapé

Instagram e LinkedIn serão apresentados como links externos acessíveis, com ícone, rótulo, abertura em nova aba e `rel="noreferrer"`. O Instagram usará o perfil público confirmado. Como o perfil exato do LinkedIn não foi encontrado, o destino ficará isolado em uma constante para substituição segura.

## Acessibilidade e desempenho

- Todo movimento respeitará `prefers-reduced-motion`.
- O acordeão manterá `aria-expanded`, associação entre botão e painel e navegação por teclado.
- O cursor não bloqueará cliques e utilizará transformações aceleradas.
- Imagens e textos continuarão legíveis sem JavaScript e em telas menores.

## Verificação

Serão cobertos por testes o acordeão, os links sociais e a estrutura do resultado. A entrega exige testes, lint, build e inspeção visual em desktop e mobile.
