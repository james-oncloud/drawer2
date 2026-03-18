# Java Custom Stream Collectors

Below are **Java 17 exercises on implementing custom Stream collectors**, each with a **question** and a **worked answer**.

---
---
---

# Java Streaming Custom Collectors Exercises

Here’s a **clear mental model + step-by-step process** for implementing a **Java Stream custom `Collector`**.

---

# 🧠 1. What is a Collector (Concept)

A `Collector<T, A, R>` defines how to turn a stream into a result:

```java
Collector<T, A, R>
```

* **T** → input type (stream elements)
* **A** → mutable accumulation type (internal container)
* **R** → final result type

👉 Think of it as:

```
Stream<T> → (accumulate into A) → transform → R
```

---

# ⚙️ 2. The 4 Core Steps (Lifecycle)

Every collector follows this pipeline:

```
supplier → accumulator → combiner → finisher
```

---

## 2.1 Supplier (create container)

```java
Supplier<A>
```

Creates an empty mutable container.

```java
() -> new ArrayList<>()
```

---

## 2.2 Accumulator (add one element)

```java
BiConsumer<A, T>
```

Adds a stream element into the container.

```java
(list, item) -> list.add(item)
```

---

## 2.3 Combiner (merge containers)

```java
BinaryOperator<A>
```

Used in **parallel streams**.

```java
(left, right) -> {
    left.addAll(right);
    return left;
}
```

---

## 2.4 Finisher (convert to result)

```java
Function<A, R>
```

Transforms container → final result.

```java
list -> List.copyOf(list)
```

If `A == R`, this step can be skipped.

---

# 🏗️ 3. How to Implement (Step-by-Step Process)

## Step 1: Define the goal

Example:

> "Collect integers into sum + count + average"

---

## Step 2: Choose accumulation type (A)

```java
class Stats {
    long count;
    long sum;
}
```

---

## Step 3: Define accumulation logic

```java
void accept(int value) {
    count++;
    sum += value;
}
```

---

## Step 4: Define combination logic

```java
void combine(Stats other) {
    this.count += other.count;
    this.sum += other.sum;
}
```

---

## Step 5: Define final transformation

```java
double average() {
    return count == 0 ? 0 : (double) sum / count;
}
```

---

## Step 6: Build the collector

```java
import java.util.stream.Collector;

public static Collector<Integer, Stats, Double> averageCollector() {
    return Collector.of(
            Stats::new,                        // supplier
            Stats::accept,                     // accumulator
            (left, right) -> {                 // combiner
                left.combine(right);
                return left;
            },
            Stats::average                     // finisher
    );
}
```

---

# 🧩 4. Full Working Example

```java
import java.util.List;

public class CustomCollectorExample {

    public static void main(String[] args) {
        List<Integer> numbers = List.of(10, 20, 30, 40);

        double avg = numbers.stream()
                .collect(averageCollector());

        System.out.println(avg);
    }

    static class Stats {
        long count;
        long sum;

        void accept(int value) {
            count++;
            sum += value;
        }

        void combine(Stats other) {
            this.count += other.count;
            this.sum += other.sum;
        }

        double average() {
            return count == 0 ? 0 : (double) sum / count;
        }
    }

    public static java.util.stream.Collector<Integer, Stats, Double> averageCollector() {
        return java.util.stream.Collector.of(
                Stats::new,
                Stats::accept,
                (l, r) -> {
                    l.combine(r);
                    return l;
                },
                Stats::average
        );
    }
}
```

---

# ⚡ 5. Collector API Variants

## 5.1 Basic form (most common)

```java
Collector.of(supplier, accumulator, combiner)
```

Used when:

```
A == R  (no transformation needed)
```

---

## 5.2 With finisher

```java
Collector.of(supplier, accumulator, combiner, finisher)
```

Used when:

```
A != R
```

---

## 5.3 With characteristics

```java
Collector.of(
    supplier,
    accumulator,
    combiner,
    finisher,
    Collector.Characteristics.UNORDERED
)
```

---

# 🚀 6. Collector Characteristics

## IDENTITY_FINISH

* `A == R`
* No transformation needed

## UNORDERED

* Order does not matter

## CONCURRENT

* Safe for parallel updates

---

# ⚠️ 7. Common Pitfalls

### ❌ Forgetting combiner

→ breaks parallel streams

---

### ❌ Using immutable container

