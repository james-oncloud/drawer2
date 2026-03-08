# Explanation of `newForm`

This Play action renders a form view and injects a CSRF token into it so the
resulting HTML form is protected against cross-site request forgery.

```scala
def newForm: Action[AnyContent] =
  Action { implicit request =>
    val token = CSRF.getToken(request)
    val tokenValue = token.map(_.value).getOrElse("")
    val tokenFieldName = token.map(_.name).getOrElse("csrfToken")
    Ok(views.html.courses.create(tokenFieldName, tokenValue))
  }
```

## What each line does

- `def newForm: Action[AnyContent]` defines a Play action that can accept any
  request body type (typically a GET request).
- `Action { implicit request => ... }` creates a synchronous action and makes
  the `Request` available implicitly for APIs like CSRF helpers.
- `CSRF.getToken(request)` tries to extract or create a CSRF token for this
  request and returns `Option[CSRF.Token]`.
- `token.map(_.value).getOrElse("")` extracts the token value or defaults to an
  empty string if no token exists.
- `token.map(_.name).getOrElse("csrfToken")` extracts the hidden field name for
  the token, defaulting to `"csrfToken"` if missing.
- `Ok(views.html.courses.create(tokenFieldName, tokenValue))` renders the
  `create` template, passing the CSRF field name and value so the form can embed
  them as hidden inputs.

## Typical HTML usage in the view

In the Twirl template, you’d typically add a hidden field like this:

```html
<input type="hidden" name="@tokenFieldName" value="@tokenValue">
```

That ensures Play can validate the CSRF token on form submission.
