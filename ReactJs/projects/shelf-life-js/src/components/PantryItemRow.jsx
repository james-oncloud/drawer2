import { memo } from 'react'

function urgencyLabel(u) {
  if (u === 'overdue') return 'Past date'
  if (u === 'soon') return 'Use soon'
  return 'On track'
}

/** memo + stable callbacks from parent (useCallback in App) */
export const PantryItemRow = memo(function PantryItemRow({
  item,
  urgency,
  onToggleConsumed,
  onRemove,
}) {
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
