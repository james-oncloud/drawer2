# Scala Akka Framework Type System and Mappings

This note explains the key Akka type-system ideas in Scala 2, with a focus on how
types map to runtime behavior, message routing, and safety.

## 1) Core Actor Model Types

- `ActorSystem`: the root of everything. It manages actor lifecycles, threading,
  supervision, and configuration. The system type is generic in Classic Akka, and
  typed in Akka Typed.
- `ActorRef`: the type-safe handle used to send messages. In Classic Akka, it is
  untyped (`ActorRef`) and message types are checked at runtime. In Akka Typed,
  it is typed as `ActorRef[T]`, where `T` is the message protocol.
- `Actor`: the behavior. In Classic Akka it is a class extending `Actor` with
  a `receive: PartialFunction[Any, Unit]`. In Akka Typed it is a value of
  `Behavior[T]`, where `T` is the message protocol.

Mapping: `ActorRef[T]` only accepts `T`, which turns message protocol violations
from runtime errors into compile-time errors.

## 2) Classic vs Typed: Type System Shift

### Classic Akka

- `Actor` + `ActorRef` are untyped.
- Messages are `Any`. The `receive` function pattern-matches and ignores
  unknown types.
- Safety relies on convention and tests.

### Akka Typed

- Protocols are explicit and sealed:
  `sealed trait Command; case class Foo(...) extends Command`.
- `Behavior[Command]` replaces `Actor`.
- `ActorRef[Command]` replaces untyped `ActorRef`.

Mapping: the type `Command` maps to the only legal messages for a given actor,
and the compiler enforces protocol boundaries.

## 3) `Behavior[T]` and State Types

`Behavior[T]` is a pure description of what an actor can do.

- `Behavior[T]` is immutable and can return a new `Behavior[T]` as next state.
- Common constructors: `Behaviors.receive`, `Behaviors.receiveMessage`,
  `Behaviors.setup`.

Mapping: `Behavior[T]` is analogous to a state machine with input type `T`.

## 4) Protocol Types and Adapters

Akka Typed encourages explicit protocols:

- Command protocol: messages the actor accepts.
- Event or internal protocol: messages produced within the actor.
- Response protocol: messages sent to other actors.

Adapters:

- `context.messageAdapter[Other](map: Other => Command)` converts messages from
  other protocols into your own `Command` type.

Mapping: adapter functions map foreign message types into your actor's protocol,
preserving compile-time type safety.

## 5) Supervision and Type Boundaries

Supervision strategies are typed to the behavior:

- `Behaviors.supervise(behavior).onFailure[Exception](strategy)`
- Failure types are expressed in the type parameter of `onFailure`.

Mapping: the failure type parameter constrains which failures the supervisor
handles, and keeps the behavior type unchanged (`Behavior[T]`).

## 6) Ask Pattern and Typed Replies

In Akka Typed, ask uses a typed reply:

- `ActorRef[Reply]` is passed in the message.
- `context.ask` or `AskPattern.ask` returns `Future[Reply]`.

Mapping: the reply protocol type is explicit; the `Future` type matches the reply
type, eliminating manual casting.

## 7) Routers and Typed ActorRefs

Routers take `ActorRef[T]` and route `T` messages only.

- `Routers.pool(poolSize)` returns a `PoolRouter[T]`.
- `Routers.group(routees)` returns a `GroupRouter[T]`.

Mapping: routing is constrained by `T`, preventing accidental cross-protocol
message sends.

## 8) Persistence Typed: State and Event Types

In Akka Persistence Typed:

- `EventSourcedBehavior[Command, Event, State]`
- The types define strict boundaries:
  - `Command`: input protocol
  - `Event`: persisted facts
  - `State`: derived state

Mapping: the type parameters encode a functional mapping
`(State, Event) => State` and `(Command, State) => Effect[Event, State]`.

## 9) Streams: Backpressure Type Mapping

Akka Streams uses type parameters to encode stream shape:

- `Source[Out, Mat]`, `Flow[In, Out, Mat]`, `Sink[In, Mat]`.
- `Mat` is the materialized value (runtime result of building the stream).

Mapping: the type system maps stream graph edges to input/output types, and
materialization to `Mat`.

## 10) Interop: Typed to Classic

Akka Typed provides adapters:

- `typedActorRef.toClassic`
- `classicActorRef.toTyped[Command]`

Mapping: adapter methods create a bridge but do not change semantics. Typed
adapters enforce `Command` at compile time for the typed side.

## 11) Common Type-Safety Pitfalls

- Using `ActorRef[Any]` defeats the protocol safety guarantees.
- Mixing Classic and Typed can reintroduce untyped boundaries.
- Using `ask` without explicit reply types can widen types accidentally.

## 12) Summary Mapping Table

| Classic Akka                | Akka Typed                          | Type-Safety Mapping |
|----------------------------|-------------------------------------|---------------------|
| `Actor`                    | `Behavior[T]`                       | Input protocol is `T` |
| `ActorRef`                 | `ActorRef[T]`                       | Only `T` accepted |
| `receive: Any => Unit`     | `receive: T => Behavior[T]`         | Compile-time checks |
| `Props`                    | `Behaviors.setup`                   | Behavior factories |
| `ask` (`Future[Any]`)      | `ask` (`Future[Reply]`)             | Typed reply |
| `router`                   | `Router[T]`                         | Protocol safe routing |
| `FSM`                      | `Behavior` + state types            | State machine typed |
| `PersistentActor`          | `EventSourcedBehavior[C,E,S]`       | Explicit event/state |

