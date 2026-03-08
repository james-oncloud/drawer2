# Scala AST: Complete, Realistic Example

Below is a self-contained example of a small Scala program, followed by a **realistic AST** representation you might see from a compiler or tooling pipeline. The AST is simplified but mirrors the structure you would actually encounter.

## 1) Scala Source

```scala
package demo

final case class User(id: Long, name: String)

object Greeter {
  def greet(user: User): String = {
    val title =
      if (user.id % 2 == 0) "even" else "odd"

    s"Hello ${user.name} (id is $title)"
  }

  def main(args: Array[String]): Unit = {
    val u = User(42L, "Maya")
    println(greet(u))
  }
}
```

## 2) AST (Simplified, Realistic Shape)

This is a readable, compiler-like tree format. It includes nodes for package, class, object, methods, values, control flow, literals, and interpolated strings.

```text
PackageDef(
  Ident("demo"),
  List(
    ClassDef(
      Modifiers(Final, Case),
      TypeName("User"),
      TypeParams(),
      PrimaryCtor(
        ParamList(
          ValDef(Modifiers(Param, Synthetic), TermName("id"), TypeName("Long")),
          ValDef(Modifiers(Param, Synthetic), TermName("name"), TypeName("String"))
        )
      ),
      Template(
        Parents(Ident("AnyRef")),
        SelfType(NoSelfType),
        Body(
          List(
            // fields + generated members for case class are omitted for brevity
          )
        )
      )
    ),
    ModuleDef(
      Modifiers(),
      TermName("Greeter"),
      Template(
        Parents(Ident("AnyRef")),
        SelfType(NoSelfType),
        Body(
          List(
            DefDef(
              Modifiers(),
              TermName("greet"),
              TypeParams(),
              ParamLists(
                List(
                  ValDef(Modifiers(Param), TermName("user"), TypeName("User"))
                )
              ),
              TypeName("String"),
              Block(
                List(
                  ValDef(
                    Modifiers(Local),
                    TermName("title"),
                    TypeName("String"),
                    If(
                      Apply(
                        Select(
                          Apply(
                            Select(Ident("user"), TermName("id")),
                            TermName("%")
                          ),
                          List(Literal(Constant(2)))
                        ),
                        TermName("==")
                      ),
                      Literal(Constant(0)),
                      Literal(Constant("even")),
                      Literal(Constant("odd"))
                    )
                  )
                ),
                Apply(
                  Select(
                    Literal(Constant(StringContext("Hello ", " (id is ", ")"))),
                    TermName("s")
                  ),
                  List(
                    Select(Ident("user"), TermName("name")),
                    Ident("title")
                  )
                )
              )
            ),
            DefDef(
              Modifiers(),
              TermName("main"),
              TypeParams(),
              ParamLists(
                List(
                  ValDef(Modifiers(Param), TermName("args"), TypeName("Array[String]"))
                )
              ),
              TypeName("Unit"),
              Block(
                List(
                  ValDef(
                    Modifiers(Local),
                    TermName("u"),
                    TypeName("User"),
                    Apply(
                      Ident("User"),
                      List(
                        Literal(Constant(42L)),
                        Literal(Constant("Maya"))
                      )
                    )
                  )
                ),
                Apply(
                  Ident("println"),
                  List(
                    Apply(
                      Ident("greet"),
                      List(Ident("u"))
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  )
)
```

## 3) Notes on Realism

- **`PackageDef`**, **`ClassDef`**, **`ModuleDef`**, **`DefDef`**, **`ValDef`**, **`Apply`**, **`Select`**, **`If`**, and **`Literal`** are standard AST node shapes in Scala tooling.
- **String interpolation** is represented as a `StringContext(...).s(...)` call.
- **Case class** generates additional synthetic members (not shown for brevity).

If you want the exact AST from a specific Scala version (e.g., Scala 2.13), tell me which compiler or tool you want (e.g., `scalac -Xprint:typer`).
