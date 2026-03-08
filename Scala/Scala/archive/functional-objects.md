# Functional Objects (Scala)

Functional objects are **immutable objects** whose methods return new values instead of modifying internal state. They are a core idea in functional programming and fit naturally with Scala’s object-oriented and functional mix.

## Key Traits

- **Immutability**: fields are `val`, not `var`.
- **No side effects**: methods do not change object state.
- **Pure operations**: the same inputs yield the same outputs.
- **Value semantics**: objects behave like values you can safely share.

## Example: Immutable, Functional Object

```scala
final case class Counter(value: Int) {
  def inc: Counter = copy(value = value + 1)
  def dec: Counter = copy(value = value - 1)
}

val c1 = Counter(0)
val c2 = c1.inc
val c3 = c2.inc
// c1 is still Counter(0), c2 is Counter(1), c3 is Counter(2)
```

## Contrast: Imperative Object (Not Functional)

```scala
final class MutableCounter(var value: Int) {
  def inc(): Unit = { value += 1 }
  def dec(): Unit = { value -= 1 }
}
```

The mutable version changes internal state, which makes reasoning and testing harder.

## Why It Matters

- **Thread-safe by default**: no mutable state to synchronize.
- **Composable**: easy to chain operations without surprises.
- **Predictable**: easier to test and refactor.

If you want a larger Scala 2 example (e.g., bank accounts, inventory, or domain modeling), tell me the domain and I will expand this file.
