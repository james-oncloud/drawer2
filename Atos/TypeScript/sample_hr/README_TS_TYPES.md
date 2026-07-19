# TypeScript Type System — How It Works

A practical guide to TypeScript’s type system, with examples from this **sample_hr** app.

Companion docs:

- [README.md](./README.md) — idiomatic patterns in this app
- [typescript-react-patterns.md](../typescript-react-patterns.md)
- [typescript-only-features.md](../typescript-only-features.md)

Primary source of truth for domain types: [`src/types/hr.ts`](src/types/hr.ts).

---

## 1. Types exist at compile time only

TypeScript checks your code **before** it runs. Types, interfaces, and most type-only syntax are **erased** when the project compiles to JavaScript.

```typescript
const name: string = 'Amina';
```

Emitted JS is roughly:

```javascript
const name = 'Amina';
```

**Implication:** Types do not protect you at runtime. Untrusted data (JSON, API responses, `localStorage`) must still be validated — see [type guards](#9-type-guards-and-narrowing).

---

## 2. Structural typing (“duck typing”)

TypeScript cares about **shape**, not nominal class names. If a value has the required properties, it is assignable.

```typescript
interface Employee {
  id: string;
  firstName: string;
  lastName: string;
}

// This object is an Employee — no `implements` or class needed
const person = {
  id: 'e-1',
  firstName: 'Leo',
  lastName: 'Nguyen',
  extra: true, // extra fields are OK when creating a fresh object
};

function greet(e: Employee) {
  return e.firstName;
}

greet(person); // OK — has id, firstName, lastName
```

See the real `Employee` interface in [`src/types/hr.ts`](src/types/hr.ts).

---

## 3. Inference vs annotation

TypeScript often **infers** types. You annotate when inference is too wide, when documenting an API, or when you want an explicit contract.

```typescript
// Inferred as number
const count = 0;

// Explicit annotation
const users: Employee[] = [];

// Function: annotate parameters; return type can be inferred or written
function fullName(employee: Pick<Employee, 'firstName' | 'lastName'>): string {
  return `${employee.firstName} ${employee.lastName}`;
}
```

In this app, form state is annotated so every field stays typed:

```typescript
// src/components/EmployeeForm.tsx
type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  department: Department;
  title: string;
  startDate: string;
};
```

---

## 4. Primitives vs literal types

| Type | Meaning | Example |
|------|---------|---------|
| `string` | any string | `"hello"`, `"Sales"` |
| `"Engineering"` | only that exact string | department literal |
| `string \| null` | string or null | optional API field |

Literal unions lock values to a known set:

```typescript
type EmploymentStatus = 'active' | 'on_leave' | 'terminated';

const status: EmploymentStatus = 'active';   // OK
const bad: EmploymentStatus = 'vacation';    // Error
```

That is why `department: 'Sales'` fails in `CreateEmployeeInput` — `'Sales'` is not in `Department`.

---

## 5. `as const` and derived unions

Prefer **const objects / arrays** over `enum`. Values exist at runtime; types are derived with `typeof`.

```typescript
// src/types/hr.ts
export const DEPARTMENTS = {
  Engineering: 'Engineering',
  People: 'People',
  Finance: 'Finance',
  Product: 'Product',
} as const;

// Without `as const`, values would widen to `string`
export type Department = (typeof DEPARTMENTS)[keyof typeof DEPARTMENTS];
// → "Engineering" | "People" | "Finance" | "Product"

export const EMPLOYMENT_STATUSES = ['active', 'on_leave', 'terminated'] as const;
export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number];
// → "active" | "on_leave" | "terminated"
```

**How to read `(typeof DEPARTMENTS)[keyof typeof DEPARTMENTS]`:**

1. `typeof DEPARTMENTS` — type of the object  
2. `keyof typeof DEPARTMENTS` — `"Engineering" | "People" | ...` (keys)  
3. Index with those keys — get the **value** union  

**Try it:** In `EmployeeForm`, set `department: 'Sales'` on a `CreateEmployeeInput`. TypeScript errors. Undo it.

---

## 6. Interfaces vs type aliases

| Use | For |
|-----|-----|
| `interface` | Object shapes you may `extend` (`Employee`) |
| `type` | Unions, intersections, mapped/utility results |

```typescript
// Interface — object contract
export interface Employee {
  id: string;
  firstName: string;
  department: Department;
  managerId?: string; // optional property
}

// Type alias — union / transform
export type Result<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E };

export type CreateEmployeeInput = Omit<Employee, 'id' | 'status'> & {
  status?: EmploymentStatus;
};
```

Both describe types; neither exists in the emitted JavaScript.

---

## 7. Unions, intersections, and discriminants

### Union (`|`) — one of several

```typescript
type Department | 'all'; // filter: real dept or "show all"
```

### Intersection (`&`) — must satisfy both

```typescript
type Timestamped = { createdAt: string; updatedAt: string };
export type AuditedEmployee = Employee & Timestamped;
```

### Discriminated union — shared tag field

```typescript
export type Result<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E };
```

Narrow with the discriminant:

```typescript
const result = await createEmployee(input);

if (!result.ok) {
  console.error(result.error); // E
  return;
}

console.log(result.data); // T — Employee
```

See [`src/hooks/useEmployees.ts`](src/hooks/useEmployees.ts) and [`src/components/StatusBadge.tsx`](src/components/StatusBadge.tsx).

---

## 8. Utility types

Built-in transforms — no runtime code.

| Utility | Meaning | In this app |
|---------|---------|-------------|
| `Omit<T, K>` | Drop keys | `Omit<Employee, 'id' \| 'status'>` |
| `Partial<T>` | All keys optional | updates |
| `Pick<T, K>` | Keep only keys | `EmployeePreview` |
| `Record<K, V>` | Object map | `Record<Department, Employee[]>` |
| `ReturnType<F>` | Function return type | `UseEmployeesReturn` |
| `NonNullable<T>` | Remove null/undefined | — |

```typescript
// Create: everything except id/status; status optional
export type CreateEmployeeInput = Omit<Employee, 'id' | 'status'> & {
  status?: EmploymentStatus;
};

// Update: id required, other fields optional
export type UpdateEmployeeInput = Partial<Omit<Employee, 'id'>> & {
  id: string;
};

export type EmployeePreview = Pick<
  Employee,
  'id' | 'firstName' | 'lastName' | 'department' | 'status' | 'title'
>;

export type EmployeesByDepartment = Record<Department, Employee[]>;
```

**Benefit:** Change `Employee` once; create/update/preview types follow.

---

## 9. Type guards and narrowing

Control flow **narrows** types.

```typescript
function format(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase(); // string here
  }
  return value.toFixed(2); // number here
}
```

### Custom type predicate

```typescript
// src/lib/typeGuards.ts
export function isEmployee(value: unknown): value is Employee {
  // runtime checks...
}
```

After `if (isEmployee(x))`, TypeScript treats `x` as `Employee`.

### `unknown` vs `any`

| | `unknown` | `any` |
|--|-----------|-------|
| Safe default for untrusted data | Yes | No |
| Must narrow before use | Yes | No |
| Used in this app | `JSON.parse` → `unknown` | Avoided |

```typescript
const parsed: unknown = JSON.parse(text);
if (!isEmployee(parsed)) {
  return { ok: false, error: 'Invalid employee shape' };
}
// parsed is Employee
```

### Exhaustiveness with `never`

```typescript
// src/lib/assertNever.ts
export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${String(value)}`);
}

