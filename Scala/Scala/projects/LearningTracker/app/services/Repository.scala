package services

import models.Identified

trait Repository[A <: Identified] {
  def all: List[A]
  def get(id: A#Id): Option[A]
  def save(entity: A): A
  def update(id: A#Id)(f: A => A): Option[A]
  def delete(id: A#Id): Boolean
}
