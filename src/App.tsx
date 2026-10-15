import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { FILMS, FILMS_BY_ID, type FilmEntry } from './data'
import type { Mood } from './data/types'
import { DECADES, LENGTHS, MOODS, SORTS, filmsWord, type SortId } from './lib/labels'
import { hashSeed, normalize } from './lib/search'
import { useStored } from './lib/useStored'
import type { Mark, Marks } from './lib/marks'
import { Chip } from './components/Chip'
import { FilmCard } from './components/FilmCard'
import { FilmModal } from './components/FilmModal'
import { EMPTY_FILTERS, Filters, countActive, type FilterState } from './components/Filters'
import { Marquee } from './components/Marquee'
import { Roulette } from './components/Roulette'
import { WikiSearch } from './components/WikiSearch'
import {
  ArrowUpIcon,
  ChevronDownIcon,
  DiceIcon,
  Logo,
  MoonIcon,
  Reel,
  SearchIcon,
  SlidersIcon,
  SunIcon,
  XIcon,
} from './components/icons'

type Tab = 'all' | 'want' | 'seen'
const PAGE = 24 // сколько карточек показывать за раз

const TABS: { id: Tab; short: string; long: string; title: string }[] = [
  { id: 'all', short: 'Все', long: 'Все фильмы', title: 'Все фильмы' },
  { id: 'want', short: 'Хочу', long: 'Хочу посмотреть', title: 'Хочу посмотреть' },
  { id: 'seen', short: 'Видела', long: 'Просмотрено', title: 'Просмотрено' },
]

// Задержка появления для элементов шапки (см. класс .rise в index.css)
const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

function idFromHash() {
  const id = decodeURIComponent(location.hash.slice(1))
  return FILMS_BY_ID.has(id) ? id : null
}

function sortFilms(list: FilmEntry[], sort: SortId, marks: Marks, seed: number) {
  const copy = [...list]
  switch (sort) {
    case 'new':
      return copy.sort((a, b) => b.year - a.year)
    case 'old':
      return copy.sort((a, b) => a.year - b.year)
    case 'az':
      return copy.sort((a, b) => a.title.localeCompare(b.title, 'ru'))
    case 'short':
      return copy.sort((a, b) => a.minutes - b.minutes)
    case 'long':
      return copy.sort((a, b) => b.minutes - a.minutes)
    case 'stars':
      return copy.sort((a, b) => (marks[b.id]?.stars ?? 0) - (marks[a.id]?.stars ?? 0))
    default:
      return copy.sort((a, b) => hashSeed(a.id, seed) - hashSeed(b.id, seed))
  }
}

