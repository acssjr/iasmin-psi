import type { ReflectionKey, ReflectionTheme } from './types'

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

function getCombinedReflectionKey(
  first: ReflectionTheme,
  second: ReflectionTheme,
): ReflectionKey {
  const pair = new Set([first, second])

  if (pair.has('sobrecarrega') && pair.has('autocritica')) {
    return 'sobrecarrega-autocritica'
  }

  if (pair.has('sobrecarrega') && pair.has('reconexao')) {
    return 'sobrecarrega-reconexao'
  }

  return 'autocritica-reconexao'
}

export function getReflectionKey(selectedThemes: readonly ReflectionTheme[]): ReflectionKey {
  const scores = new Map<ReflectionTheme, number>(
    themes.map((theme) => [theme, 0]),
  )

  for (const theme of selectedThemes) {
    scores.set(theme, (scores.get(theme) ?? 0) + 1)
  }

  const rankedThemes = [...themes].sort((first, second) => {
    const difference = (scores.get(second) ?? 0) - (scores.get(first) ?? 0)
    return difference === 0 ? themes.indexOf(first) - themes.indexOf(second) : difference
  })
  const [first, second, third] = rankedThemes
  const firstScore = scores.get(first) ?? 0
  const secondScore = scores.get(second) ?? 0
  const thirdScore = scores.get(third) ?? 0
  const lastTheme = selectedThemes.at(-1)

  if (firstScore === 2 && secondScore === 2 && thirdScore === 1) {
    return lastTheme === third
      ? getCombinedReflectionKey(first, second)
      : 'olhar-ampliado'
  }

  if (firstScore === secondScore || firstScore - secondScore === 1) {
    return getCombinedReflectionKey(first, second)
  }

  return first
}
