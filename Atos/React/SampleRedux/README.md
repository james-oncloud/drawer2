# Sample Redux — Slice, Reducer & Dispatch

A **project task board** built with React, Redux Toolkit, and TypeScript. It demonstrates real-world Redux patterns at a reasonable level of complexity: multiple slices, async thunks, memoized selectors, listener middleware, and typed `dispatch`/`useSelector` hooks.

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## What this demo covers

### Slice

A slice bundles **initial state**, **reducers**, and **auto-generated action creators** via `createSlice`:

| Slice | Responsibility |
|-------|----------------|
| `projectsSlice` | Project list, selection, async fetch/create |
| `tasksSlice` | Task CRUD, status transitions, loading states |
| `filtersSlice` | Search, status/priority filters, overdue toggle |
| `notificationsSlice` | Toast messages driven by side effects |

Example — synchronous reducer inside a slice:

```typescript
// features/tasks/tasksSlice.ts
advanceTaskStatus(state, action: PayloadAction<string>) {
  const task = state.items.find((t) => t.id === action.payload);
  if (!task) return;
  const flow: TaskStatus[] = ['todo', 'in_progress', 'done'];
  const nextIndex = flow.indexOf(task.status) + 1;
  if (nextIndex < flow.length) task.status = flow[nextIndex];
}
```

### Reducer

Each slice exports a **reducer** that handles both sync actions (`reducers`) and async lifecycle actions (`extraReducers`):

```typescript
// store/index.ts
export const store = configureStore({
  reducer: {
    projects: projectsReducer,   // from projectsSlice
    tasks: tasksReducer,           // from tasksSlice
    filters: filtersReducer,
    notifications: notificationsReducer,
  },
});
```

Async operations use `createAsyncThunk`, with `extraReducers` updating state on `pending` / `fulfilled` / `rejected`.

### Dispatch

Components obtain `dispatch` via the typed hook and send actions or thunks:

```typescript
const dispatch = useAppDispatch();

// Sync action from slice
dispatch(selectProject(projectId));
dispatch(advanceTaskStatus(taskId));

// Async thunk
dispatch(addTask({ projectId, title, description, priority, dueDate }));
dispatch(patchTask({ id: task.id, status: 'done' }));
```

`listenerMiddleware` in the store listens for fulfilled/rejected thunks and **dispatches** notification actions as a cross-cutting side effect.

## Architecture

```
src/
├── store/
│   ├── index.ts          # configureStore, listener middleware
│   └── hooks.ts          # useAppDispatch, useAppSelector
├── features/
│   ├── projects/         # projectsSlice + ProjectSidebar
│   ├── tasks/            # tasksSlice, selectors, TaskList/Form/Item
│   ├── filters/          # filtersSlice + FilterBar
│   └── notifications/    # notificationsSlice + NotificationToast
├── services/api.ts       # Mock API with simulated latency
└── types/index.ts
```

## Key patterns to study

1. **Typed hooks** — `useAppDispatch` / `useAppSelector` for full TypeScript inference
2. **Memoized selectors** — `createSelector` for filtered tasks and dashboard stats
3. **Immer inside reducers** — RTK lets you write "mutating" logic that stays immutable
4. **Matcher-based extraReducers** — group pending/fulfilled handlers for related thunks
5. **Listener middleware** — react to actions without coupling slices to notifications

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and production build |
| `npm run preview` | Preview production build |
