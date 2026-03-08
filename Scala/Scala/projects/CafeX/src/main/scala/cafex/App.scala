package cafex

object App extends scala.App {
  val order = List("Cola", "Coffee", "Cheese Sandwich")
  println(s"Order: ${order.mkString(", ")}")
  println(s"Total: £${BillCalculator.totalBill(order)}")
}
