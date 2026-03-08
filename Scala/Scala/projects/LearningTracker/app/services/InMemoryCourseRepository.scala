package services

import jakarta.inject.Singleton
import models.{Course, CourseId}

import scala.collection.mutable

@Singleton
class InMemoryCourseRepository extends CourseRepository {
  private val store: mutable.Map[CourseId, Course] = mutable.Map.empty
  private var order: List[CourseId] = List.empty

  def all: List[Course] =
    order.flatMap(store.get)

  def get(id: CourseId): Option[Course] =
    store.get(id)

  def save(course: Course): Course = {
    if (!store.contains(course.id)) {
      order = order :+ course.id
    }
    store.update(course.id, course)
    course
  }

  def update(id: CourseId)(f: Course => Course): Option[Course] =
    store.get(id).map { existing =>
      val next = f(existing)
      store.update(id, next)
      next
    }

  def delete(id: CourseId): Boolean =
    store.remove(id).isDefined
}
