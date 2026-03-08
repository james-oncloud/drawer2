# Sample App: Training Courses (Scala 2 + Akka Classic)

This is a small Akka Classic sample that models a training provider. It includes
actors for course catalog, enrollment, and notifications, plus a simple main app.
All code is provided as file snippets you can copy into a Scala project.

## Project Structure

```
training-courses/
  build.sbt
  src/main/scala/example/training/
    Main.scala
    domain.scala
    actors/
      CatalogActor.scala
      EnrollmentActor.scala
      NotificationActor.scala
      TrainingCoordinator.scala
```

## build.sbt

```scala
name := "training-courses"
version := "0.1.0"
scalaVersion := "2.13.12"

libraryDependencies ++= Seq(
  "com.typesafe.akka" %% "akka-actor" % "2.6.21"
)
```

## src/main/scala/example/training/domain.scala

```scala
package example.training

import java.time.LocalDate

final case class CourseId(value: String) extends AnyVal
final case class StudentId(value: String) extends AnyVal

final case class Course(
  id: CourseId,
  title: String,
  startDate: LocalDate,
  capacity: Int
)

final case class Enrollment(
  courseId: CourseId,
  studentId: StudentId
)
```

## src/main/scala/example/training/actors/CatalogActor.scala

```scala
package example.training.actors

import akka.actor.{Actor, Props}
import example.training.{Course, CourseId}

object CatalogActor {
  def props(initial: Map[CourseId, Course]): Props =
    Props(new CatalogActor(initial))

  final case class AddCourse(course: Course)
  final case class GetCourse(courseId: CourseId)
  final case class ListCourses()

  final case class CourseFound(course: Course)
  final case class CourseNotFound(courseId: CourseId)
  final case class CourseList(courses: List[Course])
}

final class CatalogActor(initial: Map[CourseId, Course]) extends Actor {
  import CatalogActor._

  private var courses: Map[CourseId, Course] = initial

  def receive: Receive = {
    case AddCourse(course) =>
      courses = courses.updated(course.id, course)
    case GetCourse(courseId) =>
      courses.get(courseId) match {
        case Some(course) => sender() ! CourseFound(course)
        case None         => sender() ! CourseNotFound(courseId)
      }
    case ListCourses() =>
      sender() ! CourseList(courses.values.toList.sortBy(_.startDate))
  }
}
```

## src/main/scala/example/training/actors/EnrollmentActor.scala

```scala
package example.training.actors

import akka.actor.{Actor, Props}
import example.training.{CourseId, Enrollment, StudentId}

object EnrollmentActor {
  def props(): Props = Props(new EnrollmentActor)

  final case class Enroll(courseId: CourseId, studentId: StudentId)
  final case class Cancel(courseId: CourseId, studentId: StudentId)
  final case class GetEnrollments(courseId: CourseId)

  final case class EnrollmentAccepted(enrollment: Enrollment)
  final case class EnrollmentRejected(reason: String)
  final case class Enrollments(courseId: CourseId, students: Set[StudentId])
}

final class EnrollmentActor extends Actor {
  import EnrollmentActor._

  private var enrollments: Map[CourseId, Set[StudentId]] = Map.empty

  def receive: Receive = {
    case Enroll(courseId, studentId) =>
      val students = enrollments.getOrElse(courseId, Set.empty)
      enrollments = enrollments.updated(courseId, students + studentId)
      sender() ! EnrollmentAccepted(Enrollment(courseId, studentId))

    case Cancel(courseId, studentId) =>
      val students = enrollments.getOrElse(courseId, Set.empty)
      enrollments = enrollments.updated(courseId, students - studentId)

    case GetEnrollments(courseId) =>
      val students = enrollments.getOrElse(courseId, Set.empty)
      sender() ! Enrollments(courseId, students)
  }
}
```

## src/main/scala/example/training/actors/NotificationActor.scala

```scala
package example.training.actors

import akka.actor.{Actor, Props}
import example.training.Enrollment

object NotificationActor {
  def props(): Props = Props(new NotificationActor)

  final case class SendEnrollmentNotice(enrollment: Enrollment)
}

final class NotificationActor extends Actor {
  import NotificationActor._

  def receive: Receive = {
    case SendEnrollmentNotice(enrollment) =>
      println(s"[notify] Enrollment confirmed: $enrollment")
  }
}
```

## src/main/scala/example/training/actors/TrainingCoordinator.scala

```scala
package example.training.actors

import akka.actor.{Actor, ActorRef, Props}
import example.training.{Course, CourseId, Enrollment, StudentId}
import example.training.actors.CatalogActor._
import example.training.actors.EnrollmentActor._
import example.training.actors.NotificationActor._

object TrainingCoordinator {
  def props(catalog: ActorRef, enrollment: ActorRef, notify: ActorRef): Props =
    Props(new TrainingCoordinator(catalog, enrollment, notify))

  final case class RegisterCourse(course: Course)
  final case class EnrollStudent(courseId: CourseId, studentId: StudentId)
  final case class ListAllCourses()
}

final class TrainingCoordinator(
  catalog: ActorRef,
  enrollment: ActorRef,
  notify: ActorRef
) extends Actor {
  import TrainingCoordinator._

  def receive: Receive = {
    case RegisterCourse(course) =>
      catalog ! AddCourse(course)

    case EnrollStudent(courseId, studentId) =>
      enrollment ! Enroll(courseId, studentId)

    case accepted: EnrollmentAccepted =>
      notify ! SendEnrollmentNotice(accepted.enrollment)

    case ListAllCourses() =>
      catalog forward ListCourses()
  }
}
```

## src/main/scala/example/training/Main.scala

```scala
package example.training

import akka.actor.ActorSystem
import example.training.actors._
import example.training.actors.CatalogActor._
import example.training.actors.TrainingCoordinator._
import java.time.LocalDate

object Main extends App {
  val system = ActorSystem("training-system")

  val initialCourses = Map(
    CourseId("scala-101") -> Course(
      CourseId("scala-101"),
      "Scala Fundamentals",
      LocalDate.now().plusDays(7),
      capacity = 25
    ),
    CourseId("akka-101") -> Course(
      CourseId("akka-101"),
      "Akka Classic Basics",
      LocalDate.now().plusDays(14),
      capacity = 20
    )
  )

  val catalog = system.actorOf(CatalogActor.props(initialCourses), "catalog")
  val enrollments = system.actorOf(EnrollmentActor.props(), "enrollments")
  val notify = system.actorOf(NotificationActor.props(), "notifications")
  val coordinator =
    system.actorOf(TrainingCoordinator.props(catalog, enrollments, notify), "coordinator")

  coordinator ! ListAllCourses()
  coordinator ! EnrollStudent(CourseId("scala-101"), StudentId("s-1001"))
  coordinator ! EnrollStudent(CourseId("akka-101"), StudentId("s-1002"))

  Thread.sleep(1000L)
  system.terminate()
}
```

## Notes and Next Steps

- This is intentionally small and synchronous; expand by adding:
  - course capacity checks in `EnrollmentActor` using `CatalogActor` lookup
  - a `WaitlistActor` for overflow
  - persistence for enrollments
  - HTTP endpoints via Akka HTTP

If you want me to convert this into actual `.scala` files in the project (or
add tests), tell me and I will generate those files.

