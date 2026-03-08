# Advanced Scala Interview Answers

## Q1. Explain higher-kinded types and give a real-world use case.

**Answer:** Higher-kinded types abstract over type constructors (e.g., F[_]). They enable
writing APIs that work over any effect or container.

**Example:**
```scala
trait Functor[F[_]] {
  def map[A, B](fa: F[A])(f: A => B): F[B]
}
```

This is a Scala typeclass definition for a Functor:
- trait Functor[F[_]] says “for any type constructor F that takes one type parameter (like List, Option, Future)…”
- map takes an F[A] and a function A => B, and returns an F[B] by applying the function inside the context F.
- It doesn’t change the structure of F, only transforms the contained values.

Example usage: for Option, map turns Option[Int] into Option[String] by applying a function to the Int if it exists.

## Q2. When would you reach for path-dependent types? Provide an example.

**Answer:** When a type is tied to a specific instance, enforcing relationships between
values and their types.

**Example:**
```scala
trait DB {
  type Row
  def fetch(id: Int): Row
}
def getFirst(db: DB): db.Row = db.fetch(1)
```

## Q3. How do dependent method types differ from generic methods?

**Answer:** Dependent method types allow return types to depend on value parameters.

**Example:**
```scala
trait Box { type A; val value: A }
def unwrap(b: Box): b.A = b.value
```

## Q4. Describe implicit resolution order and how to debug ambiguous implicits.

**Answer:** Scala searches local scope, imported scope, and companion objects of types
involved. Debug by reducing imports, using explicit parameters, or `implicitly`.

**Example:**
```scala
implicit val intOrd: Ordering[Int] = Ordering.Int
val o = implicitly[Ordering[Int]]
```

## Q5. How do given/using in Scala 3 improve on Scala 2 implicits?

**Answer:** They make context parameters explicit and readable, and avoid implicit
conversions by default.

**Example:**
```scala
given intOrd: Ordering[Int] = Ordering.Int
def sortInts(xs: List[Int])(using Ordering[Int]) = xs.sorted
```

## Q6. Explain covariance vs contravariance with a Scala collection example.

**Answer:** `List[+A]` is covariant: List[Cat] <: List[Animal]. Function input is
contravariant.

**Example:**
```scala
class Animal; class Cat extends Animal
val cats: List[Cat] = List(new Cat)
val animals: List[Animal] = cats
```

## Q7. What is a GADT, and how does it enable safer pattern matching?

**Answer:** GADTs refine types per constructor, allowing exhaustive, type-safe matches.

**Example:**
```scala
sealed trait Expr[A]
case class IntLit(value: Int) extends Expr[Int]
case class Add(a: Expr[Int], b: Expr[Int]) extends Expr[Int]
def eval[A](e: Expr[A]): A = e match {
  case IntLit(v) => v
  case Add(x, y) => eval(x) + eval(y)
}
```

## Q8. Compare Scala 2 macros with Scala 3 metaprogramming (quotes/splices).

**Answer:** Scala 2 uses compiler plugins and `macro` with blackbox/whitebox contexts.
Scala 3 uses `quoted` ASTs and inline macros with safer APIs.

**Example (Scala 3):**
```scala
import scala.quoted.*
inline def debug(inline x: Any): String = ${ debugImpl('x) }
def debugImpl(x: Expr[Any])(using Quotes): Expr[String] =
  Expr(x.show)
```

## Q9. When would you use opaque types instead of value classes?

**Answer:** When you want zero runtime overhead and stronger type safety without boxing.

**Example:**
```scala
object Domain {
  opaque type UserId = Long
  def UserId(value: Long): UserId = value
  extension (id: UserId) def value: Long = id
}
```

## Q10. What are match types and how can they be used for type-level computation?

**Answer:** They compute types based on pattern matching over types.

**Example:**
```scala
type Elem[X] = X match
  case String => Char
  case Array[t] => t
```

## Q11. Explain union and intersection types with a concrete example.

**Answer:** Union `A | B` accepts either, intersection `A & B` requires both.

**Example:**
```scala
trait A { def a: Int }
trait B { def b: Int }
def f(x: A | B) = x
def g(x: A & B) = x.a + x.b
```

## Q12. What are context functions in Scala 3 and how are they used?

**Answer:** Functions that require given parameters, simplifying dependency injection.

**Example:**
```scala
type WithLog = String ?=> Int
def calc: WithLog = summon[String].length
```

## Q13. How does tagless-final compare to effect systems like ZIO or Cats Effect?

**Answer:** Tagless-final abstracts over an effect type `F[_]`; ZIO/IO are concrete
effect types with runtime semantics.

**Example:**
```scala
trait UserRepo[F[_]] { def get(id: Int): F[String] }
```

## Q14. Explain extractor objects and advanced pattern matching techniques.

**Answer:** Extractors define custom `unapply` for decomposition and validation.

**Example:**
```scala
object Even {
  def unapply(x: Int): Option[Int] =
    if (x % 2 == 0) Some(x) else None
}
def f(x: Int) = x match {
  case Even(n) => n
  case _ => 0
}
```

## Q15. Describe differences between Futures and effect types (e.g., ZIO, IO).

**Answer:** Futures are eager and start immediately; effect types are lazy and describe
computation with control over execution.

**Example:**
```scala
import scala.concurrent.Future
def eager(): Future[Int] = Future(1) // starts now
```

## Q16. What are common performance pitfalls with boxing and specialization?

**Answer:** Using generic numeric types causes boxing. Specialization or primitives
avoid it.

**Example:**
```scala
def sumInts(xs: Array[Int]): Int = xs.sum
```

