# OFormat in Play (Scala 2) with a Complete Example

`OFormat[A]` combines a `Reads[A]` and an `OWrites[A]` for JSON objects. It is
used when your type maps to a JSON object (not a bare value or array). This is
the most common case for case classes.

## Example

```scala
import play.api.libs.json._
import play.api.libs.functional.syntax._

case class Address(street: String, city: String, zip: String)
case class User(id: Long, name: String, email: String, address: Address, tags: Seq[String])

object User {
  // OFormat for nested type
  implicit val addressFormat: OFormat[Address] = Json.format[Address]

  // OFormat for the root type
  implicit val userFormat: OFormat[User] = Json.format[User]
}

object Demo {
  def main(args: Array[String]): Unit = {
    val jsonString =
      """
        {
          "id": 42,
          "name": "Ada",
          "email": "ada@example.com",
          "address": {
            "street": "42 Loop St",
            "city": "Lambda Town",
            "zip": "12345"
          },
          "tags": ["engineer", "admin"]
        }
      """

    // Parse to JsValue
    val json = Json.parse(jsonString)

    // Read: JsValue -> User
    val userResult: JsResult[User] = json.validate[User]

    val user = userResult match {
      case JsSuccess(value, _) => value
      case JsError(errors) =>
        throw new IllegalArgumentException(JsError.toJson(errors).toString)
    }

    // Write: User -> JsObject
    val userJson: JsObject = Json.toJson(user).as[JsObject]

    // Pretty print to verify
    val pretty = Json.prettyPrint(userJson)
    println(pretty)
  }
}
```

## Why `OFormat`?

- `Format[A]` works for any JSON type.
- `OFormat[A]` guarantees the JSON representation is a `JsObject`.
- This helps you avoid accidental mapping to non-object JSON when your model is
  inherently object-shaped.

## OFormat vs Format (with code)

`Format[A]` is the general JSON read/write type. `OFormat[A]` is the object-only
variant (it guarantees a `JsObject` on writes and expects a JSON object on
reads). For case classes, `Json.format` returns an `OFormat`.

```scala
import play.api.libs.json._

case class User(id: Long, name: String)

// OFormat for an object-shaped model
implicit val userOFormat: OFormat[User] = Json.format[User]

// Format for a non-object JSON shape (String in this case)
implicit val stringFormat: Format[String] = implicitly[Format[String]]

val userJson: JsObject = Json.toJson(User(1, "Ada")).as[JsObject]
val nameJson: JsValue = Json.toJson("Ada") // JsString

val user = userJson.as[User]
val name = nameJson.as[String]
```

## Customizing Fields (Optional)

If you need to rename fields, validate, or transform values, you can build an
`OFormat` with combinators instead of `Json.format`:

```scala
implicit val userFormat: OFormat[User] = (
  (JsPath \ "id").format[Long] and
  (JsPath \ "full_name").format[String] and
  (JsPath \ "email").format[String] and
  (JsPath \ "address").format[Address] and
  (JsPath \ "tags").format[Seq[String]]
)(User.apply, unlift(User.unapply))
```
