import { useCallback, useLayoutEffect, useMemo, useState } from 'react'
import { ThemeContext } from './themeContext'

const THEME_KEY = 'shelf-life-theme'

/**
 * Context API: theme without prop drilling.
 * ES6+: arrow helpers, object shorthand in useMemo value.
 */
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') return 'light'
    return window.localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
  })

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
