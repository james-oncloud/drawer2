package controllers

import jakarta.inject.{Inject, Singleton}
import play.api.Environment
import play.api.mvc.{AbstractController, Action, AnyContent, ControllerComponents}

import scala.io.Source

@Singleton
class DocsController @Inject() (
    cc: ControllerComponents,
    env: Environment
) extends AbstractController(cc) {

  def swagger: Action[AnyContent] =
    Action {
      env.resourceAsStream("swagger.yaml") match {
        case Some(stream) =>
          val contents = Source.fromInputStream(stream)(scala.io.Codec.UTF8).mkString
          stream.close()
          Ok(contents).as("application/yaml")
        case None =>
          NotFound("Swagger file not found")
      }
    }

  def swaggerUi: Action[AnyContent] =
    Action {
      Ok(views.html.docs.swagger("/api/docs/swagger.yaml"))
    }
}
