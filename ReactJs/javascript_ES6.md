```javascript
/**
 * JavaScript ES6+ / ESNext Showcase
 * ---------------------------------
 * A single-file script that demonstrates many modern JavaScript features
 * and concepts with explanatory comments.
 *
 * You can run most of this in modern Node.js or a modern browser console.
 * Some features may require a recent runtime.
 */

/* ============================================================================
 * 1. Strict mode
 * ============================================================================
 * Modern ES modules are strict by default, but we include this here because
 * it is still useful in standalone script files.
 */
"use strict";

/* ============================================================================
 * 2. Primitive values and dynamic typing
 * ============================================================================
 * JavaScript is dynamically typed: variables do not have fixed types.
 */
const appName = "ESNext Showcase";     // string
const version = 1;                     // number
const isActive = true;                 // boolean
const nothing = null;                  // null
let notAssigned;                       // undefined
const uniqueId = Symbol("id");         // symbol
const hugeNumber = 1234567890123456789012345678901234567890n; // bigint

console.log("App:", appName, version, isActive, nothing, notAssigned, uniqueId, hugeNumber);

/* ============================================================================
 * 3. let / const vs var
 * ============================================================================
 * - const: block-scoped, cannot be reassigned
 * - let: block-scoped, can be reassigned
 * - var: function-scoped, older style, usually avoided in modern code
 */
let counter = 0;
counter += 1;

const config = {
  environment: "dev"
};

// Allowed: mutating object contents
config.environment = "prod";

// Not allowed: reassigning const itself
// config = {}; // Uncommenting this would throw an error

console.log("Counter:", counter);
console.log("Config:", config);

/* ============================================================================
 * 4. Template literals
 * ============================================================================
 * Backticks allow interpolation and multi-line strings.
 */
const userName = "James";
const greeting = `Hello, ${userName}.
Welcome to the ${appName} example.`;

console.log(greeting);

/* ============================================================================
 * 5. Default parameters
 * ============================================================================
 */
function multiply(a = 1, b = 1) {
  return a * b;
}

console.log("multiply():", multiply());
console.log("multiply(3, 4):", multiply(3, 4));

/* ============================================================================
 * 6. Arrow functions
 * ============================================================================
 * Useful for short function expressions and lexical `this` behavior.
 */
const square = x => x * x;
const add = (a, b) => a + b;

console.log("square(5):", square(5));
console.log("add(2, 3):", add(2, 3));

/* ============================================================================
 * 7. Rest parameters and spread syntax
 * ============================================================================
 * - Rest: collect remaining arguments into an array
 * - Spread: expand arrays/objects into individual values
 */
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}

const nums = [10, 20, 30];
console.log("sum(...nums):", sum(...nums));

const originalArray = [1, 2, 3];
const extendedArray = [...originalArray, 4, 5];
console.log("extendedArray:", extendedArray);

/* ============================================================================
 * 8. Destructuring
 * ============================================================================
 * Extract values from arrays and objects cleanly.
 */
const point = { x: 10, y: 20, z: 30 };
const { x, y, z = 0 } = point;

const colors = ["red", "green", "blue"];
const [firstColor, secondColor, thirdColor] = colors;

console.log("Destructured object:", x, y, z);
console.log("Destructured array:", firstColor, secondColor, thirdColor);

/* ============================================================================
 * 9. Enhanced object literals
 * ============================================================================
 * Modern shorthand for objects and methods.
 */
const host = "localhost";
const port = 8080;

const server = {
  host, // same as host: host
  port, // same as port: port
  start() {
    return `Server running at ${this.host}:${this.port}`;
  }
};

console.log(server.start());

/* ============================================================================
 * 10. Optional chaining and nullish coalescing
 * ============================================================================
 * - Optional chaining `?.` avoids errors when a value may be null/undefined
 * - Nullish coalescing `??` provides fallback only for null/undefined
 */
const profile = {
  user: {
    details: {
      displayName: "Alex"
    }
  }
};

const displayName = profile?.user?.details?.displayName ?? "Anonymous";
const missingName = profile?.user?.settings?.nickname ?? "No nickname";

console.log("displayName:", displayName);
console.log("missingName:", missingName);

/* ============================================================================
 * 11. Array methods
 * ============================================================================
 * Modern JavaScript uses many functional-style array methods.
 */
const products = [
  { id: 1, name: "Laptop", price: 1200 },
  { id: 2, name: "Mouse", price: 25 },
  { id: 3, name: "Keyboard", price: 80 }
];

const productNames = products.map(p => p.name);
const expensiveProducts = products.filter(p => p.price > 100);
const totalPrice = products.reduce((sum, p) => sum + p.price, 0);
const foundProduct = products.find(p => p.id === 2);
const hasCheapProduct = products.some(p => p.price < 30);
const allHaveNames = products.every(p => typeof p.name === "string");

console.log("productNames:", productNames);
console.log("expensiveProducts:", expensiveProducts);
console.log("totalPrice:", totalPrice);
console.log("foundProduct:", foundProduct);
console.log("hasCheapProduct:", hasCheapProduct);
console.log("allHaveNames:", allHaveNames);

/* ============================================================================
 * 12. Sets and Maps
 * ============================================================================
 * - Set stores unique values
 * - Map stores key/value pairs with flexible key types
 */
const uniqueTags = new Set(["js", "react", "js", "node"]);
uniqueTags.add("esnext");

const userRoles = new Map();
userRoles.set("alice", "admin");
userRoles.set("bob", "editor");

console.log("Set:", [...uniqueTags]);
console.log("Map bob role:", userRoles.get("bob"));

/* ============================================================================
 * 13. Classes and inheritance
 * ============================================================================
 * JavaScript supports class syntax over prototype-based inheritance.
 */
class Animal {
  constructor(name) {
    this.name = name;
  }

  speak() {
    return `${this.name} makes a sound.`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // call parent constructor
    this.breed = breed;
  }

  speak() {
    return `${this.name} barks.`;
  }
}

const dog = new Dog("Rex", "Labrador");
console.log(dog.speak());
console.log("Dog breed:", dog.breed);

/* ============================================================================
 * 14. Private class fields
 * ============================================================================
 * `#` makes a true private field inside a class.
 */
