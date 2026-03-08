# Scala Extractors and Use Cases (Scala 2)

Extractors are the mechanism behind pattern matching on custom types and
non-case classes. An extractor defines how to *pull apart* a value for matching,
usually via an `unapply` or `unapplySeq` method (or in Scala 2.11+, an
`unapply` inside a companion object).

## Core Idea

- `apply` builds values.
- `unapply` deconstructs values for pattern matching.
- Extractors can hide representation details and provide alternative views.

## Minimal Example

```scala
final class Email(val value: String)

object Email {
  def apply(value: String): Email = new Email(value)

  def unapply(email: Email): Option[String] =
    if (email.value.contains("@")) Some(email.value) else None
}

val e = Email("a@b.com")

e match {
  case Email(v) => "ok: " + v
  case _        => "invalid"
}
```

Here, `Email.unapply` returns `Some(value)` to indicate a successful match or
`None` to indicate failure.

## Multi-Field Extractors

```scala
final case class Point(x: Int, y: Int)

object Point {
  def unapply(p: Point): Option[(Int, Int)] =
    Some((p.x, p.y))
}

val p = Point(1, 2)

p match {
  case Point(x, y) => x + y
}
```

Note: case classes automatically generate `unapply`, so this manual version is
only needed when you want custom matching behavior.

## Boolean Extractors

An `unapply` can return `Boolean` for simple yes/no matches:

```scala
object Even {
  def unapply(i: Int): Boolean = i % 2 == 0
}

5 match {
  case Even() => "even"
  case _      => "odd"
}
```

## Sequence Extractors (`unapplySeq`)

Use `unapplySeq` to match variable-length sequences:

```scala
object Csv {
  def unapplySeq(s: String): Option[Seq[String]] =
    Some(s.split(",").toSeq)
}

"a,b,c" match {
  case Csv(a, b, c) => a + b + c
  case _            => "no match"
}
```

## Common Use Cases

- **Validation in pattern matching**: return `None` to reject invalid input.
- **Hide representation**: expose a stable matching API while refactoring
  internals.
- **Alternate views**: match on a derived structure instead of the raw value.
- **Legacy or external types**: add pattern matching without changing classes.

## Tips and Pitfalls

- Keep `unapply` pure and inexpensive; pattern matching can call it often.
- Prefer `Option` to signal failure and extract values safely.
- Use `unapplySeq` when you need varargs-like patterns.
- For case classes, rely on the generated extractor unless custom behavior is
  needed.

Extractors are a lightweight way to make pattern matching expressive and
domain-friendly without forcing everything into case classes.
