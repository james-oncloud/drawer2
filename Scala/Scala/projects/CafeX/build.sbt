ThisBuild / scalaVersion := "2.13.14"
ThisBuild / version := "0.1.0"
ThisBuild / organization := "com.jkc"

lazy val root = (project in file("."))
  .settings(
    name := "cafex",
    libraryDependencies += "org.scalatest" %% "scalatest" % "3.2.18" % Test
  )
