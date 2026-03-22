```typescript
/**
 * TypeScript Showcase
 * -------------------
 * A single file demonstrating common TypeScript syntax, features, and concepts.
 *
 * To run:
 *   1. Save as `typescript-showcase.ts`
 *   2. Compile: npx tsc typescript-showcase.ts
 *   3. Run:     node typescript-showcase.js
 */

// ============================================================
// 1. Primitive types and type inference
// ============================================================

// Explicit type annotations
let username: string = "alice";
let age: number = 34;
let isAdmin: boolean = false;

// Type inference: TypeScript infers the type from the assigned value
let inferredCity = "London"; // inferred as string
let inferredScore = 99; // inferred as number

// bigint and symbol
const bigCounter: bigint = 9007199254740993n;
const uniqueKey: symbol = Symbol("uniqueKey");

// null and undefined
let optionalValue: undefined = undefined;
let emptyValue: null = null;

// Template string
const introMessage: string = `User ${username} is ${age} years old.`;

console.log(introMessage, inferredCity, inferredScore, bigCounter, uniqueKey);

// ============================================================
// 2. Arrays, tuples, and readonly arrays
// ============================================================

const numbers: number[] = [1, 2, 3];
const tags: Array<string> = ["ts", "js", "types"];

// Tuple: fixed number of elements with fixed types
const httpResponse: [number, string] = [200, "OK"];

// Readonly array: cannot mutate via push/pop etc.
const readonlyNames: readonly string[] = ["Alice", "Bob", "Charlie"];

console.log(numbers, tags, httpResponse, readonlyNames);

// ============================================================
// 3. Union and literal types
// ============================================================

// Union type: variable can hold more than one type
let userId: string | number = 101;
userId = "user-101";

// Literal types: only these exact values are allowed
type Status = "idle" | "loading" | "success" | "error";
let currentStatus: Status = "idle";

currentStatus = "loading";
// currentStatus = "done"; // Compile error

console.log(userId, currentStatus);

// ============================================================
// 4. Type aliases and interfaces
// ============================================================

// Type alias for object shape
type Address = {
  line1: string;
  city: string;
  postcode?: string; // optional property
};

// Interface for object contract
interface User {
  id: number;
  name: string;
  email?: string;
  readonly createdAt: Date; // readonly property
  address: Address;
}

// Extending an interface
interface Admin extends User {
  permissions: string[];
}

const normalUser: User = {
  id: 1,
  name: "Alice",
  createdAt: new Date(),
  address: {
    line1: "221B Baker Street",
    city: "London",
  },
};

const adminUser: Admin = {
  id: 2,
  name: "Bob",
  createdAt: new Date(),
  address: {
    line1: "10 Downing Street",
    city: "London",
    postcode: "SW1A 2AA",
  },
  permissions: ["read", "write", "delete"],
};

console.log(normalUser, adminUser);

// ============================================================
// 5. Functions
// ============================================================

// Named function with parameter and return types
function add(a: number, b: number): number {
  return a + b;
}

// Arrow function
const multiply = (a: number, b: number): number => a * b;

// Optional parameter
function greet(name: string, title?: string): string {
  return title ? `Hello ${title} ${name}` : `Hello ${name}`;
}

// Default parameter
function power(base: number, exponent: number = 2): number {
  return base ** exponent;
}

// Rest parameters
function sumAll(...values: number[]): number {
  return values.reduce((acc, n) => acc + n, 0);
}

// Void return type
function logMessage(message: string): void {
  console.log("[LOG]", message);
}

console.log(add(2, 3));
console.log(multiply(4, 5));
console.log(greet("Alice"));
console.log(greet("Alice", "Dr"));
console.log(power(3));
console.log(sumAll(1, 2, 3, 4));
logMessage("Functions section complete");

// ============================================================
// 6. Type narrowing
// ============================================================

// Type narrowing using typeof
function formatValue(value: string | number): string {
  if (typeof value === "string") {
    return value.toUpperCase();
  }
  return value.toFixed(2);
}

console.log(formatValue("hello"));
console.log(formatValue(12.345));

// Type narrowing using "in"
type Cat = { kind: "cat"; meow: () => void };
type Dog = { kind: "dog"; bark: () => void };
type Pet = Cat | Dog;

function makeSound(pet: Pet): void {
  if ("meow" in pet) {
    pet.meow();
  } else {
    pet.bark();
  }
}

makeSound({ kind: "cat", meow: () => console.log("Meow") });
makeSound({ kind: "dog", bark: () => console.log("Woof") });

// ============================================================
// 7. any, unknown, never
// ============================================================

// any disables type safety: avoid unless really necessary
let riskyValue: any = "could be anything";
riskyValue = 123;
riskyValue.doSomething?.(); // TypeScript allows this because it is 'any'

// unknown is safer than any: you must narrow before use
let safeUnknown: unknown = "TypeScript";

if (typeof safeUnknown === "string") {
  console.log(safeUnknown.toUpperCase());
}

// never: function never returns normally
function fail(message: string): never {
  throw new Error(message);
}

// Example exhaustive check helper using never
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${String(x)}`);
}

