# Shelf Life — practice backlog

Use these as **self-paced exercises** to refresh React: implement in the existing `shelf-life` app, keep commits small, and note which hooks or patterns you used.

Difficulty is relative; “medium” usually means more state, edge cases, or a new boundary (context, route, or test).

---

## Simple features

1. **Search / name filter** — Text input that filters the shelf list by substring (case-insensitive). Combine with existing category filter (`useMemo` practice).

2. **“Clear all used”** — Button that removes every item marked as used in one action (`useReducer` new action or filter + dispatch loop).

3. **Undo last action** — Keep a one-step undo stack for add/remove/toggle (simple array or ref + `useState`).

4. **Item count in document title** — `useEffect` syncing `document.title` with active item count, e.g. `Shelf Life (5)`.

5. **Keyboard shortcut** — Focus the “Add item” name field on `/` or `n` (global `keydown` listener with cleanup in `useEffect`).

6. **Export / import JSON** — Buttons to download `items` as `.json` and a file input to merge or replace from file (no backend; `FileReader`).

7. **Inline edit** — Click a row name to edit in place; Enter saves, Escape cancels (`useState` for “editing id”).

8. **Empty-state CTA** — When the filtered list is empty, show different copy if the global list is non-empty vs truly empty (derived boolean).

9. **Relative date labels** — Show “in 2 days” / “3 days ago” next to best-by using a tiny formatter (pure function + `useMemo` per row or parent).

10. **Accessibility pass** — Ensure list is a proper region, announce additions with a live region, and verify focus order after add/remove.

---

## Medium-sized features

1. **Multi-location shelves** — Tabs or dropdown: “Fridge”, “Pantry”, “Freezer”; each has its own item list. Persist structure in `localStorage` (nested state or normalized map by `locationId`).

2. **Recipes mode (lazy route or tab)** — Second “page” or panel: link pantry items to a simple recipe (name + ingredient ids). Use **`React.lazy` + `Suspense`** or a minimal client router; practice lifting recipe state or a small second reducer.

3. **Custom hook `usePantry()`** — Move reducer + persistence + derived `visibleItems` into `hooks/usePantry.ts`; `App` becomes mostly layout. Document the public API of the hook.

4. **`useReducer` + middleware-style logging** — Wrap dispatch to log actions in dev (or to `sessionStorage` ring buffer) without changing reducer purity.

5. **Optimistic UI + simulated API** — Replace “instant” add with `async` fake delay (`setTimeout` / `fetch` to `jsonplaceholder`); show pending state and rollback on “failure” (`useTransition` or local pending ids).

6. **Drag-and-drop reorder** — Reorder items within the current sort view; persist order (may need an explicit `order` or `sortOrder` field on items when sort is “custom”).

7. **Notification toasts** — Context or small event bus: “Added yogurt”, “Removed tomatoes”; auto-dismiss with `useEffect` timers; stack multiple toasts.

8. **Unit tests (Vitest + RTL)** — Test reducer transitions, `AddItemForm` submit, and filter logic. Medium because of tooling setup and async queries.

9. **PWA-lite** — Add a web app manifest and a minimal service worker (Vite PWA plugin or manual); cache shell only; verify offline banner.

10. **Theming v2** — Three themes or CSS variables from a `theme` object; **`useContext`** + `useMemo` for token object; optional system preference with manual override (`matchMedia`).

---

## Suggested order

Start with **search**, **document title**, and **relative dates** (mostly `useMemo` / `useEffect`). Then **undo** or **multi-location** for state design. Finish with **custom hook extraction** or **tests** to solidify structure.

---

## Done?

When you finish a task, add a checkbox line under a new “Completed” section at the bottom of this file, or track however you prefer (GitHub issues, etc.).

## Completed
- 
