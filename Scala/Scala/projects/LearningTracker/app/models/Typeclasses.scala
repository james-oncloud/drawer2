package models

trait Renderable[A] {
  def render(a: A): String
}

object Renderable {
  implicit val courseRenderable: Renderable[Course] = new Renderable[Course] {
    def render(course: Course): String =
      s"${course.title} (${course.level}, ${course.status})"
  }

  implicit val lessonRenderable: Renderable[Lesson] = new Renderable[Lesson] {
    def render(lesson: Lesson): String =
      s"${lesson.title} - ${lesson.minutes}m"
  }
}

object RenderSyntax {
  implicit class RenderOps[A](value: A) {
    def renderLine(implicit renderer: Renderable[A]): String =
      renderer.render(value)
  }
}
