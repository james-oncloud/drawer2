# Play JSON (Scala) Summary

This page introduces Play’s JSON library and shows how to build, parse, and validate JSON in Scala. It covers the core JSON types, convenience builders, and the standard read/write/format workflows for converting between Scala models and `JsValue`. It also highlights safe and unsafe access patterns, plus validation with detailed errors.

## Key Concepts
- **Core types**: `JsValue` with concrete types like `JsString`, `JsNumber`, `JsBoolean`, `JsObject`, `JsArray`, and `JsNull`.
- **`Json` helpers**: parsing, construction (`Json.obj`, `Json.arr`), and conversion to/from strings (`Json.stringify`, `Json.prettyPrint`).
- **`JsPath`**: structured path access into JSON data, used for reading and writing.

## Building JSON
- **Parse from string**: `Json.parse` turns a JSON string into `JsValue`.
- **Construct programmatically**: use `JsObject`/`JsArray` directly or `Json.obj`/`Json.arr` for concise construction.
- **Builder pattern**: `Json.newBuilder` supports conditional fields and incremental construction.

## Writing JSON (Scala → JsValue)
- **`Json.toJson`** converts values using an implicit `Writes[T]`.
- Built-in `Writes` exist for basic types and collections.
- Custom models require implicit `Writes` for the case classes.

## Reading JSON (JsValue → Scala)
- **Simple access**:
  - `(json \ "field")` yields a `JsLookupResult`.
  - `json("field")` or `json("arr")(idx)` are direct lookups that throw on missing keys/indices.
  - Recursive lookup `json \\ "field"` collects all matches.
- **Conversion**:
  - `as[T]` throws on failure.
  - `asOpt[T]` returns `Option[T]` and drops error info.
  - `validate[T]` returns `JsResult` (`JsSuccess` or `JsError`) for structured validation errors.
- **Custom Reads**: define implicit `Reads[T]` (often via combinators) to map JSON to models.

## Practical Patterns
- Prefer `validate` when you need error details and robust parsing.
- Use `asOpt` for quick, safe access when errors aren’t needed.
- Use direct lookup only when fields are guaranteed to exist.

Source: https://www.playframework.com/documentation/3.0.x/ScalaJson
