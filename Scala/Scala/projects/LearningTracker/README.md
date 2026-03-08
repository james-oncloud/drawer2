# Programming in Scala - Play Demo

This project is a small backend service built with the Play Framework (Scala 2.13.18). It demonstrates the language features listed in `scala_language_features.md` by implementing a simple domain and API.

## App Domain

**Learning Tracker**: a lightweight service for creating courses and lessons, and tracking their status.

Entities:
- **Course**: title, level, status, tags, metadata, lessons, timestamps
- **Lesson**: title, duration, tags

Use cases:
- Create a course
- Add lessons to a course
- Update course status
- Search courses by term, level, or status

## App Design

Layered design that mirrors common Play apps:

- **Controllers** (`app/controllers`): HTTP endpoints and JSON handling.
- **Services** (`app/services`): domain logic, validation, and orchestration.
- **Models** (`app/models`): enums, case classes, ids, typeclasses, extension methods.
- **Repository** (`app/services`): an in-memory store to keep focus on Scala features.

Feature mapping highlights:
- **Enums**: `Level`, `Status`
- **Traits / abstract members**: `Identified`, `Timestamped`, `Repository`
- **Type parameterization**: `Repository[A]`
- **Value classes + implicits**: `CourseId`, `LessonId` JSON formats
- **Typeclasses + implicits**: `Renderable`
- **Extension methods (via implicit classes)**: `toSlug`, `renderLine`, helpers on lists
- **Pattern matching**: status updates and parsing filters
- **Collections**: lists, sets, maps, options, and filtering

## How to Build

Requirements:
- JDK 11+
- sbt 1.10.x

Build:
```bash
cd /Users/jamesking/work/drawer/Learning/ScalaAndPlay/Scala/ProgrammingInScala/LearningTracker
sbt compile
```

## How to Run

Start the server:
```bash
cd /Users/jamesking/work/drawer/Learning/ScalaAndPlay/Scala/ProgrammingInScala/LearningTracker
sbt run
```

Server runs on `http://localhost:9000`.

Example requests:
```bash
curl -X POST http://localhost:9000/api/courses \
  -H 'Content-Type: application/json' \
  -d '{"title":"Functional Programming","level":"Beginner","tags":["scala","fp"],"metadata":{"source":"book"}}'

curl http://localhost:9000/api/courses

curl -X PATCH http://localhost:9000/api/courses/<id>/status \
  -H 'Content-Type: application/json' \
  -d '{"status":"InProgress"}'
```

## Run Tests

```bash
cd /Users/jamesking/work/drawer/Learning/ScalaAndPlay/Scala/ProgrammingInScala/LearningTracker
sbt test
```
