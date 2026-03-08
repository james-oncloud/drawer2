package example.training

import java.time.LocalDate

final case class CourseId(value: String) extends AnyVal
final case class StudentId(value: String) extends AnyVal

final case class Course(
  id: CourseId,
  title: String,
  startDate: LocalDate,
  capacity: Int
)

final case class Enrollment(
  courseId: CourseId,
  studentId: StudentId
)
