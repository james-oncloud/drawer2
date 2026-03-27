# How Spring Boot Configuration Works

Spring Boot provides a flexible configuration system that makes it easy to manage values for your application across environments. It supports multiple configuration sources (properties files, YAML, environment variables, command-line args, etc.) and binds values to Java objects using a consistent and type-safe model.

## Key Concepts Review

- **Externalized configuration** means config lives outside your code so one application build can run in dev, test, and prod.
- **Property source precedence** determines which value wins when the same property is defined in multiple places.
- **Profiles** let you activate environment-specific config and beans.
- **Relaxed binding** lets keys like `app.timeout`, `APP_TIMEOUT`, and `app-timeout` bind to the same field.
- **`@ConfigurationProperties`** is the preferred way to bind related settings into a typed object.
- **Runtime overrides** from environment variables, JVM flags, or command-line args are central to how Boot apps are deployed.

---

## 1) Configuration Sources (Property Sources)

Spring Boot reads configuration from many sources, in a well-defined order. Later sources override earlier ones.

### Default property sources (highest → lowest precedence)
1. **Command line arguments** (`--server.port=8081`)
2. **Java System properties** (`-Dserver.port=8081`)
3. **Environment variables** (`SERVER_PORT=8081`)
4. **`RandomValuePropertySource`** (`random.*`)
5. **`application.properties` / `application.yml`** in:
   - `config/` subdirectory of the current directory
   - current directory
   - `classpath:/config/`
   - `classpath:/`
6. **Profile-specific properties** (e.g., `application-dev.properties`) when the profile is active
7. **`@PropertySource`** annotations on configuration classes
8. **Default properties** (set programmatically via `SpringApplication.setDefaultProperties`)

### External configuration locations
- `spring.config.location` or `spring.config.additional-location` can point to files or directories outside the classpath.
- `spring.config.import` supports importing additional config data via locations, config server URLs, and profiles.

The practical pattern is to keep safe defaults in your project, then override environment-specific values during deployment.

---

## 2) Profiles and Property Files

Spring Boot supports **profiles** to load environment-specific values.

- Activate a profile with `spring.profiles.active=dev` (properties, env vars, command line, etc.).
- Use profile-specific files like:
  - `application-dev.properties` / `application-dev.yml`
  - `application-dev.yaml`
- Use `spring.profiles.include` to include other profiles.

Profiles can be activated programmatically with `SpringApplication.setAdditionalProfiles(...)`.

Profiles can also control bean registration, not just property files. That is useful when dev and prod should use different implementations.

---

## 3) Configuration Properties Binding (Type-safe config)

### `@ConfigurationProperties`

Use these to bind groups of properties into POJOs.

```java
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    private String name;
    private int timeout;
    // getters/setters
}
```

Enable scanning with:

```java
@EnableConfigurationProperties(AppProperties.class)
```

or register it as a bean:

```java
@Bean
@ConfigurationProperties(prefix = "app")
public AppProperties appProperties() {
    return new AppProperties();
}
```

### `@Value`

Inject individual property values:

```java
@Value("${app.name:MyApp}")
private String appName;
```

### `Environment`

Access properties programmatically:

```java
@Autowired
private Environment env;

String port = env.getProperty("server.port");
```

### When to prefer each option
- Use `@ConfigurationProperties` for grouped, reusable, validated configuration.
- Use `@Value` for one-off values.
- Use `Environment` when property names are dynamic or you need lower-level access.

For most application code, `@ConfigurationProperties` is the cleanest long-term option.

### Validation
You can validate bound properties so the application fails fast when required configuration is missing or invalid.

```java
@Validated
@ConfigurationProperties(prefix = "app")
public class AppProperties {
    @NotBlank
    private String name;

    @Min(1)
    private int timeout;
}
```

---

## 4) Configuration Methods & Options

### 4.1 Configuration files
- `application.properties`
- `application.yml` / `application.yaml`
- Profile-specific variants: `application-{profile}.properties`, `application-{profile}.yml`

