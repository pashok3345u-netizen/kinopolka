import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { FILMS, type FilmEntry } from '../data'
import type { Mark } from '../lib/marks'
import { MOOD_BY_ID, capitalize, formatMinutes } from '../lib/labels'
import { similarFilms } from '../lib/search'
import { Stars } from './Stars'
import { BookmarkIcon, CheckIcon, DiceIcon, ExternalIcon, LinkIcon, XIcon } from './icons'

type Props = {
  film: FilmEntry
  mark?: Mark
  onClose: () => void
  onUpdate: (patch: Partial<Mark>) => void
  onOpen: (id: string) => void
  onRandomAgain?: () => void
}

export function FilmModal({ film, mark, onClose, onUpdate, onOpen, onRandomAgain }: Props) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [copied, setCopied] = useState(false)
  const similar = useMemo(() => similarFilms(film, FILMS), [film])

  // Esc закрывает окно, а страница под окном не прокручивается
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  // Открыли другой фильм — прокручиваем окно наверх
  useEffect(() => {
    panelRef.current?.scrollTo({ top: 0 })
    setCopied(false)
  }, [film.id])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Скопируй ссылку:', location.href)
    }
  }

  const wikiUrl = `https://ru.wikipedia.org/w/index.php?search=${encodeURIComponent(`${film.title} ${film.year}`)}`

  return (
    <div
      className="fixed inset-0 z-50 flex animate-fade items-end justify-center bg-[#1a0a0e]/55 backdrop-blur-md sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="film-title"
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92dvh] w-full animate-pop overflow-y-auto [scrollbar-color:var(--line)_transparent] [scrollbar-width:thin] rounded-t-[2rem] border border-line bg-surface p-5 pb-8 shadow-2xl shadow-accent/20 sm:max-w-2xl sm:rounded-[2rem] sm:p-9"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-surface-2 text-muted transition hover:rotate-90 hover:text-accent"
        >
          <XIcon />
        </button>

        {/* key — чтобы при переходе на другой фильм содержимое красиво появлялось заново */}
        <div key={film.id} className="animate-fade-up">

        {onRandomAgain && (
          <button
            type="button"
            onClick={onRandomAgain}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/15"
          >
            <DiceIcon className="h-4 w-4" /> Другой случайный фильм
          </button>
        )}

        <p className="pr-12 text-xs font-semibold uppercase tracking-wider text-accent">
          {film.genres.join(' · ')}
        </p>
        <h2 id="film-title" className="mt-2 pr-12 font-display text-3xl font-semibold leading-[1.1] text-balance sm:text-4xl">
          {film.title}
        </h2>
        {film.original && film.original !== film.title && (
          <p className="mt-1.5 font-display text-lg italic text-muted">{film.original}</p>
        )}

        <dl className="mt-6 grid grid-cols-2 gap-x-4 gap-y-4 text-sm sm:grid-cols-3">
          <Info label="Год">{film.year}</Info>
          <Info label="Длительность">{formatMinutes(film.minutes)}</Info>
          <Info label="Страна">{film.country.join(', ')}</Info>
          <Info label="Режиссёр">{film.director}</Info>
          {film.cast.length > 0 && (
            <div className="col-span-2">
              <Info label="В главных ролях">{film.cast.join(', ')}</Info>
            </div>
          )}
        </dl>

        <p className="mt-6 text-[17px] leading-relaxed">{film.about}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {film.moods.map((id) => {
            const m = MOOD_BY_ID.get(id)
            return m ? (
              <span key={id} className="rounded-full bg-surface-2 px-3 py-1 text-sm">
                {m.emoji} {m.label}
              </span>
            ) : null
          })}
          {film.adult && (
            <span className="rounded-full border border-line px-3 py-1 text-sm font-semibold">18+</span>
          )}
        </div>

        <div className="mt-7 flex flex-col gap-4 rounded-2xl bg-surface-2 p-4">
          <div className="flex flex-wrap gap-2">
            <Toggle active={!!mark?.want} onClick={() => onUpdate({ want: !mark?.want })}>
              <BookmarkIcon className="h-4 w-4" filled={!!mark?.want} /> Хочу посмотреть
            </Toggle>
            <Toggle
              active={!!mark?.seen}
              onClick={() => onUpdate(mark?.seen ? { seen: false } : { seen: true, want: false })}
            >
              <CheckIcon className="h-4 w-4" /> Просмотрено
            </Toggle>
          </div>
          <div className="flex items-center gap-3">
            <span className="whitespace-nowrap text-sm text-muted">Моя оценка</span>
            <Stars
              value={mark?.stars ?? 0}
              onChange={(stars) => onUpdate(stars ? { stars, seen: true, want: false } : { stars: 0 })}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <button
            type="button"
            onClick={copyLink}
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-medium hover:border-muted"
          >
            <LinkIcon /> {copied ? 'Ссылка скопирована ✓' : 'Скопировать ссылку'}
          </button>
          <a
            href={wikiUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 font-medium hover:border-muted"
          >
            Википедия <ExternalIcon />
          </a>
        </div>

        {similar.length > 0 && (
          <section className="mt-9">
            <h3 className="font-display text-lg font-semibold">Похожие фильмы</h3>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {similar.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => onOpen(s.id)}
                  className="rounded-2xl border border-line px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-accent/50 hover:bg-surface-2"
                >
                  <span className="block font-display text-[17px] font-semibold leading-snug">{s.title}</span>
                  <span className="mt-0.5 block text-xs text-muted">
                    {s.year} · {s.genres.slice(0, 2).map(capitalize).join(', ')}
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}
        </div>
      </div>
    </div>
  )
}

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 font-medium">{children}</dd>
    </div>
  )
}

function Toggle({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all active:scale-95 ${
        active ? 'animate-boop border-accent bg-accent text-accent-fg' : 'border-line bg-surface hover:border-accent/50 hover:text-accent'
      }`}
    >
      {children}
    </button>
  )
}
