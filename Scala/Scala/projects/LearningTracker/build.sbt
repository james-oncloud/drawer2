name := "programming-in-scala-play-demo"
version := "0.1.0-SNAPSHOT"

scalaVersion := "2.13.18"

lazy val root = (project in file(".")).enablePlugins(PlayScala)

libraryDependencies ++= Seq(
  guice,
  "org.scalatestplus.play" %% "scalatestplus-play" % "7.0.1" % Test,
  "org.scalatest" %% "scalatest" % "3.2.18" % Test
)
