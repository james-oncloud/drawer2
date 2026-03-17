package com.example.playground.streaming;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static java.util.stream.Collectors.averagingDouble;
import static java.util.stream.Collectors.groupingBy;
import static java.util.stream.Collectors.summingDouble;
import static java.util.stream.Collectors.summingInt;

record Customer(long id, String name, String city, String tier) {
}

record Product(long id, String name, String category, double price) {
}

record LineItem(Product product, int quantity) {
}

record Order(long id, Customer customer, java.time.LocalDate date, String status, List<LineItem> items) {
}

class AdvancedOps {
    static double lineTotal(LineItem li) {
        return li.product().price() * li.quantity();
    }

    static double orderTotal(Order o) {
        return o.items().stream().mapToDouble(AdvancedOps::lineTotal).sum();
    }
}

public class Sample {

    public static void main(String[] args) {

        List<Order> orders = List.of(getOrder());

        /* 1. */
        double totalRevenue = orders.stream()
                .filter(o -> "COMPLETED".equals(o.status()))
                .mapToDouble(AdvancedOps::orderTotal)
                .sum();

        /* 2. */
        List<Product> expensive = orders.stream()
                .flatMap(o -> o.items().stream())
                .map(LineItem::product)
                .distinct()
                .sorted(Comparator.comparingDouble(Product::price).reversed())
                .limit(5)
                .toList();

        /* 3. */
        Map<String, Double> revenueByCity = orders.stream()
                .filter(o -> o.status().equals("COMPLETED"))
                .collect(groupingBy(
                        o -> o.customer().city(),
                        summingDouble(AdvancedOps::orderTotal)
                ));

        /* 4. */
        Map<String, Double> avgByTier = orders.stream()
                .filter(o -> o.status().equals("COMPLETED"))
                .collect(groupingBy(
                        o -> o.customer().tier(),
                        averagingDouble(AdvancedOps::orderTotal)
                ));

        /* 5. */
        Optional<Product> mostPurchased2 = orders.stream()
                .flatMap(o -> o.items().stream())
                .collect(groupingBy(LineItem::product, summingInt(LineItem::quantity)))
                .entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey);


        /* 6. */


        System.out.println("Done!");
    }

    static Order getOrder() {

        Customer customer = new Customer(1L, "Alice Johnson", "New York", "GOLD");
        Product laptop = new Product(101L, "Laptop Pro 14", "Electronics", 1299.99);
        Product mouse = new Product(102L, "Wireless Mouse", "Accessories", 39.99);
        LineItem item1 = new LineItem(laptop, 1);
        LineItem item2 = new LineItem(mouse, 2);
        Order order = new Order(
                5001L,
                customer,
                LocalDate.of(2026, 3, 15),
                "COMPLETED",
                List.of(item1, item2)
        );
        return order;
    }

    /*
     * /Users/jamesking/Library/Java/JavaVirtualMachines/corretto-21.0.5/Contents/Home/bin/java -javaagent:/Applications/IntelliJ IDEA 2024.1.7.app/Conte
     * /Users/jamesking/Library/Java/JavaVirtualMachines/corretto-21.0.5/Contents/Home/bin/java -javaagent:/Applications/IntelliJ IDEA 2024.1.7.app/Conte
     * /Users/jamesking/Library/Java/JavaVirtualMachines/corretto-21.0.5/Contents/Home/bin/java -javaagent:/Applications/IntelliJ IDEA 2024.1.7.app/Conte
     * /Users/jamesking/Library/Java/JavaVirtualMachines/corretto-21.0.5/Contents/Home/bin/java -javaagent:/Applications/IntelliJ IDEA 2024.1.7.app/Conte
     * /Users/jamesking/Library/Java/JavaVirtualMachines/corretto-21.0.5/Contents/Home/bin/java -javaagent:/Applications/IntelliJ IDEA 2024.1.7.app/Conte
     * */

    static {
        String s1 = "/Users/jamesking/Library/Java/JavaVirtualMachines";
        String s2 = "/Users/jamesking/Library/Java/JavaVirtualMachines";
        String s3 = "/Users/jamesking/Library/Java/JavaVirtualMachines";
        String s4 = "/Users/jamesking/Library/Java/JavaVirtualMachines";
    }
}
