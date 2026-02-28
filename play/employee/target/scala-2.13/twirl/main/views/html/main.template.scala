
package views.html

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

object main extends _root_.play.twirl.api.BaseScalaTemplate[play.twirl.api.HtmlFormat.Appendable,_root_.play.twirl.api.Format[play.twirl.api.HtmlFormat.Appendable]](play.twirl.api.HtmlFormat) with _root_.play.twirl.api.Template4[String,Html,play.api.mvc.RequestHeader,play.api.i18n.Messages,play.twirl.api.HtmlFormat.Appendable] {

  /**/
  def apply/*1.2*/(title: String)(content: Html)(implicit request: play.api.mvc.RequestHeader, messages: play.api.i18n.Messages):play.twirl.api.HtmlFormat.Appendable = {
    _display_ {
      {


Seq[Any](format.raw/*2.1*/("""
"""),format.raw/*3.1*/("""<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>"""),_display_(/*8.13*/title),format.raw/*8.18*/("""</title>
    <style>
      body """),format.raw/*10.12*/("""{"""),format.raw/*10.13*/(""" """),format.raw/*10.14*/("""font-family: Arial, sans-serif; margin: 2rem auto; max-width: 900px; line-height: 1.45; """),format.raw/*10.102*/("""}"""),format.raw/*10.103*/("""
      """),format.raw/*11.7*/("""table """),format.raw/*11.13*/("""{"""),format.raw/*11.14*/(""" """),format.raw/*11.15*/("""border-collapse: collapse; width: 100%; margin-top: 1rem; """),format.raw/*11.73*/("""}"""),format.raw/*11.74*/("""
      """),format.raw/*12.7*/("""th, td """),format.raw/*12.14*/("""{"""),format.raw/*12.15*/(""" """),format.raw/*12.16*/("""border: 1px solid #ddd; padding: 0.5rem; text-align: left; """),format.raw/*12.75*/("""}"""),format.raw/*12.76*/("""
      """),format.raw/*13.7*/(""".actions """),format.raw/*13.16*/("""{"""),format.raw/*13.17*/(""" """),format.raw/*13.18*/("""display: flex; gap: 0.5rem; """),format.raw/*13.46*/("""}"""),format.raw/*13.47*/("""
      """),format.raw/*14.7*/(""".flash """),format.raw/*14.14*/("""{"""),format.raw/*14.15*/(""" """),format.raw/*14.16*/("""padding: 0.75rem; margin: 1rem 0; background: #e6ffed; border: 1px solid #b7ebc6; """),format.raw/*14.98*/("""}"""),format.raw/*14.99*/("""
      """),format.raw/*15.7*/(""".error """),format.raw/*15.14*/("""{"""),format.raw/*15.15*/(""" """),format.raw/*15.16*/("""color: #b00020; margin: 0.25rem 0; """),format.raw/*15.51*/("""}"""),format.raw/*15.52*/("""
      """),format.raw/*16.7*/(""".field """),format.raw/*16.14*/("""{"""),format.raw/*16.15*/(""" """),format.raw/*16.16*/("""margin: 0.75rem 0; """),format.raw/*16.35*/("""}"""),format.raw/*16.36*/("""
      """),format.raw/*17.7*/("""input """),format.raw/*17.13*/("""{"""),format.raw/*17.14*/(""" """),format.raw/*17.15*/("""padding: 0.5rem; width: 100%; max-width: 380px; """),format.raw/*17.63*/("""}"""),format.raw/*17.64*/("""
      """),format.raw/*18.7*/("""button, .button-link """),format.raw/*18.28*/("""{"""),format.raw/*18.29*/("""
        """),format.raw/*19.9*/("""display: inline-block;
        padding: 0.4rem 0.7rem;
        background: #0057d8;
        color: #fff;
        border: none;
        text-decoration: none;
        cursor: pointer;
      """),format.raw/*26.7*/("""}"""),format.raw/*26.8*/("""
      """),format.raw/*27.7*/(""".button-link.secondary """),format.raw/*27.30*/("""{"""),format.raw/*27.31*/(""" """),format.raw/*27.32*/("""background: #4b5563; """),format.raw/*27.53*/("""}"""),format.raw/*27.54*/("""
      """),format.raw/*28.7*/("""form.inline """),format.raw/*28.19*/("""{"""),format.raw/*28.20*/(""" """),format.raw/*28.21*/("""display: inline; """),format.raw/*28.38*/("""}"""),format.raw/*28.39*/("""
    """),format.raw/*29.5*/("""</style>
  </head>
  <body>
    """),_display_(/*32.6*/request/*32.13*/.flash.get("success").map/*32.38*/ { msg =>_display_(Seq[Any](format.raw/*32.47*/("""
      """),format.raw/*33.7*/("""<div class="flash">"""),_display_(/*33.27*/msg),format.raw/*33.30*/("""</div>
    """)))}),format.raw/*34.6*/("""
    """),_display_(/*35.6*/content),format.raw/*35.13*/("""
  """),format.raw/*36.3*/("""</body>
</html>
"""))
      }
    }
  }

  def render(title:String,content:Html,request:play.api.mvc.RequestHeader,messages:play.api.i18n.Messages): play.twirl.api.HtmlFormat.Appendable = apply(title)(content)(request,messages)

  def f:((String) => (Html) => (play.api.mvc.RequestHeader,play.api.i18n.Messages) => play.twirl.api.HtmlFormat.Appendable) = (title) => (content) => (request,messages) => apply(title)(content)(request,messages)

  def ref: this.type = this

}


              /*
                  -- GENERATED --
                  SOURCE: app/views/main.scala.html
                  HASH: 33a92eed3970a55c7cbadd291f168fff9dca8732
                  MATRIX: 783->1|987->112|1014->113|1198->271|1223->276|1283->308|1312->309|1341->310|1458->398|1488->399|1522->406|1556->412|1585->413|1614->414|1700->472|1729->473|1763->480|1798->487|1827->488|1856->489|1943->548|1972->549|2006->556|2043->565|2072->566|2101->567|2157->595|2186->596|2220->603|2255->610|2284->611|2313->612|2423->694|2452->695|2486->702|2521->709|2550->710|2579->711|2642->746|2671->747|2705->754|2740->761|2769->762|2798->763|2845->782|2874->783|2908->790|2942->796|2971->797|3000->798|3076->846|3105->847|3139->854|3188->875|3217->876|3253->885|3469->1074|3497->1075|3531->1082|3582->1105|3611->1106|3640->1107|3689->1128|3718->1129|3752->1136|3792->1148|3821->1149|3850->1150|3895->1167|3924->1168|3956->1173|4015->1206|4031->1213|4065->1238|4112->1247|4146->1254|4193->1274|4217->1277|4259->1289|4291->1295|4319->1302|4349->1305
                  LINES: 21->1|26->2|27->3|32->8|32->8|34->10|34->10|34->10|34->10|34->10|35->11|35->11|35->11|35->11|35->11|35->11|36->12|36->12|36->12|36->12|36->12|36->12|37->13|37->13|37->13|37->13|37->13|37->13|38->14|38->14|38->14|38->14|38->14|38->14|39->15|39->15|39->15|39->15|39->15|39->15|40->16|40->16|40->16|40->16|40->16|40->16|41->17|41->17|41->17|41->17|41->17|41->17|42->18|42->18|42->18|43->19|50->26|50->26|51->27|51->27|51->27|51->27|51->27|51->27|52->28|52->28|52->28|52->28|52->28|52->28|53->29|56->32|56->32|56->32|56->32|57->33|57->33|57->33|58->34|59->35|59->35|60->36
                  -- GENERATED --
              */
          