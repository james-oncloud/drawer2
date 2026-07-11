import type { CounterAction } from './counterActions';
import * as types from './counterTypes';

export interface CounterState {
  value: number;
  loading: boolean;
  error: string | null;
}

const initialState: CounterState = {
  value: 0,
  loading: false,
  error: null,
};

export function counterReducer(
  state: CounterState = initialState,
  action: CounterAction,
): CounterState {
  switch (action.type) {
    case types.INCREMENT:
      return { ...state, value: state.value + 1 };
    case types.DECREMENT:
      return { ...state, value: state.value - 1 };
    case types.RESET:
      return { ...state, value: 0, error: null };
    case types.SET_COUNT:
      return { ...state, value: action.payload };
    case types.SET_LOADING:
      return { ...state, loading: action.payload };
    case types.SET_ERROR:
      return { ...state, error: action.payload };
    default:
      return state;
  }
}