class BankAccount {
  #balance = 0;

  deposit(amount) {
    if (amount > 0) {
      this.#balance += amount;
    }
  }

  getBalance() {
    return this.#balance;
  }
}

const account = new BankAccount();
account.deposit(150);
console.log("Balance:", account.getBalance());
// console.log(account.#balance); // Syntax error if uncommented

/* ============================================================================
 * 15. Static methods and fields
 * ============================================================================
 */
class MathHelper {
  static PI = 3.14159;

  static areaOfCircle(radius) {
    return MathHelper.PI * radius * radius;
  }
}

console.log("Circle area:", MathHelper.areaOfCircle(2));

/* ============================================================================
 * 16. Getters and setters
 * ============================================================================
 * Useful for controlled property access.
 */
class Temperature {
  constructor(celsius) {
    this._celsius = celsius;
  }

  get celsius() {
    return this._celsius;
  }

  set celsius(value) {
    if (value < -273.15) {
      throw new Error("Temperature cannot be below absolute zero.");
    }
    this._celsius = value;
  }

  get fahrenheit() {
    return (this._celsius * 9) / 5 + 32;
  }
}

const temp = new Temperature(25);
console.log("Temp C:", temp.celsius);
console.log("Temp F:", temp.fahrenheit);

/* ============================================================================
 * 17. Promises
 * ============================================================================
 * Promises represent future completion/failure of async operations.
 */
function wait(ms) {
  return new Promise(resolve => {
    setTimeout(() => resolve(`Waited ${ms}ms`), ms);
  });
}

/* ============================================================================
 * 18. async / await
 * ============================================================================
 * Cleaner syntax for Promise-based asynchronous code.
 */
async function demoAsyncAwait() {
  try {
    const result = await wait(100);
    console.log("Async result:", result);
  } catch (error) {
    console.error("Async error:", error);
  }
}

/* ============================================================================
 * 19. Promise.all / Promise.allSettled
 * ============================================================================
 * Useful for running async tasks in parallel.
 */
async function demoPromiseCombinators() {
  const results = await Promise.all([
    wait(50),
    wait(80),
    Promise.resolve("Immediate result")
  ]);

  console.log("Promise.all results:", results);

  const settled = await Promise.allSettled([
    Promise.resolve("OK"),
    Promise.reject(new Error("Something failed"))
  ]);

  console.log("Promise.allSettled results:", settled);
}

/* ============================================================================
 * 20. Generators
 * ============================================================================
 * Generators can pause and resume execution using `yield`.
 */
function* idGenerator() {
  let id = 1;
  while (true) {
    yield id++;
  }
}

