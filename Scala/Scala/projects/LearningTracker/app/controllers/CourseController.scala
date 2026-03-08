package controllers

import jakarta.inject.{Inject, Singleton}
import models.{CourseId, Level, Status => CourseStatus, _}
import play.api.libs.json.{JsError, JsSuccess, JsValue, Json, OFormat}
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents, Request}
import play.filters.csrf.CSRF
import services.CourseService

import scala.concurrent.ExecutionContext

@Singleton
class CourseController @Inject() (
    cc: ControllerComponents,
    service: CourseService
)(implicit ec: ExecutionContext)
    extends AbstractController(cc) {

  final case class CreateCourseRequest(
      title: String,
      level: Level,
      tags: Set[String],
      metadata: Map[String, String]
  )

  object CreateCourseRequest {
    implicit val format: OFormat[CreateCourseRequest] = Json.format[CreateCourseRequest]
  }

  final case class UpdateStatusRequest(status: CourseStatus)

  object UpdateStatusRequest {
    implicit val format: OFormat[UpdateStatusRequest] = Json.format[UpdateStatusRequest]
  }

  final case class CreateLessonRequest(title: String, minutes: Int, tags: List[String])

  object CreateLessonRequest {
    implicit val format: OFormat[CreateLessonRequest] = Json.format[CreateLessonRequest]
  }

  def list: Action[AnyContent] =
    Action {
      Ok(Json.toJson(service.list))
    }

  def newForm: Action[AnyContent] =
    Action { implicit request =>
      val token = CSRF.getToken(request)
      val tokenValue = token.map(_.value).getOrElse("")
      val tokenFieldName = token.map(_.name).getOrElse("csrfToken")
      Ok(views.html.courses.create(tokenFieldName, tokenValue))
    }

  def get(id: String): Action[AnyContent] =
    Action {
      service.get(CourseId(id)) match {
        case Some(course) => Ok(Json.toJson(course))
        case None         => NotFound(Json.obj("error" -> "Course not found"))
      }
    }

  def submitForm: Action[AnyContent] =
    Action { request =>
      val data = request.body.asFormUrlEncoded.getOrElse(Map.empty)
      val title = data.get("title").flatMap(_.headOption).getOrElse("").trim
      val levelRaw = data.get("level").flatMap(_.headOption).getOrElse("")
      val tagsRaw = data.get("tags").flatMap(_.headOption).getOrElse("")
      val source = data.get("source").flatMap(_.headOption).getOrElse("").trim

      if (title.isEmpty) {
        BadRequest("Title is required")
      } else {
        Level.fromString(levelRaw) match {
          case None =>
            BadRequest(s"Unknown level: $levelRaw")
          case Some(level) =>
            val tags = tagsRaw.split(",").map(_.trim).filter(_.nonEmpty).toSet
            val metadata =
              if (source.nonEmpty) Map("source" -> source) else Map.empty[String, String]
            val course = service.create(title = title, level = level, tags = tags, metadata = metadata)
            Ok(
              s"""<html><body>
                 |<p>Course created: ${course.title}</p>
                 |<p>ID: ${course.id.value}</p>
                 |<p><a href="/api/courses/${course.id.value}">View JSON</a></p>
                 |</body></html>
                 |""".stripMargin
            ).as(HTML)
        }
      }
    }

  def create: Action[JsValue] =
    Action(parse.json) { request: Request[JsValue] =>
      request.body.validate[CreateCourseRequest] match {
        case JsSuccess(payload, _) =>
          val course = service.create(
            title = payload.title,
            level = payload.level,
            tags = payload.tags,
            metadata = payload.metadata
          )
          Created(Json.toJson(course))
        case JsError(errors) =>
          BadRequest(Json.obj("error" -> JsError.toJson(errors)))
      }
    }

  def updateStatus(id: String): Action[JsValue] =
    Action(parse.json) { request: Request[JsValue] =>
      request.body.validate[UpdateStatusRequest] match {
        case JsSuccess(payload, _) =>
          service.updateStatus(CourseId(id), payload.status) match {
            case Some(course) => Ok(Json.toJson(course))
            case None         => NotFound(Json.obj("error" -> "Course not found"))
          }
        case JsError(errors) =>
          BadRequest(Json.obj("error" -> JsError.toJson(errors)))
      }
    }

  def addLesson(id: String): Action[JsValue] =
    Action(parse.json) { request: Request[JsValue] =>
      request.body.validate[CreateLessonRequest] match {
        case JsSuccess(payload, _) =>
          service.addLesson(CourseId(id), payload.title, payload.minutes, payload.tags) match {
            case Some(course) => Ok(Json.toJson(course))
            case None         => NotFound(Json.obj("error" -> "Course not found"))
          }
        case JsError(errors) =>
          BadRequest(Json.obj("error" -> JsError.toJson(errors)))
      }
    }

  def search(term: String, level: Option[String], status: Option[String]): Action[AnyContent] =
    Action {
      (parseLevel(level), parseStatus(status)) match {
        case (Right(levelOpt), Right(statusOpt)) =>
          Ok(Json.toJson(service.search(term, levelOpt, statusOpt)))
        case (Left(error), _) =>
          BadRequest(Json.obj("error" -> error))
        case (_, Left(error)) =>
          BadRequest(Json.obj("error" -> error))
      }
    }

  private def parseLevel(value: Option[String]): Either[String, Option[Level]] =
    value match {
      case None => Right(None)
      case Some(raw) =>
        Level.values
          .find(_.toString.equalsIgnoreCase(raw))
          .map(Some(_))
          .toRight(s"Unknown level: $raw")
    }

  private def parseStatus(value: Option[String]): Either[String, Option[CourseStatus]] =
    value match {
      case None => Right(None)
      case Some(raw) =>
        CourseStatus.values
          .find(_.toString.equalsIgnoreCase(raw))
          .map(Some(_))
          .toRight(s"Unknown status: $raw")
    }
}
