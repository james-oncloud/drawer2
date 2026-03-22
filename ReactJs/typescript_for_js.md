# TypeScript Guide for JavaScript Developers

## What TypeScript is

TypeScript is JavaScript plus a static type system.

That means:

* your code still looks like JavaScript
* it compiles to plain JavaScript
* it adds type checking before runtime
* it helps editors understand your code better

TypeScript does **not** replace JavaScript. It sits on top of it.

A good way to think about it is:

> JavaScript tells the computer what to do at runtime.
> TypeScript helps you catch mistakes before runtime.

---

## Why JavaScript developers usually like TypeScript

TypeScript helps with:

* catching mistakes earlier
* safer refactoring
* better autocomplete
* clearer function contracts
* easier navigation in large codebases
* documenting intent in code

Typical JavaScript bugs TypeScript catches:

* calling a method on `undefined`
* passing the wrong argument type
* forgetting required properties
* assuming an API returns one shape when it returns another

---

## The key mindset shift

In JavaScript, values are flexible and types are mostly implicit at runtime.

In TypeScript, you still write JavaScript-style code, but you also describe the **shape** of your data.

You move from:

```javascript
function formatUser(user) {
  return user.name.toUpperCase();
}
```

to:

```typescript
function formatUser(user: { name: string }): string {
  return user.name.toUpperCase();
}
```

Now TypeScript can warn you if `user.name` is missing or not a string.

---

## TypeScript is not runtime validation

This is one of the most important things to understand.

TypeScript checks types at compile time, not runtime.

This compiles:

```typescript
type User = {
  name: string;
};

const user = JSON.parse('{"name": 123}') as User;
console.log(user.name.toUpperCase());
```

But it fails at runtime, because `name` is actually a number.

So:

* TypeScript checks your code assumptions
* runtime validation checks actual external data

Use runtime validation for:

* API input
* JSON files
* form input
* database results
* anything from outside your control

---

## Setting up TypeScript

Install it:

```bash
npm install -D typescript
```

Create a config:

```bash
npx tsc --init
```

Compile a file:

```bash
npx tsc
```

Run a specific file compile:

```bash
npx tsc src/index.ts
```

A minimal `tsconfig.json` you can start with:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "noImplicitAny": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "outDir": "dist",
    "rootDir": "src",
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

Important options:

* `strict`: turns on strong type checking
* `noImplicitAny`: stops silent `any`
* `noUncheckedIndexedAccess`: makes array/object access safer
* `exactOptionalPropertyTypes`: makes optional fields more precise

For modern apps, keep `strict: true`.

---

## File extensions

* `.ts` = TypeScript file
* `.tsx` = TypeScript + JSX
* `.d.ts` = type declaration file

Use `.tsx` for React components.

---

## Your first TypeScript examples

### Variables

```typescript
const name: string = "James";
const age: number = 42;
const active: boolean = true;
```

Usually TypeScript can infer the type, so you often write:

```typescript
const name = "James";
const age = 42;
const active = true;
```

Type inference is one of TypeScript’s best features.

---

## Basic types

```typescript
const message: string = "hello";
const count: number = 10;
const done: boolean = false;
const ids: number[] = [1, 2, 3];
const tags: Array<string> = ["a", "b"];
```

Tuple:

```typescript
const point: [number, number] = [10, 20];
```

Union type:

```typescript
let value: string | number;
value = "abc";
value = 123;
```

Literal types:

```typescript
let direction: "left" | "right";
direction = "left";
```

---

## Functions

JavaScript:

```javascript
function add(a, b) {
  return a + b;
}
```

TypeScript:

```typescript
function add(a: number, b: number): number {
  return a + b;
}
```

Arrow function:

```typescript
const multiply = (a: number, b: number): number => a * b;
```

Void return:

```typescript
function logMessage(message: string): void {
  console.log(message);
}
```

Optional parameter:

```typescript
function greet(name: string, title?: string): string {
  return title ? `${title} ${name}` : name;
}
```

