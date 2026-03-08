## Scala Play Interview Questions

1. How would you design a custom Action builder to enforce authorization and logging across controllers?
2. When would you use a typed `ActionBuilder`, and how do you implement a custom body parser for JSON payloads?
3. How do Play filters differ from Action composition, and how do you control filter ordering with DI?
4. What steps do you take to keep Play applications non-blocking when using Futures and custom thread pools?
5. How would you implement a streaming response with Akka Streams, and when would you choose SSE vs chunked responses?
6. How do you structure WebSocket flows to handle backpressure and integrate with actors or streams?
7. What are the key HikariCP settings you tune for Slick, and how do they affect throughput and latency?
8. How do Play evolutions work, and what strategies do you use to avoid risky migrations in production?
9. What are the benefits and pitfalls of a multi-module Play build, and how do you share configuration safely?
10. How do you define Guice modules and manage component lifecycle hooks in Play?
11. When would you prefer compile-time DI with MacWire, and how do you wire components without Guice?
12. How do you layer configuration in Play and map config to type-safe case classes?
13. How do you implement custom error handlers for both HTML and JSON responses?
14. How do you handle content negotiation and build custom renderers for JSON, XML, or CSV?
15. What security steps do you take in Play for CSRF, CORS, session/cookie hardening, and HTTPS?
16. How do you structure Play tests with ScalaTest/Specs2, including fake apps and database fixtures?
17. How do you implement i18n in Play, and how is locale selected per request?
18. How do you create custom parameter binders and use reverse routing effectively?
19. What caching strategies work well in Play, and how do you combine Cache API usage with HTTP cache headers?
20. What is your approach to structured logging, metrics, and tracing in a Play application?

## Json Conversion Options in Play

Play provides several JSON conversion styles, each with different tradeoffs:

- Play JSON `Reads`/`Writes`/`Format` using combinators in `play.api.libs.json`: explicit, type-safe, and great for field-level control, validation, and transformations.
- Play JSON macro helpers (`Json.reads`, `Json.writes`, `Json.format`): concise derivation for case classes with standard field mapping; best when you want minimal boilerplate.
- Custom `Reads`/`Writes` for non-standard shapes: handle polymorphism, custom field names, discriminators, or partial reads with `Reads` that can reject input gracefully.
- `OWrites` for write-only views: useful for hiding sensitive fields, writing subsets, or building API-specific projections.
- `JsPath` reads/writes: direct path-based extraction and construction for deeply nested JSON without manual parsing.
- `Json.toJson`/`validate`: for conversion and validation; keep `validate` in controllers/services to return precise `JsError` messages.

Common decision points:

- Prefer macros for simple DTOs and stable schemas.
- Use combinators or custom `Reads`/`Writes` for validations, data migration, or renaming fields.
- Use separate read/write models when API input and output shapes diverge.
