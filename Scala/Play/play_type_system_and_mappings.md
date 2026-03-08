# Play Framework Type System and Type Mappings (Scala 2)

This note summarizes the **major types you encounter in Play** and how data
maps across HTTP, JSON, forms, routes, templates, and persistence. It is a
practical, “what maps to what” guide rather than a theoretical type system
specification.

## 1) HTTP Layer Types

Play models the web request/response cycle with strongly-typed request bodies.

- **`RequestHeader`**: method, path, headers, query string (no body).
- **`Request[A]`**: `RequestHeader` + parsed body of type `A`.
- **`Result`**: HTTP status, headers, body (e.g., text, JSON, bytes, stream).
- **`Action[A]`**: function from `Request[A]` → `Result` (sync) or
  `Future[Result]` (async).

### Common body parser mappings

- `parse.text` → `Request[String]`
- `parse.json` → `Request[JsValue]`
- `parse.formUrlEncoded` → `Request[Map[String, Seq[String]]]`
- `parse.multipartFormData` → `Request[MultipartFormData[TemporaryFile]]`
- `parse.raw` → `Request[RawBuffer]`
- `parse.anyContent` → `Request[AnyContent]`

`AnyContent` is an algebraic data type representing one of: text, json, form
data, raw, etc.

## 2) Routing and Binders

Routes map HTTP method + path to a controller method:

```
GET   /users/:id   controllers.Users.show(id: Long)
```

Play uses **binders** to map path/query strings to Scala types:

- Built-in: `String`, `Int`, `Long`, `Boolean`, `UUID`
- Custom: define implicit `PathBindable[A]` / `QueryStringBindable[A]`

## 3) JSON Type System (play-json)

Play JSON represents JSON with a dedicated algebra:

- `JsValue` (base type)
  - `JsObject`, `JsArray`, `JsString`, `JsNumber`, `JsBoolean`, `JsNull`

### JSON mappings

- **Basic types**:
  - `String` ↔ `JsString`
  - `Int`, `Long`, `Double`, `BigDecimal` ↔ `JsNumber`
  - `Boolean` ↔ `JsBoolean`
  - `Option[T]` ↔ missing or `JsNull`
- **Collections**:
  - `Seq[T]`, `List[T]`, `Vector[T]` ↔ `JsArray`
  - `Map[String, T]` ↔ `JsObject`
- **Case classes**:
  - `case class User(...)` ↔ `JsObject` via `Reads/Writes/Format`

Key JSON typeclasses:

- **`Reads[A]`**: JSON → Scala
- **`Writes[A]`**: Scala → JSON
- **`Format[A]`**: both directions (any JSON)
- **`OFormat[A]`**: both directions, **object-only** JSON

## 4) Form Mapping Types

Play’s form API maps form inputs into Scala types using `Mapping`s.

- **Text**: `String`
- **Numbers**: `Int`, `Long`, `BigDecimal`
- **Boolean**: `Boolean`
- **Dates**: `java.time.LocalDate`, `java.time.Instant` (with formatters)
- **Optional**: `Option[T]`
- **Nested**: case classes via `mapping(...)` + `apply/unapply`

## 5) Templates (Twirl) Types

Twirl templates compile to Scala functions, so type signatures are explicit.

Example:

```
@(user: User, isAdmin: Boolean)
```

This becomes a Scala function with parameters of those types, and returns
`Html` (or `HtmlFormat.Appendable`). Common output types:

- `Html` / `HtmlFormat.Appendable`
- `play.twirl.api.Content`

## 6) Controller Return Types

Typical action shapes:

- `Action[AnyContent]`
- `Action[JsValue]`
- `Action[String]`
- `Action[MultipartFormData[TemporaryFile]]`

Return values are `Result` or `Future[Result]`:

- `Action { ... }` → `Result`
- `Action.async { ... }` → `Future[Result]`

## 7) Async and Effect Types

Play is built around asynchronous IO:

- `Future[Result]` is the standard async return type.
- `ExecutionContext` is required for `Future` callbacks.

Streaming responses (less common in small apps) use:

- `Source[ByteString, _]` (Akka Streams) for chunked/streamed bodies.

## 8) Security and Session Types

Common request/session/cookie types:

- `Session`: key/value pairs stored client-side (signed).
- `Flash`: short-lived key/value pairs for redirects.
- `Cookie`: HTTP cookie with name, value, flags.
- `CSRF.Token`: name/value pair for CSRF protection.

## 9) Validation Types

Play uses typed validation results for both forms and JSON:

- JSON: `JsResult[A]` → `JsSuccess` / `JsError`
- Forms: `Form[A]` with `FormError` on binding

## 10) Dependency Injection Types

Play commonly uses Guice:

- `@Inject` to wire controller/service instances
- Interfaces/traits → concrete implementations via `Module`

## 11) Configuration Types

Play uses `Config` (Typesafe Config):

- `Configuration` wrapper with helpers for `String`, `Int`, `Boolean`, `Duration`
- Maps to Scala primitives and Java time/duration types

## 12) Persistence Layer Mappings

Play doesn’t mandate a DB library, so mappings depend on your choice:

- **Anorm**: SQL `Row` ↔ Scala types via parsers
- **Slick**: column types ↔ Scala types via `MappedColumnType`
- **JPA/Hibernate** (less common in Scala): entity fields ↔ Scala types

## Quick Mapping Checklist

- **HTTP**: `Request[A]` where `A` is the body type
- **JSON**: `JsValue` + `Reads/Writes/Format`
- **Forms**: `Form[A]` + `Mapping[A]`
- **Routes**: binders for path/query to Scala types
- **Templates**: parameters → `Html` result
- **DB**: library-specific mappings


