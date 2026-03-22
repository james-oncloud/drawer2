Here are the main **state management options, methods, and tools** used in React apps.

## 1. Built into React

### Component-local state

* `useState`
* `useReducer`

Use this for state that belongs to one component or one small subtree. React’s docs position `useState` as the basic hook for local state, and `useReducer` as the better fit when update logic gets more complex or needs to be centralized. ([React][1])

### Shared tree state

* `useContext`
* `Context + useReducer`

Use this when multiple components in the same area need the same state, such as theme, auth, current user, locale, or form wizard state. React documents Context as a way to pass data deeply without prop drilling, and explicitly shows combining Context with reducers for larger screens/features. ([React][2])

### Other simple methods

* Prop drilling
* Lifting state up
* Custom hooks wrapping state logic

These are still valid and often best before introducing a library. React’s state guidance emphasizes organizing state well and sharing it intentionally as apps grow. ([React][3])

---

## 2. Client-state libraries

These manage **UI/client state** such as filters, selected items, sidebars, wizards, form state, optimistic UI flags, and cross-page app state.

### Redux Toolkit

* Best for large apps
* Predictable, structured, team-friendly
* Good when you want devtools, strict patterns, middleware, and scalable architecture

Redux Toolkit is the official recommended way to write Redux today and includes utilities for store setup, reducers, and async workflows. ([redux-toolkit.js.org][4])

### Zustand

* Minimal API
* Very low boilerplate
* Good for small to medium apps, dashboards, admin tools, and apps wanting simple global state

Zustand describes itself as a small, fast, scalable hook-based state solution. ([Zustand Documentation][5])

### Other client-state tools you may encounter

* Recoil
* Jotai
* MobX
* XState
* Valtio

These are valid options, but the most common modern choices are usually:

* built-in React state
* Redux Toolkit
* Zustand

---

## 3. Server-state tools

This is separate from client state. Server state means data that comes from APIs and needs fetching, caching, refetching, invalidation, background refresh, and mutation handling.

### TanStack Query

* Great for API data
* Handles caching, retries, refetching, invalidation, mutations, pagination
* Often the default choice for React apps that talk to backends

TanStack Query’s docs explicitly position it as a tool for managing async server state. ([TanStack][6])

### RTK Query

* Best when you already use Redux Toolkit
* Integrates server-state fetching/caching into Redux apps

Redux Toolkit documents RTK Query as a purpose-built data fetching and caching solution included in `@reduxjs/toolkit`. ([redux-toolkit.js.org][7])

---

## 4. Specialized state areas

### Form state

Tools:

* React Hook Form
* Formik
* Final Form

Used for:

* validation
* touched/dirty tracking
* nested form data
* submission lifecycle

### URL state

Methods/tools:

* React Router search params
* path params
* query string syncing

Used for:

* filters
* pagination
* tab selection
* shareable app state

### Cache / normalized entity state

Tools:

* Redux Toolkit entity adapters
* Apollo Client cache
* Relay cache

Used when:

* the same entities appear in many views
* you need efficient updates across screens

### Finite state / workflow state

Tools:

* XState
* reducer-driven state machines

Used for:

* multi-step flows
* async workflows
* complex UI transitions
* explicit state modeling

---

## 5. Common state management methods

These are the main **approaches** regardless of tool:

### Local component state

State lives in the component that owns it.

### Lifted state

Move state to the nearest common parent and pass it down.

### Context-based shared state

Put state in a provider and consume it deeper in the tree.

### Reducer-based state

Represent updates as actions and handle them centrally.

### Store-based global state

Use a global store outside component trees.

### Server cache state

Let a library own remote data lifecycle.

### State machine/event-driven state

Model UI as explicit states and transitions.

---

## 6. Practical recommendation ladder

A sensible order is:

1. `useState` for simple local state
2. `useReducer` when logic gets complex
3. `useContext` for shared feature/app state
4. Zustand for simple global client state
5. Redux Toolkit for large, structured apps
6. TanStack Query or RTK Query for API/server state

---

## 7. What most React apps use in practice

Very commonly:

* **Small app:** `useState` + `useContext`
* **Medium app:** `useState` + `useContext` + Zustand
* **API-heavy app:** React state + TanStack Query
* **Large enterprise app:** Redux Toolkit + RTK Query
* **Complex workflows:** add XState selectively

---

## 8. Best rule of thumb

Treat these as **different categories**, not competitors:

* **Local UI state** → `useState` / `useReducer`
* **Shared client state** → Context / Zustand / Redux Toolkit
* **Server state** → TanStack Query / RTK Query
* **Form state** → React Hook Form
* **Navigation state** → Router / URL

That separation usually leads to the cleanest React architecture. ([React][3])

I can also turn this into a **comparison table with pros, cons, and when to use each**.

[1]: https://react.dev/reference/react/useState?utm_source=chatgpt.com "useState"
[2]: https://react.dev/reference/react/useContext?utm_source=chatgpt.com "useContext"
[3]: https://react.dev/learn/managing-state?utm_source=chatgpt.com "Managing State"
[4]: https://redux-toolkit.js.org/?utm_source=chatgpt.com "Redux Toolkit | Redux Toolkit"
[5]: https://zustand.docs.pmnd.rs/?utm_source=chatgpt.com "Zustand: Introduction"
[6]: https://tanstack.com/query/v5/docs/react/overview?utm_source=chatgpt.com "Overview | TanStack Query React Docs"
[7]: https://redux-toolkit.js.org/rtk-query/overview?utm_source=chatgpt.com "RTK Query Overview"
