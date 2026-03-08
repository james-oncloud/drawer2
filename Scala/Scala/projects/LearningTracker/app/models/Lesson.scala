package models

import play.api.libs.json.{Json, OFormat}

final case class Lesson(
    id: LessonId,
    title: String,
    minutes: Int,
    tags: List[String]
)

object Lesson {
  implicit val lessonFormat: OFormat[Lesson] = Json.format[Lesson]
}
