# Dependency Injection in Scala (Scala 2)

Below are common ways to do DI in Scala 2, ranging from simple manual wiring to
framework-based solutions.

## 1) Constructor Injection (Manual Wiring)

```scala
final class UserService(repo: UserRepository, clock: Clock) {
  def greet(id: String): String = "Hello, " + repo.find(id)
}
```

- Most explicit and readable.
- Easy to test with simple stubs.
- Works well with immutable data and case classes.

## 2) Module Objects / Composition Roots

```scala
object AppModule {
  val repo: UserRepository = new InMemoryUserRepository
  val clock: Clock = SystemClock
  val service: UserService = new UserService(repo, clock)
}
```

- Centralizes wiring in one place.
- No external library required.

## 3) Cake Pattern (Traits + Self-Types)

```scala
trait UserService { self: UserRepository =>
  def greet(id: String): String = "Hello, " + find(id)
}
```

- Compile-time wiring via trait mixins.
- Can get verbose and hard to navigate in large codebases.

## 4) Implicit Parameters / Context Bounds

```scala
final class Greeter(implicit clock: Clock) {
  def now: Long = clock.nowMillis
}
```

- Useful for “ambient” dependencies.
- Can obscure wiring if overused.

## 5) Typeclasses / Tagless-Final (Parametric DI)

```scala
def greet[F[_]](implicit C: Console[F]): F[Unit] = ???
```

- Dependencies are expressed as typeclass constraints.
- Very testable; multiple interpreters possible.

## 6) Service Locator (Runtime Lookup)

```scala
object Services {
  val repo: UserRepository = new DbUserRepository
}
```

- Simple but hides dependencies.
- Generally discouraged for large systems.

## 7) Framework DI

### Play + Guice (default in many Scala 2 Play apps)
```scala
@Singleton
class UserController @Inject()(svc: UserService) extends Controller
```

### MacWire (compile-time wiring)
```scala
import com.softwaremill.macwire._
lazy val userService = wire[UserService]
```

- Guice uses runtime reflection (more “Java-style” DI).
- MacWire wires at compile time (less magic, faster failures).

## How to Choose

- Small apps: constructor injection + module objects.
- Medium apps: constructor injection + MacWire or manual modules.
- Libraries: typeclasses / tagless-final for maximum flexibility.
- Legacy trait-heavy code: cake pattern might fit, but consider refactors.

Most teams prefer constructor injection as the default and add tooling only
when wiring becomes repetitive.
