# Scala Cake Pattern (Scala 2)

The cake pattern is a way to do dependency injection in Scala 2 using traits
and self-types. You define components as traits, wire them together by mixing
traits, and get compile-time guarantees that dependencies are provided.

## Core Idea

- Define a component as a trait with abstract members.
- Use self-types to declare required dependencies.
- Assemble modules by mixing traits in a concrete object or class.

This gives:
- Compile-time wiring of dependencies.
- Easy swapping of implementations.
- No external DI framework required.

## Minimal Example

```scala
// 1) Component contracts
trait UserRepository {
  def find(id: String): Option[String]
}

trait UserService { self: UserRepository =>
  def greetUser(id: String): String = {
    val name = find(id).getOrElse("unknown")
    "Hello, " + name
  }
}

// 2) Implementations
trait InMemoryUserRepository extends UserRepository {
  private val users = Map("1" -> "Ada", "2" -> "Grace")
  def find(id: String): Option[String] = users.get(id)
}

// 3) Wiring (the "cake")
object AppModule extends UserService with InMemoryUserRepository

// Usage
val msg = AppModule.greetUser("1")
```

The `UserService` declares a self-type `self: UserRepository =>` which means
it can only be mixed into something that also provides a `UserRepository`.

## Replacing Implementations

```scala
trait StubUserRepository extends UserRepository {
  def find(id: String): Option[String] = Some("TestUser")
}

object TestModule extends UserService with StubUserRepository
```

## Component Pattern (Typical Structure)

```scala
trait UserRepositoryComponent {
  trait UserRepository {
    def find(id: String): Option[String]
  }
}

trait UserServiceComponent { self: UserRepositoryComponent =>
  trait UserService {
    def greetUser(id: String): String
  }
  class UserServiceImpl extends UserService {
    def greetUser(id: String): String = {
      val name = userRepository.find(id).getOrElse("unknown")
      "Hello, " + name
    }
  }
  def userRepository: UserRepository
}
```

This style nests interfaces to make wiring more explicit, but is more verbose.

## Trade-offs

- Compile-time safety and no runtime reflection.
- Verbose and harder to read for newcomers.
- Can be less flexible than constructor-based DI.
- Mix-in linearization can be surprising if overused.

## When to Use

- You want compile-time DI without a framework.
- You have a small to medium codebase with clear module boundaries.
- You are already using traits heavily and want tight type safety.

In modern Scala, many teams prefer constructor injection or tagless-final for
better clarity and testability, but the cake pattern is still useful when you
want pure compile-time wiring.
