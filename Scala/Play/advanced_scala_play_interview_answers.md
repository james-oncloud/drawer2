## Scala Play Interview Answers (with Code)

1. Custom Action builder for auth + logging
   - Build a custom `ActionBuilder` that wraps `invokeBlock`, checks auth, and logs request metadata.
\n```scala
class AuthenticatedAction @Inject()(
    parser: BodyParsers.Default,
    auth: AuthService
)(implicit ec: ExecutionContext)
    extends ActionBuilder[UserRequest, AnyContent] {

  override def parser: BodyParser[AnyContent] = parser
  override protected def executionContext: ExecutionContext = ec

  override def invokeBlock[A](
      request: Request[A],
      block: UserRequest[A] => Future[Result]
  ): Future[Result] = {
    auth.authenticate(request).flatMap {
      case Some(user) =>
        Logger.logger.info(s"User=${user.id} path=${request.path}")
        block(UserRequest(user, request))
      case None =>
        Future.successful(Results.Unauthorized("Unauthorized"))
    }
  }
}
```

2. Typed `ActionBuilder` + custom JSON body parser
   - Use when you want a typed request (e.g., `Request[MyDto]`) and custom parsing/validation.
\n```scala
case class CreateUser(name: String)
implicit val createUserReads: Reads[CreateUser] = Json.reads[CreateUser]

class JsonAction @Inject()(parser: BodyParsers.Default)(implicit ec: ExecutionContext)
    extends ActionBuilder[Request, AnyContent] {
  override def parser = parser
  override protected def executionContext = ec

  def json[A: Reads]: ActionBuilder[Request, JsValue] =
    new ActionBuilder[Request, JsValue] {
      override def parser = parse.json
      override protected def executionContext = ec
    }
}

def createUser = jsonAction.json[CreateUser].async { req =>
  val dto = req.body.as[CreateUser]
  Future.successful(Ok(Json.obj("created" -> dto.name)))
}
```

3. Filters vs Action composition
   - Filters apply globally (or by route) and run before/after actions. Action composition is per-controller/action.
   - Filter ordering is controlled by module bindings or `play.http.filters`.
\n```scala
class Filters @Inject()(cors: CORSFilter, csrf: CSRFFilter)
    extends HttpFilters {
  override def filters = Seq(cors, csrf)
}
```

4. Non-blocking Futures and thread pools
   - Keep blocking IO off the default dispatcher; use a dedicated execution context.
\n```scala
@Singleton
class ReportService @Inject()(db: Database, @Named("db-ec") dbEc: ExecutionContext) {
  def buildReport(): Future[Report] =
    Future(blocking(db.loadLargeReport()))(dbEc)
}
```

5. Streaming responses with Akka Streams
   - Use chunked/SSE for event streams; chunked for large file output.
\n```scala
def streamNumbers = Action {
  val source = Source(1 to 1000).map(n => ByteString(s"$n\n"))
  Ok.chunked(source).as(ContentTypes.TEXT)
}

def sseStream = Action {
  val source = Source.tick(1.second, 1.second, "ping")
    .map(data => ServerSentEvent(data))
  Ok.chunked(source).as(ContentTypes.EVENT_STREAM)
}
```

6. WebSockets with backpressure
   - Use a `Flow[Message, Message, _]` and apply buffering with a strategy.
\n```scala
def socket = WebSocket.accept[String, String] { _ =>
  Flow[String]
    .buffer(64, OverflowStrategy.dropHead)
    .map(msg => s"echo: $msg")
}
```

7. HikariCP tuning for Slick
   - Tune pool size, connection timeout, and leak detection based on workload.
\n```hocon
slick.dbs.default.db {
  numThreads = 16
  maxConnections = 16
  connectionTimeout = 5s
  leakDetectionThreshold = 5s
}
```

8. Evolutions and safe migrations
   - Use evolutions in dev, controlled migrations in prod, and back up before DDL.
\n```hocon
play.evolutions.db.default.autoApply = false
play.evolutions.db.default.autoApplyDowns = false
```

9. Multi-module builds and shared config
   - Share common modules for models/utilities; keep runtime config per app.
\n```scala
lazy val common = (project in file("common"))
lazy val api = (project in file("api")).dependsOn(common)
```

10. Guice modules + lifecycle hooks
   - Bind implementations and use `ApplicationLifecycle` for shutdown hooks.
