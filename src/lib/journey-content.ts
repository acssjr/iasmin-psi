import type {
  JourneyDirectionId,
  JourneyQuestion,
  JourneyTopic,
  JourneyTopicId,
  ReflectionContent,
} from './types'

export const JOURNEY_CONTENT_VERSION = '2026-08-13'

const illustrations = {
  pause: {
    alt: 'Ilustração abstrata de uma pausa e um ramo delicado.',
    src: '/images/reflections/sobrecarrega.png',
  },
  care: {
    alt: 'Ilustração abstrata de uma forma acolhida com cuidado.',
    src: '/images/reflections/autocritica.png',
  },
  path: {
    alt: 'Ilustração abstrata de passos em um caminho tranquilo.',
    src: '/images/reflections/reconexao.png',
  },
} as const

function reflection(
  title: string,
  body: string,
  invitation: string,
  illustration: ReflectionContent['illustration'],
): ReflectionContent {
  return { body, illustration, invitation, title }
}

function topic(
  id: JourneyTopicId,
  title: string,
  description: string,
  directions: readonly JourneyDirectionId[],
  questions: readonly JourneyQuestion[],
  reflections: JourneyTopic['reflections'],
): JourneyTopic {
  return { description, directions, id, questions, reflections, title }
}

export const journeyTopics: Record<JourneyTopicId, JourneyTopic> = {
  'ansiedade-sobrecarga': topic(
    'ansiedade-sobrecarga',
    'Ansiedade e sobrecarga',
    'Para olhar com calma para a pressão, o cansaço e o que tem pedido espaço.',
    ['pace', 'step', 'support'],
    [
      { id: 1, prompt: 'Quando você percebe que o dia ficou mais pesado do que esperava, o que costuma acontecer primeiro?', options: [
        { id: 'ans-1-a', label: 'Tento resolver tudo de uma vez.', direction: 'pace' },
        { id: 'ans-1-b', label: 'Adio algumas coisas porque não sei por onde começar.', direction: 'step' },
        { id: 'ans-1-c', label: 'Continuo fazendo o que precisa ser feito, mesmo já estando cansada.', direction: 'support' },
        { id: 'ans-1-d', label: 'Procuro diminuir o ritmo e entender o que está me atravessando.', direction: 'pace' },
      ] },
      { id: 2, prompt: 'Quando uma preocupação aparece e continua voltando, como você costuma lidar com ela?', options: [
        { id: 'ans-2-a', label: 'Repasso a situação várias vezes, tentando prever o que pode acontecer.', direction: 'pace' },
        { id: 'ans-2-b', label: 'Procuro me ocupar para não pensar nisso.', direction: 'step' },
        { id: 'ans-2-c', label: 'Converso com alguém em quem confio.', direction: 'step' },
        { id: 'ans-2-d', label: 'Tento perceber o que está ao meu alcance naquele momento.', direction: 'support' },
      ] },
      { id: 3, prompt: 'Nos momentos em que a ansiedade aumenta, o que você percebe no seu cotidiano?', options: [
        { id: 'ans-3-a', label: 'Fico mais impaciente ou em estado de alerta.', direction: 'pace' },
        { id: 'ans-3-b', label: 'Tenho dificuldade para descansar, mesmo quando há tempo.', direction: 'pace' },
        { id: 'ans-3-c', label: 'Evito decisões ou situações que parecem difíceis demais.', direction: 'step' },
        { id: 'ans-3-d', label: 'Sinto que preciso de apoio, mas nem sempre consigo pedir.', direction: 'support' },
      ] },
      { id: 4, prompt: 'Quando você sente que não vai conseguir dar conta de tudo, qual reação mais se aproxima da sua?', options: [
        { id: 'ans-4-a', label: 'Aumento ainda mais a cobrança sobre mim.', direction: 'pace' },
        { id: 'ans-4-b', label: 'Tento esconder que estou cansada.', direction: 'support' },
        { id: 'ans-4-c', label: 'Abro mão de alguma coisa para conseguir respirar.', direction: 'step' },
        { id: 'ans-4-d', label: 'Busco ajuda ou reorganizo o que é prioridade.', direction: 'support' },
      ] },
      { id: 5, prompt: 'O que parece estar fazendo mais falta neste momento?', options: [
        { id: 'ans-5-a', label: 'Um pouco menos de pressão.', direction: 'pace' },
        { id: 'ans-5-b', label: 'Um espaço para descansar sem culpa.', direction: 'pace' },
        { id: 'ans-5-c', label: 'Clareza para escolher o que realmente precisa da minha atenção.', direction: 'step' },
        { id: 'ans-5-d', label: 'Apoio para não precisar sustentar tudo sozinha.', direction: 'support' },
      ] },
    ],
    {
      pace: reflection('Talvez seu corpo esteja pedindo um pouco menos de pressa.', 'Pode ser que você esteja tentando acompanhar muitas exigências ao mesmo tempo, mesmo quando o cansaço já aparece. Isso não diz que há algo errado com você. Talvez mostre apenas o quanto tem sido necessário sustentar.', 'Uma pausa pequena também pode ser uma forma de cuidado.', illustrations.pause),
      step: reflection('Nem tudo precisa ser resolvido no mesmo instante.', 'Quando as preocupações se misturam, até o próximo passo pode parecer distante. Suas respostas sugerem que separar o que é urgente do que pode esperar talvez traga um pouco mais de espaço.', 'Você pode começar pelo que cabe no momento de agora.', illustrations.path),
      support: reflection('Você não precisa sustentar tudo sozinha.', 'Talvez pedir apoio ainda pareça difícil, sobretudo quando você se acostumou a continuar mesmo cansada. Dividir o peso não diminui sua força nem apaga tudo o que você já fez.', 'Cuidado também pode ser permitir que alguém se aproxime.', illustrations.care),
      'pace-step': reflection('Menos pressa pode deixar o próximo passo mais visível.', 'A sensação de ter muito para resolver pode tornar qualquer escolha maior do que ela realmente é. Talvez desacelerar um pouco ajude você a perceber o que pede atenção agora e o que pode esperar.', 'Um caminho possível não precisa começar com todas as respostas.', illustrations.path),
      'pace-support': reflection('Descansar e dividir o peso podem caminhar juntos.', 'Pode ser que a pressão para continuar esteja deixando pouco espaço para perceber o próprio limite e para aceitar ajuda. Você não precisa chegar ao esgotamento para reconhecer que algo está pesado.', 'Talvez cuidado, agora, seja respirar e não precisar fazer tudo só.', illustrations.pause),
      'step-support': reflection('Clareza também pode nascer em companhia.', 'Quando tudo parece importante ao mesmo tempo, conversar com alguém pode ajudar a organizar o que ainda está confuso. Isso não significa entregar suas escolhas, mas criar espaço para enxergá-las com mais calma.', 'Você pode construir o próximo passo sem se deixar sozinha nele.', illustrations.care),
      broad: reflection('Seu momento pode estar pedindo mais de um tipo de cuidado.', 'Suas respostas mostram aspectos diferentes da sua experiência. Em alguns contextos pode existir pressa, em outros falta de clareza ou vontade de ter apoio. Talvez não seja preciso resumir tudo a uma única direção.', 'Vale observar, com curiosidade, o que ganha mais espaço em cada dia.', illustrations.path),
    },
  ),
  'relacionamentos-limites': topic(
    'relacionamentos-limites',
    'Relacionamentos e limites',
    'Para perceber sua voz, seus limites e o espaço que você ocupa nas relações.',
    ['voice', 'limits', 'reciprocity'],
    [
      { id: 1, prompt: 'Quando algo em uma relação te incomoda, o que costuma acontecer?', options: [
        { id: 'rel-1-a', label: 'Evito falar para não criar um conflito.', direction: 'voice' },
        { id: 'rel-1-b', label: 'Tento explicar, mas acabo falando quando já estou no limite.', direction: 'limits' },
        { id: 'rel-1-c', label: 'Digo o que preciso, mesmo com receio da reação da outra pessoa.', direction: 'voice' },
        { id: 'rel-1-d', label: 'Fico em dúvida se o que estou sentindo é motivo suficiente para conversar.', direction: 'reciprocity' },
      ] },
      { id: 2, prompt: 'Quando alguém importante para você precisa de ajuda, como você costuma responder?', options: [
        { id: 'rel-2-a', label: 'Tento estar disponível, mesmo quando isso me sobrecarrega.', direction: 'limits' },
        { id: 'rel-2-b', label: 'Ajudo até onde consigo e aviso quando preciso parar.', direction: 'limits' },
        { id: 'rel-2-c', label: 'Sinto culpa quando não consigo fazer o que a pessoa espera.', direction: 'reciprocity' },
        { id: 'rel-2-d', label: 'Espero que a pessoa perceba sozinha quando eu também preciso de cuidado.', direction: 'voice' },
      ] },
      { id: 3, prompt: 'Em uma conversa difícil, o que mais pesa para você?', options: [
        { id: 'rel-3-a', label: 'O medo de decepcionar ou perder a pessoa.', direction: 'reciprocity' },
        { id: 'rel-3-b', label: 'A sensação de não conseguir ser compreendida.', direction: 'voice' },
        { id: 'rel-3-c', label: 'A vontade de encerrar logo o assunto para diminuir o desconforto.', direction: 'limits' },
        { id: 'rel-3-d', label: 'Encontrar um jeito de falar sem me abandonar nem desrespeitar o outro.', direction: 'reciprocity' },
      ] },
      { id: 4, prompt: 'Quando você diz “sim” querendo dizer “não”, o que geralmente está por trás disso?', options: [
        { id: 'rel-4-a', label: 'O receio de parecer egoísta.', direction: 'reciprocity' },
        { id: 'rel-4-b', label: 'A tentativa de evitar uma discussão.', direction: 'voice' },
        { id: 'rel-4-c', label: 'O costume de colocar as necessidades dos outros primeiro.', direction: 'limits' },
        { id: 'rel-4-d', label: 'A dificuldade de perceber meu limite antes de ultrapassá-lo.', direction: 'limits' },
      ] },
      { id: 5, prompt: 'O que parece estar fazendo mais falta nas suas relações neste momento?', options: [
        { id: 'rel-5-a', label: 'Sentir que também posso ser cuidada.', direction: 'reciprocity' },
        { id: 'rel-5-b', label: 'Conseguir dizer o que preciso com mais clareza.', direction: 'voice' },
        { id: 'rel-5-c', label: 'Ter espaço para ser quem sou sem tanta cobrança.', direction: 'limits' },
        { id: 'rel-5-d', label: 'Reconhecer quais relações me fazem bem e quais têm me desgastado.', direction: 'reciprocity' },
      ] },
    ],
    {
      voice: reflection('Sua voz também merece espaço nas relações.', 'Talvez você tenha aprendido a medir muito o que diz para evitar conflitos ou decepcionar alguém. Falar do que sente não precisa ser um confronto. Pode ser uma forma de estar inteira na relação.', 'Você pode experimentar dizer um pouco mais de si, no seu ritmo.', illustrations.care),
      limits: reflection('Seu limite não precisa aparecer só quando tudo transborda.', 'Pode ser que você perceba o próprio cansaço apenas depois de ter ido além do que cabia. Limites não são afastamentos automáticos. Muitas vezes, eles ajudam a tornar os encontros mais honestos.', 'Perceber o seu “até aqui” já é um começo possível.', illustrations.pause),
      reciprocity: reflection('Cuidar do outro não precisa significar se deixar por último.', 'Suas respostas talvez apontem para um desejo de relações em que o cuidado possa circular. Reconhecer o que você oferece e também o que precisa receber pode abrir conversas importantes.', 'Você também pode ocupar o lugar de quem é cuidada.', illustrations.path),
      'voice-limits': reflection('Dizer o que você precisa pode ajudar a proteger seus limites.', 'Talvez o silêncio dure até o momento em que já não é possível sustentar mais. Dar nome ao incômodo antes de chegar ao limite pode criar uma conversa menos pesada para você.', 'Sua voz pode ser cuidadosa sem precisar desaparecer.', illustrations.care),
      'voice-reciprocity': reflection('Relações mais recíprocas também precisam conhecer a sua voz.', 'Esperar que a outra pessoa perceba tudo sozinha pode deixar necessidades importantes sem lugar. Talvez falar de si seja uma forma de permitir que o cuidado encontre você.', 'Você não precisa adivinhar nem ser adivinhada o tempo todo.', illustrations.path),
      'limits-reciprocity': reflection('O cuidado pode circular sem ultrapassar você.', 'Estar disponível para alguém não precisa exigir que você ignore o próprio limite. Talvez seja possível continuar presente e, ao mesmo tempo, reconhecer quando precisa parar, descansar ou pedir algo em troca.', 'Reciprocidade também se constrói com limites visíveis.', illustrations.pause),
      broad: reflection('Cada relação pode pedir um jeito diferente de se cuidar.', 'Suas respostas mostram que voz, limites e reciprocidade podem mudar conforme o vínculo e o contexto. Talvez não exista uma única resposta, mas pistas sobre onde você se sente mais livre e onde acaba se deixando de lado.', 'Observar essas diferenças já pode aproximar você do que deseja viver.', illustrations.care),
    },
  ),
  'luto-mudancas': topic(
    'luto-mudancas',
    'Luto, perdas e mudanças',
    'Para acolher o que mudou, respeitando seu tempo e os vínculos importantes.',
    ['time', 'support', 'rebuild'],
    [
      { id: 1, prompt: 'Quando algo lembra a pessoa, relação ou fase que você perdeu, o que costuma acontecer?', options: [
        { id: 'lut-1-a', label: 'A lembrança chega com força e muda o ritmo do meu dia.', direction: 'time' },
        { id: 'lut-1-b', label: 'Tento afastar o pensamento para conseguir continuar.', direction: 'rebuild' },
        { id: 'lut-1-c', label: 'Sinto vontade de falar sobre isso, mas nem sempre encontro espaço.', direction: 'support' },
        { id: 'lut-1-d', label: 'A lembrança traz sentimentos diferentes ao mesmo tempo.', direction: 'time' },
      ] },
      { id: 2, prompt: 'Desde que essa mudança aconteceu, o que mais se transformou no seu cotidiano?', options: [
        { id: 'lut-2-a', label: 'Atividades simples passaram a exigir mais de mim.', direction: 'time' },
        { id: 'lut-2-b', label: 'Alguns lugares, datas ou situações ficaram difíceis.', direction: 'time' },
        { id: 'lut-2-c', label: 'Minhas relações mudaram, inclusive a forma como peço companhia.', direction: 'support' },
        { id: 'lut-2-d', label: 'Ainda estou descobrindo o que permanece e o que precisa ser reconstruído.', direction: 'rebuild' },
      ] },
      { id: 3, prompt: 'Quando as pessoas esperam que você esteja melhor, como isso chega até você?', options: [
        { id: 'lut-3-a', label: 'Sinto que preciso esconder parte do que estou vivendo.', direction: 'support' },
        { id: 'lut-3-b', label: 'Fico em dúvida se meu tempo está demorando demais.', direction: 'time' },
        { id: 'lut-3-c', label: 'Tento seguir como antes, mesmo quando não me sinto pronta.', direction: 'rebuild' },
        { id: 'lut-3-d', label: 'Procuro respeitar meu ritmo, ainda que outras pessoas não compreendam.', direction: 'time' },
      ] },
      { id: 4, prompt: 'Nos dias mais difíceis, o que você costuma fazer com o que sente?', options: [
        { id: 'lut-4-a', label: 'Fico mais recolhida e evito contato.', direction: 'support' },
        { id: 'lut-4-b', label: 'Procuro alguém com quem eu possa estar sem precisar explicar tudo.', direction: 'support' },
        { id: 'lut-4-c', label: 'Mantenho a rotina para não entrar em contato com a dor.', direction: 'rebuild' },
        { id: 'lut-4-d', label: 'Tento acolher o que aparece, mesmo sem saber o que fazer com isso.', direction: 'time' },
      ] },
      { id: 5, prompt: 'O que parece estar fazendo mais falta neste momento?', options: [
        { id: 'lut-5-a', label: 'Ter espaço para lembrar sem precisar me apressar.', direction: 'time' },
        { id: 'lut-5-b', label: 'Encontrar apoio para atravessar os dias mais difíceis.', direction: 'support' },
        { id: 'lut-5-c', label: 'Reconstruir uma rotina que leve essa mudança em consideração.', direction: 'rebuild' },
        { id: 'lut-5-d', label: 'Descobrir como seguir sem apagar o que foi importante.', direction: 'rebuild' },
      ] },
    ],
    {
      time: reflection('O seu tempo não precisa obedecer à pressa de ninguém.', 'Talvez algumas lembranças ainda mudem o ritmo dos seus dias. O luto e as mudanças não seguem uma linha reta, e sentir de formas diferentes ao longo do tempo não significa voltar ao começo.', 'Você pode atravessar esse momento sem exigir de si uma data para estar melhor.', illustrations.pause),
      support: reflection('Você merece companhia também nos dias em que faltam palavras.', 'Pode ser que exista vontade de dividir o que vive, mesmo sem saber explicar tudo. Apoio não precisa vir de uma conversa perfeita. Às vezes, começa na presença de alguém que não tenta apressar o seu processo.', 'Você não precisa atravessar todos os dias difíceis sozinha.', illustrations.care),
      rebuild: reflection('Seguir não precisa significar deixar para trás.', 'Quando algo importante muda, a rotina também pode precisar encontrar uma nova forma. Reconstruir não apaga o vínculo nem diminui o que existiu. Pode ser um jeito de levar essa história com você.', 'Talvez um pequeno gesto cotidiano já seja parte desse caminho.', illustrations.path),
      'time-support': reflection('Seu tempo pode ser mais acolhedor quando encontra companhia.', 'Talvez você precise de espaço para sentir sem ser apressada e de alguém que permaneça por perto. Essas duas necessidades podem coexistir, mesmo quando você ainda não sabe exatamente o que pedir.', 'Apoio também pode ser respeitar o silêncio e o ritmo de agora.', illustrations.care),
      'time-rebuild': reflection('Reconstruir também pede respeito ao seu tempo.', 'Pode existir uma tensão entre continuar e ainda precisar parar diante do que mudou. Você não precisa escolher entre lembrar e reorganizar a vida. Talvez seja possível fazer as duas coisas pouco a pouco.', 'O seu ritmo pode fazer parte do novo caminho.', illustrations.path),
      'support-rebuild': reflection('Um novo cotidiano não precisa ser construído em solidão.', 'Talvez algumas mudanças práticas estejam pedindo energia justamente quando ela parece menor. Permitir companhia pode tornar essa reorganização um pouco mais possível, sem retirar de você a autoria do caminho.', 'Seguir com apoio continua sendo seguir do seu jeito.', illustrations.care),
      broad: reflection('O que mudou pode tocar diferentes partes da sua vida.', 'Suas respostas sugerem necessidades que podem variar entre tempo, companhia e reconstrução do cotidiano. Não é preciso escolher apenas uma delas nem fazer tudo ao mesmo tempo.', 'Talvez o cuidado esteja em perceber o que cabe em cada dia.', illustrations.pause),
    },
  ),
  'autoestima-autocritica': topic(
    'autoestima-autocritica',
    'Autoestima e autocrítica',
    'Para observar a cobrança e construir uma forma mais justa de olhar para si.',
    ['gentleness', 'recognition', 'autonomy'],
    [
      { id: 1, prompt: 'Quando algo não sai como você esperava, como costuma falar consigo?', options: [
        { id: 'aut-1-a', label: 'Penso que deveria ter feito melhor.', direction: 'gentleness' },
        { id: 'aut-1-b', label: 'Comparo meu resultado com o de outras pessoas.', direction: 'recognition' },
        { id: 'aut-1-c', label: 'Tento entender o que aconteceu sem reduzir tudo a uma falha minha.', direction: 'autonomy' },
        { id: 'aut-1-d', label: 'Repasso meus erros por muito tempo, mesmo depois de a situação passar.', direction: 'gentleness' },
      ] },
      { id: 2, prompt: 'Quando alguém reconhece algo bom em você, como costuma receber?', options: [
        { id: 'aut-2-a', label: 'Agradeço, mas por dentro acho que não foi tudo isso.', direction: 'recognition' },
        { id: 'aut-2-b', label: 'Fico desconfortável e tento mudar de assunto.', direction: 'recognition' },
        { id: 'aut-2-c', label: 'Consigo receber, mesmo que uma parte minha ainda duvide.', direction: 'gentleness' },
        { id: 'aut-2-d', label: 'Penso que a pessoa só não conhece meus defeitos direito.', direction: 'autonomy' },
      ] },
      { id: 3, prompt: 'Em quais momentos você sente que precisa provar seu valor?', options: [
        { id: 'aut-3-a', label: 'Quando estou trabalhando ou estudando.', direction: 'recognition' },
        { id: 'aut-3-b', label: 'Quando percebo que alguém pode se decepcionar comigo.', direction: 'autonomy' },
        { id: 'aut-3-c', label: 'Quando me comparo com pessoas que parecem estar mais adiante.', direction: 'recognition' },
        { id: 'aut-3-d', label: 'Quando descanso ou faço algo apenas porque me faz bem.', direction: 'gentleness' },
      ] },
      { id: 4, prompt: 'Quando precisa escolher algo importante para você, o que mais pesa?', options: [
        { id: 'aut-4-a', label: 'O medo de escolher errado e me arrepender.', direction: 'gentleness' },
        { id: 'aut-4-b', label: 'A opinião de pessoas importantes.', direction: 'autonomy' },
        { id: 'aut-4-c', label: 'A dúvida sobre se o que eu quero é válido.', direction: 'recognition' },
        { id: 'aut-4-d', label: 'A tentativa de conciliar o que desejo com o contexto em que vivo.', direction: 'autonomy' },
      ] },
      { id: 5, prompt: 'O que parece estar fazendo mais falta na forma como você se trata?', options: [
        { id: 'aut-5-a', label: 'Reconhecer o que faço sem diminuir minhas conquistas.', direction: 'recognition' },
        { id: 'aut-5-b', label: 'Conseguir errar sem transformar isso em uma definição sobre mim.', direction: 'gentleness' },
        { id: 'aut-5-c', label: 'Perceber minhas necessidades sem julgá-las.', direction: 'gentleness' },
        { id: 'aut-5-d', label: 'Construir uma fala interna mais justa e cuidadosa.', direction: 'autonomy' },
      ] },
    ],
    {
      gentleness: reflection('Sua voz também merece um pouco mais de gentileza.', 'Talvez a cobrança apareça como uma tentativa de garantir que tudo dê certo. Ainda assim, ela pode acabar ocupando mais espaço do que o reconhecimento pelo que você já atravessou.', 'Você pode se responsabilizar sem transformar cada erro em uma definição sobre si.', illustrations.care),
      recognition: reflection('Reconhecer o que você faz não é exagerar o próprio valor.', 'Pode ser que elogios e conquistas encontrem rapidamente um “mas” dentro de você. Receber o que foi bom não apaga o que ainda deseja construir. Apenas permite que sua história fique um pouco mais inteira.', 'Talvez você possa deixar uma conquista permanecer sem diminuí-la.', illustrations.path),
      autonomy: reflection('O que você deseja também merece entrar nas suas escolhas.', 'Suas respostas talvez mostrem o quanto opiniões, expectativas e receios participam das decisões. Escutar a si não significa ignorar o contexto, mas incluir sua experiência entre as coisas que importam.', 'Você pode construir escolhas que façam sentido para a vida que vive.', illustrations.pause),
      'gentleness-recognition': reflection('Uma fala mais gentil pode ajudar você a reconhecer o próprio caminho.', 'Talvez você veja com facilidade o que faltou e passe rápido demais pelo que conseguiu. Gentileza não é fingir que tudo está bem. Pode ser olhar para a experiência sem apagar suas tentativas e conquistas.', 'Você merece uma leitura mais justa da própria história.', illustrations.care),
      'gentleness-autonomy': reflection('Escolher por si pode ficar mais possível com menos cobrança.', 'O medo de errar pode tornar decisões importantes muito pesadas. Talvez uma voz interna mais cuidadosa ajude você a escolher sem exigir garantias impossíveis ou perfeição.', 'Sua escolha pode ser válida mesmo quando ainda existe dúvida.', illustrations.pause),
      'recognition-autonomy': reflection('Reconhecer a si também pode fortalecer suas escolhas.', 'Quando seu valor depende muito do olhar de fora, pode ficar difícil perceber o que você realmente deseja. Dar espaço ao que já sabe, sente e construiu talvez torne sua voz mais presente nas decisões.', 'Você não precisa ter certeza absoluta para se levar em consideração.', illustrations.path),
      broad: reflection('A forma como você se olha pode mudar conforme o contexto.', 'Suas respostas mostram aspectos diferentes entre cobrança, reconhecimento e escolhas. Talvez nenhuma palavra sozinha resuma o que acontece. Observar quando cada movimento aparece pode ser mais cuidadoso do que procurar uma definição.', 'Sua experiência merece curiosidade, não um rótulo.', illustrations.care),
    },
  ),
}

export const journeyTopicIds = Object.keys(journeyTopics) as JourneyTopicId[]

export function getJourneyReflection(topicId: JourneyTopicId, resultKey: string) {
  const localKey = resultKey.slice(topicId.length + 1)
  return journeyTopics[topicId].reflections[localKey] ?? journeyTopics[topicId].reflections.broad
}
