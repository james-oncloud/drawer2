
import play.api.libs.json._

object SomeService extends App {


  case class User(id: Long, name: String)

  object User {
    implicit val format: OFormat[User] = Json.format[User]

    // Format for a non-object JSON shape (String in this case)
    implicit val stringFormat: Format[String] = implicitly[Format[String]]
  }

  val userJson: JsObject = Json.toJson(User(1, "Ada")).as[JsObject]
  val nameJson: JsValue = Json.toJson("Ada") // JsString

  val user = userJson.as[User]
  val name = nameJson.as[String]
}