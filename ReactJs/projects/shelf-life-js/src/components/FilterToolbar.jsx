const FILTERS = ['all', 'produce', 'dairy', 'pantry', 'frozen']

const SORT_OPTIONS = [
  ['expiry', 'By date'],
  ['name', 'By name'],
]

/** Presentational: controlled solely via props (no local useState). */
export function FilterToolbar({
  filterCategory,
  sortKey,
  onFilterChange,
  onSortChange,
}) {
  return (
    <div className="toolbar card">
      <div className="toolbar__group">
        <span className="toolbar__label">Filter</span>
        
        <input
          type="text"
          value={filterCategory}
          onChange={(e) => onFilterChange(e.target.value)}
          placeholder="Filter by category"
        />

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
          {SORT_OPTIONS.map(([key, label]) => (
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
