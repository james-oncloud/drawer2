package models

import java.time.Instant

trait Identified {
  type Id
  def id: Id
}

trait Timestamped {
  def createdAt: Instant
  def updatedAt: Instant
}
