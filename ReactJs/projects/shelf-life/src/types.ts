/**
 * Domain model for "Shelf Life" — a tiny pantry tracker used to demonstrate
 * React data flow (props down, events up) and list rendering with stable keys.
 */

export type PantryCategory = 'produce' | 'dairy' | 'pantry' | 'frozen'

export interface PantryItem {
  /** Stable key for reconciliation — never use array index as key for mutable lists */
  id: string
  name: string
  category: PantryCategory
  /** ISO date string (yyyy-mm-dd) for simple sorting and expiry math */
  expiryISO: string
  consumed: boolean
}

export type FilterCategory = PantryCategory | 'all'

export type SortKey = 'expiry' | 'name'
