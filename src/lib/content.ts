import type { JourneyQuestion, ReflectionContent, ReflectionTheme } from './types'

export const journeyQuestions = [
  {
    id: 1,
    prompt: 'Quando algo importante pede sua atenção, o que costuma acontecer?',
    options: [
      { id: 'a', label: 'Sinto tanta pressão que acabo adiando.', theme: 'sobrecarrega' },
      { id: 'b', label: 'Começo pensando que talvez eu não consiga.', theme: 'autocritica' },
      { id: 'c', label: 'Me desconecto do que eu realmente preciso.', theme: 'reconexao' },
      { id: 'd', label: 'Tento fazer tudo ao mesmo tempo.', theme: 'sobrecarrega' },
    ],
  },
  {
    id: 2,
    prompt: 'Em dias cheios, como seu corpo costuma pedir uma pausa?',
    options: [
      { id: 'a', label: 'Com cansaço que parece não passar.', theme: 'sobrecarrega' },
      { id: 'b', label: 'Com uma tensão que me deixa em alerta.', theme: 'sobrecarrega' },
      { id: 'c', label: 'Com a sensação de que eu deveria dar conta.', theme: 'autocritica' },
      { id: 'd', label: 'Com vontade de ficar mais perto de mim.', theme: 'reconexao' },
    ],
  },
  {
    id: 3,
    prompt: 'Quando algo não sai como você esperava, qual frase aparece primeiro?',
    options: [
      { id: 'a', label: 'Eu deveria ter feito melhor.', theme: 'autocritica' },
      { id: 'b', label: 'Eu não posso errar agora.', theme: 'autocritica' },
      { id: 'c', label: 'Preciso resolver isso imediatamente.', theme: 'sobrecarrega' },
      { id: 'd', label: 'Queria me escutar antes de reagir.', theme: 'reconexao' },
    ],
  },
  {
    id: 4,
    prompt: 'O que mais dificulta descansar sem culpa?',
    options: [
      { id: 'a', label: 'A lista de coisas que ainda preciso fazer.', theme: 'sobrecarrega' },
      { id: 'b', label: 'A ideia de que descansar é falta de esforço.', theme: 'autocritica' },
      { id: 'c', label: 'Não perceber o que já é demais para mim.', theme: 'reconexao' },
      { id: 'd', label: 'O medo de deixar alguém na mão.', theme: 'sobrecarrega' },
    ],
  },
  {
    id: 5,
    prompt: 'Quando precisa dizer não, o que costuma pesar?',
    options: [
      { id: 'a', label: 'A vontade de evitar decepcionar alguém.', theme: 'sobrecarrega' },
      { id: 'b', label: 'O receio de parecer egoísta.', theme: 'autocritica' },
      { id: 'c', label: 'A dúvida sobre o que eu quero de verdade.', theme: 'reconexao' },
      { id: 'd', label: 'A sensação de que tudo depende de mim.', theme: 'sobrecarrega' },
    ],
  },
  {
    id: 6,
    prompt: 'O que você costuma deixar de lado para dar conta de tudo?',
    options: [
      { id: 'a', label: 'Meu descanso e meu tempo sem pressa.', theme: 'sobrecarrega' },
      { id: 'b', label: 'Coisas que me fazem bem.', theme: 'reconexao' },
      { id: 'c', label: 'A chance de reconhecer o que já fiz.', theme: 'autocritica' },
      { id: 'd', label: 'Conversas em que eu poderia pedir apoio.', theme: 'reconexao' },
    ],
  },
  {
    id: 7,
    prompt: 'Em quais momentos você sente que está distante de si?',
    options: [
      { id: 'a', label: 'Quando vivo no automático por muitos dias.', theme: 'reconexao' },
      { id: 'b', label: 'Quando digo sim sem perceber como estou.', theme: 'reconexao' },
      { id: 'c', label: 'Quando tento cumprir todas as expectativas.', theme: 'sobrecarrega' },
      { id: 'd', label: 'Quando me comparo com outras pessoas.', theme: 'autocritica' },
    ],
  },
  {
    id: 8,
    prompt: 'Quando a ansiedade aumenta, do que você mais sente falta?',
    options: [
      { id: 'a', label: 'De um espaço para respirar sem cobrança.', theme: 'sobrecarrega' },
      { id: 'b', label: 'De confiança para lidar com o momento.', theme: 'autocritica' },
      { id: 'c', label: 'De entender o que estou sentindo.', theme: 'reconexao' },
      { id: 'd', label: 'De apoio para não precisar enfrentar tudo só.', theme: 'sobrecarrega' },
    ],
  },
  {
    id: 9,
    prompt: 'O que tornaria seu cotidiano um pouco mais gentil?',
    options: [
      { id: 'a', label: 'Ter menos coisas para sustentar sozinha.', theme: 'sobrecarrega' },
      { id: 'b', label: 'Trocar a exigência por uma fala mais cuidadosa.', theme: 'autocritica' },
      { id: 'c', label: 'Reservar um tempo para perceber minhas necessidades.', theme: 'reconexao' },
      { id: 'd', label: 'Poder pedir ajuda antes de chegar ao limite.', theme: 'sobrecarrega' },
    ],
  },
  {
    id: 10,
    prompt: 'Qual parte de você está pedindo mais espaço agora?',
    options: [
      { id: 'a', label: 'A que precisa parar de carregar tudo.', theme: 'sobrecarrega' },
      { id: 'b', label: 'A que quer se tratar com mais gentileza.', theme: 'autocritica' },
      { id: 'c', label: 'A que deseja se aproximar de si.', theme: 'reconexao' },
      { id: 'd', label: 'A que quer nomear os próprios limites.', theme: 'reconexao' },
    ],
  },
] as const satisfies readonly JourneyQuestion[]

export const reflectionContent: Record<ReflectionTheme, ReflectionContent> = {
  sobrecarrega: {
    title: 'Você não precisa carregar tudo sozinha.',
    body: 'Talvez você venha sustentando mais do que cabe no seu momento. Perceber isso pode ser um primeiro gesto de cuidado.',
    invitation: 'Há espaço para olhar seus limites sem diminuir a sua história.',
  },
  autocritica: {
    title: 'Sua voz também merece gentileza.',
    body: 'A exigência pode ter ocupado um lugar grande na forma como você se olha. Acolher essa voz com curiosidade pode abrir outros caminhos.',
    invitation: 'Você não precisa provar seu valor o tempo todo.',
  },
  reconexao: {
    title: 'Voltar a si também é um caminho.',
    body: 'Talvez exista um desejo de se aproximar do que você sente, precisa e escolhe. Pequenas pausas podem ajudar a tornar isso mais visível.',
    invitation: 'Sua experiência merece espaço e escuta.',
  },
}