Default parameter:

```typescript
function greetUser(name: string, title = "Mr"): string {
  return `${title} ${name}`;
}
```

Rest parameters:

```typescript
function sum(...values: number[]): number {
  return values.reduce((a, b) => a + b, 0);
}
```

---

## Object types

Inline object type:

```typescript
function printUser(user: { id: number; name: string }): void {
  console.log(`${user.id}: ${user.name}`);
}
```

Better with a named type:

```typescript
type User = {
  id: number;
  name: string;
};

function printUser(user: User): void {
  console.log(`${user.id}: ${user.name}`);
}
```

---

## `type` vs `interface`

Both are used to describe object shapes.

### Using `type`

```typescript
type User = {
  id: number;
  name: string;
};
```

### Using `interface`

```typescript
interface User {
  id: number;
  name: string;
}
```

Practical rule:

* use `interface` for object shapes you expect to extend or implement
* use `type` for unions, mapped types, utility compositions, and general flexibility

Examples where `type` is required or more natural:

```typescript
type Id = string | number;

type Status = "pending" | "success" | "error";

type Point = [number, number];
```

Extending:

```typescript
interface Person {
  name: string;
}

interface Employee extends Person {
  employeeId: string;
}
```

Type composition:

```typescript
type Person = {
  name: string;
};

type Employee = Person & {
  employeeId: string;
};
```

---

## Optional properties

```typescript
type User = {
  id: number;
  name: string;
  email?: string;
};
```

This means `email` may be absent.

Use carefully:

```typescript
function getEmailDomain(user: User): string | undefined {
  return user.email?.split("@")[1];
}
```

---

## Readonly properties

```typescript
type Config = {
  readonly apiUrl: string;
};
```

Now reassignment is blocked:

```typescript
const config: Config = { apiUrl: "https://api.example.com" };
// config.apiUrl = "x"; // error
```

Readonly array:

```typescript
const values: readonly number[] = [1, 2, 3];
```

---

## Arrays and objects in real code

Array inference:

```typescript
const names = ["a", "b", "c"];
```

TypeScript infers `string[]`.

Object inference:

```typescript
const user = {
  id: 1,
  name: "James"
};
```

TypeScript infers:

```typescript
{
  id: number;
  name: string;
}
```

When inference is enough, let it infer.
When you need a stable contract, add an explicit type.

---

## `any`, `unknown`, and `never`

### `any`

`any` disables type safety.

```typescript
let value: any = 10;
value = "hello";
value.foo.bar.baz();
```

Avoid it unless absolutely necessary.

### `unknown`

`unknown` is the safe version of “I don’t know yet”.

```typescript
let value: unknown = getSomething();
```

You must narrow it before use:

```typescript
if (typeof value === "string") {
  console.log(value.toUpperCase());
}
```

### `never`

Represents something that never happens.

```typescript
function fail(message: string): never {
  throw new Error(message);
}
```

Also useful for exhaustive checks.

---

## Type narrowing

This is one of the most important TypeScript skills.

```typescript
function printId(id: string | number): void {
  if (typeof id === "string") {
    console.log(id.toUpperCase());
  } else {
    console.log(id.toFixed(0));
  }
}
```

TypeScript narrows the type inside each branch.

Other narrowing tools:

* `typeof`
* `instanceof`
* `"prop" in obj`
* equality checks
* custom type guards

Example with `in`:

```typescript
type Admin = { name: string; permissions: string[] };
type Customer = { name: string; email: string };

function printContact(person: Admin | Customer): void {
  if ("email" in person) {
    console.log(person.email);
  } else {
    console.log(person.permissions.join(", "));
  }
}
```

---

## Type aliases for unions

Union types are common and powerful.

```typescript
type Result =
  | { status: "success"; data: string[] }
  | { status: "error"; error: string }
  | { status: "loading" };
```

Now TypeScript can narrow based on `status`:

