import {
  applyMiddleware,
  combineReducers,
  legacy_createStore as createStore,
} from 'redux';
import { thunk } from 'redux-thunk';
import type { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { counterReducer } from '../features/counter/counterReducer';
import type { CounterAction } from '../features/counter/counterActions';

const rootReducer = combineReducers({
  counter: counterReducer,
});

export const store = createStore(
  rootReducer,
  undefined,
  applyMiddleware(thunk),
);

export type RootState = ReturnType<typeof rootReducer>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  CounterAction
>;
export type AppDispatch = ThunkDispatch<RootState, unknown, CounterAction>;
