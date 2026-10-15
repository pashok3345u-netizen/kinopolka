import { useEffect, useState } from 'react'

// Как useState, но значение запоминается в браузере (localStorage)
export function useStored<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw ? (JSON.parse(raw) as T) : initial
    } catch {
      return initial
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // приватный режим или запрет — просто не сохраняем
    }
  }, [key, value])

  return [value, setValue] as const
}
