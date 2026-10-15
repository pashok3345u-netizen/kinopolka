import type { Genre, Mood } from '../data/types'

export const MOODS: { id: Mood; emoji: string; label: string }[] = [
  { id: 'laugh', emoji: '😂', label: 'Посмеяться' },
  { id: 'cry', emoji: '😢', label: 'Поплакать' },
  { id: 'love', emoji: '💕', label: 'Романтика' },
  { id: 'cozy', emoji: '☕', label: 'Уютный вечер' },
  { id: 'scary', emoji: '😱', label: 'Испугаться' },
  { id: 'thrill', emoji: '🔥', label: 'Адреналин' },
  { id: 'think', emoji: '🤔', label: 'Подумать' },
  { id: 'mind', emoji: '🤯', label: 'Взрыв мозга' },
]

export const MOOD_BY_ID = new Map(MOODS.map((m) => [m.id, m]))

export const GENRES: Genre[] = [
  'комедия', 'драма', 'мелодрама', 'фантастика', 'фэнтези', 'ужасы', 'триллер', 'детектив',
  'криминал', 'боевик', 'приключения', 'мультфильм', 'аниме', 'семейный', 'мюзикл',
  'военный', 'исторический', 'биография', 'спорт',
]

export const DECADES = [
  { id: 'old', label: 'до 1970', test: (y: number) => y < 1970 },
  { id: '70', label: '70-е', test: (y: number) => y >= 1970 && y < 1980 },
  { id: '80', label: '80-е', test: (y: number) => y >= 1980 && y < 1990 },
  { id: '90', label: '90-е', test: (y: number) => y >= 1990 && y < 2000 },
  { id: '00', label: '2000-е', test: (y: number) => y >= 2000 && y < 2010 },
  { id: '10', label: '2010-е', test: (y: number) => y >= 2010 && y < 2020 },
  { id: '20', label: '2020-е', test: (y: number) => y >= 2020 },
]

export const LENGTHS = [
  { id: 'short', label: 'до 1,5 часа', test: (m: number) => m <= 95 },
  { id: 'mid', label: '1,5–2 часа', test: (m: number) => m > 95 && m <= 125 },
  { id: 'long', label: 'больше 2 часов', test: (m: number) => m > 125 },
]

export const ORIGINS = [
  { id: 'all', label: 'Все' },
  { id: 'ru', label: 'Наше' },
  { id: 'world', label: 'Зарубежное' },
] as const

export type Origin = (typeof ORIGINS)[number]['id']

export const SORTS = [
  { id: 'mix', label: 'Вперемешку' },
  { id: 'new', label: 'Сначала новые' },
  { id: 'old', label: 'Сначала старые' },
  { id: 'az', label: 'По алфавиту' },
  { id: 'short', label: 'Покороче' },
  { id: 'long', label: 'Подлиннее' },
  { id: 'stars', label: 'Мои оценки' },
] as const

export type SortId = (typeof SORTS)[number]['id']

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (!h) return `${m} мин`
  return m ? `${h} ч ${m} мин` : `${h} ч`
}

// 1 фильм, 2 фильма, 5 фильмов
export function filmsWord(n: number) {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod10 === 1 && mod100 !== 11) return 'фильм'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'фильма'
  return 'фильмов'
}
