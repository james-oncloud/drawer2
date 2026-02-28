package models

final case class Employee(
    id: Long,
    name: String,
    email: String,
    department: String
)

final case class EmployeeData(
    name: String,
    email: String,
    department: String
)
