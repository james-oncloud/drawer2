# How Spring Boot Security Works

Spring Boot Security is built on top of **Spring Security**, a powerful and highly customizable framework for securing Java applications. Spring Boot makes it easy to get started with sensible defaults, while still allowing fine-grained control over authentication, authorization, and protection mechanisms.

## Key Concepts Review

- **Authentication** answers "who are you?" by verifying credentials or tokens.
- **Authorization** answers "what are you allowed to do?" by applying URL or method-level rules.
- **`SecurityFilterChain`** is the central place where HTTP security behavior is defined.
- **`UserDetailsService`** loads users, while a **`PasswordEncoder`** safely handles password hashing.
- **Stateful browser apps** and **stateless APIs** usually need different security settings, especially for sessions and CSRF.
- **Secure-by-default behavior** is intentional: Boot locks things down first, then you explicitly open what should be public.

---

## 1) Getting Started: The Starter

The simplest way to add security is by depending on:

- `spring-boot-starter-security`

This brings in Spring Security and an auto-configuration module that applies default security settings.

### Default behavior
When `spring-boot-starter-security` is on the classpath, Spring Boot:
- Secures all HTTP endpoints by default (requires authentication for every request)
- Enables form login with a default login page
- Creates an in-memory user with a generated password (printed to the console at startup)
- Uses an in-memory `UserDetailsService` unless you provide your own

These defaults are useful for quickly securing a new app, but most real applications replace them with custom users, password encoding, and authorization rules.

---

## 2) Authentication (Who are you?)

### Built-in authentication options
Spring Security supports many authentication mechanisms out of the box:
- **Form login** (default with Spring Boot)
- **HTTP Basic** (useful for APIs)
- **JWT / OAuth2 / OIDC** (via Spring Security OAuth or the spring-boot-starter-oauth2-resource-server / spring-boot-starter-oauth2-client starters)
- **LDAP**, **JDBC**, **Active Directory**, **Kerberos**, etc.

### Customizing users
You can define users in configuration, or by providing beans:

#### 1) `application.properties` (simple demo)
```properties
spring.security.user.name=admin
spring.security.user.password=secret
spring.security.user.roles=USER,ADMIN
```

#### 2) Programmatic user details
```java
@Bean
public UserDetailsService users() {
    UserDetails user = User.withDefaultPasswordEncoder()
        .username("user")
        .password("password")
        .roles("USER")
        .build();
    return new InMemoryUserDetailsManager(user);
}
```

> ⚠️ `withDefaultPasswordEncoder()` is only for demos. Use a `PasswordEncoder` like `BCryptPasswordEncoder` in real applications.

Recommended password encoder bean:

