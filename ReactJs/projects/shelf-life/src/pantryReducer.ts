import type { FilterCategory, PantryItem, SortKey } from './types'

/** Central state for the pantry: items plus UI filter/sort (useReducer showcase). */
export interface PantryState {
  items: PantryItem[]
  filterCategory: FilterCategory
  sortKey: SortKey
}

export type PantryAction =
  | { type: 'ADD_ITEM'; item: PantryItem }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'TOGGLE_CONSUMED'; id: string }
  | { type: 'SET_FILTER'; filter: FilterCategory }
  | { type: 'SET_SORT'; sortKey: SortKey }

const STORAGE_KEY = 'shelf-life-pantry-v1'

/** Starter data when localStorage is empty — makes the demo usable immediately */
function seedItems(): PantryItem[] {
  const today = new Date()
  const addDays = (d: number) => {
    const t = new Date(today)
    t.setDate(t.getDate() + d)
    return t.toISOString().slice(0, 10)
  }
  return [
    {
      id: crypto.randomUUID(),
      name: 'Greek yogurt',
      category: 'dairy',
      expiryISO: addDays(3),
      consumed: false,
    },
    {
      id: crypto.randomUUID(),
      name: 'Cherry tomatoes',
      category: 'produce',
      expiryISO: addDays(1),
      consumed: false,
    },
    {
      id: crypto.randomUUID(),
      name: 'Black beans',
      category: 'pantry',
      expiryISO: addDays(120),
      consumed: false,
    },
  ]
}

function readStoredState(): Partial<PantryState> | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return null
    return parsed as Partial<PantryState>
  } catch {
    return null
  }
}

/**
 * Lazy initializer for useReducer — runs once on mount.
 * Shows the "function form" of initial state when the value is expensive or
 * depends on browser APIs (here, localStorage).
 */
export function getInitialPantryState(): PantryState {
  const stored = readStoredState()
  if (stored?.items && Array.isArray(stored.items) && stored.items.length > 0) {
    return {
      items: stored.items,
      filterCategory: stored.filterCategory ?? 'all',
      sortKey: stored.sortKey ?? 'expiry',
    }
  }
  return {
    items: seedItems(),
    filterCategory: 'all',
    sortKey: 'expiry',
  }
}

export function pantryReducer(state: PantryState, action: PantryAction): PantryState {
  switch (action.type) {
    case 'ADD_ITEM':
      return { ...state, items: [action.item, ...state.items] }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) }
    case 'TOGGLE_CONSUMED':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, consumed: !i.consumed } : i,
        ),
      }
    case 'SET_FILTER':
      return { ...state, filterCategory: action.filter }
    case 'SET_SORT':
      return { ...state, sortKey: action.sortKey }
    default:
      return state
  }
}

/** Single write path keeps items + UI prefs in sync across reloads */
export function persistPantryState(state: PantryState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore quota / private mode */
  }
}
