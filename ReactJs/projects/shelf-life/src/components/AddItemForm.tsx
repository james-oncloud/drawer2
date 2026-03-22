import { useId, useRef, useState, type FormEvent } from 'react'
import type { PantryCategory, PantryItem } from '../types'

const CATEGORIES: PantryCategory[] = ['produce', 'dairy', 'pantry', 'frozen']

export interface AddItemFormProps {
  onAdd: (item: Omit<PantryItem, 'id'>) => void
}

/**
 * Controlled components: React is the source of truth for inputs (value + onChange).
 * useId: generates stable ids for label/input association (accessibility + SSR-safe).
 * useRef: imperative focus after submit without extra re-renders from state.
 */
export function AddItemForm({ onAdd }: AddItemFormProps) {
  const nameId = useId()
  const categoryId = useId()
  const dateId = useId()

  const nameRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState('')
  const [category, setCategory] = useState<PantryCategory>('produce')
  const [expiryISO, setExpiryISO] = useState(() => new Date().toISOString().slice(0, 10))

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      nameRef.current?.focus()
      return
    }
    onAdd({
      name: trimmed,
      category,
      expiryISO,
      consumed: false,
    })
    setName('')
    nameRef.current?.focus()
  }

  return (
    <form className="card add-form" onSubmit={handleSubmit}>
      <h2 className="card__title">Add item</h2>
      <p className="card__hint">
        Controlled fields + form submit — React updates the UI from state on each keystroke.
      </p>
      <div className="add-form__grid">
        <div className="field">
          <label htmlFor={nameId}>Name</label>
          <input
            ref={nameRef}
            id={nameId}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Oat milk"
            autoComplete="off"
          />
        </div>
        <div className="field">
          <label htmlFor={categoryId}>Category</label>
          <select
            id={categoryId}
            value={category}
            onChange={(e) => setCategory(e.target.value as PantryCategory)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor={dateId}>Best-by date</label>
          <input
            id={dateId}
            type="date"
            value={expiryISO}
            onChange={(e) => setExpiryISO(e.target.value)}
          />
        </div>
      </div>
      <button type="submit" className="btn btn--primary">
        Add to shelf
      </button>
    </form>
  )
}
