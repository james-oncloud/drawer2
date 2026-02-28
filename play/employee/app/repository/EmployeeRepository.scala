package repository

import javax.inject.{Inject, Singleton}
import models.{Employee, EmployeeData}

import scala.collection.concurrent.TrieMap
import scala.concurrent.{ExecutionContext, Future}
import java.util.concurrent.atomic.AtomicLong

@Singleton
class EmployeeRepository @Inject() (implicit ec: ExecutionContext) {
  private val idSequence = new AtomicLong(0L)
  private val employees = TrieMap.empty[Long, Employee]

  def listAll(): Future[Seq[Employee]] =
    Future.successful(employees.values.toSeq.sortBy(_.id))

  def findById(id: Long): Future[Option[Employee]] =
    Future.successful(employees.get(id))

  def create(data: EmployeeData): Future[Employee] = Future.successful {
    val id = idSequence.incrementAndGet()
    val employee = Employee(id, data.name.trim, data.email.trim, data.department.trim)
    employees.put(id, employee)
    employee
  }

  def update(id: Long, data: EmployeeData): Future[Option[Employee]] = Future.successful {
    employees.get(id).map { _ =>
      val updated = Employee(id, data.name.trim, data.email.trim, data.department.trim)
      employees.put(id, updated)
      updated
    }
  }

  def delete(id: Long): Future[Boolean] =
    Future.successful(employees.remove(id).isDefined)
}
