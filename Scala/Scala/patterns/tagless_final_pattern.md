# Scala Tagless-Final Pattern

The tagless-final pattern is a way to model programs by describing their
operations abstractly, then supplying different implementations later. Instead
of building an explicit data structure (like an AST) and interpreting it, you
describe programs using typeclasses (or traits) and keep interpretation
implicit via type parameters.

## Core Idea

- Define an algebra as a trait of operations.
- Write programs that are polymorphic over any implementation of that algebra.
- Provide one or more concrete interpreters (e.g., real, test, logging).

This leads to:
- Modular interpreters without rewriting programs.
- Better type safety and refactoring support.
- Separation of "what" the program does from "how" it runs.

## Minimal Example

```scala
// 1) Algebra
trait Console[F[_]] {
  def readLine: F[String]
  def putLine(s: String): F[Unit]
}

// 2) Program: abstract over F
def greet[F[_]](C: Console[F]): F[Unit] = {
  C.putLine("Name?") >>
    C.readLine.flatMap(name => C.putLine(s"Hello, $name"))
}
```

The program `greet` does not commit to any runtime. It only needs a `Console`
implementation for some effect type `F[_]`.

## Interpreters

```scala
// Real interpreter using cats-effect IO (simplified)
import cats.effect.IO

object IOConsole extends Console[IO] {
  def readLine: IO[String] = IO(scala.io.StdIn.readLine())
  def putLine(s: String): IO[Unit] = IO(println(s))
}

// Test interpreter using a pure state (conceptually)
case class Test[A](run: List[String] => (List[String], A))

object TestConsole extends Console[Test] {
  def readLine: Test[String] =
    Test {
      case head :: tail => (tail, head)
      case Nil          => (Nil, "")
    }
  def putLine(s: String): Test[Unit] =
    Test(inputs => (inputs, ()))
}
```

The same program `greet` can run in real IO or pure tests by changing the
interpreter.

## Compare to "Initial" Style

Initial (AST-based) style builds a syntax tree and interprets it later:

- Pros: can optimize or analyze the AST.
- Cons: more boilerplate, weaker refactoring, and values not necessarily typed
  as they run.

Tagless-final encodes the interpretation in the types, so the compiler can
help ensure that each program is well-formed for all interpreters.

## When to Use

- You want multiple interpreters (real, mock, logging, metrics).
- You want strong static typing for effects and domains.
- You want to avoid maintaining a separate AST and interpreter.

## Common Scala Ecosystem Patterns

- Use a `trait Algebra[F[_]]` for each capability.
- Combine algebras via traits or implicit parameters.
- Use effect types like `IO`, `ZIO`, `Future`, or custom monads.

Tagless-final is a pragmatic and type-safe way to write modular, testable
programs with minimal overhead.
