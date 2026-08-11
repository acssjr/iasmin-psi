export type ReflectionTheme = 'sobrecarrega' | 'autocritica' | 'reconexao'

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
}
