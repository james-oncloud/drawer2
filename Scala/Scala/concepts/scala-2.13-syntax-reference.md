# Scala 2.13 Syntax Reference (Domain: E-Commerce)

This file is a quick refresher with runnable-style snippets covering core Scala 2.13 syntax.

## Section titles

- 1) Basic structure
- 2) Values, variables, types, literals
- 3) Expressions, blocks, conditionals
- Control statements deep dive (if/else, switch-style match, loops)
- 4) Methods, parameter lists, defaults, named args, varargs
- 5) By-name params, currying, partial application
- 6) Classes, constructor params, companion object
- 7) Case classes, sealed ADTs, pattern matching
- 8) Traits, abstract members, mixins, self-type
- 9) Objects, singleton, package object style utility
- 10) Collections and common ops
- Collections deep dive (when and how to use)
- 11) For-comprehensions, guards, yield
- 12) Option, Either, Try
- 13) Tuples, destructuring, zip/unzip
- 14) Higher-order functions, anonymous functions, placeholders
- 15) PartialFunction and collect
- 16) Pattern matching extras (typed, guards, extractor)
- 17) Inheritance, overriding, access modifiers
- 18) Generics, variance, bounds, type alias
- 19) Implicits in Scala 2.13 (core patterns)
- 20) Type class style (implicit parameter)
- 21) Context bounds and implicitly
- 22) Lazy val, final, sealed, case object
- 23) Exceptions, throw, try/catch/finally
- 24) Tail recursion annotation
- 25) Futures and async style composition
- 26) XML literal (Scala 2 feature)
- 27) Common control syntax (while/do-while)
- 28) Package/import variations
- 29) Quick checklist

---

## 1) Basic structure

```scala
package concepts.ecommerce

import scala.collection.immutable.{List, Map}
import java.time.Instant

object AppMain extends App {
  println("Scala 2.13 syntax reference")
}
```

---

## 2) Values, variables, types, literals

```scala
val shopName: String = "Drawer Mart"
var activeUsers: Int = 0

val pi = 3.14159         // type inference
val enabled: Boolean = true
val big: Long = 10_000L
val dec: Double = 19.99
val letter: Char = 'S'
val raw: String = """multi
line
string"""

val escaped = "line1\nline2"
val price = 42.5
val msg = f"Total: $$${price}%.2f"
```

---

## 3) Expressions, blocks, conditionals

```scala
val maxItems = {
  val base = 5
  val extra = 3
  base + extra
}

val tier = if (maxItems > 6) "PRO" else "FREE"

val status = if (activeUsers == 0) {
  "cold-start"
} else {
  "live"
}
```

---

## Control statements deep dive (if/else, switch-style match, loops)

Scala control flow is expression-oriented, so most statements return values you can assign.

### if / else (returns a value)

```scala
val cartTotal = BigDecimal(120)

val shippingFee: BigDecimal =
  if (cartTotal >= 100) BigDecimal(0)
  else if (cartTotal >= 50) BigDecimal(5)
  else BigDecimal(10)
```

### switch equivalent in Scala: `match`

Scala does not have a Java-style `switch`; use `match` instead.

```scala
val paymentCode = "CARD"

val paymentMessage = paymentCode match {
  case "CARD"   => "Pay with credit/debit card"
  case "WALLET" => "Pay with wallet"
  case "COD"    => "Pay on delivery"
  case _        => "Unknown payment method"
}
```

### match with guards and pattern shapes

```scala
def orderRiskLabel(order: Order): String = order match {
  case Order(_, items, _) if items.exists(_.qty >= 10) => "bulk-order"
  case Order(_, Nil, _)                                => "empty-order"
  case Order(id, _, PaymentMethod.CashOnDelivery)      => s"cod:$id"
  case Order(id, _, _)                                 => s"normal:$id"
}
```

### for-loop style iteration

```scala
for (i <- 1 to 3) println(s"attempt=$i")

for {
  item <- items
  if item.qty > 1
} println(s"${item.sku} has qty ${item.qty}")
```

