# OAuth2 Sample

A self-contained **Spring Boot 3.4** application that demonstrates a complete **OAuth 2.0 Authorization Code** flow with **JWT access tokens**.

The app combines three Spring Security roles on a single port (`8080`):

| Spring Boot starter | Role |
|---------------------|------|
| `spring-boot-starter-oauth2-authorization-server` | Issues authorization codes and JWT access tokens |
| `spring-boot-starter-oauth2-client` | Browser login and token exchange |
| `spring-boot-starter-oauth2-resource-server` | Validates JWT Bearer tokens on REST APIs |

## Prerequisites

- Java 21+
- Maven 3.9+

## Run

```bash
mvn spring-boot:run
```

Open [http://localhost:8080](http://localhost:8080).

## Build

```bash
mvn clean package
java -jar target/oauth2-sample-1.0.0.jar
```

---

## Spring Boot OAuth2 + JWT overview

### How JWT fits in

1. The **authorization server** signs access tokens as JWTs using an RSA key pair (`AuthorizationServerConfig`).
2. Public keys are published at `GET /oauth2/jwks` for token verification.
3. The **resource server** validates incoming JWTs on `/api/**` using the same `JwtDecoder` bean.
4. Controllers receive the authenticated token via `@AuthenticationPrincipal Jwt jwt`.

### JWT configuration

| Setting | Value |
|---------|-------|
| Issuer | `http://localhost:8080` |
| Signing algorithm | RS256 (RSA 2048-bit, generated at startup) |
| JWKS endpoint | `GET /oauth2/jwks` |
| OIDC discovery | `GET /.well-known/openid-configuration` |
| Token format | JWT (`Authorization: Bearer <token>`) |

Typical JWT claims in access tokens issued by this app:

| Claim | Description |
|-------|-------------|
| `sub` | Subject (user identifier) |
| `iss` | Issuer (`http://localhost:8080`) |
| `scope` | Granted scopes (e.g. `openid profile read`) |
| `preferred_username` | Username (OIDC) |
| `exp` / `iat` | Expiry and issued-at timestamps |

### Security filter chains

Three `SecurityFilterChain` beans are configured:

| Order | Chain | Matches | Purpose |
|-------|-------|---------|---------|
| 1 | Authorization Server | `/oauth2/**`, `/.well-known/**` | Authorize, token, JWKS, OIDC |
| 2 | Resource Server | `/api/**` | JWT Bearer token validation |
| 3 | Application | everything else | Form login, OAuth2 client, UI |

Resource server JWT authorities are mapped from the `scope` claim with prefix `SCOPE_` (e.g. `SCOPE_read`).

---

## REST API reference

All API endpoints are under `/api`. Protected endpoints require a valid JWT in the `Authorization` header.

### Authentication header

```http
Authorization: Bearer <access_token>
```

Requests without a token (or with an invalid/expired token) receive **401 Unauthorized**.

### Public endpoints

#### `GET /api/public/health`

No authentication required.

```bash
curl http://localhost:8080/api/public/health
```

Example response:

```json
{
  "status": "UP",
  "timestamp": "2026-07-10T21:30:00.000000Z",
  "message": "Public endpoint — no token required"
}
```

### Protected endpoints

#### `GET /api/user`

Returns the authenticated user's JWT claims.

```bash
curl -H "Authorization: Bearer <access_token>" \
  http://localhost:8080/api/user
```

Example response:

```json
{
  "subject": "alice",
  "issuer": "http://localhost:8080",
  "scopes": "openid profile read",
  "claims": {
    "sub": "alice",
    "iss": "http://localhost:8080",
    "scope": "openid profile read",
    "preferred_username": "alice"
  },
  "message": "Protected endpoint — Bearer token validated"
}
```

#### `GET /api/hello`

Returns a greeting derived from the JWT `preferred_username` claim.

```bash
curl -H "Authorization: Bearer <access_token>" \
  http://localhost:8080/api/hello
```

Example response:

```json
{
  "greeting": "Hello, alice!",
  "flow": "authorization_code"
}
```

---

## Obtaining a JWT access token

### Option 1 — Browser flow (recommended for learning)

1. Open [http://localhost:8080](http://localhost:8080) and click **Login with OAuth2**.
2. Sign in (`alice` / `password` or `bob` / `password`).
3. Approve consent for client `demo-client`.
4. Copy the access token from the **Dashboard** page.

### Option 2 — Token endpoint (programmatic)

After completing the authorization code flow, exchange or refresh tokens directly:

#### Refresh token grant

```bash
curl -X POST http://localhost:8080/oauth2/token \
  -u demo-client:demo-secret \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token&refresh_token=<refresh_token>"
```

Example response:

```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "refresh_token": "abc123...",
  "scope": "openid profile read",
  "token_type": "Bearer",
  "expires_in": 300
}
```

#### Decode a JWT (inspect claims)

JWTs are three Base64-encoded segments separated by `.`. Decode the payload (middle segment) to inspect claims, or use [jwt.io](https://jwt.io) with the public key from `/oauth2/jwks`.

---

## OAuth2 configuration

### Registered client

| Setting | Value |
|---------|-------|
| Client ID | `demo-client` |
| Client secret | `demo-secret` |
| Grant types | `authorization_code`, `refresh_token` |
| Scopes | `openid`, `profile`, `read` |
| Redirect URI | `http://localhost:8080/login/oauth2/code/demo-client` |

### Demo users

| Username | Password | Roles |
|----------|----------|-------|
| `alice` | `password` | `USER` |
| `bob` | `password` | `USER`, `ADMIN` |

### Key endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /` | Landing page |
| `GET /flow` | Step-by-step OAuth2 flow description |
| `GET /login` | Custom login page |
| `GET /oauth2/authorization/demo-client` | Start OAuth2 login |
| `GET /dashboard` | Tokens and OIDC claims (requires login) |
| `GET /.well-known/openid-configuration` | OIDC discovery document |
| `GET /oauth2/authorize` | Authorization endpoint |
| `POST /oauth2/token` | Token endpoint |
| `GET /oauth2/jwks` | JSON Web Key Set (JWT verification) |
| `GET /userinfo` | OIDC user info (requires access token) |
| `GET /api/public/health` | Public REST API |
| `GET /api/user` | Protected REST API (JWT required) |
| `GET /api/hello` | Protected REST API (JWT required) |

---

## Architecture

```text
Browser / API client
   │
   ├─► OAuth2 Client  (/oauth2/authorization/demo-client)
   │         │
   │         ▼
   ├─► Authorization Server  (/oauth2/authorize → login → consent)
   │         │
   │         ▼
   ├─► Redirect with code  (/login/oauth2/code/demo-client)
   │         │
   │         ▼
   ├─► Token endpoint  (/oauth2/token) → JWT access + refresh tokens
   │         │
   │         ▼
   └─► Resource Server  (/api/* with Authorization: Bearer <JWT>)
              │
              ▼
         JwtDecoder validates signature via /oauth2/jwks
              │
              ▼
         @AuthenticationPrincipal Jwt injected into controller
```

---

## Project structure

```text
src/main/java/com/example/oauth2/
├── OAuth2SampleApplication.java
├── config/
│   ├── AuthorizationServerConfig.java   # JWT signing, registered client, auth server
│   ├── OAuth2ClientConfig.java          # OAuth2 client registration
│   └── SecurityConfig.java              # Resource server JWT validation, login
└── web/
    ├── ApiController.java               # REST API (/api/**)
    └── HomeController.java              # UI pages
```

## Related Spring Security documentation

- [OAuth 2.0 Authorization Server](https://docs.spring.io/spring-authorization-server/reference/overview.html)
- [OAuth 2.0 Resource Server JWT](https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html)
- [OAuth 2.0 Login](https://docs.spring.io/spring-security/reference/servlet/oauth2/login/index.html)
