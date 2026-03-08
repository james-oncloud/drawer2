# Guice in Scala (with Guice API)

This note explains how to use Google Guice for dependency injection in Scala 2 and lists the core Guice API classes you will typically use.

## 1) What Guice Does

Guice is a **dependency injection (DI)** framework. You define how interfaces map to implementations in modules, and Guice builds object graphs for you at runtime.

## 2) Minimal Example (Scala 2)

### Build Definition (sbt)

```scala
libraryDependencies += "com.google.inject" % "guice" % "5.1.0"
```

### Domain Types

```scala
trait Clock {
  def nowMillis: Long
}

final class SystemClock extends Clock {
  def nowMillis: Long = System.currentTimeMillis()
}

final class Greeter @javax.inject.Inject() (clock: Clock) {
  def greet(name: String): String =
    s"Hello $name @ ${clock.nowMillis}"
}
```

### Module (Bindings)

```scala
import com.google.inject.{AbstractModule, Guice}

final class AppModule extends AbstractModule {
  override def configure(): Unit = {
    bind(classOf[Clock]).to(classOf[SystemClock])
  }
}
```

### Wiring and Usage

```scala
object Main {
  def main(args: Array[String]): Unit = {
    val injector = Guice.createInjector(new AppModule)
    val greeter = injector.getInstance(classOf[Greeter])
    println(greeter.greet("Maya"))
  }
}
```

## 3) Guice API (Core Types)

The following are the most commonly used Guice types:

- `com.google.inject.Guice`  
  Factory to create an `Injector` from one or more `Module`s.

- `com.google.inject.Injector`  
  The container that creates and resolves objects.

- `com.google.inject.Module`  
  Describes bindings (typically implemented by `AbstractModule`).

- `com.google.inject.AbstractModule`  
  Base class with the `configure()` method where bindings are declared.

- `com.google.inject.Key`  
  Represents a type + optional annotation; used for advanced bindings.

- `com.google.inject.Provider[T]`  
  Factory interface for custom object creation logic.

- `com.google.inject.Singleton`  
  Scope annotation for singletons.

JSR-330 annotations (used by Guice):

- `javax.inject.Inject`  
  Marks constructors, fields, or methods for injection.

- `javax.inject.Named`  
  Qualifies bindings by name.

- `javax.inject.Singleton`  
  Scope annotation (JSR-330 equivalent of `com.google.inject.Singleton`).

## 4) Common Binding Patterns

### Bind an Interface to an Implementation

```scala
bind(classOf[Clock]).to(classOf[SystemClock])
```

### Bind a Constant

```scala
import com.google.inject.name.Names
bind(classOf[String])
  .annotatedWith(Names.named("env"))
  .toInstance("prod")
```

### Bind a Provider

```scala
bind(classOf[Clock]).toProvider(classOf[SystemClockProvider])
```

## 5) Tips for Scala

- Prefer constructor injection and `final` classes.
- Keep modules small and focused.
- Avoid field injection when possible.
- If you use Scala `object` singletons, they are already singletons and usually do not need Guice.

If you want a Play Framework example or a Guice module with multibindings, say the target.
