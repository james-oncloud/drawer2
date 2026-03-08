package controllers

import org.scalatestplus.play._
import play.api.libs.json.Json
import play.api.test.Helpers._
import play.api.test.{FakeRequest, Injecting}

class CourseControllerSpec extends PlaySpec with GuiceOneAppPerSuite with Injecting {

  "CourseController" should {
    "create and list courses" in {
      val createRequest = FakeRequest(POST, "/api/courses")
        .withJsonBody(
          Json.obj(
            "title" -> "Functional Programming",
            "level" -> "Beginner",
            "tags" -> Json.arr("scala", "fp"),
            "metadata" -> Json.obj("source" -> "book")
          )
        )

      val createResult = route(app, createRequest).get
      status(createResult) mustBe CREATED

      val listResult = route(app, FakeRequest(GET, "/api/courses")).get
      status(listResult) mustBe OK
    }
  }
}
