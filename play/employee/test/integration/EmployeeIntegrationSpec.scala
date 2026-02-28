package integration

import org.scalatest.concurrent.ScalaFutures
import org.scalatestplus.play.PlaySpec
import org.scalatestplus.play.guice.GuiceOneAppPerTest
import play.api.test.Helpers._
import play.api.test.CSRFTokenHelper._
import play.api.test.FakeRequest
import repository.EmployeeRepository

class EmployeeIntegrationSpec extends PlaySpec with GuiceOneAppPerTest with ScalaFutures {

  "Employee integration flow" should {
    "serve the list page with no employees initially" in {
      val request = FakeRequest(GET, "/employees")
      val result = route(app, request).get

      status(result) mustBe OK
      contentAsString(result) must include("Employees")
    }

    "create, update, and delete an employee through HTTP routes" in {
      val createRequest =
        FakeRequest(POST, "/employees")
          .withFormUrlEncodedBody(
          "name" -> "Integration User",
          "email" -> "integration@example.com",
          "department" -> "QA"
        )
          .withCSRFToken
      val createResult = route(app, createRequest).get

      status(createResult) mustBe SEE_OTHER
      redirectLocation(createResult) must (be(Some("/")) or be(Some("/employees")))

      val listAfterCreate = route(app, FakeRequest(GET, "/employees")).get
      status(listAfterCreate) mustBe OK
      contentAsString(listAfterCreate) must include("Integration User")

      val repo = app.injector.instanceOf[EmployeeRepository]
      val employeeId = whenReady(repo.listAll()) { employees =>
        employees must not be empty
        employees.head.id
      }

      val updateRequest =
        FakeRequest(POST, s"/employees/$employeeId")
          .withFormUrlEncodedBody(
          "name" -> "Integration User Updated",
          "email" -> "integration.updated@example.com",
          "department" -> "Platform"
        )
          .withCSRFToken
      val updateResult = route(app, updateRequest).get

      status(updateResult) mustBe SEE_OTHER

      val listAfterUpdate = route(app, FakeRequest(GET, "/employees")).get
      contentAsString(listAfterUpdate) must include("Integration User Updated")

      val deleteRequest = FakeRequest(POST, s"/employees/$employeeId/delete").withCSRFToken
      val deleteResult = route(app, deleteRequest).get

      status(deleteResult) mustBe SEE_OTHER

      val listAfterDelete = route(app, FakeRequest(GET, "/employees")).get
      contentAsString(listAfterDelete) must include("No employees found.")
    }
  }
}
