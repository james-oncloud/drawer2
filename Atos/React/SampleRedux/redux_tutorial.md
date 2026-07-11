# Redux Tutorial — A Slow, Step-by-Step Guide

This guide explains how Redux works using the **SampleRedux** project in this folder. You do not need to understand everything at once. Read one section, pause, then look at the matching file in the codebase.

---

## Part 1: The problem Redux solves

Imagine a React app with many screens and components:

- A sidebar shows the list of projects
- The main area shows tasks for the selected project
- A filter bar controls what tasks are visible
- Toast messages appear when something succeeds or fails

Without Redux, each component might keep its own copy of data, or you pass props down through many layers ("prop drilling"). That gets messy quickly.

**Redux gives you one central place to keep application data** — called the **store**. Any component can:

1. **Read** data from the store
2. **Request a change** by sending an **action**
3. Let a **reducer** decide how the data should update

Think of it like a bank:

| Bank idea | Redux idea |
|-----------|------------|
| The vault holding all accounts | The **store** (all app state) |
| A deposit slip saying "add £50" | An **action** (a plain object describing what happened) |
| The bank clerk who applies the rule | A **reducer** (a function that returns new state) |
| You handing in the slip | **Dispatch** (sending the action to the store) |

---

## Part 2: The four core ideas

Redux has four ideas. Learn them in this order.

### 1. State

**State** is just data — a JavaScript object describing your app right now.

In our project, the store holds several pieces of state combined together:

```text
{
  projects: { items: [...], selectedId: "proj-1", status: "succeeded", ... },
  tasks:    { items: [...], status: "succeeded", ... },
  filters:  { search: "", status: "all", priority: "all", ... },
  notifications: { items: [...] }
}
```

You never edit this object directly in a component. Redux owns it.

**Where to look:** `src/store/index.ts` — see how `projects`, `tasks`, `filters`, and `notifications` are combined.

---

### 2. Action

An **action** is a small plain object that describes *what happened*. It always has a `type` field.

Example (simplified):

```javascript
{ type: 'filters/setSearch', payload: 'hero' }
```

Actions do not change state themselves. They are just messages.

**Two kinds of actions in this project:**

| Kind | Example | When used |
|------|---------|-----------|
| Synchronous | `advanceTaskStatus(taskId)` | Instant UI change |
| Async (thunk) | `addTask({ title, ... })` | Needs API call first |

**Where to look:** `src/features/filters/filtersSlice.ts` — see `setSearch`, `setStatusFilter`, etc. These are auto-created when you define a slice.

---

### 3. Reducer

A **reducer** is a function:

```text
(previousState, action) => newState
```

It reads the current state and the action, then returns the **next** state.

Important rules:

- Reducers must be **pure** — no randomness, no direct API calls inside the reducer
- Reducers must **not mutate** the old state (Redux Toolkit uses Immer so you *can* write `state.items.push(...)` safely — it still produces a new object behind the scenes)

**Where to look:** `src/features/tasks/tasksSlice.ts`

There are two places reducers live inside a slice:

1. **`reducers`** — for simple, synchronous updates:

```typescript
advanceTaskStatus(state, action) {
  const task = state.items.find((t) => t.id === action.payload);
  // ... move task to next status
}
```

2. **`extraReducers`** — for async actions (thunks) that have `pending`, `fulfilled`, and `rejected` stages:

```typescript
.addCase(fetchTasks.pending, (state) => {
  state.status = 'loading';
})
.addCase(fetchTasks.fulfilled, (state, action) => {
  state.status = 'succeeded';
  state.items = action.payload;
})
```

---

### 4. Store

The **store** is the object that:

- Holds the current state
- Lets you read state with `store.getState()`
- Lets you send actions with `store.dispatch(action)`
- Runs reducers whenever an action is dispatched

**Where to look:** `src/store/index.ts`

```typescript
export const store = configureStore({
  reducer: {
    projects: projectsReducer,
    tasks: tasksReducer,
    filters: filtersReducer,
    notifications: notificationsReducer,
  },
});
```

`configureStore` (from Redux Toolkit) creates the store and wires up all reducers into one tree.

---

## Part 3: Dispatch — how changes actually happen

**Dispatch** is the function you call when you want something to change.

```typescript
dispatch(someAction)
```

Here is the full journey, step by step:

```text
  User clicks "Delete" button
           │
           ▼
  Component calls:  dispatch(removeTask(taskId))
           │
           ▼
  Redux runs the async thunk (calls the API)
           │
           ▼
  When API finishes, Redux dispatches:  tasks/remove/fulfilled
           │
           ▼
  tasksReducer runs → returns new state (task removed from list)
           │
           ▼
  Store updates
           │
           ▼
  React components subscribed to that state re-render
```

