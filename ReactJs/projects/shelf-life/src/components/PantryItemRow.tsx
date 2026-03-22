import { memo } from 'react'
import type { PantryItem } from '../types'

export interface PantryItemRowProps {
  item: PantryItem
  urgency: 'ok' | 'soon' | 'overdue'
  onToggleConsumed: (id: string) => void
  onRemove: (id: string) => void
}

function urgencyLabel(u: PantryItemRowProps['urgency']): string {
  if (u === 'overdue') return 'Past date'
  if (u === 'soon') return 'Use soon'
  return 'On track'
}

/**
 * React.memo: shallow-compares props so the row skips re-render when unrelated
 * list state changes (e.g. typing in the add form), as long as callbacks
 * from the parent are stabilized with useCallback.
 */
export const PantryItemRow = memo(function PantryItemRow({
  item,
  urgency,
  onToggleConsumed,
  onRemove,
}: PantryItemRowProps) {
  return (
    <li
      className={`pantry-row pantry-row--${urgency}${item.consumed ? ' pantry-row--done' : ''}`}
    >
      <div className="pantry-row__main">
        <button
          type="button"
          className="pantry-row__check"
          aria-pressed={item.consumed}
          onClick={() => onToggleConsumed(item.id)}
          title={item.consumed ? 'Mark as not used' : 'Mark as used'}
        >
          {item.consumed ? '✓' : '○'}
        </button>
        <div>
          <span className="pantry-row__name">{item.name}</span>
          <span className="pantry-row__meta">
            <span className="tag">{item.category}</span>
            <span className="pantry-row__expiry">Best by {item.expiryISO}</span>
            <span className={`pill pill--${urgency}`}>{urgencyLabel(urgency)}</span>
          </span>
        </div>
      </div>
      <button
        type="button"
        className="btn btn--ghost pantry-row__remove"
        onClick={() => onRemove(item.id)}
      >
        Remove
      </button>
    </li>
  )
})
