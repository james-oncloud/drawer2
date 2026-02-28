
package views.html.employees

import _root_.play.twirl.api.TwirlFeatureImports._
import _root_.play.twirl.api.TwirlHelperImports._
import _root_.play.twirl.api.Html
import _root_.play.twirl.api.JavaScript
import _root_.play.twirl.api.Txt
import _root_.play.twirl.api.Xml
import models._
import controllers._
import play.api.i18n._
import views.html._
import play.api.templates.PlayMagic._
import play.api.mvc._
import play.api.data._

object create extends _root_.play.twirl.api.BaseScalaTemplate[play.twirl.api.HtmlFormat.Appendable,_root_.play.twirl.api.Format[play.twirl.api.HtmlFormat.Appendable]](play.twirl.api.HtmlFormat) with _root_.play.twirl.api.Template3[play.api.data.Form[models.EmployeeData],play.api.mvc.RequestHeader,play.api.i18n.Messages,play.twirl.api.HtmlFormat.Appendable] {

  /**/
  def apply/*1.2*/(employeeForm: play.api.data.Form[models.EmployeeData])(implicit request: play.api.mvc.RequestHeader, messages: play.api.i18n.Messages):play.twirl.api.HtmlFormat.Appendable = {
    _display_ {
      {


Seq[Any](format.raw/*2.1*/("""
"""),_display_(/*3.2*/main("Create Employee")/*3.25*/ {_display_(Seq[Any](format.raw/*3.27*/("""
  """),format.raw/*4.3*/("""<h1>Create Employee</h1>

  """),_display_(/*6.4*/helper/*6.10*/.form(action = routes.EmployeeController.create)/*6.58*/ {_display_(Seq[Any](format.raw/*6.60*/("""
    """),_display_(/*7.6*/helper/*7.12*/.CSRF.formField),format.raw/*7.27*/("""

    """),format.raw/*9.5*/("""<div class="field">
      """),_display_(/*10.8*/helper/*10.14*/.inputText(employeeForm("name"), Symbol("placeholder") -> "Name")),format.raw/*10.79*/("""
    """),format.raw/*11.5*/("""</div>
    <div class="field">
      """),_display_(/*13.8*/helper/*13.14*/.inputText(employeeForm("email"), Symbol("placeholder") -> "Email")),format.raw/*13.81*/("""
    """),format.raw/*14.5*/("""</div>
    <div class="field">
      """),_display_(/*16.8*/helper/*16.14*/.inputText(employeeForm("department"), Symbol("placeholder") -> "Department")),format.raw/*16.91*/("""
    """),format.raw/*17.5*/("""</div>
    <button type="submit">Save</button>
  """)))}),format.raw/*19.4*/("""

  """),format.raw/*21.3*/("""<p>
    <a class="button-link secondary" href=""""),_display_(/*22.45*/routes/*22.51*/.EmployeeController.list),format.raw/*22.75*/("""">Back to list</a>
  </p>
""")))}),format.raw/*24.2*/("""
"""))
      }
    }
  }

  def render(employeeForm:play.api.data.Form[models.EmployeeData],request:play.api.mvc.RequestHeader,messages:play.api.i18n.Messages): play.twirl.api.HtmlFormat.Appendable = apply(employeeForm)(request,messages)

  def f:((play.api.data.Form[models.EmployeeData]) => (play.api.mvc.RequestHeader,play.api.i18n.Messages) => play.twirl.api.HtmlFormat.Appendable) = (employeeForm) => (request,messages) => apply(employeeForm)(request,messages)

  def ref: this.type = this

}


              /*
                  -- GENERATED --
                  SOURCE: app/views/employees/create.scala.html
                  HASH: 62b2403fc79da8eab4631d0654bb223b2a303f75
                  MATRIX: 823->1|1052->137|1079->139|1110->162|1149->164|1178->167|1232->196|1246->202|1302->250|1341->252|1372->258|1386->264|1421->279|1453->285|1506->312|1521->318|1607->383|1639->388|1703->426|1718->432|1806->499|1838->504|1902->542|1917->548|2015->625|2047->630|2127->680|2158->684|2233->732|2248->738|2293->762|2350->789
                  LINES: 21->1|26->2|27->3|27->3|27->3|28->4|30->6|30->6|30->6|30->6|31->7|31->7|31->7|33->9|34->10|34->10|34->10|35->11|37->13|37->13|37->13|38->14|40->16|40->16|40->16|41->17|43->19|45->21|46->22|46->22|46->22|48->24
                  -- GENERATED --
              */
          