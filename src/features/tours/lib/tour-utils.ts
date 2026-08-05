import type { Tour } from '@/data/types'

/** Длительность в исходных данных записана по-английски свободным текстом
 *  («Full day (10-12 hours)»). Переводим на лету, не трогая сами данные —
 *  их ещё будут править вручную. */
const DURATION_RU: Array<[RegExp, string]> = [
  [/full day/gi, 'целый день'],
  [/hours?/gi, 'ч'],
  [/nights?/gi, 'ночей'],
  [/days?/gi, 'дн.'],
  [/driving/gi, 'на машине'],
  [/hiking/gi, 'пешком'],
  [/with stops/gi, 'с остановками'],
  [/from vladikavkaz/gi, 'из Владикавказа'],
]

export function localizeDuration(value: string, lang: 'ru' | 'en'): string {
  if (lang === 'en') return value
  return DURATION_RU.reduce((acc, [re, ru]) => acc.replace(re, ru), value)
}

/** Способ передвижения — короткая подпись на карточке. */
export function tourTypeLabel(type: Tour['type'], lang: 'ru' | 'en'): string {
  const map = {
    walking: { ru: 'пешком', en: 'walking' },
    driving: { ru: 'на машине', en: 'by car' },
    mixed: { ru: 'пешком и на машине', en: 'walk & drive' },
  } as const
  return map[type]?.[lang] ?? type
}

/** Первое предложение описания — для превью в списке. */
export function firstSentence(text: string, limit = 130): string {
  const trimmed = text.trim()
  if (trimmed.length <= limit) return trimmed
  const cut = trimmed.slice(0, limit)
  const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '))
  return stop > 60 ? cut.slice(0, stop + 1) : cut.trimEnd() + '…'
}

export async function loadTours(): Promise<Tour[]> {
  const res = await fetch('/content/tours.json')
  if (!res.ok) throw new Error('tours.json')
  const data = await res.json()
  return Array.isArray(data) ? data : []
}
