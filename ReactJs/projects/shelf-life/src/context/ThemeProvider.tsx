import { useCallback, useLayoutEffect, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext, type Theme } from './themeContext'

const THEME_KEY = 'shelf-life-theme'

/**
 * Context API: avoids prop-drilling theme through every intermediate component.
 * Provider owns state; descendants call useTheme() for read/update.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    return window.localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
  })

  // useLayoutEffect: apply theme before paint to avoid a one-frame flash of the wrong palette
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'))
  }, [])

  const value = useMemo(
    () => ({
      theme,
      toggleTheme,
    }),
    [theme, toggleTheme],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