### 4.2 System properties
- Passed via `-Dkey=value` on the JVM command line.

### 4.3 Environment variables
- Environment names are mapped to relaxed binding (e.g., `SPRING_DATASOURCE_URL` → `spring.datasource.url`).

### 4.4 Command-line arguments
- Values passed as `--key=value` get highest precedence.

### 4.5 Externalized config locations
- `spring.config.location`: explicit path(s) to config files.
- `spring.config.additional-location`: add extra config locations.
- `spring.config.import`: import additional config data (files, config server, vault, etc.).

### 4.6 Programmatic configuration
- `SpringApplication.setDefaultProperties(Map<String, Object>)`
- `SpringApplicationBuilder.properties(...)`
- `ConfigurableEnvironment.getPropertySources().addFirst(...)`

### 4.7 `@PropertySource`
- Adds property files to the environment (not YAML by default without extra support).

### 4.8 `@ImportResource`
- Load legacy Spring XML configuration.

### 4.9 Profile-specific beans
- Use `@Profile("dev")` on `@Configuration` or `@Bean` to activate beans only when a profile is active.

### 4.10 `SPRING_APPLICATION_JSON`
- Provide config as a JSON block through an environment variable, which is useful on platforms where managing many individual variables is awkward.

---

## 5) Relaxed Binding Rules

Spring Boot supports relaxed binding between property names and fields:

- `my.property-name`, `my.propertyName`, `MY_PROPERTY_NAME`, `my_property_name` are equivalent
- Dots (`.`), dashes (`-`), and underscores (`_`) are treated similarly

This makes it easy to map environment variables and config file keys to Java fields.

---

## 6) Config Data and File Organization

Spring Boot's config data model works best when configuration is layered:

- Base defaults in `application.yml`
- Environment-specific overrides in `application-dev.yml` or `application-prod.yml`
- Deployment-time overrides from environment variables or command-line arguments

For larger applications, group related properties under clear prefixes such as `app.mail`, `app.security`, or `app.clients.orders`.

---

## 7) Common Configuration Patterns

### Externalize sensitive values
- Use environment variables or a secrets manager (Vault, AWS Secrets Manager) rather than committing secrets in `application.properties`.

### Profiles for environments
- `application-dev.yml`, `application-prod.yml`, `application-test.yml`
- Keep sensitive or environment-specific config out of the default file.

### Config data import
- Use `spring.config.import=optional:configserver:http://localhost:8888` for Spring Cloud Config.

---

## 8) Runtime Overrides

You can override any property at runtime using any of the high-precedence sources:
- Command-line args (`--server.port=9090`)
- Environment vars (`SERVER_PORT=9090`)
- JVM system properties (`-Dserver.port=9090`)

This deployment-friendly override model is a big reason Spring Boot fits well with Docker, Kubernetes, CI/CD pipelines, and cloud platforms.

---

## 9) Useful Tools

### `spring-boot:run` (Maven) / `bootRun` (Gradle)
- Automatically picks up changes to `application.properties` and reloads resources.

### `spring-boot-actuator` + `/actuator/env`
- Inspect the active environment and property sources at runtime.

Be careful exposing `/actuator/env` beyond trusted environments because it may reveal sensitive values.

---

## 10) Why Spring Boot’s Config System Works Well

- **Flexible**: Supports many sources and overrides
- **Type-safe**: `@ConfigurationProperties` encourages strong typing
- **Convention-based**: Defaults work out of the box with minimal setup
- **Profile-aware**: Easy to target multiple environments
- **Easy to override**: Highest precedence sources make runtime tweaks simple

---

## 11) Common Mistakes to Avoid

- Storing secrets directly in version-controlled property files
- Overusing `@Value` instead of grouping related settings
- Activating multiple profiles without understanding which values override others
- Forgetting validation on required configuration
- Relying on local defaults that are never documented for deployment

---

## Further Reading
- [Spring Boot Externalized Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config)
- [Spring Boot Configuration Properties](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.typesafe-configuration-properties)
- [Spring Boot Property Binding](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config.bind)