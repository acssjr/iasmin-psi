# Transição calma e percurso temático

## Objetivo

Transformar a entrada do percurso de autoconhecimento em uma experiência calma e coerente com a identidade de Iasmin Portugal, além de substituir o conjunto genérico de perguntas por quatro trilhas contextuais escritas originalmente em português brasileiro.

O percurso continua sendo um recurso breve de reflexão. Ele não realiza diagnóstico, avaliação psicológica, triagem clínica ou recomendação automatizada de tratamento.

## Princípios

- Usar linguagem cotidiana, situada e acolhedora.
- Observar contexto, ação, efeitos e apoio sem rotular a pessoa.
- Não apresentar respostas como certas, erradas, maduras ou saudáveis.
- Empregar formulações abertas nas devolutivas, como “talvez”, “pode ser” e “suas respostas sugerem”.
- Não reproduzir, traduzir ou adaptar escalas e testes psicológicos.
- Manter legibilidade, navegação por teclado e suporte a redução de movimento.
- Preservar a identidade terracota solar, creme, marrom e oliva já aplicada ao site.

## Fluxo

1. A pessoa seleciona qualquer CTA “Iniciar meu percurso de autoconhecimento” na landing page.
2. O site apresenta a transição calma antes de navegar.
3. O percurso confirma se a pessoa é maior de 18 anos.
4. A pessoa escolhe um dos quatro temas.
5. A pessoa informa nome, e-mail e WhatsApp e aceita o aviso único de uso de dados.
6. A pessoa responde cinco situações do tema escolhido.
7. O site salva a submissão e apresenta uma devolutiva reflexiva.

Menores de 18 anos continuam seguindo para a orientação específica sem informar dados de contato.

## Transição para o percurso

### Direção visual escolhida

“A pausa respira”. Uma camada creme cobre a interface, enquanto um halo terracota expande e recolhe com ritmo lento. A mensagem e o halo surgem juntos, evitando o aspecto de slides sequenciais.

Texto:

- Título: “Uma pausa antes de começar.”
- Apoio: “Te levando para um espaço mais tranquilo.”

### Comportamento

- Todos os CTAs internos que apontam para `/percurso` usam o mesmo componente de navegação.
- Ao clicar, o CTA fica temporariamente indisponível para impedir navegação duplicada.
- A rota é pré-carregada e a camada de transição recebe foco sem criar uma etapa interativa.
- A duração percebida é de aproximadamente dois segundos.
- A navegação ocorre ao final da animação.
- Se a navegação falhar, a camada é removida e o CTA volta a funcionar.
- Com `prefers-reduced-motion: reduce`, não há pulsação e a espera é reduzida ao mínimo necessário para comunicar a mudança de página.
- Links modificados com Ctrl, Cmd, Shift ou botão do meio mantêm o comportamento nativo do navegador e não exibem a transição.

### Composição

- Fundo creme opaco.
- Halo terracota com baixa opacidade e escala por `transform`.
- Monograma ou assinatura da marca usado de forma discreta, sem competir com a mensagem.
- Plus Jakarta Sans, alto contraste e nenhuma tipografia fina.
- Camada acima de todo o site, sem causar mudança de layout.

## Escolha de tema

A tela usa quatro cartões ou botões amplos, cada um com título e uma frase curta. Nenhuma opção é destacada como recomendada.

1. Ansiedade e sobrecarga
2. Relacionamentos e limites
3. Luto, perdas e mudanças
4. Autoestima e autocrítica

O tema escolhido permanece visível de modo discreto no cabeçalho das cinco perguntas. A pessoa pode voltar à seleção de tema antes de concluir o percurso.

## Perguntas

### Ansiedade e sobrecarga

1. **Quando você percebe que o dia ficou mais pesado do que esperava, o que costuma acontecer primeiro?**
   - Tento resolver tudo de uma vez.
   - Adio algumas coisas porque não sei por onde começar.
   - Continuo fazendo o que precisa ser feito, mesmo já estando cansada.
   - Procuro diminuir o ritmo e entender o que está me atravessando.

