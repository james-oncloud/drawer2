# Sealed classes and interfaces

A **sealed** class or interface **restricts** which other types may **extend** or **implement** it. The permitted subtypes are listed in a **`permits`** clause (or inferred when **all** permitted types live in the **same compilation unit**).

- **Finalized:** JDK 17 ([JEP 409](https://openjdk.org/jeps/409))

**Why use it:** Model a **closed** family of types (AST nodes, payment kinds, IPC messages), document allowed implementations, and enable **exhaustive** **`switch`** when combined with **pattern matching**.

---

## 1. Sealed interface with `permits`

Only **`Circle`**, **`Rect`**, and **`Empty`** may implement **`Shape`**.

```java
public sealed interface Shape permits Circle, Rect, Empty { }

public final class Circle implements Shape {
    public final double radius;
    public Circle(double radius) { this.radius = radius; }
}

public final class Rect implements Shape {
    public final double w, h;
    public Rect(double w, double h) { this.w = w; this.h = h; }
}

public final class Empty implements Shape {
    public static final Empty INSTANCE = new Empty();
    private Empty() {}
}
```

**Permitted types** must be **accessible** to the sealed type and must be **`final`**, **`sealed`**, or **`non-sealed`** (see §3).

---

## 2. Sealed class

```java
public abstract sealed class Result<T> permits Ok, Err { }

public final class Ok<T> extends Result<T> {
    public final T value;
    public Ok(T value) { this.value = value; }
}

public final class Err<T> extends Result<T> {
    public final String message;
    public Err(String message) { this.message = message; }
}
```

---

## 3. `final` / `sealed` / `non-sealed` permitted subtypes

| Modifier | Meaning |
|----------|--------|
| **`final`** | No further subclasses. |
| **`sealed`** | This type is sealed too; it declares its own **`permits`** list. |
| **`non-sealed`** | Stops the restriction: **any** class may extend this type again. |

```java
public sealed interface Node permits Leaf, Branch { }

public final class Leaf implements Node { }

public non-sealed class Branch implements Node {
    // subclasses outside your sealed hierarchy are allowed below Branch
}
```

---

## 4. Records as permitted types

**Records** are implicitly **`final`**, so they fit sealed hierarchies cleanly.

```java
public sealed interface Expr permits Const, Add, Neg { }

public record Const(int value) implements Expr { }
public record Add(Expr left, Expr right) implements Expr { }
public record Neg(Expr inner) implements Expr { }
```

---

## 5. Omitting `permits` (same compilation unit)

If **all** permitted subtypes appear in the **same compilation unit**, the compiler may **infer** them and you can omit **`permits`** (many teams still write **`permits`** explicitly for readability).

```java
sealed interface ColorLabel permits Red, Green, Blue { }

final class Red implements ColorLabel { }
final class Green implements ColorLabel { }
final class Blue implements ColorLabel { }
```

---

## 6. Exhaustive `switch` (with pattern matching)

With **pattern matching for `switch`** (JDK 21+), a **`switch`** over a **sealed** interface’s **static type** can be **exhaustive** without **`default`** when every permitted variant has a **`case`**.

```java
static int eval(Expr e) {
    return switch (e) {
        case Const(int v) -> v;
        case Add(Expr l, Expr r) -> eval(l) + eval(r);
        case Neg(Expr inner) -> -eval(inner);
    };
}
```

Adding a new **`permits`** subtype later forces you to update **`switch`** exhaustiveness (often a **compile error** until handled).

---

## 7. Packages and modules

Permitted types must be **visible** to the sealed type; in JPMS, **`exports`** / **`opens`** must allow access across modules if needed.

---

## 8. Runnable example (three explicit permits)

The **`switch`** below uses **pattern matching for `switch`** — use **JDK 21+**. Sealed types themselves work from **JDK 17+** with classic `if`/`switch` if you prefer.

```java
sealed interface Answer permits Yes, No, Undecided { }

final class Yes implements Answer {
    @Override public String toString() { return "yes"; }
}

final class No implements Answer {
    @Override public String toString() { return "no"; }
}

final class Undecided implements Answer {
    @Override public String toString() { return "undecided"; }
}

public class SealedDemo {
    public static void main(String[] args) {
        Answer a = new Yes();
        String s = switch (a) {
            case Yes y -> y.toString();
            case No n -> n.toString();
            case Undecided u -> u.toString();
        };
        System.out.println(s);
    }
}
```

Put all types in **one file** named **`SealedDemo.java`** (or split across files with **`permits`** listing top-level class names and packages correctly).

```bash
javac SealedDemo.java
java SealedDemo
```

---

## See also

- **`java-pattern-matching.md`** — `switch` patterns and exhaustiveness.
- **`java-records.md`** — records in sealed hierarchies.
- **`java-language-features-by-jdk-5-26.md`** — sealed types finalized in JDK 17.
