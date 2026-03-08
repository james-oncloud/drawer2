# Play `Mapping[A]` (Scala 2) Explained

`Mapping[A]` is the core building block of Play’s form API. It defines **how
raw form data is bound into a Scala value of type `A`**, and how a Scala value
of type `A` is **unbound back into form fields**.

In short: **`Mapping[A]` = rules for parsing, validating, and formatting `A`.**

## Core Responsibilities

A `Mapping[A]` does three key jobs:

1. **Bind**: convert request data (`Map[String, String]`) into `A`.
2. **Validate**: run constraints and return errors (`FormError`) if invalid.
3. **Unbind**: convert `A` back into form field strings (for redisplay).

These are surfaced by the methods:

- `bind(data: Map[String, String])`: `Either[Seq[FormError], A]`
- `unbind(value: A)`: `Map[String, String]`
- `verifying(...)`: attach constraints

## Built-in Mappings

Play provides standard mappings for common input types:

- `text`: `String`
- `number`: `Int`
- `longNumber`: `Long`
- `bigDecimal`: `BigDecimal`
- `boolean`: `Boolean`
- `date`: `java.util.Date` (legacy)
- `localDate`: `java.time.LocalDate`
- `email`: `String` with email validation
- `optional(mapping)`: `Option[A]`

Example:

```scala
import play.api.data._
import play.api.data.Forms._

val ageMapping: Mapping[Int] =
  number(min = 0, max = 120)
```

## Composing Mappings into Case Classes

The `mapping(...)` helper combines multiple field mappings into a single
`Mapping[A]` for a case class.

```scala
import play.api.data._
import play.api.data.Forms._

case class User(name: String, age: Int, email: String)

val userMapping: Mapping[User] = mapping(
  "name"  -> nonEmptyText,
  "age"   -> number(min = 0, max = 120),
  "email" -> email
)(User.apply)(User.unapply)
```

This combined mapping:

- Binds each field from request data
- Builds a `User`
- Unbinds `User` back to form fields for redisplay

## Binding and Unbinding in a Form

Forms wrap a mapping:

```scala
val userForm: Form[User] = Form(userMapping)

// Bind request data
val bound: Form[User] = userForm.bindFromRequest()

// Unbind existing value (for editing forms)
val filled: Form[User] = userForm.fill(User("Ada", 42, "ada@example.com"))
```

## Validation and Constraints

You can attach constraints to a mapping with `verifying`.

```scala
import play.api.data.validation.Constraints._

val usernameMapping: Mapping[String] =
  nonEmptyText.verifying(minLength(3), maxLength(30))
```

Constraints can be:

- **Built-in** (e.g., `minLength`, `maxLength`, `pattern`, `emailAddress`)
- **Custom**, using `Constraint[A]`

```scala
import play.api.data.validation._

val startsWithA: Constraint[String] = Constraint("startsWithA") { value =>
  if (value.startsWith("A")) Valid else Invalid("Must start with A")
}

val mappingWithCustom: Mapping[String] =
  text.verifying(startsWithA)
```

## Optional and Nested Data

Use `optional` for optional fields and `mapping` for nested structures.

```scala
case class Address(street: String, city: String)
case class User(name: String, address: Option[Address])

val addressMapping: Mapping[Address] = mapping(
  "street" -> nonEmptyText,
  "city"   -> nonEmptyText
)(Address.apply)(Address.unapply)

val userMapping: Mapping[User] = mapping(
  "name"    -> nonEmptyText,
  "address" -> optional(addressMapping)
)(User.apply)(User.unapply)
```

## Repeating Fields

Use `list` or `seq` when you have repeated fields:

```scala
val tagsMapping: Mapping[List[String]] =
  list(nonEmptyText)
```

## Errors and Field-Level Feedback

Binding failures return `FormError`s that carry:

- **key**: field name
- **message**: error message (i18n key)
- **args**: interpolation args

This is what Twirl templates use to render field errors.

## Typical Flow in a Controller

```scala
def submit = Action { implicit request =>
  userForm.bindFromRequest().fold(
    formWithErrors => BadRequest(views.html.userForm(formWithErrors)),
    userData => {
      // success path
      Redirect(routes.Users.show(userData.name))
    }
  )
}
```

## Key Takeaways

- `Mapping[A]` defines how to bind and unbind a specific type.
- `Form[A]` wraps a mapping and handles request binding.
- `mapping(...)` is how case classes are composed from fields.
- Validation lives on mappings via constraints.
