## 🔹 Core Concepts (must know)

* **Components** → functional & class (focus on functional)
* **JSX** → HTML-like syntax compiled to JS
* **Props** → immutable inputs
* **State (`useState`)** → internal mutable data
* **Event handling** → onClick, onChange, etc.
* **Conditional rendering** → ternary / &&
* **Lists & keys** → efficient rendering

---

## 🔹 Rendering & Performance

* **Virtual DOM** → diffing + reconciliation
* **Reconciliation algorithm**
* **Keys importance** in list rendering
* **Memoization**

  * `React.memo`
  * `useMemo`
  * `useCallback`
* **Avoid unnecessary re-renders**

---

## 🔹 Hooks (critical)

* `useState` → state
* `useEffect` → side effects
* `useContext` → global state
* `useReducer` → complex state logic
* `useRef` → DOM + mutable values
* `useLayoutEffect` → sync DOM updates

👉 Know **rules of hooks**

---

## 🔹 Component Communication

* Parent → child (props)
* Child → parent (callbacks)
* Sibling → lifting state up
* Global → Context API

---

## 🔹 Forms & User Input

* Controlled components
* Uncontrolled components
* Form validation patterns

---

## 🔹 Routing

* Client-side routing with **React Router**

  * Routes
  * Params
  * Navigation
  * Nested routes

---

## 🔹 State Management (beyond basics)

* Context API (built-in)
* External:

  * Redux / Redux Toolkit
  * Zustand / Recoil

👉 Know when to use each

---

## 🔹 Side Effects & Data Fetching

* API calls (`fetch`, axios)
* Handling loading / error states
* Cleanup functions in `useEffect`
* Async patterns

---

## 🔹 Lifecycle (via Hooks)

Equivalent understanding of:

* Mount → `useEffect`
* Update → dependencies
* Unmount → cleanup

---

## 🔹 Performance Optimisation

* Code splitting (`React.lazy`, `Suspense`)
* Lazy loading components
* Debouncing / throttling
* Avoid prop drilling
* Proper key usage

---

## 🔹 Advanced Concepts

* **Custom hooks** → reusable logic
* **Higher Order Components (HOC)**
* **Render props pattern**
* **Portals** → render outside DOM tree
* **Error boundaries**
* **Refs & forwardRef**

---

## 🔹 React Architecture Patterns

* Container vs Presentational
* Feature-based folder structure
* Atomic design (atoms → molecules → organisms)

---

## 🔹 Ecosystem (very important)

* **Next.js** → SSR / SSG
* **Vite / Webpack** → bundling
* **Testing**

  * Jest
  * React Testing Library
* **Styling**

  * CSS modules
  * Styled-components
  * Tailwind

---

## 🔹 Modern React (expected in interviews)

* Functional components only
* Hooks over classes
* Declarative patterns
* Immutability mindset

---

## 🔹 Mental Models (high value)

* **UI = f(state)**
* **Single source of truth**
* **One-way data flow**
* **Component re-render = function re-run**

---

If you want, I can turn this into a **React interview cheat sheet (top 20 questions + answers)** or a **real project structure blueprint**.
