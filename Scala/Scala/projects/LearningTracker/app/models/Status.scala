package models

import play.api.libs.json.{Format, JsError, JsString, JsSuccess, Reads, Writes}

sealed trait Status

object Status {
  case object Planned extends Status
  case object InProgress extends Status
  case object Completed extends Status
  case object Archived extends Status

  val values: List[Status] = List(Planned, InProgress, Completed, Archived)

  def fromString(value: String): Option[Status] =
    values.find(_.toString.equalsIgnoreCase(value))

  implicit val statusReads: Reads[Status] = Reads {
    case JsString(value) =>
      fromString(value)
        .map(JsSuccess(_))
        .getOrElse(JsError(s"Unknown status: $value"))
    case other => JsError(s"Expected string for status, got: $other")
  }
  implicit val statusWrites: Writes[Status] = Writes(status => JsString(status.toString))
  implicit val statusFormat: Format[Status] = Format(statusReads, statusWrites)
}