2. **Quando uma preocupação aparece e continua voltando, como você costuma lidar com ela?**
   - Repasso a situação várias vezes, tentando prever o que pode acontecer.
   - Procuro me ocupar para não pensar nisso.
   - Converso com alguém em quem confio.
   - Tento perceber o que está ao meu alcance naquele momento.

3. **Nos momentos em que a ansiedade aumenta, o que você percebe no seu cotidiano?**
   - Fico mais impaciente ou em estado de alerta.
   - Tenho dificuldade para descansar, mesmo quando há tempo.
   - Evito decisões ou situações que parecem difíceis demais.
   - Sinto que preciso de apoio, mas nem sempre consigo pedir.

4. **Quando você sente que não vai conseguir dar conta de tudo, qual reação mais se aproxima da sua?**
   - Aumento ainda mais a cobrança sobre mim.
   - Tento esconder que estou cansada.
   - Abro mão de alguma coisa para conseguir respirar.
   - Busco ajuda ou reorganizo o que é prioridade.

5. **O que parece estar fazendo mais falta neste momento?**
   - Um pouco menos de pressão.
   - Um espaço para descansar sem culpa.
   - Clareza para escolher o que realmente precisa da minha atenção.
   - Apoio para não precisar sustentar tudo sozinha.

### Relacionamentos e limites

1. **Quando algo em uma relação te incomoda, o que costuma acontecer?**
   - Evito falar para não criar um conflito.
   - Tento explicar, mas acabo falando quando já estou no limite.
   - Digo o que preciso, mesmo com receio da reação da outra pessoa.
   - Fico em dúvida se o que estou sentindo é motivo suficiente para conversar.

2. **Quando alguém importante para você precisa de ajuda, como você costuma responder?**
   - Tento estar disponível, mesmo quando isso me sobrecarrega.
   - Ajudo até onde consigo e aviso quando preciso parar.
   - Sinto culpa quando não consigo fazer o que a pessoa espera.
   - Espero que a pessoa perceba sozinha quando eu também preciso de cuidado.

3. **Em uma conversa difícil, o que mais pesa para você?**
   - O medo de decepcionar ou perder a pessoa.
   - A sensação de não conseguir ser compreendida.
   - A vontade de encerrar logo o assunto para diminuir o desconforto.
   - Encontrar um jeito de falar sem me abandonar nem desrespeitar o outro.

4. **Quando você diz “sim” querendo dizer “não”, o que geralmente está por trás disso?**
   - O receio de parecer egoísta.
   - A tentativa de evitar uma discussão.
   - O costume de colocar as necessidades dos outros primeiro.
   - A dificuldade de perceber meu limite antes de ultrapassá-lo.

5. **O que parece estar fazendo mais falta nas suas relações neste momento?**
   - Sentir que também posso ser cuidada.
   - Conseguir dizer o que preciso com mais clareza.
   - Ter espaço para ser quem sou sem tanta cobrança.
   - Reconhecer quais relações me fazem bem e quais têm me desgastado.

### Luto, perdas e mudanças

1. **Quando algo lembra a pessoa, relação ou fase que você perdeu, o que costuma acontecer?**
   - A lembrança chega com força e muda o ritmo do meu dia.
   - Tento afastar o pensamento para conseguir continuar.
   - Sinto vontade de falar sobre isso, mas nem sempre encontro espaço.
   - A lembrança traz sentimentos diferentes ao mesmo tempo.

2. **Desde que essa mudança aconteceu, o que mais se transformou no seu cotidiano?**
   - Atividades simples passaram a exigir mais de mim.
   - Alguns lugares, datas ou situações ficaram difíceis.
   - Minhas relações mudaram, inclusive a forma como peço companhia.
   - Ainda estou descobrindo o que permanece e o que precisa ser reconstruído.

