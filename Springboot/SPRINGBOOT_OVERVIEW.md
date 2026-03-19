# How Spring Boot Works

Spring Boot is an opinionated framework built on top of the Spring ecosystem that aims to simplify the setup, configuration, and development of Spring applications. It provides sensible defaults, auto-configuration, and production-ready capabilities so developers can focus more on business logic and less on boilerplate.

---

## 1) The Core Idea: Convention over Configuration

Spring Boot follows the principle of *convention over configuration*. It provides a set of pre-configured defaults for the most common use cases (like web apps and data access), so you can stand up a working application quickly.

### Key concepts
- **Auto-configuration**: Spring Boot detects what libraries are on the classpath (e.g., Spring MVC, Spring Data JPA, Thymeleaf) and automatically configures beans to get you started without manual setup.
- **Starters**: Opinionated dependency descriptors (e.g., `spring-boot-starter-web`, `spring-boot-starter-data-jpa`) that bundle common libraries together so you don’t need to pick individual dependencies.
- **Embedded server**: Spring Boot packages an embedded servlet container (Tomcat, Jetty, or Undertow) by default so your application can run as a standalone JAR.

---

## 2) How a Spring Boot App Starts

A typical Spring Boot app has a main class annotated with `@SpringBootApplication`:

```java
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

### What `@SpringBootApplication` does
- `@Configuration`: Marks the class as a source of bean definitions
- `@EnableAutoConfiguration`: Enables Spring Boot’s auto-configuration mechanism
- `@ComponentScan`: Scans the package and subpackages for components, services, controllers, etc.

### SpringApplication
When `SpringApplication.run(...)` executes, Spring Boot:
1. Creates an `ApplicationContext` (usually `AnnotationConfigApplicationContext` or `AnnotationConfigServletWebServerApplicationContext`).
2. Loads configuration from the main class and any imported configurations.
3. Performs auto-configuration based on the classpath and beans already defined.
4. Starts an embedded web server (if a web application), and registers servlet components.

---

## 3) Auto-Configuration (Magic + Override)

Auto-configuration is powered by `spring.factories` entries in Spring Boot JARs (or the newer `spring.autoconfigure` indexing). Spring Boot loads a list of `@Configuration` classes and applies them if certain conditions are met.

### Conditional annotations
Spring Boot auto-configurations are typically guarded by conditional annotations such as:
- `@ConditionalOnClass` (only if a class is on the classpath)
- `@ConditionalOnMissingBean` (only if a bean is not already defined)
- `@ConditionalOnProperty` (only if a property has a specific value)

This allows you to override defaults simply by defining a bean in your own configuration or setting a property.

---

## 4) Configuration Properties and Profiles

### `application.properties` / `application.yml`
Spring Boot reads configuration from `src/main/resources/application.properties` or `application.yml` by default. These files are used to configure the application (server port, datasource settings, logging level, etc.).

Example:

```properties
server.port=8081
spring.datasource.url=jdbc:h2:mem:testdb
spring.jpa.hibernate.ddl-auto=update
```

### Profiles
You can activate profiles with `spring.profiles.active` (e.g., `application-dev.properties` or `application-prod.properties`). Profiles let you define environment-specific configuration.

---

## 5) Building and Running

### Maven / Gradle
Spring Boot provides plugins for Maven and Gradle to package the application as an executable JAR.

- Maven: `mvn spring-boot:run` or `mvn package` (then run `java -jar target/app.jar`)
- Gradle: `./gradlew bootRun` or `./gradlew bootJar`

### Executable JAR
The resulting JAR is “fat”/“uber” and bundles dependencies along with your code. It includes an embedded server and can be started with:

```bash
java -jar myapp.jar
```

---

## 6) Common Spring Boot Features

### Web
- `@RestController` / `@Controller` for request handling
- `@RequestMapping` / `@GetMapping`, etc.
- Embedded Tomcat/Jetty/Undertow

### Data
- `spring-boot-starter-data-jpa` for Spring Data JPA
- Automatic datasource configuration (HikariCP, Hibernate, etc.)

### Actuator
Spring Boot Actuator exposes production-ready endpoints (health, metrics, info) at `/actuator/*`. It’s enabled by adding `spring-boot-starter-actuator`.

### Security
`spring-boot-starter-security` provides sensible defaults (e.g., basic auth) and can be customized via configuration or security configuration classes.

---

## 7) Extending and Customizing Behavior

Spring Boot is designed to let you customize behavior by:
- Defining beans to override auto-configured ones
- Using `@Configuration` classes
- Implementing `ApplicationRunner` / `CommandLineRunner` to run code after startup
- Disabling auto-configurations via `@EnableAutoConfiguration(exclude = ...)` or `spring.autoconfigure.exclude`

---

## 8) Typical Lifecycle

1. Start JVM
2. `SpringApplication.run(...)`
3. Create and refresh `ApplicationContext`
4. Perform auto-configuration and bean wiring
5. Start embedded server (if web app)
6. Application is ready to serve requests

---

## 9) Why Use Spring Boot?

- Fast project setup with minimal boilerplate
- Wide ecosystem (data, security, messaging, cloud, etc.)
- Production-ready features out of the box (health checks, metrics, logging, config management)
- Easy to deploy (single executable JAR)

---

## Further Reading
- [Spring Boot Reference Documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/)
- [Spring Guides (Getting Started)](https://spring.io/guides)
