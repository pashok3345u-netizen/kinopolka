import type { ReactNode } from 'react'

type Props = { active: boolean; onClick: () => void; children: ReactNode }

// Кнопка-«таблетка» для фильтров
export function Chip({ active, onClick, children }: Props) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
        active
          ? 'border-accent bg-accent text-accent-fg shadow-md shadow-accent/25'
          : 'border-line bg-surface text-fg hover:border-accent/40'
      }`}
    >
      {children}
    </button>
  )
}