```typescript
function renderResult(result: Result): string {
  switch (result.status) {
    case "loading":
      return "Loading...";
    case "error":
      return `Error: ${result.error}`;
    case "success":
      return result.data.join(", ");
  }
}
```

This pattern is called a **discriminated union**.

It is extremely useful for:

* API state
* reducers
* workflow states
* event handling

---

## Type assertions

Sometimes you know more than TypeScript.

```typescript
const input = document.getElementById("email") as HTMLInputElement;
console.log(input.value);
```

Use assertions sparingly.

Bad:

```typescript
const data = JSON.parse(raw) as User;
```

This tells TypeScript to trust you without proof.

Prefer validation or narrowing.

---

## `as const`

`as const` makes values more specific and readonly.

```typescript
const status = "success" as const;
```

Without it, `status` is `string`.
With it, `status` is the literal type `"success"`.

Object example:

```typescript
const config = {
  mode: "dark",
  retry: 3
} as const;
```

Now:

* `mode` is `"dark"`, not `string`
* `retry` is `3`, not `number`
* properties are readonly

Very useful for constants and config.

---

## Enums

TypeScript has enums, but many teams prefer union literals instead.

Enum:

```typescript
enum Status {
  Pending,
  Success,
  Error
}
```

Preferred in many codebases:

```typescript
type Status = "pending" | "success" | "error";
```

Union literals are often simpler and more JavaScript-friendly.

---

## Generics

Generics let you write reusable code while preserving type information.

Without generics:

```typescript
function first(items: any[]): any {
  return items[0];
}
```

With generics:

```typescript
function first<T>(items: T[]): T | undefined {
  return items[0];
}
```

Usage:

```typescript
const name = first(["a", "b", "c"]); // string | undefined
const id = first([1, 2, 3]); // number | undefined
```

Another example:

```typescript
function wrap<T>(value: T): { value: T } {
  return { value };
}
```

Multiple type parameters:

```typescript
function pair<K, V>(key: K, value: V): { key: K; value: V } {
  return { key, value };
}
```

Generics show up everywhere in TypeScript:

* arrays
* promises
* maps
* reusable utilities
* React hooks/components
* API wrappers

---

## Generic constraints

Sometimes you want a generic, but only for certain shapes.

```typescript
function getId<T extends { id: string }>(value: T): string {
  return value.id;
}
```

Now `T` must have an `id: string`.

---

## Utility types

TypeScript ships with very useful built-in utility types.

### `Partial<T>`

Makes all properties optional.

```typescript
type User = {
  id: number;
  name: string;
};

type PartialUser = Partial<User>;
```

Equivalent to:

```typescript
type PartialUser = {
  id?: number;
  name?: string;
};
```

### `Required<T>`

Makes all properties required.

### `Readonly<T>`

Makes all properties readonly.

### `Pick<T, K>`

Choose specific properties.

```typescript
type UserPreview = Pick<User, "id" | "name">;
```

### `Omit<T, K>`

Exclude specific properties.

```typescript
type UserWithoutId = Omit<User, "id">;
```

### `Record<K, V>`

Object with known key/value pattern.

```typescript
type ScoreMap = Record<string, number>;
```

### `ReturnType<T>`

Gets a function’s return type.

```typescript
function createUser() {
  return { id: 1, name: "James" };
}

type CreatedUser = ReturnType<typeof createUser>;
```

These utilities save a lot of duplication.

---

## Working with classes

TypeScript supports classes well.

```typescript
class UserService {
  constructor(private readonly baseUrl: string) {}

  getUser(id: number): string {
    return `${this.baseUrl}/users/${id}`;
  }
}
```

Access modifiers:

* `public` default
* `private`
* `protected`
* `readonly`

Example:

```typescript
class Counter {
  private count = 0;

  increment(): void {
    this.count += 1;
  }

  getValue(): number {
    return this.count;
  }
}
```

Interfaces with classes:

