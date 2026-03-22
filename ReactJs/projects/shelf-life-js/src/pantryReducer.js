/**
 * Pantry state: items + filter/sort (useReducer).
 *
 * Domain shapes (plain objects, documented for readability):
 * - PantryItem: { id, name, category, expiryISO, consumed }
 * - category: 'produce' | 'dairy' | 'pantry' | 'frozen'
 * - filterCategory: category | 'all'
 * - sortKey: 'expiry' | 'name'
 */

const STORAGE_KEY = 'shelf-life-pantry-v1'

function seedItems() {
  const today = new Date()
  const addDays = (d) => {
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

function readStoredState() {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return null
    return parsed
  } catch {
    return null
  }
}

/** Lazy initializer for useReducer (runs once): reads localStorage or seeds demo data */
export function getInitialPantryState() {
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

export function pantryReducer(state, action) {
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

export function persistPantryState(state) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* ignore quota / private mode */
  }
}
