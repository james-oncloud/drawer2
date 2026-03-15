# Advanced Java Streams: 20 Practice Exercises

Use these exercises to build deep fluency with Java Streams (Java 17/21 style).  
Domain idea: e-commerce orders, customers, and products.

## Suggested model (you can adapt)

```java
record Customer(long id, String name, String city, String tier) {}
record Product(long id, String name, String category, double price) {}
record LineItem(Product product, int quantity) {}
record Order(long id, Customer customer, java.time.LocalDate date, String status, List<LineItem> items) {}
```

---

## Solutions

Below is one clean way to solve each exercise.  
Assume helper methods:

```java
static double lineTotal(LineItem li) {
    return li.product().price() * li.quantity();
}

static double orderTotal(Order o) {
    return o.items().stream().mapToDouble(AdvancedStreamsSolutions::lineTotal).sum();
}
```

Also assume `import static java.util.stream.Collectors.*;` where useful.

1. **Total revenue from completed orders**

```java
double totalRevenue = orders.stream()
    .filter(o -> "COMPLETED".equals(o.status()))
    .mapToDouble(AdvancedStreamsSolutions::orderTotal)
    .sum();
```

2. **Top 5 most expensive products ever ordered**

```java
List<Product> top5Expensive = orders.stream()
    .flatMap(o -> o.items().stream())
    .map(LineItem::product)
    .distinct()
    .sorted(Comparator.comparingDouble(Product::price).reversed())
    .limit(5)
    .toList();
```

3. **Revenue by city**

```java
Map<String, Double> revenueByCity = orders.stream()
    .filter(o -> "COMPLETED".equals(o.status()))
    .collect(groupingBy(
        o -> o.customer().city(),
        summingDouble(AdvancedStreamsSolutions::orderTotal)
    ));
```

4. **Average order value by customer tier**

```java
Map<String, Double> avgByTier = orders.stream()
    .collect(groupingBy(
        o -> o.customer().tier(),
        averagingDouble(AdvancedStreamsSolutions::orderTotal)
    ));
```

5. **Most purchased product by quantity**

```java
Optional<Product> mostPurchased = orders.stream()
    .flatMap(o -> o.items().stream())
    .collect(groupingBy(LineItem::product, summingInt(LineItem::quantity)))
    .entrySet().stream()
    .max(Map.Entry.comparingByValue())
    .map(Map.Entry::getKey);
```

6. **Products never ordered**

```java
Set<Product> orderedProducts = orders.stream()
    .flatMap(o -> o.items().stream())
    .map(LineItem::product)
    .collect(toSet());

List<Product> neverOrdered = catalog.stream()
    .filter(p -> !orderedProducts.contains(p))
    .toList();
```

7. **Distinct product categories in sorted order**

```java
List<String> categories = orders.stream()
    .flatMap(o -> o.items().stream())
    .map(li -> li.product().category())
    .distinct()
    .sorted()
    .toList();
```

8. **Daily revenue time series for a month**

```java
Map<java.time.LocalDate, Double> revenuePerDay = orders.stream()
    .filter(o -> "COMPLETED".equals(o.status()))
    .collect(groupingBy(
        Order::date,
        summingDouble(AdvancedStreamsSolutions::orderTotal)
    ));
```

9. **Longest customer name per city**

```java
Map<String, Optional<Customer>> longestNamePerCity = customers.stream()
    .collect(groupingBy(
        Customer::city,
        maxBy(Comparator.comparingInt(c -> c.name().length()))
    ));
```

10. **Customers with at least 3 completed orders**

```java
Set<Customer> frequentCustomers = orders.stream()
    .filter(o -> "COMPLETED".equals(o.status()))
    .collect(groupingBy(Order::customer, counting()))
    .entrySet().stream()
    .filter(e -> e.getValue() >= 3)
    .map(Map.Entry::getKey)
    .collect(toSet());
```

11. **Find duplicate product names across categories**

```java
Map<String, Set<String>> duplicateNamesAcrossCategories = catalog.stream()
    .collect(groupingBy(
        Product::name,
        mapping(Product::category, toSet())
    ))
    .entrySet().stream()
    .filter(e -> e.getValue().size() > 1)
    .collect(toMap(Map.Entry::getKey, Map.Entry::getValue));
```

