# Monadic Coffee: Step-by-Step in Scala 2

Below is a realistic, step-by-step coffee workflow modeled as monadic processing using `Either` for errors. Each step returns a value in the same context, and the pipeline is chained with a `for`-comprehension.

## Scala Source

```scala
package demo

sealed trait CoffeeError { def message: String }
final case class Missing(item: String) extends CoffeeError {
  val message: String = s"Missing: $item"
}
final case class OutOfRange(step: String) extends CoffeeError {
  val message: String = s"Invalid step: $step"
}

final case class Beans(grams: Int)
final case class Water(ml: Int, tempC: Int)
final case class Grounds(grams: Int)
final case class Brew(water: Water, grounds: Grounds, minutes: Int)
final case class Cup(contents: String)

object CoffeeMachine {
  type Result[A] = Either[CoffeeError, A]

  def getBeans(stockGrams: Int): Result[Beans] =
    if (stockGrams > 0) Right(Beans(stockGrams))
    else Left(Missing("beans"))

  def grind(beans: Beans, grams: Int): Result[Grounds] =
    if (grams > 0 && grams <= beans.grams) Right(Grounds(grams))
    else Left(OutOfRange("grind amount"))

  def heatWater(ml: Int, tempC: Int): Result[Water] =
    if (ml > 0 && tempC >= 80 && tempC <= 100) Right(Water(ml, tempC))
    else Left(OutOfRange("water temperature or volume"))

  def brew(water: Water, grounds: Grounds, minutes: Int): Result[Brew] =
    if (minutes >= 2 && minutes <= 5) Right(Brew(water, grounds, minutes))
    else Left(OutOfRange("brew time"))

  def pour(brew: Brew): Result[Cup] =
    Right(Cup(s"Coffee: ${brew.grounds.grams}g, ${brew.water.ml}ml at ${brew.water.tempC}C"))

  def makeCoffee(stockGrams: Int): Result[Cup] =
    for {
      beans   <- getBeans(stockGrams)
      grounds <- grind(beans, grams = 18)
      water   <- heatWater(ml = 250, tempC = 94)
      drink   <- brew(water, grounds, minutes = 3)
      cup     <- pour(drink)
    } yield cup
}

object Demo {
  def main(args: Array[String]): Unit = {
    val result = CoffeeMachine.makeCoffee(stockGrams = 50)
    result match {
      case Right(cup)  => println(cup.contents)
      case Left(err)   => println(err.message)
    }
  }
}
```

## Why This Is Monadic

- Every step returns `Result[A]` (`Either[CoffeeError, A]`).
- The `for`-comprehension desugars to chained `flatMap` calls.
- The first failure short-circuits the rest of the pipeline.

If you want a version using `Option`, `Try`, or `Future`, I can add it in the same style.