### while / do-while (mutation-oriented cases)

```scala
var retries = 0
while (retries < 3) {
  retries += 1
}

do {
  retries -= 1
} while (retries > 0)
```

### break/continue alternatives

Scala avoids `break`/`continue` in normal style; prefer combinators:

```scala
val firstHighQty = items.find(_.qty > 3)             // like break when found
val onlyInStock = items.filter(_.qty > 0)            // like continue by skipping
val hasBag = items.exists(_.sku.startsWith("BAG"))   // stop early on true
```

---

## 4) Methods, parameter lists, defaults, named args, varargs

```scala
def applyDiscount(amount: BigDecimal, percent: BigDecimal = BigDecimal(10)): BigDecimal =
  amount - (amount * percent / 100)

def formatOrder(id: String, currency: String = "USD", verbose: Boolean = false): String =
  s"Order($id, $currency, verbose=$verbose)"

def sumAll(nums: Int*): Int = nums.sum

val a = applyDiscount(BigDecimal(120))
val b = applyDiscount(amount = BigDecimal(120), percent = BigDecimal(15))
val c = formatOrder("ORD-1", verbose = true)
val d = sumAll(1, 2, 3, 4)
```

---

## 5) By-name params, currying, partial application

```scala
def timed[A](label: String)(thunk: => A): A = {
  val start = System.nanoTime()
  val out = thunk
  val elapsed = (System.nanoTime() - start) / 1e6
  println(s"$label took $elapsed ms")
  out
}

def tax(rate: BigDecimal)(amount: BigDecimal): BigDecimal = amount * rate
val vat = tax(BigDecimal("0.20")) _ // partial application
```

---

## 6) Classes, constructor params, companion object

```scala
class Customer(val id: String, var email: String, private var loyaltyPoints: Int) {
  def addPoints(p: Int): Unit = loyaltyPoints += p
  def points: Int = loyaltyPoints
  override def toString: String = s"Customer($id,$email,$loyaltyPoints)"
}

object Customer {
  def apply(id: String, email: String): Customer = new Customer(id, email, 0)
  def fromCsv(row: String): Option[Customer] = row.split(",").toList match {
    case id :: email :: Nil => Some(Customer(id.trim, email.trim))
    case _                  => None
  }
}
```

---

## 7) Case classes, sealed ADTs, pattern matching

```scala
sealed trait PaymentMethod
object PaymentMethod {
  final case class Card(last4: String, holder: String) extends PaymentMethod
  case object CashOnDelivery extends PaymentMethod
  final case class Wallet(provider: String) extends PaymentMethod
}

final case class LineItem(sku: String, qty: Int, unitPrice: BigDecimal)
final case class Order(id: String, items: List[LineItem], payment: PaymentMethod)

def paymentLabel(pm: PaymentMethod): String = pm match {
  case PaymentMethod.Card(last4, _) => s"CARD-****$last4"
  case PaymentMethod.CashOnDelivery => "COD"
  case PaymentMethod.Wallet(p)      => s"WALLET-$p"
}
```

---

## 8) Traits, abstract members, mixins, self-type

```scala
trait Logger {
  def log(msg: String): Unit
}

trait ConsoleLogger extends Logger {
  override def log(msg: String): Unit = println(s"[LOG] $msg")
}

trait IdGenerator {
  def nextId(): String
}

trait RequiresIds { self: IdGenerator =>
  def createSku(base: String): String = s"$base-${nextId()}"
}

class RandomIds extends IdGenerator {
  override def nextId(): String = java.util.UUID.randomUUID().toString.take(8)
}

class CatalogService extends RandomIds with RequiresIds with ConsoleLogger
```

---

## 9) Objects, singleton, package object style utility

```scala
object Money {
  val Zero: BigDecimal = BigDecimal(0)
  def usd(amount: BigDecimal): String = s"$$$amount"
}
```

---

## 10) Collections and common ops

