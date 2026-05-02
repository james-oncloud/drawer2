# Lambda expressions

A **lambda expression** is a compact way to implement a **functional interface** (an interface with exactly one abstract method, a “SAM” type). The compiler turns the lambda into bytecode that invokes that single method.

- **Language feature:** JDK 8 ([JEP 126](https://openjdk.org/jeps/126), JSR 335)

---

## 1. Basic syntax

```java
// no parameters
Runnable r = () -> System.out.println("run");

// one parameter — parentheses optional
java.util.function.Function<String, Integer> len = s -> s.length();

// multiple parameters
java.util.function.BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;

// body with statements — braces and return if needed
java.util.function.Predicate<String> nonEmpty = s -> {
    return s != null && !s.isBlank();
};
```

---

## 2. Functional interfaces (SAM types)

The **target type** of a lambda must be a functional interface.

```java
@FunctionalInterface
interface IntPredicate {
    boolean test(int value);
}

IntPredicate even = x -> x % 2 == 0;
System.out.println(even.test(4)); // true
```

Built-in examples in `java.util.function`: `Predicate<T>`, `Function<T,R>`, `Consumer<T>`, `Supplier<T>`, `UnaryOperator<T>`, primitive variants (`IntPredicate`, `LongSupplier`, …).

---

## 3. Lambdas with collections and streams

```java
import java.util.*;

List<String> names = Arrays.asList("amy", "bob", "ada");

// Comparator via lambda
names.sort((a, b) -> a.compareToIgnoreCase(b));

// Stream operations
long shortNames = names.stream()
    .filter(s -> s.length() <= 3)
    .count();
```

---

## 4. Capturing variables (“closures”)

Lambdas may read **effectively final** locals and parameters from the enclosing scope.

```java
String prefix = "ID:";
Runnable printId = () -> System.out.println(prefix + Thread.currentThread().threadId());
printId.run();

// prefix = "x"; // illegal if lambda captures prefix — must stay effectively final
```

Assigning to `prefix` after the lambda closes over it would break **effective finality**, so the compiler rejects it.

---

## 5. `this` and parameter shadowing

Inside an instance method, `this` in a lambda refers to the **enclosing class instance**, not to an anonymous inner object.

```java
class Demo {
    void run() {
        Runnable r = () -> System.out.println(this.getClass().getSimpleName());
        r.run(); // prints Demo
    }
}
```

---

## 6. Exceptions and lambdas

Checked exceptions must match the functional interface’s abstract method. If the interface doesn’t declare them, you cannot throw checked exceptions from the lambda body unless you handle them inside.

```java
Runnable safe = () -> {
    try {
        Thread.sleep(100);
    } catch (InterruptedException e) {
        Thread.currentThread().interrupt();
    }
};
```

---

## 7. Method references (common companion feature)

When the lambda only forwards to an existing method, use **`::`**.

```java
List<String> list = Arrays.asList("a", "b", "c");
list.forEach(System.out::println);           // instance method of PrintStream
list.sort(String::compareToIgnoreCase);    // static-like bound reference

List<Integer> nums = Arrays.asList(1, 2, 3);
nums.stream().map(String::valueOf);        // static method reference
```

Kinds: **static**, **bound instance**, **unbound instance** (`String::length`), **constructor** (`ArrayList::new`).

---

## 8. Minimal runnable example

```java
import java.util.function.*;

public class LambdaDemo {
    public static void main(String[] args) {
        Predicate<Integer> positive = n -> n > 0;
        Function<Integer, String> label = n -> "n=" + n;

        System.out.println(positive.test(5));           // true
        System.out.println(label.apply(7));             // n=7

        Runnable hello = () -> System.out.println("Hello");
        hello.run();
    }
}
```

```bash
javac LambdaDemo.java
java LambdaDemo
```

---

## See also

- **`java-language-features-by-jdk-5-26.md`** — JDK 8 language additions (lambdas, method references, default methods).
- [JLS §15.27 Lambda Expressions](https://docs.oracle.com/javase/specs/jls/se21/html/jls-15.html#jls-15.27) (link may track current SE version).
