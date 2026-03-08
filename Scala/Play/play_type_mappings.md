# Common Type Mappings in Play

This note summarizes the common type mappings you see in Play apps (Scala 2),
covering HTTP bodies, JSON, forms, and database layers. It focuses on the
everyday mappings rather than exhaustive edge cases.

## HTTP Body to Scala Types

Play parses the request body into a `Request[A]` where `A` depends on the body
parser used by the `Action`.

- **Text**: `Action.text` or `parse.text` → `Request[String]`
- **JSON**: `Action(parse.json)` → `Request[JsValue]`
- **Form URL-encoded**: `Action(parse.formUrlEncoded)` → `Request[Map[String, Seq[String]]]`
- **Multipart**: `Action(parse.multipartFormData)` → `Request[MultipartFormData[TemporaryFile]]`
- **Raw bytes**: `Action(parse.raw)` → `Request[RawBuffer]`
- **Any content**: `Action(parse.anyContent)` → `Request[AnyContent]`

## JSON Mappings

Play JSON uses `Reads`, `Writes`, or `Format` to map between `JsValue` and Scala
types.

- **Basic types**:
  - `String` ↔ `JsString`
  - `Int`, `Long`, `Double`, `BigDecimal` ↔ `JsNumber`
  - `Boolean` ↔ `JsBoolean`
  - `Option[T]` ↔ nullable / missing JSON value
- **Collections**:
  - `Seq[T]`, `List[T]`, `Vector[T]` ↔ `JsArray`
  - `Map[String, T]` ↔ `JsObject`
- **Case classes**:
  - `case class User(...)` ↔ `JsObject` using implicit `Reads/Writes/Format`

## Form Mappings

Play’s form API maps form fields to Scala types using `Mapping`s.

- **Text fields**: `String`
- **Numbers**: `Int`, `Long`, `BigDecimal`
- **Booleans**: `Boolean` (`true/false`, `on/off` depending on form)
- **Dates**: `java.time.LocalDate`, `java.time.Instant` (with appropriate formatters)
- **Optional fields**: `Option[T]`
- **Nested data**: case classes via `mapping(...)` + `apply/unapply`

## Route Parameter Mappings

In the `routes` file, parameters are converted to Scala types by built-in
binders.

- **Path/query**: `String`, `Int`, `Long`, `Boolean`, `UUID`
- **Custom types**: add an implicit `PathBindable` / `QueryStringBindable`

Example:

```
GET   /users/:id   controllers.Users.show(id: Long)
```

## Database Layer Mappings

Depends on the DB library in use:

- **Anorm**: `Row` → Scala types via column parsers
- **Slick**: DB column types ↔ Scala types via `MappedColumnType`
- **JPA/Hibernate** (less common in Scala): entity fields ↔ Scala types

## Tips

- Prefer `Reads/Writes` (or `Format`) for JSON, and `Mapping`s for forms.
- Use `Option[T]` to represent nullable/optional fields at all boundaries.
- Add custom binders for domain-specific route parameters (e.g. `UserId`).