12. **Partition high-value and low-value orders**

```java
Map<Boolean, List<Order>> partitioned = orders.stream()
    .collect(partitioningBy(o -> orderTotal(o) >= 1000.0));
```

13. **Second highest order value per city**

```java
Map<String, Optional<Double>> secondHighestPerCity = orders.stream()
    .collect(groupingBy(
        o -> o.customer().city(),
        collectingAndThen(
            mapping(AdvancedStreamsSolutions::orderTotal, toList()),
            totals -> totals.stream()
                .sorted(Comparator.reverseOrder())
                .skip(1)
                .findFirst()
        )
    ));
```

14. **Immutable map of customerId to latest order date**

```java
Map<Long, java.time.LocalDate> latestOrderDateByCustomerId = orders.stream()
    .collect(toMap(
        o -> o.customer().id(),
        Order::date,
        BinaryOperator.maxBy(Comparator.naturalOrder())
    ));

latestOrderDateByCustomerId = Map.copyOf(latestOrderDateByCustomerId);
```

15. **Top 3 categories by revenue**

```java
List<Map.Entry<String, Double>> top3Categories = orders.stream()
    .flatMap(o -> o.items().stream())
    .collect(groupingBy(
        li -> li.product().category(),
        summingDouble(AdvancedStreamsSolutions::lineTotal)
    ))
    .entrySet().stream()
    .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
    .limit(3)
    .toList();
```

16. **Sliding window average of daily revenue (7-day)**

```java
record DailyRevenue(java.time.LocalDate date, double revenue) {}

List<DailyRevenue> movingAvg7 = java.util.stream.IntStream
    .range(0, dailyRevenues.size())
    .mapToObj(i -> {
        int from = Math.max(0, i - 6);
        double avg = dailyRevenues.subList(from, i + 1).stream()
            .mapToDouble(DailyRevenue::revenue)
            .average()
            .orElse(0.0);
        return new DailyRevenue(dailyRevenues.get(i).date(), avg);
    })
    .toList();
```

17. **Detect suspicious orders**

```java
Predicate<Order> suspicious = o ->
       o.items().size() > 10
    || orderTotal(o) > 5000.0
    || o.items().stream().anyMatch(li -> li.quantity() > 20);

List<Order> suspiciousOrders = orders.stream().filter(suspicious).toList();
```

18. **Custom collector: summarize money stats**

```java
record RevenueStats(long count, double sum, double min, double max, double avg) {}

static Collector<Order, double[], RevenueStats> revenueStatsCollector() {
    return Collector.of(
        () -> new double[] {0, 0, Double.POSITIVE_INFINITY, Double.NEGATIVE_INFINITY},
        (acc, order) -> {
            double value = orderTotal(order);
            acc[0]++;            // count
            acc[1] += value;     // sum
            acc[2] = Math.min(acc[2], value); // min
            acc[3] = Math.max(acc[3], value); // max
        },
        (a, b) -> new double[] {
            a[0] + b[0],
            a[1] + b[1],
            Math.min(a[2], b[2]),
            Math.max(a[3], b[3])
        },
        acc -> {
            long count = (long) acc[0];
            double min = count == 0 ? 0.0 : acc[2];
            double max = count == 0 ? 0.0 : acc[3];
            double avg = count == 0 ? 0.0 : acc[1] / count;
            return new RevenueStats(count, acc[1], min, max, avg);
        }
    );
}

RevenueStats stats = orders.stream().collect(revenueStatsCollector());
```

19. **Parallel stream benchmark exercise**

```java
long n = 5_000_000L;

long t1 = System.nanoTime();
double seq = java.util.stream.LongStream.rangeClosed(1, n)
    .mapToDouble(x -> Math.sqrt(x) * Math.log1p(x))
    .sum();
long t2 = System.nanoTime();

double par = java.util.stream.LongStream.rangeClosed(1, n)
    .parallel()
    .mapToDouble(x -> Math.sqrt(x) * Math.log1p(x))
    .sum();
long t3 = System.nanoTime();

boolean same = Math.abs(seq - par) < 1e-6;
System.out.println("seq ms=" + ((t2 - t1) / 1_000_000.0));
System.out.println("par ms=" + ((t3 - t2) / 1_000_000.0));
System.out.println("same result=" + same);
```

