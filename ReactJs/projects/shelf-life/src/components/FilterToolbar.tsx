import type { FilterCategory, SortKey } from '../types'

const FILTERS: FilterCategory[] = ['all', 'produce', 'dairy', 'pantry', 'frozen']

export interface FilterToolbarProps {
  filterCategory: FilterCategory
  sortKey: SortKey
  onFilterChange: (f: FilterCategory) => void
  onSortChange: (s: SortKey) => void
}

/** Presentational component: no local state — fully controlled by parent (single source of truth). */
export function FilterToolbar({
  filterCategory,
  sortKey,
  onFilterChange,
  onSortChange,
}: FilterToolbarProps) {
  return (
    <div className="toolbar card">
      <div className="toolbar__group">
        <span className="toolbar__label">Filter</span>
        <div className="chip-row">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              className={`chip${filterCategory === f ? ' chip--active' : ''}`}
              onClick={() => onFilterChange(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
      <div className="toolbar__group">
        <span className="toolbar__label">Sort</span>
        <div className="chip-row">
          {(
            [
              ['expiry', 'By date'],
              ['name', 'By name'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`chip${sortKey === key ? ' chip--active' : ''}`}
              onClick={() => onSortChange(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