```java
List.of() // ❌ cannot add
```

---

### ❌ Side effects outside collector

```java
externalList.add(x) // ❌ unsafe
```

---

### ❌ Non-associative combiner

Must satisfy:

```
combine(a, combine(b, c)) == combine(combine(a, b), c)
```

---

# 🧠 8. Mental Model (Interview Gold)

Think of a collector as:

```
"How do I:
  1. create a box,
  2. put items into it,
  3. merge boxes,
  4. turn box into result?"
```

---

# 🔥 9. When to Use Custom Collectors

Use when:

* Built-in collectors are not enough
* You need **multi-field aggregation**
* You want **single-pass computation**
* You need **custom grouping/partitioning**

---

# 🧪 10. Simple Template You Can Reuse

```java
public static <T, A, R> Collector<T, A, R> customCollector() {
    return Collector.of(
            () -> /* create A */,
            (acc, item) -> { /* add item */ },
            (left, right) -> { /* merge */ return left; },
            acc -> /* convert to R */
    );
}
```

---

If you want next step, I can:

* turn this into a **1-page cheat sheet**, or
* give you **real interview questions with increasing difficulty (FAANG-style)**.


## Exercise 1: Collect strings into a single pipe-separated string

### Question

Implement a custom collector that collects a `Stream<String>` into one string separated by `" | "`.

Example:

```java
List<String> input = List.of("red", "green", "blue");
```

Expected result:

```java
"red | green | blue"
```

Do **not** use `Collectors.joining()`.

---

### Answer

```java
import java.util.List;
import java.util.Set;
import java.util.StringJoiner;
import java.util.stream.Collector;

public class Exercise1 {
    public static void main(String[] args) {
        List<String> input = List.of("red", "green", "blue");

        String result = input.stream()
                .collect(pipeJoiningCollector());

        System.out.println(result);
    }

    public static Collector<String, StringJoiner, String> pipeJoiningCollector() {
        return Collector.of(
                () -> new StringJoiner(" | "),
                StringJoiner::add,
                (left, right) -> {
                    left.merge(right);
                    return left;
                },
                StringJoiner::toString,
                Collector.Characteristics.UNORDERED
        );
    }
}
```

### What this teaches

You implement all 4 main collector parts:

* **supplier**
* **accumulator**
* **combiner**
* **finisher**

---

## Exercise 2: Collect integers into a summary object

### Question

Create a custom collector that calculates:

* count
* sum
* min
* max

for a stream of integers.

Example:

```java
List<Integer> numbers = List.of(4, 8, 1, 9, 3);
```

Expected output:

* count = 5
* sum = 25
* min = 1
* max = 9

Do **not** use `IntSummaryStatistics`.

---

### Answer

```java
import java.util.List;
import java.util.stream.Collector;

public class Exercise2 {

    public static void main(String[] args) {
        List<Integer> numbers = List.of(4, 8, 1, 9, 3);

        NumberSummary summary = numbers.stream()
                .collect(numberSummaryCollector());

        System.out.println(summary);
    }

    public static Collector<Integer, NumberSummary, NumberSummary> numberSummaryCollector() {
        return Collector.of(
                NumberSummary::new,
                NumberSummary::accept,
                (left, right) -> {
                    left.combine(right);
                    return left;
                }
        );
    }

    public static class NumberSummary {
        private long count;
        private int sum;
        private Integer min;
        private Integer max;

        public void accept(int value) {
            count++;
            sum += value;

            if (min == null || value < min) {
                min = value;
            }

            if (max == null || value > max) {
                max = value;
            }
        }

        public void combine(NumberSummary other) {
            this.count += other.count;
            this.sum += other.sum;

            if (other.min != null && (this.min == null || other.min < this.min)) {
                this.min = other.min;
            }

            if (other.max != null && (this.max == null || other.max > this.max)) {
                this.max = other.max;
            }
        }

        @Override
        public String toString() {
            return "NumberSummary{" +
                    "count=" + count +
                    ", sum=" + sum +
                    ", min=" + min +
                    ", max=" + max +
                    '}';
        }
    }
}
```

### What this teaches

This is a classic mutable reduction collector.

---

## Exercise 3: Partition strings by length

### Question

Implement a custom collector that groups strings into:

* `"SHORT"` for length <= 3
* `"LONG"` for length > 3

Example:

```java
List<String> words = List.of("cat", "tree", "go", "house", "sun");
```

