# Shelf Life

A small **pantry / best-by tracker** built as a React 19 + TypeScript showcase. It demonstrates hooks, context, `useReducer`, code splitting, an error boundary, and browser persistence without a backend.

## Requirements

- **Node.js** 20+ recommended (matches current Vite / ESLint tooling)
- **npm** 10+ (or another client that respects `package-lock.json`)

## Install, build, and run

From this directory (`projects/shelf-life`):

```bash
npm install
```

| Command | Purpose |
|--------|---------|
| `npm run dev` | Start the Vite dev server with HMR. Default URL is printed in the terminal (usually `http://localhost:5173`). |
| `npm run build` | Run `tsc -b` (TypeScript project references), then `vite build`. Output goes to `dist/`. |
| `npm run preview` | Serve the production build locally to verify `dist/` before deploy. |
| `npm run lint` | Run ESLint on the repo (flat config in `eslint.config.js`). |

**Typical workflow:** `npm install` once, then `npm run dev` while developing. Before a release, run `npm run build` and optionally `npm run preview`.

There is no `.env` file in this sample; all configuration is code and standard Vite/TS settings (see [App configuration](#app-configuration)).

## App architecture

### High-level shape

- **Entry:** `index.html` mounts `#root` and loads `src/main.tsx`.
- **Shell:** `main.tsx` wraps the tree in `StrictMode` and `ThemeProvider`, then renders `App`.
- **State:** Pantry items, filters, and sort order live in a single **`useReducer`** slice (`pantryReducer` + `getInitialPantryState`). The UI derives filtered/sorted rows with **`useMemo`**.
- **Theme:** `ThemeProvider` owns light/dark state and writes `data-theme` on `document.documentElement` so CSS tokens can switch.
- **Code splitting:** `InsightsPanel` is loaded with **`React.lazy`** and **`Suspense`** so it can ship in a separate chunk until the user opens “Insights”.
- **Resilience:** The pantry list is wrapped in an **`ErrorBoundary`** class component so a subtree error does not tear down the whole app.

```mermaid
flowchart TB
  subgraph entry [Entry]
    HTML[index.html]
    Main[main.tsx]
  end
  subgraph providers [Providers]
    TP[ThemeProvider]
  end
  subgraph app [App]
    Reducer[useReducer pantry]
    Memo[useMemo derived list]
    Form[AddItemForm]
    Filter[FilterToolbar]
    List[PantryItemRow list]
    Lazy[lazy InsightsPanel + Suspense]
    EB[ErrorBoundary]
  end
  HTML --> Main
  Main --> TP
  TP --> app
  Reducer --> Memo
  Memo --> List
  EB --> List
```

### Source layout

| Path | Role |
|------|------|
| `src/main.tsx` | `createRoot`, `StrictMode`, `ThemeProvider` |
| `src/App.tsx` | Reducer, persistence effect, layout, lazy insights |
| `src/types.ts` | Domain types (`PantryItem`, categories, sort keys) |
| `src/pantryReducer.ts` | Reducer, `localStorage` hydrate/persist, seed data |
| `src/context/themeContext.ts` | `createContext` + types |
| `src/context/ThemeProvider.tsx` | Theme state and DOM sync |
| `src/context/useTheme.ts` | Consumer hook |
| `src/components/AddItemForm.tsx` | Controlled form, `useId`, `useRef` |
| `src/components/FilterToolbar.tsx` | Controlled filter/sort controls |
| `src/components/PantryItemRow.tsx` | `memo` row + callbacks from parent |
| `src/components/ErrorBoundary.tsx` | Class-based error boundary |
| `src/InsightsPanel.tsx` | Default export for `React.lazy` |
| `src/index.css` | Global styles and `[data-theme]` tokens |

### Client-side persistence

The app reads and writes browser **`localStorage`** (no server):

- **`shelf-life-pantry-v1`** — full pantry state: `items`, `filterCategory`, `sortKey` (see `src/pantryReducer.ts`).
- **`shelf-life-theme`** — `"light"` or `"dark"` (see `src/context/ThemeProvider.tsx`).

Clearing those keys resets pantry data to seeded defaults and theme to light on next load (until toggled again).

## App configuration

### Vite (`vite.config.ts`)

- Uses **`@vitejs/plugin-react`** for Fast Refresh and JSX transform.
- No custom `server`, `build`, or `resolve` overrides; defaults apply (e.g. dev port 5173, `dist` output).

To change dev server port or proxy APIs, extend `defineConfig` in this file per the [Vite config reference](https://vite.dev/config/).

### TypeScript

- **`tsconfig.json`** — solution-style root: references `tsconfig.app.json` and `tsconfig.node.json`, no files compiled at root.
- **`tsconfig.app.json`** — application code under `src/`: `strict`, `jsx: "react-jsx"`, `moduleResolution: "bundler"`, `verbatimModuleSyntax`, `noEmit` (Vite bundles; `tsc` type-checks only).
- **`tsconfig.node.json`** — tooling config (`vite.config.ts`) with Node-oriented `lib` / `types`.

The **`npm run build`** script runs **`tsc -b`** first so both referenced projects type-check before `vite build`.

### ESLint (`eslint.config.js`)

Flat config with:

- `@eslint/js` recommended
- `typescript-eslint` recommended
- `eslint-plugin-react-hooks` recommended
- `eslint-plugin-react-refresh` Vite preset (e.g. fast-refresh export rules)

Browser globals come from **`globals.browser`**. **`dist/`** is ignored.

### HTML shell (`index.html`)

Sets page metadata, favicon, viewport, and the document title. The JS entry is **`/src/main.tsx`** (Vite resolves and bundles it).

---

For a tour of React patterns used in the UI, start with the comment block at the top of `src/App.tsx` and follow imports into `src/components/` and `src/context/`.