```scala
val items = List(
  LineItem("BOOK-1", 2, BigDecimal(12.5)),
  LineItem("PEN-9", 5, BigDecimal(1.2)),
  LineItem("BAG-4", 1, BigDecimal(30))
)

val totalQty: Int = items.map(_.qty).sum
val expensive: List[LineItem] = items.filter(_.unitPrice > 10)
val bySku: Map[String, LineItem] = items.map(i => i.sku -> i).toMap
val grouped: Map[String, List[LineItem]] = items.groupBy(_.sku.takeWhile(_ != '-'))
val existsBag: Boolean = items.exists(_.sku.startsWith("BAG"))
val allPositive: Boolean = items.forall(_.qty > 0)
val firstPen: Option[LineItem] = items.find(_.sku.startsWith("PEN"))
```

---

## Collections deep dive (when and how to use)

Prefer immutable collections by default. Reach for mutable collections only in tightly scoped, performance-sensitive, or builder-style code.

### Immutable vs mutable

```scala
import scala.collection.mutable

// Immutable: every "update" returns a new value
val baseSet = Set("BOOK-1", "PEN-9")
val nextSet = baseSet + "BAG-4"       // baseSet unchanged

// Mutable: in-place updates
val mutableSet = mutable.Set("BOOK-1", "PEN-9")
mutableSet += "BAG-4"
```

### Pick the right collection

- `List[A]`: fast prepend (`::`), cheap head/tail recursion, linked-list semantics.
- `Vector[A]`: good default indexed immutable sequence; balanced random access and updates.
- `Set[A]`: uniqueness checks and membership operations.
- `Map[K, V]`: key-value lookup and transformations.
- `Seq[A]`: generic sequence API when concrete type is not important.
- `Array[A]`: JVM array interop and performance-critical indexed operations.

### List and Vector patterns

```scala
val skuList = List("BOOK-1", "PEN-9")
val withHead = "BAG-4" :: skuList          // prepend
val appended = skuList :+ "NOTE-2"         // append (costlier on List)

val skuVector = Vector("BOOK-1", "PEN-9", "BAG-4")
val updated = skuVector.updated(1, "PEN-10")
val randomAccess = skuVector(2)
```

### Set patterns

```scala
val blockedSkus = Set("BAD-1", "BAD-2")
val isBlocked = blockedSkus.contains("BAD-1")
val clean = blockedSkus - "BAD-2"
val merged = blockedSkus ++ Set("BAD-3", "BAD-4")
```

### Map patterns

```scala
val priceBySku: Map[String, BigDecimal] = Map(
  "BOOK-1" -> BigDecimal(12.5),
  "PEN-9"  -> BigDecimal(1.2)
)

val maybePrice: Option[BigDecimal] = priceBySku.get("BOOK-1")
val withDefault = priceBySku.withDefaultValue(BigDecimal(0))
val afterUpdate = priceBySku.updated("BOOK-1", BigDecimal(13.0))
val removed = priceBySku - "PEN-9"
```

### Transformations to know well

```scala
val orders: List[Order] = List(
  Order("O-1", List(LineItem("BOOK-1", 2, BigDecimal(12.5))), PaymentMethod.CashOnDelivery),
  Order("O-2", List(LineItem("PEN-9", 5, BigDecimal(1.2))), PaymentMethod.Wallet("PayFast"))
)

val orderIds = orders.map(_.id)
val bigOrders = orders.filter(_.items.exists(_.qty >= 3))
val allItems = orders.flatMap(_.items)
val itemCountBySku = allItems.groupMapReduce(_.sku)(_.qty)(_ + _)
val (cheap, premium) = allItems.partition(_.unitPrice < 10)
```

### fold/reduce/scan basics

```scala
val numbers = List(1, 2, 3, 4)

val sumWithFoldLeft = numbers.foldLeft(0)(_ + _)
val sumWithReduce = numbers.reduce(_ + _)
val runningTotals = numbers.scanLeft(0)(_ + _) // List(0, 1, 3, 6, 10)
```

