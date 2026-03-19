# RDDs vs DataFrames vs Datasets (Detailed Guide with Scala 2 Examples)

Apache Spark provides three major APIs for distributed data processing:

- **RDD** (Resilient Distributed Dataset) - low-level, untyped object collections
- **DataFrame** - distributed table with named columns and schema
- **Dataset[T]** - strongly typed distributed collection with Spark SQL optimization

All three can solve similar problems, but they differ in abstraction level, optimization potential, type safety, and developer ergonomics.

---

## 1) Quick Definitions

### RDD

- Immutable distributed collection of JVM objects.
- Built around functional operations (`map`, `flatMap`, `filter`, `reduceByKey`, etc.).
- No schema by default.
- Minimal optimization by Spark SQL engine.

### DataFrame

- Alias for `Dataset[Row]`.
- Tabular data with schema (column names + types).
- Uses Spark SQL optimizer (Catalyst) and optimized execution engine (Tungsten).
- Best for SQL-like transformations and ETL.

### Dataset[T]

- Like DataFrame, but with a concrete Scala type `T` (case class/bean).
- Supports typed operations while retaining Spark SQL optimizations where possible.
- Good middle ground for type safety + performance.

---

## 2) Conceptual Comparison

| Area | RDD | DataFrame | Dataset |
|---|---|---|---|
| Abstraction level | Low | High | High (typed) |
| Schema | No (unless manually managed) | Yes | Yes (from encoder/type) |
| Compile-time type safety | Yes for element type, but no named columns | No (Row/column strings) | Yes |
| Catalyst optimization | Limited | Full | Full for SQL-style parts |
| Best use cases | Custom algorithms, fine-grained control | ETL, BI, SQL, aggregation | Type-safe pipelines in Scala |
| Ease for joins/grouping | More verbose | Very concise | Concise + typed options |

---

## 3) Shared Sample Data

We will use the same input shape across all APIs:

```scala
final case class Order(
  orderId: String,
  customerId: String,
  amount: Double,
  country: String,
  status: String
)
```

Sample rows:

```text
("o-1","c-1",120.0,"US","PAID")
("o-2","c-1",45.0,"US","PAID")
("o-3","c-2",220.0,"IN","CANCELLED")
("o-4","c-3",85.0,"DE","PAID")
```

---

## 4) RDD Example (Low-Level API)

```scala
import org.apache.spark.sql.SparkSession

val spark = SparkSession.builder().appName("RDD Example").master("local[*]").getOrCreate()
val sc = spark.sparkContext

val ordersRdd = sc.parallelize(Seq(
  Order("o-1","c-1",120.0,"US","PAID"),
  Order("o-2","c-1",45.0,"US","PAID"),
  Order("o-3","c-2",220.0,"IN","CANCELLED"),
  Order("o-4","c-3",85.0,"DE","PAID")
))

// 1) filter paid
val paid = ordersRdd.filter(_.status == "PAID")

// 2) map to (country, amount)
val countryAmount = paid.map(o => (o.country, o.amount))

// 3) aggregate revenue by country
val revenueByCountry = countryAmount
  .reduceByKey(_ + _)
  .sortBy({ case (_, total) => total }, ascending = false)

revenueByCountry.collect().foreach(println)
```

### What this shows

- Strong control over transformations.
- You explicitly manage key-value operations and grouping behavior.
- Good when logic is naturally object/algorithm oriented.

### Downsides

- More boilerplate for relational tasks (joins, groupings, sorting).
- No automatic query optimization like SQL planner rules.

---

## 5) DataFrame Example (Unyped Structured API)

```scala
import spark.implicits._
import org.apache.spark.sql.functions._

val ordersDf = Seq(
  Order("o-1","c-1",120.0,"US","PAID"),
  Order("o-2","c-1",45.0,"US","PAID"),
  Order("o-3","c-2",220.0,"IN","CANCELLED"),
  Order("o-4","c-3",85.0,"DE","PAID")
).toDF()

val revenueByCountryDf = ordersDf
  .filter($"status" === "PAID")
  .groupBy($"country")
  .agg(round(sum($"amount"), 2).as("total_revenue"))
  .orderBy(desc("total_revenue"))

revenueByCountryDf.show(false)
```

### What this shows

- Very concise code for tabular operations.
- Spark can optimize execution plan aggressively.
- Most ETL/reporting pipelines benefit from this API.

### Downsides

- Column references by string/name are not fully compile-time safe.
- Mistyped columns fail at runtime.

---

## 6) Dataset Example (Typed Structured API)

