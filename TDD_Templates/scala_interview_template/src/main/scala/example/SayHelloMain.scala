package example

import cats.effect.{IO, IOApp}

import scala.io.StdIn

trait Interactions {
  def print(msg: String): IO[Unit] = IO(println(msg))
  def readLine(): IO[String] = IO(StdIn.readLine())
}

trait SayHelloSteps {
  def displayNamePrompt: IO[Unit]
  def captureName: IO[String]
  def displayLanguagePrompt: IO[Unit]
  def captureLanguage: IO[Language]
  def greet(msg: String): IO[String]
}

class SayHello extends SayHelloSteps with GreetingByLanguageBuilder with Interactions {

  override def displayNamePrompt: IO[Unit] = print("What is your name?")
  override def captureName: IO[String] = readLine().map {
    case "" => throw new IllegalArgumentException("Name cannot be empty")
    case n => n
  }
  override def displayLanguagePrompt: IO[Unit] = print("In what language do you want to say hello?")
  override def captureLanguage: IO[Language] = readLine().map(v => v.toLowerCase).map {
    case "" => English
    case "english" => English
    case "spanish" => Spanish
    case l => throw new IllegalArgumentException(s"Invalid language: $l")
  }

  override def greet(msg: String): IO[String] = print(msg).map(_ => msg)

  def runSayHello: IO[Unit] = for {
    _ <- displayNamePrompt
    name <- captureName
    _ <- displayLanguagePrompt
    language <- captureLanguage
    msg <- IO.pure(buildGreeting(name, language))
    _ <- greet(msg)
  } yield ()


}

object SayHelloMain extends IOApp.Simple {
  override def run: IO[Unit] = new SayHello().runSayHello
}

object Language {
  def toLanguage(language: String): Language = language.toLowerCase match {
    case "" => English
    case "english" => English
    case "spanish" => Spanish
    case l => throw new IllegalArgumentException(s"Invalid language: $l")
  }
}

sealed trait Language
case object English extends Language
case object Spanish extends Language



trait GreetingByLanguageBuilder {
  def buildGreeting(name: String, language: Language): String = language match {
    case English => s"Hello, $name"
    case Spanish => s"Hola, $name"
  }
}