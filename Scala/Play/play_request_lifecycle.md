# How Play Processes an Incoming Request

This is a concise walkthrough of the typical request lifecycle in a Play app
using Scala (Play 2/3 style). It focuses on the common flow rather than every
advanced hook.

## High-Level Flow

1. **HTTP request arrives** at the Play server.
2. **Request is parsed** by a body parser into a `Request[A]`.
3. **Routing selects an action** based on the request method and path.
4. **Filters and action composition run** (auth, logging, etc).
5. **Controller action executes** to build a `Result`.
6. **Result is rendered** (headers, status, body) and sent back.

## Details by Stage

### 1) Server and Request Parsing
- Play receives the request and runs it through the configured **body parser**
  for the matched action (for example, JSON, form data, or raw bytes).
- The parser produces a typed request: `Request[A]`, where `A` is the parsed body.

### 2) Routing
- The **routes file** defines a mapping of HTTP method + path to a controller
  method.
- Routing creates an **Action** (often `Action.async` in Scala) and passes the
  request to it.

### 3) Filters and Action Composition
- **Filters** (e.g., logging, security headers) run around the action.
- **Action composition** can add authentication/authorization, request
  enrichment, or validation before the controller code runs.

### 4) Controller Logic
- The controller action:
  - reads the parsed body from `Request[A]`
  - performs domain logic (DB, services, etc)
  - returns a `Result`, often asynchronously (`Future[Result]`)

### 5) Result Rendering
- A `Result` contains status, headers, and body (string, JSON, bytes, or stream).
- Play serializes the body, sets headers, and writes the response to the client.

## Typical Scala 2 Action Shape

```scala
def getUser(id: Long) = Action.async { request =>
  userService.find(id).map {
    case Some(user) => Ok(Json.toJson(user))
    case None       => NotFound
  }
}
```

## Common Extension Points
- **Filters** for cross-cutting concerns (logging, tracing, security headers).
- **Action composition** for auth, validation, rate limiting.
- **Error handlers** for custom 4xx/5xx responses.
- **Body parsers** for custom request parsing (streaming, size limits).
