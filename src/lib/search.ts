import type { FilmEntry } from '../data'

// Приводим текст к одному виду: маленькие буквы, ё → е, без кавычек и знаков
export function normalize(text: string) {
  return text
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[«»"'’.,:;!?()\-–—…№·]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

// Похожие фильмы: общие жанры, настроение и тот же режиссёр
export function similarFilms(film: FilmEntry, all: FilmEntry[], count = 6) {
  return all
    .filter((other) => other.id !== film.id)
    .map((other) => {
      let score = 0
      for (const g of other.genres) if (film.genres.includes(g)) score += 2
      for (const m of other.moods) if (film.moods.includes(m)) score += 1
      if (other.director === film.director) score += 3
      return { other, score }
    })
    .filter((x) => x.score >= 4)
    .sort((a, b) => b.score - a.score || Math.abs(a.other.year - film.year) - Math.abs(b.other.year - film.year))
    .slice(0, count)
    .map((x) => x.other)
}

// Простой «хэш», чтобы перемешивать фильмы одинаково, пока страница открыта
export function hashSeed(text: string, seed: number) {
  let h = seed
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 2654435761)
  return (h ^ (h >>> 16)) >>> 0
}
