package models

import java.util.UUID
import play.api.libs.json.{Format, Reads, Writes}

final case class CourseId(value: String) extends AnyVal

object CourseId {
  def random(): CourseId = CourseId(UUID.randomUUID().toString)
  implicit val courseIdFormat: Format[CourseId] =
    Format(Reads.StringReads.map(CourseId(_)), Writes.StringWrites.contramap(_.value))
}

final case class LessonId(value: String) extends AnyVal

object LessonId {
  def random(): LessonId = LessonId(UUID.randomUUID().toString)
  implicit val lessonIdFormat: Format[LessonId] =
    Format(Reads.StringReads.map(LessonId(_)), Writes.StringWrites.contramap(_.value))
}
