Here are the main ways polymorphism is implemented in Scala, from most common to more “Scala-ish”:

⸻

1. Subtype Polymorphism (Inheritance)

Classic OOP: a superclass reference can point to subclass instances.

trait Animal {
  def speak(): String
}

class Dog extends Animal {
  def speak(): String = "woof"
}

def talk(a: Animal): String = a.speak()

✔ Dynamic dispatch at runtime
✔ Same as Java, but traits are more flexible than interfaces

⸻

2. Parametric Polymorphism (Generics)

Write code that works for any type.

def identity[A](x: A): A = x

val i = identity(42)
val s = identity("hello")

✔ Compile-time polymorphism
✔ No inheritance required
✔ Heavily used in FP (List[A], Option[A], F[_])

⸻

3. Ad-hoc Polymorphism via Method Overloading

Same method name, different parameter types.

def add(x: Int, y: Int): Int = x + y
def add(x: Double, y: Double): Double = x + y

✔ Resolved at compile time
✔ Limited compared to type classes
✘ Can’t extend to new types cleanly

⸻

4. Ad-hoc Polymorphism via Type Classes (Idiomatic Scala)

Behavior is defined outside the type.

trait Show[A] {
  def show(a: A): String
}

implicit val intShow: Show[Int] =
  (a: Int) => s"int=$a"

def print[A](a: A)(implicit s: Show[A]): String =
  s.show(a)

✔ Open for extension
✔ No inheritance
✔ Foundation of Cats / Scalaz
✔ Compile-time checked

⸻

5. F-Bounded Polymorphism

A type refers to itself as a type parameter.

trait Comparable[A] {
  def compare(other: A): Int
}

class User(val age: Int) extends Comparable[User] {
  def compare(other: User): Int = age - other.age
}

✔ Used for “self-type aware” APIs
✔ Common in fluent builders

⸻

6. Higher-Kinded Polymorphism

Polymorphism over type constructors.

trait Functor[F[_]] {
  def map[A, B](fa: F[A])(f: A => B): F[B]
}

✔ Extremely powerful
✔ Core to Tagless Final, Cats, ZIO, FS2
✔ Enables abstracting over effects

⸻

7. Structural Polymorphism (Structural Types)

Polymorphism based on shape, not inheritance.

def close(r: { def close(): Unit }): Unit =
  r.close()

✔ Duck typing
✘ Uses reflection (slow)
✘ Rare in production

⸻

8. Self-Type Polymorphism

Restrict what can mix in a trait.

trait Logger {
  self: UserService =>
  def log(): Unit = println("logging")
}

✔ Compile-time enforcement of dependencies
✔ Used in Cake Pattern

⸻

Mental Model Cheat Sheet

Kind	When to Use
Subtype	OOP hierarchies
Parametric	Generic reusable code
Overloading	Simple numeric APIs
Type Classes	Extensible behavior
F-Bounded	Fluent/self-aware APIs
Higher-Kinded	Effect abstraction
Structural	Quick hacks only
Self-Type	Compile-time wiring


⸻

If you want, I can:
	•	Compare subtype vs type-class polymorphism with real Cats examples
	•	Show how Java polymorphism maps to Scala
	•	Explain which polymorphism you should avoid in large codebases