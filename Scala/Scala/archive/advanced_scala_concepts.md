# Advanced Scala Concepts

## Type System & Typing

- Type system: higher-kinded types, path-dependent types, dependent method types
- Type classes and implicits: implicit resolution, contextual abstractions
- Variance and bounds: covariance/contravariance, upper/lower bounds
- GADTs and polymorphic recursion
- Advanced pattern matching and extractor objects
- Implicit scope rules and implicit prioritization patterns
- Type inference limits, local type inference, and eta-expansion
- SAM conversion and implicit function types
- Extension methods and implicit classes
- Polymorphic function values
- Type lambdas and partial unification
- Existential types and wildcard types (Scala 2)
- Overload resolution and implicit conflict troubleshooting
- By-name parameters and lazy evaluation semantics
- Modular implicits and coherence issues

## Scala 3 Features

- Inline, opaque types, and type-level programming (Scala 3)
- Context functions and given/using (Scala 3)
- Union and intersection types (Scala 3)
- Match types and type-level computation (Scala 3)
- Opaque type aliases vs value classes
- Compile-time reflection and TASTy (Scala 3)
- Kind polymorphism (Scala 3)
- Meta-programming with quotes/splices (Scala 3)

## Metaprogramming & Compiler

- Macros and metaprogramming (Scala 2/3 differences)
- Compiler internals and custom plugins
- Compile-time error reporting and custom type errors
- Unsafe reflection and runtime mirrors

## Concurrency & Effects

- Effect systems and tagless-final
- Concurrency: Futures, Akka/typed actors, ZIO/Cats Effect

## Collections & Functional Patterns

- Advanced collections: custom CanBuildFrom/BuildFrom
- Delimited continuations and CPS transformations
- Resource safety patterns: bracket/managed resources

## Runtime, Interop & Performance

- Serialization and pickling pitfalls (case classes, enums)
- JVM interop: specialization, boxing, and performance tuning
