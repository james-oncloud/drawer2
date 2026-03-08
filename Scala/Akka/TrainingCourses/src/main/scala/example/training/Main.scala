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
  val notifications = system.actorOf(NotificationActor.props(), "notifications")
  val coordinator =
    system.actorOf(TrainingCoordinator.props(catalog, enrollments, notifications), "coordinator")

  coordinator ! ListAllCourses()
  coordinator ! EnrollStudent(CourseId("scala-101"), StudentId("s-1001"))
  coordinator ! EnrollStudent(CourseId("akka-101"), StudentId("s-1002"))

  Thread.sleep(1000L * 30)
  system.terminate()
}