**Where to look:** `src/features/tasks/TaskItem.tsx`

```typescript
const dispatch = useAppDispatch();

// Sync action — instant
dispatch(advanceTaskStatus(task.id));

// Async thunk — goes to API first
dispatch(removeTask(task.id));
dispatch(patchTask({ id: task.id, status: 'done' }));
```

---

## Part 4: How Redux connects to React

React and Redux are separate libraries. **react-redux** connects them.

### Step 1 — Wrap the app in `<Provider>`

The Provider makes the store available to every component below it.

**File:** `src/App.tsx`

```tsx
<Provider store={store}>
  <TaskBoard />
</Provider>
```

### Step 2 — Read state with `useSelector`

```typescript
const tasks = useAppSelector((state) => state.tasks.items);
```

This means: "Give me `tasks.items` from the store. Re-render me when it changes."

We use `useAppSelector` instead of plain `useSelector` so TypeScript knows the shape of `state`.

**File:** `src/store/hooks.ts`

### Step 3 — Send actions with `useDispatch`

```typescript
const dispatch = useAppDispatch();
dispatch(setSearch('design'));
```

Again, `useAppDispatch` is the typed version for this project.

---

## Part 5: What is a Slice?

A **slice** is Redux Toolkit's way of bundling everything for one feature into one file:

| Piece | What it is |
|-------|------------|
| `initialState` | Starting data |
| `reducers` | Sync update functions |
| `extraReducers` | Handlers for async thunks |
| Auto-generated actions | e.g. `advanceTaskStatus` |
| Exported reducer | Plugged into the store |

**File:** `src/features/tasks/tasksSlice.ts`

```typescript
const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: { /* sync handlers */ },
  extraReducers(builder) { /* async handlers */ },
});

export const { advanceTaskStatus } = tasksSlice.actions;  // actions
export default tasksSlice.reducer;                         // reducer
```

You do **not** manually write action types like `'tasks/advanceTaskStatus'`. `createSlice` creates them for you.

---

## Part 6: Async data — thunks

Sometimes you need to call an API before updating state. Redux Toolkit provides **`createAsyncThunk`**.

**File:** `src/features/tasks/tasksSlice.ts`

```typescript
export const fetchTasks = createAsyncThunk(
  'tasks/fetchAll',
  () => api.fetchTasks()
);
```

When you `dispatch(fetchTasks())`, Redux automatically dispatches three actions over time:

```text
tasks/fetchAll/pending     →  reducer sets status = 'loading'
tasks/fetchAll/fulfilled   →  reducer sets items = data from API
tasks/fetchAll/rejected    →  reducer sets status = 'failed', error = message
```

You handle all three in `extraReducers`.

**File:** `src/services/api.ts` — mock API with a small delay so you can see loading states in the UI.

---

## Part 7: Selectors — reading derived data

A **selector** is a function that picks data out of the store. Sometimes it also **computes** something from raw state.

Simple selector:

```typescript
const tasks = useAppSelector((state) => state.tasks.items);
```

Memoized selector (only recalculates when inputs change):

**File:** `src/features/tasks/tasksSelectors.ts`

```typescript
export const selectFilteredTasks = createSelector(
  [selectAllTasks, selectFiltersState, selectSelectedProjectId],
  (tasks, filters, selectedProjectId) => {
    // return tasks matching search, status, priority, project...
  }
);
```

Use selectors when:

- The same filtering logic is needed in multiple components
- You want to avoid repeating complex logic in every component

---

## Part 8: Walk through one complete example

Let's trace what happens when you type in the search box.

### Step 1 — User types "hero"

**File:** `src/features/filters/FilterBar.tsx`

```tsx
onChange={(e) => dispatch(setSearch(e.target.value))}
```

### Step 2 — Action is created and dispatched

Redux Toolkit creates an action like:

```javascript
{ type: 'filters/setSearch', payload: 'hero' }
```

### Step 3 — Reducer runs

**File:** `src/features/filters/filtersSlice.ts`

```typescript
setSearch(state, action) {
  state.search = action.payload;  // now "hero"
}
```

### Step 4 — Store updates

The `filters` branch of state changes. The `tasks` branch is untouched.

### Step 5 — Components re-render

`TaskList` uses `selectFilteredTasks`, which reads both `tasks.items` and `filters.search`. It recalculates the visible list and only shows tasks whose title or description contains "hero".

**No prop drilling. No local state in the parent. One source of truth.**

---

## Part 9: Walk through an async example

User clicks **Delete** on a task.

### Step 1 — Dispatch the thunk

```typescript
dispatch(removeTask(task.id));
```

### Step 2 — `pending` action fires

