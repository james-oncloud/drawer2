const ORDER = ['produce', 'dairy', 'pantry', 'frozen']

/** Default export for React.lazy() code splitting */
export default function InsightsPanel({ items }) {
  const active = items.filter((i) => !i.consumed)
  const counts = ORDER.map((cat) => ({
    cat,
    n: active.filter((i) => i.category === cat).length,
  }))
  const max = Math.max(1, ...counts.map((c) => c.n))

  return (
    <div className="insights">
      <p className="card__hint">
        Lazy-loaded panel — counts only active (not marked used) items per category.
      </p>
      <ul className="insights__bars">
        {counts.map(({ cat, n }) => (
          <li key={cat}>
            <div className="insights__row">
              <span className="insights__cat">{cat}</span>
              <span className="insights__n">{n}</span>
            </div>
            <div className="insights__track" aria-hidden>
              <div className="insights__fill" style={{ width: `${(n / max) * 100}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
