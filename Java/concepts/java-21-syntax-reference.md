# Java 21 Syntax Refresher (Inventory Domain)

This page contains one cohesive Java 21 example that demonstrates common language syntax and modern features.
Domain idea: a warehouse inventory system.

## Features shown

- `package`, `import`, classes, interfaces, enums, records
- `sealed` hierarchy with `permits`
- constructors, access modifiers, static members, nested classes
- generics, bounds, wildcards, varargs
- annotations and custom annotation declaration
- control flow (`if`, loops, `switch` expression, `yield`)
- pattern matching (`instanceof`, `switch` with type/record patterns)
- exceptions, custom exception, multi-catch, try-with-resources
- lambdas, method references, streams, Optional
- text blocks, `var`, `final`, collections
- Java 21 virtual threads and `AutoCloseable`

## Sample code

```java
package concepts.inventory;

import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.function.Predicate;
import java.util.stream.Collectors;

public class InventorySyntaxShowcase {
    // Constants and static fields
    public static final String APP_NAME = "Inventory Syntax Showcase";
    private static int instanceCount = 0;

    // Instance fields
    private final List<Item> items = new ArrayList<>();
    private final AuditLogger logger;

    // Constructor
    public InventorySyntaxShowcase(AuditLogger logger) {
        this.logger = Objects.requireNonNull(logger, "logger must not be null");
        instanceCount++;
    }

    // Nested static class
    public static final class Stats {
        private Stats() {}

        public static int getInstanceCount() {
            return instanceCount;
        }
    }

    public static void main(String[] args) {
        var app = new InventorySyntaxShowcase(new FileAuditLogger(Path.of("audit.log")));
        app.seedData();

        // for-each loop
        for (Item item : app.items) {
            System.out.println(item);
        }

        // classic for loop + if/else
        for (int i = 0; i < app.items.size(); i++) {
            var item = app.items.get(i);
            if (item.quantity() == 0) {
                System.out.println("Out of stock: " + item.sku());
            } else {
                System.out.println("In stock: " + item.sku());
            }
        }

        // while loop
        int idx = 0;
        while (idx < app.items.size()) {
            idx++;
        }

        // do-while loop
        int countdown = 1;
        do {
            countdown--;
        } while (countdown > 0);

        // switch expression with yield
        for (var item : app.items) {
            var stockState = switch (item.quantity()) {
                case 0 -> "EMPTY";
                case 1, 2, 3 -> "LOW";
                default -> {
                    var value = item.quantity() > 100 ? "BULK" : "NORMAL";
                    yield value;
                }
            };
            System.out.printf("%s -> %s%n", item.sku(), stockState);
        }

        // Pattern matching for instanceof
        Object candidate = app.items.getFirst();
        if (candidate instanceof Item it && it.quantity() > 0) {
            System.out.println("Pattern instanceof matched: " + it.name());
        }

        // Stream API, lambda, method reference
        var namesSorted = app.items.stream()
            .filter(i -> i.quantity() > 0)
            .sorted(Comparator.comparing(Item::name))
            .map(Item::name)
            .toList();
        System.out.println("Names sorted: " + namesSorted);

        // Optional usage
        Optional<Item> maybe = app.findBySku("KB-200");
        maybe.ifPresentOrElse(
            value -> System.out.println("Found: " + value),
            () -> System.out.println("Not found")
        );

        // Generic method with wildcard usage
        List<PerishableItem> perishables = List.of(
            new PerishableItem("ML-10", "Milk", 20, Category.GROCERY, LocalDate.now().plusDays(7))
        );
        app.printSkus(perishables);

        // Text block
        String report = """
            Inventory Report
            ----------------
            Total items: %d
            Distinct categories: %d
            """.formatted(app.items.size(), app.items.stream().map(Item::category).collect(Collectors.toSet()).size());
        System.out.println(report);

        // Java 21 virtual threads
        app.runVirtualThreadAudit();

        // Pattern matching for switch with record and type patterns
        List<InventoryEvent> events = List.of(
            new StockAdded("KB-200", 5),
            new StockRemoved("ML-10", 2),
            new AuditNote("manual cycle count")
        );
        events.forEach(event -> System.out.println(app.describeEvent(event)));
    }

    private void seedData() {
        addItem(new Item("KB-200", "Keyboard", 50, Category.ELECTRONICS));
        addItem(new Item("MS-210", "Mouse", 0, Category.ELECTRONICS));
        addItem(new PerishableItem("ML-10", "Milk", 20, Category.GROCERY, LocalDate.now().plusDays(7)));
    }

    public void addItem(Item item) {
        items.add(item);
        logger.log("Added item " + item.sku());
    }

    public Optional<Item> findBySku(String sku) {
        return items.stream().filter(i -> i.sku().equalsIgnoreCase(sku)).findFirst();
    }

    // Generic method with upper-bounded wildcard
    public void printSkus(List<? extends Item> source) {
        source.forEach(i -> System.out.println("SKU: " + i.sku()));
    }

    // Generic method with type bound and varargs
    @SafeVarargs
    public static <T extends Comparable<T>> T maxOf(T first, T... rest) {
        T max = first;
        for (T value : rest) {
            if (value.compareTo(max) > 0) {
                max = value;
            }
        }
        return max;
    }

    private void runVirtualThreadAudit() {
        // try-with-resources and AutoCloseable executor
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<Future<String>> futures = items.stream()
                .map(item -> executor.submit(() -> "Audited " + item.sku()))
                .toList();

            for (var future : futures) {
                System.out.println(future.get());
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new InventoryRuntimeException("Audit interrupted", e);
        } catch (Exception e) { // includes ExecutionException
            throw new InventoryRuntimeException("Audit failed", e);
        }
    }

    private String describeEvent(InventoryEvent event) {
        return switch (event) {
            case StockAdded(String sku, int qty) when qty > 0 -> "Added " + qty + " to " + sku;
            case StockRemoved(String sku, int qty) when qty > 0 -> "Removed " + qty + " from " + sku;
            case AuditNote note -> "Note: " + note.message();
            default -> "Unknown event";
        };
    }
}

// Record (immutable data carrier)
@Entity("item")
record Item(String sku, String name, int quantity, Category category) {}

// Record extending behavior via compact constructor and methods
record PerishableItem(String sku, String name, int quantity, Category category, LocalDate expiresOn)
    implements Expirable {
    PerishableItem {
        if (expiresOn == null || expiresOn.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Expiry date must be today or later");
        }
    }

    @Override
    public boolean isExpired(LocalDate date) {
        return expiresOn.isBefore(date);
    }
}

enum Category {
    ELECTRONICS,
    GROCERY,
    OFFICE
}

interface Expirable {
    boolean isExpired(LocalDate date);
}

// Sealed hierarchy + records
sealed interface InventoryEvent permits StockAdded, StockRemoved, AuditNote {}
record StockAdded(String sku, int qty) implements InventoryEvent {}
record StockRemoved(String sku, int qty) implements InventoryEvent {}
record AuditNote(String message) implements InventoryEvent {}

interface AuditLogger {
    void log(String message);
}

final class FileAuditLogger implements AuditLogger {
    private final Path path;

    FileAuditLogger(Path path) {
        this.path = path;
    }

    @Override
    public void log(String message) {
        // try-with-resources + checked exception handling
        try (BufferedWriter writer = Files.newBufferedWriter(path)) {
            writer.write(message);
            writer.newLine();
        } catch (IOException e) {
            throw new InventoryRuntimeException("Cannot write audit log", e);
        }
    }
}

class InventoryRuntimeException extends RuntimeException {
    InventoryRuntimeException(String message, Throwable cause) {
        super(message, cause);
    }
}

// Custom annotation declaration
@interface Entity {
    String value();
}
```

## Quick compile/run

If you copy this snippet into `concepts/inventory/InventorySyntaxShowcase.java`:

```bash
javac concepts/inventory/InventorySyntaxShowcase.java
java concepts.inventory.InventorySyntaxShowcase
```
