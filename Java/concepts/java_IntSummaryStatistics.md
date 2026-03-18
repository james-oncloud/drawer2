# IntSummaryStatistics

Here are clear **Java 17 examples of `IntSummaryStatistics`** 👇

---

## 1. Basic Usage with `IntStream`

```java
import java.util.IntSummaryStatistics;
import java.util.stream.IntStream;

public class Example1 {
    public static void main(String[] args) {
        IntSummaryStatistics stats = IntStream.of(10, 20, 30, 40, 50)
                .summaryStatistics();

        System.out.println("Count: " + stats.getCount());
        System.out.println("Sum: " + stats.getSum());
        System.out.println("Min: " + stats.getMin());
        System.out.println("Max: " + stats.getMax());
        System.out.println("Average: " + stats.getAverage());
    }
}
```

---

## 2. From a Collection (List → Stream)

```java
import java.util.IntSummaryStatistics;
import java.util.List;

public class Example2 {
    public static void main(String[] args) {
        List<Integer> numbers = List.of(5, 15, 25, 35);

        IntSummaryStatistics stats = numbers.stream()
                .mapToInt(Integer::intValue)
                .summaryStatistics();

        System.out.println(stats);
    }
}
```

---

## 3. Using `Collectors.summarizingInt`

```java
import java.util.IntSummaryStatistics;
import java.util.List;
import java.util.stream.Collectors;

public class Example3 {
    public static void main(String[] args) {
        List<String> words = List.of("apple", "banana", "cherry");

        IntSummaryStatistics stats = words.stream()
                .collect(Collectors.summarizingInt(String::length));

        System.out.println("Average length: " + stats.getAverage());
    }
}
```

---

## 4. Custom Objects Example

```java
import java.util.IntSummaryStatistics;
import java.util.List;
import java.util.stream.Collectors;

class Person {
    String name;
    int age;

    Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
}

public class Example4 {
    public static void main(String[] args) {
        List<Person> people = List.of(
                new Person("Alice", 25),
                new Person("Bob", 30),
                new Person("Charlie", 20)
        );

        IntSummaryStatistics stats = people.stream()
                .collect(Collectors.summarizingInt(p -> p.age));

        System.out.println("Min age: " + stats.getMin());
        System.out.println("Max age: " + stats.getMax());
    }
}
```

---

## 5. Manual Update (Without Streams)

```java
import java.util.IntSummaryStatistics;

public class Example5 {
    public static void main(String[] args) {
        IntSummaryStatistics stats = new IntSummaryStatistics();

        stats.accept(10);
        stats.accept(20);
        stats.accept(30);

        System.out.println(stats);
    }
}
```

---

## Key Methods Recap

```java
stats.getCount();   // number of elements
stats.getSum();     // total sum
stats.getMin();     // minimum value
stats.getMax();     // maximum value
stats.getAverage(); // average value
```

---

If you want, I can show a **real-world use case (e.g. grouping + stats in one pipeline)** which is very common in interviews.