# Aplicação da identidade visual de Iasmin Portugal

## Objetivo

Substituir as marcas tipográficas provisórias da landing page pelos arquivos oficiais de Iasmin Portugal, mantendo a estrutura, a legibilidade e a atmosfera acolhedora já aprovadas. A aplicação deve aumentar o reconhecimento da marca sem competir com as fotografias, as headlines ou as chamadas para ação.

## Direção aprovada

A direção escolhida é o sistema editorial equilibrado. Cada variação da marca terá uma função clara e será usada com baixa repetição:

- A marca horizontal será a identificação principal do cabeçalho.
- A assinatura “Iasmin psi” aparecerá em um único momento autoral no hero.
- O monograma será reservado a superfícies compactas, especialmente favicon e identificação visual do menu mobile.
- A marca completa com “Psicóloga Clínica” encerrará a experiência no rodapé.

## Arquivos de origem

Os SVGs oficiais estão em `C:\Users\antonio.santos\Documents\iasmin-portugal-branding\svgs\iasmin psi\otimizados`. Somente as versões já processadas pelo SVGO serão copiadas para o projeto.

O mapeamento será:

| Uso | Arquivo oficial |
| --- | --- |
| Cabeçalho | `variacao 1 - iasmin portugal.svg` |
| Rodapé | `variacao 3 - iasmin portugal psicologa clinica.svg` |
| Assinatura do hero | `variacao 5 - iasmin psi.svg` |
| Favicon e uso compacto | `monograma.svg` |

A variação sobreposta não será usada nesta etapa, pois não resolve uma necessidade que as quatro aplicações selecionadas já não cubram.

## Aplicação por região

### Cabeçalho

A marca horizontal substituirá o lettering provisório, preservando o link para o início da página. Ela terá largura responsiva com dimensões máximas diferentes para desktop e mobile, sem alterar sua proporção. O contraste será marrom espresso sobre o fundo creme. O nome acessível será “Iasmin Portugal, Psicóloga Clínica”.

### Hero

A assinatura “Iasmin psi” será posicionada como um detalhe editorial discreto na área de texto do hero, próxima ao contexto institucional e distante dos botões. Ela não substituirá a headline e não ficará sobre a fotografia. Em telas estreitas, poderá ser reduzida ou ocultada caso não exista espaço suficiente para manter a hierarquia e a primeira dobra equilibradas.

### Menu mobile e metadados

O monograma será usado como favicon e ícone da aplicação. No menu mobile, ele poderá aparecer como selo compacto, sem substituir o botão sanduíche nem reduzir a clareza da navegação. Não será usado como elemento decorativo repetido pelas seções.

### Rodapé

A versão completa substituirá a marca provisória do rodapé. Será exibida em creme sobre o fundo espresso, alinhada ao topo com os dados profissionais da psicóloga. Em telas menores, o alinhamento seguirá a composição vertical existente.

## Componente e organização técnica

Será criado um componente React `BrandLogo` com uma API pequena e explícita:

- `variant`: `horizontal`, `full`, `signature` ou `monogram`.
- `tone`: `espresso`, `cream` ou `terracotta`.
- `className`: integração com o CSS Module de cada região.
- Texto alternativo configurado conforme o contexto. Usos puramente decorativos receberão semântica apropriada.

Os SVGs monocromáticos serão tratados como máscaras CSS. Assim, a cor será controlada por `currentColor` sem duplicar os arquivos nem alterar o desenho original. O componente manterá as proporções oficiais por meio de razões de aspecto próprias para cada variante.

Os assets ficarão em `public/brand`. O favicon será derivado do monograma oficial e referenciado pelos metadados do Next.js.

## Regras visuais

- Nunca distorcer, inclinar, contornar ou aplicar sombra à marca.
- Manter uma área de respiro mínima equivalente à altura das letras minúsculas do logotipo.
- Usar espresso sobre creme ou marfim.
- Usar creme sobre espresso, terracota ou fundos escuros.
- Evitar a marca sobre áreas visualmente complexas da fotografia.
- Não repetir mais de uma assinatura completa dentro da mesma dobra.
- A marca não pode competir em escala com a headline principal.

## Responsividade

A aplicação será validada nos seguintes contextos:

- Desktop amplo.
- iPad Pro em 1024 por 1366 pixels, mantendo composição semelhante à versão desktop com ajustes de escala.
- Mobile em 430 por 932 pixels, preservando espaço para logo, menu e botão “Agendar” sem sobreposição.
- Larguras móveis menores contempladas pelos breakpoints existentes.

Se houver conflito de espaço no cabeçalho mobile, a prioridade será: identificação legível, botão de menu e ação “Agendar”. A assinatura autoral do hero será o primeiro elemento de marca a ser reduzido ou ocultado.

## Acessibilidade e desempenho

- Logos funcionais terão nome acessível coerente com o destino.
- Usos decorativos não serão anunciados por leitores de tela.
- O contraste seguirá a paleta já aprovada.
- Os SVGs permanecerão vetoriais e otimizados.
- Não haverá JavaScript para dimensionamento ou recoloração.
- A implementação não introduzirá animações novas na marca além das entradas já existentes da página.

## Verificação

A entrega será considerada concluída quando:

- Todas as marcas provisórias forem substituídas nas regiões definidas.
- Os quatro usos oficiais renderizarem sem deformação ou corte.
- Cabeçalho, hero e rodapé permanecerem equilibrados nos três tamanhos de referência.
- O favicon usar o monograma oficial.
- O build de produção, o lint e os testes existentes forem aprovados.
- A landing for inspecionada visualmente no navegador em desktop, iPad e mobile.

## Fora de escopo

- Redesenho das marcas oficiais.
- Mudança de paleta da landing.
- Alteração das fotografias ou do conteúdo textual.
- Uso da marca como padrão decorativo repetido.
- Criação de novas seções ou mudanças no percurso de autoconhecimento.