```typescript
interface Logger {
  log(message: string): void;
}

class ConsoleLogger implements Logger {
  log(message: string): void {
    console.log(message);
  }
}
```

---

## Modules and exports

JavaScript module syntax works the same.

```typescript
export type User = {
  id: number;
  name: string;
};

export function getUserName(user: User): string {
  return user.name;
}
```

Importing:

```typescript
import { getUserName, type User } from "./user";
```

Using `type` in imports makes intent clearer.

---

## Working with DOM APIs

DOM APIs often return nullable values, so TypeScript forces you to handle that.

```typescript
const button = document.getElementById("save");

if (button) {
  button.addEventListener("click", () => {
    console.log("saved");
  });
}
```

This can feel strict at first, but it prevents null-reference bugs.

---

## Null and undefined

With `strictNullChecks` enabled, `null` and `undefined` are treated properly.

```typescript
function findUser(id: number): string | undefined {
  if (id === 1) return "James";
  return undefined;
}
```

You must handle the possibility:

```typescript
const user = findUser(2);

if (user !== undefined) {
  console.log(user.toUpperCase());
}
```

Optional chaining:

```typescript
console.log(user?.toUpperCase());
```

Nullish coalescing:

```typescript
const displayName = user ?? "Anonymous";
```

---

## Type guards

A type guard is code that proves a type.

```typescript
function isString(value: unknown): value is string {
  return typeof value === "string";
}
```

Usage:

```typescript
function printValue(value: unknown): void {
  if (isString(value)) {
    console.log(value.toUpperCase());
  }
}
```

This is very useful when parsing external data.

---

## Working with APIs

A common pattern:

```typescript
type User = {
  id: number;
  name: string;
};

async function fetchUser(id: number): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const data = await response.json();
  return data as User;
}
```

This is common, but not fully safe because `response.json()` is untrusted.

Safer mental model:

```typescript
async function fetchUser(id: number): Promise<unknown> {
  const response = await fetch(`/api/users/${id}`);
  return response.json();
}
```

Then validate before treating it as `User`.

TypeScript helps most when you combine it with careful boundary handling.

---

## Common mistakes JavaScript developers make in TypeScript

### 1. Using `any` too early

```typescript
const data: any = getData();
```

This removes most of TypeScript’s value.

Prefer `unknown` and narrow it.

---

### 2. Over-annotating everything

You do not need to type every variable.

Bad:

```typescript
const name: string = "James";
const age: number = 42;
```

Usually better:

```typescript
const name = "James";
const age = 42;
```

Annotate where it adds value:

* function parameters
* public APIs
* exported types
* complex objects
* reusable abstractions

---

### 3. Confusing optional with nullable

These are different:

```typescript
type A = { email?: string };
type B = { email: string | null };
```

`A` means property may be missing.
`B` means property exists, but may be `null`.

---

### 4. Using assertions instead of narrowing

Bad:

```typescript
const user = value as User;
```

Better:

* validate
* narrow
* use guards

---

### 5. Ignoring compiler errors with escapes

Examples:

* `as any`
* `!` non-null assertions everywhere
* broad casts

These should be rare, not normal.

---

## The non-null assertion operator `!`

This tells TypeScript: “trust me, this is not null or undefined.”

```typescript
const input = document.getElementById("email")!;
```

It can be useful, but dangerous.

Prefer this when possible:

```typescript
const input = document.getElementById("email");

if (!input) {
  throw new Error("Missing email input");
}
```

---

## JavaScript features TypeScript understands well

TypeScript works very well with modern JavaScript:

* destructuring
* spread
* optional chaining
* nullish coalescing
* async/await
* ES modules
* classes
* template literals

Example:

```typescript
type User = {
  id: number;
  profile?: {
    email?: string;
  };
};

function getEmail(user: User): string {
  return user.profile?.email ?? "not provided";
}
```

---

## Migrating from JavaScript to TypeScript

A practical migration path:

### Step 1: Start with `allowJs`

You can include existing `.js` files in a TypeScript project.