export default function App() {
  const [query, setQuery] = useState('')
  const [mood, setMood] = useState<Mood | null>(null)
  const [filters, setFilters] = useState<FilterState>(EMPTY_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const [tab, setTab] = useState<Tab>('all')
  const [sort, setSort] = useStored<SortId>('kp-sort', 'mix')
  const [marks, setMarks] = useStored<Marks>('kp-marks', {})
  const [theme, setTheme] = useStored<'dark' | 'light'>('kp-theme-v2', 'light')
  const [visible, setVisible] = useState(PAGE)
  const [openId, setOpenId] = useState<string | null>(idFromHash)
  const [randomPool, setRandomPool] = useState<string[] | null>(null)
  const [roulette, setRoulette] = useState<FilmEntry[] | null>(null)
  const [showTop, setShowTop] = useState(false)
  const [seed] = useState(() => Math.floor(Math.random() * 2 ** 31))
  const pushedRef = useRef(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Кнопка «назад» в браузере закрывает окно фильма
  useEffect(() => {
    const onHash = () => {
      const id = idFromHash()
      setOpenId(id)
      if (!id) {
        setRandomPool(null)
        pushedRef.current = false
      }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Клавиша «/» — быстро перейти к поиску
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (e.key === '/' && !['INPUT', 'TEXTAREA', 'SELECT'].includes(tag)) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Кнопка «наверх» появляется, когда пролистали вниз
  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 900)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const results = useMemo(() => {
    const words = normalize(query).split(' ').filter(Boolean)
    const decadeTests = DECADES.filter((d) => filters.decades.includes(d.id))
    const lengthTest = LENGTHS.find((l) => l.id === filters.length)

    const list = FILMS.filter((f) => {
      const m = marks[f.id]
      if (tab === 'want' && !m?.want) return false
      if (tab === 'seen' && !m?.seen) return false
      if (tab !== 'seen' && filters.hideSeen && m?.seen) return false
      if (mood && !f.moods.includes(mood)) return false
      if (filters.genres.some((g) => !f.genres.includes(g))) return false
      if (decadeTests.length && !decadeTests.some((d) => d.test(f.year))) return false
      if (lengthTest && !lengthTest.test(f.minutes)) return false
      if (filters.origin === 'ru' && !f.isOurs) return false
      if (filters.origin === 'world' && f.isOurs) return false
      return words.every((w) => f.search.includes(w))
    })
    return sortFilms(list, sort, marks, seed)
  }, [query, mood, filters, tab, marks, sort, seed])

  // 20 случайных фильмов для бегущей строки
  const marqueeFilms = useMemo(
    () => [...FILMS].sort((a, b) => hashSeed(a.id, seed + 7) - hashSeed(b.id, seed + 7)).slice(0, 20),
    [seed],
  )

  // Поменялись фильтры — снова показываем с начала
  useEffect(() => setVisible(PAGE), [query, mood, filters, tab, sort])

  const counts = useMemo(() => {
    const list = Object.values(marks)
    return { want: list.filter((m) => m.want).length, seen: list.filter((m) => m.seen).length }
  }, [marks])

  const updateMark = useCallback(
    (id: string, patch: Partial<Mark>) => {
      setMarks((prev) => {
        const next: Mark = { ...prev[id], ...patch }
        const copy = { ...prev }
        if (next.want || next.seen || next.stars) copy[id] = next
        else delete copy[id]
        return copy
      })
    },
    [setMarks],
  )

  const openFilm = useCallback((id: string, pool: string[] | null = null) => {
    setOpenId(id)
    setRandomPool(pool)
    if (location.hash) {
      history.replaceState(null, '', `#${id}`)
    } else {
      history.pushState(null, '', `#${id}`)
      pushedRef.current = true
    }
  }, [])

  const closeFilm = useCallback(() => {
    setOpenId(null)
    setRandomPool(null)
    if (pushedRef.current) {
      pushedRef.current = false
      history.back()
    } else if (location.hash) {
      history.replaceState(null, '', location.pathname + location.search)
    }
  }, [])

  function openRandom(pool: FilmEntry[], exclude?: string) {
    const candidates = pool.length > 1 ? pool.filter((f) => f.id !== exclude) : pool
    if (!candidates.length) return
    const pick = candidates[Math.floor(Math.random() * candidates.length)]
    openFilm(pick.id, pool.map((f) => f.id))
  }

  // Главная кнопка «Случайный фильм» сначала крутит рулетку
  function startRoulette() {
    if (!results.length) return
    if (prefersReducedMotion() || results.length === 1) openRandom(results)
    else setRoulette(results)
  }

  const finishRoulette = useCallback(
    (film: FilmEntry) => {
      const pool = roulette ?? []
      setRoulette(null)
      openFilm(film.id, pool.map((f) => f.id))
    },
    [roulette, openFilm],
  )

  function resetAll() {
    setQuery('')
    setMood(null)
    setFilters(EMPTY_FILTERS)
    setTab('all')
  }

  const activeFilters = countActive(filters)
  const isFiltered = !!query.trim() || !!mood || activeFilters > 0
  const openEntry = openId ? FILMS_BY_ID.get(openId) : undefined
  const trimmedQuery = query.trim()
  const tabIndex = TABS.findIndex((t) => t.id === tab)
  const currentTab = TABS[tabIndex]

  return (
    <div className="relative min-h-dvh overflow-x-clip">
      <div className="aurora" aria-hidden>
        <span />
        <span />
        <span />
      </div>

      <header className="relative mx-auto max-w-6xl px-4 pt-5 sm:px-6 sm:pt-8">
        <Reel className="pointer-events-none absolute -right-28 top-10 hidden h-[30rem] w-[30rem] animate-spin-slow text-accent/10 md:block" />

        <div className="rise relative flex items-center justify-between" style={delay(0)}>
          <button type="button" onClick={resetAll} className="group flex items-center gap-2.5" aria-label="Кинополка — сбросить всё">
            <Logo />
            <span className="font-display text-2xl font-semibold tracking-tight">
              Кино<em className="text-accent">полка</em>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface/70 text-accent backdrop-blur transition hover:rotate-12 hover:border-accent/50 active:scale-90"
            aria-label={theme === 'dark' ? 'Включить молочную тему' : 'Включить бордовую ночь'}
            title={theme === 'dark' ? 'Молочная тема' : 'Бордовая ночь'}
          >
            <span key={theme} className="animate-boop">
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </span>
          </button>
        </div>

        <p className="rise relative mt-12 text-xs font-bold uppercase tracking-[0.3em] text-accent sm:mt-16" style={delay(100)}>
          ✦ Кино без лишнего ✦
        </p>
        <h1
          className="rise relative mt-4 font-display text-[2.9rem] font-semibold leading-[1] tracking-tight sm:text-7xl lg:text-8xl"
          style={delay(200)}
        >
          Что посмотрим
          <br />
          <em className="shimmer pr-3 font-medium">сегодня?</em>
        </h1>
        <p className="rise relative mt-5 max-w-xl text-muted sm:text-lg" style={delay(320)}>
          {FILMS.length} фильмов без трейлеров, рекламы и спойлеров. Только название и о чём кино.
        </p>

        <div className="rise relative mt-7 max-w-3xl sm:mt-9" style={delay(440)}>
          <SearchIcon className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-accent" />
          <input
            ref={searchRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Название, режиссёр или актёр…"
            aria-label="Поиск фильма"
            className="h-15 w-full rounded-full border border-line bg-surface pl-13 pr-13 text-base shadow-lg shadow-accent/5 outline-none transition-all duration-300 placeholder:text-muted focus:border-accent/60 focus:shadow-xl focus:shadow-accent/15 focus:ring-4 focus:ring-accent/10"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                searchRef.current?.focus()
              }}
              aria-label="Очистить поиск"
              className="absolute right-4 top-1/2 grid h-8 w-8 -translate-y-1/2 animate-boop place-items-center rounded-full bg-surface-2 text-muted hover:text-accent"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      <Marquee films={marqueeFilms} onOpen={(id) => openFilm(id)} />

      <main className="relative mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <section aria-label="Под настроение" className="rise" style={delay(560)}>
          <p className="mb-3 font-display text-xl italic">Под настроение</p>
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-2 pt-1 sm:mx-0 sm:flex-wrap sm:px-0">
            {MOODS.map((m) => (
              <Chip key={m.id} active={mood === m.id} onClick={() => setMood(mood === m.id ? null : m.id)}>
                {m.emoji} {m.label}
              </Chip>
            ))}
          </div>
        </section>

        <div className="relative mt-8 grid grid-cols-3 rounded-2xl bg-surface-2 p-1 sm:inline-grid">
          {/* Бегунок, который плавно едет под выбранную вкладку */}
          <span
            aria-hidden
            className="absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-xl bg-surface shadow-md shadow-accent/10 transition-transform duration-500 ease-[cubic-bezier(0.3,1.3,0.5,1)]"
            style={{ transform: `translateX(${tabIndex * 100}%)` }}
          />
          {TABS.map((t) => (
            <TabButton
              key={t.id}
              active={tab === t.id}
              onClick={() => setTab(t.id)}
              count={t.id === 'want' ? counts.want : t.id === 'seen' ? counts.seen : 0}
            >
              <span className="sm:hidden">{t.short}</span>
              <span className="hidden sm:inline">{t.long}</span>
            </TabButton>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            className={`inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-all active:scale-95 ${
              showFilters || activeFilters ? 'border-accent text-accent' : 'border-line bg-surface hover:border-accent/40'
            }`}
          >
            <SlidersIcon /> Фильтры
            {activeFilters > 0 && (
              <span key={activeFilters} className="grid h-5 min-w-5 animate-boop place-items-center rounded-full bg-accent px-1 text-xs text-accent-fg">
                {activeFilters}
              </span>
            )}
            <ChevronDownIcon className={`h-4 w-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <label className="relative">
            <span className="sr-only">Сортировка</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortId)}
              className="h-11 cursor-pointer appearance-none rounded-full border border-line bg-surface pl-4 pr-9 text-sm font-semibold outline-none transition-colors hover:border-accent/40 focus:border-accent"
            >
              {SORTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          </label>

          <button
            type="button"
            onClick={startRoulette}
            disabled={!results.length}
            className="group inline-flex h-11 items-center gap-2 rounded-full bg-gradient-to-r from-accent-2 to-accent px-5 text-sm font-semibold text-accent-fg shadow-lg shadow-accent/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent/40 active:scale-95 disabled:opacity-40 sm:ml-auto"
          >
            <DiceIcon className="h-[18px] w-[18px] transition-transform duration-500 group-hover:rotate-[200deg]" />
            Случайный фильм
          </button>
        </div>

        {/* Фильтры плавно раскрываются */}
        <div
          className={`grid grid-cols-1 transition-[grid-template-rows,opacity] duration-500 ease-out ${
            showFilters ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
          }`}
          inert={!showFilters}
        >
          <div className="overflow-hidden">
            <Filters value={filters} onChange={setFilters} />
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            {isFiltered && tab === 'all' ? 'Нашлось' : currentTab.title}
            <span key={results.length} className="ml-3 inline-block animate-boop align-middle font-sans text-base font-bold text-accent" aria-live="polite">
              {results.length} {filmsWord(results.length)}
            </span>
          </h2>
          {isFiltered && (
            <button type="button" onClick={resetAll} className="text-sm font-semibold text-accent underline-offset-4 hover:underline">
              Сбросить всё
            </button>
          )}
        </div>

        {results.length > 0 ? (
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {results.slice(0, visible).map((film, i) => (
              <FilmCard
                key={film.id}
                film={film}
                index={i % PAGE}
                mark={marks[film.id]}
                onOpen={() => openFilm(film.id)}
                onToggleWant={() => updateMark(film.id, { want: !marks[film.id]?.want })}
                onToggleSeen={() =>
                  updateMark(film.id, marks[film.id]?.seen ? { seen: false } : { seen: true, want: false })
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState tab={tab} isFiltered={isFiltered} onReset={resetAll} />
        )}

        {results.length > visible && (
          <div className="mt-10 text-center">
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE)}
              className="rounded-full border border-accent/40 bg-surface px-7 py-3.5 text-sm font-semibold text-accent shadow-md shadow-accent/10 transition-all hover:-translate-y-0.5 hover:bg-accent hover:text-accent-fg active:scale-95"
            >
              Показать ещё · осталось {results.length - visible}
            </button>
          </div>
        )}

        {trimmedQuery.length >= 2 && tab === 'all' && <WikiSearch key={trimmedQuery} query={trimmedQuery} />}
      </main>

      <footer className="relative border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-10 text-sm text-muted sm:px-6">
          <p className="font-display text-2xl text-fg">
            Кино<em className="text-accent">полка</em>
          </p>
          <p>Описания написаны вручную и без спойлеров. Списки и оценки хранятся только в этом браузере.</p>
          <p>
            сделано с <span className="inline-block animate-beat text-accent">♥</span>
          </p>
        </div>
      </footer>

      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="Наверх"
        tabIndex={showTop ? 0 : -1}
        className={`fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-fg shadow-lg shadow-accent/30 transition-all duration-300 hover:-translate-y-1 ${
          showTop ? 'opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
        }`}
      >
        <ArrowUpIcon />
      </button>

      {roulette && <Roulette pool={roulette} onDone={finishRoulette} />}

      {openEntry && (
        <FilmModal
          film={openEntry}
          mark={marks[openEntry.id]}
          onClose={closeFilm}
          onUpdate={(patch) => updateMark(openEntry.id, patch)}
          onOpen={(id) => openFilm(id)}
          onRandomAgain={
            randomPool
              ? () => openRandom(randomPool.flatMap((id) => FILMS_BY_ID.get(id) ?? []), openEntry.id)
              : undefined
          }
        />
      )}
    </div>
  )
}

function TabButton({ active, onClick, count, children }: { active: boolean; onClick: () => void; count?: number; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative z-[1] inline-flex h-10 items-center justify-center gap-1.5 rounded-xl px-5 text-sm font-semibold transition-colors duration-300 ${
        active ? 'text-accent' : 'text-muted hover:text-fg'
      }`}
    >
      {children}
      {count ? (
        <span key={count} className="inline-block animate-boop text-xs font-bold text-accent">
          {count}
        </span>
      ) : null}
    </button>
  )
}

function EmptyState({ tab, isFiltered, onReset }: { tab: Tab; isFiltered: boolean; onReset: () => void }) {
  if (tab === 'want' && !isFiltered) {
    return (
      <Empty emoji="🔖" title="Тут пока пусто">
        Нажимай на закладку на карточке фильма — и он появится в этом списке.
      </Empty>
    )
  }
  if (tab === 'seen' && !isFiltered) {
    return (
      <Empty emoji="🍿" title="Тут пока пусто">
        Отмечай галочкой фильмы, которые уже посмотрела, и ставь им оценки.
      </Empty>
    )
  }
  return (
    <Empty emoji="🤷" title="Ничего не нашлось">
      Попробуй убрать часть фильтров или написать по-другому.
      <br />
      <button type="button" onClick={onReset} className="mt-4 font-semibold text-accent hover:underline">
        Сбросить всё
      </button>
    </Empty>
  )
}

function Empty({ emoji, title, children }: { emoji: string; title: string; children: ReactNode }) {
  return (
    <div className="mt-5 animate-fade-up rounded-3xl border border-dashed border-accent/30 bg-surface/60 px-6 py-14 text-center">
      <div className="animate-float text-5xl">{emoji}</div>
      <p className="mt-4 font-display text-2xl font-semibold">{title}</p>
      <p className="mt-2 text-muted">{children}</p>
    </div>
  )
}