const ids = idGenerator();
console.log("Generated IDs:", ids.next().value, ids.next().value, ids.next().value);

/* ============================================================================
 * 21. Iterables and for...of
 * ============================================================================
 * `for...of` iterates over iterable objects such as arrays, strings, maps, sets.
 */
for (const color of colors) {
  console.log("Color:", color);
}

/* ============================================================================
 * 22. for...in
 * ============================================================================
 * `for...in` iterates over object property names.
 */
for (const key in point) {
  console.log(`point[${key}] =`, point[key]);
}

/* ============================================================================
 * 23. Symbols
 * ============================================================================
 * Symbols can be used for unique property keys.
 */
const internalId = Symbol("internalId");
const record = {
  name: "Confidential",
  [internalId]: 12345
};

console.log("Record name:", record.name);
console.log("Record symbol value:", record[internalId]);

/* ============================================================================
 * 24. Object spread and immutability-style updates
 * ============================================================================
 * Very common in React and functional-style code.
 */
const oldState = {
  theme: "light",
  notifications: true
};

const newState = {
  ...oldState,
  theme: "dark"
};

console.log("Old state:", oldState);
console.log("New state:", newState);

/* ============================================================================
 * 25. Shallow copy caveat
 * ============================================================================
 * Spread copies only one level deep.
 */
const nestedOriginal = {
  user: {
    name: "Sam"
  }
};

const nestedCopy = { ...nestedOriginal };
nestedCopy.user.name = "Changed"; // also affects nestedOriginal.user.name

console.log("nestedOriginal:", nestedOriginal);
console.log("nestedCopy:", nestedCopy);

/* ============================================================================
 * 26. Logical assignment operators
 * ============================================================================
 * Modern shorthand for conditional assignment.
 */
let settings = {
  retries: 0,
  timeout: null
};

settings.retries ||= 3;  // assigns because 0 is falsy
settings.timeout ??= 5000; // assigns because null is nullish

console.log("Logical assignment settings:", settings);

/* ============================================================================
 * 27. Numeric separators
 * ============================================================================
 * Improves readability for large numeric literals.
 */
const oneMillion = 1_000_000;
console.log("Numeric separator:", oneMillion);

/* ============================================================================
 * 28. BigInt
 * ============================================================================
 * For integers larger than Number.MAX_SAFE_INTEGER.
 */
const bigA = 9_007_199_254_740_991n;
const bigB = 10n;
console.log("BigInt addition:", bigA + bigB);

/* ============================================================================
 * 29. Short-circuiting
 * ============================================================================
 * Common concise patterns in JavaScript.
 */
const maybeValue = "";
const fallback1 = maybeValue || "fallback with ||";  // empty string is falsy
const fallback2 = maybeValue ?? "fallback with ??";  // empty string is not null/undefined

console.log("fallback1:", fallback1);
console.log("fallback2:", fallback2);

/* ============================================================================
 * 30. Tagged template literals
 * ============================================================================
 * Allows custom processing of template strings.
 */
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = i < values.length ? `[${values[i]}]` : "";
    return result + str + value;
  }, "");
}

const language = "JavaScript";
const tagged = highlight`Learning ${language} is powerful.`;
console.log("Tagged template:", tagged);

/* ============================================================================
 * 31. Regular expression named capture groups
 * ============================================================================
 */
const datePattern = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const dateMatch = "2026-03-22".match(datePattern);

if (dateMatch?.groups) {
  const { year, month, day } = dateMatch.groups;
  console.log("Parsed date:", year, month, day);
}

/* ============================================================================
 * 32. Error handling
 * ============================================================================
 * try/catch/finally is essential for robust code.
 */
function parseJsonSafely(jsonText) {
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Invalid JSON:", error.message);
    return null;
  } finally {
    console.log("parseJsonSafely completed.");
  }
}

console.log(parseJsonSafely('{"valid": true}'));
console.log(parseJsonSafely("{ invalid json }"));

/* ============================================================================
 * 33. Closures
 * ============================================================================
 * Functions can capture variables from their surrounding scope.
 */
function createCounter(start = 0) {
  let current = start;
  return () => ++current;
}

const nextCount = createCounter(10);
console.log("Closure counter:", nextCount(), nextCount(), nextCount());

/* ============================================================================
 * 34. Higher-order functions
 * ============================================================================
 * Functions can be passed around as values.
 */
