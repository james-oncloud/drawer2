# RTL Mocking Examples

A complete **React 19 + TypeScript** reference project that demonstrates every common mocking pattern used alongside [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) (RTL).

React Testing Library does not ship its own mocking utilities. Instead, you combine RTL with a test runner — this project uses **[Vitest](https://vitest.dev/)** with `vi.*` APIs. The same patterns apply to **Jest** by swapping `vi` for `jest`.

All **22 tests pass** across **13 isolated test files**, each focused on one mocking technique.

---

## Quick start

```bash
# Install dependencies
npm install

# Run all tests once
npm test

# Watch mode during development
npm test:watch

# Optional: run the demo app
npm run dev
```

---

## Tech stack

| Tool | Purpose |
|------|---------|
| [React 19](https://react.dev/) | UI components under test |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe tests and source |
| [Vite](https://vite.dev/) | Dev server and build |
| [Vitest](https://vitest.dev/) | Test runner, mocks, fake timers |
| [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) | Render components and query the DOM |
| [@testing-library/user-event](https://testing-library.com/docs/user-event/intro/) | Realistic user interactions |
| [@testing-library/jest-dom](https://github.com/testing-library/jest-dom) | DOM matchers (`toBeInTheDocument`, etc.) |
| [MSW](https://mswjs.io/) | HTTP request interception |
| [jsdom](https://github.com/jsdom/jsdom) | Browser-like test environment |

---

## Project structure

```
Atos/React/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts          # Vite + Vitest configuration
└── src/
    ├── main.tsx            # App entry point
    ├── App.tsx
    ├── components/         # Components exercised by tests
    │   ├── AuthenticatedGreeting.tsx
    │   ├── Dashboard.tsx
    │   ├── ExpensiveChart.tsx
    │   ├── SearchBox.tsx
    │   ├── TimerDisplay.tsx
    │   └── UserProfile.tsx
    ├── context/
    │   └── AuthContext.tsx
    ├── hooks/
    │   └── useUser.ts
    ├── services/
    │   ├── api.ts
    │   ├── analytics.ts
    │   └── __mocks__/
    │       └── analytics.ts    # Manual mock (pattern 4)
    ├── test/
    │   ├── setup.ts            # Global test setup (MSW lifecycle)
    │   ├── renderWithAuth.tsx  # Custom render helper (pattern 10)
    │   └── mocks/
    │       └── server.ts       # Default MSW handlers
    └── __tests__/
        └── mocking/            # One file per mocking pattern
            ├── 01-mock-functions.test.tsx
            ├── 02-full-module-mock.test.tsx
            ├── 03-partial-module-mock.test.tsx
            ├── 04-manual-mock.test.tsx
            ├── 05-spy-on.test.tsx
            ├── 06-global-fetch-mock.test.tsx
            ├── 07-msw.test.tsx
            ├── 08-fake-timers.test.tsx
            ├── 09-child-component-mock.test.tsx
            ├── 10-context-mock.test.tsx
            ├── 11-browser-api-mocks.test.ts
            ├── 12-env-mocks.test.ts
            └── 13-vi-mocked.test.ts
```

---

## Test configuration

Vitest is configured in `vite.config.ts`:

```ts
test: {
  globals: true,                        // describe, it, expect, vi available globally
  environment: 'jsdom',                 // DOM APIs in Node
  setupFiles: ['./src/test/setup.ts'],  // MSW + jest-dom matchers
  css: true,
}
```

`src/test/setup.ts` starts the MSW server before all tests and resets handlers after each test:

```ts
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

Unhandled network requests fail tests, which encourages explicit mocking rather than accidental real HTTP calls.

---

## Mocking patterns

Each pattern lives in its own test file so `vi.mock` calls do not leak between suites. Vitest hoists `vi.mock` to the top of a file — keeping mocks isolated per file is a key practice demonstrated here.

### 1. Mock functions — `vi.fn()`

**File:** `src/__tests__/mocking/01-mock-functions.test.tsx`

Use mock functions for callbacks, event handlers, and props. Assert invocations with `toHaveBeenCalled`, `toHaveBeenCalledWith`, and `toHaveBeenCalledOnce`.

```ts
const onSearch = vi.fn();
render(<SearchBox onSearch={onSearch} />);
await waitFor(() => expect(onSearch).toHaveBeenCalledWith(''));
```

Also demonstrates `mockImplementation` for custom return values.

---

### 2. Full module mock — `vi.mock()`

**File:** `src/__tests__/mocking/02-full-module-mock.test.tsx`

Replace an entire module — commonly used to mock custom hooks:

```ts
vi.mock('../../hooks/useUser', () => ({
  useUser: vi.fn(() => ({
    user: { id: '1', name: 'Mocked User', email: 'mock@example.com' },
    loading: false,
    error: null,
  })),
}));
```

The component renders with mocked data and never touches the network.

---

### 3. Partial module mock — `importOriginal`

**File:** `src/__tests__/mocking/03-partial-module-mock.test.tsx`

Keep real exports and override only what you need:

```ts
vi.mock('../../services/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../services/api')>();
  return {
    ...actual,
    fetchUser: vi.fn().mockResolvedValue({ /* ... */ }),
    // updateUserName remains real and is served by MSW
  };
});
```

---

### 4. Manual mocks — `__mocks__/` directory

**Files:**
- `src/__tests__/mocking/04-manual-mock.test.tsx`
- `src/services/__mocks__/analytics.ts`

Call `vi.mock('../../services/analytics')` with no factory function. Vitest automatically loads the hand-written mock from `src/services/__mocks__/analytics.ts`.

Useful for side-effect modules (analytics, logging) that you want to silence consistently across many tests.

---

### 5. `vi.spyOn` — stub a single method

**File:** `src/__tests__/mocking/05-spy-on.test.tsx`

Observe or replace one method without mocking the whole module:

```ts
const fetchSpy = vi.spyOn(api, 'fetchUser').mockResolvedValue({
  id: '7',
  name: 'Spy User',
  email: 'spy@example.com',
});

// After the test:
vi.restoreAllMocks();
```

Also demonstrates spying on `console.log`.

---

### 6. Global `fetch` mock

**File:** `src/__tests__/mocking/06-global-fetch-mock.test.tsx`

A quick inline stub when you only need to fake one or two responses:

```ts
globalThis.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ id: '5', name: 'Fetch Mock', email: 'fetch@example.com' }),
} as Response);
```

Restore the original `fetch` in `afterEach`. For most API testing, prefer MSW (pattern 7).

---

### 7. MSW — Mock Service Worker

**Files:**
- `src/__tests__/mocking/07-msw.test.tsx`
- `src/test/mocks/server.ts`
- `src/test/setup.ts`

MSW intercepts HTTP at the network layer, making tests closer to production than stubbing `fetch` directly.

Default handlers return a user profile from `https://api.example.com`. Per-test overrides use `server.use()`:

```ts
server.use(
  http.get('https://api.example.com/users/:userId', () =>
    HttpResponse.json({ id: '404', name: 'Override', email: 'override@example.com' }),
  ),
);
```

Also demonstrates simulating HTTP error responses.

---

### 8. Fake timers — `vi.useFakeTimers()`

**File:** `src/__tests__/mocking/08-fake-timers.test.tsx`

Control `setTimeout`, `setInterval`, and debounced logic without waiting in real time.

```ts
vi.useFakeTimers();

fireEvent.change(screen.getByRole('textbox', { name: /search/i }), {
  target: { value: 'rtl' },
});

act(() => {
  vi.advanceTimersByTime(300);
});

vi.useRealTimers();
```

**Tips:**
- Wrap timer advances in `act()` when React state updates are involved.
- Prefer `fireEvent` over `userEvent` when fake timers are active — `userEvent` can hang waiting on real time.

---

### 9. Child component mock

**File:** `src/__tests__/mocking/09-child-component-mock.test.tsx`

Replace heavy or unrelated children to keep parent tests fast and focused:

```ts
vi.mock('../../components/ExpensiveChart', () => ({
  ExpensiveChart: () => <div data-testid="chart-stub">Chart stub</div>,
}));
```

`Dashboard` is tested without mounting the real chart implementation.

---

### 10. Context provider mocking — custom render helper

**Files:**
- `src/__tests__/mocking/10-context-mock.test.tsx`
- `src/test/renderWithAuth.tsx`

Instead of mocking context modules, wrap components in a test provider with controlled values:

```ts
renderWithAuth(<AuthenticatedGreeting />);
renderWithAuth(<AuthenticatedGreeting />, {
  auth: { isAuthenticated: false, username: null },
});
```

This pattern keeps tests aligned with how the app actually provides context.

---

### 11. Browser API mocks — `vi.stubGlobal`

**File:** `src/__tests__/mocking/11-browser-api-mocks.test.ts`

jsdom does not implement every browser API. Stub globals when components depend on them:

| API | Approach |
|-----|----------|
| `localStorage` | `vi.stubGlobal('localStorage', { getItem, setItem, ... })` |
| `window.matchMedia` | `vi.stubGlobal('matchMedia', vi.fn().mockImplementation(...))` |
| `IntersectionObserver` | `vi.stubGlobal('IntersectionObserver', MockClass)` |

Call `vi.unstubAllGlobals()` in `afterEach` to clean up.

---

### 12. Environment variable mocking

**File:** `src/__tests__/mocking/12-env-mocks.test.ts`

Stub Vite env vars and re-import modules so `import.meta.env` is read fresh:

```ts
vi.stubEnv('VITE_API_URL', 'https://custom.api.test');
vi.stubGlobal('fetch', fetchMock);
vi.resetModules();

const { fetchUser } = await import('../../services/api');
await fetchUser('1');
```

Clean up with `vi.unstubAllEnvs()` and `vi.resetModules()`.

---

### 13. Typed mocks — `vi.mocked()`

**File:** `src/__tests__/mocking/13-vi-mocked.test.ts`

Narrows a mock to Vitest's `Mock` type for type-safe assertions in TypeScript:

```ts
const handler = vi.fn((value: string) => value.toUpperCase());
const mocked = vi.mocked(handler);

expect(mocked.mock.results[0]?.value).toBe('HELLO');
```

---

## Sample components

The components exist to give each mock pattern something realistic to exercise:

| Component | Used to demonstrate |
|-----------|---------------------|
| `SearchBox` | `vi.fn` callbacks, debounce + fake timers |
| `UserProfile` | Hook mocks, API mocks, MSW, `spyOn` |
| `TimerDisplay` | `setInterval` + fake timers |
| `Dashboard` / `ExpensiveChart` | Child component mocking |
| `AuthenticatedGreeting` | Context provider overrides |

---

## Vitest vs Jest cheat sheet

| Vitest | Jest |
|--------|------|
| `vi.fn()` | `jest.fn()` |
| `vi.mock()` | `jest.mock()` |
| `vi.spyOn()` | `jest.spyOn()` |
| `vi.mocked()` | `jest.mocked()` |
| `vi.useFakeTimers()` | `jest.useFakeTimers()` |
| `vi.stubGlobal()` | Assign to `global` / `globalThis` |
| `vi.stubEnv()` | `process.env.X = '...'` |
| `importOriginal` in `vi.mock` | `jest.requireActual` |

---

## Best practices

1. **Isolate `vi.mock` per file** — mocks are hoisted and apply to the entire file. Split suites when techniques would conflict.
2. **Prefer MSW for HTTP** — more realistic than stubbing `fetch`, and handlers are reusable.
3. **Prefer provider wrappers over mocking context modules** — tests stay closer to production wiring.
4. **Restore spies and globals in `afterEach`** — use `vi.restoreAllMocks()` and `vi.unstubAllGlobals()`.
5. **Use `act()` with fake timers** — React state updates from timer callbacks need to flush inside `act()`.
6. **Query like a user** — use `screen.getByRole`, `getByLabelText`, etc. Mocks replace dependencies; RTL queries replace implementation-detail selectors.

---

## npm scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Type-check and production build |
| `npm test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

---

## Further reading

- [React Testing Library — Mocking](https://testing-library.com/docs/react-testing-library/faq/#how-do-i-mock)
- [Vitest — Mocking](https://vitest.dev/guide/mocking.html)
- [MSW — Getting started](https://mswjs.io/docs/getting-started)
- [Kent C. Dodds — Write fewer, longer tests](https://kentcdodds.com/blog/write-fewer-longer-tests)
