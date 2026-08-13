export type JourneyTopicId =
  | 'ansiedade-sobrecarga'
  | 'relacionamentos-limites'
  | 'luto-mudancas'
  | 'autoestima-autocritica'

export type JourneyDirectionId =
  | 'pace'
  | 'step'
  | 'support'
  | 'voice'
  | 'limits'
  | 'reciprocity'
  | 'time'
  | 'rebuild'
  | 'gentleness'
  | 'recognition'
  | 'autonomy'

export type JourneyOption = {
  id: string
  label: string
  direction: JourneyDirectionId
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

export type JourneyTopic = {
  id: JourneyTopicId
  title: string
  description: string
  directions: readonly JourneyDirectionId[]
  questions: readonly JourneyQuestion[]
  reflections: Record<string, ReflectionContent>
}

export type JourneyResultKey = `${JourneyTopicId}:${string}`