\n```scala
class Module extends AbstractModule {
  override def configure(): Unit = {
    bind(classOf[Clock]).to(classOf[SystemClock])
  }
}

@Singleton
class Cleanup @Inject()(lifecycle: ApplicationLifecycle)(implicit ec: ExecutionContext) {
  lifecycle.addStopHook(() => Future.successful(Logger.logger.info("Stopping")))
}
```

11. Compile-time DI with MacWire
   - Prefer for faster compile-time wiring and fewer runtime reflection errors.
\n```scala
class AppComponents(context: ApplicationLoader.Context)
    extends BuiltInComponentsFromContext(context) with NoHttpFiltersComponents {

  lazy val userRepo = wire[UserRepo]
  lazy val userService = wire[UserService]
  lazy val homeController = wire[HomeController]

  override def router = Router.from {
    case GET(p"/") => homeController.index
  }
}
```

12. Layered config + type-safe mapping
   - Use `play.api.Configuration` and map to case classes with `ConfigLoader`.
\n```scala
case class ApiConfig(baseUrl: String, timeout: FiniteDuration)
implicit val apiConfigLoader: ConfigLoader[ApiConfig] =
  ConfigLoader { root =>
    ApiConfig(
      root.getString("api.baseUrl"),
      root.getDuration("api.timeout").toMillis.millis
    )
  }

val apiConfig = configuration.get[ApiConfig]("api")
```

13. Custom error handlers
   - Implement `HttpErrorHandler` and branch on `Accept` header.
\n```scala
class ErrorHandler @Inject()(implicit ec: ExecutionContext) extends HttpErrorHandler {
  def onServerError(request: RequestHeader, ex: Throwable) =
    if (request.accepts("application/json"))
      Future.successful(Results.InternalServerError(Json.obj("error" -> "server_error")))
    else
      Future.successful(Results.InternalServerError("Server error"))
}
```

14. Content negotiation + custom renderers
   - Inspect `Accept` and render accordingly.
\n```scala
def export = Action { implicit req =>
  render {
    case Accepts.Json() => Ok(Json.toJson(data))
    case Accepts.Xml()  => Ok(<data>{data.mkString(",")}</data>)
    case _              => Ok(data.mkString(",")).as("text/csv")
  }
}
```

15. Security: CSRF, CORS, cookies, HTTPS
   - Enable CSRF filter, configure CORS, and secure cookies.
\n```hocon
play.filters.csrf {
  header.bypassHeaders = [ "X-Requested-With" ]
}
play.http.session.secure = true
play.http.session.httpOnly = true
```

16. Testing with ScalaTest/Specs2
   - Use `WithApplication`, `FakeRequest`, and test DB fixtures.
\n```scala
"Users" should {
  "create user" in new WithApplication {
    val request = FakeRequest(POST, "/users").withJsonBody(Json.obj("name" -> "Ada"))
    val result = route(app, request).value
    status(result) mustBe CREATED
  }
}
```

17. i18n and locale selection
   - Use `MessagesApi` and `Langs` to resolve locale from request.
\n```scala
class HomeController @Inject()(cc: ControllerComponents, messagesApi: MessagesApi)
    extends AbstractController(cc) {
  def index = Action { implicit req =>
    Ok(messagesApi("home.welcome")(req.lang))
  }
}
```

18. Custom parameter binders + reverse routing
   - Implement `PathBindable` for domain IDs and use generated routes.
\n```scala
case class UserId(value: Long)
implicit val bindableUserId: PathBindable[UserId] =
  new PathBindable[UserId] {
    def bind(key: String, value: String) =
      scala.util.Try(UserId(value.toLong)).toEither.left.map(_.getMessage)
    def unbind(key: String, id: UserId) = id.value.toString
  }

val url = routes.UserController.getUser(UserId(42)).url
```

19. Caching strategies + HTTP cache headers
   - Combine server-side cache with client cache headers.
\n```scala
def profile(id: Long) = Action.async {
  cache.getOrElseUpdate(s"profile:$id", 5.minutes) {
    userService.fetchProfile(id)
  }.map { profile =>
    Ok(Json.toJson(profile)).withHeaders("Cache-Control" -> "max-age=300")
  }
}
```

20. Logging, metrics, tracing
   - Use structured logging and integrate with metrics/tracing libraries.
\n```scala
Logger.logger.info(s"event=request_completed status=$status latencyMs=$latency")
```