Reducer sets `mutationStatus = 'loading'` (buttons can show "Saving…").

### Step 3 — API call runs

**File:** `src/services/api.ts` — `deleteTask(taskId)` removes the task from the mock database.

### Step 4 — `fulfilled` action fires

Reducer removes the task from `state.items`.

### Step 5 — Listener middleware reacts

**File:** `src/store/index.ts`

A listener watches for `removeTask.fulfilled` and dispatches a notification:

```typescript
pushNotification({ message: 'Task deleted', type: 'info' })
```

This is a side effect — it happens *outside* the reducer, which stays pure.

### Step 6 — UI updates

- Task disappears from the list
- Toast appears at the bottom of the screen

---

## Part 10: Project map — where everything lives

```text
src/
├── store/
│   ├── index.ts       ← The store (combine reducers, middleware)
│   └── hooks.ts       ← useAppDispatch, useAppSelector
│
├── features/
│   ├── projects/
│   │   ├── projectsSlice.ts    ← Slice + reducer + thunks
│   │   └── ProjectSidebar.tsx  ← dispatch(selectProject), dispatch(createProject)
│   │
│   ├── tasks/
│   │   ├── tasksSlice.ts       ← Slice + reducer + thunks
│   │   ├── tasksSelectors.ts   ← Memoized selectors
│   │   ├── TaskList.tsx        ← useAppSelector(selectFilteredTasks)
│   │   ├── TaskItem.tsx        ← dispatch(patchTask), dispatch(removeTask)
│   │   └── TaskForm.tsx        ← dispatch(addTask)
│   │
│   ├── filters/
│   │   ├── filtersSlice.ts     ← Slice + reducer (sync only)
│   │   └── FilterBar.tsx       ← dispatch(setSearch), etc.
│   │
│   └── notifications/
│       ├── notificationsSlice.ts
│       └── NotificationToast.tsx
│
├── services/api.ts    ← Fake backend (not Redux — just async functions)
└── App.tsx            ← <Provider store={store}>
```

---

## Part 11: Rules to remember

1. **State lives in the store** — not scattered across components
2. **Components dispatch actions** — they do not edit state directly
3. **Reducers decide the new state** — based on the previous state and the action
4. **Reducers stay pure** — no API calls, no `Date.now()` surprises
5. **Side effects go elsewhere** — API calls in thunks; toasts in listener middleware
6. **One direction of data flow:**

```text
UI event  →  dispatch(action)  →  reducer  →  new state  →  UI re-renders
```

---

## Part 12: Glossary

| Term | Plain English |
|------|---------------|
| **Store** | The single object holding all app data |
| **State** | The current data inside the store |
| **Action** | A message describing what happened (`{ type, payload }`) |
| **Dispatch** | Send an action to the store |
| **Reducer** | Function that returns new state after an action |
| **Slice** | A feature bundle: state + reducers + actions |
| **Thunk** | An async action creator (API call, then update state) |
| **Selector** | Function to read (or compute) data from state |
| **Provider** | React component that shares the store with the tree |
| **Middleware** | Code that runs between dispatch and the reducer (e.g. listeners) |

---

## Part 13: Suggested learning order

Work through the project in this order:

1. Read `src/store/index.ts` — see how the store is built
2. Read `src/features/filters/filtersSlice.ts` — simplest slice (sync only)
3. Read `src/features/filters/FilterBar.tsx` — see dispatch + selector in a component
4. Read `src/features/tasks/tasksSlice.ts` — add async thunks and extraReducers
5. Read `src/features/tasks/TaskItem.tsx` — dispatch both sync and async actions
6. Read `src/features/tasks/tasksSelectors.ts` — derived data with createSelector
7. Run `npm run dev` and click around while watching Redux DevTools (install the browser extension)

---

## Part 14: Try it yourself — small exercises

1. **Add a "Clear search" button** in `FilterBar` that dispatches `setSearch('')`.
2. **Log every action** — add a middleware in `store/index.ts` that `console.log`s each action type.
3. **Add a new filter** — e.g. "show only high priority" — new field in `filtersSlice`, new reducer, wire it in `selectFilteredTasks`.
4. **Watch loading state** — dispatch `fetchTasks()` and notice `status` go from `idle` → `loading` → `succeeded`.

---

## Summary in one paragraph

Redux keeps all your important application data in one **store**. When something happens in the UI, a component **dispatches** an **action**. A **reducer** receives that action and returns the next **state**. React components **select** the pieces of state they need and re-render when it changes. **Slices** (via Redux Toolkit) group state, reducers, and actions per feature. **Thunks** handle async work like API calls. **Selectors** read and compute data efficiently. That is the whole loop — everything else in this project is a variation on those same steps.
