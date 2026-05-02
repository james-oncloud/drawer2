# Major Java language features by JDK (5–26)

Finalized **language** changes (JLS/compiler grammar and semantics) only: **not** preview/incubator features, **not** library-only APIs (e.g. `Stream`, HTTP Client), **not** JVM/GC-only changes.

Primitive types in patterns (`instanceof` / `switch` / record patterns) remain **preview** through JDK 26 ([JEP 530](https://openjdk.org/jeps/530)).

Primary references: JSRs for Java 5–7; from Java 9 onward [Oracle Java Language Changes Summary](https://docs.oracle.com/en/java/javase/26/language/java-language-changes-summary.html).

---

## JDK 5 (Java 5 / “Tiger”)

- **Generics** — parameterized types, wildcards, bounded type parameters ([JSR 14](https://jcp.org/en/jsr/detail?id=14))
- **Enhanced `for` loop** (“for-each”) over arrays and `Iterable`
- **Autoboxing and unboxing** between primitives and wrapper types ([JSR 201](https://jcp.org/en/jsr/detail?id=201))
- **`enum` types** — type-safe enumerations ([JSR 201](https://jcp.org/en/jsr/detail?id=201))
- **Variable arity methods** (“varargs”)
- **Static import**
- **Annotations** ([JSR 175](https://jcp.org/en/jsr/detail?id=175))

---

## JDK 6 (Java SE 6 / “Mustang”)

*No major new JLS syntax in this release.* JDK 6 focused on APIs, JVM, and tools (e.g. scripting API, compiler API, annotation processing).

Worth noting for source compatibility: **`@Override` on interface methods** — you may annotate methods that implement an interface abstract method with `@Override` (not accepted in Java 5).

---

## JDK 7 (Java SE 7)

“Project Coin” small language changes ([OpenJDK Coin](https://openjdk.org/projects/coin/)):

- **`try`-with-resources** — automatic closing of `AutoCloseable` resources
- **Multi-catch** — single `catch` clause with multiple exception types (`catch (A | B e)`)
- **Diamond operator** (`<>`) — type inference for generic class instance creation
- **`String` in `switch`**
- **Binary integral literals** (`0b101010`)
- **Underscores in numeric literals** (for readability, e.g. `1_000_000`)

---

## JDK 8

- **Lambda expressions** and **method references**
- **Default methods** and **`static` methods** in interfaces
- **Type annotations** (JSR 308) and **repeating annotations**

---

## JDK 9

- **Java Platform Module System** (`module-info.java`, module keywords/path rules)
- **Milling Project Coin** ([JEP 213](https://openjdk.org/jeps/213)), including **private interface methods**, **diamond with anonymous classes** where applicable, **`try-with-resources` on effectively-final variables**, and related small grammar/rules updates
- **JSR 334** small enhancements reflected in the language specification

---

## JDK 10

- **`var`** — local variable type inference ([JEP 286](https://openjdk.org/jeps/286))

---

## JDK 11

- **`var` for lambda parameters** ([JEP 323](https://openjdk.org/jeps/323))

---

## JDK 12

*No new finalized language features.* (Switch expressions were **preview** only.)

---

## JDK 13

*No new finalized language features.* (Text blocks and switch expressions were **preview** only.)

---

## JDK 14

- **Switch expressions** (and extended `switch` statement rules) finalized ([JEP 361](https://openjdk.org/jeps/361))

---

## JDK 15

- **Text blocks** ([JEP 378](https://openjdk.org/jeps/378))

---

## JDK 16

- **`record` classes** ([JEP 395](https://openjdk.org/jeps/395))
- **Pattern matching for `instanceof`** ([JEP 394](https://openjdk.org/jeps/394))

---

## JDK 17

- **Sealed classes and interfaces** ([JEP 409](https://openjdk.org/jeps/409))

---

## JDK 18

*No new finalized language features.* (Pattern matching for `switch` was **preview** only.)

---

## JDK 19

*No new finalized language features.* (Record patterns / `switch` patterns were **preview** only.)

---

## JDK 20

*No new finalized language features.*

---

## JDK 21

- **Record patterns** ([JEP 440](https://openjdk.org/jeps/440))
- **Pattern matching for `switch`** ([JEP 441](https://openjdk.org/jeps/441))

---

## JDK 22

- **Unnamed variables and patterns** (`_`) ([JEP 456](https://openjdk.org/jeps/456))

---

## JDK 23

*No new finalized language features.* (Module import declarations, flexible constructors, compact/simple sources, primitive patterns — all **preview**.)

---

## JDK 24

*No new finalized language features.*

---

## JDK 25

- **Module import declarations** ([JEP 511](https://openjdk.org/jeps/511))
- **Compact source files and instance `main` methods** ([JEP 512](https://openjdk.org/jeps/512))
- **Flexible constructor bodies** (statements before `super()` / `this()`) ([JEP 513](https://openjdk.org/jeps/513))

---

## JDK 26

*No new finalized language features.* (Primitive types in patterns / `instanceof` / `switch` are still **Fourth Preview**, [JEP 530](https://openjdk.org/jeps/530).)

---

## Note

For “everything that shipped in the JDK” (APIs, tools, performance, security), see release notes per version; this document lists **language** features that are **final** (not preview) in each GA release.
