// @GENERATOR:play-routes-compiler
// @SOURCE:conf/routes

package router

import play.core.routing._
import play.core.routing.HandlerInvokerFactory._

import play.api.mvc._

import _root_.controllers.Assets.Asset

class Routes(
  override val errorHandler: play.api.http.HttpErrorHandler, 
  // @LINE:1
  EmployeeController_0: controllers.EmployeeController,
  val prefix: String
) extends GeneratedRouter {

  @javax.inject.Inject()
  def this(errorHandler: play.api.http.HttpErrorHandler,
    // @LINE:1
    EmployeeController_0: controllers.EmployeeController
  ) = this(errorHandler, EmployeeController_0, "/")

  def withPrefix(addPrefix: String): Routes = {
    val prefix = play.api.routing.Router.concatPrefix(addPrefix, this.prefix)
    router.RoutesPrefix.setPrefix(prefix)
    new Routes(errorHandler, EmployeeController_0, prefix)
  }

  private val defaultPrefix: String = {
    if (this.prefix.endsWith("/")) "" else "/"
  }

  def documentation = List(
    ("""GET""", this.prefix, """controllers.EmployeeController.list"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """employees""", """controllers.EmployeeController.list"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """employees/new""", """controllers.EmployeeController.createForm"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """employees""", """controllers.EmployeeController.create"""),
    ("""GET""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """employees/""" + "$" + """id<[^/]+>/edit""", """controllers.EmployeeController.editForm(id:Long)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """employees/""" + "$" + """id<[^/]+>""", """controllers.EmployeeController.update(id:Long)"""),
    ("""POST""", this.prefix + (if(this.prefix.endsWith("/")) "" else "/") + """employees/""" + "$" + """id<[^/]+>/delete""", """controllers.EmployeeController.delete(id:Long)"""),
    Nil
  ).foldLeft(Seq.empty[(String, String, String)]) { (s,e) => e.asInstanceOf[Any] match {
    case r @ (_,_,_) => s :+ r.asInstanceOf[(String, String, String)]
    case l => s ++ l.asInstanceOf[List[(String, String, String)]]
  }}


  // @LINE:1
  private lazy val controllers_EmployeeController_list0_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix)))
  )
  private lazy val controllers_EmployeeController_list0_invoker = createInvoker(
    EmployeeController_0.list,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.EmployeeController",
      "list",
      Nil,
      "GET",
      this.prefix + """""",
      """""",
      Seq()
    )
  )

  // @LINE:2
  private lazy val controllers_EmployeeController_list1_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("employees")))
  )
  private lazy val controllers_EmployeeController_list1_invoker = createInvoker(
    EmployeeController_0.list,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.EmployeeController",
      "list",
      Nil,
      "GET",
      this.prefix + """employees""",
      """""",
      Seq()
    )
  )

  // @LINE:3
  private lazy val controllers_EmployeeController_createForm2_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("employees/new")))
  )
  private lazy val controllers_EmployeeController_createForm2_invoker = createInvoker(
    EmployeeController_0.createForm,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.EmployeeController",
      "createForm",
      Nil,
      "GET",
      this.prefix + """employees/new""",
      """""",
      Seq()
    )
  )

  // @LINE:4
  private lazy val controllers_EmployeeController_create3_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("employees")))
  )
  private lazy val controllers_EmployeeController_create3_invoker = createInvoker(
    EmployeeController_0.create,
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.EmployeeController",
      "create",
      Nil,
      "POST",
      this.prefix + """employees""",
      """""",
      Seq()
    )
  )

  // @LINE:5
  private lazy val controllers_EmployeeController_editForm4_route = Route("GET",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("employees/"), DynamicPart("id", """[^/]+""", encodeable=true), StaticPart("/edit")))
  )
  private lazy val controllers_EmployeeController_editForm4_invoker = createInvoker(
    EmployeeController_0.editForm(fakeValue[Long]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.EmployeeController",
      "editForm",
      Seq(classOf[Long]),
      "GET",
      this.prefix + """employees/""" + "$" + """id<[^/]+>/edit""",
      """""",
      Seq()
    )
  )

  // @LINE:6
  private lazy val controllers_EmployeeController_update5_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("employees/"), DynamicPart("id", """[^/]+""", encodeable=true)))
  )
  private lazy val controllers_EmployeeController_update5_invoker = createInvoker(
    EmployeeController_0.update(fakeValue[Long]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.EmployeeController",
      "update",
      Seq(classOf[Long]),
      "POST",
      this.prefix + """employees/""" + "$" + """id<[^/]+>""",
      """""",
      Seq()
    )
  )

  // @LINE:7
  private lazy val controllers_EmployeeController_delete6_route = Route("POST",
    PathPattern(List(StaticPart(this.prefix), StaticPart(this.defaultPrefix), StaticPart("employees/"), DynamicPart("id", """[^/]+""", encodeable=true), StaticPart("/delete")))
  )
  private lazy val controllers_EmployeeController_delete6_invoker = createInvoker(
    EmployeeController_0.delete(fakeValue[Long]),
    play.api.routing.HandlerDef(this.getClass.getClassLoader,
      "router",
      "controllers.EmployeeController",
      "delete",
      Seq(classOf[Long]),
      "POST",
      this.prefix + """employees/""" + "$" + """id<[^/]+>/delete""",
      """""",
      Seq()
    )
  )


  def routes: PartialFunction[RequestHeader, Handler] = {
  
    // @LINE:1
    case controllers_EmployeeController_list0_route(params@_) =>
      call { 
        controllers_EmployeeController_list0_invoker.call(EmployeeController_0.list)
      }
  
    // @LINE:2
    case controllers_EmployeeController_list1_route(params@_) =>
      call { 
        controllers_EmployeeController_list1_invoker.call(EmployeeController_0.list)
      }
  
    // @LINE:3
    case controllers_EmployeeController_createForm2_route(params@_) =>
      call { 
        controllers_EmployeeController_createForm2_invoker.call(EmployeeController_0.createForm)
      }
  
    // @LINE:4
    case controllers_EmployeeController_create3_route(params@_) =>
      call { 
        controllers_EmployeeController_create3_invoker.call(EmployeeController_0.create)
      }
  
    // @LINE:5
    case controllers_EmployeeController_editForm4_route(params@_) =>
      call(params.fromPath[Long]("id", None)) { (id) =>
        controllers_EmployeeController_editForm4_invoker.call(EmployeeController_0.editForm(id))
      }
  
    // @LINE:6
    case controllers_EmployeeController_update5_route(params@_) =>
      call(params.fromPath[Long]("id", None)) { (id) =>
        controllers_EmployeeController_update5_invoker.call(EmployeeController_0.update(id))
      }
  
    // @LINE:7
    case controllers_EmployeeController_delete6_route(params@_) =>
      call(params.fromPath[Long]("id", None)) { (id) =>
        controllers_EmployeeController_delete6_invoker.call(EmployeeController_0.delete(id))
      }
  }
}
