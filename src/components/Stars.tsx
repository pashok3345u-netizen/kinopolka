import { useState } from 'react'

type Props = { value: number; onChange: (value: number) => void }

// Оценка от 1 до 5. Повторный клик по той же звезде убирает оценку.
export function Stars({ value, onChange }: Props) {
  const [hover, setHover] = useState(0)
  const shown = hover || value

  return (
    <div className="flex items-center" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`Оценка ${n} из 5`}
          aria-pressed={n === value}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n === value ? 0 : n)}
          className={`px-0.5 text-[26px] leading-none transition-transform hover:scale-110 ${
            n <= shown ? 'text-accent' : 'text-line'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  )
}
