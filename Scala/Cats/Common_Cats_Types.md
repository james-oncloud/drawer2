Common Cats types and what they do:

- EitherT: transformer that stacks an Either on top of another effect, adding typed errors.
  Example (Scala 2):
  ```scala
  import cats.data.EitherT
  import cats.implicits._

  val t: EitherT[Option, String, Int] = EitherT.fromEither[Option](Right(42))
  val value: Option[Either[String, Int]] = t.value
  ```
- OptionT: transformer that stacks an Option on top of another effect, adding optionality.
  Example (Scala 2):
  ```scala
  import cats.data.OptionT
  import cats.implicits._

  val t: OptionT[List, Int] = OptionT(List(Some(1), None, Some(3)))
  val value: List[Option[Int]] = t.value
  ```
- Writer: pairs a computed value with an accumulated log (requires a Monoid for the log).
  Example (Scala 2):
  ```scala
  import cats.data.Writer
  import cats.implicits._

  val w: Writer[Vector[String], Int] = Writer(Vector("start"), 10).tell(Vector("done"))
  val logs: Vector[String] = w.written
  val result: Int = w.value
  ```
- WriterT: transformer version of Writer for logging inside another effect.
  Example (Scala 2):
  ```scala
  import cats.data.WriterT
  import cats.implicits._

  val w: WriterT[Option, Vector[String], Int] =
    WriterT(Option((Vector("log"), 7)))
  val value: Option[(Vector[String], Int)] = w.value
  ```
- Reader: wraps a function R => A to model dependency injection without mutation.
  Example (Scala 2):
  ```scala
  import cats.data.Reader

  case class Config(mult: Int)
  val read: Reader[Config, Int] = Reader(cfg => cfg.mult * 2)
  val result: Int = read.run(Config(3))
  ```
- ReaderT: transformer version of Reader for dependency injection inside another effect.
  Example (Scala 2):
  ```scala
  import cats.data.ReaderT
  import cats.implicits._

  case class Config(name: String)
  val greet: ReaderT[Option, Config, String] =
    ReaderT(cfg => Option(s"hi ${cfg.name}"))
  val value: Option[String] = greet.run(Config("Ada"))
  ```
- State: represents stateful computations as a function S => (S, A).
  Example (Scala 2):
  ```scala
  import cats.data.State

  val inc: State[Int, Int] = State(s => (s + 1, s))
  val result: (Int, Int) = inc.run(10).value
  ```
- StateT: transformer version of State for stateful computations inside another effect.
  Example (Scala 2):
  ```scala
  import cats.data.StateT
  import cats.implicits._

  val st: StateT[Option, Int, Int] = StateT(s => Option((s + 1, s * 2)))
  val value: Option[(Int, Int)] = st.run(3)
  ```
- Ior: inclusive-or; can hold a left, a right, or both at the same time.
  Example (Scala 2):
  ```scala
  import cats.data.Ior

  val both: Ior[String, Int] = Ior.Both("warn", 5)
  val left: Ior[String, Int] = Ior.Left("error")
  val right: Ior[String, Int] = Ior.Right(2)
  ```
- Validated: accumulates errors (via a Semigroup) instead of failing fast.
  Example (Scala 2):
  ```scala
  import cats.data.Validated
  import cats.implicits._

  val a: Validated[List[String], Int] = Validated.invalid(List("bad a"))
  val b: Validated[List[String], Int] = Validated.invalid(List("bad b"))
  val combined = (a, b).mapN(_ + _)
  ```
- ValidatedNel: Validated with NonEmptyList for accumulating one or more errors.
  Example (Scala 2):
  ```scala
  import cats.data.ValidatedNel
  import cats.implicits._

  val v1: ValidatedNel[String, Int] = "bad".invalidNel
  val v2: ValidatedNel[String, Int] = 10.validNel
  val combined = (v1, v2).mapN(_ + _)
  ```
- NonEmptyList: list with at least one element, guaranteeing non-empty structure.
  Example (Scala 2):
  ```scala
  import cats.data.NonEmptyList

  val nel: NonEmptyList[Int] = NonEmptyList.of(1, 2, 3)
  val head: Int = nel.head
  ```
- NonEmptyChain: non-empty version of Chain, optimized for concatenation.
  Example (Scala 2):
  ```scala
  import cats.data.NonEmptyChain

  val nec: NonEmptyChain[String] = NonEmptyChain("a", "b")
  val list: List[String] = nec.toChain.toList
  ```
- NonEmptySet: set with at least one element, requiring an Order for elements.
  Example (Scala 2):
  ```scala
  import cats.data.NonEmptySet
  import cats.implicits._

  val nes: NonEmptySet[Int] = NonEmptySet.of(3, 1, 2)
  val min: Int = nes.min
  ```
- Chain: immutable sequence optimized for efficient concatenation.
  Example (Scala 2):
  ```scala
  import cats.data.Chain

  val c: Chain[Int] = Chain(1, 2) ++ Chain.one(3)
  val list: List[Int] = c.toList
  ```
- Kleisli: function wrapper A => F[B] with composition for effectful functions.
  Example (Scala 2):
  ```scala
  import cats.data.Kleisli
  import cats.implicits._

  val parse: Kleisli[Option, String, Int] = Kleisli(s => s.toIntOption)
  val double: Kleisli[Option, Int, Int] = Kleisli(n => Option(n * 2))
  val program: Kleisli[Option, String, Int] = parse.andThen(double)
  val value: Option[Int] = program.run("21")
  ```
- Eval: controlled evaluation for lazy, eager, or memoized computations.
  Example (Scala 2):
  ```scala
  import cats.Eval

  val eager: Eval[Int] = Eval.now(1)
  val lazyVal: Eval[Int] = Eval.later(2)
  val always: Eval[Int] = Eval.always(3)
  val sum: Int = (eager, lazyVal, always).mapN(_ + _ + _).value
  ```
