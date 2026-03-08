package services

import jakarta.inject.{Inject, Singleton}
import models._
import models.Extensions._

import java.time.Instant

@Singleton
class CourseService @Inject() (repo: CourseRepository) {
  private def now: Instant = Instant.now

  def list: List[Course] =
    repo.all

  def get(id: CourseId): Option[Course] =
    repo.get(id)

  def create(title: String, level: Level, tags: Set[String], metadata: Map[String, String]): Course = {
    val course = Course(
      id = CourseId.random(),
      title = title,
      level = level,
      status = Status.Planned,
      lessons = List.empty,
      tags = tags,
      metadata = metadata + ("slug" -> title.toSlug),
      createdAt = now,
      updatedAt = now
    )
    repo.save(course)
  }

  def updateStatus(id: CourseId, status: Status): Option[Course] =
    withCourse(id) { course =>
      val normalized = status match {
        case Status.Completed => Status.Completed
        case Status.Archived  => Status.Archived
        case other            => other
      }
      course.copy(status = normalized, updatedAt = now)
    }

  def addLesson(id: CourseId, title: String, minutes: Int, tags: List[String]): Option[Course] =
    withCourse(id) { course =>
      val lesson = Lesson(LessonId.random(), title, minutes, tags)
      course.copy(lessons = course.lessons :+ lesson, updatedAt = now)
    }

  def search(term: String, level: Option[Level], status: Option[Status]): List[Course] = {
    val normalizedTerm = term.trim.toLowerCase
    repo.all.filter { course =>
      val matchesTerm =
        course.title.toLowerCase.contains(normalizedTerm) ||
          course.tags.exists(_.toLowerCase.contains(normalizedTerm))
      val matchesLevel = level.forall(_ == course.level)
      val matchesStatus = status.forall(_ == course.status)
      matchesTerm && matchesLevel && matchesStatus
    }
  }

  private def withCourse(id: CourseId)(f: Course => Course): Option[Course] =
    repo.update(id)(f)
}
