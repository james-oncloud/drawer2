# sample_hr — Idiomatic TypeScript

A small **People directory** (HR) app built with **React 19**, **Vite 8**, and **TypeScript 6**.  
The product features are intentionally simple; the goal is to learn **idiomatic TypeScript style** by reading real application code.

Companion notes in this folder:

- [README_TS_TYPES.md](./README_TS_TYPES.md) — how the TypeScript type system works (with app examples)
- [typescript-react-patterns.md](../typescript-react-patterns.md) — patterns used in React apps
- [typescript-only-features.md](../typescript-only-features.md) — TypeScript-only vs JavaScript

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:5173

```bash
npm run build   # typecheck + production bundle
npm run lint    # oxlint
```

## What the app does

- List / filter employees by search, department, and status
- Add employees with a typed form
- Update status (active ↔ on leave) and remove employees
- Persist directory state in `localStorage`
- Show workforce summary counts

---

## Architecture

```
src/
├── types/hr.ts              # Domain models, unions, utility types
├── data/seed.ts             # Seed data with `satisfies`
├── lib/
│   ├── assertNever.ts       # Exhaustive switch helper
│   ├── typeGuards.ts        # `unknown` → Employee narrowing
│   ├── employees.ts         # Pure domain helpers
│   └── api.ts               # Async Result-returning API
├── hooks/
│   ├── useLocalStorage.ts   # Generic persistence hook
│   └── useEmployees.ts      # App state + CRUD orchestration
├── components/              # Typed React UI
└── App.tsx                  # Composition root
```

---

## Idiomatic TypeScript style (with code references)

Each section points at the sample file where the pattern lives. Open the file and read the surrounding code — that is the intended learning path.

### 1. Prefer `as const` objects over `enum`

Modern TypeScript (and this project’s `erasableSyntaxOnly` setting) favors **const objects + derived unions**. Values stay available at runtime; the type is inferred.

```typescript
// src/types/hr.ts
export const DEPARTMENTS = {
  Engineering: 'Engineering',
  People: 'People',
  Finance: 'Finance',
  Product: 'Product',
} as const;

export type Department = (typeof DEPARTMENTS)[keyof typeof DEPARTMENTS];

export const EMPLOYMENT_STATUSES = ['active', 'on_leave', 'terminated'] as const;
export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number];
```

**Why:** `enum` emits runtime code and is harder to tree-shake; `as const` is erasable-friendly and keeps literal types narrow.

### 2. Interfaces for object shapes; type aliases for unions & transforms

```typescript
// src/types/hr.ts
export interface Employee { /* ... */ }

export type CreateEmployeeInput = Omit<Employee, 'id' | 'status'> & {
  status?: EmploymentStatus;
};

export type UpdateEmployeeInput = Partial<Omit<Employee, 'id'>> & { id: string };
export type EmployeePreview = Pick<Employee, 'id' | 'firstName' | 'lastName' | /* ... */>;
```

| Construct | Use for |
|-----------|---------|
| `interface` | Extendable object contracts (`Employee`) |
| `type` | Unions, intersections, `Omit` / `Pick` / `Partial` results |

### 3. Utility types instead of copy-pasted shapes

See `CreateEmployeeInput`, `UpdateEmployeeInput`, `EmployeePreview`, and `Record<…>` maps in [`src/types/hr.ts`](src/types/hr.ts).

```typescript
export type EmployeesByDepartment = Record<Department, Employee[]>;
export type StatusLabelMap = Record<EmploymentStatus, string>;
```

### 4. Discriminated unions + `assertNever` for exhaustiveness

**Result type** for expected success/failure (no `any`, no silent throws):

```typescript
// src/types/hr.ts
export type Result<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E };
```

Narrow with `result.ok` in [`src/hooks/useEmployees.ts`](src/hooks/useEmployees.ts) and [`src/lib/api.ts`](src/lib/api.ts).

**Component props** as a discriminated union:

```typescript
// src/components/StatusBadge.tsx
type StatusBadgeProps =
  | { tone: 'status'; status: EmploymentStatus }
  | { tone: 'info'; label: string }
  | { tone: 'error'; label: string; onRetry?: () => void };
```

**Exhaustive `switch`** — if a new union member is added and not handled, TypeScript fails at `assertNever`:

```typescript
// src/lib/assertNever.ts + src/lib/employees.ts (formatStatusLabel)
default:
  return assertNever(status);
```

### 5. Generics for reusable APIs and components

```typescript
// Generic hook — src/hooks/useLocalStorage.ts
export function useLocalStorage<T>(key: string, initial: T): [T, ...] { /* ... */ }

// Generic list — src/components/List.tsx
export function List<T>({ items, keyExtractor, renderItem }: ListProps<T>) { /* ... */ }

// Generic async helper — src/lib/api.ts
export async function apiOk<T>(data: T): Promise<Result<T>> { /* ... */ }
```

**Why:** One implementation, many concrete types — without losing autocomplete or safety.

### 6. Type guards: narrow `unknown` before using it

Never trust `JSON.parse` as a typed value. Parse to `unknown`, then guard:

```typescript
// src/lib/typeGuards.ts
export function isEmployee(value: unknown): value is Employee { /* ... */ }

export function parseEmployeesJson(text: string): Result<Employee[]> {
  const parsed: unknown = JSON.parse(text);
  // ...
}
```