### Conversions and views

```scala
val seq: Seq[Int] = List(1, 2, 3)
val asVector: Vector[Int] = seq.toVector
val asSet: Set[Int] = seq.toSet

// view = lazy transformation chain; materialize with toList/toVector/etc.
val lazyResult = (1 to 1_000_000).view.map(_ * 2).filter(_ % 3 == 0).take(5).toList
```

### Mutable collections (practical usage)

```scala
import scala.collection.mutable

val buffer = mutable.ListBuffer.empty[String]
buffer += "BOOK-1"
buffer += "PEN-9"
val immutableList: List[String] = buffer.toList

val counts = mutable.Map.empty[String, Int]
counts.update("BOOK-1", counts.getOrElse("BOOK-1", 0) + 1)
```

### Parallel collections note

In Scala 2.13, parallel collections are not in the standard library by default. Add the separate module (`scala-parallel-collections`) if you need `.par`.

---

## 11) For-comprehensions, guards, yield

```scala
val quantitiesBySku: List[(String, Int)] =
  for {
    i <- items
    if i.qty >= 2
  } yield (i.sku, i.qty)
```

---

## 12) Option, Either, Try

```scala
import scala.util.{Try, Success, Failure}

def parseQty(raw: String): Option[Int] = Try(raw.toInt).toOption.filter(_ > 0)

def validateEmail(email: String): Either[String, String] =
  if (email.contains("@")) Right(email) else Left("Invalid email")

def safeDivide(a: Int, b: Int): Try[Int] = Try(a / b)

val maybeQty: Option[Int] = parseQty("3")
val validated: Either[String, String] = validateEmail("a@b.com")
val division: Try[Int] = safeDivide(10, 2)
```

---

## 13) Tuples, destructuring, zip/unzip

```scala
val pair: (String, Int) = ("BOOK-1", 2)
val (sku, qty) = pair

val names = List("a", "b", "c")
val nums = List(1, 2, 3)
val zipped: List[(String, Int)] = names.zip(nums)
val (unzippedNames, unzippedNums) = zipped.unzip
```

---

## 14) Higher-order functions, anonymous functions, placeholders

```scala
val add: (Int, Int) => Int = (a, b) => a + b
val doubled: List[Int] = List(1, 2, 3).map(x => x * 2)
val tripled: List[Int] = List(1, 2, 3).map(_ * 3)
val evens: List[Int] = List(1, 2, 3, 4).filter(_ % 2 == 0)
```

---

## 15) PartialFunction and collect

```scala
val onlySkus: PartialFunction[Any, String] = {
  case s: String if s.contains("-") => s
}

val rawEvents: List[Any] = List("BOOK-1", 99, "PEN-9", false)
val skus: List[String] = rawEvents.collect(onlySkus)
```

---

## 16) Pattern matching extras (typed, guards, extractor)

```scala
object Sku {
  private val Pattern = "([A-Z]+)-(\\d+)".r
  def unapply(raw: String): Option[(String, Int)] = raw match {
    case Pattern(prefix, n) => Some(prefix -> n.toInt)
    case _                  => None
  }
}

def classify(value: Any): String = value match {
  case i: Int if i > 0    => "positive int"
  case s: String          => s"text($s)"
  case Sku(prefix, num)   => s"sku($prefix,$num)"
  case _                  => "unknown"
}
```

---

## 17) Inheritance, overriding, access modifiers

```scala
abstract class Product(val sku: String) {
  def price: BigDecimal
  protected def category: String
  override def toString: String = s"$category:$sku @ $price"
}

class Book(sku: String, val title: String, val base: BigDecimal) extends Product(sku) {
  override def price: BigDecimal = base
  protected override def category: String = "BOOK"
}
```

---

## 18) Generics, variance, bounds, type alias

