Below is **Scala 2 modular programming** explained simply, then tied together with a **realistic example** you’d actually write in production.

---

## What “modular programming” means in Scala 2

**Modular programming = splitting your system into small, independent pieces (modules) with clear responsibilities and boundaries**, so that:

* each piece can be **developed, tested, and reasoned about independently**
* dependencies are **explicit**, not hard-coded
* implementations can be **swapped** without changing business logic

In Scala 2, this is typically done using:

* **traits** (interfaces + partial implementations)
* **objects** (module instances)
* **self-types** (dependency wiring)
* sometimes **cake pattern** (classic Scala 2 approach)

---

## The problem we’re solving (simple domain)

> “Process an order and send a notification”

We want to:

* separate **business logic**
* from **infrastructure** (email, logging, DB, etc.)
* and be able to swap implementations (e.g. real email vs fake email)

---

## Step 1: Define module interfaces (traits)

These are your **contracts**.

```scala
trait EmailService {
  def send(to: String, message: String): Unit
}

trait OrderRepository {
  def save(orderId: String): Unit
}
```

Nothing here knows *how* email is sent or *where* orders are saved.

---

## Step 2: Define the business logic module

This module **depends on abstractions**, not implementations.

```scala
trait OrderService {
  self: EmailService with OrderRepository =>

  def placeOrder(orderId: String, userEmail: String): Unit = {
    save(orderId)
    send(userEmail, s"Order $orderId placed")
  }
}
```

### Why this matters

* `OrderService` **cannot compile** unless both dependencies are provided
* dependencies are **explicit**
* no constructors, no DI frameworks, no globals

This `self:` line is the core of Scala 2 modular wiring.

---

## Step 3: Provide concrete implementations (modules)

### Infrastructure module: email

```scala
trait SmtpEmailService extends EmailService {
  override def send(to: String, message: String): Unit =
    println(s"[SMTP] Sending '$message' to $to")
}
```

### Infrastructure module: repository

```scala
trait InMemoryOrderRepository extends OrderRepository {
  override def save(orderId: String): Unit =
    println(s"[DB] Saved order $orderId")
}
```

Each module does **one thing**.

---

## Step 4: Wire modules together (composition root)

This is where the application is assembled.

```scala
object ProductionApp
  extends OrderService
     with SmtpEmailService
     with InMemoryOrderRepository
```

Now you can run:

```scala
ProductionApp.placeOrder("123", "user@test.com")
```

### Output

```
[DB] Saved order 123
[SMTP] Sending 'Order 123 placed' to user@test.com
```

---

## Step 5: Swap modules (testing example)

No mocks, no frameworks.

```scala
trait TestEmailService extends EmailService {
  var sent: List[(String, String)] = Nil

  override def send(to: String, message: String): Unit =
    sent ::= (to -> message)
}

trait TestOrderRepository extends OrderRepository {
  var saved: List[String] = Nil

  override def save(orderId: String): Unit =
    saved ::= orderId
}
```

Test wiring:

```scala
object TestApp
  extends OrderService
     with TestEmailService
     with TestOrderRepository
```

You can now assert on `sent` and `saved`.

---

## Why this is “modular programming”

Each module:

* has **one responsibility**
* depends only on **abstract contracts**
* can be **mixed, replaced, or tested independently**

The business logic:

* does not know about SMTP
* does not know about databases
* does not change when infrastructure changes

---

## How this differs from “normal OOP”

| Traditional OOP       | Scala 2 modular style |
| --------------------- | --------------------- |
| Constructors          | Trait composition     |
| `new` everywhere      | One composition root  |
| Concrete dependencies | Abstract dependencies |
| DI frameworks         | Language-level wiring |

---

## Relationship to the Cake Pattern

What you just saw **is the Cake Pattern**, but:

* simplified
* readable
* without over-engineering

The full Cake Pattern just adds:

* finer-grained modules
* multiple layers
* abstract module traits vs concrete module traits

---

## One-sentence summary

> **Scala 2 modular programming uses traits + self-types to wire independent modules together at compile time, giving you dependency injection without frameworks and strong architectural boundaries.**

If you want, I can:

* refactor this into **constructor DI**
* compare this to **Spring**
* show the **Scala 3 version**
* or explain **when *not* to use the Cake Pattern**

## 1) Refactor into constructor DI (Scala 2)

Same idea (business logic depends on abstractions), but dependencies are passed in via constructors.

