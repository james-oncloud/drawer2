# Java pattern matching

**Pattern matching** lets you **test** a value’s shape and **extract** parts of it in one step—typically with **`instanceof`**, **`switch`**, and **record patterns**. Syntax and rules evolved across several JDKs; below is a practical tour with examples.

| Mechanism | Finalized (representative) |
|-----------|----------------------------|
| `instanceof` + **type pattern** | JDK 16 ([JEP 394](https://openjdk.org/jeps/394)) |
| **Record patterns** (deconstruction) | JDK 21 ([JEP 440](https://openjdk.org/jeps/440)) |
| **`switch`**: patterns, dominance, exhaustiveness | JDK 21 ([JEP 441](https://openjdk.org/jeps/441)) |
| **Unnamed** variables / patterns (`_`) | JDK 22 ([JEP 456](https://openjdk.org/jeps/456)) |

---

## 1. Pattern matching for `instanceof`

Instead of cast-after-test:

```java
// Old style
if (obj instanceof String) {
    String s = (String) obj;
    System.out.println(s.length());
}
```

Use a **type pattern**: if the test succeeds, **`s`** is assigned.

```java
if (obj instanceof String s) {
    System.out.println(s.length());
}
```

With **generic records**, you can name type arguments on the record pattern when the compiler can match them (see [Record Patterns](https://docs.oracle.com/en/java/javase/21/language/record-patterns.html)):

```java
record Box<T>(T value) { }

void demo(Box<String> bo) {
    if (bo instanceof Box<String>(String s)) {
        System.out.println(s.toUpperCase());
    }
}
```

You can also use **`var`** in component positions and rely on inference (`Box(var v)`).

---

## 2. Record patterns (deconstruction)

A **record pattern** matches a record **by type** and binds **components**.

```java
record Point(int x, int y) { }

double norm(Object o) {
    if (o instanceof Point(int x, int y)) {
        return Math.hypot(x, y);
    }
    return Double.NaN;
}
```

Nested patterns deconstruct inside-out:

```java
record Line(Point a, Point b) { }

double length(Object o) {
    if (o instanceof Line(Point(int x1, int y1), Point(int x2, int y2)) {
        return Math.hypot(x2 - x1, y2 - y1);
    }
    return Double.NaN;
}
```

---

## 3. Pattern matching for `switch`

### 3.1 Type patterns and `null`

A **`switch`** can use **pattern cases**. **`null`** is handled explicitly or falls through if you use **`case null`**.

```java
static String describe(Object o) {
    return switch (o) {
        case null -> "null";
        case Integer i -> "Integer " + i;
        case String s -> "String len=" + s.length();
        default -> "other";
    };
}
```

### 3.2 Record patterns in `switch`

```java
sealed interface Expr permits Const, Add { }
record Const(int value) implements Expr { }
record Add(Expr left, Expr right) implements Expr { }

static int eval(Expr e) {
    return switch (e) {
        case Const(int v) -> v;
        case Add(Expr l, Expr r) -> eval(l) + eval(r);
    };
}
```

When **`switch`** is an **expression** over a **sealed** hierarchy that **covers** all permitted types, the compiler can prove **exhaustiveness**—no **`default`** needed (useful but not required in all programs).

### 3.3 Guards with `when`

Add a boolean condition after the pattern:

```java
static String classify(Object o) {
    return switch (o) {
        case Integer i when i < 0 -> "negative int";
        case Integer i when i == 0 -> "zero";
        case Integer i -> "positive int";
        case String s when s.isEmpty() -> "empty string";
        case String s -> "non-empty string";
        default -> "something else";
    };
}
```

**Dominance:** broader patterns must not hide narrower ones. More **specific** cases (e.g. `when` clauses or subtypes) must appear **before** generic ones that would otherwise match first—otherwise the compiler reports an error.

---

## 4. Unnamed variables and patterns (`_`)

From **JDK 22**, use **`_`** when you do not need a binding (syntax may evolve slightly by release; use a current JDK language guide if you see compile errors on older compilers).

```java
switch (o) {
    case Point(int x, _) -> System.out.println("x=" + x); // ignore y
    default -> { }
}

for (int _ : new int[] { 1, 2, 3 }) {
    // loop body does not need element value
}
```

---

## 5. Exhaustiveness and enums

**Enum switch** should cover all constants (or include **`default`**).

```java
enum Color { RED, GREEN, BLUE }

static int rgb(Color c) {
    return switch (c) {
        case RED -> 0xFF0000;
        case GREEN -> 0x00FF00;
        case BLUE -> 0x0000FF;
    };
}
```

---

## 6. Combined example (`instanceof` + `switch` + records)

```java
sealed interface Payment permits Card, Cash {}
record Card(String last4, double amount) implements Payment {}
record Cash(double amount) implements Payment {}

static String summary(Payment p) {
    return switch (p) {
        case Card(String last4, double amt) ->
            "Card ****" + last4 + " $" + amt;
        case Cash(double amt) ->
            "Cash $" + amt;
    };
}

static boolean largeCash(Object o) {
    return o instanceof Cash(double a) && a >= 10_000;
}
```

---

## 7. Compile and run

Examples assume **JDK 21+** for record patterns + **`switch`** patterns (and **JDK 22+** if you use **`_`**). Example:

```bash
javac MyPatterns.java
java MyPatterns
```

Enable **preview** features only if you use a **preview** language feature (see `--enable-preview` and your JDK’s release notes). Final features above need **no** preview flag on **JDK 21+** (except unnamed **`_`** on **JDK 22+**).

---

## See also

- **`java-language-features-by-jdk-5-26.md`** — which JDK delivered each feature.
- **`java_21_swtich.md`** — extra switch/pattern snippets.
- **`java-records.md`** — record basics (patterns assume record construction).
