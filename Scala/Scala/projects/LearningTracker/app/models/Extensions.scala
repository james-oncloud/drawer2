package models

object Extensions {
  implicit class StringOps(value: String) {
    def toSlug: String =
      value
        .trim
        .toLowerCase
        .replaceAll("[^a-z0-9]+", "-")
        .stripSuffix("-")
  }

  implicit class ListOps[A](values: List[A]) {
    def nonEmptyOr(default: => List[A]): List[A] =
      if (values.nonEmpty) values else default
  }
}