// ============================================================
// 8. Object-oriented features: classes, inheritance, access modifiers
// ============================================================

class Person {
  // public is default, but shown here for clarity
  public name: string;

  // protected: accessible in this class and subclasses
  protected age: number;

  // private: accessible only inside this class
  private secretCode: string;

  constructor(name: string, age: number, secretCode: string) {
    this.name = name;
    this.age = age;
    this.secretCode = secretCode;
  }

  public describe(): string {
    return `${this.name} is ${this.age} years old.`;
  }

  protected getSecretPreview(): string {
    return this.secretCode.slice(0, 2) + "***";
  }
}

class Employee extends Person {
  constructor(
    name: string,
    age: number,
    secretCode: string,
    public role: string
  ) {
    super(name, age, secretCode);
  }

  public override describe(): string {
    return `${super.describe()} Role: ${this.role}. Secret preview: ${this.getSecretPreview()}`;
  }
}

const employee = new Employee("Charlie", 40, "ZXCV1234", "Developer");
console.log(employee.describe());

// Parameter properties: concise class property declaration in constructor
class Product {
  constructor(
    public readonly id: number,
    public name: string,
    private price: number
  ) {}

  getPrice(): number {
    return this.price;
  }
}

const product = new Product(1, "Laptop", 1299.99);
console.log(product.name, product.getPrice());

// ============================================================
// 9. Abstract classes
// ============================================================

abstract class Shape {
  abstract area(): number;

  describe(): string {
    return `Area is ${this.area()}`;
  }
}

class Rectangle extends Shape {
  constructor(private width: number, private height: number) {
    super();
  }

  area(): number {
    return this.width * this.height;
  }
}

const rect = new Rectangle(10, 5);
console.log(rect.describe());

// ============================================================
// 10. Generics
// ============================================================

// Generic function: works with different types
function identity<T>(value: T): T {
  return value;
}

console.log(identity<string>("hello"));
console.log(identity<number>(42));

// Generic type alias
type ApiResponse<T> = {
  success: boolean;
  data: T;
  error?: string;
};

const userResponse: ApiResponse<User> = {
  success: true,
  data: normalUser,
};

console.log(userResponse);

// Generic interface
interface Box<T> {
  value: T;
}

const stringBox: Box<string> = { value: "boxed text" };
const numberBox: Box<number> = { value: 123 };

console.log(stringBox, numberBox);

// Generic constraints
function getLength<T extends { length: number }>(input: T): number {
  return input.length;
}

console.log(getLength("hello"));
console.log(getLength([1, 2, 3]));

// ============================================================
// 11. Enums
// ============================================================

// Numeric enum
enum Direction {
  Up,
  Down,
  Left,
  Right,
}

// String enum
enum UserRole {
  Guest = "GUEST",
  Editor = "EDITOR",
  Admin = "ADMIN",
}

console.log(Direction.Left, UserRole.Admin);

// ============================================================
// 12. Type assertions
// ============================================================

// Type assertion tells the compiler "trust me, I know the type"
const someValue: unknown = "this is a string";
const stringLength: number = (someValue as string).length;

console.log(stringLength);

// Angle-bracket assertion syntax exists too, but avoid in .tsx files
const anotherLength: number = (<string>someValue).length;
console.log(anotherLength);

