# TypeScript Features and Patterns Not Available in JavaScript React Apps

Features and patterns that exist only in TypeScript (or only gain compile-time power in TypeScript). Plain JavaScript React apps can use the same *runtime* syntax in some cases, but without static types, checking, or IDE support described here.

For features shared by both languages (destructuring, spread, optional chaining, hooks, etc.), see [typescript-react-patterns.md](./typescript-react-patterns.md).

---

## Table of Contents

1. [Overview: TypeScript vs JavaScript React](#overview-typescript-vs-javascript-react)
2. [Static Type Annotations](#static-type-annotations)
3. [Interfaces and Type Aliases](#interfaces-and-type-aliases)
4. [Generics](#generics)
5. [Union, Intersection, and Literal Types](#union-intersection-and-literal-types)
6. [Utility Types](#utility-types)
7. [Advanced Type Operations](#advanced-type-operations)
8. [Type Narrowing and Guards](#type-narrowing-and-guards)
9. [Classes: TypeScript-Only Modifiers](#classes-typescript-only-modifiers)
10. [Enums and Const Narrowing](#enums-and-const-narrowing)
11. [Module and Import Types](#module-and-import-types)
12. [Declaration Files and Ambient Types](#declaration-files-and-ambient-types)
13. [Compile-Time Operators and Keywords](#compile-time-operators-and-keywords)
14. [React Patterns Requiring TypeScript](#react-patterns-requiring-typescript)
15. [What JavaScript Uses Instead](#what-javascript-uses-instead)
16. [Quick Reference Table](#quick-reference-table)

---

## Overview: TypeScript vs JavaScript React

| Capability | JavaScript React | TypeScript React |
|------------|------------------|------------------|
| Runtime behavior | Yes | Yes (compiles to JS) |
| Compile-time type checking | No | Yes |
| Interfaces / type aliases | No | Yes |
| Generics | No | Yes |
| IDE autocomplete from types | Limited (JSDoc) | Full |
| Refactoring safety | Runtime / tests only | Compile-time errors |
| `PropTypes` runtime checks | Optional | Usually replaced by types |

TypeScript is erased at compile time. Types, interfaces, and most type-only syntax **do not exist in the emitted JavaScript**.

---

## Static Type Annotations

Annotate variables, parameters, and return values. JavaScript has no equivalent — only JSDoc comments (optional, not enforced by the language).

```typescript
// Variable annotation
const count: number = 0;
let user: User | null = null;

// Parameter and return types
function formatPrice(amount: number, currency: string): string {
  return `${currency}${amount.toFixed(2)}`;
}

// React component with typed return (optional but useful)
function Header(): React.ReactElement {
  return <header>App</header>;
}
```

**JavaScript equivalent:** no syntax; values are untyped at compile time.

```javascript
const count = 0;
function formatPrice(amount, currency) {
  return `${currency}${amount.toFixed(2)}`;
}
```

---

## Interfaces and Type Aliases

Define object shapes, function signatures, and reusable contracts. These declarations are stripped during compilation.

```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role?: "admin" | "editor" | "viewer";
}

type OnSubmit = (data: FormData) => void | Promise<void>;

type ButtonProps = {
  label: string;
  onClick: OnSubmit;
  disabled?: boolean;
};

// Extending types
interface AdminUser extends User {
  permissions: string[];
}
```

**JavaScript equivalent:** `PropTypes`, documentation, or informal conventions — no first-class type definitions.

```javascript
// PropTypes — runtime only, not compile-time
Button.propTypes = {
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func.isRequired,
};
```

---

## Generics

Parameterize types and functions so components and utilities work across multiple types while staying type-safe.

```typescript
interface ApiResponse<T> {
  data: T;
  status: number;
}

function useFetch<T>(url: string): { data: T | null; loading: boolean } {
  // ...
}

// Generic list component
function List<T>({
  items,
  renderItem,
}: {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}) {
  return <ul>{items.map((item) => <li key={String(item)}>{renderItem(item)}</li>)}</ul>;
}

const [user, setUser] = useState<User | null>(null);
const inputRef = useRef<HTMLInputElement>(null);
```

**JavaScript equivalent:** untyped parameters; generics do not exist.

```javascript
function useFetch(url) { /* data type unknown */ }
const [user, setUser] = useState(null);
```

---

## Union, Intersection, and Literal Types

Express “one of several types” or exact string/number values. Enables discriminated unions and exhaustive `switch` checking.

```typescript
type Status = "idle" | "loading" | "success" | "error";

type Result =
  | { ok: true; data: User }
  | { ok: false; error: string };

type Named = { name: string };
type Timestamped = { createdAt: Date };
type Entity = Named & Timestamped;

// Literal type — only this exact value
type Theme = "light" | "dark";
```

**JavaScript equivalent:** any value at runtime; no way to declare allowed literals in the language itself.

---

## Utility Types

Built-in type transformations. All are compile-time only.

```typescript
type PartialUser = Partial<User>;           // all fields optional
type UserPreview = Pick<User, "id" | "name">;
type PublicUser = Omit<User, "password">;
type UserMap = Record<string, User>;
type Handler = ReturnType<typeof fetchUser>;
type Args = Parameters<typeof fetchUser>;
type NonNullUser = NonNullable<User | null>;
type ReadonlyUser = Readonly<User>;
```

**JavaScript equivalent:** none. You manually build equivalent object shapes without compiler support.

---

## Advanced Type Operations

Type-level logic unavailable in JavaScript.

### Mapped types

```typescript
type Nullable<T> = {
  [K in keyof T]: T[K] | null;
};

type Getters<T> = {
  [K in keyof T as `get${Capitalize<string & K>}`]: () => T[K];
};
```

### Conditional types

```typescript
type IsArray<T> = T extends unknown[] ? true : false;

type Flatten<T> = T extends (infer U)[] ? U : T;
```

### Template literal types

```typescript
type EventName = "click" | "focus" | "blur";
type HandlerProp = `on${Capitalize<EventName>}`;
// "onClick" | "onFocus" | "onBlur"
```

### Indexed access and keyof

```typescript
type UserName = User["name"];
type UserKeys = keyof User;
```

### `satisfies` operator

Validate a value matches a type without widening inferred literals.

```typescript
const routes = {
  home: "/",
  about: "/about",
} as const satisfies Record<string, string>;
```

**JavaScript equivalent:** none for all of the above.

---

## Type Narrowing and Guards

Refine types within control flow. Custom guards use TypeScript-only `is` and `asserts` syntax.

```typescript
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "name" in value
  );
}

function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "increment": return { count: state.count + 1 };
    case "decrement": return { count: state.count - 1 };
    default:
      return assertNever(action); // compile error if case missing
  }
}
```

### `unknown` vs `any`

```typescript
function parseJson(text: string): unknown {
  return JSON.parse(text);
}

// Must narrow before use
const data = parseJson('{"id":1}');
if (isUser(data)) {
  console.log(data.name); // safe
}
```

**JavaScript equivalent:** manual `typeof` / `instanceof` checks at runtime only; no `never` exhaustiveness or `unknown` enforcement.

---

## Classes: TypeScript-Only Modifiers

Extra keywords on class members. Not valid JavaScript syntax (except `#` private fields, which differ).

```typescript
class Store {
  private cache = new Map<string, User>();
  protected config: Config;
  readonly id: string;
  #internal = true; // ES private field — valid in modern JS too

  constructor(id: string, config: Config) {
    this.id = id;
    this.config = config;
  }

  private load(): void { /* ... */ }
}

abstract class BaseComponent {
  abstract render(): React.ReactNode;
}

class Button extends BaseComponent {
  render() {
    return <button>Click</button>;
  }
}
```

| Modifier | TypeScript | JavaScript |
|----------|------------|------------|
| `private` / `protected` / `public` | Compile-time visibility | Not standard JS |
| `readonly` | Immutable property | Not standard JS |
| `abstract` | Abstract classes/methods | Not standard JS |
| `implements` | Enforce interface on class | Not standard JS |
| `override` | Mark intentional override | TS 4.3+ / modern JS |

---

## Enums and Const Narrowing

### TypeScript enums

```typescript
enum Direction {
  Up,
  Down,
  Left,
  Right,
}

enum Theme {
  Light = "light",
  Dark = "dark",
}
```

Enums generate runtime objects (unless `const enum`). Plain object literals are the JavaScript pattern.

### `as const` — literal narrowing

```typescript
const ROLES = ["admin", "editor", "viewer"] as const;
type Role = (typeof ROLES)[number]; // "admin" | "editor" | "viewer"
```

**JavaScript equivalent:**

```javascript
const ROLES = ["admin", "editor", "viewer"];
// Role type does not exist; array is string[]
```

---

## Module and Import Types

Import or export types without emitting runtime code.

```typescript
import type { User, ApiResponse } from "./types";
import { type FC, useState } from "react";

export type { User };
export type ButtonProps = { label: string };
```

**JavaScript equivalent:** all imports are value imports; no `import type` or `export type`.

---

## Declaration Files and Ambient Types

Describe types for untyped JavaScript libraries or global variables.

```typescript
// types/global.d.ts
declare global {
  interface Window {
    analytics: { track: (event: string) => void };
  }
}

// types/images.d.ts
declare module "*.svg" {
  const content: React.FC<React.SVGProps<SVGSVGElement>>;
  export default content;
}
```

```typescript
// Ambient declaration — no implementation
declare function gtag(command: string, ...args: unknown[]): void;
```

**JavaScript equivalent:** none. Untyped imports rely on convention or community `@types` consumed only by TypeScript tooling.

---

## Compile-Time Operators and Keywords

| Feature | Purpose | In JavaScript? |
|---------|---------|----------------|
| `keyof T` | Keys of type as union | No |
| `typeof` (type position) | Type of value/type | No (only runtime `typeof`) |
| `infer` | Extract type in conditional | No |
| `as Type` | Type assertion | No |
| `satisfies Type` | Validate without widening | No |
| `readonly` (properties/tuples) | Immutability in types | No |
| `declare` | Ambient declarations | No |
| `namespace` | Legacy module grouping | No |
| `@ts-expect-error` | Suppress expected error | No |
| `/// <reference />` | Triple-slash directives | No |

### Type assertions

```typescript
const el = document.getElementById("root") as HTMLDivElement;
const data = (await res.json()) as User[];
```

**JavaScript equivalent:** casts do not exist; you trust runtime shape or validate manually.

---

## React Patterns Requiring TypeScript

Patterns that are either impossible or far weaker in JavaScript React.

### Typed props (replaces PropTypes at compile time)

```typescript
interface ModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

function Modal({ isOpen, title, onClose, children }: ModalProps) {
  if (!isOpen) return null;
  return (
    <dialog open>
      <h2>{title}</h2>
      {children}
      <button onClick={onClose}>Close</button>
    </dialog>
  );
}
```

### Typed DOM and synthetic events

```typescript
const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setEmail(e.target.value);
};

const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
};
```

### Extending intrinsic element props

```typescript
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}
```

### `forwardRef` with element type

```typescript
const TextInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, ...props }, ref) => (
    <label>
      {label}
      <input ref={ref} {...props} />
    </label>
  )
);
```

### Inferring props from another component

```typescript
type IconButtonProps = React.ComponentProps<typeof Button> & {
  icon: React.ReactNode;
};
```

### Typed context (null-safe contract)

```typescript
interface ThemeContextValue {
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme requires ThemeProvider");
  return ctx;
}
```

### Discriminated union props

```typescript
type AlertProps =
  | { variant: "success"; message: string }
  | { variant: "error"; message: string; retry: () => void };

function Alert(props: AlertProps) {
  if (props.variant === "error") {
    return (
      <div>
        {props.message}
        <button onClick={props.retry}>Retry</button>
      </div>
    );
  }
  return <div>{props.message}</div>;
}
```

### Typed reducers and actions

```typescript
type State = { items: Item[]; loading: boolean };

type Action =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: Item[] }
  | { type: "FETCH_ERROR"; error: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "FETCH_START":   return { ...state, loading: true };
    case "FETCH_SUCCESS": return { items: action.payload, loading: false };
    case "FETCH_ERROR":   return { ...state, loading: false };
    default:              return assertNever(action);
  }
}
```

### Generic reusable hooks

```typescript
function useLocalStorage<T>(key: string, initial: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : initial;
  });
  // ...
  return [value, setValue];
}
```

---

## What JavaScript Uses Instead

| TypeScript feature | JavaScript React alternative |
|--------------------|------------------------------|
| Interface / type for props | `PropTypes` (runtime) or nothing |
| Generic `useState<T>` | `useState(null)` — type unknown |
| Union / discriminated unions | Manual checks; easy to miss cases |
| Utility types (`Pick`, `Omit`) | Copy-paste object shapes |
| `import type` | N/A — all imports are values |
| Exhaustive `switch` with `never` | Tests or bugs in production |
| Typed event handlers | Untyped `e` or JSDoc comments |
| `.d.ts` for libraries | Hope the API matches usage |
| IDE refactor/rename | Grep and manual edits |

### JSDoc (partial typing in `.js` files)

JavaScript can use JSDoc for *some* editor hints, but it is not the same as TypeScript:

```javascript
/**
 * @typedef {{ id: string; name: string }} User
 * @param {User} user
 * @returns {string}
 */
function greet(user) {
  return `Hello, ${user.name}`;
}
```

JSDoc does not support generics, mapped types, conditional types, or full compile-time enforcement in the same way.

---

## Quick Reference Table

### TypeScript-only (not in JavaScript)

- Type annotations (`: Type`)
- `interface` and `type` aliases
- Generics (`<T>`)
- Union (`|`) and intersection (`&`) types
- Literal and template literal types
- Utility types (`Partial`, `Pick`, `Omit`, `Record`, etc.)
- Mapped and conditional types
- `keyof`, `typeof` (type position), `infer`
- `as` type assertions
- `satisfies`
- `is` type predicates and `asserts` functions
- `unknown`, `never`, `void` (as type discipline)
- `enum` (TypeScript form)
- `as const` literal narrowing
- `import type` / `export type`
- `declare`, `.d.ts`, module augmentation
- Class `implements`, `abstract`, `override`, visibility modifiers
- `@ts-expect-error` / `@ts-ignore`
- React types: `React.FC`, `React.ReactNode`, `ComponentProps`, typed events/refs

### Available in both JavaScript and TypeScript React

- Destructuring and rest (`const { a, ...rest } = obj`)
- Object/array spread (`{ ...obj }`, `[...arr]`)
- Optional chaining (`?.`) and nullish coalescing (`??`)
- Arrow functions, async/await, modules
- `useState`, `useEffect`, `useContext`, custom hooks
- JSX, fragments, conditional rendering
- ES class fields and `#` private fields (modern JS)

---

## Further Reading

- [TypeScript Handbook — Intro](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Handbook — Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [TypeScript Handbook — Creating Types from Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
- [typescript-react-patterns.md](./typescript-react-patterns.md) — features used in both languages
