import { createContext } from 'react'

export type Theme = 'light' | 'dark'

export interface ThemeValue {
  theme: Theme
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeValue | null>(null)
