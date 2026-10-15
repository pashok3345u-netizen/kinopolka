import { useState } from 'react'
import { SearchIcon } from './icons'

type WikiPage = { index: number; title: string; extract?: string; fullurl: string }
type WikiResult = { title: string; text: string; url: string }

// Если фильма нет в библиотеке — ищем его в русской Википедии
export function WikiSearch({ query }: { query: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [results, setResults] = useState<WikiResult[]>([])

  async function search() {
    setState('loading')
    try {
      const params = new URLSearchParams({
        action: 'query',
        format: 'json',
        formatversion: '2',
        origin: '*',
        generator: 'search',
        gsrsearch: `${query} фильм`,
        gsrnamespace: '0',
        gsrlimit: '8',
        prop: 'extracts|info',
        exintro: '1',
        explaintext: '1',
        exlimit: '8',
        inprop: 'url',
      })
      const res = await fetch(`https://ru.wikipedia.org/w/api.php?${params}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { query?: { pages?: WikiPage[] } }
      const pages = [...(data.query?.pages ?? [])].sort((a, b) => a.index - b.index)
      const films = pages.filter((p) => /фильм|мультфильм|аниме/i.test(p.extract ?? ''))
      setResults(films.slice(0, 5).map((p) => ({ title: p.title, text: shorten(p.extract ?? ''), url: p.fullurl })))
      setState('done')
    } catch {
      setState('error')
    }
  }

  return (
    <section className="mt-12 animate-fade-up rounded-3xl border border-dashed border-accent/30 bg-surface/60 p-5 sm:p-7">
      {state === 'idle' && (
        <div className="text-center">
          <p className="text-sm text-muted">Нет нужного фильма в библиотеке?</p>
          <button
            type="button"
            onClick={search}
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-fg shadow-md shadow-accent/25 transition-all hover:-translate-y-0.5 active:scale-95"
          >
            <SearchIcon className="h-4 w-4" /> Найти «{query}» в Википедии
          </button>
        </div>
      )}

      {state === 'loading' && <p className="text-center text-muted">Ищу в Википедии…</p>}

      {state === 'error' && (
        <div className="text-center">
          <p>Не получилось связаться с Википедией. Проверь интернет и попробуй ещё раз.</p>
          <button type="button" onClick={search} className="mt-3 rounded-full border border-line px-4 py-2 text-sm font-semibold">
            Повторить
          </button>
        </div>
      )}

      {state === 'done' && (
        <>
          <h3 className="font-display text-lg font-semibold">Найдено в Википедии</h3>
          {results.length === 0 ? (
            <p className="mt-2 text-muted">Фильмов по такому запросу не нашлось. Попробуй написать название по-другому.</p>
          ) : (
            <div className="mt-4 grid gap-3">
              {results.map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-line bg-surface p-4 transition-colors hover:border-accent/60"
                >
                  <span className="block font-semibold">{r.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-muted">{r.text}</span>
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}

// Убираем знаки ударения и обрезаем длинный текст по концу предложения
function shorten(text: string) {
  const clean = text
    .replace(/́/g, '')
    .replace(/\(\s*[;,]?\s*\)/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (clean.length <= 420) return clean
  const cut = clean.slice(0, 420)
  const dot = cut.lastIndexOf('. ')
  return dot > 200 ? cut.slice(0, dot + 1) : `${cut}…`
}
