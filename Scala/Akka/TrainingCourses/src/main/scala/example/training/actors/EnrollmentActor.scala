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
