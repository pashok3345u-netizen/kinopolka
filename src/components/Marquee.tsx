import type { FilmEntry } from '../data'

type Props = { films: FilmEntry[]; onOpen: (id: string) => void }

// Две ленты с названиями, которые бегут навстречу друг другу, как на афише кинотеатра.
// Список повторён дважды, чтобы лента крутилась без разрыва.
export function Marquee({ films, onOpen }: Props) {
  const back = [...films].reverse()

  return (
    <div className="relative my-10 overflow-hidden py-8 sm:my-14" aria-label="Фильмы из библиотеки">
      <div className="absolute inset-x-0 top-1/2 -ml-[5%] w-[110%] -translate-y-1/2 rotate-2 bg-accent-2/20 py-2.5" aria-hidden>
        <div className="marquee-track [animation-direction:reverse] [animation-duration:90s]">
          {[...back, ...back].map((f, i) => (
            <span key={i} className="flex shrink-0 items-center gap-5 whitespace-nowrap px-2.5 font-display text-base italic text-accent/70">
              {f.title}
              <span className="not-italic">✦</span>
            </span>
          ))}
        </div>
      </div>

      <div className="marquee relative -ml-[5%] w-[110%] -rotate-2 bg-band py-3 text-band-fg shadow-xl shadow-accent/20">
        <div className="marquee-track">
          {[...films, ...films].map((f, i) => {
            const copy = i >= films.length
            return (
              <button
                key={i}
                type="button"
                onClick={() => onOpen(f.id)}
                tabIndex={copy ? -1 : undefined}
                aria-hidden={copy || undefined}
                className="flex shrink-0 items-center gap-5 whitespace-nowrap px-2.5 font-display text-lg italic decoration-1 underline-offset-4 hover:underline"
              >
                {f.title}
                <span className="not-italic opacity-60">✦</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
