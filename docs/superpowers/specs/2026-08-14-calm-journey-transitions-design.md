# Transições calmas do percurso

## Objetivo

Dar continuidade visual entre a landing page, o início das perguntas e a devolutiva, usando a identidade terracota da Iasmin sem transformar o carregamento no elemento principal da tela.

## Entrada no percurso

- Fundo terracota sólido em tela inteira.
- Tipografia creme ou branca com contraste adequado.
- Assinatura visual da marca em tamanho discreto.
- Texto principal: “Uma pausa antes de começar.”
- Texto de apoio: “Te levando para um espaço mais tranquilo.”
- Indicador de carregamento pequeno, com três pontos de baixa amplitude.
- Duração total de 3 segundos antes da navegação para `/percurso`.
- A entrada combina fade e deslocamento vertical curto. A saída usa fade suave.

## Início das perguntas

- Substituir o nome textual do cabeçalho pela assinatura SVG “Iasmin psi”.
- Manter o texto introdutório e o aviso de que o percurso não substitui atendimento psicológico.
- Remover as escolhas “Sou maior de 18 anos” e “Sou menor de 18 anos”.
- Exibir somente o botão “Iniciar as perguntas”, que leva à seleção de tema.
- Remover do fluxo o estado visual dedicado a menores, sem alterar a política de dados já publicada nesta entrega.

## Preparação da devolutiva

- Após a quinta resposta, mostrar uma tela terracota dedicada enquanto o envio é concluído.
- Texto principal: “Um instante para acolher o que você compartilhou.”
- Texto de apoio: “Estamos preparando uma devolutiva para você olhar com calma.”
- Incluir uma ilustração vetorial simples e discreta, construída com formas da própria interface e sem competir com o texto.
- Usar o mesmo indicador de três pontos da transição inicial.
- Manter a tela visível por no mínimo 3,5 segundos. Se a requisição demorar mais, ela permanece até a resposta chegar.
- Quando a resposta estiver pronta, revelar a devolutiva com fade e deslocamento curto.
- Em erro, preservar a tela de recuperação existente.

## Movimento e acessibilidade

- Implementar sequências com GSAP e `useGSAP`, usando escopo por referência e limpeza automática.
- Animar apenas `opacity` e `transform` para evitar reflow.
- Respeitar `prefers-reduced-motion`: reduzir animações e encurtar as esperas artificiais.
- Manter `role="status"` e `aria-live="polite"` nos estados de espera.

## Verificação

- Testar a duração da entrada e a navegação.
- Testar que o início possui apenas “Iniciar as perguntas”.
- Testar a presença da assinatura SVG “Iasmin psi”.
- Testar que a devolutiva não aparece antes do tempo mínimo e que aparece após a resposta e o tempo mínimo.
- Executar lint, suíte completa e build de produção.