Expected result:

```java
{
  SHORT=[cat, go, sun],
  LONG=[tree, house]
}
```

Do not use `Collectors.groupingBy()`.

---

### Answer

```java
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collector;

public class Exercise3 {
    public static void main(String[] args) {
        List<String> words = List.of("cat", "tree", "go", "house", "sun");

        Map<String, List<String>> result = words.stream()
                .collect(shortLongCollector());

        System.out.println(result);
    }

    public static Collector<String, Map<String, List<String>>, Map<String, List<String>>> shortLongCollector() {
        return Collector.of(
                () -> {
                    Map<String, List<String>> map = new HashMap<>();
                    map.put("SHORT", new ArrayList<>());
                    map.put("LONG", new ArrayList<>());
                    return map;
                },
                (map, word) -> {
                    if (word.length() <= 3) {
                        map.get("SHORT").add(word);
                    } else {
                        map.get("LONG").add(word);
                    }
                },
                (left, right) -> {
                    left.get("SHORT").addAll(right.get("SHORT"));
                    left.get("LONG").addAll(right.get("LONG"));
                    return left;
                }
        );
    }
}
```

### What this teaches

You can build map-based collectors without relying on built-in grouping collectors.

---

## Exercise 4: Collect distinct strings into a sorted list

### Question

Implement a custom collector that:

* removes duplicates
* sorts alphabetically
* returns a `List<String>`

Example:

```java
List<String> input = List.of("pear", "apple", "pear", "banana", "apple");
```

Expected result:

```java
[apple, banana, pear]
```

Do not use `distinct()` or `sorted()` in the stream pipeline.

---

### Answer

```java
import java.util.ArrayList;
import java.util.List;
import java.util.TreeSet;
import java.util.stream.Collector;

public class Exercise4 {
    public static void main(String[] args) {
        List<String> input = List.of("pear", "apple", "pear", "banana", "apple");

        List<String> result = input.stream()
                .collect(distinctSortedCollector());

        System.out.println(result);
    }

    public static Collector<String, TreeSet<String>, List<String>> distinctSortedCollector() {
        return Collector.of(
                TreeSet::new,
                TreeSet::add,
                (left, right) -> {
                    left.addAll(right);
                    return left;
                },
                ArrayList::new
        );
    }
}
```

### What this teaches

The mutable container does not have to match the final result type.

---

## Exercise 5: Create a collector that counts word frequency

### Question

Implement a custom collector that returns a `Map<String, Long>` counting how many times each word appears.

Example:

```java
List<String> words = List.of("java", "scala", "java", "kotlin", "java", "scala");
```

Expected result:

```java
{java=3, scala=2, kotlin=1}
```

Do not use `Collectors.groupingBy(..., counting())`.

---

### Answer

```java
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collector;

public class Exercise5 {
    public static void main(String[] args) {
        List<String> words = List.of("java", "scala", "java", "kotlin", "java", "scala");

        Map<String, Long> result = words.stream()
                .collect(wordFrequencyCollector());

        System.out.println(result);
    }

    public static Collector<String, Map<String, Long>, Map<String, Long>> wordFrequencyCollector() {
        return Collector.of(
                HashMap::new,
                (map, word) -> map.merge(word, 1L, Long::sum),
                (left, right) -> {
                    right.forEach((key, value) -> left.merge(key, value, Long::sum));
                    return left;
                }
        );
    }
}
```

### What this teaches

A custom collector is perfect for frequency maps.

---

## Exercise 6: Collect only the first 3 elements

### Question

Implement a custom collector that collects only the first 3 elements from a stream into a `List<T>`.

Example:

```java
List<String> input = List.of("a", "b", "c", "d", "e");
```

Expected result:

```java
[a, b, c]
```

---

### Answer

```java
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collector;

public class Exercise6 {
    public static void main(String[] args) {
        List<String> input = List.of("a", "b", "c", "d", "e");

        List<String> result = input.stream()
                .collect(firstNCollector(3));

        System.out.println(result);
    }

    public static <T> Collector<T, List<T>, List<T>> firstNCollector(int n) {
        return Collector.of(
                ArrayList::new,
                (list, item) -> {
                    if (list.size() < n) {
                        list.add(item);
                    }
                },
                (left, right) -> {
                    for (T item : right) {
                        if (left.size() < n) {
                            left.add(item);
                        } else {
                            break;
                        }
                    }
                    return left;
                }
        );
    }
}
```

