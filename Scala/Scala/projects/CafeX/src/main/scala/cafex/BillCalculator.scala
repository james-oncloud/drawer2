package cafex

import scala.math.BigDecimal.RoundingMode

object BillCalculator {

  final case class MenuItem(name: String, price: BigDecimal, isFood: Boolean, isHot: Boolean)

  private val ServiceChargeCap: BigDecimal = BigDecimal(20)

  val menu: Map[String, MenuItem] = List(
    MenuItem("Cola", BigDecimal("0.50"), isFood = false, isHot = false),
    MenuItem("Coffee", BigDecimal("1.00"), isFood = false, isHot = true),
    MenuItem("Cheese Sandwich", BigDecimal("2.00"), isFood = true, isHot = false),
    MenuItem("Steak Sandwich", BigDecimal("4.50"), isFood = true, isHot = true)
  ).map(item => item.name -> item).toMap

  def standardBill(purchasedItems: List[String]): BigDecimal = {
    val items = purchasedItems.map(resolveMenuItem)
    roundToTwoDecimals(subtotal(items))
  }

  def totalBill(purchasedItems: List[String]): BigDecimal = {
    val items = purchasedItems.map(resolveMenuItem)
    val orderSubtotal = subtotal(items)
    val serviceCharge = calculateServiceCharge(items, orderSubtotal)
    roundToTwoDecimals(orderSubtotal + serviceCharge)
  }

  private def calculateServiceCharge(items: List[MenuItem], subtotal: BigDecimal): BigDecimal = {
    if (items.isEmpty || items.forall(!_.isFood)) BigDecimal(0)
    else if (items.exists(item => item.isFood && item.isHot)) (subtotal * BigDecimal("0.20")).min(ServiceChargeCap)
    else subtotal * BigDecimal("0.10")
  }

  private def resolveMenuItem(name: String): MenuItem =
    menu.getOrElse(name, throw new IllegalArgumentException(s"Unknown menu item: $name"))

  private def subtotal(items: List[MenuItem]): BigDecimal =
    items.map(_.price).sum

  private def roundToTwoDecimals(amount: BigDecimal): BigDecimal =
    amount.setScale(2, RoundingMode.HALF_UP)
}