### 7. `satisfies` — validate without widening

Seed data must match `Employee[]`, but department/status stay as literal types:

```typescript
// src/data/seed.ts
export const SEED_EMPLOYEES = [ /* ... */ ] as const satisfies readonly Employee[];
```

Same idea for label maps in [`src/types/hr.ts`](src/types/hr.ts):

```typescript
export const STATUS_LABELS = { /* ... */ } as const satisfies StatusLabelMap;
```

### 8. `import type` / `export type` (required with `verbatimModuleSyntax`)

Type-only imports are erased at compile time and keep value/type boundaries clear:

```typescript
import type { Employee, CreateEmployeeInput } from '../types/hr';
import { DEPARTMENTS } from '../types/hr'; // runtime value
```

This project enables `verbatimModuleSyntax` and `erasableSyntaxOnly` in [`tsconfig.app.json`](tsconfig.app.json) — idiomatic for TypeScript 5.8+ / 6.

### 9. Typed React props, events, and refs

```typescript
// Props destructuring — src/components/EmployeeCard.tsx
function EmployeeCard({ employee, managerName, onRemove, disabled = false }: EmployeeCardProps)

// Events — src/components/EmployeeForm.tsx
const onFieldChange = (field: keyof FormState) =>
  (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { /* ... */ };

// Refs — src/components/EmployeeForm.tsx
const firstNameRef = useRef<HTMLInputElement>(null);
```

### 10. Immutable updates with spread / destructure

```typescript
// Object pack — update one field
setForm((prev) => ({ ...prev, [field]: event.target.value }));

// Array pack / map / filter — src/hooks/useEmployees.ts
setEmployees((prev) => [...prev, result.data]);
setEmployees((prev) => prev.map((e) => (e.id === id ? result.data : e)));
setEmployees((prev) => prev.filter((e) => e.id !== id));
```

### 11. Optional chaining and nullish coalescing

```typescript
// src/lib/employees.ts
const query = options.query?.trim().toLowerCase() ?? '';

// src/components/EmployeeCard.tsx
<dd>{managerName ?? '—'}</dd>
```

### 12. Derive types from values and functions

```typescript
// Hook return type — src/hooks/useEmployees.ts
export type UseEmployeesReturn = ReturnType<typeof useEmployees>;

// Filters type lives next to the hook that owns it
export type EmployeeFilters = { query: string; department: Department | 'all'; /* ... */ };
```

### 13. Mapped & template literal types (type-level)

Light examples in [`src/types/hr.ts`](src/types/hr.ts):

```typescript
export type EmployeeDraft = { [K in keyof Employee]?: Employee[K] | null };
export type HrHandlerName = `on${Capitalize<HrEventName>}Change`;
```

You do not need these every day — but recognizing them is part of fluent TypeScript.

---

## Compiler settings that reinforce idiomatic style

From [`tsconfig.app.json`](tsconfig.app.json):

| Option | Effect |
|--------|--------|
| `strict` | Full strict null checks, etc. |
| `noUncheckedIndexedAccess` | `array[i]` is `T \| undefined` |
| `verbatimModuleSyntax` | Forces correct `import type` |
| `erasableSyntaxOnly` | No `enum` / parameter properties that emit JS |
| `noFallthroughCasesInSwitch` | Safer switches |

---

## Suggested learning path

1. Read [`src/types/hr.ts`](src/types/hr.ts) — domain vocabulary in types  
2. Read [`src/lib/typeGuards.ts`](src/lib/typeGuards.ts) + [`src/lib/assertNever.ts`](src/lib/assertNever.ts) — narrowing & exhaustiveness  
3. Read [`src/lib/api.ts`](src/lib/api.ts) — `Result<T>` and generics  
4. Read [`src/hooks/useEmployees.ts`](src/hooks/useEmployees.ts) — composing typed state  
5. Read [`src/components/StatusBadge.tsx`](src/components/StatusBadge.tsx) + [`List.tsx`](src/components/List.tsx) — discriminated props & generic UI  
6. Skim [`App.tsx`](src/App.tsx) — how the pieces compose  

Then cross-check concepts in [typescript-react-patterns.md](../typescript-react-patterns.md).

---

## Quick reference: pattern → file

| Pattern | Where to look |
|---------|----------------|
| `as const` + derived union | `src/types/hr.ts` |
| `Omit` / `Partial` / `Pick` / `Record` | `src/types/hr.ts` |
| Discriminated `Result<T>` | `src/types/hr.ts`, `src/lib/api.ts` |
| `satisfies` | `src/data/seed.ts`, `STATUS_LABELS` in `types/hr.ts` |
| Type guard `value is T` | `src/lib/typeGuards.ts` |
| `assertNever` | `src/lib/assertNever.ts`, `StatusBadge.tsx` |
| Generic hook | `src/hooks/useLocalStorage.ts` |
| Generic component | `src/components/List.tsx` |
| Typed events / refs | `src/components/EmployeeForm.tsx` |
| Immutable list updates | `src/hooks/useEmployees.ts` |
| `import type` | any component / hook importing from `types/` |

---

## Stack

- React 19.2
- TypeScript ~6.0
- Vite 8
- oxlint
