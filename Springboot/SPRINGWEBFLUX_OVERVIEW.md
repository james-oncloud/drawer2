# How Spring WebFlux Works (Reactive)

Spring WebFlux is the reactive web framework in Spring Framework (since 5.x) designed for building non-blocking, event-driven web applications. It supports reactive streams (Project Reactor) and enables high concurrency with fewer threads by using asynchronous I/O.

This document explains the core concepts of WebFlux and the main WebFlux API components.

## Key Concepts Review

- **Reactive programming** models work as asynchronous streams instead of blocking, step-by-step calls.
- **`Mono`** represents zero or one item, while **`Flux`** represents many items over time.
- **Non-blocking I/O** allows threads to be reused instead of waiting idle for network or database calls.
- **Backpressure** helps consumers control how quickly producers send data.
- **WebFlux is most valuable when the whole request flow is non-blocking**, including HTTP clients and data access.
- **Reactive code should avoid blocking calls** like `Thread.sleep()` or traditional blocking JDBC inside request pipelines.

---

## 1) Core Reactive Concepts

### Reactive Streams
Spring WebFlux is built on the Reactive Streams specification, which defines:
- `Publisher<T>`: produces data asynchronously
- `Subscriber<T>`: consumes data
- `Subscription`: controls data flow (backpressure)

Spring WebFlux uses Reactor types:
- `Mono<T>`: 0..1 result
- `Flux<T>`: 0..N results

### Non-blocking I/O
WebFlux uses non-blocking servers (Netty, Undertow, or the non-blocking servlet runtime) to handle requests without tying up worker threads while waiting for I/O.

### Backpressure
Backpressure allows consumers to request data at a pace they can handle, preventing overload.

Reactive systems are not just about speed. They are mainly about scalability, efficient resource usage, and composing asynchronous workflows cleanly.

---

## 2) WebFlux Application Model

WebFlux supports two programming models:

### 2.1 Annotated Controllers (Spring MVC style)

```java
@RestController
@RequestMapping("/api")
public class PersonController {

    private final PersonService service;

    public PersonController(PersonService service) {
        this.service = service;
    }

    @GetMapping("/people")
    public Flux<Person> list() {
        return service.findAll();
    }

    @GetMapping("/people/{id}")
    public Mono<ResponseEntity<Person>> get(@PathVariable String id) {
        return service.findById(id)
            .map(ResponseEntity::ok)
            .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}
```

### 2.2 Functional Endpoints (Router + Handler)

This model defines routes and handlers as functions.

```java
@Bean
public RouterFunction<ServerResponse> routes(PersonHandler handler) {
    return RouterFunctions.route()
        .GET("/people", handler::list)
        .GET("/people/{id}", handler::get)
        .POST("/people", handler::create)
        .build();
}
```

Both models are fully supported. Teams often choose annotated controllers for familiarity and functional routing for lightweight, explicit APIs.

Handler example:

```java
@Component
public class PersonHandler {
    private final PersonService service;

    public PersonHandler(PersonService service) {
        this.service = service;
    }

    public Mono<ServerResponse> list(ServerRequest req) {
        return ServerResponse.ok().body(service.findAll(), Person.class);
    }

    public Mono<ServerResponse> get(ServerRequest req) {
        String id = req.pathVariable("id");
        return service.findById(id)
            .flatMap(person -> ServerResponse.ok().bodyValue(person))
            .switchIfEmpty(ServerResponse.notFound().build());
    }
}
```

---

## 3) WebFlux Runtime & Server Options

### Server runtimes
WebFlux can run on:
- **Reactor Netty** (default)
- **Undertow (reactive mode)**
- **Tomcat / Jetty (servlet 3.1+ non-blocking I/O)**

### Dispatcher types
- `DispatcherHandler`: core WebFlux dispatcher (similar to `DispatcherServlet` in MVC)
- `WebHandler`: functional interface that handles `ServerWebExchange`

---

## 4) Core WebFlux API

### Server-side API
- `ServerRequest` / `ServerResponse`: functional endpoint request/response types
- `WebFilter`: reactive analogue of servlet filter (can modify exchange, perform auth, etc.)
- `WebExceptionHandler`: handle exceptions in the reactive chain
- `HandlerMapping` / `HandlerAdapter`: resolve handlers and adapt them for dispatch
- `RouterFunction<T>` / `RouterFunctions`: functional routing API
- `HandlerFunction<T>`: functions that handle requests and return responses

### Client-side API (WebClient)
- `WebClient`: reactive HTTP client

