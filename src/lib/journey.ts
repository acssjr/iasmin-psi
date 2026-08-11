import type { ReflectionTheme } from './types'

const themes: readonly ReflectionTheme[] = [
  'sobrecarrega',
  'autocritica',
  'reconexao',
]

export function getReflectionTheme(selectedThemes: readonly ReflectionTheme[]): ReflectionTheme {
  const priorityTheme = selectedThemes.at(-1) ?? 'reconexao'
  const scoredThemes = selectedThemes.slice(0, -1)
  const scores = new Map<ReflectionTheme, number>(
    themes.map((theme) => [theme, 0]),
  )

  for (const theme of scoredThemes) {
    scores.set(theme, (scores.get(theme) ?? 0) + 1)
  }

  const highestScore = Math.max(...scores.values())
  const leadingThemes = themes.filter((theme) => scores.get(theme) === highestScore)

  return leadingThemes.length === 1 ? leadingThemes[0] : priorityTheme
}
