package repository

import models.EmployeeData
import org.scalatest.concurrent.ScalaFutures
import org.scalatestplus.play.PlaySpec

import scala.concurrent.ExecutionContext

class EmployeeRepositorySpec extends PlaySpec with ScalaFutures {

  implicit private val ec: ExecutionContext = ExecutionContext.global

  "EmployeeRepository" should {
    "create and list employees in insertion order by id" in {
      val repo = new EmployeeRepository()

      whenReady(repo.create(EmployeeData("Alice", "alice@example.com", "Engineering"))) { first =>
        first.id mustBe 1L
      }

      whenReady(repo.create(EmployeeData("Bob", "bob@example.com", "Sales"))) { second =>
        second.id mustBe 2L
      }

      whenReady(repo.listAll()) { employees =>
        employees.map(_.id) mustBe Seq(1L, 2L)
        employees.map(_.name) mustBe Seq("Alice", "Bob")
      }
    }

    "update an existing employee and return None for missing id" in {
      val repo = new EmployeeRepository()

      val employeeId = whenReady(repo.create(EmployeeData("Alice", "alice@example.com", "Engineering")))(_.id)

      whenReady(repo.update(employeeId, EmployeeData("Alice Smith", "alice.smith@example.com", "Platform"))) {
        maybeUpdated =>
          maybeUpdated.map(_.name) mustBe Some("Alice Smith")
          maybeUpdated.map(_.department) mustBe Some("Platform")
      }

      whenReady(repo.update(999L, EmployeeData("Nobody", "nobody@example.com", "None"))) { maybeMissing =>
        maybeMissing mustBe None
      }
    }

    "delete an employee and report delete result correctly" in {
      val repo = new EmployeeRepository()

      val employeeId = whenReady(repo.create(EmployeeData("Carol", "carol@example.com", "HR")))(_.id)

      whenReady(repo.delete(employeeId)) { deleted =>
        deleted mustBe true
      }

      whenReady(repo.findById(employeeId)) { maybeEmployee =>
        maybeEmployee mustBe None
      }

      whenReady(repo.delete(employeeId)) { deletedAgain =>
        deletedAgain mustBe false
      }
    }
  }
}
