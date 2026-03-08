# Monads and Monadic Processing

This file explains what monads are and what "monadic processing" means, using Scala 2-friendly terms and examples.

## 1) Intuition

A **monad** is a type constructor (like `Option`, `List`, `Either`) that:

- Wraps a value in a context (e.g., maybe there is a value, maybe not).
- Lets you transform the wrapped value **without unpacking it yourself**.
- Preserves the context across a sequence of operations.

You can think of a monad as a **pipeline-friendly container**.

## 2) The Core Operations

A monad is defined by two operations (names vary):

- **`pure` / `unit` / `apply`**: put a value in the context.
- **`flatMap` / `bind`**: chain computations that return a value in the same context.

In Scala, the monad interface is usually:

```scala
def pure[A](a: A): M[A]
def flatMap[A, B](ma: M[A])(f: A => M[B]): M[B]
```

`map` can be derived from `flatMap`:

```scala
def map[A, B](ma: M[A])(f: A => B): M[B] =
  flatMap(ma)(a => pure(f(a)))
```

## 3) Example: `Option`

`Option` models "a value or no value".

```scala
def parseInt(s: String): Option[Int] =
  if (s.matches("-?\\d+")) Some(s.toInt) else None

def reciprocal(n: Int): Option[Double] =
  if (n != 0) Some(1.0 / n) else None

val result: Option[Double] =
  parseInt("10").flatMap(reciprocal)
```

Here, if `parseInt` returns `None` or `reciprocal` returns `None`, the whole chain yields `None`.

## 4) Example: `Either` for Error Handling

```scala
def readUser(id: String): Either[String, String] =
  if (id.nonEmpty) Right("Maya") else Left("empty id")

def readEmail(name: String): Either[String, String] =
  if (name == "Maya") Right("maya@example.com") else Left("no email")

val email: Either[String, String] =
  readUser("123").flatMap(readEmail)
```

The first `Left` stops the chain and carries the error.

## 5) Monadic Processing

**Monadic processing** is simply *sequencing computations* that each return a monadic value, using `flatMap` (or for-comprehensions in Scala).

Scala’s `for` syntax is just syntactic sugar:

```scala
val email: Either[String, String] =
  for {
    name  <- readUser("123")
    email <- readEmail(name)
  } yield email
```

The compiler rewrites this into nested `flatMap` calls.

## 6) Why It Matters

Monadic processing gives you:

- **Composable pipelines** where each step can fail or branch.
- **Local reasoning**: each step focuses on its own logic.
- **Context preservation**: errors, optionality, or multiple results flow through automatically.

## 7) Laws (Why the Abstraction Works)

Monads are expected to satisfy three laws:

- **Left identity**: `pure(a).flatMap(f) == f(a)`
- **Right identity**: `m.flatMap(pure) == m`
- **Associativity**: `m.flatMap(f).flatMap(g) == m.flatMap(x => f(x).flatMap(g))`

These laws ensure your chained computations behave predictably.

If you want this tailored to a specific monad (e.g., `Future`, `IO`, `Try`) or a more formal definition, tell me which one.
