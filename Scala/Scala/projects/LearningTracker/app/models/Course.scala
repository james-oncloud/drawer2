package models

import java.time.Instant
import play.api.libs.json.{Json, OFormat}

final case class Course(
    id: CourseId,
    title: String,
    level: Level,
    status: Status,
    lessons: List[Lesson],
    tags: Set[String],
    metadata: Map[String, String],
    createdAt: Instant,
    updatedAt: Instant
) extends Identified
    with Timestamped {
  type Id = CourseId
}

object Course {
  implicit val courseFormat: OFormat[Course] = Json.format[Course]
}
