import {
  decrement,
  fetchRandomCount,
  increment,
  reset,
} from './counterActions';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

export function Counter() {
  const { value, loading, error } = useAppSelector((state) => state.counter);
  const dispatch = useAppDispatch();

  return (
    <div className="counter">
      <p className="counter-value">{value}</p>

      {loading && <p className="counter-status">Loading…</p>}
      {error && <p className="counter-error">{error}</p>}

      <div className="counter-actions">
        <button
          type="button"
          disabled={loading}
          onClick={() => dispatch(decrement())}
        >
          −
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => dispatch(reset())}
        >
          Reset
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => dispatch(increment())}
        >
          +
        </button>
      </div>

      <button
        type="button"
        className="btn-fetch"
        disabled={loading}
        onClick={() => dispatch(fetchRandomCount())}
      >
        Fetch random count
      </button>
    </div>
  );
}