### What this teaches

Custom collectors can enforce business rules during accumulation.

---

## Exercise 7: Build a custom averaging collector

### Question

Implement a custom collector that calculates the average of integers as a `double`.

Example:

```java
List<Integer> numbers = List.of(10, 20, 30, 40);
```

Expected result:

```java
25.0
```

Do not use `Collectors.averagingInt()`.

---

### Answer

```java
import java.util.List;
import java.util.stream.Collector;

public class Exercise7 {
    public static void main(String[] args) {
        List<Integer> numbers = List.of(10, 20, 30, 40);

        double average = numbers.stream()
                .collect(averageCollector());

        System.out.println(average);
    }

    public static Collector<Integer, AvgAccumulator, Double> averageCollector() {
        return Collector.of(
                AvgAccumulator::new,
                AvgAccumulator::accept,
                (left, right) -> {
                    left.combine(right);
                    return left;
                },
                AvgAccumulator::average
        );
    }

    public static class AvgAccumulator {
        private long count;
        private long sum;

        public void accept(int value) {
            count++;
            sum += value;
        }

        public void combine(AvgAccumulator other) {
            this.count += other.count;
            this.sum += other.sum;
        }

        public double average() {
            return count == 0 ? 0.0 : (double) sum / count;
        }
    }
}
```

### What this teaches

This shows how to transform the mutable accumulation object into a different result type.

---

## Exercise 8: Convert a stream into an immutable list

### Question

Implement a custom collector that collects elements into an immutable list.

Example:

```java
List<Integer> input = List.of(1, 2, 3, 4);
```

Expected result:
A list that throws `UnsupportedOperationException` if modified.

---

### Answer

```java
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collector;

public class Exercise8 {
    public static void main(String[] args) {
        List<Integer> input = List.of(1, 2, 3, 4);

        List<Integer> result = input.stream()
                .collect(toImmutableListCollector());

        System.out.println(result);

        // result.add(5); // throws UnsupportedOperationException
    }

    public static <T> Collector<T, List<T>, List<T>> toImmutableListCollector() {
        return Collector.of(
                ArrayList::new,
                List::add,
                (left, right) -> {
                    left.addAll(right);
                    return left;
                },
                List::copyOf
        );
    }
}
```

### What this teaches

The finisher is a good place to enforce immutability.

---

# Interview-style theory questions

## 1. What are the parts of a custom collector?

### Answer

A custom collector usually defines:

* **supplier**: creates the mutable container
* **accumulator**: adds one stream element into the container
* **combiner**: merges two containers, important for parallel streams
* **finisher**: converts the container into the final result
* **characteristics**: optional metadata such as `UNORDERED`, `CONCURRENT`, or `IDENTITY_FINISH`

---

## 2. Why is the combiner important?

### Answer

The combiner is needed when the stream runs in parallel, because different threads may build partial results that must be merged safely and correctly.

---

## 3. What does `IDENTITY_FINISH` mean?

### Answer

It means the accumulation type and the final result type are the same, so no separate finishing transformation is needed.

---

# Practice challenge

## Question

Create a custom collector that collects strings into a map where:

* key = first character
* value = list of words starting with that character

Example:

```java
List<String> words = List.of("apple", "ant", "banana", "ball", "cat");
```

Expected result:

```java
{a=[apple, ant], b=[banana, ball], c=[cat]}
```

---

## Answer

```java
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collector;

public class Challenge {
    public static void main(String[] args) {
        List<String> words = List.of("apple", "ant", "banana", "ball", "cat");

        Map<Character, List<String>> result = words.stream()
                .collect(groupByFirstCharacterCollector());

        System.out.println(result);
    }

    public static Collector<String, Map<Character, List<String>>, Map<Character, List<String>>> groupByFirstCharacterCollector() {
        return Collector.of(
                HashMap::new,
                (map, word) -> {
                    char key = word.charAt(0);
                    map.computeIfAbsent(key, unused -> new ArrayList<>()).add(word);
                },
                (left, right) -> {
                    right.forEach((key, value) ->
                            left.computeIfAbsent(key, unused -> new ArrayList<>()).addAll(value)
                    );
                    return left;
                }
        );
    }
}
```

If you'd like, I can turn these into a **worksheet format** first and then a **separate answer sheet**.
