package cafex

import org.scalatest.funsuite.AnyFunSuite

class BillCalculatorSpec extends AnyFunSuite {

  test("step 1: standard bill returns total for purchased items") {
    val total = BillCalculator.standardBill(List("Cola", "Coffee", "Cheese Sandwich"))
    assert(total == BigDecimal("3.50"))
  }

  test("step 2: no service charge when all items are drinks") {
    val total = BillCalculator.totalBill(List("Cola", "Coffee"))
    assert(total == BigDecimal("1.50"))
  }

  test("step 2: 10 percent service charge when order includes cold food") {
    val total = BillCalculator.totalBill(List("Cola", "Cheese Sandwich"))
    assert(total == BigDecimal("2.75"))
  }

  test("step 2: 20 percent service charge when order includes hot food") {
    val total = BillCalculator.totalBill(List("Cola", "Steak Sandwich"))
    assert(total == BigDecimal("6.00"))
  }

  test("step 2: service charge is capped at 20 pounds for hot food orders") {
    val largeHotFoodOrder = List.fill(30)("Steak Sandwich")
    val total = BillCalculator.totalBill(largeHotFoodOrder)
    assert(total == BigDecimal("155.00"))
  }

  test("rounds service charge to 2 decimal places") {
    val total = BillCalculator.totalBill(List("Cola", "Coffee", "Cheese Sandwich"))
    assert(total == BigDecimal("3.85"))
  }

  test("throws helpful error for unknown menu items") {
    val error = intercept[IllegalArgumentException] {
      BillCalculator.totalBill(List("Tea"))
    }
    assert(error.getMessage.contains("Unknown menu item: Tea"))
  }
}
