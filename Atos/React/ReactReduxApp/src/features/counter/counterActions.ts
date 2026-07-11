import type { AppThunk } from '../../store';
import * as types from './counterTypes';

export const increment = () => ({ type: types.INCREMENT } as const);

export const decrement = () => ({ type: types.DECREMENT } as const);

export const reset = () => ({ type: types.RESET } as const);

export const setCount = (value: number) =>
  ({
    type: types.SET_COUNT,
    payload: value,
  }) as const;

export const setLoading = (loading: boolean) =>
  ({
    type: types.SET_LOADING,
    payload: loading,
  }) as const;

export const setError = (error: string | null) =>
  ({
    type: types.SET_ERROR,
    payload: error,
  }) as const;

export type CounterAction =
  | ReturnType<typeof increment>
  | ReturnType<typeof decrement>
  | ReturnType<typeof reset>
  | ReturnType<typeof setCount>
  | ReturnType<typeof setLoading>
  | ReturnType<typeof setError>;

/** Simulates an async API call — demonstrates Redux Thunk. */
export const fetchRandomCount = (): AppThunk => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));

  try {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const value = Math.floor(Math.random() * 100);
    dispatch(setCount(value));
  } catch {
    dispatch(setError('Failed to fetch count'));
  } finally {
    dispatch(setLoading(false));
  }
};