```scala
trait EmailService {
  def send(to: String, message: String): Unit
}

trait OrderRepository {
  def save(orderId: String): Unit
}

final class OrderService(
  repo: OrderRepository,
  email: EmailService
) {
  def placeOrder(orderId: String, userEmail: String): Unit = {
    repo.save(orderId)
    email.send(userEmail, s"Order $orderId placed")
  }
}

// Concrete implementations
final class SmtpEmailService extends EmailService {
  override def send(to: String, message: String): Unit =
    println(s"[SMTP] Sending '$message' to $to")
}

final class InMemoryOrderRepository extends OrderRepository {
  override def save(orderId: String): Unit =
    println(s"[DB] Saved order $orderId")
}

// Composition root
object Main extends App {
  val repo  = new InMemoryOrderRepository
  val email = new SmtpEmailService
  val svc   = new OrderService(repo, email)

  svc.placeOrder("123", "user@test.com")
}
```

**What changed vs cake/self-types:** wiring moved from `extends ... with ...` into `new OrderService(repo, email)`.

---

## 2) Compare to Spring (what’s actually different)

### Similarities

* Both push you toward **programming to interfaces** (`EmailService`, `OrderRepository`)
* Both want a **composition root** where objects are assembled
* Both support **swapping implementations** (prod vs test)

### Key differences

* **Resolution time**

  * Cake/self-types: **compile-time** (won’t compile if dependency missing)
  * Spring: **runtime/container-time** (fails at startup if wiring wrong)
* **How wiring happens**

  * Scala modular/cake: language feature (traits, self-types, mixing)
  * Spring: reflection + annotations + container (or explicit `@Bean` methods)
* **Visibility of dependencies**

  * Constructor DI: dependencies are **obvious** in the constructor signature
  * Cake pattern: dependencies can be **less visible** (pulled in via `self: ... =>`)
* **Testing**

  * Scala constructor DI: pass fakes directly, no container
  * Spring: either spin context, slice tests, or use mocks; doable but heavier
* **Modularity**

  * Cake pattern can create deeply nested module graphs (powerful, but can get messy)
  * Spring modules are usually “beans + config” and rely on conventions

**Practical takeaway:** if you’re used to Spring, **constructor DI in Scala feels closest** and tends to stay simplest.

---

## 3) Scala 3 version (idiomatic-ish)

Scala 3 keeps trait composition/self-types, but you’ll often see:

* **`trait` + indentation syntax**
* **`given/using`** for “capability injection” (typeclasses)
* still constructor DI for services

### 3a) Cake/self-type style in Scala 3

```scala
trait EmailService:
  def send(to: String, message: String): Unit

trait OrderRepository:
  def save(orderId: String): Unit

trait OrderService:
  self: EmailService & OrderRepository =>

  def placeOrder(orderId: String, userEmail: String): Unit =
    save(orderId)
    send(userEmail, s"Order $orderId placed")

trait SmtpEmailService extends EmailService:
  override def send(to: String, message: String): Unit =
    println(s"[SMTP] Sending '$message' to $to")

trait InMemoryOrderRepository extends OrderRepository:
  override def save(orderId: String): Unit =
    println(s"[DB] Saved order $orderId")

object ProductionApp extends OrderService, SmtpEmailService, InMemoryOrderRepository

@main def run(): Unit =
  ProductionApp.placeOrder("123", "user@test.com")
```

Note the Scala 3 intersection type in self-type: `EmailService & OrderRepository`.

### 3b) Constructor DI in Scala 3 (often preferred)

```scala
trait EmailService:
  def send(to: String, message: String): Unit

trait OrderRepository:
  def save(orderId: String): Unit

final class OrderService(repo: OrderRepository, email: EmailService):
  def placeOrder(orderId: String, userEmail: String): Unit =
    repo.save(orderId)
    email.send(userEmail, s"Order $orderId placed")

final class SmtpEmailService extends EmailService:
  def send(to: String, message: String): Unit =
    println(s"[SMTP] Sending '$message' to $to")

final class InMemoryOrderRepository extends OrderRepository:
  def save(orderId: String): Unit =
    println(s"[DB] Saved order $orderId")

@main def run(): Unit =
  val svc = OrderService(InMemoryOrderRepository(), SmtpEmailService())
  svc.placeOrder("123", "user@test.com")
```

---

## 4) When *not* to use the Cake Pattern (very common)

Use cake/self-types **only if the benefits outweigh the complexity**. Avoid it when:

### A) Your dependency graph is simple

If you’ve got ~5–20 services, **constructor DI is clearer** and easier to navigate.

### B) You value “read the constructor, know the deps”

