error id: file://<WORKSPACE>/LearningTracker/app/models/Course.scala:`<none>`.
file://<WORKSPACE>/LearningTracker/app/models/Course.scala
empty definition using pc, found symbol in pc: `<none>`.
empty definition using semanticdb
empty definition using fallback
non-local guesses:
	 -Identified#
	 -scala/Predef.Identified#
offset: 336
uri: file://<WORKSPACE>/LearningTracker/app/models/Course.scala
text:
```scala
package models

import java.time.Instant
import play.api.libs.json.{Json, OFormat}

final case class Course(
    id: CourseId,
    title: String,
    level: Level,
    status: Status,
    lessons: List[Lesson],
    tags: Set[String],
    metadata: Map[String, String],
    createdAt: Instant,
    updatedAt: Instant
) extends Identified@@
    with Timestamped {
  type Id = CourseId
}

object Course {
  implicit val courseFormat: OFormat[Course] = Json.format[Course]
}

```


#### Short summary: 

empty definition using pc, found symbol in pc: `<none>`.