function formatStatusLabel(status: EmploymentStatus): string {
  switch (status) {
    case 'active': return 'Active';
    case 'on_leave': return 'On leave';
    case 'terminated': return 'Terminated';
    default: return assertNever(status); // error if a case is missing
  }
}
```

---

## 10. Generics

A **type parameter** lets one function/type work for many concrete types.

```typescript
// Generic Result
type Result<T, E = string> =
  | { ok: true; data: T }
  | { ok: false; error: E };

Result<Employee>        // success payload is Employee
Result<Employee[]>      // success payload is Employee[]
Result<{ id: string }>  // success payload is { id: string }
```

```typescript
// Generic hook — src/hooks/useLocalStorage.ts
export function useLocalStorage<T>(
  key: string,
  initial: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  // ...
}

useLocalStorage<Employee[]>('sample-hr.employees', INITIAL_EMPLOYEES);
```

```typescript
// Generic component — src/components/List.tsx
function List<T>({ items, keyExtractor, renderItem }: ListProps<T>) {
  // works for Employee, string, Department, ...
}
```

`T` is chosen by the caller (or inferred from arguments).

---

## 11. `satisfies` — check without widening

`satisfies` validates a value against a type but **keeps** the more specific inferred type.

```typescript
// src/types/hr.ts
export const STATUS_LABELS = {
  active: 'Active',
  on_leave: 'On leave',
  terminated: 'Terminated',
} as const satisfies StatusLabelMap;