function applyOperation(a, b, operation) {
  return operation(a, b);
}

console.log("Higher-order function:", applyOperation(4, 5, (m, n) => m * n));

/* ============================================================================
 * 35. Immediately invoked function expression (IIFE)
 * ============================================================================
 * Less common now, but still useful to know historically.
 */
(() => {
  const scopedValue = "Inside IIFE";
  console.log(scopedValue);
})();

/* ============================================================================
 * 36. Dynamic property names
 * ============================================================================
 */
const propertyName = "status";
const response = {
  [propertyName]: "success",
  [`${propertyName}Code`]: 200
};

console.log("Dynamic object keys:", response);

/* ============================================================================
 * 37. Object.hasOwn
 * ============================================================================
 * Modern and clearer way to test own properties.
 */
console.log("Has own 'x':", Object.hasOwn(point, "x"));
console.log("Has own 'toString':", Object.hasOwn(point, "toString"));

/* ============================================================================
 * 38. Top-level-like async flow wrapper
 * ============================================================================
 * In ES modules, top-level await is allowed. In plain scripts, we often use
 * an async wrapper function instead.
 */
async function main() {
  console.log("=== Starting async demos ===");
  await demoAsyncAwait();
  await demoPromiseCombinators();

  /* ==========================================================================
   * 39. WeakMap and WeakSet (concept demonstration)
   * ==========================================================================
   * Useful for associating metadata with objects without preventing garbage
   * collection. Keys must be objects.
   */
  const weakMap = new WeakMap();
  const weakSet = new WeakSet();

  const objKey = {};
  weakMap.set(objKey, { cached: true });
  weakSet.add(objKey);

  console.log("WeakMap has objKey:", weakMap.has(objKey));
  console.log("WeakSet has objKey:", weakSet.has(objKey));

  /* ==========================================================================
   * 40. Array at()
   * ==========================================================================
   * Modern way to access from the end using negative indexes.
   */
  const letters = ["a", "b", "c", "d"];
  console.log("letters.at(0):", letters.at(0));
  console.log("letters.at(-1):", letters.at(-1));

  /* ==========================================================================
   * 41. Object entries / values / fromEntries
   * ==========================================================================
   */
  const settingsObject = { darkMode: true, compact: false };
  const entries = Object.entries(settingsObject);
  const rebuilt = Object.fromEntries(entries);

  console.log("Object.entries:", entries);
  console.log("Object.values:", Object.values(settingsObject));
  console.log("Object.fromEntries:", rebuilt);

  /* ==========================================================================
   * 42. String utilities
   * ==========================================================================
   */
  const raw = "  hello world  ";
  console.log("trim:", raw.trim());
  console.log("startsWith:", raw.trim().startsWith("hello"));
  console.log("includes:", raw.includes("world"));
  console.log("replaceAll:", "a-b-c".replaceAll("-", ":"));

  /* ==========================================================================
   * 43. Null-safe function result access
   * ==========================================================================
   */
  function findUser(id) {
    if (id === 1) {
      return { profile: { email: "user@example.com" } };
    }
    return null;
  }

  console.log("Found email:", findUser(1)?.profile?.email ?? "Not found");
  console.log("Missing email:", findUser(99)?.profile?.email ?? "Not found");

  /* ==========================================================================
   * 44. Freeze object
   * ==========================================================================
   * Prevents further top-level mutation.
   */
  const frozenConfig = Object.freeze({ apiUrl: "/api" });
  console.log("Frozen config:", frozenConfig);
  // frozenConfig.apiUrl = "/new-api"; // fails silently or throws in strict mode

  /* ==========================================================================
   * 45. Final summary object
   * ==========================================================================
   */
  const summary = {
    language: "JavaScript",
    style: "ES6+ / ESNext",
    conceptsShown: [
      "let/const",
      "template literals",
      "arrow functions",
      "destructuring",
      "spread/rest",
      "classes",
      "private fields",
      "promises",
      "async/await",
      "generators",
      "maps/sets",
      "optional chaining",
      "nullish coalescing",
      "closures",
      "higher-order functions"
    ]
  };

  console.log("Summary:", summary);
}

/* ============================================================================
 * 46. Run the main function
 * ============================================================================
 */
main().catch(error => {
  console.error("Unhandled error in main():", error);
});
```

I can also turn this into a **React-focused JavaScript showcase file** next, with examples like props, state, hooks, immutability, event handling, async fetch, and common patterns.
