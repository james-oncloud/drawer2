import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react'
import { AddItemForm } from './components/AddItemForm'
import { ErrorBoundary } from './components/ErrorBoundary'
import { FilterToolbar } from './components/FilterToolbar'
import { PantryItemRow } from './components/PantryItemRow'
import { useTheme } from './context/useTheme'
import { getInitialPantryState, pantryReducer, persistPantryState } from './pantryReducer'

const InsightsPanel = lazy(() => import('./InsightsPanel'))

function daysFromToday(iso) {
  const target = new Date(`${iso}T12:00:00`)
  const today = new Date()
  today.setHours(12, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}

function urgencyFor(iso) {
  const d = daysFromToday(iso)
  if (d < 0) return 'overdue'
  if (d <= 3) return 'soon'
  return 'ok'
}

/**
 * Shelf Life — same feature set as the TypeScript variant, implemented with
 * modern JavaScript (ES modules, arrow functions, destructuring, spread).
 */
export default function App() {
  const { theme, toggleTheme } = useTheme()

  const [state, dispatch] = useReducer(pantryReducer, undefined, getInitialPantryState)

  const [insightsOpen, setInsightsOpen] = useState(false)

  useEffect(() => {
    persistPantryState(state)
  }, [state])

  const handleAdd = useCallback((fields) => {
    dispatch({
      type: 'ADD_ITEM',
      item: {
        ...fields,
        id: crypto.randomUUID(),
        consumed: fields.consumed ?? false,
      },
    })
  }, [dispatch])

  const handleToggle = useCallback(
    (id) => {
      dispatch({ type: 'TOGGLE_CONSUMED', id })
    },
    [dispatch],
  )

  const handleRemove = useCallback(
    (id) => {
      dispatch({ type: 'REMOVE_ITEM', id })
    },
    [dispatch],
  )

  const handleFilter = useCallback(
    (filter) => {
      dispatch({ type: 'SET_FILTER', filter })
    },
    [dispatch],
  )

  const handleSort = useCallback(
    (sortKey) => {
      dispatch({ type: 'SET_SORT', sortKey })
    },
    [dispatch],
  )

  const visibleItems = useMemo(() => {
    let rows =
      state.filterCategory === 'all'
        ? state.items
        : state.items.filter((i) => i.category === state.filterCategory)

    rows = [...rows].sort((a, b) => {
      if (state.sortKey === 'name') {
        return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
      }
      return a.expiryISO.localeCompare(b.expiryISO)
    })
    return rows
  }, [state.items, state.filterCategory, state.sortKey])

  const summary = useMemo(() => {
    const active = state.items.filter((i) => !i.consumed)
    const overdue = active.filter((i) => urgencyFor(i.expiryISO) === 'overdue').length
    const soon = active.filter((i) => urgencyFor(i.expiryISO) === 'soon').length
    return { total: active.length, overdue, soon }
  }, [state.items])

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <p className="eyebrow">React feature tour (JavaScript)</p>
          <h1>Shelf Life</h1>
          <p className="lede">
            Track what is on your shelf and when to use it. Same patterns as the TS version:
            reducer, derived lists, context, suspense, and an error boundary — without type
            annotations.
          </p>
        </div>
        <button
          type="button"
          className="btn btn--ghost theme-toggle"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? 'Dark' : 'Light'} theme
        </button>
      </header>

      <section className="app__grid">
        <AddItemForm onAdd={handleAdd} />

        <div className="stack">
          <FilterToolbar
            filterCategory={state.filterCategory}
            sortKey={state.sortKey}
            onFilterChange={handleFilter}
            onSortChange={handleSort}
          />

          <div className="card">
            <div className="card__head">
              <h2 className="card__title">Your shelf</h2>
              <p className="summary">
                <span>{summary.total} active</span>
                {summary.soon > 0 && <span className="summary__warn">{summary.soon} use soon</span>}
                {summary.overdue > 0 && (
                  <span className="summary__bad">{summary.overdue} overdue</span>
                )}
              </p>
            </div>

            <ErrorBoundary>
              {visibleItems.length === 0 ? (
                <p className="empty">Nothing here — widen the filter or add an item.</p>
              ) : (
                <ul className="pantry-list">
                  {visibleItems.map((item) => (
                    <PantryItemRow
                      key={item.id}
                      item={item}
                      urgency={urgencyFor(item.expiryISO)}
                      onToggleConsumed={handleToggle}
                      onRemove={handleRemove}
                    />
                  ))}
                </ul>
              )}
            </ErrorBoundary>
          </div>

          <div className="card">
            <div className="card__head card__head--split">
              <h2 className="card__title">Insights</h2>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setInsightsOpen((o) => !o)}
                aria-expanded={insightsOpen}
              >
                {insightsOpen ? 'Hide' : 'Show'} chart
              </button>
            </div>
            {insightsOpen && (
              <Suspense
                fallback={
                  <p className="suspense-fallback" role="status">
                    Loading insights…
                  </p>
                }
              >
                <InsightsPanel items={state.items} />
              </Suspense>
            )}
          </div>
        </div>
      </section>

      <footer className="app__footer">
        <p>
          Open <code>src/App.jsx</code> and <code>src/components/</code> for inline notes.
        </p>
      </footer>
    </div>
  )
}
