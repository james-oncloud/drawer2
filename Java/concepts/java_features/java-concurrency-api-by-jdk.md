# Java concurrency APIs by JDK (library & runtime)

This complements **`java-language-features-by-jdk-5-26.md`**, which lists **language** (syntax/JLS) changes only. Most concurrency support is **standard library APIs**, **JVM behavior**, or **preview APIs**, not new grammar.

---

## Quick reference

| JDK | Concurrency-related highlights |
|-----|--------------------------------|
| **5** | **`java.util.concurrent`** ([JSR 166](https://jcp.org/en/jsr/detail?id=166)): executors, `Future` / `Callable`, concurrent collections, `Lock` / `ReentrantLock`, `ReadWriteLock`, `Atomic*`, synchronizers (`CountDownLatch`, `Semaphore`, `CyclicBarrier`, `Exchanger`), `BlockingQueue` & implementations, etc. |
| **7** | **Fork/join**: `ForkJoinPool`, `ForkJoinTask` / `RecursiveTask` / `RecursiveAction`. |
| **8** | **`CompletableFuture`**, **`StampedLock`**, **`LongAdder` / `LongAccumulator`**, **`DoubleAdder` / `DoubleAccumulator`**, **`Executors.newWorkStealingPool()`**. |
| **9** | **`java.util.concurrent.Flow`** (reactive-streams–shaped API: `Publisher`, `Subscriber`, `Processor`, `Subscription`) and **`SubmissionPublisher`**. |
| **16** | **`ExecutorService`**: `invokeAll` / `invokeAny` overloads that take a **`Duration`** timeout. |
| **19–20** | **Virtual threads** (preview) — see [JEP 444](https://openjdk.org/jeps/444) history. |
| **21** | **Virtual threads** **final** ([JEP 444](https://openjdk.org/jeps/444)): e.g. `Thread.ofVirtual()`, `Executors.newVirtualThreadPerTaskExecutor()`. **Structured concurrency** and **scoped values** in **preview** / incubation (see JEP index for that release). |
| **20–24** | **`ScopedValue`**: **incubation** → **preview** ([JEP 429](https://openjdk.org/jeps/429), [JEP 446](https://openjdk.org/jeps/446), [JEP 464](https://openjdk.org/jeps/464), [JEP 481](https://openjdk.org/jeps/481), [JEP 487](https://openjdk.org/jeps/487)). |
| **25** | **`ScopedValue`** API **finalized** ([JEP 506](https://openjdk.org/jeps/506)). |

Structured concurrency ([JEP 505](https://openjdk.org/jeps/505) and successors) has shipped as **preview** in multiple JDKs—confirm status for your target JDK in the JEP and `--enable-preview` docs.

---

## Notes

- **Virtual threads** touch **`java.lang.Thread`** and **`java.util.concurrent.Executors`** but are primarily a **platform/runtime** feature ([JEP 444](https://openjdk.org/jeps/444)).
- **Scoped values** live in **`java.lang.ScopedValue`** ([JEP 506](https://openjdk.org/jeps/506)).
- For everything else shipped in a given JDK (security, GC, tools), use that release’s **JDK Release Notes** on Oracle / OpenJDK.
