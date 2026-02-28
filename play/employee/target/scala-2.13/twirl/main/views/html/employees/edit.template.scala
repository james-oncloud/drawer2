
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

object edit extends _root_.play.twirl.api.BaseScalaTemplate[play.twirl.api.HtmlFormat.Appendable,_root_.play.twirl.api.Format[play.twirl.api.HtmlFormat.Appendable]](play.twirl.api.HtmlFormat) with _root_.play.twirl.api.Template4[Long,play.api.data.Form[models.EmployeeData],play.api.mvc.RequestHeader,play.api.i18n.Messages,play.twirl.api.HtmlFormat.Appendable] {

  /**/
  def apply/*1.2*/(id: Long, employeeForm: play.api.data.Form[models.EmployeeData])(implicit request: play.api.mvc.RequestHeader, messages: play.api.i18n.Messages):play.twirl.api.HtmlFormat.Appendable = {
    _display_ {
      {


Seq[Any](format.raw/*2.1*/("""
"""),_display_(/*3.2*/main("Edit Employee")/*3.23*/ {_display_(Seq[Any](format.raw/*3.25*/("""
  """),format.raw/*4.3*/("""<h1>Edit Employee</h1>

  """),_display_(/*6.4*/helper/*6.10*/.form(action = routes.EmployeeController.update(id))/*6.62*/ {_display_(Seq[Any](format.raw/*6.64*/("""
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
    <button type="submit">Update</button>
  """)))}),format.raw/*19.4*/("""

  """),format.raw/*21.3*/("""<p>
    <a class="button-link secondary" href=""""),_display_(/*22.45*/routes/*22.51*/.EmployeeController.list),format.raw/*22.75*/("""">Back to list</a>
  </p>
""")))}),format.raw/*24.2*/("""
"""))
      }
    }
  }

  def render(id:Long,employeeForm:play.api.data.Form[models.EmployeeData],request:play.api.mvc.RequestHeader,messages:play.api.i18n.Messages): play.twirl.api.HtmlFormat.Appendable = apply(id,employeeForm)(request,messages)

  def f:((Long,play.api.data.Form[models.EmployeeData]) => (play.api.mvc.RequestHeader,play.api.i18n.Messages) => play.twirl.api.HtmlFormat.Appendable) = (id,employeeForm) => (request,messages) => apply(id,employeeForm)(request,messages)

  def ref: this.type = this

}


              /*
                  -- GENERATED --
                  SOURCE: app/views/employees/edit.scala.html
                  HASH: 478ab1bed5abcf3bdfbcdd70d26a3fe92fe58ba9
                  MATRIX: 826->1|1065->147|1092->149|1121->170|1160->172|1189->175|1241->202|1255->208|1315->260|1354->262|1385->268|1399->274|1434->289|1466->295|1519->322|1534->328|1620->393|1652->398|1716->436|1731->442|1819->509|1851->514|1915->552|1930->558|2028->635|2060->640|2142->692|2173->696|2248->744|2263->750|2308->774|2365->801
                  LINES: 21->1|26->2|27->3|27->3|27->3|28->4|30->6|30->6|30->6|30->6|31->7|31->7|31->7|33->9|34->10|34->10|34->10|35->11|37->13|37->13|37->13|38->14|40->16|40->16|40->16|41->17|43->19|45->21|46->22|46->22|46->22|48->24
                  -- GENERATED --
              */
          