Example:

```java
WebClient client = WebClient.create("https://api.example.com");

Mono<Person> person = client.get()
    .uri("/people/{id}", id)
    .retrieve()
    .bodyToMono(Person.class);
```

`WebClient` is the preferred replacement for `RestTemplate` in reactive applications because it supports non-blocking request execution and reactive composition.

### Reactive Data Access
While not part of WebFlux, it integrates with reactive data libraries:
- `spring-data-r2dbc` (Reactive Relational DB)
- `spring-data-mongodb` (Reactive MongoDB)
- `spring-data-redis` (Reactive Redis)

If your controller is reactive but it calls blocking libraries underneath, you lose many of the benefits of WebFlux. End-to-end non-blocking design matters.

---

## 5) Request Handling Flow (WebFlux)

1. **HTTP request** arrives at the server (Netty/Undertow/Servlet)
2. **DispatcherHandler** receives `ServerWebExchange`
3. **HandlerMapping** selects a handler (controller method or functional handler)
4. Handler returns `Mono`/`Flux` (reactive pipeline)
5. Response writing is deferred until the reactive stream completes

Handlers should usually return the reactive type directly. In most cases, you should not manually call `subscribe()` inside controller or handler code.

---

## 6) Functional vs Annotation-based Endpoints

### Annotation-based pros
- Familiar MVC-style programming
- Rich support for request/response mapping, validation, exception handlers

### Functional pros
- Lightweight and explicit routing
- Easier to compose in pure functional style
- Ideal for microservices with simple routing needs

The choice is usually about team style and maintainability, not performance. Both models use the same reactive runtime underneath.

---

## 7) Error Handling and Validation

### Error handling
- Use `@ControllerAdvice` / `@ExceptionHandler` with reactive return types
- Use `ErrorWebExceptionHandler` for global handling in WebFlux

### Validation
- Use `@Valid` / `@Validated` with `@RequestBody` in controllers
- Use `WebExchangeBindException` for binding errors

---

## 8) Blocking Work and Schedulers

Blocking work still exists in many real systems, such as legacy drivers or file APIs. If blocking cannot be avoided, isolate it carefully instead of running it on the event-loop threads.

Typical Reactor pattern:

```java
Mono.fromCallable(() -> blockingService.loadData())
    .subscribeOn(Schedulers.boundedElastic());
```

This is a fallback, not the main goal. Prefer true reactive libraries when possible.

---

## 9) Testing WebFlux

- `WebTestClient` is the reactive test client for WebFlux

Example:

```java
@WebFluxTest(PersonController.class)
class PersonControllerTest {
    @Autowired
    private WebTestClient webClient;

    @Test
    void list() {
        webClient.get().uri("/people")
            .exchange()
            .expectStatus().isOk()
            .expectBodyList(Person.class);
    }
}
```

For lower-level reactive stream testing, Reactor also provides `StepVerifier`, which is useful for testing `Mono` and `Flux` behavior directly.

---

## 10) Key WebFlux Components (Quick Reference)

- `org.springframework.web.reactive.function.server.RouterFunction`
- `org.springframework.web.reactive.function.server.ServerRequest`
- `org.springframework.web.reactive.function.server.ServerResponse`
- `org.springframework.web.reactive.function.client.WebClient`
- `org.springframework.web.server.WebFilter`
- `org.springframework.web.server.ServerWebExchange`
- `org.springframework.web.server.WebExceptionHandler`
- `org.springframework.web.reactive.DispatcherHandler`

---

## 11) When WebFlux Is a Good Fit

- High-concurrency APIs with lots of network I/O
- Streaming endpoints such as server-sent events
- Systems already using reactive databases, messaging, or clients
- Applications where efficient thread usage matters more than simple imperative code

WebFlux is not automatically better for every application. For simple CRUD apps with blocking libraries, Spring MVC is often the simpler choice.

---

## 12) Why Use WebFlux?

- **Scale with fewer threads**: non-blocking I/O allows high concurrency
- **Reactive data flow**: compose async operations with `Mono`/`Flux`
- **Unified API**: same programming model for server and client
- **Modern stack**: fits microservices, event-driven systems, streaming APIs

---

## Further Reading
- [Spring WebFlux Reference Documentation](https://docs.spring.io/spring-framework/docs/current/reference/html/web-reactive.html)
- [Spring WebFlux Sample Projects](https://github.com/spring-projects/spring-framework/tree/main/spring-webflux)
- [Project Reactor Reference](https://projectreactor.io/docs)