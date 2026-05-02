# Java `record` classes

A **`record`** is a **restricted kind of class** that declares transparent carriers for **immutable data**. The compiler generates a **constructor**, **accessor methods** (one per component), **`equals`**, **`hashCode`**, and **`toString`** from the **record header** (the component list).

- **Finalized:** JDK 16 ([JEP 395](https://openjdk.org/jeps/395))

---

## 1. Minimal record

```java
public record Point(int x, int y) { }

Point p = new Point(3, 4);
System.out.println(p.x());       // accessor: component name + ()
System.out.println(p.y());
System.out.println(p);           // toString() generated
```

Accessors use the **component names** (`x()`, `y()`), not JavaBean-style `getX()` unless you add them yourself.

---

## 2. Generated behavior (mental model)

For `record Point(int x, int y)` the compiler effectively supplies:

- Constructor **`Point(int x, int y)`**
- Methods **`int x()`**, **`int y()`**
- **`equals` / `hashCode`** based on **all** components
- **`toString`** listing components

Records are **`final`** and extend **`java.lang.Record`** implicitly; **cannot** extend another class.

---

## 3. Compact constructor — validation / normalization

Use a **compact constructor** (no parameter list) to run code **before** field assignment; assign fields implicitly after it completes.

```java
public record Product(long id, String name, double price) {
    public Product {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("name cannot be blank");
        }
        if (price < 0) {
            throw new IllegalArgumentException("price cannot be negative");
        }
        name = name.strip(); // normalize: assigns component `name`
    }
}
```

---

## 4. Extra constructors and static factories

Delegate to the **canonical** constructor with **`this(...)`**.

```java
public record Range(int lo, int hi) {
    public Range {
        if (lo > hi) {
            throw new IllegalArgumentException("lo must be <= hi");
        }
    }

    /** Convenience: single value as a point range */
    public Range(int value) {
        this(value, value);
    }

    public static Range singleton(int v) {
        return new Range(v, v);
    }
}
```

---

## 5. Instance methods and derived values

```java
public record LineItem(Product product, int quantity) {
    public double lineTotal() {
        return product.price() * quantity;
    }
}
```

---

## 6. Static fields and static methods

Allowed; use like any class.

```java
public record Unit(String symbol) {
    public static final Unit KG = new Unit("kg");
    public static final Unit M = new Unit("m");
}
```

---

## 7. Implementing interfaces

```java
public sealed interface Shape permits Circle, Rectangle { double area(); }

public record Circle(double radius) implements Shape {
    @Override
    public double area() {
        return Math.PI * radius * radius;
    }
}

public record Rectangle(double width, double height) implements Shape {
    @Override
    public double area() {
        return width * height;
    }
}
```

Records work well with **`sealed`** types ([JEP 409](https://openjdk.org/jeps/409), JDK 17).

---

## 8. Generic records

```java
public record Pair<A, B>(A first, B second) { }

Pair<String, Integer> p = new Pair<>("hello", 42);
```

---

## 9. Reflection and `java.lang.Record`

All records implicitly extend **`java.lang.Record`**. You can reflect on **`RecordComponent`** for metadata.

---

## 10. Pattern matching (later JDKs)

With **record patterns** and **pattern matching for `switch`**, you can deconstruct records in **`instanceof`** and **`switch`** (see **`java-language-features-by-jdk-5-26.md`** and **`java_21_swtich.md`**).

```java
static double paymentAmount(Payment p) {
    return switch (p) {
        case CardPayment(_, double amount) -> amount;
        case CashPayment(double amount) -> amount;
        case WirePayment(_, double amount) -> amount;
    };
}
```

---

## 11. Rules and limitations (short)

| Topic | Rule |
|--------|------|
| Inheritance | Cannot **`extends`** another class (except implicit `Record`). |
| Extension | Record **can** implement interfaces; **`sealed`** hierarchies are common. |
| Mutability | Components are **`final`**; do not expose mutable objects unless you accept that risk. |
| Additional instance fields | Not allowed—only what the header declares (except **static** fields). |
| Serialization | Records can be serialized; semantics follow normal Java serialization rules for the generated form. |

---

## 12. Runnable example

```java
public record Customer(long id, String name, String city) {
    public Customer {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("name");
        }
    }

    public String displayName() {
        return name + " (" + city + ")";
    }

    public static void main(String[] args) {
        Customer c = new Customer(1L, "Alice", "New York");
        System.out.println(c.id());
        System.out.println(c.displayName());
        System.out.println(c);
    }
}
```

```bash
javac Customer.java
java Customer
```

---

## See also

- **`java_record.md`** — extra snippets in this folder.
- **`java-language-features-by-jdk-5-26.md`** — records finalized in JDK 16.
- [JLS: Record Classes](https://docs.oracle.com/javase/specs/jls/se21/html/jls-8.html#jls-8.10) (URL tracks a recent SE version).