### Step 2: Turn on type checking gradually

Use:

```json
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true
  }
}
```

This lets TypeScript check JavaScript files too.

### Step 3: Add JSDoc types in JS files

Example:

```javascript
/**
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
function add(a, b) {
  return a + b;
}
```

### Step 4: Convert important files first

Start with:

* shared utilities
* API models
* core business logic
* high-change files

### Step 5: Enable `strict`

This is where TypeScript becomes truly valuable.

---

## Using TypeScript in existing JavaScript files with JSDoc

You do not always need to rename files to `.ts` immediately.

```javascript
/**
 * @typedef {{ id: number, name: string }} User
 */

/**
 * @param {User} user
 * @returns {string}
 */
function getUserName(user) {
  return user.name;
}
```

This is a good transition path for large codebases.

---

## Third-party libraries and types

Many libraries ship with their own TypeScript types.

If not, you may need community types.

Historically that often means packages from DefinitelyTyped, commonly installed under the `@types/...` naming pattern.

Example:

```bash
npm install -D @types/node
```

This gives TypeScript type information for Node.js APIs.

---

## A realistic before-and-after example

### JavaScript version

```javascript
function createOrder(user, items, discountCode) {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  if (discountCode === "SAVE10") {
    return {
      userId: user.id,
      total: total * 0.9
    };
  }

  return {
    userId: user.id,
    total
  };
}
```

### TypeScript version

```typescript
type User = {
  id: number;
  name: string;
};

type Item = {
  name: string;
  price: number;
};

type Order = {
  userId: number;
  total: number;
};

function createOrder(
  user: User,
  items: Item[],
  discountCode?: string
): Order {
  const total = items.reduce((sum, item) => sum + item.price, 0);

  return {
    userId: user.id,
    total: discountCode === "SAVE10" ? total * 0.9 : total
  };
}
```

Benefits:

* clear input/output contract
* safer property access
* easier refactoring
* much better editor tooling

---

## A good TypeScript style for JavaScript developers

A pragmatic style:

* prefer inference for local variables
* annotate function parameters and return types on public functions
* avoid `any`
* use unions instead of broad loose types
* model state explicitly
* use discriminated unions for workflows
* validate external data at runtime
* keep `strict` on
* use utility types to avoid duplication

---

## What to learn first

Best learning order:

### 1. Basic annotations

* primitives
* arrays
* objects
* function parameters
* return types

### 2. Unions and narrowing

* `string | number`
* `typeof`
* `in`
* discriminated unions

### 3. Interfaces and type aliases

* object contracts
* reusable models

### 4. Generics

* reusable typed functions
* common library patterns

### 5. Utility types

* `Partial`
* `Pick`
* `Omit`
* `Record`

### 6. Boundary safety

* `unknown`
* runtime validation
* avoiding unsafe assertions

---

## Cheat sheet

### Variable

```typescript
const name: string = "James";
```

### Function

```typescript
function add(a: number, b: number): number {
  return a + b;
}
```

### Object type

```typescript
type User = {
  id: number;
  name: string;
};
```

### Optional property

```typescript
type User = {
  email?: string;
};
```

### Union

```typescript
let id: string | number;
```

### Array

```typescript
const ids: number[] = [1, 2, 3];
```

### Generic

```typescript
function first<T>(items: T[]): T | undefined {
  return items[0];
}
```

### Narrowing

```typescript
if (typeof value === "string") {
  console.log(value.toUpperCase());
}
```

---

## Final advice

Do not try to learn all of TypeScript at once.

For a JavaScript developer, the most valuable early goal is:

> learn how to describe data shapes and how to narrow unknown values safely

That alone gets you most of the real benefit.

After that, learn:

* unions
* generics
* utility types
* safe API/data handling

And keep this principle in mind:

> Prefer types that describe reality, not types that silence the compiler.

I can also turn this into a **hands-on TypeScript crash course with exercises for JavaScript developers**.