3. **Quando as pessoas esperam que você esteja melhor, como isso chega até você?**
   - Sinto que preciso esconder parte do que estou vivendo.
   - Fico em dúvida se meu tempo está demorando demais.
   - Tento seguir como antes, mesmo quando não me sinto pronta.
   - Procuro respeitar meu ritmo, ainda que outras pessoas não compreendam.

4. **Nos dias mais difíceis, o que você costuma fazer com o que sente?**
   - Fico mais recolhida e evito contato.
   - Procuro alguém com quem eu possa estar sem precisar explicar tudo.
   - Mantenho a rotina para não entrar em contato com a dor.
   - Tento acolher o que aparece, mesmo sem saber o que fazer com isso.

5. **O que parece estar fazendo mais falta neste momento?**
   - Ter espaço para lembrar sem precisar me apressar.
   - Encontrar apoio para atravessar os dias mais difíceis.
   - Reconstruir uma rotina que leve essa mudança em consideração.
   - Descobrir como seguir sem apagar o que foi importante.

### Autoestima e autocrítica

1. **Quando algo não sai como você esperava, como costuma falar consigo?**
   - Penso que deveria ter feito melhor.
   - Comparo meu resultado com o de outras pessoas.
   - Tento entender o que aconteceu sem reduzir tudo a uma falha minha.
   - Repasso meus erros por muito tempo, mesmo depois de a situação passar.

2. **Quando alguém reconhece algo bom em você, como costuma receber?**
   - Agradeço, mas por dentro acho que não foi tudo isso.
   - Fico desconfortável e tento mudar de assunto.
   - Consigo receber, mesmo que uma parte minha ainda duvide.
   - Penso que a pessoa só não conhece meus defeitos direito.

3. **Em quais momentos você sente que precisa provar seu valor?**
   - Quando estou trabalhando ou estudando.
   - Quando percebo que alguém pode se decepcionar comigo.
   - Quando me comparo com pessoas que parecem estar mais adiante.
   - Quando descanso ou faço algo apenas porque me faz bem.

4. **Quando precisa escolher algo importante para você, o que mais pesa?**
   - O medo de escolher errado e me arrepender.
   - A opinião de pessoas importantes.
   - A dúvida sobre se o que eu quero é válido.
   - A tentativa de conciliar o que desejo com o contexto em que vivo.

5. **O que parece estar fazendo mais falta na forma como você se trata?**
   - Reconhecer o que faço sem diminuir minhas conquistas.
   - Conseguir errar sem transformar isso em uma definição sobre mim.
   - Perceber minhas necessidades sem julgá-las.
   - Construir uma fala interna mais justa e cuidadosa.

## Lógica das devolutivas

Cada opção se relaciona a uma direção interna de cuidado. Essas direções servem somente para compor o texto e nunca aparecem como perfil, diagnóstico ou tipo de pessoa.

### Direções por tema

- Ansiedade e sobrecarga: diminuir a pressa, organizar o próximo passo, dividir o peso.
- Relacionamentos e limites: dar espaço à própria voz, reconhecer limites, construir reciprocidade.
- Luto, perdas e mudanças: respeitar o tempo, encontrar apoio, reconstruir o cotidiano sem apagar o vínculo.
- Autoestima e autocrítica: cultivar gentileza, reconhecer a própria experiência, sustentar escolhas com mais autonomia.

Cada resposta soma um ponto a uma direção. A última pergunta pode reforçar diretamente a necessidade escolhida. O resultado usa a direção mais presente. Em caso de proximidade entre duas direções, apresenta uma devolutiva combinada. Empates completos recebem uma devolutiva ampla daquele tema. A ordem das opções é variada para não associar uma letra fixa a uma direção.

### Estrutura do resultado

- Título acolhedor e não definitivo.
- Dois parágrafos que relacionam situações do tema sem reproduzir respostas individuais.
- Convite de cuidado possível, sem prescrição.
- Ilustração minimalista da biblioteca já existente.
- Aviso: “Esta devolutiva é um convite à reflexão. Ela não é diagnóstico nem avaliação psicológica.”
- CTA para conversar com Iasmin pelo WhatsApp.

