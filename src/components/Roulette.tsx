import { useEffect, useRef, useState } from 'react'
import type { FilmEntry } from '../data'
import { DiceIcon } from './icons'

type Props = { pool: FilmEntry[]; onDone: (film: FilmEntry) => void }

function pick(pool: FilmEntry[]) {
  return pool[Math.floor(Math.random() * pool.length)]
}

// «Рулетка»: названия быстро мелькают, замедляются и останавливаются на одном фильме
export function Roulette({ pool, onDone }: Props) {
  const [current, setCurrent] = useState(() => pick(pool))
  const [stopped, setStopped] = useState(false)
  const onDoneRef = useRef(onDone)

  useEffect(() => {
    onDoneRef.current = onDone
  }, [onDone])

  useEffect(() => {
    const final = pick(pool)
    let delay = 45
    let elapsed = 0
    let timer = 0
    const step = () => {
      elapsed += delay
      if (elapsed >= 1600) {
        setCurrent(final)
        setStopped(true)
        timer = window.setTimeout(() => onDoneRef.current(final), 700)
        return
      }
      setCurrent(pick(pool))
      delay = Math.min(delay * 1.14, 280) // с каждым шагом всё медленнее
      timer = window.setTimeout(step, delay)
    }
    timer = window.setTimeout(step, delay)
    return () => clearTimeout(timer)
  }, [pool])

  return (
    <div className="fixed inset-0 z-50 grid animate-fade place-items-center bg-[#1a0a0e]/55 p-5 backdrop-blur-md" role="status" aria-live="polite">
      <div
        className={`w-full max-w-md animate-pop rounded-[2rem] border border-line bg-surface px-6 py-9 text-center shadow-2xl transition-shadow duration-500 ${
          stopped ? 'shadow-accent/30 ring-4 ring-accent/25' : ''
        }`}
      >
        <DiceIcon className={`mx-auto h-11 w-11 text-accent ${stopped ? 'animate-boop' : 'animate-spin'}`} />
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.25em] text-muted">
          {stopped ? 'Сегодня смотрим' : 'Выбираю фильм…'}
        </p>
        <div className="mt-3 grid h-[6.5rem] place-items-center overflow-hidden">
          <p key={current.id} className="line-clamp-3 animate-slot font-display text-2xl font-semibold leading-tight text-balance sm:text-3xl">
            {current.title}
          </p>
        </div>
        <p className="mt-1 text-sm text-muted">
          {current.year} · {current.genres.slice(0, 2).join(', ')}
        </p>
      </div>
    </div>
  )
}
