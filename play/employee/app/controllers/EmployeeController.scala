package controllers

import javax.inject._
import models.{Employee, EmployeeData}
import play.api.data._
import play.api.data.Forms._
import play.api.mvc._
import repository.EmployeeRepository

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class EmployeeController @Inject() (
    cc: MessagesControllerComponents,
    employeeRepository: EmployeeRepository
)(implicit ec: ExecutionContext)
    extends MessagesAbstractController(cc) {

  private val employeeForm: Form[EmployeeData] = Form(
    mapping(
      "name" -> nonEmptyText(maxLength = 100),
      "email" -> email,
      "department" -> nonEmptyText(maxLength = 100)
    )(EmployeeData.apply)(EmployeeData.unapply)
  )

  def list: Action[AnyContent] = Action.async { implicit request =>
    employeeRepository.listAll().map { employees =>
      Ok(views.html.employees.list(employees))
    }
  }

  def createForm: Action[AnyContent] = Action { implicit request =>
    Ok(views.html.employees.create(employeeForm))
  }

  def create: Action[AnyContent] = Action.async { implicit request =>
    employeeForm.bindFromRequest().fold(
      formWithErrors => Future.successful(BadRequest(views.html.employees.create(formWithErrors))),
      data =>
        employeeRepository.create(data).map { _ =>
          Redirect(routes.EmployeeController.list)
            .flashing("success" -> "Employee created successfully.")
        }
    )
  }

  def editForm(id: Long): Action[AnyContent] = Action.async { implicit request =>
    employeeRepository.findById(id).map {
      case Some(employee) =>
        val filledForm = employeeForm.fill(toData(employee))
        Ok(views.html.employees.edit(id, filledForm))
      case None =>
        NotFound(s"Employee with id=$id not found.")
    }
  }

  def update(id: Long): Action[AnyContent] = Action.async { implicit request =>
    employeeForm.bindFromRequest().fold(
      formWithErrors => Future.successful(BadRequest(views.html.employees.edit(id, formWithErrors))),
      data =>
        employeeRepository.update(id, data).map {
          case Some(_) =>
            Redirect(routes.EmployeeController.list)
              .flashing("success" -> "Employee updated successfully.")
          case None =>
            NotFound(s"Employee with id=$id not found.")
        }
    )
  }

  def delete(id: Long): Action[AnyContent] = Action.async { implicit request =>
    employeeRepository.delete(id).map { _ =>
      Redirect(routes.EmployeeController.list)
        .flashing("success" -> "Employee deleted successfully.")
    }
  }

  private def toData(employee: Employee): EmployeeData =
    EmployeeData(employee.name, employee.email, employee.department)
}
