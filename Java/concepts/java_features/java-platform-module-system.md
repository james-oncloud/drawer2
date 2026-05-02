# Java Platform Module System (JPMS)

**Project Jigsaw** added **modules** to the language and platform: strong **encapsulation** of packages, explicit **dependencies**, and a **module path** distinct from the classpath. A module is defined by a **`module-info.java`** file at the source root of the module.

- **JDK 9+** — [JSR 376](https://openjdk.org/projects/jigsaw/spec/) / [JEP 261](https://openjdk.org/jeps/261)

---

## 1. Minimal application module

Only your own code, depending on **`java.base`** (always present; you usually **do not** `requires java.base`—it is implicit for named modules, but some examples show it for clarity).

`src/com.example.app/module-info.java`:

```java
module com.example.app {
    // java.base is implicit; no other modules required
}
```

`src/com.example.app/com/example/app/Main.java`:

```java
package com.example.app;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, module");
    }
}
```

**Compile and run (JDK 9+):**

```bash
# from project root; output under out/
javac -d out/com.example.app \
  src/com.example.app/module-info.java \
  src/com.example.app/com/example/app/Main.java

java --module-path out -m com.example.app/com.example.app.Main
# or, if the module has a main class attribute in the JAR, -m com.example.app
```

---

## 2. `exports` — make packages API of this module

Other modules can only access **public** types in **exported** packages.

`src/com.example.util/module-info.java`:

```java
module com.example.util {
    exports com.example.util;   // public API of this module
}
```

`src/com.example.util/com/example/util/Counter.java`:

```java
package com.example.util;

public final class Counter {
    private int n;
    public int next() { return ++n; }
}
```

`com.example.app` then **requires** the util module and imports the API:

`src/com.example.app/module-info.java`:

```java
module com.example.app {
    requires com.example.util;
}
```

`src/com.example.app/com/example/app/Main.java`:

```java
package com.example.app;

import com.example.util.Counter;

public class Main {
    public static void main(String[] args) {
        var c = new Counter();
        System.out.println(c.next());
    }
}
```

**Compile util first, then app with both on module path:**

```bash
javac -d out/com.example.util \
  src/com.example.util/module-info.java \
  src/com.example.util/com/example/util/Counter.java

javac --module-path out -d out/com.example.app \
  src/com.example.app/module-info.java \
  src/com.example.app/com/example/app/Main.java

java --module-path out -m com.example.app/com.example.app.Main
```

---

## 3. `requires transitive` — propagate dependency

If your exported API **mentions** types from another module, consumers often need that dependency too. **`requires transitive`** re-exports the readability edge.

```java
module com.example.util {
    requires transitive java.logging; // callers reading this module also read java.logging
    exports com.example.util;
}
```

---

## 4. `opens` — deep reflection (libraries like Hibernate / JSON mappers)

Code outside the module **cannot** use core reflection on non‑exported packages unless you **`opens`** a package (or the whole module).

```java
module com.example.internalapp {
    exports com.example.internalapp.api;
    opens com.example.internalapp.dto to com.fasterxml.jackson.databind;
}
```

This allows **qualified opens**: only named modules listed after **`to`** may deep‑reflect into `dto`.

For **unnamed modules on the classpath** during migration, **`opens …`** without **`to`** controls reflective access more broadly—prefer qualified **`to`** when possible.

---

## 5. Service loader: `provides` / `uses`

Decouple API (`uses`) from implementation (`provides … with`).

**API module:**

```java
module com.example.greeting.api {
    exports com.example.greeting;
    uses com.example.greeting.Greeter;
}
```

**Greeter interface** (`exports`):

```java
package com.example.greeting;

public interface Greeter {
    String greet(String name);
}
```

**Impl module:**

```java
module com.example.greeting.impl {
    requires com.example.greeting.api;
    provides com.example.greeting.Greeter
        with com.example.greeting.impl.FriendlyGreeter;
}
```

**Implementation class** (`com.example.greeting.impl.FriendlyGreeter`):

```java
package com.example.greeting.impl;

import com.example.greeting.Greeter;

public final class FriendlyGreeter implements Greeter {
    @Override
    public String greet(String name) {
        return "Hello, " + name + "!";
    }
}
```

**Consumer module descriptor:**

```java
module com.example.app {
    requires com.example.greeting.api;
}
```

**Consumer code** (put **`com.example.greeting.impl`** on **`--module-path`** at launch so `ServiceLoader` can resolve the **`provides`** entry—you typically do **not** `requires` the impl module if you only load by interface):

```java
package com.example.app;

import com.example.greeting.Greeter;
import java.util.ServiceLoader;

public class Main {
    public static void main(String[] args) {
        ServiceLoader<Greeter> loader = ServiceLoader.load(Greeter.class);
        Greeter g = loader.findFirst().orElseThrow();
        System.out.println(g.greet("modules"));
    }
}
```

The app module only **`requires com.example.greeting.api`**. You still add the **impl** output (or JAR) to **`--module-path`**. The provider may not be in the default **root** module set; if `ServiceLoader` finds no providers, add e.g. **`--add-modules com.example.greeting.impl`** (or a `requires` that pulls the provider into the graph) so the implementation module is **resolved** at launch.

```text
java --module-path out --add-modules com.example.greeting.impl -m com.example.app/com.example.app.Main
```

---

## 6. `exports … to` — qualified exports

Export a package only to specific friend modules (narrower than public‑to‑everyone).

```java
module com.example.impl {
    requires com.example.spi;
    exports com.example.impl.internal to com.example.tests;
}
```

---

## 7. Classpath vs module path (mental model)

| | **Classpath** | **Module path** |
|--|----------------|-----------------|
| Unit | JARs / classes | **Named modules** (with `module-info`) |
| Package access | Types from multiple JARs can interact without module boundaries (traditional classpath model). | **Strong**: only **`exports`** / **`opens`** control visibility across modules. |
| Automatic modules | — | Plain JAR without `module-info` becomes **automatic module** (name derived from JAR) |

For **migration**, older JARs often appear as **automatic modules** on **`--module-path`**.

---

## 8. Common `module-info.java` directives (cheat sheet)

| Directive | Meaning |
|-----------|---------|
| `requires M` | Readability: this module depends on **M**. |
| `requires transitive M` | Implied readability for modules that depend on this one. |
| `requires static M` | Optional **compile-time** dependency (e.g. annotations only). |
| `exports pkg` | Other modules may use **public** API in `pkg`. |
| `exports pkg to M` | **Qualified** export to listed modules only. |
| `opens pkg` | **Deep reflection** allowed into `pkg` (consider `to`). |
| `opens pkg to M` | Qualified opens for reflection. |
| `uses T` | Declares service interface **T** for `ServiceLoader`. |
| `provides T with C` | Implementation **C** of service **T**. |

---

## See also

- **`java-language-features-by-jdk-5-26.md`** — JPMS under JDK 9 language/platform changes.
- [OpenJDK Jigsaw / JPMS documentation](https://openjdk.org/projects/jigsaw/)
- `java --help` and `javac --help` for `--module-path`, `-m`, `--module-source-path` (multi-module compile).
