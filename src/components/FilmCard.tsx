import type { PointerEvent, ReactNode } from 'react'
import type { FilmEntry } from '../data'
import type { Mark } from '../lib/marks'
import { MOOD_BY_ID, formatMinutes } from '../lib/labels'
import { BookmarkIcon, CheckIcon } from './icons'

type Props = {
  film: FilmEntry
  mark?: Mark
  index: number // порядковый номер — чтобы карточки появлялись по очереди
  onOpen: () => void
  onToggleWant: () => void
  onToggleSeen: () => void
}

// Запоминаем, где мышка, чтобы подсветка карточки шла за курсором
function trackPointer(e: PointerEvent<HTMLElement>) {
  const rect = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
}

export function FilmCard({ film, mark, index, onOpen, onToggleWant, onToggleSeen }: Props) {
  const moods = film.moods.map((id) => MOOD_BY_ID.get(id))

  return (
    <article
      onPointerMove={trackPointer}
      style={{ animationDelay: `${Math.min(index, 12) * 45}ms` }}
      className={`spotlight group relative flex animate-fade-up flex-col rounded-3xl border border-line bg-surface p-5 transition-[translate,box-shadow,border-color] duration-300 hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/15 ${
        mark?.seen ? 'opacity-80' : ''
      }`}
    >
      {/* Вся карточка кликабельна: невидимая кнопка поверх неё */}
      <button
        type="button"
        onClick={onOpen}
        className="absolute inset-0 z-[1] rounded-3xl focus-visible:outline-2 focus-visible:outline-accent"
        aria-label={`Открыть: ${film.title}`}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-display text-xl font-semibold leading-tight text-balance transition-colors group-hover:text-accent">
            {film.title}
          </h3>
          <p className="mt-1 truncate text-xs text-muted">
            {film.original && film.original !== film.title ? `${film.original} · ` : ''}
            {film.year}
          </p>
        </div>
        <div className="relative z-[2] flex shrink-0 gap-1.5">
          <IconToggle active={!!mark?.want} label="Хочу посмотреть" onClick={onToggleWant}>
            <BookmarkIcon filled={!!mark?.want} />
          </IconToggle>
          <IconToggle active={!!mark?.seen} label="Просмотрено" onClick={onToggleSeen}>
            <CheckIcon />
          </IconToggle>
        </div>
      </div>

      <p className="mt-2 text-xs text-muted">
        {film.country.slice(0, 2).join(', ')} · {formatMinutes(film.minutes)}
        {film.adult && <span className="ml-1.5 rounded border border-line px-1 font-semibold">18+</span>}
      </p>

      <p className="mt-3 line-clamp-3 text-sm leading-relaxed">{film.about}</p>

      <div className="mt-auto flex items-end justify-between gap-2 pt-4">
        <div className="flex flex-wrap gap-1.5">
          {film.genres.slice(0, 3).map((g) => (
            <span key={g} className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs text-muted">
              {g}
            </span>
          ))}
        </div>
        <div className="shrink-0 text-right">
          {mark?.stars ? (
            <span className="block text-xs tracking-tight text-accent" aria-label={`Моя оценка: ${mark.stars}`}>
              {'★'.repeat(mark.stars)}
            </span>
          ) : null}
          <span
            className="inline-block text-sm transition-transform duration-300 group-hover:scale-125"
            title={moods.map((m) => m?.label).join(', ')}
          >
            {moods.map((m) => m?.emoji).join('')}
          </span>
        </div>
      </div>
    </article>
  )
}

function IconToggle({ active, label, onClick, children }: { active: boolean; label: string; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onClick={onClick}
      className={`grid h-9 w-9 place-items-center rounded-full border transition-colors active:scale-90 ${
        active ? 'animate-boop border-accent bg-accent text-accent-fg' : 'border-line text-muted hover:border-accent/50 hover:text-accent'
      }`}
    >
      {children}
    </button>
  )
}
