# Redux Implementation — Step-by-Step Guide

Follow these steps in order to wire Redux Toolkit into this React app yourself. Each phase builds on the last.

> **Note:** This project already includes a working counter example. To practice from scratch, delete `src/store.ts`, `src/hooks.ts`, and the `src/features/counter/` folder, then remove the Redux imports from `src/App.tsx` before you start.

---

## Phase 0 — Prerequisites

1. Make sure the dev server runs:

   ```bash
   npm install
   npm run dev
   ```

2. Confirm you understand the goal: **move shared application state out of components and into a central Redux store**, then update UI by dispatching actions.

3. Keep the [Redux Toolkit docs](https://redux-toolkit.js.org/) open as a reference.

---

## Phase 1 — Install dependencies

1. Install the three packages you need:

   ```bash
   npm install @reduxjs/toolkit react-redux
   ```

   | Package            | Purpose                                      |
   | ------------------ | -------------------------------------------- |
   | `@reduxjs/toolkit` | Store setup, slices, selectors, Immer        |
   | `react-redux`      | `Provider`, `useSelector`, `useDispatch`     |

2. Verify `package.json` lists both under `dependencies`.

---

## Phase 2 — Create your first slice

A **slice** is one piece of state plus the reducers that update it.

1. Create the folder:

   ```
   src/features/counter/
   ```

2. Create `src/features/counter/counterSlice.ts`.

3. Define the **state shape** and **initial state**:

   ```ts
   type CounterState = {
     value: number;
   };

   const initialState: CounterState = {
     value: 0,
   };
   ```

4. Create the slice with `createSlice`:

   ```ts
   import { createSlice } from '@reduxjs/toolkit';

   export const counterSlice = createSlice({
     name: 'counter',        // prefix for action types, e.g. 'counter/increment'
     initialState,
     reducers: {
       increment: (state) => {
         state.value += 1;   // Immer lets you "mutate" — it's safe
       },
       decrement: (state) => {
         state.value -= 1;
       },
       reset: (state) => {
         state.value = 0;
       },
     },
   });
   ```

5. Export the **actions** and **reducer**:

   ```ts
   export const { increment, decrement, reset } = counterSlice.actions;
   export const counterReducer = counterSlice.reducer;
   ```

6. **Checkpoint:** You should have a slice file that exports three action creators and one reducer. Nothing runs yet — the store doesn't exist.

---

## Phase 3 — Configure the store

1. Create `src/store.ts`.

2. Combine reducers with `configureStore`:

   ```ts
   import { configureStore } from '@reduxjs/toolkit';
   import { counterReducer } from './features/counter/counterSlice';

   export const store = configureStore({
     reducer: {
       counter: counterReducer,   // key becomes state.counter in the app
     },
   });
   ```

3. Export TypeScript types for the whole app:

   ```ts
   export type RootState = ReturnType<typeof store.getState>;
   export type AppDispatch = typeof store.dispatch;
   ```

4. **Checkpoint:** Import `store` in a temporary `console.log(store.getState())` — it should show `{ counter: { value: 0 } }`.

---

## Phase 4 — Typed React-Redux hooks

Plain `useDispatch` and `useSelector` don't know your store types. Fix that once, reuse everywhere.

1. Create `src/hooks.ts`:

   ```ts
   import { useDispatch, useSelector } from 'react-redux';
   import type { AppDispatch, RootState } from './store';

   export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
   export const useAppSelector = useSelector.withTypes<RootState>();
   ```

2. **Rule:** Always use `useAppDispatch` / `useAppSelector` in components — never import `useDispatch` / `useSelector` directly.

---

## Phase 5 — Provide the store to React

1. Open `src/App.tsx`.

2. Wrap your component tree with `Provider`:

   ```tsx
   import { Provider } from 'react-redux';
   import { store } from './store';

   export function App() {
     return (
       <Provider store={store}>
         {/* your UI */}
       </Provider>
     );
   }
   ```

3. **Checkpoint:** The app should still render. Redux is connected but no component reads state yet.

---

## Phase 6 — Connect a component

1. Create `src/features/counter/Counter.tsx`.

2. **Read state** with a selector:

   ```tsx
   const count = useAppSelector((state) => state.counter.value);
   ```

3. **Dispatch actions** on user events:

   ```tsx
   const dispatch = useAppDispatch();

   <button type="button" onClick={() => dispatch(increment())}>+</button>
   ```

4. Full component skeleton:

   ```tsx
   import { decrement, increment, reset } from './counterSlice';
   import { useAppDispatch, useAppSelector } from '../../hooks';

   export function Counter() {
     const count = useAppSelector((state) => state.counter.value);
     const dispatch = useAppDispatch();

     return (
       <div>
         <p>{count}</p>
         <button type="button" onClick={() => dispatch(decrement())}>−</button>
         <button type="button" onClick={() => dispatch(reset())}>Reset</button>
         <button type="button" onClick={() => dispatch(increment())}>+</button>
       </div>
     );
   }
   ```

5. Render `<Counter />` inside `App`.

6. **Checkpoint:** Click the buttons. The number should update. If it doesn't:
   - Is `Provider` wrapping the component?
   - Is the reducer registered under the same key you select (`counter`)?
   - Are you dispatching the exported action creators?

---

## Phase 7 — Add selectors (derived state)

Inline selectors like `(state) => state.counter.value` are fine for simple cases. For computed or reused logic, add a selectors file.

1. Create `src/features/counter/counterSelectors.ts`:

   ```ts
   import type { RootState } from '../../store';

   export const selectCounterValue = (state: RootState) => state.counter.value;

   export const selectIsPositive = (state: RootState) => state.counter.value > 0;
   ```

2. For **memoized** selectors (recompute only when inputs change), use `createSelector`:

   ```ts
   import { createSelector } from '@reduxjs/toolkit';
   import { selectCounterValue } from './counterSelectors';

   export const selectCounterLabel = createSelector(
     [selectCounterValue],
     (value) => (value === 0 ? 'Zero' : value > 0 ? 'Positive' : 'Negative'),
   );
   ```

3. Update `Counter.tsx` to use selectors instead of inline functions:

   ```tsx
   const count = useAppSelector(selectCounterValue);
   const label = useAppSelector(selectCounterLabel);
   ```

4. **Checkpoint:** Display the label next to the count. Filtering/sorting lists is where `createSelector` really pays off.

---

## Phase 8 — Add a second feature slice (recommended practice)

Repeat the pattern for a real domain. Example: a **todo list**.

### Step 8.1 — Define types

Create `src/types/todo.ts`:

```ts
export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export interface AddTodoPayload {
  text: string;
}
```

### Step 8.2 — Create the slice

Create `src/features/todos/todosSlice.ts`:

```ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AddTodoPayload, Todo } from '../../types/todo';

interface TodosState {
  items: Todo[];
  filter: 'all' | 'active' | 'completed';
}

const initialState: TodosState = {
  items: [],
  filter: 'all',
};

let nextId = 1;

export const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    addTodo(state, action: PayloadAction<AddTodoPayload>) {
      state.items.push({
        id: String(nextId++),
        text: action.payload.text,
        completed: false,
      });
    },
    toggleTodo(state, action: PayloadAction<string>) {
      const todo = state.items.find((t) => t.id === action.payload);
      if (todo) todo.completed = !todo.completed;
    },
    removeTodo(state, action: PayloadAction<string>) {
      state.items = state.items.filter((t) => t.id !== action.payload);
    },
    setFilter(state, action: PayloadAction<TodosState['filter']>) {
      state.filter = action.payload;
    },
  },
});

export const { addTodo, toggleTodo, removeTodo, setFilter } = todosSlice.actions;
export const todosReducer = todosSlice.reducer;
```

### Step 8.3 — Register in the store

Update `src/store.ts`:

```ts
import { todosReducer } from './features/todos/todosSlice';

export const store = configureStore({
  reducer: {
    counter: counterReducer,
    todos: todosReducer,
  },
});
```

### Step 8.4 — Add selectors

Create `src/features/todos/todosSelectors.ts`:

```ts
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '../../store';

export const selectAllTodos = (state: RootState) => state.todos.items;
export const selectTodoFilter = (state: RootState) => state.todos.filter;

export const selectFilteredTodos = createSelector(
  [selectAllTodos, selectTodoFilter],
  (todos, filter) => {
    if (filter === 'active') return todos.filter((t) => !t.completed);
    if (filter === 'completed') return todos.filter((t) => t.completed);
    return todos;
  },
);

export const selectActiveTodoCount = createSelector(
  [selectAllTodos],
  (todos) => todos.filter((t) => !t.completed).length,
);
```

### Step 8.5 — Build UI components

Split by responsibility (one file per concern):

| File                         | Responsibility                          |
| ---------------------------- | --------------------------------------- |
| `TodoForm.tsx`               | Input + dispatch `addTodo`              |
| `TodoFilterBar.tsx`          | Buttons dispatching `setFilter`         |
| `TodoList.tsx`               | Reads `selectFilteredTodos`, renders rows |
| `TodoItem.tsx` (optional)    | Single row: toggle + remove             |

Example dispatch in a form:

```tsx
const dispatch = useAppDispatch();
const [text, setText] = useState('');

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!text.trim()) return;
  dispatch(addTodo({ text: text.trim() }));
  setText('');
};
```

### Step 8.6 — Compose in App

```tsx
<TodoForm />
<TodoFilterBar />
<TodoList />
```

**Checkpoint:** Add todos, filter them, toggle and remove. Counter and todos should work independently — that's multiple slices in one store.

---

## Phase 9 — Async logic with `createAsyncThunk` (optional)

When state depends on an API call:

1. Create a thunk in the slice file (or a separate `todosApi.ts`):

   ```ts
   import { createAsyncThunk } from '@reduxjs/toolkit';

   export const fetchTodos = createAsyncThunk('todos/fetchTodos', async () => {
     const response = await fetch('/api/todos');
     if (!response.ok) throw new Error('Failed to fetch');
     return (await response.json()) as Todo[];
   });
   ```

2. Add extra state for loading/error:

   ```ts
   interface TodosState {
     items: Todo[];
     filter: 'all' | 'active' | 'completed';
     status: 'idle' | 'loading' | 'failed';
     error: string | null;
   }
   ```

3. Handle lifecycle in `extraReducers`:

   ```ts
   extraReducers: (builder) => {
     builder
       .addCase(fetchTodos.pending, (state) => {
         state.status = 'loading';
       })
       .addCase(fetchTodos.fulfilled, (state, action) => {
         state.status = 'idle';
         state.items = action.payload;
       })
       .addCase(fetchTodos.rejected, (state, action) => {
         state.status = 'failed';
         state.error = action.error.message ?? 'Unknown error';
       });
   },
   ```

4. Dispatch from a component on mount:

   ```tsx
   useEffect(() => {
     dispatch(fetchTodos());
   }, [dispatch]);
   ```

---

## Recommended folder structure

As the app grows, keep this layout:

```
src/
├── store.ts                 # configureStore + RootState + AppDispatch
├── hooks.ts                 # useAppDispatch, useAppSelector
├── types/                   # shared TypeScript interfaces
├── features/
│   ├── counter/
│   │   ├── counterSlice.ts
│   │   ├── counterSelectors.ts
│   │   └── Counter.tsx
│   └── todos/
│       ├── todosSlice.ts
│       ├── todosSelectors.ts
│       ├── TodoForm.tsx
│       ├── TodoList.tsx
│       └── TodoFilterBar.tsx
└── components/              # presentational / shared UI (no Redux)
```

**Convention:** Colocate slice, selectors, and feature components under `features/<name>/`.

---

## Rules of thumb

1. **One slice per domain** — `counter`, `todos`, `auth`, not one giant slice.
2. **Keep components thin** — select data, dispatch actions; put logic in reducers/selectors.
3. **Never mutate state outside reducers** — only Immer-powered reducers may write to `state`.
4. **Payload actions need types** — use `PayloadAction<T>` for action arguments.
5. **Don't store derived data** — compute it in selectors (e.g. filtered lists, counts).
6. **Local UI state stays in React** — form input text, open/closed modals, etc. don't need Redux unless shared across distant components.

---

## Final verification checklist

- [ ] `npm run dev` — app loads without console errors
- [ ] `npm run build` — TypeScript compiles cleanly
- [ ] Counter increments, decrements, and resets
- [ ] (If implemented) Todos add, filter, toggle, and remove
- [ ] Redux DevTools browser extension shows actions and state changes
- [ ] No direct imports of `useDispatch` / `useSelector` — only typed hooks

---

## Next steps

- Install [Redux DevTools](https://github.com/reduxjs/redux-devtools) and inspect each action.
- Study the `SimpleRedux` sibling project in this repo for a fuller employee-directory example with filters, selection, and stats selectors.
- Read the [Redux Style Guide](https://redux.js.org/style-guide/) for naming and architecture conventions.