// Non-null assertion: use sparingly
const maybeElement: string | null = "exists";
const definitelyElementLength = maybeElement!.length;
console.log(definitelyElementLength);

// ============================================================
// 13. Literal inference and as const
// ============================================================

const appConfig = {
  mode: "production",
  retries: 3,
} as const;

// Because of 'as const', the properties are readonly and literal types
console.log(appConfig.mode, appConfig.retries);

// ============================================================
// 14. keyof, typeof, indexed access types
// ============================================================

type UserKeys = keyof User; // "id" | "name" | "email" | "createdAt" | "address"

const selectedUserKey: UserKeys = "name";
console.log(selectedUserKey);

// typeof on values to derive a type
const settings = {
  theme: "dark",
  itemsPerPage: 20,
};

type Settings = typeof settings;

// Indexed access type: get the type of one property
type ThemeType = Settings["theme"];

const themeValue: ThemeType = "dark";
console.log(themeValue);

// ============================================================
// 15. Mapped types
// ============================================================

type Optional<T> = {
  [K in keyof T]?: T[K];
};

type ReadonlyUser = {
  readonly [K in keyof User]: User[K];
};

const partialUser: Optional<User> = {
  name: "Partial Alice",
};

const readOnlyUser: ReadonlyUser = normalUser;
console.log(partialUser, readOnlyUser);

// ============================================================
// 16. Utility types
// ============================================================

type PartialUser = Partial<User>;
type RequiredAddress = Required<Address>;
type UserPreview = Pick<User, "id" | "name">;
type UserWithoutAddress = Omit<User, "address">;
type NameToAgeMap = Record<string, number>;

const partial: PartialUser = { name: "Temp" };
const fullAddress: RequiredAddress = {
  line1: "1 Main St",
  city: "Manchester",
  postcode: "M1 1AA",
};
const preview: UserPreview = { id: 1, name: "Alice" };
const withoutAddress: UserWithoutAddress = {
  id: 1,
  name: "Alice",
  createdAt: new Date(),
};
const ages: NameToAgeMap = {
  Alice: 30,
  Bob: 40,
};

console.log(partial, fullAddress, preview, withoutAddress, ages);

// ============================================================
// 17. Union discrimination (discriminated unions)
// ============================================================

type LoadingState = { state: "loading" };
type SuccessState = { state: "success"; data: string[] };
type ErrorState = { state: "error"; message: string };

type RequestState = LoadingState | SuccessState | ErrorState;

function renderState(state: RequestState): string {
  switch (state.state) {
    case "loading":
      return "Loading...";
    case "success":
      return `Loaded: ${state.data.join(", ")}`;
    case "error":
      return `Error: ${state.message}`;
    default:
      return assertNever(state);
  }
}

console.log(renderState({ state: "loading" }));
console.log(renderState({ state: "success", data: ["a", "b"] }));
console.log(renderState({ state: "error", message: "Network failed" }));

// ============================================================
// 18. Function overloads
// ============================================================

// Overload signatures
function combine(a: string, b: string): string;
function combine(a: number, b: number): number;

// Single implementation
function combine(a: string | number, b: string | number): string | number {
  if (typeof a === "string" && typeof b === "string") {
    return a + b;
  }
  if (typeof a === "number" && typeof b === "number") {
    return a + b;
  }
  throw new Error("Arguments must both be strings or both be numbers");
}

console.log(combine("Hello, ", "World"));
console.log(combine(10, 20));

// ============================================================
// 19. Generics with classes
// ============================================================

class DataStore<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  getAll(): T[] {
    return [...this.items];
  }
}

const userStore = new DataStore<User>();
userStore.add(normalUser);
userStore.add(adminUser);

console.log(userStore.getAll());

// ============================================================
// 20. Asynchronous code and Promise types
// ============================================================

async function fetchFakeUser(): Promise<User> {
  // Simulate async work
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(normalUser);
    }, 10);
  });
}

async function runAsyncDemo(): Promise<void> {
  const user = await fetchFakeUser();
  console.log("Fetched user:", user.name);
}

// ============================================================
// 21. Decorator-like note
// ============================================================

