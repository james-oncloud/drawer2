# Shelf Life (JavaScript)

A small **pantry / best-by tracker** — the same app as **`shelf-life-ts`**, implemented with **modern JavaScript (ES modules, ES6+ syntax)** and **no TypeScript**. It demonstrates hooks, context, `useReducer`, code splitting, an error boundary, and browser persistence without a backend.

## Requirements

- **Node.js** 20+ recommended
- **npm** 10+

## Install, build, and run

From this directory (`projects/shelf-life-js`):

```bash
npm install
```

| Command | Purpose |
|--------|---------|
| `npm run dev` | Vite dev server with HMR (usually `http://localhost:5173`). |
| `npm run build` | Production build to `dist/` (Vite only — no `tsc` step). |
| `npm run preview` | Serve `dist/` locally. |
| `npm run lint` | ESLint for `*.js` / `*.jsx`. |

## TypeScript vs this project

| | `shelf-life-ts` | `shelf-life-js` |
|--|-----------------|-----------------|
| Source | `.ts` / `.tsx` | `.js` / `.jsx` |
| Types | `types.ts`, interfaces | JSDoc comments where helpful (`pantryReducer.js`) |
| Build | `tsc -b && vite build` | `vite build` |
| IDE hints | `tsconfig.*` | `jsconfig.json` (optional path/JSX settings) |

## App user guide

Same behavior as the TypeScript variant: add items with best-by dates, filter by category, sort, toggle “used”, remove rows, toggle light/dark theme, and open **Insights** to load the lazy chart. Data is stored in **`localStorage`** under `shelf-life-pantry-v1` and `shelf-life-theme`.

## App architecture

- **Entry:** `index.html` → `src/main.jsx`
- **Shell:** `StrictMode` + `ThemeProvider` + `App`
- **State:** `useReducer` in `pantryReducer.js`; derived list via `useMemo` in `App.jsx`
- **Theme:** `context/themeContext.js`, `ThemeProvider.jsx`, `useTheme.js`
- **Lazy UI:** `React.lazy(() => import('./InsightsPanel'))` in `App.jsx`

See **`shelf-life-ts/README.md`** for a fuller diagram and configuration notes; this JS copy mirrors that structure with `.js`/`.jsx` files.

## App configuration

- **`vite.config.js`** — `@vitejs/plugin-react`
- **`eslint.config.js`** — `@eslint/js`, React Hooks, React Refresh (no `typescript-eslint`)
- **`jsconfig.json`** — editor support for `jsx` and Vite client types

---

Practice tasks live in **`jira/tasks.md`** (shared idea list with the TS project).
