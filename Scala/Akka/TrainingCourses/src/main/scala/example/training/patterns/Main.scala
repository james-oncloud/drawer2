package example.training.patterns

import cats.Monad
import cats.effect.{IO, IOApp}
import cats.syntax.all._

import java.time.LocalDateTime
import java.util.Date

case class User(id: Long, name: String, age: Int)

trait UserRepo[F[_]] {
  def findById(id: Long): F[Option[User]]
}

trait Logger[F[_]] {
  def info(msg: String): F[Unit]
}

class UserService[F[_]: Monad](
                                repo: UserRepo[F],
                                var logger: Logger[F]
                              ) {

  def getUser(id: Long): F[Option[User]] =
    for {
      _ <- logger.info(s"Fetching user $id")
      user <- repo.findById(id)
      _ <- logger.info(s"user $user")
    } yield user
}




object Main extends IOApp.Simple {

  private val users = Map(
    1L -> User(1, "Alice", 30),
    2L -> User(2, "Bob", 25)
  )

  // F[_] = IO
  class InMemoryUserRepoIO(users: Map[Long, User]) extends UserRepo[IO] {
    override def findById(id: Long): IO[Option[User]] =
      Monad[IO].pure(users.get(id))
  }

  class ConsoleLoggerIO extends Logger[IO] {
    override def info(msg: String): IO[Unit] =
      IO(println(s"[INFO] $msg"))
  }

  private val userServiceIO = new UserService[IO](new InMemoryUserRepoIO(users), new ConsoleLoggerIO)

  // F[_] = Either[String, User]
  type EitherString[A] = Either[String, A]

  class InMemoryUserRepoEither(users: Map[Long, User]) extends UserRepo[EitherString] {
    override def findById(id: Long): EitherString[Option[User]] =
      users.get(id).map(Some(_)).toRight(s"User $id not found")
  }

  class ConsoleLoggerEither extends Logger[EitherString] {
    override def info(msg: String): EitherString[Unit] =
      Either.right(println(s"[INFO] $msg"))
  }

  val userServiceEither = new UserService[EitherString](new InMemoryUserRepoEither(users), new ConsoleLoggerEither)

  def run2: IO[Unit] =
    for {
      _ <- userServiceIO.logger.info("Application started")
      user <- userServiceIO.getUser(1L)
      _ <- userServiceIO.logger.info(s"Retrieved user: $user")
    } yield user

  override def run: IO[Unit] = {

    val r = for {
      _ <- userServiceEither.logger.info("Application started")
      user <- userServiceEither.getUser(1L)
      _ <- userServiceEither.logger.info(s"Retrieved user: $user")
    } yield user

    IO.pure(println(r.getOrElse(None)))
  }


  //IO.pure(println(s"Hello, Scala! - ${LocalDateTime.now()}"))
}
