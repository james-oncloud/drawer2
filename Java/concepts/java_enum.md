# Java enum

``` java
public enum OrderStatus {
    NEW,
    PROCESSING,
    COMPLETED,
    CANCELLED
}
```

``` java
public enum Tier {
    BRONZE(0.00),
    SILVER(0.05),
    GOLD(0.10);

    private final double discountRate;

    Tier(double discountRate) {
        this.discountRate = discountRate;
    }

    public double discountRate() {
        return discountRate;
    }

    public double applyDiscount(double amount) {
        return amount * (1 - discountRate);
    }
}
```