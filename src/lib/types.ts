export type ReflectionTheme = 'sobrecarrega' | 'autocritica' | 'reconexao'

export type ReflectionKey =
  | ReflectionTheme
  | 'sobrecarrega-autocritica'
  | 'sobrecarrega-reconexao'
  | 'autocritica-reconexao'
  | 'olhar-ampliado'

export type JourneyOption = {
  id: string
  label: string
  theme: ReflectionTheme
}

export type JourneyQuestion = {
  id: number
  prompt: string
  options: readonly JourneyOption[]
}

export type ReflectionContent = {
  title: string
  body: string
  invitation: string
  illustration: {
    alt: string
    src: string
  }
}