## Q17. Explain polymorphic function values and where they are useful.

**Answer:** Functions with type parameters as values, useful for higher-order APIs.

**Example:**
```scala
val id = [A] => (a: A) => a
```

## Q18. How does type inference fail, and how do you guide it?

**Answer:** It can fail with overloaded methods or higher-kinded types. Add type
annotations or explicit type parameters.

**Example:**
```scala
def mk[A](a: A) = List(a)
val xs = mk[Int](1)
```

## Q19. What is eta-expansion and when does it matter?

**Answer:** Converting methods to function values; needed when a method must be passed
as a value.

**Example:**
```scala
def inc(x: Int): Int = x + 1
val f: Int => Int = inc _
```

## Q20. What is SAM conversion and how does it interact with implicit function types?

**Answer:** Single Abstract Method interfaces can be instantiated by lambdas; implicit
function types are converted to SAMs when needed.

**Example:**
```scala
trait Runnable { def run(): Unit }
val r: Runnable = () => println("hi")
```

## Q21. Discuss implicit scope rules and prioritization patterns.

**Answer:** Use low-priority implicits via traits and prefer local/explicit givens.

**Example:**
```scala
trait LowPri {
  implicit val ordAny: Ordering[Any] = Ordering.by(_.hashCode)
}
object Pri extends LowPri {
  implicit val ordInt: Ordering[Int] = Ordering.Int
}
```

## Q22. What are type lambdas and partial unification used for?

**Answer:** Type lambdas allow fixing some type parameters of a type constructor.

**Example:**
```scala
type EitherStr[A] = Either[String, A]
```

## Q23. Explain existential types in Scala 2 and why they are discouraged.

**Answer:** Existentials hide a type member, reducing type safety; prefer generics.

**Example:**
```scala
def size(xs: List[_]): Int = xs.size
```

## Q24. What is kind polymorphism and why is it important?

**Answer:** Types abstract over type constructors of different kinds, enabling more
generic libraries.

**Example:**
```scala
// Scala 3: [F[_]] is a kind-polymorphic parameter
trait Lift[F[_]] { def pure[A](a: A): F[A] }
```

## Q25. How do you troubleshoot overload resolution conflicts?

**Answer:** Use explicit type ascriptions or rename methods to avoid ambiguity.

**Example:**
```scala
def foo(x: Int): Int = x
def foo(x: String): String = x
val v: Int = foo(1)
```

## Q26. Explain by-name parameters and lazy evaluation semantics.

**Answer:** By-name parameters delay evaluation until used and can be re-evaluated.

**Example:**
```scala
def twice(x: => Int): Int = x + x
```

## Q27. How do you define custom compile-time errors in Scala 3?

**Answer:** Use `compiletime.error` inside inline methods to reject invalid usage.

**Example:**
```scala
import scala.compiletime.error
inline def requireNonEmpty(inline s: String): String =
  if s == "" then error("empty string") else s
```

## Q28. What is TASTy and how does compile-time reflection use it?

**Answer:** TASTy is Scala 3's typed AST format; macros inspect it via `Quotes`.

**Example:**
```scala
import scala.quoted.*
inline def showType[A]: String = ${ showTypeImpl[A] }
def showTypeImpl[A: Type](using Quotes): Expr[String] =
  Expr(Type.show[A])
```

## Q29. How do you implement custom BuildFrom/CanBuildFrom for collections?

**Answer:** Provide a builder for custom collections to participate in collection ops.

**Example:**
```scala
import scala.collection.BuildFrom
final case class Box[A](value: A)
given boxBuildFrom[A]: BuildFrom[Box[A], A, Box[A]] with
  def fromSpecific(from: Box[A])(it: IterableOnce[A]) =
    Box(it.iterator.next())
  def newBuilder(from: Box[A]) =
    scala.collection.mutable.Builder.apply[A, Box[A]](Box(_))
```

## Q30. What are delimited continuations and CPS transformations?

**Answer:** Techniques to represent control flow explicitly, enabling advanced effects.

**Example:**
```scala
type Cont[R, A] = (A => R) => R
def pure[R, A](a: A): Cont[R, A] = k => k(a)
```

## Q31. What are the risks of unsafe reflection and runtime mirrors?

**Answer:** They can break type safety, cause runtime failures, and hurt performance.

**Example:**
```scala
import scala.reflect.runtime.universe.*
val mirror = runtimeMirror(getClass.getClassLoader)
```

## Q32. How do modular implicits and coherence issues arise?

**Answer:** Different modules can define conflicting instances for the same type class,
leading to ambiguity or inconsistent behavior.

**Example:**
```scala
trait Show[A] { def show(a: A): String }
object A { implicit val showInt: Show[Int] = _.toString }
object B { implicit val showInt: Show[Int] = _ => "int" }
```

## Q33. What are best practices for resource safety (bracket/managed patterns)?

**Answer:** Use `bracket`/`use` to guarantee release on success/failure.

**Example:**
```scala
def bracket[A, B](acquire: => A)(use: A => B)(release: A => Unit): B =
  try use(acquire) finally release(acquire)
```

## Q34. Discuss serialization pitfalls for case classes and enums.

**Answer:** Schema changes break compatibility; prefer explicit versioning or codecs.

**Example:**
```scala
final case class User(id: Long, name: String)
```

## Q35. When would you write a compiler plugin, and what are common use cases?

**Answer:** For cross-cutting compile-time checks or code generation not supported by
macros. Examples include linting and custom DSLs.

**Example:**
```scala
// Conceptual: implement scala.tools.nsc.plugins.Plugin
```