```scala
import spark.implicits._
import org.apache.spark.sql.functions._

val ordersDs = Seq(
  Order("o-1","c-1",120.0,"US","PAID"),
  Order("o-2","c-1",45.0,"US","PAID"),
  Order("o-3","c-2",220.0,"IN","CANCELLED"),
  Order("o-4","c-3",85.0,"DE","PAID")
).toDS()

// Typed filtering
val paidDs = ordersDs.filter(_.status == "PAID")

// Use DataFrame-like aggregations when needed
val revenueByCountry = paidDs
  .groupBy($"country")
  .agg(round(sum($"amount"), 2).as("total_revenue"))
  .orderBy(desc("total_revenue"))

revenueByCountry.show(false)
```

### What this shows

- Typed domain model with case classes.
- Cleaner business logic in typed lambdas.
- Can still switch into DataFrame/SQL expressions for heavy aggregations.

### Downsides

- API surface can feel mixed (typed + untyped styles).
- Some operations eventually use untyped columns anyway.

---

## 7) Same Task in All Three APIs (Word Count)

### RDD

```scala
val lines = sc.parallelize(Seq("spark is fast", "spark is scalable"))

val countsRdd = lines
  .flatMap(_.split("\\s+"))
  .map(word => (word, 1))
  .reduceByKey(_ + _)

countsRdd.collect().foreach(println)
```

### DataFrame

```scala
import spark.implicits._
import org.apache.spark.sql.functions._

val linesDf = Seq("spark is fast", "spark is scalable").toDF("line")

val countsDf = linesDf
  .select(explode(split($"line", "\\s+")).as("word"))
  .groupBy("word")
  .count()

countsDf.show(false)
```

### Dataset

```scala
val linesDs = Seq("spark is fast", "spark is scalable").toDS()

val countsDs = linesDs
  .flatMap(_.split("\\s+"))
  .groupByKey(identity)
  .count()

countsDs.show(false)
```

Observation:

- RDD version is explicit and algorithmic.
- DataFrame/Dataset versions are usually easier for SQL-style summaries.
- Dataset typed group operations can be expressive but are sometimes less concise than DataFrame aggregations.

---

## 8) Performance and Optimization

### Why DataFrame/Dataset are usually faster

- **Catalyst optimizer** can reorder filters/projections and simplify expressions.
- **Tungsten execution** improves memory and CPU efficiency.
- **Whole-stage codegen** generates bytecode for pipelines, reducing overhead.
- Better support for **Adaptive Query Execution (AQE)** and optimized joins.

### Where RDD can still be useful

- Custom partition-level logic with `mapPartitions`.
- Low-level control over partitioning and custom algorithms.
- Workloads that are not naturally relational/tabular.

---

## 9) Type Safety Nuance

RDD:
- Type-safe at the object level (`RDD[Order]`), but no schema semantics.

DataFrame:
- Schema-aware but not compile-time safe for column names.

Dataset:
- Better compile-time guarantees for object fields in typed operations.
- Once you switch to `$"column"` expressions, that part becomes more DataFrame-like.

---

## 10) Interoperability (You Can Convert)

```scala
import spark.implicits._

val rdd = spark.sparkContext.parallelize(Seq(Order("o-1","c-1",100.0,"US","PAID")))
val ds = rdd.toDS()
val df = ds.toDF()

val backToDs = df.as[Order]
val backToRdd = backToDs.rdd
```

This flexibility lets you use the right abstraction for each pipeline section.

---

## 11) Practical Guidance (When to Choose What)

Choose **DataFrame** when:
- You do ETL, joins, aggregations, SQL analytics, BI pipelines.
- You want best default optimization and concise code.

Choose **Dataset** when:
- You are in Scala/Java and want stronger domain typing.
- Your team values compile-time checks on business objects.

Choose **RDD** when:
- You need fine-grained algorithmic control not naturally expressed in SQL-like transformations.
- You are implementing custom iterative/graph-style logic and know why low-level control is required.

---

## 12) Common Anti-Patterns

- Using RDD for routine joins/groupBy/reporting work that DataFrame can optimize better.
- Excessive conversion between APIs without clear value.
- Heavy UDF usage when built-in Spark SQL functions could be used (built-ins optimize better).
- Calling `collect()` on large datasets (driver memory risk).

---

## 13) Recommendation for Modern Spark (Scala 2)

For most production pipelines:

1. Start with **DataFrame** API.
2. Use **Dataset** for typed business logic where it improves correctness/readability.
3. Drop to **RDD** only for specific low-level needs.

This approach typically gives the best balance of performance, maintainability, and safety.
