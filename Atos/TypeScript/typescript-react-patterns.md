# TypeScript Language Features in React Applications

A reference of TypeScript patterns and constructs commonly used when building React apps.

---

## Table of Contents

1. [Object Destructuring (Extraction)](#object-destructuring-extraction)
2. [Object Spread (Packing / Merging)](#object-spread-packing--merging)
3. [Array Destructuring and Spread](#array-destructuring-and-spread)
4. [Type Annotations and Inference](#type-annotations-and-inference)
5. [Interfaces and Type Aliases](#interfaces-and-type-aliases)
6. [Generics](#generics)
7. [Union, Intersection, and Discriminated Unions](#union-intersection-and-discriminated-unions)
8. [Utility Types](#utility-types)
9. [Optional Chaining and Nullish Coalescing](#optional-chaining-and-nullish-coalescing)
10. [Type Guards and Narrowing](#type-guards-and-narrowing)
11. [Enums and Const Assertions](#enums-and-const-assertions)
12. [Modules and Imports](#modules-and-imports)
13. [Async / Await and Promises](#async--await-and-promises)
14. [React-Specific TypeScript Patterns](#react-specific-typescript-patterns)
15. [Common Application Patterns](#common-application-patterns)

---

## Object Destructuring (Extraction)

Pull specific properties out of an object into standalone variables.

```typescript
const user = { id: 1, name: "Alice", email: "alice@example.com" };

// Basic extraction
const { name, email } = user;

// Rename while extracting
const { name: displayName } = user;

// Default values
const { role = "guest" } = user;

// Rest extraction — collect remaining properties
const { id, ...profile } = user;
// profile: { name: string; email: string }
```

### In React components (props extraction)

```typescript
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}

// Destructure props in the function signature
function Button({ label, onClick, disabled = false, className }: ButtonProps) {
  return (
    <button className={className} onClick={onClick} disabled={disabled}>
      {label}
    </button>
  );
}
```

### Nested destructuring

```typescript
const response = {
  data: { user: { name: "Bob", age: 30 } },
  status: 200,
};

const {
  data: {
    user: { name },
  },
} = response;
```

### Destructuring in hooks

```typescript
const [count, setCount] = useState(0);
const { data, isLoading, error } = useQuery("users", fetchUsers);
const { theme, toggleTheme } = useContext(ThemeContext);
```

---

## Object Spread (Packing / Merging)

Combine or clone objects by spreading properties into a new object.

```typescript
const defaults = { theme: "light", lang: "en" };
const overrides = { theme: "dark" };

// Merge — later keys win
const settings = { ...defaults, ...overrides };
// { theme: "dark", lang: "en" }

// Shallow clone
const copy = { ...user };

// Add or override a single property (immutable update)
const updatedUser = { ...user, name: "Charlie" };
```

### In React state updates

```typescript
// useState — merge into existing state object
setForm((prev) => ({ ...prev, email: newEmail }));

// Redux / Zustand — immutable slice updates
return { ...state, items: [...state.items, newItem] };
```

### Spreading props onto JSX elements

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

function LabeledInput({ label, ...inputProps }: InputProps) {
  return (
    <label>
      {label}
      <input {...inputProps} />
    </label>
  );
}

// Usage — extra attributes pass through
<LabeledInput label="Email" type="email" placeholder="you@example.com" />;
```

### Omitting props before spread

```typescript
function Card({ title, children, ...rest }: CardProps) {
  // `rest` contains all props except title and children
  return <div {...rest}>{title}{children}</div>;
}
```

---

## Array Destructuring and Spread

### Array destructuring

```typescript
const [first, second] = ["a", "b", "c"];
const [head, ...tail] = [1, 2, 3, 4]; // rest in arrays

// Swapping
let a = 1, b = 2;
[a, b] = [b, a];
```

### Array spread

```typescript
const existing = [1, 2, 3];

// Append (immutable)
const extended = [...existing, 4];

// Prepend
const prepended = [0, ...existing];

// Clone
const clone = [...existing];

// Merge arrays
const combined = [...listA, ...listB];
```

### In React lists and state

```typescript
// Add item
setItems((prev) => [...prev, newItem]);

// Remove item
setItems((prev) => prev.filter((item) => item.id !== id));

// Update item
setItems((prev) =>
  prev.map((item) =>
    item.id === id ? { ...item, done: true } : item
  )
);

// Reorder (e.g. drag-and-drop)
setItems((prev) => {
  const next = [...prev];
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
});
```

---

## Type Annotations and Inference

```typescript
// Explicit annotation
const count: number = 0;
const users: User[] = [];

// Function return type
function getUser(id: string): User | null {
  return db.find(id) ?? null;
}

// Type inference — TypeScript infers types automatically
const message = "hello";        // string
const items = [1, 2, 3];        // number[]
const double = (n: number) => n * 2; // (n: number) => number

// `as const` — narrow to literal types
const ROUTES = ["home", "about", "contact"] as const;
type Route = (typeof ROUTES)[number]; // "home" | "about" | "contact"
```

---

## Interfaces and Type Aliases

```typescript
// Interface — extendable, good for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

interface Admin extends User {
  permissions: string[];
}

// Type alias — unions, primitives, computed types
type Status = "idle" | "loading" | "success" | "error";
type ID = string | number;
type UserMap = Record<string, User>;

// React component props
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
};
```

### Extending HTML element props

```typescript
interface CustomButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant: "primary" | "secondary";
  isLoading?: boolean;
}
```

---

## Generics

Reusable types and functions that work across multiple types.

```typescript
// Generic function
function identity<T>(value: T): T {
  return value;
}

// Generic interface
interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Generic React component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  keyExtractor: (item: T) => string;
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  );
}
```

### Generic hooks

```typescript
function useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });
  // ...
  return [value, setValue];
}

// useState with explicit generic
const [user, setUser] = useState<User | null>(null);

// useRef for DOM elements
const inputRef = useRef<HTMLInputElement>(null);

// useRef for mutable values (non-DOM)
const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

---

## Union, Intersection, and Discriminated Unions

```typescript
// Union — value is one of several types
type Result = { success: true; data: User } | { success: false; error: string };

function handleResult(result: Result) {
  if (result.success) {
    console.log(result.data);  // narrowed to success branch
  } else {
    console.error(result.error);
  }
}

// Intersection — combine types
type Named = { name: string };
type Dated = { createdAt: Date };
type NamedEntity = Named & Dated;

// Discriminated union with a `kind` or `type` field
type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "rectangle"; width: number; height: number };

function area(shape: Shape): number {
  switch (shape.kind) {
    case "circle":   return Math.PI * shape.radius ** 2;
    case "rectangle": return shape.width * shape.height;
  }
}
```

---

## Utility Types

Built-in type transformations.

| Utility | Purpose | Example |
|---------|---------|---------|
| `Partial<T>` | All properties optional | `Partial<User>` for update payloads |
| `Required<T>` | All properties required | `Required<Config>` |
| `Pick<T, K>` | Select specific keys | `Pick<User, "id" \| "name">` |
| `Omit<T, K>` | Exclude specific keys | `Omit<User, "password">` |
| `Record<K, V>` | Object with key type K, value type V | `Record<Status, string>` |
| `Readonly<T>` | Immutable properties | `Readonly<State>` |
| `ReturnType<F>` | Function return type | `ReturnType<typeof fetchUser>` |
| `Parameters<F>` | Function parameter tuple | `Parameters<typeof fetchUser>` |
| `NonNullable<T>` | Exclude null/undefined | `NonNullable<User \| null>` |
| `Extract<T, U>` | Extract matching union members | `Extract<Shape, { kind: "circle" }>` |
| `Exclude<T, U>` | Exclude matching union members | `Exclude<Status, "idle">` |

```typescript
// Common in React: props without children
type PropsWithoutChildren = Omit<ComponentProps, "children">;

// Form state — all fields optional for partial saves
type UserFormData = Partial<Pick<User, "name" | "email">>;

// Event handler types from DOM
type ChangeHandler = React.ChangeEventHandler<HTMLInputElement>;
type ClickHandler = React.MouseEventHandler<HTMLButtonElement>;
```

---

## Optional Chaining and Nullish Coalescing

```typescript
// Optional chaining — safe access on possibly null/undefined values
const city = user?.address?.city;
const result = callback?.();
const first = items?.[0];

// Nullish coalescing — default only for null/undefined (not 0 or "")
const displayName = user.name ?? "Anonymous";
const pageSize = config.pageSize ?? 20;

// Combined
const label = props?.title ?? "Untitled";
```

### In JSX

```typescript
{user?.avatar && <img src={user.avatar} alt="" />}
{error?.message ?? "Something went wrong"}
{items?.length > 0 && <ItemList items={items} />}
```

---

## Type Guards and Narrowing

```typescript
// typeof guard
function format(value: string | number) {
  if (typeof value === "string") return value.toUpperCase();
  return value.toFixed(2);
}

// instanceof guard
if (error instanceof ApiError) {
  showToast(error.message);
}

// Custom type guard
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value
  );
}

// in operator
if ("permissions" in user) {
  // user is Admin
}

// Assertion functions
function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") throw new Error("Expected string");
}
```

---

## Enums and Const Assertions

```typescript
// String enum
enum Theme {
  Light = "light",
  Dark = "dark",
}

// Const enum (inlined at compile time)
const enum Direction {
  Up,
  Down,
  Left,
  Right,
}

// Preferred modern alternative: const object + type
const UserRole = {
  Admin: "admin",
  Editor: "editor",
  Viewer: "viewer",
} as const;

type UserRole = (typeof UserRole)[keyof typeof UserRole];
// "admin" | "editor" | "viewer"
```

---

## Modules and Imports

```typescript
// Named imports
import { useState, useEffect, type FC } from "react";

// Default import
import Button from "./Button";

// Type-only imports (erased at compile time)
import type { User, ApiResponse } from "./types";

// Re-export
export type { User } from "./types";
export { Button, Input } from "./components";

// Dynamic import (code splitting)
const LazyChart = React.lazy(() => import("./Chart"));
```

---

## Async / Await and Promises

```typescript
async function fetchUsers(): Promise<User[]> {
  const response = await fetch("/api/users");
  if (!response.ok) throw new Error("Failed to fetch");
  return response.json();
}

// In useEffect
useEffect(() => {
  let cancelled = false;

  async function load() {
    try {
      const data = await fetchUsers();
      if (!cancelled) setUsers(data);
    } catch (err) {
      if (!cancelled) setError(err);
    }
  }

  load();
  return () => { cancelled = true; };
}, []);
```

---

## React-Specific TypeScript Patterns

### Functional components

```typescript
// Explicit props type
function Greeting({ name }: { name: string }) {
  return <h1>Hello, {name}</h1>;
}

// FC / FunctionComponent (children often implicit)
const Card: React.FC<CardProps> = ({ title, children }) => (
  <div className="card">
    <h2>{title}</h2>
    {children}
  </div>
);

// Return type
function Layout(): React.ReactElement {
  return <main>...</main>;
}
```

### Children and render props

```typescript
type LayoutProps = {
  children: React.ReactNode;
};

type RenderProps<T> = {
  data: T;
  children: (item: T) => React.ReactNode;
};

// Component props from another component
type ButtonProps = React.ComponentProps<typeof Button>;
```

### Event handlers

```typescript
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
};

const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.stopPropagation();
};
```

### Refs and forwardRef

```typescript
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, ...props }, ref) => (
    <label>
      {label}
      <input ref={ref} {...props} />
    </label>
  )
);
```

### Context

```typescript
interface AuthContextValue {
  user: User | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
```

### Custom hooks

```typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
```

### Reducers (useReducer)

```typescript
type State = { count: number };
type Action =
  | { type: "increment" }
  | { type: "decrement" }
  | { type: "reset" }
  | { type: "set"; payload: number };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "increment": return { count: state.count + 1 };
    case "decrement": return { count: state.count - 1 };
    case "reset":     return { count: 0 };
    case "set":       return { count: action.payload };
  }
}

const [state, dispatch] = useReducer(reducer, { count: 0 });
```

---

## Common Application Patterns

### Conditional rendering with typed data

```typescript
type PageProps =
  | { mode: "list"; items: Item[] }
  | { mode: "detail"; item: Item };

function Page(props: PageProps) {
  if (props.mode === "list") {
    return <ItemList items={props.items} />;
  }
  return <ItemDetail item={props.item} />;
}
```

### Form handling

```typescript
type FormState = {
  values: Record<string, string>;
  errors: Partial<Record<string, string>>;
  touched: Partial<Record<string, boolean>>;
};

const handleFieldChange = (field: keyof FormState["values"]) =>
  (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({
      ...prev,
      values: { ...prev.values, [field]: e.target.value },
    }));
  };
```

### API layer typing

```typescript
async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, options);
  if (!res.ok) throw new ApiError(res.status, await res.text());
  return res.json() as Promise<T>;
}

const users = await api<User[]>("/api/users");
```

### Environment and configuration

```typescript
interface AppConfig {
  apiUrl: string;
  featureFlags: Record<string, boolean>;
}

const config: AppConfig = {
  apiUrl: import.meta.env.VITE_API_URL,
  featureFlags: { darkMode: true },
};
```

### Template literal types

```typescript
type EventName = "click" | "focus" | "blur";
type HandlerName = `on${Capitalize<EventName>}`;
// "onClick" | "onFocus" | "onBlur"

type Route = `/users/${string}` | `/posts/${string}`;
```

### Mapped types

```typescript
type Nullable<T> = { [K in keyof T]: T[K] | null };

type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};
```

### Satisfies operator

```typescript
// Validate shape without widening inferred types
const palette = {
  primary: "#007bff",
  secondary: "#6c757d",
} as const satisfies Record<string, string>;
```

---

## Quick Reference: Extraction vs Packing

| Operation | Syntax | Creates | Typical React use |
|-----------|--------|---------|-------------------|
| **Extract** (destructure) | `const { a, b } = obj` | Variables from properties | Props, hook return values, context |
| **Rest extract** | `const { id, ...rest } = obj` | Subset object | Pass remaining props to DOM element |
| **Pack** (spread) | `{ ...obj, newKey: val }` | New merged object | Immutable state updates |
| **Array extract** | `const [a, ...rest] = arr` | Variables from elements | `useState` tuple, list head/tail |
| **Array pack** | `[...arr, item]` | New extended array | Append to list state |

---

## Further Reading

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [TypeScript Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
