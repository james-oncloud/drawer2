# Scala Free Monad Pattern

The free monad pattern models a program as a data structure (an AST) and then
interprets it later. You define an algebra of operations as a sealed trait,
construct programs by composing those operations, and provide interpreters that
execute or transform the program.

## Core Idea

- Define an algebra (ADT) that represents your operations.
- Lift algebra values into a `Free` structure.
- Write programs by composing `Free`.
- Provide interpreters (real, test, logging, analysis).

## Why the Name "Free Monad"?

"Free" means it is the most general monad you can build from your algebra, with
no extra behavior baked in beyond the monad laws. You "freely" generate a monad
by turning your operations into pure data and then adding only the minimal
structure needed to support `map`/`flatMap`. Any concrete interpretation is
provided later by an interpreter, so the program itself stays abstract and
uncommitted to effects.

This gives:
- Clear separation between program definition and execution.
- The ability to analyze or optimize programs before running them.
- Multiple interpreters without changing the program.

## Minimal Example (Scala 2)

```scala
// 1) Algebra
sealed trait ConsoleOp[A]
case object ReadLine extends ConsoleOp[String]
final case class PutLine(value: String) extends ConsoleOp[Unit]

// 2) A simple Free encoding
sealed trait Free[F[_], A]
final case class Pure[F[_], A](value: A) extends Free[F, A]
final case class Suspend[F[_], A](fa: F[A]) extends Free[F, A]
final case class FlatMap[F[_], A, B](fa: Free[F, A], f: A => Free[F, B])
  extends Free[F, B]

object Free {
  def liftF[F[_], A](fa: F[A]): Free[F, A] = Suspend(fa)
}

// Helpers
def readLine: Free[ConsoleOp, String] =
  Free.liftF(ReadLine)

def putLine(s: String): Free[ConsoleOp, Unit] =
  Free.liftF(PutLine(s))

// 3) Program
def greet: Free[ConsoleOp, Unit] =
  FlatMap(putLine("Name?"), _ =>
    FlatMap(readLine, name =>
      putLine("Hello, " + name)
    )
  )
```

## Interpreter

```scala
// A simple interpreter to Scala IO (side effects)
def runConsole[A](fa: Free[ConsoleOp, A]): A = fa match {
  case Pure(a)        => a
  case Suspend(op)    =>
    op match {
      case ReadLine      => scala.io.StdIn.readLine().asInstanceOf[A]
      case PutLine(value) =>
        println(value)
        ().asInstanceOf[A]
    }
  case FlatMap(sub, k) =>
    val a = runConsole(sub)
    runConsole(k(a))
}
```

This separates program construction from execution. You can add another
interpreter that logs, tests, or optimizes without changing the program.

## Why Use Free?

- You want program analysis (e.g., optimizations or validation).
- You need multiple interpreters with different behaviors.
- You want to serialize or transform programs before execution.

## Trade-offs

- More boilerplate (algebra + Free + interpreter).
- Potential performance overhead (can be mitigated with optimizations).
- Heavier abstraction than tagless-final.

## Comparison to Tagless-Final

- Free: program as data, great for analysis or rewriting.
- Tagless-final: program as functions, great for type safety and performance.

Both patterns are valid; choose based on whether you need an explicit program
representation or prefer direct interpretation through typeclasses.

* AST here means “an abstract syntax tree,” i.e. the program represented as data. In this file it refers to the free program you build from the algebra (ConsoleOp) and Free constructors (Pure, Suspend, FlatMap) before interpreting it. It’s essentially the data structure formed by your composed operations, which can be analyzed or interpreted later.
