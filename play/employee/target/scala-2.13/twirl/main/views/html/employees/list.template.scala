
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

object list extends _root_.play.twirl.api.BaseScalaTemplate[play.twirl.api.HtmlFormat.Appendable,_root_.play.twirl.api.Format[play.twirl.api.HtmlFormat.Appendable]](play.twirl.api.HtmlFormat) with _root_.play.twirl.api.Template3[Seq[models.Employee],play.api.mvc.RequestHeader,play.api.i18n.Messages,play.twirl.api.HtmlFormat.Appendable] {

  /**/
  def apply/*1.2*/(employees: Seq[models.Employee])(implicit request: play.api.mvc.RequestHeader, messages: play.api.i18n.Messages):play.twirl.api.HtmlFormat.Appendable = {
    _display_ {
      {


Seq[Any](format.raw/*2.1*/("""
"""),_display_(/*3.2*/main("Employees")/*3.19*/ {_display_(Seq[Any](format.raw/*3.21*/("""
  """),format.raw/*4.3*/("""<h1>Employees</h1>
  <a class="button-link" href=""""),_display_(/*5.33*/routes/*5.39*/.EmployeeController.createForm),format.raw/*5.69*/("""">Create Employee</a>

  """),_display_(if(employees.isEmpty)/*7.25*/ {_display_(Seq[Any](format.raw/*7.27*/("""
    """),format.raw/*8.5*/("""<p>No employees found.</p>
  """)))}else/*9.10*/{_display_(Seq[Any](format.raw/*9.11*/("""
    """),format.raw/*10.5*/("""<table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Department</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
      """),_display_(/*21.8*/for(employee <- employees) yield /*21.34*/ {_display_(Seq[Any](format.raw/*21.36*/("""
        """),format.raw/*22.9*/("""<tr>
          <td>"""),_display_(/*23.16*/employee/*23.24*/.id),format.raw/*23.27*/("""</td>
          <td>"""),_display_(/*24.16*/employee/*24.24*/.name),format.raw/*24.29*/("""</td>
          <td>"""),_display_(/*25.16*/employee/*25.24*/.email),format.raw/*25.30*/("""</td>
          <td>"""),_display_(/*26.16*/employee/*26.24*/.department),format.raw/*26.35*/("""</td>
          <td class="actions">
            <a class="button-link secondary" href=""""),_display_(/*28.53*/routes/*28.59*/.EmployeeController.editForm(employee.id)),format.raw/*28.100*/("""">Edit</a>
            <form class="inline" method="post" action=""""),_display_(/*29.57*/routes/*29.63*/.EmployeeController.delete(employee.id)),format.raw/*29.102*/("""">
              """),_display_(/*30.16*/helper/*30.22*/.CSRF.formField),format.raw/*30.37*/("""
              """),format.raw/*31.15*/("""<button type="submit">Delete</button>
            </form>
          </td>
        </tr>
      """)))}),format.raw/*35.8*/("""
      """),format.raw/*36.7*/("""</tbody>
    </table>
  """)))}),format.raw/*38.4*/("""
""")))}),format.raw/*39.2*/("""
"""))
      }
    }
  }

  def render(employees:Seq[models.Employee],request:play.api.mvc.RequestHeader,messages:play.api.i18n.Messages): play.twirl.api.HtmlFormat.Appendable = apply(employees)(request,messages)

  def f:((Seq[models.Employee]) => (play.api.mvc.RequestHeader,play.api.i18n.Messages) => play.twirl.api.HtmlFormat.Appendable) = (employees) => (request,messages) => apply(employees)(request,messages)

  def ref: this.type = this

}


              /*
                  -- GENERATED --
                  SOURCE: app/views/employees/list.scala.html
                  HASH: f6023f795e438724df541935d9a49ffecf768821
                  MATRIX: 802->1|1009->115|1036->117|1061->134|1100->136|1129->139|1206->190|1220->196|1270->226|1343->273|1382->275|1413->280|1465->316|1503->317|1535->322|1774->535|1816->561|1856->563|1892->572|1939->592|1956->600|1980->603|2028->624|2045->632|2071->637|2119->658|2136->666|2163->672|2211->693|2228->701|2260->712|2376->801|2391->807|2454->848|2548->915|2563->921|2624->960|2669->978|2684->984|2720->999|2763->1014|2888->1109|2922->1116|2977->1141|3009->1143
                  LINES: 21->1|26->2|27->3|27->3|27->3|28->4|29->5|29->5|29->5|31->7|31->7|32->8|33->9|33->9|34->10|45->21|45->21|45->21|46->22|47->23|47->23|47->23|48->24|48->24|48->24|49->25|49->25|49->25|50->26|50->26|50->26|52->28|52->28|52->28|53->29|53->29|53->29|54->30|54->30|54->30|55->31|59->35|60->36|62->38|63->39
                  -- GENERATED --
              */
          