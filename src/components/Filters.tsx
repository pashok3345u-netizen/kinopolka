import type { ReactNode } from 'react'
import type { Genre } from '../data/types'
import { DECADES, GENRES, LENGTHS, ORIGINS, capitalize, type Origin } from '../lib/labels'
import { Chip } from './Chip'

export type FilterState = {
  genres: Genre[]
  decades: string[]
  length: string | null
  origin: Origin
  hideSeen: boolean
}

export const EMPTY_FILTERS: FilterState = { genres: [], decades: [], length: null, origin: 'all', hideSeen: false }

export function countActive(f: FilterState) {
  return f.genres.length + f.decades.length + (f.length ? 1 : 0) + (f.origin !== 'all' ? 1 : 0) + (f.hideSeen ? 1 : 0)
}

function toggle<T>(list: T[], item: T) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item]
}

type Props = { value: FilterState; onChange: (value: FilterState) => void }

export function Filters({ value, onChange }: Props) {
  return (
    <div className="mt-3 grid grid-cols-1 gap-6 rounded-3xl border border-line bg-surface p-4 sm:p-6">
      <Group title="Жанры" hint="несколько — значит фильм подходит под все сразу">
        {GENRES.map((g) => (
          <Chip key={g} active={value.genres.includes(g)} onClick={() => onChange({ ...value, genres: toggle(value.genres, g) })}>
            {capitalize(g)}
          </Chip>
        ))}
      </Group>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Group title="Годы">
          {DECADES.map((d) => (
            <Chip
              key={d.id}
              active={value.decades.includes(d.id)}
              onClick={() => onChange({ ...value, decades: toggle(value.decades, d.id) })}
            >
              {d.label}
            </Chip>
          ))}
        </Group>

        <Group title="Длительность">
          {LENGTHS.map((l) => (
            <Chip
              key={l.id}
              active={value.length === l.id}
              onClick={() => onChange({ ...value, length: value.length === l.id ? null : l.id })}
            >
              {l.label}
            </Chip>
          ))}
        </Group>

        <Group title="Откуда фильм">
          {ORIGINS.map((o) => (
            <Chip key={o.id} active={value.origin === o.id} onClick={() => onChange({ ...value, origin: o.id })}>
              {o.label}
            </Chip>
          ))}
        </Group>

        <Group title="Мои списки">
          <Chip active={value.hideSeen} onClick={() => onChange({ ...value, hideSeen: !value.hideSeen })}>
            Скрыть просмотренные
          </Chip>
        </Group>
      </div>
    </div>
  )
}

function Group({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-2.5 flex flex-wrap items-baseline gap-x-2">
        <h3 className="text-sm font-semibold">{title}</h3>
        {hint && <span className="text-xs text-muted">{hint}</span>}
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}