20. **One-pass dashboard output with `teeing`**

```java
record Dashboard(long totalOrders, double totalRevenue, double avgOrderValue, String topCityByRevenue) {}

Dashboard dashboard = orders.stream().collect(
    teeing(
        summarizingDouble(AdvancedStreamsSolutions::orderTotal),
        groupingBy(o -> o.customer().city(), summingDouble(AdvancedStreamsSolutions::orderTotal)),
        (summary, cityRevenue) -> {
            String topCity = cityRevenue.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("N/A");
            return new Dashboard(summary.getCount(), summary.getSum(), summary.getAverage(), topCity);
        }
    )
);
```

---

## 20 exercises

1. **Total revenue from completed orders**  
   Filter orders with `status = "COMPLETED"`, then compute total revenue using `mapToDouble` and `sum`.

2. **Top 5 most expensive products ever ordered**  
   Flatten all line items, map to products, deduplicate, sort by price descending, and take first 5.

3. **Revenue by city**  
   Group completed orders by `customer.city`, then sum revenue for each city.

4. **Average order value by customer tier**  
   Group by `customer.tier` (`BRONZE`, `SILVER`, `GOLD`), compute average order total using `Collectors.averagingDouble`.

5. **Most purchased product by quantity**  
   Flatten line items and aggregate total quantity per product. Return the product with the max quantity.

6. **Products never ordered**  
   Given `List<Product> catalog`, return products not present in any line item from orders.

7. **Distinct product categories in sorted order**  
   Extract categories from all ordered products, deduplicate, and return alphabetically sorted list.

8. **Daily revenue time series for a month**  
   For one month of orders, compute revenue per day as `Map<LocalDate, Double>` (include only days with orders).

9. **Longest customer name per city**  
   Group customers by city and find the customer with longest name using `Collectors.maxBy`.

10. **Customers with at least 3 completed orders**  
    Count completed orders per customer and return customers where count >= 3.

11. **Find duplicate product names across categories**  
    Detect names that appear in more than one category, return map `name -> Set<category>`.

12. **Partition high-value and low-value orders**  
    Partition orders by whether order total >= 1000 using `Collectors.partitioningBy`.

13. **Second highest order value per city**  
    Group orders by city, sort order totals descending, and get second element safely (Optional).

14. **Build immutable map of customerId to latest order date**  
    Resolve collisions with `BinaryOperator.maxBy`, and return unmodifiable map.

15. **Top 3 categories by revenue (across all line items)**  
    Compute category revenue and return top 3 entries sorted descending by value.

16. **Sliding window average of daily revenue (7-day)**  
    Given daily revenue list sorted by date, compute 7-day moving average (good hybrid: streams + index logic).

17. **Detect suspicious orders**  
    Mark orders suspicious if they contain > 10 line items OR total > 5000 OR has single item quantity > 20.

18. **Custom collector: summarize money stats**  
    Create custom `Collector<Order, ?, RevenueStats>` with count, sum, min, max, average order value.

19. **Parallel stream benchmark exercise**  
    Compare sequential vs parallel stream for heavy synthetic workload. Measure timing and verify result equality.

20. **One-pass dashboard output**  
    Using `Collectors.teeing` (or nested downstream collectors), produce:
    - total orders
    - total revenue
    - avg order value
    - top city by revenue

---

## Stretch goals (optional)

- Rewrite 5 exercises without intermediate mutable state.
- For 3 exercises, replace multiple stream passes with one collector pipeline.
- For 2 exercises, add null-safety and `Optional`-based result APIs.
- Add unit tests with edge cases: empty lists, ties, duplicate names, null city.

## Tips while practicing

- Prefer expressive pipelines over clever one-liners.
- Name intermediate variables for readability.
- Validate assumptions with tiny datasets first.
- Use `groupingBy`, `mapping`, `flatMapping`, `collectingAndThen`, `teeing`.
- Measure performance before choosing `parallelStream()`.
