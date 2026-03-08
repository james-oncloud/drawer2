# Scala 3 for Scala 2 Devs — Cheatsheet (practical)

## 1) `implicit` → `given` / `using` / `summon`

### Typeclass instance

```scala
// Scala 2
implicit val ordInt: Ordering[Int] = Ordering.Int

// Scala 3
given ordInt: Ordering[Int] = Ordering.Int
```

### Context parameter

```scala
// Scala 2
def sort[A](xs: List[A])(implicit ord: Ordering[A]) = xs.sorted

// Scala 3
def sort[A](xs: List[A])(using ord: Ordering[A]) = xs.sorted
```

### Summon an instance

```scala
// Scala 2
implicitly[Ordering[Int]]

// Scala 3
summon[Ordering[Int]]
```

### Pass explicitly

```scala
sort(List(3,1,2))(using Ordering.Int)
```

---

## 2) Implicit classes → `extension` methods

```scala
// Scala 2
implicit class StringOps(s: String) {
  def shout: String = s.toUpperCase + "!"
}

// Scala 3
extension (s: String)
  def shout: String = s.toUpperCase + "!"
```

---

## 3) Implicit conversions (still possible, but discouraged)

```scala
import scala.language.implicitConversions

given Conversion[String, Int] with
  def apply(s: String): Int = s.toInt
```

Prefer explicit `.toInt`, constructors, or extension methods.

---

## 4) `with` replaces most `extends A with B with C`

```scala
class C extends A, B, C  // ❌ not Scala 3

class D extends A with B with C // ✅ still valid
```

(Scala 3 also allows `class D extends A, B, C` in some contexts? In practice, you’ll mostly see `extends A with B with C` and it’s safest to keep using it.)

---

## 5) `trait` / `class` braces → optional indentation syntax

```scala
trait Foo:
  def x: Int

final class Bar extends Foo:
  def x: Int = 1
```

Braces still work:

```scala
trait Foo { def x: Int }
```

---

## 6) `case class` stays, but enums get much nicer

### Scala 2 sealed ADT

```scala
sealed trait Color
case object Red extends Color
case object Green extends Color
case object Blue extends Color
```

### Scala 3 `enum`

```scala
enum Color:
  case Red, Green, Blue
```

Enums with data:

```scala
enum Result[+A]:
  case Ok(value: A)
  case Err(msg: String)
```

---

## 7) ADTs: `sealed trait` still fine, `enum` often better

Pattern matching works the same, but Scala 3 improves exhaustivity checks.

---

## 8) `implicit` parameters on methods → `using` + `given`

```scala
def parse[A](s: String)(using p: Parser[A]): A = p.parse(s)
```

---

## 9) “Implicit object” → `given` in companion (same lookup rules vibe)

```scala
trait Show[A]: def show(a: A): String

object Show:
  given Show[Int] with
    def show(a: Int) = a.toString
```

Companion-based resolution still matters.

---

## 10) `type` alias is the same; new “opaque types” replace value classes in many cases

### Scala 2 value class pattern

```scala
final case class UserId(value: String) extends AnyVal
```

### Scala 3 `opaque type`

```scala
object domain:
  opaque type UserId = String

  object UserId:
    def apply(s: String): UserId = s

  extension (id: UserId)
    def value: String = id
```

Benefits: no boxing like value classes sometimes, and you can enforce constructors.

---

## 11) `implicit val` for “evidence” → `given` + context bounds stay

```scala
def f[A: Ordering](xs: List[A]) =
  xs.sorted(using summon[Ordering[A]])
```

---

## 12) `:=` / `<:<` evidence still exists (type constraints)

You’ll still see:

```scala
def g[A, B](using ev: A <:< B): B = ev(??? : A)
```

---

## 13) `@tailrec`, `@inline`, etc. same; but macros changed

* Scala 2 macros → Scala 3 `inline` + `quoted` / `scala.quoted` macros.
* Many libraries provide Scala 3 versions; migration may mean upgrading dependencies.

---

## 14) New: `inline`, `transparent inline`, and `erased`

Basic:

```scala
inline def twice(inline n: Int): Int = n + n
```

Most devs use these indirectly via libs (e.g., derivation, compile-time ops).

---

## 15) New: `derives` for typeclass derivation (common in FP libs)

```scala
import scala.deriving.*
import scala.compiletime.*

enum Codec derives CanEqual:
  case Json, Text
```

(Real-world: `derives` for `Eq`, `Show`, codecs, etc., depends on library support.)

---

## 16) `CanEqual` and safer equality

Scala 3 introduces stricter equality checks (especially with `-Xfatal-warnings` policies).

You may need:

* `derives CanEqual` on enums/case classes (often automatic)
* or imports / config depending on your settings and libs

---

## 17) `??` / `?` wildcards changed; use `_` or `?` in types

* Existentials `forSome` are gone; use `?`:

```scala
val xs: List[?] = List(1, "a")
```

---

## 18) Type lambdas syntax improved

```scala
// Scala 2
type EitherStr[A] = Either[String, A]

// Scala 3 (same)
type EitherStr[A] = Either[String, A]

// Higher-kinded lambda
type F = [A] =>> Either[String, A]
```

---

## 19) Imports: `given` imports are explicit

```scala
import Foo.given          // import all givens from Foo
import Foo.{given Ordering[Int]}
```

Helps avoid “where did that implicit come from?”

---

## 20) Top-level definitions (no object wrapper needed)

```scala
// Scala 3 file can contain:
def main(args: Array[String]): Unit =
  println("hi")

val x = 1
type Id[A] = A
```

---

# Quick migration tips (battle-tested)

* **Start with** `-source:3.0-migration` (or ScalaFix rules) and fix warnings.
* Replace:

  * `implicit class` → `extension`
  * `implicit val/def/object` → `given`
  * `implicitly[T]` → `summon[T]`
  * `implicit` parameter lists → `(using ...)`
* Prefer **opaque types** over `AnyVal` for new “tiny types”.
* Watch for:

  * wildcard/existential changes (`?`)
  * equality (`CanEqual`)
  * macro/library upgrades

If you want, paste a small Scala 2 snippet from your codebase (e.g., implicits + typeclasses + extension ops), and I’ll rewrite it into idiomatic Scala 3 side-by-side.
