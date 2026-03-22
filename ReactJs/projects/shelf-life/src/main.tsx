import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeProvider'
import './index.css'

/**
 * StrictMode enables extra development checks (double-invoking some lifecycles,
 * warnings for deprecated APIs). createRoot is the React 18+ concurrent entry API.
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