```scala
trait JsonWriter[-A] {
  def write(a: A): String
}

final case class Box[+A](value: A)

def duplicate[A](a: A): List[A] = List(a, a)
def maxOf[A <: Ordered[A]](x: A, y: A): A = if (x > y) x else y
type Price = BigDecimal
```

---

## 19) Implicits in Scala 2.13 (core patterns)

```scala
object Formatting {
  implicit val defaultCurrency: String = "USD"

  def showPrice(amount: BigDecimal)(implicit currency: String): String =
    s"$currency $amount"

  implicit class IntOps(private val n: Int) extends AnyVal {
    def times(body: => Unit): Unit = (1 to n).foreach(_ => body)
  }
}

import Formatting._
val rendered: String = showPrice(BigDecimal(9.99))
3.times(println("repeat"))
```

---

## 20) Type class style (implicit parameter)

```scala
trait Show[A] { def show(a: A): String }

object ShowInstances {
  implicit val showItem: Show[LineItem] =
    (a: LineItem) => s"${a.sku} x${a.qty} @ ${a.unitPrice}"
}

def render[A](a: A)(implicit ev: Show[A]): String = ev.show(a)
```

---

## 21) Context bounds and implicitly

```scala
def renderWithContextBound[A: Show](a: A): String = {
  val showA = implicitly[Show[A]]
  showA.show(a)
}
```

---

## 22) Lazy val, final, sealed, case object

```scala
sealed trait CheckoutState
case object CartOpen extends CheckoutState
final case class Paid(at: Instant) extends CheckoutState

lazy val expensiveBootstrap: String = {
  println("init once")
  "ready"
}
```

---

## 23) Exceptions, throw, try/catch/finally

```scala
def riskyLookup(id: String): String =
  if (id.nonEmpty) id else throw new IllegalArgumentException("id required")

val result: String =
  try riskyLookup("ORD-1")
  catch {
    case e: IllegalArgumentException => s"fallback: ${e.getMessage}"
  } finally {
    ()
  }
```

---

## 24) Tail recursion annotation

```scala
import scala.annotation.tailrec

def factorial(n: Int): BigInt = {
  @tailrec
  def loop(i: Int, acc: BigInt): BigInt =
    if (i <= 1) acc else loop(i - 1, acc * i)

  loop(n, 1)
}
```

---

## 25) Futures and async style composition

```scala
import scala.concurrent.{Future, ExecutionContext}
import scala.util.{Success, Failure}

implicit val ec: ExecutionContext = ExecutionContext.global

def fetchInventory(sku: String): Future[Int] = Future.successful(10)
def fetchPrice(sku: String): Future[BigDecimal] = Future.successful(BigDecimal(19.99))

val offer: Future[(Int, BigDecimal)] = for {
  inv <- fetchInventory("BOOK-1")
  pr  <- fetchPrice("BOOK-1")
} yield (inv, pr)

offer.onComplete {
  case Success((inv, pr)) => println(s"inventory=$inv, price=$pr")
  case Failure(ex)        => println(s"error: ${ex.getMessage}")
}
```

---

## 26) XML literal (Scala 2 feature)

```scala
val xml =
  <order id="ORD-1">
    <item sku="BOOK-1" qty="2"/>
  </order>
```

---

## 27) Common control syntax (while/do-while)

```scala
var i = 0
while (i < 3) {
  i += 1
}

do {
  i -= 1
} while (i > 0)
```

---

## 28) Package/import variations

```scala
import scala.collection.mutable.{Map => MutableMap}
import scala.util.{Try => Attempt}
import java.time.{Instant => TimePoint}
```

---

## 29) Quick checklist

- `val`, `var`, type inference
- methods, defaults, named args, varargs
- classes, objects, case classes, traits
- ADTs + pattern matching
- collections and for-comprehensions
- `Option` / `Either` / `Try`
- implicits + type classes
- generics, variance, bounds
- futures and async composition

If you want, I can also generate a second file focused only on **advanced Scala 2.13** (higher-kinded types, path-dependent types, abstract type members, and magnet pattern examples).
