package example

import cats.effect.IO
import org.scalatest.flatspec.AnyFlatSpec
import org.scalatest.matchers.must.Matchers
import org.scalatest.matchers.should.Matchers._
import cats.effect.unsafe.implicits.global

import scala.collection.mutable

class SayHelloSpec extends AnyFlatSpec with Matchers {

  "Happy case" should "say 'Hello, John'" in {

    val readLineStack = mutable.Stack[String]()
    readLineStack.push("english")
    readLineStack.push("John")

    val interactionsStack = mutable.Stack[String]()

    trait InteractionsStub extends Interactions {
      override def print(msg: String): IO[Unit] = IO(interactionsStack.push(msg))
      override def readLine(): IO[String] = IO(interactionsStack.pop())
    }

    trait SayHelloStepsStub extends SayHelloSteps with InteractionsStub {
      override def displayNamePrompt: IO[Unit] = print("What is your name?")
      override def captureName: IO[String] = IO.pure(readLineStack.pop())
      override def displayLanguagePrompt: IO[Unit] = print("In what language do you want to say hello?")
      override def captureLanguage: IO[Language] = IO.pure(Language.toLanguage(readLineStack.pop()))
      override def greet(msg: String): IO[String] = print(msg).map(_ => msg)
    }

    /* English */
    val target = new SayHello with SayHelloStepsStub

    target.runSayHello.unsafeRunSync()

    val expected = "What is your name?, In what language do you want to say hello?, Hello, John"
    interactionsStack.reverse.mkString(", ") shouldEqual expected

    /* Spanish */
    interactionsStack.clear()
    readLineStack.clear()

    readLineStack.push("spanish")
    readLineStack.push("John")

    target.runSayHello.unsafeRunSync()

    val spanishExpected = "What is your name?, In what language do you want to say hello?, Hola, John"
    interactionsStack.reverse.mkString(", ") shouldEqual spanishExpected
  }

  "Invalid language choice" should "error" in {

    val readLineStack = mutable.Stack[String]()
    readLineStack.push("french")
    readLineStack.push("John")

    val interactionsStack = mutable.Stack[String]()

    trait InteractionsStub extends Interactions {
      override def print(msg: String): IO[Unit] = IO(interactionsStack.push(msg))
      override def readLine(): IO[String] = IO(interactionsStack.pop())
    }

    trait SayHelloStepsStub extends SayHelloSteps with InteractionsStub {
      override def displayNamePrompt: IO[Unit] = print("What is your name?")
      override def captureName: IO[String] = IO.pure(readLineStack.pop())
      override def displayLanguagePrompt: IO[Unit] = print("In what language do you want to say hello?")
      override def captureLanguage: IO[Language] = IO.pure(Language.toLanguage(readLineStack.pop()))
      override def greet(msg: String): IO[String] = print(msg).map(_ => msg)
    }

    val target = new SayHello with SayHelloStepsStub
    target.runSayHello
      .handleErrorWith(e => IO(interactionsStack.push(e.getMessage)))
      .unsafeRunSync()
    val expected = "What is your name?, In what language do you want to say hello?, Invalid language: french"
    interactionsStack.reverse.mkString(", ") shouldEqual expected
  }


}
