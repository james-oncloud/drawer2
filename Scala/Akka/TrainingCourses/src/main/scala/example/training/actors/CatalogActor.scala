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