Cake can hide dependencies behind self-types and mixins. New joiners often ask:

> “Where does `send()` come from?”

Constructor DI answers that instantly.

### C) You expect frequent refactors / module reshuffling

Cake graphs can become brittle: a small change to one module trait can cascade through many mixins.

### D) You’re mixing runtime configuration concerns

Cake is compile-time wiring; it’s awkward for “choose implementation based on config/env” unless you build extra indirection.

### E) You hit the classic cake pain points

* long “linearization” mixin chains
* confusing implicit resolution / inheritance conflicts
* slow compile times / hard-to-read error messages
* difficulties with multiple implementations of the same module in one app

### F) You already use an effect system + typeclass style

In Cats / ZIO / Tagless Final worlds, dependency injection is often cleaner via:

* constructor params
* `given/using`
* environment layers (ZIO)
* modules as values (`Resource`, `Layer`, etc.)

**Rule of thumb:**

* For most teams: **constructor DI default**.
* Use cake/self-types only when you truly need compile-time module composition and you can keep it shallow.

If you want, I can show the “same example” done in a Cats/tagless-final style (`F[_]`, `Sync`, etc.) which is how FP codebases often replace both cake and Spring-style wiring.

## Scala 2 `self:` explained (very simply)

The `self:` keyword is **not inheritance** — it means:

> **“This trait can only be mixed into something that also has these members.”**

It’s a **compile-time dependency requirement**.

---

## The basic shape

```scala
trait A {
  self: B =>
}
```

Read it as:

> “`A` requires `B` to exist.”

---

## Why it exists (the problem it solves)

You want to write logic that:

* **uses methods from another trait**
* **without extending it**
* and **without passing it as a constructor parameter**

That’s exactly what `self:` does.

---

## Minimal example

```scala
trait Logger {
  def log(msg: String): Unit
}

trait Service {
  self: Logger =>

  def doWork(): Unit =
    log("working")
}
```

### What this means

* `Service` **can call `log`**
* but `Service` does **not** extend `Logger`
* anything mixing in `Service` **must also provide a Logger**

---

## Correct usage

```scala
object App extends Service with Logger {
  def log(msg: String): Unit =
    println(msg)
}
```

✅ Compiles

---

## Incorrect usage

```scala
object Broken extends Service
```

❌ **Compile-time error**
Because `Logger` is missing.

---

## Why not just `extends Logger`?

```scala
trait Service extends Logger {
  def doWork(): Unit =
    log("working")
}
```

### Problem

Now **every** `Service` *is* a `Logger`.

With `self:`:

* `Service` **uses** `Logger`
* but is **not a Logger**

This keeps your type hierarchy clean.

---

## Self-types vs constructor DI

### Self-type (compile-time wiring)

```scala
trait OrderService {
  self: EmailService =>
}
```

* dependencies enforced at compile time
* no constructors
* common in modular / cake pattern

### Constructor DI (explicit wiring)

```scala
final class OrderService(email: EmailService)
```

* dependencies visible
* simpler
* preferred in many codebases

---

## Self-types with multiple dependencies

```scala
trait A
trait B

trait C {
  self: A with B =>
}
```

Meaning:

> “C requires both A and B.”

---

## Using `self` as an alias (`this` with a name)

You can also **rename `this`**:

```scala
trait Repository { def save(): Unit }

trait Service {
  repo: Repository =>

  def work(): Unit =
    repo.save()
}
```

Here:

* `repo` is just another name for `this`
* but typed as `Repository`

This improves readability.

---

## Self-types + abstract members (very common)

```scala
trait Config {
  def url: String
}

trait Database {
  self: Config =>

  def connect(): Unit =
    println(s"Connecting to $url")
}
```

`Database` can use `url` without knowing *where it comes from*.

---

## Relationship to the Cake Pattern

Self-types are the **core mechanism** behind the Cake Pattern:

* traits = modules
* self-types = dependencies
* mixins = wiring
* compiler = DI container

---

## When to use `self:`

Use it when:

* you want **compile-time enforced dependencies**
* you want to avoid bloated inheritance hierarchies
* you’re doing **module composition** in Scala 2

Avoid it when:

* dependency graphs are simple
* readability matters more than compile-time wiring
* constructor DI is sufficient (often the case)

---

## One-line mental model

> **`self:` means “I depend on this, but I am not this.”**

If you want, I can also show:

* how self-types interact with **linearization**
* common **compiler errors** and how to read them
* why self-types disappeared *mostly* in Scala 3


