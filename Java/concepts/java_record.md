
```java
record SendOptions(int retries, boolean urgent) {
    SendOptions() { this(3, false); }
}
```

```java
record SendOptions(int retries, boolean urgent) {
    SendOptions() { this(3, false); }
}

Customer c = new Customer(1L, "Alice", "New York");

System.out.println(c.id());    // 1
System.out.println(c.name());  // Alice
System.out.println(c.city());  // New York

public record Product(long id, String name, double price) {
    public Product {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("name cannot be blank");
        }
        if (price < 0) {
            throw new IllegalArgumentException("price cannot be negative");
        }
    }
}

public record LineItem(Product product, int quantity) {
    public double total() {
        return product.price() * quantity;
    }
}

sealed interface Payment permits CardPayment, CashPayment, WirePayment {}

record CardPayment(String cardLast4, double amount) implements Payment {}
record CashPayment(double amount) implements Payment {}
record WirePayment(String iban, double amount) implements Payment {}

public class PaymentProcessor {
    static String describe(Payment p) {
        return switch (p) {
            case CardPayment(String last4, double amount) ->
                "Card ending " + last4 + ", amount=" + amount;
            case CashPayment(double amount) ->
                "Cash payment, amount=" + amount;
            case WirePayment(String iban, double amount) ->
                "Wire to " + iban + ", amount=" + amount;
        };
    }

    public static void main(String[] args) {
        Payment p1 = new CardPayment("1234", 99.99);
        Payment p2 = new CashPayment(20.00);

        System.out.println(describe(p1));
        System.out.println(describe(p2));
    }
}
```