```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

---

## 3) Authorization (What can you do?)

Authorization decisions can be made via:
- **URL-based rules** (HTTP security config)
- **Method security** (`@PreAuthorize`, `@Secured`, `@RolesAllowed`)

### URL-based configuration (recommended for web apps)
With Spring Security 5.7+ (Spring Boot 2.7+), the preferred way is to expose a `SecurityFilterChain` bean:

```java
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/public/**").permitAll()
            .requestMatchers("/admin/**").hasRole("ADMIN")
            .anyRequest().authenticated()
        )
        .formLogin(Customizer.withDefaults())
        .httpBasic(Customizer.withDefaults());
    return http.build();
}
```

Matcher order matters. Spring Security evaluates these rules in order, so more specific matchers should usually come before broader ones like `anyRequest()`.

### Method security
Enable method security with:
```java
@EnableMethodSecurity
@Configuration
public class MethodSecurityConfig {}
```

Then secure service methods:
```java
@PreAuthorize("hasRole('ADMIN')")
public void adminOnlyAction() { ... }
```

Method security is especially useful when authorization should follow business rules rather than only URL patterns.

---

## 4) Auto-configuration and Customization

Spring Boot auto-configures a `SecurityFilterChain` and a `UserDetailsService` if you don’t provide your own beans.

### Override behavior
To override defaults, define your own beans:
- `SecurityFilterChain` (preferred)
- `UserDetailsService` (controls where users are loaded from)
- `AuthenticationProvider` (custom authentication logic)

You can also disable auto-configuration:
```properties
spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration
```

Disabling security auto-configuration entirely is rarely the best first step. In most applications, it is safer to keep security enabled and customize the rules instead.

---

## 5) Common Configuration Properties

Spring Boot exposes properties in `application.properties` / `application.yml`:

- `spring.security.user.*` (default user credentials)
- `server.servlet.session.timeout` (session management)
- `spring.security.oauth2.client.*` (OAuth2 client)
- `spring.security.oauth2.resourceserver.*` (JWT/OAuth2 resource server)

Example enabling HTTP Basic and disabling CSRF for APIs:
```properties
spring.security.user.name=apiuser
spring.security.user.password=apipass
```

---

## 6) CSRF, CORS, and Sessions

### CSRF
By default, CSRF protection is enabled for stateful (browser) sessions. If you’re building a stateless API, you typically disable it:

```java
http.csrf(csrf -> csrf.disable());
```

### CORS
Configure CORS either via `CorsConfigurationSource` bean or via `HttpSecurity.cors()`.

### Session management
Control session behavior with:
```java
http.sessionManagement(session -> session
    .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
);
```

### 401 vs 403
- `401 Unauthorized` usually means the request is not authenticated.
- `403 Forbidden` means the user is authenticated but does not have permission.

Understanding that distinction helps when debugging login problems versus access-control problems.

---

## 7) Actuator and Security

When using Spring Boot Actuator, secure endpoints are enabled by default. Common settings:
```properties
management.endpoints.web.exposure.include=health,info
management.endpoint.health.show-details=when-authorized
```

You can also customize actuator security via `management.server.port` or by adding dedicated security rules for `/actuator/**`.

---

## 8) Common Extensions

### OAuth2 / OIDC (Client + Resource Server)
- `spring-boot-starter-oauth2-client` for authenticating users via OAuth2/OIDC providers.
- `spring-boot-starter-oauth2-resource-server` for protecting APIs using JWT.

### JWT / Token-based auth
Use `NimbusJwtDecoder` and configure a `JwtAuthenticationConverter` to map claims to roles.

### LDAP / JDBC
- `spring-boot-starter-data-ldap` for LDAP authentication
- `spring-boot-starter-data-jpa` + `JdbcUserDetailsManager` for JDBC-backed users

---

## 9) Typical Lifecycle (Request Flow)

1. Request hits `SecurityFilterChain`.
2. Filters (e.g., `UsernamePasswordAuthenticationFilter`, `BearerTokenAuthenticationFilter`) authenticate the request.
3. If authentication succeeds, a `SecurityContext` is populated.
4. Authorization rules are evaluated (URL/method access).
5. The request is allowed or rejected (redirect / 401 / 403).

For stateless APIs, authentication is typically reconstructed on every request from a bearer token instead of being loaded from an HTTP session.

---

## 10) Testing Security

- Use `spring-security-test` for test support such as `@WithMockUser`
- Use `MockMvc` for servlet applications and `WebTestClient` for reactive ones
- Test both success cases and failure cases such as unauthenticated and forbidden requests

Example:

```java
@Test
@WithMockUser(roles = "ADMIN")
void adminEndpointIsAccessibleToAdmins() {
    // test code here
}
```

---

## 11) Why Use Spring Boot Security?

- **Secure defaults**: Everything is locked down by default, which is safe for new apps.
- **Auto-configuration**: Minimal boilerplate while still allowing fine-grained control.
- **Ecosystem**: Supports OAuth2, JWT, SAML, LDAP, and many other standards.
- **Extensible**: Customize filters, authentication providers, and error handling.

---

## Further Reading
- [Spring Security Reference](https://docs.spring.io/spring-security/reference/index.html)
- [Spring Boot Security Auto-configuration](https://docs.spring.io/spring-boot/docs/current/reference/htmlsingle/#security)
- [Spring Guides: Securing a Web Application](https://spring.io/guides/gs/securing-web/)
