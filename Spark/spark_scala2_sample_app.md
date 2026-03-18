# Spark Scala 2 Sample Application

This sample shows a practical Spark app in **Scala 2** that demonstrates:

- SparkSession setup
- Reading JSON data
- DataFrame transformations (`select`, `filter`, `groupBy`)
- SQL queries with temp views
- Dataset API with case classes
- UDF usage
- Window functions
- Writing output to disk

---

## 1) `build.sbt`

> Use Scala 2.12 (commonly paired with Spark 3.x).

```scala
name := "spark-scala2-sample"

version := "0.1.0"

scalaVersion := "2.12.18"

libraryDependencies ++= Seq(
  "org.apache.spark" %% "spark-sql" % "3.5.1" % "provided"
)
```

---

## 2) Project Structure

```text
spark-scala2-sample/
  build.sbt
  src/main/scala/com/example/SparkApiShowcase.scala
  data/input/orders.json
```

---

## 3) Sample Input (`data/input/orders.json`)

```json
{"orderId":"o-1001","customerId":"c-01","amount":120.50,"country":"US","status":"PAID","eventTime":"2026-03-15T10:01:00"}
{"orderId":"o-1002","customerId":"c-01","amount":45.00,"country":"US","status":"PAID","eventTime":"2026-03-15T10:05:00"}
{"orderId":"o-1003","customerId":"c-02","amount":220.10,"country":"IN","status":"CANCELLED","eventTime":"2026-03-15T10:11:00"}
{"orderId":"o-1004","customerId":"c-03","amount":85.25,"country":"DE","status":"PAID","eventTime":"2026-03-15T10:17:00"}
{"orderId":"o-1005","customerId":"c-03","amount":99.75,"country":"DE","status":"PAID","eventTime":"2026-03-15T10:22:00"}
```

---

## 4) Main Application (`SparkApiShowcase.scala`)

```scala
package com.example

import org.apache.spark.sql.{Dataset, SparkSession}
import org.apache.spark.sql.functions._
import org.apache.spark.sql.expressions.Window

object SparkApiShowcase {

  // Dataset type
  final case class Order(
    orderId: String,
    customerId: String,
    amount: Double,
    country: String,
    status: String,
    eventTime: String
  )

  def main(args: Array[String]): Unit = {
    val spark = SparkSession.builder()
      .appName("Spark Scala2 API Showcase")
      .master("local[*]") // remove in cluster mode
      .getOrCreate()

    import spark.implicits._

    // 1) Read JSON as DataFrame
    val ordersDf = spark.read
      .option("multiLine", "false")
      .json("data/input/orders.json")
      .withColumn("event_ts", to_timestamp($"eventTime"))

    println("=== Raw DataFrame ===")
    ordersDf.show(truncate = false)

    // 2) DataFrame transformations
    val paidOrdersDf = ordersDf
      .filter($"status" === "PAID")
      .select($"orderId", $"customerId", $"country", $"amount", $"event_ts")
      .cache()

    println("=== Paid Orders (DataFrame API) ===")
    paidOrdersDf.show(truncate = false)

    val revenueByCountryDf = paidOrdersDf
      .groupBy($"country")
      .agg(
        count(lit(1)).as("order_count"),
        round(sum($"amount"), 2).as("total_revenue")
      )
      .orderBy(desc("total_revenue"))

    println("=== Revenue by Country ===")
    revenueByCountryDf.show(truncate = false)

    // 3) SQL API
    paidOrdersDf.createOrReplaceTempView("paid_orders")
    val sqlDf = spark.sql(
      """
        |SELECT customerId, COUNT(*) AS orders, ROUND(SUM(amount), 2) AS spend
        |FROM paid_orders
        |GROUP BY customerId
        |ORDER BY spend DESC
        |""".stripMargin)

    println("=== Customer Spend (Spark SQL) ===")
    sqlDf.show(truncate = false)

    // 4) Dataset API with case class
    val ordersDs: Dataset[Order] = ordersDf
      .select("orderId", "customerId", "amount", "country", "status", "eventTime")
      .as[Order]

    val paidDs = ordersDs.filter(_.status == "PAID")
    println(s"Paid Dataset count: ${paidDs.count()}")

    // 5) UDF example
    val riskBand = udf((amount: Double) =>
      if (amount >= 200) "HIGH"
      else if (amount >= 100) "MEDIUM"
      else "LOW"
    )

    val withRiskDf = paidOrdersDf.withColumn("risk_band", riskBand($"amount"))
    println("=== Paid Orders with UDF (risk band) ===")
    withRiskDf.show(truncate = false)

    // 6) Window function (running spend per customer by event time)
    val w = Window.partitionBy("customerId").orderBy("event_ts")
    val runningSpendDf = paidOrdersDf
      .withColumn("running_spend", round(sum($"amount").over(w), 2))

    println("=== Running Spend by Customer (Window) ===")
    runningSpendDf.show(truncate = false)

    // 7) Write output
    revenueByCountryDf
      .coalesce(1)
      .write
      .mode("overwrite")
      .option("header", "true")
      .csv("data/output/revenue_by_country")

    spark.stop()
  }
}
```

---

## 5) Run Locally

From project root:

```bash
sbt run
```

If you need to submit with Spark directly:

```bash
sbt package
spark-submit \
  --class com.example.SparkApiShowcase \
  --master local[*] \
  target/scala-2.12/spark-scala2-sample_2.12-0.1.0.jar
```

---

## 6) What This Demonstrates

- **Execution model**: transformations are lazy; actions like `show`, `count`, and `write` trigger jobs.
- **Data abstractions**: same data via DataFrame, SQL, and Dataset APIs.
- **Optimization-friendly style**: built-in functions (`sum`, `count`, `round`) keep work in Catalyst/Tungsten path.
- **Stateful analytics**: window functions for time-ordered customer metrics.
- **Production pattern**: selective `cache`, explicit output mode, and predictable output partitioning.