// src/data/seed.ts
export const SEED_EMPLOYEES = [ /* ... */ ] as const satisfies readonly Employee[];
```

- If a required key is missing → error  
- Literals stay narrow (`'active'` not widened to `string`)

---

## 12. `import type` / `export type`

Type-only imports are erased at compile time. Required by this project’s `verbatimModuleSyntax`.

```typescript
import type { Employee, CreateEmployeeInput } from '../types/hr';
import { DEPARTMENTS } from '../types/hr'; // runtime value — keep as value import

export type UseEmployeesReturn = ReturnType<typeof useEmployees>;
```

| Import | When |
|--------|------|
| `import type { Employee }` | Only used as a type |
| `import { DEPARTMENTS }` | Used as a value at runtime |

---

## 13. Optional, nullable, and nullish operators

```typescript
interface Employee {
  managerId?: string; // may be missing
}

const manager = employee.managerId; // string | undefined

// Optional chaining — stop if nullish
const city = user?.address?.city;

// Nullish coalescing — default only for null/undefined
const label = managerName ?? '—';
```

`??` is not the same as `||`: `||` also treats `0` and `''` as falsy.

---

## 14. Mapped and template literal types

### Mapped type

```typescript
// Every Employee key → optional and nullable (draft form)
export type EmployeeDraft = {
  [K in keyof Employee]?: Employee[K] | null;
};
```

### Template literal type

```typescript
export type HrEventName = 'employee' | 'leave';
export type HrHandlerName = `on${Capitalize<HrEventName>}Change`;
// "onEmployeeChange" | "onLeaveChange"
```

These are advanced; you mainly need to **recognize** them when reading library types.

---

## 15. How the pieces connect in sample_hr

```text
DEPARTMENTS (runtime) ──as const──► Department (type)
Employee (interface)
      │
      ├─ Omit/Partial ──► CreateEmployeeInput / UpdateEmployeeInput
      ├─ Pick ──────────► EmployeePreview
      └─ used by ───────► api.ts, useEmployees, components

Result<T> ──► api returns Result ──► hooks narrow with result.ok
unknown JSON ──► isEmployee ──► Employee
```

**Suggested learning order**

1. [`src/types/hr.ts`](src/types/hr.ts) — vocabulary  
2. [`src/lib/typeGuards.ts`](src/lib/typeGuards.ts) — `unknown` → safe type  
3. [`src/lib/api.ts`](src/lib/api.ts) — `Result<T>`  
4. [`src/hooks/useEmployees.ts`](src/hooks/useEmployees.ts) — types in app state  
5. [`src/components/EmployeeForm.tsx`](src/components/EmployeeForm.tsx) — typed props/events  

---

## 16. Mini drills

1. Change `department: form.department` to `department: 'Sales'` in `EmployeeForm` → read the error → undo.  
2. Add optional `location?: string` to `Employee` → see `CreateEmployeeInput` pick it up via `Omit`.  
3. Add `'contractor'` to `EMPLOYMENT_STATUSES` → fix every compile error (`STATUS_LABELS`, switches, UI).  
4. Call `useLocalStorage<number>('demo', 0)` in a scratch component — confirm `T` becomes `number`.

---

## Quick reference

| Concept | One-liner |
|---------|-----------|
| Annotation | `: Type` on a value or parameter |
| Inference | Compiler guesses the type |
| Literal union | `"a" \| "b"` |
| `as const` | Keep literals narrow |
| Interface | Object shape |
| Union / intersection | `A \| B` / `A & B` |
| Discriminated union | Shared tag (`ok`, `tone`, `type`) |
| Utility type | `Omit`, `Partial`, `Pick`, `Record` |
| Generic | `<T>` reusable across types |
| Type guard | `value is T` |
| `satisfies` | Validate, don’t widen |
| `import type` | Erased type-only import |

---

## Further reading

- [TypeScript Handbook — Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [More on Functions / Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [Creating Types from Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
