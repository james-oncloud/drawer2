# Virtual threads (Project Loom)

Virtual threads are **lightweight threads** scheduled by the JVM on a small pool of **platform (OS) threads**. They are cheap to create in large numbers and fit workloads that spend much of their time **blocked** (I/O, locks, `sleep`), without tying up one OS thread per task.

- **Finalized:** JDK 21 ([JEP 444](https://openjdk.org/jeps/444))
- **Packages:** `java.lang.Thread`, `java.lang.Thread.Builder`, `java.util.concurrent.Executors`, etc.

---

## 1. Create and start a virtual thread

```java
Thread v = Thread.ofVirtual()
    .name("worker-", 0)   // optional: name prefix + suffix from long supplier
    .start(() -> {
        System.out.println(Thread.currentThread()); // Thread[#21,worker-0,5,main]
        // ... task body
    });

v.join(); // wait for completion (throws InterruptedException)
```

Equivalent without naming:

```java
Thread.ofVirtual().start(() -> doWork()).join();
```

---

## 2. Run many virtual threads

Blocking calls **do not** consume a dedicated OS thread each—the carrier thread can run other virtual threads while one blocks.

```java
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 10_000; i++) {
        int taskId = i;
        executor.submit(() -> {
            Thread.sleep(100);          // blocks the virtual thread, not necessarily the carrier
            return "done-" + taskId;
        });
    }
} // executor closes and waits for submitted tasks (depending on usage; here use shutdown-friendly patterns)
```

For fire-and-forget style tasks you often submit and optionally await a latch or use structured APIs when they stabilize for your JDK.

Simpler demo: many concurrent sleeps.

```java
var threads = IntStream.range(0, 10_000)
    .mapToObj(i -> Thread.ofVirtual().start(() -> {
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }))
    .toList();

for (Thread t : threads) {
    t.join();
}
```

---

## 3. Preferred executor for “one task = one thread”

`Executors.newVirtualThreadPerTaskExecutor()` returns an `ExecutorService` that creates a **new virtual thread** for each submitted task—similar to `newCachedThreadPool()` but with virtual threads instead of platform threads.

```java
try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
    Future<String> f = executor.submit(() -> fetchFromHttp("https://example.com"));
    String body = f.get(); // blocking get on the calling thread
}
```

Use this for **high fan-out** work (many concurrent blocking operations).

---

## 4. Check whether the current thread is virtual

```java
if (Thread.currentThread().isVirtual()) {
    // running on a virtual thread
}
```

---

## 5. Platform thread vs virtual thread (same API)

`Thread` is the same type; construction differs.

```java
Thread platform = Thread.ofPlatform().start(() -> work());
Thread virtual   = Thread.ofVirtual().start(() -> work());
```

Platform threads remain appropriate for **CPU-bound** pools where you want a bounded degree of parallelism tied to cores; virtual threads shine when tasks **wait** a lot.

---

## 6. Short pitfalls (awareness)

- **Pinning:** If a virtual thread blocks inside a **synchronized** block/method on code paths that also block in ways the JVM cannot unmount, that virtual thread can **pin** its carrier; prefer `java.util.concurrent.locks.ReentrantLock` for long/blocking critical sections in hot paths (see JEP 444 and release notes for details).
- **`ThreadLocal` / inherited locals:** Usable, but very large numbers of virtual threads plus heavy thread-local use can increase memory use—measure if you create millions of threads.
- **Pool sizing:** Do not “size” virtual threads like a fixed pool; the model is **many** virtual threads mapped to **few** carriers.

---

## 7. Minimal full example (JDK 21+)

```java
import java.util.concurrent.*;

public class VirtualThreadDemo {
    public static void main(String[] args) throws Exception {
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            Callable<String> task = () -> {
                Thread.sleep(50);
                return "hello from " + Thread.currentThread();
            };
            Future<String> f = executor.submit(task);
            System.out.println(f.get());
        }
    }
}
```

Compile and run (no preview flags needed on JDK 21+ for final virtual threads API):

```bash
javac VirtualThreadDemo.java
java VirtualThreadDemo
```

---

## See also

- [JEP 444: Virtual Threads](https://openjdk.org/jeps/444)
- `java-concurrency-api-by-jdk.md` in this folder for other JDK concurrency milestones.
