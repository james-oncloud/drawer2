package models

import play.api.libs.json.{Format, JsError, JsString, JsSuccess, Reads, Writes}

sealed trait Level

object Level {
  case object Beginner extends Level
  case object Intermediate extends Level
  case object Advanced extends Level

  val values: List[Level] = List(Beginner, Intermediate, Advanced)

  def fromString(value: String): Option[Level] =
    values.find(_.toString.equalsIgnoreCase(value))

  implicit val levelReads: Reads[Level] = Reads {
    case JsString(value) =>
      fromString(value)
        .map(JsSuccess(_))
        .getOrElse(JsError(s"Unknown level: $value"))
    case other => JsError(s"Expected string for level, got: $other")
  }
  implicit val levelWrites: Writes[Level] = Writes(level => JsString(level.toString))
  implicit val levelFormat: Format[Level] = Format(levelReads, levelWrites)
}
