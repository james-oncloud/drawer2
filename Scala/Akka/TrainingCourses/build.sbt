name := "training-courses"
version := "0.1.0"
scalaVersion := "2.13.16"

libraryDependencies ++= Seq(
  "com.typesafe.akka" %% "akka-actor" % "2.6.21",
  "org.typelevel" %% "cats-core" % "2.13.0",
  //add cats effects
  "org.typelevel" %% "cats-effect" % "3.5.1"
)
