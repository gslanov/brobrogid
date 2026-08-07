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

/** Короткое описание — карточки, списки, SEO-мета.
 *  Фолбэк на старую плоскую структуру {ru,en} — PWA может отдать
 *  закешированный сервис-воркером tours.json прежнего формата. */
export function tourShort(description: Tour['description'], lang: 'ru' | 'en'): string {
  if (description && typeof description.short === 'object') return description.short[lang] ?? ''
  return (description as unknown as Record<string, string>)?.[lang] ?? ''
}

/** Полное описание — только тело страницы тура. Тот же фолбэк. */
export function tourFull(description: Tour['description'], lang: 'ru' | 'en'): string {
  if (description && typeof description.full === 'object') return description.full[lang] ?? ''
  return (description as unknown as Record<string, string>)?.[lang] ?? ''
}

export async function loadTours(): Promise<Tour[]> {
  const res = await fetch('/content/tours.json')
  if (!res.ok) throw new Error('tours.json')
  const data = await res.json()
  return Array.isArray(data) ? data : []
}
