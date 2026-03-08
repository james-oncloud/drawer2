Here’s the **“explain like I’m an idiot”** version of **Scala variance**.

---

## The one idea you need first

Imagine **types are boxes**:

* `Animal` is a **big box**
* `Dog` is a **smaller box inside Animal**

So:

```scala
Dog <: Animal
```

---

## The problem variance solves

If I have a box **of Dogs**:

```scala
List[Dog]
```

Can I use it where a box **of Animals** is expected?

**Sometimes yes, sometimes no — variance tells Scala which is safe.**

---

## The 3 kinds of variance (this is the whole topic)

### 1️⃣ Covariance `+A` → *“goes the same direction”*

```scala
class Box[+A]
```

**Meaning:**

> If `Dog` is an `Animal`, then `Box[Dog]` **is a** `Box[Animal]`

✅ Safe when you **only read** values.

Example:

```scala
val dogs: List[Dog] = List(new Dog)
val animals: List[Animal] = dogs   // OK
```

Why safe?
You’re only taking animals **out**, not putting new ones in.

**Rule to remember:**
📤 *Only produces values*

---

### 2️⃣ Contravariance `-A` → *“goes the opposite direction”*

```scala
class Handler[-A]
```

**Meaning:**

> If `Dog` is an `Animal`, then `Handler[Animal]` **is a** `Handler[Dog]`

Sounds weird — here’s the intuition:

If I can handle **any Animal**, I can obviously handle a **Dog**.

Example:

```scala
trait Trainer[-A] {
  def train(a: A): Unit
}

val animalTrainer: Trainer[Animal] = ...
val dogTrainer: Trainer[Dog] = animalTrainer   // OK
```

**Rule to remember:**
📥 *Only consumes values*

---

### 3️⃣ Invariance (no symbol) → *“no relationship at all”*

```scala
class Box[A]
```

**Meaning:**

> `Box[Dog]` and `Box[Animal]` are totally unrelated

Scala’s default because it’s the safest.

Example:

```scala
val dogs: Box[Dog] = new Box[Dog]
// val animals: Box[Animal] = dogs  // ❌ not allowed
```

---

## Why Scala cares (one scary example)

If this were allowed:

```scala
class Box[+A] {
  var value: A = _
}
```

Then you could do:

```scala
val dogBox: Box[Dog] = new Box[Dog]
val animalBox: Box[Animal] = dogBox
animalBox.value = new Cat   // 💥 Dog box now has a Cat
```

Boom. Type safety destroyed.
That’s why Scala enforces strict rules.

---

## Cheat sheet (memorise this)

| Variance      | Symbol | Use when it…       |
| ------------- | ------ | ------------------ |
| Covariant     | `+A`   | **Returns** values |
| Contravariant | `-A`   | **Accepts** values |
| Invariant     | `A`    | Does **both**      |

---

## One-sentence summary

> **Covariant = output**, **Contravariant = input**, **Invariant = both**, and Scala uses this to stop you from putting a cat into a dog box.

If you want, I can also explain **why `Function1[-A, +B]` looks insane** or how this shows up in Cats / FP APIs.


Compare Scala 12 Implicit Conversions vs Type Classes

## What they are

### Implicit conversions

An **implicit conversion** lets Scala silently *turn one type into another* (or add methods) so code typechecks.

```scala
import scala.language.implicitConversions

final case class UserId(value: String)

given Conversion[String, UserId] with
  def apply(s: String): UserId = UserId(s)

val id: UserId = "abc" // compiles via implicit conversion
```

### Type classes

A **type class** is an explicit “capability” you can provide for a type, selected by the compiler, without changing the type.

```scala
trait Show[A]:
  def show(a: A): String

object Show:
  def apply[A](using s: Show[A]) = s

final case class UserId(value: String)

given Show[UserId] with
  def show(u: UserId): String = s"UserId(${u.value})"

val s = Show[UserId].show(UserId("abc"))
```

---

## Key differences (the practical ones)

### 1) “Magic rewrite” vs “chosen behavior”

* **Implicit conversion**: compiler rewrites your program by inserting a conversion call.
* **Type class**: compiler picks an implementation *you asked for* (via `using`, extension methods, `summon`, etc.).

**Why you care:** conversions can make it unclear *what code is actually running*.

---

### 2) Risk profile

**Implicit conversions are high-risk**:

* can make unrelated code compile
* can introduce surprising runtime behavior
* can cause ambiguous or cascading conversions
* makes errors harder to understand (“why is it converting this?”)

**Type classes are safer**:

* behavior is opt-in and local (import/scope controls)
* compiler errors usually point to a missing instance instead of silently rewriting types

---

### 3) Coherence / “which one did it pick?”

With **type classes**, you usually aim for *one obvious instance* per type per capability (Cats encourages this).

With **implicit conversions**, multiple conversions can apply and you get ambiguity—or worse, one wins due to import/scope and it’s not obvious.

---

### 4) Extension methods: both can provide them, but type classes are cleaner

In Scala 3 (and Scala 2 via implicits), you can add methods without conversions.

Type class style:

```scala
trait Parse[A]:
  def parse(s: String): A

object Parse:
  extension (s: String)
    def parseAs[A](using p: Parse[A]): A = p.parse(s)

given Parse[Int] with
  def parse(s: String): Int = s.toInt

val n = "123".parseAs[Int]
```

No type-changing conversion; just “if you can parse A, you may call parseAs[A]”.

---

### 5) Performance / predictability

* Conversions may allocate wrappers or perform work you didn’t realize was happening.
* Type classes are usually just passing a reference (often inlined), and the call sites are predictable.

---

## When to use which

### Prefer type classes for:

* “capabilities” like `Show`, `Eq`, `Order`, `Encoder/Decoder`, `Monoid`, `Functor`
* library design and FP (Cats is built on this)
* keeping domain types strict (e.g., don’t allow `String` to become `UserId` silently)

### Use implicit conversions only when:

* you’re doing interop / migration (legacy API needs one type, you have another)
* you’re implementing a *very local*, very obvious adaptation
* you can’t model it as an extension method or explicit constructor

In Scala codebases, a common policy is: **ban implicit conversions**, allow:

* `given Conversion[A, B]` only in tightly controlled modules, or
* explicit `.toX` methods, or
* type class + extension methods.

---

## Rule of thumb that won’t betray you

* If you’re trying to make **two types “pretend” to be the same** → that’s a conversion (dangerous).
* If you’re trying to provide **behavior for a type** → that’s a type class (recommended).

If you tell me what you’re building (domain modelling, Cats, JSON codecs, DB mappings, etc.), I can show the “conversion approach” vs “type class approach” for that exact use-case and why one will age better.

