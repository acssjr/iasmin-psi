import { fields } from './catalog'

export type EditorSection = { id: string; title: string; page: 'inicio' | 'percurso' | 'privacidade'; selector?: string; groups: string[]; note: string }
export const editorSections: EditorSection[] = [
  { id:'header',title:'Cabeçalho e navegação',page:'inicio',selector:'header',groups:['Cabeçalho','Navegação e redes sociais'],note:'Marca, links e botão do menu superior.' },
  { id:'hero',title:'01 · Abertura (hero)',page:'inicio',selector:'#top',groups:['Abertura'],note:'Mensagem principal, foto, botões e trilha de cuidado, reunidos em uma seção.' },
  { id:'recognition',title:'02 · Identificação',page:'inicio',selector:'[aria-labelledby="recognition-title"]',groups:['Identificação'],note:'Título e mensagens do carrossel de identificação.' },
  { id:'about',title:'03 · Sobre Iasmin',page:'inicio',selector:'#conheca-iasmin',groups:['Sobre Iasmin'],note:'Apresentação, formação, fotos e assinatura.' },
  { id:'care',title:'04 · Como funciona',page:'inicio',selector:'#como-funciona',groups:['Como funciona'],note:'Apresentação da abordagem e os três pilares do cuidado.' },
  { id:'themes',title:'05 · Temas de escuta',page:'inicio',selector:'[aria-labelledby="listening-themes-title"]',groups:['Temas de escuta'],note:'Os quatro temas apresentados no site. Os nomes também aparecem no percurso.' },
  { id:'editorial',title:'06 · Conteúdos e reflexões',page:'inicio',selector:'[data-editorial-section]',groups:['Conteúdos e reflexões'],note:'Textos de apresentação e todas as imagens da galeria.' },
  { id:'invitation',title:'07 · Convite ao percurso',page:'inicio',selector:'#percurso',groups:['Convite ao percurso'],note:'O convite que leva o visitante às perguntas.' },
  { id:'faq',title:'08 · Perguntas frequentes',page:'inicio',selector:'[aria-labelledby="faq-title"]',groups:['Perguntas frequentes'],note:'Edite, adicione e ordene as perguntas com suas respostas.' },
  { id:'contact',title:'09 · Agendamento',page:'inicio',selector:'#agendar',groups:['Contato','Contatos'],note:'Convite final e endereços de contato compartilhados pelo site.' },
  { id:'footer',title:'10 · Rodapé',page:'inicio',selector:'footer',groups:['Rodapé'],note:'Dados profissionais, links e aviso de emergência.' },
  { id:'journey',title:'Percurso · telas e perguntas',page:'percurso',groups:fields.map(f=>f.group).filter((g,i,a)=>g.startsWith('Percurso ·')&&a.indexOf(g)===i),note:'Escolha uma tela, um tema e uma pergunta. A prévia não envia respostas de visitantes.' },
  { id:'privacy',title:'Privacidade',page:'privacidade',groups:['Privacidade'],note:'Política de privacidade e informações sobre dados.' },
  { id:'settings',title:'Marca e configurações',page:'inicio',groups:['Identidade visual','Busca e compartilhamento','Abertura e transições'],note:'Logotipos, informações de busca e textos das transições.' },
]
export function fieldsForSection(id: string) {
  const section = editorSections.find(s=>s.id===id)
  const related:Record<string,string[]>={header:['51a75d515686da7f'],about:['e8a577bff81cd584'],footer:['9e2bb39e7f08b2fb']}
  return fields.filter(f=>section?.groups.includes(f.group)||related[id]?.includes(f.id))
}
export function subsectionForField(field: typeof fields[number]) {
  if(field.group==='Abertura') {
    if(['4e6fde885463afff','e17d058673a53ab9','e083d7cb83f634a7'].includes(field.id))return 'Mensagem principal'
    if(['23f92a4e6fe09ab3','164beab6d6781e47'].includes(field.id))return 'Botões e ações'
    if(['dbb654a486a5fc1f','75bd494bd9c7bf36','08882a9f3df9de79'].includes(field.id))return 'Trilha de cuidado'
    return 'Foto e legenda'
  }
  const question = field.label.match(/^Pergunta \d+/)?.[0]
  if (question) return `${field.group.replace('Percurso · ', '')} · ${question}`
  if (/devolutiva|resultado|reflexão/i.test(field.label)&&field.group.startsWith('Percurso')) return `${field.group.replace('Percurso · ', '')} · Devolutivas`
  if (['image','position','gallery'].includes(field.kind)||/Descrição da imagem|acessibilidade/i.test(field.label)) return 'Fotos, marca e enquadramento'
  if (field.kind==='faq') return 'Perguntas e respostas'
  if (field.kind==='url'||/botão|Agendar|Iniciar|WhatsApp/.test(field.label)) return 'Botões e links'
  if (field.group.startsWith('Percurso')) return field.group.replace('Percurso · ', '')
  return 'Textos da seção'
}
