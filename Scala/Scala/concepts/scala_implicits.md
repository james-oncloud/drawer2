It looks like there might be a slight mix-up with the version numbering! Scala 2.12 and 2.13 were the major releases before **Scala 3** arrived. In Scala 3, "implicits" were actually redesigned into `given`, `using`, and `extension` clauses to make them more explicit and less confusing.

However, since you specifically asked about **implicits** (the classic Scala 2 style), I’ll break down how they work, why they are used, and how the compiler decides which one to pick.

---

## 1. What are Implicits?

Implicits allow the compiler to "fill in the blanks" for you. If a value or a conversion is missing, the compiler looks at the available implicit definitions in the scope to see if it can fix the code automatically.

### Key Use Cases

* **Dependency Injection:** Passing a configuration or database connection through multiple layers without writing it in every function call.
* **Type Classes:** Adding behavior to existing types (like defining how to "serialize to JSON" for a class you didn't write).
* **Implicit Conversions:** Automatically turning one type into another (e.g., `Int` to `Double`). *Note: This is now discouraged in favor of extension methods.*

---

## 2. The Three Flavors of Implicits

### A. Implicit Parameters

The most common use case. You mark the last parameter list of a function as `implicit`.

```scala
case class UserContext(language: String)

def greet(name: String)(implicit context: UserContext): Unit = {
  if (context.language == "ES") println(s"Hola, $name")
  else println(s"Hello, $name")
}

// Define an implicit value in scope
implicit val currentContext: UserContext = UserContext("ES")

// You don't have to pass the second argument list!
greet("Alice") // Output: Hola, Alice

```

### B. Implicit Conversions

Used to "enrich" a class with new methods (the "Pimp My Library" pattern).

```scala
// Making an Int behave like it has a 'isEven' method
implicit class IntOps(val x: Int) extends AnyVal {
  def isEven: Boolean = x % 2 == 0
}

println(10.isEven) // True

```

### C. Type Classes

This combines the two above to create polymorphic behavior.

---

## 3. Implicit Precedence (The Search Order)

When the compiler needs an implicit, it looks in a specific order. If it finds multiple valid options at the same level, it throws an **"ambiguous implicit values"** error.

1. **Local Scope:** Definitions in the current block, imports, or inherited members.
2. **Implicit Scope:** The compiler looks at the "companion objects" associated with the types involved:
* Companion object of the type itself.
* Companion object of the trait/class being looked for.
* Companion objects of type parameters (e.g., if looking for `List[A]`, it looks at the `List` and `A` companions).



---

## 4. Summary Table

| Feature | Scala 2 Syntax | Purpose |
| --- | --- | --- |
| **Value** | `implicit val x = ...` | Defines the value to be injected. |
| **Parameter** | `def foo(implicit x: T)` | Tells the function to look for a `T`. |
| **Conversion** | `implicit def aToB(a: A): B` | Converts type A to B automatically. |
| **Class** | `implicit class RichInt(i: Int)` | Adds methods to existing types. |

---

### A Note on Scala 3

If you are starting a new project, Scala 3 has replaced `implicit` with more descriptive keywords:

* `given` replaces `implicit val`.
* `using` replaces `implicit` parameters.
* `extension` replaces `implicit class`.

**Would you like me to show you how these same examples look in the new Scala 3 syntax?**


## Type Classes

In Scala, **Type Classes** are a powerful pattern that allows you to add behavior to existing types without modifying their source code and without using traditional inheritance.

Think of it as a "contract" (the Type Class) and "implementations" for specific types (the Instances).

---

## 1. The Three Components of a Type Class

To implement a Type Class, you need three distinct parts:

### A. The Trait (The Definition)

This defines what the behavior looks like. It is usually a generic trait with one or more abstract methods.

```scala
trait JSONSerializer[T] {
  def toJson(value: T): String
}

```

### B. Implicit Instances (The Implementations)

You create concrete implementations for the types you want to support (Int, String, or your custom Case Classes). These are marked as `implicit`.

```scala
implicit val stringSerializer: JSONSerializer[String] = new JSONSerializer[String] {
  def toJson(value: String): String = s""""$value""""
}

implicit val intSerializer: JSONSerializer[Int] = new JSONSerializer[Int] {
  def toJson(value: Int): String = value.toString
}

```

### C. The Interface (The Usage)

This is where the compiler ties everything together. You create a method that "demands" an implicit instance of your type class to exist in scope.

```scala
def convertToJson[T](value: T)(implicit serializer: JSONSerializer[T]): String = {
  serializer.toJson(value)
}

// Usage
convertToJson("Hello") // Returns: "Hello"
convertToJson(123)     // Returns: 123

```

---

## 2. How it Works (Under the Hood)

When you call `convertToJson("Hello")`, the Scala compiler sees that `T` is a `String`. It then looks for an `implicit` value of type `JSONSerializer[String]`. Because we defined `stringSerializer` as an implicit, the compiler automatically passes it into the function.

---

## 3. Why use Type Classes over Inheritance?

| Feature | Inheritance (Subtyping) | Type Classes (Ad-hoc Polymorphism) |
| --- | --- | --- |
| **Retrofitting** | Impossible. You can't make `java.lang.String` extend your trait. | **Easy.** You can define an instance for any type, even third-party ones. |
| **Decoupling** | High. The class must know about the trait it implements. | **Low.** The data (the class) and the behavior (the type class) are separate. |
| **Granularity** | You get all methods of the parent. | You only pull in the specific behavior you need. |

---

## 4. The "Context Bound" Syntax

Because passing `(implicit instance: Trait[T])` is so common, Scala provides a shorthand called a **Context Bound**:

```scala
// This is exactly the same as the 'convertToJson' method above
def convertToJson[T : JSONSerializer](value: T): String = {
  val serializer = implicitly[JSONSerializer[T]]
  serializer.toJson(value)
}

```

The `: JSONSerializer` inside the type brackets tells the compiler: "This function works for any type `T` as long as there is an implicit `JSONSerializer[T]` available."

Would you like to see how to apply this pattern to a complex custom Case Class, including how to handle nested types?


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