Exemplos de tom:

- “Talvez seu corpo esteja pedindo um pouco menos de pressa.”
- “Cuidar do outro não precisa significar se deixar por último.”
- “Seguir não precisa significar deixar para trás.”
- “Sua voz também merece um pouco mais de gentileza.”

## Dados e compatibilidade

O envio passa a incluir:

- `topic`: tema escolhido.
- `answers`: identificadores das cinco opções selecionadas, não frases livres.
- `resultKey`: chave interna da direção simples, combinada ou ampla.
- `contentVersion`: versão do conjunto de perguntas e devolutivas.
- Dados de contato, consentimento, UTM e datas já existentes.

Uma migração aditiva cria `journey_topic`, `result_key` e `content_version`. O campo legado `reflection_theme` é mantido para registros antigos, passa a aceitar valor nulo e não é usado por novas submissões. Registros anteriores continuam consultáveis sem serem reinterpretados pelo conteúdo novo.

A política atual de retenção de 180 dias permanece. A página de privacidade é atualizada para explicar a escolha temática e reforçar que o percurso não realiza avaliação psicológica.

## Componentes e responsabilidades

- Um componente cliente de transição intercepta somente links internos elegíveis e gerencia animação, prefetch, falha e redução de movimento.
- Um provedor colocado no layout da landing permite que todos os CTAs compartilhem o mesmo estado sem duplicação.
- O conteúdo das trilhas fica em módulo tipado separado da lógica de pontuação.
- A lógica de pontuação recebe tema e respostas e devolve uma chave de conteúdo determinística.
- O estado do percurso ganha uma etapa `topic-selection` e preserva o tema ao avançar e voltar.
- A API valida tema, respostas pertencentes ao tema, resultado recalculado no servidor e versão de conteúdo. O servidor não confia no resultado calculado pelo navegador.

## Acessibilidade e movimento

- A transição usa `aria-live="polite"` e mantém mensagem textual compreensível sem animação.
- O overlay não deve prender permanentemente o foco nem esconder uma falha de navegação.
- A escolha temática e as alternativas usam controles nativos acionáveis por teclado.
- O progresso informa “Pergunta N de 5” e o tema atual.
- Cores mantêm contraste suficiente, foco é visível e nenhuma informação depende somente de cor.
- GSAP anima apenas `transform`, `opacity` e `autoAlpha`, com limpeza pelo ciclo de vida React.

## Testes e verificação

- Testes unitários para as quatro trilhas, quantidade de perguntas e pertencimento das opções.
- Testes unitários para resultados simples, combinados e amplos em cada tema.
- Teste do fluxo completo: idade, tema, contato, cinco respostas e resultado.
- Testes da API para tema inválido, resposta de outro tema, versão inválida e resultado recalculado.
- Testes da transição para clique comum, clique modificado, prevenção de clique duplicado, redução de movimento e recuperação de falha.
- Migração testada contra esquema vazio e contra uma linha legada.
- Verificação visual em 430×932, 1024×1366 e desktop amplo.
- Execução final de testes, lint e build de produção.

## Referências que orientam o desenho

- Conselho Federal de Psicologia, SATEPSI e Resolução CFP nº 31/2022: distinção entre recurso reflexivo e avaliação psicológica.
- Literatura brasileira de análise funcional: atenção às relações entre contexto, comportamento e consequências.
- Literatura brasileira sobre ansiedade: considerar esquiva, controle aversivo e outras variáveis ambientais sem reduzir o fenômeno a uma única resposta.
- Literatura brasileira sobre luto: processo dinâmico com repercussões no cotidiano e sem trajetória universal.
- Literatura sobre relações: comunicação, limites, reciprocidade e efeitos dos padrões relacionais.
- LGPD: respostas associadas a uma pessoa podem revelar informações de saúde e exigem finalidade, segurança, minimização e retenção definida.
