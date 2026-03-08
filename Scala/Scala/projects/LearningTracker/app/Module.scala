import com.google.inject.AbstractModule
import services.{CourseRepository, InMemoryCourseRepository}

class Module extends AbstractModule {
  override def configure(): Unit =
    bind(classOf[CourseRepository]).to(classOf[InMemoryCourseRepository]).asEagerSingleton()
}
