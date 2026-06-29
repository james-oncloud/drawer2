import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  decremented,
  incremented,
  incrementedByAmount,
  reset,
} from '../counterSlice'

export default function Counter() {
  const count = useSelector((state) => state.counter.value)
  const dispatch = useDispatch()
  const [amount, setAmount] = useState('5')

  return (
    <section className="card">
      <h2>Counter</h2>
      <p className="count">{count}</p>

      <div className="button-row">
        <button type="button" onClick={() => dispatch(decremented())}>
          −1
        </button>
        <button type="button" onClick={() => dispatch(incremented())}>
          +1
        </button>
        <button type="button" onClick={() => dispatch(reset())}>
          Reset
        </button>
      </div>

      <div className="amount-row">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          aria-label="Amount to add"
        />
        <button
          type="button"
          onClick={() => dispatch(incrementedByAmount(Number(amount) || 0))}
        >
          Add amount
        </button>
      </div>
    </section>
  )
}
