# Form Submission in Play (Scala)

This note explains how a typical form submission works in the Play Framework
using Scala. It focuses on the standard flow: define a form mapping, render it
in a view, accept POST data, validate, and handle success or errors.

## 1) Define the form mapping

Play uses `Form` with a `Mapping` to bind request data into a Scala case class.

- A `Mapping` defines field names, types, constraints, and transformations.
- The `Form` is typically defined in a companion object or controller.

Example:

```scala
import play.api.data._
import play.api.data.Forms._

case class SignupData(email: String, age: Int)

val signupForm: Form[SignupData] = Form(
  mapping(
    "email" -> email,
    "age" -> number(min = 13)
  )(SignupData.apply)(SignupData.unapply)
)
```

## 2) Expose routes for GET and POST

Your `conf/routes` file defines endpoints for showing the form and handling
submission:

```
GET   /signup     controllers.AuthController.showSignup
POST  /signup     controllers.AuthController.submitSignup
```

## 3) Render the form in a template

Play templates (Twirl) receive a `Form[T]` so they can render fields and
validation errors.

```scala
@(form: Form[SignupData])

@helper.form(action = routes.AuthController.submitSignup()) {
  @helper.inputText(form("email"))
  @helper.inputText(form("age"))
  <button type="submit">Create account</button>
}
```

## 4) Bind and validate in the controller

In the POST action, bind the incoming request and handle errors or success.

```scala
def submitSignup = Action { implicit request =>
  signupForm.bindFromRequest.fold(
    formWithErrors => BadRequest(views.html.signup(formWithErrors)),
    data => {
      // data is validated and typed
      // do work (save user, etc.)
      Redirect(routes.AuthController.showSignup())
    }
  )
}
```

Key points:

- `bindFromRequest` reads request body fields (form-encoded or multipart).
- `fold` handles both error and success paths.
- Errors are attached to the form and rendered by the template helpers.

## 5) Handling errors and messages

Common patterns:

- Use `BadRequest` to re-render the same form with errors.
- Use `flash` for success messages after redirect.

```scala
Redirect(routes.AuthController.showSignup())
  .flashing("success" -> "Account created")
```

## 6) CSRF protection

Play adds CSRF protection by default. Twirl helpers insert a token automatically
for POST forms. If not using helpers, include the token manually:

```scala
@helper.CSRF.formField
```

## 7) JSON forms (optional)

For JSON payloads, bind using `Form` alternatives or custom JSON reads, but the
standard HTML form flow is still: parse request, validate, and respond.

## Summary of the flow

1. Define a `Form` mapping for your model.
2. Render a template with that form.
3. Submit to a POST action.
4. Bind + validate using `bindFromRequest`.
5. On errors, re-render with the error-filled form.
6. On success, perform side effects and redirect.
