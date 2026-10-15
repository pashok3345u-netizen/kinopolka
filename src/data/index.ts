import type { Film } from './types'
import { nashe } from './nashe'
import { animation } from './animation'
import { worldDrama } from './world-drama'
import { worldGenre } from './world-genre'
import { normalize } from '../lib/search'

export type FilmEntry = Film & {
  id: string // для ссылки на фильм, например #brat-1997
  isOurs: boolean // Россия или СССР
  search: string // текст, по которому ищем
}

const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y',
  к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f',
  х: 'h', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

function slug(text: string) {
  return [...text.toLowerCase()]
    .map((ch) => TRANSLIT[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export const FILMS: FilmEntry[] = [...nashe, ...animation, ...worldDrama, ...worldGenre].map((film) => ({
  ...film,
  id: `${slug(film.title)}-${film.year}`,
  isOurs: film.country.includes('Россия') || film.country.includes('СССР'),
  search: normalize([film.title, film.original ?? '', film.director, ...film.cast].join(' ')),
}))

export const FILMS_BY_ID = new Map(FILMS.map((film) => [film.id, film]))
