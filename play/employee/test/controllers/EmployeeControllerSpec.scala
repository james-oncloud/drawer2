package controllers

import models.EmployeeData
import org.scalatest.concurrent.ScalaFutures
import org.scalatestplus.play.PlaySpec
import play.api.test.CSRFTokenHelper._
import play.api.test.Helpers._
import play.api.test.{CSRFTokenHelper, FakeRequest}
import repository.EmployeeRepository

import scala.concurrent.ExecutionContext

class EmployeeControllerSpec extends PlaySpec with ScalaFutures {

  implicit private val ec: ExecutionContext = ExecutionContext.global

  private def buildController(repo: EmployeeRepository): EmployeeController =
    new EmployeeController(stubMessagesControllerComponents(), repo)

  "EmployeeController.list" should {
    "render employees from repository" in {
      val repo = new EmployeeRepository()
      whenReady(repo.create(EmployeeData("Alice", "alice@example.com", "Engineering")))(_ => ())
      val controller = buildController(repo)

      val result = controller.list.apply(FakeRequest(GET, "/employees").withCSRFToken)

      status(result) mustBe OK
      contentAsString(result) must include("Alice")
      contentAsString(result) must include("Employees")
    }
  }

  "EmployeeController.create" should {
    "create employee and redirect on valid form submission" in {
      val repo = new EmployeeRepository()
      val controller = buildController(repo)

      val request = CSRFTokenHelper.addCSRFToken(
        FakeRequest(POST, "/employees").withFormUrlEncodedBody(
          "name" -> "Bob",
          "email" -> "bob@example.com",
          "department" -> "Sales"
        )
      )

      val result = controller.create.apply(request)

      status(result) mustBe SEE_OTHER
      redirectLocation(result) mustBe Some("/")
      whenReady(repo.listAll())(_.map(_.name) mustBe Seq("Bob"))
    }

    "return bad request on invalid form submission" in {
      val repo = new EmployeeRepository()
      val controller = buildController(repo)

      val request = CSRFTokenHelper.addCSRFToken(
        FakeRequest(POST, "/employees").withFormUrlEncodedBody(
          "name" -> "",
          "email" -> "invalid-email",
          "department" -> ""
        )
      )

      val result = controller.create.apply(request)

      status(result) mustBe BAD_REQUEST
      whenReady(repo.listAll())(_ mustBe empty)
    }
  }

  "EmployeeController.update and delete" should {
    "update and delete an existing employee" in {
      val repo = new EmployeeRepository()
      val id = whenReady(repo.create(EmployeeData("Carol", "carol@example.com", "HR")))(_.id)
      val controller = buildController(repo)

      val updateRequest = CSRFTokenHelper.addCSRFToken(
        FakeRequest(POST, s"/employees/$id").withFormUrlEncodedBody(
          "name" -> "Carol Jones",
          "email" -> "carol.jones@example.com",
          "department" -> "People Ops"
        )
      )
      val updateResult = controller.update(id).apply(updateRequest)

      status(updateResult) mustBe SEE_OTHER
      whenReady(repo.findById(id)) { maybeEmployee =>
        maybeEmployee.map(_.name) mustBe Some("Carol Jones")
      }

      val deleteRequest = CSRFTokenHelper.addCSRFToken(FakeRequest(POST, s"/employees/$id/delete"))
      val deleteResult = controller.delete(id).apply(deleteRequest)

      status(deleteResult) mustBe SEE_OTHER
      whenReady(repo.findById(id))(_ mustBe None)
    }

    "return not found when editing a missing employee" in {
      val repo = new EmployeeRepository()
      val controller = buildController(repo)

      val result = controller.editForm(999L).apply(FakeRequest(GET, "/employees/999/edit"))

      status(result) mustBe NOT_FOUND
    }
  }
}
