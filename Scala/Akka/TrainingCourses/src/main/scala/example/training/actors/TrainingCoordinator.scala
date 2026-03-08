package example.training.actors

import akka.actor.{Actor, ActorRef, Props}
import example.training.{Course, CourseId, StudentId}
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