/**
 * Real decorators require compiler configuration and depend on the TS/JS decorator model.
 * They are not enabled here to keep this file directly runnable.
 * In real projects, decorators are often used in frameworks like Angular or NestJS.
 */

// ============================================================
// 22. Namespaces (legacy pattern; modern code usually prefers ES modules)
// ============================================================

namespace LegacyMath {
  export function square(n: number): number {
    return n * n;
  }
}

console.log(LegacyMath.square(5));

// ============================================================
// 23. Type guards
// ============================================================

// Custom type guard function
function isAdminUser(user: User | Admin): user is Admin {
  return "permissions" in user;
}

function printUserInfo(user: User | Admin): void {
  console.log(`Name: ${user.name}`);
  if (isAdminUser(user)) {
    console.log(`Permissions: ${user.permissions.join(", ")}`);
  } else {
    console.log("Standard user");
  }
}

printUserInfo(normalUser);
printUserInfo(adminUser);

// ============================================================
// 24. Optional chaining and nullish coalescing
// ============================================================

const maybeEmailDomain =
  normalUser.email?.split("@")[1]?.toLowerCase() ?? "no-email-domain";

console.log(maybeEmailDomain);

// ============================================================
// 25. Index signatures
// ============================================================

interface StringMap {
  [key: string]: string;
}

const translations: StringMap = {
  hello: "Bonjour",
  bye: "Au revoir",
};

console.log(translations);

// ============================================================
// 26. Readonly and immutable style
// ============================================================

type Point = {
  readonly x: number;
  readonly y: number;
};

const point: Point = { x: 10, y: 20 };
// point.x = 15; // Compile error

console.log(point);

// ============================================================
// 27. Conditional types
// ============================================================

// If T is string, result is "text", otherwise "other"
type Label<T> = T extends string ? "text" : "other";

type A = Label<string>; // "text"
type B = Label<number>; // "other"

const labelA: A = "text";
const labelB: B = "other";

console.log(labelA, labelB);

// ============================================================
// 28. infer in conditional types
// ============================================================

// Extract the resolved value type from a Promise
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

type AsyncUser = UnwrapPromise<ReturnType<typeof fetchFakeUser>>; // User

const asyncUserExample: AsyncUser = normalUser;
console.log(asyncUserExample.name);

// ============================================================
// 29. Callable types
// ============================================================

type MathOperation = (a: number, b: number) => number;

const subtract: MathOperation = (a, b) => a - b;
console.log(subtract(10, 3));

// ============================================================
// 30. Intersection types
// ============================================================

type Timestamped = {
  timestamp: Date;
};

type Named = {
  name: string;
};

type NamedEvent = Timestamped & Named;

const eventRecord: NamedEvent = {
  name: "UserLoggedIn",
  timestamp: new Date(),
};

console.log(eventRecord);

// ============================================================
// 31. Module export examples
// ============================================================

// In a real file, these exports would make this file an ES module.
// They are included to showcase syntax.
export type { User, Admin, Address, ApiResponse };
export {
  add,
  multiply,
  greet,
  power,
  sumAll,
  Product,
  Employee,
  DataStore,
  fetchFakeUser,
};

// ============================================================
// 32. Run async demo at end
// ============================================================

runAsyncDemo().catch((error) => {
  console.error("Async demo failed:", error);
});

// ============================================================
// 33. const vs let demonstration
// ============================================================

const fixedName = "cannot reassign";
let changingName = "before";
changingName = "after";

console.log(fixedName, changingName);

// ============================================================
// 34. Destructuring with type inference
// ============================================================

const apiUser = {
  id: 99,
  name: "Destructured User",
  active: true,
};

const { id: destructuredId, name: destructuredName } = apiUser;
console.log(destructuredId, destructuredName);

// ============================================================
// 35. Satisfies operator
// ============================================================

// 'satisfies' checks compatibility without forcing the variable's type
const routeConfig = {
  home: "/",
  about: "/about",
  contact: "/contact",
} satisfies Record<string, string>;

console.log(routeConfig);

// ============================================================
// End of showcase
// ============================================================

console.log("TypeScript showcase complete.");
```

I can also produce a second version split into clearly labeled sections for **beginners**, **intermediate**, and **advanced** concepts.
