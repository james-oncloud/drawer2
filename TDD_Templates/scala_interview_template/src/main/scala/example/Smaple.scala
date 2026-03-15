package example

class Box1[T] {}
class Box2[+T] {
  def get: T = ???
}
class Box3[-T] {
  def put(value: T): Unit = ???
}

class Box4[A >: B, B] {} //declares two type parameters where A must be a supertype of B.
class Box5[A <: B, B] {} //declares two type parameters where A must be a subtype of B.

class Animal {}
class Dog extends Animal {}

object HelloWorld {

  var animalBox = new Box1[Animal]()
  var dogBox = new Box1[Dog]()

  //animalBox = dogBox // Error: type mismatch; found: Box1[Dog] required: Box1[Animal]

   var animalBox2 = new Box2[Animal]()
   var dogBox2 = new Box2[Dog]()

   animalBox2 = dogBox2 // OK

   var animalBox3 = new Box3[Animal]()
   var dogBox3 = new Box3[Dog]()

   dogBox3 = animalBox3 // OK

  //animalBox3 = dogBox3  // Error: type mismatch; found: Box3[Dog] required: Box3[Animal]
  def main(args: Array[String]): Unit = {
    println(s"Hello, World!")
  }
}