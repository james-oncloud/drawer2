# Scala ADT: Complete Example

Below is a complete, realistic example of an Algebraic Data Type (ADT) in Scala 2, including a sealed trait, case classes/objects, and exhaustive pattern matching.

## What Is an ADT?

An Algebraic Data Type is a **closed set of alternatives** combined using:

- **Sum types** (either/or): represent choices, usually modeled with a `sealed trait` and multiple `case class` or `case object` variants.
- **Product types** (and): represent a fixed grouping of fields, modeled with a `case class` that contains multiple values.

Scala models sum types with `sealed trait` + cases, and product types with `case class` fields. An ADT is often a combination of both: a sealed family of case classes where each case is a product of fields. Pattern matching gives you safe, exhaustive handling of all variants.

## 1) Scala Source

```scala
package demo

// ADT: sealed trait + cases
sealed trait Expr
final case class Num(value: BigDecimal) extends Expr
final case class Add(left: Expr, right: Expr) extends Expr
final case class Mul(left: Expr, right: Expr) extends Expr
case object Zero extends Expr

object Expr {
  // A total (exhaustive) evaluator for the ADT
  def eval(expr: Expr): BigDecimal = expr match {
    case Num(v)         => v
    case Add(l, r)      => eval(l) + eval(r)
    case Mul(l, r)      => eval(l) * eval(r)
    case Zero           => BigDecimal(0)
  }

  // Pretty printer
  def show(expr: Expr): String = expr match {
    case Num(v)         => v.toString()
    case Add(l, r)      => s"(${show(l)} + ${show(r)})"
    case Mul(l, r)      => s"(${show(l)} * ${show(r)})"
    case Zero           => "0"
  }

  // Small demo
  def main(args: Array[String]): Unit = {
    val expr: Expr =
      Add(
        Num(2),
        Mul(Num(3), Zero)
      )

    println(show(expr))
    println(eval(expr))
  }
}
```

## 2) Why This Is a Proper ADT

- `sealed trait Expr` ensures all cases are known at compile time (in this file).
- `case class` and `case object` represent the different constructors of the type.
- Pattern matching in `eval` and `show` is exhaustive and total.
- The ADT is immutable and easy to extend with new operations (e.g., `simplify`).

If you want a variant using type parameters or a larger real-world ADT (e.g., HTTP routing, domain modeling), say the topic and I will add it.
