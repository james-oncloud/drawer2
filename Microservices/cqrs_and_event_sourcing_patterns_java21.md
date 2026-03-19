# CQRS and Event Sourcing in Microservices (Java 21)

This guide explains **CQRS (Command Query Responsibility Segregation)** and **Event Sourcing** in detail, with practical Java 21 examples you can adapt for production systems.

---

## 1) What is CQRS?

**CQRS** separates the write and read responsibilities of a system:

- **Command side (write model)**: handles intent to change state.
- **Query side (read model)**: serves optimized data for reads.

### Core idea

Instead of one data model that tries to do everything, use:

- A **consistency-focused model** for business rules and updates.
- A **performance-focused model** for query use cases.

### Why teams adopt CQRS

- Read and write workloads scale independently.
- Read model can be denormalized for fast API responses.
- Complex business invariants stay isolated in command model.
- Easier to evolve different read views (dashboard, reporting, search).

### Trade-offs

- More moving parts than CRUD.
- Eventual consistency between write and read side.
- Requires monitoring for projection lag and replay processes.

---

## 2) What is Event Sourcing?

With **Event Sourcing**, the source of truth is the sequence of **domain events**, not the current row state.

Instead of storing only `current_balance = 1200`, you store:

- `AccountOpened`
- `MoneyDeposited(500)`
- `MoneyWithdrawn(200)`
- `MoneyDeposited(900)`

Current state is rebuilt by replaying events in order.

### Why teams adopt Event Sourcing

- Full audit/history of business changes.
- Temporal queries ("what was state at time T?").
- Easier integration with event-driven architecture.
- Supports rebuilding projections from history.

### Trade-offs

- Event schema/version evolution must be managed carefully.
- Replay and projection rebuild processes are required.
- Debugging requires event-stream understanding.

---

## 3) CQRS + Event Sourcing together

These patterns are commonly combined:

1. Commands are validated and applied by an **aggregate**.
2. Aggregate emits **domain events**.
3. Events are appended to an **event store** (append-only).
4. Event consumers build one or more **read projections**.
5. Queries read only from projections.

This gives strong business consistency on writes and flexible/high-performance reads.

---

## 4) Java 21 building blocks

Java 21 helps model domain events cleanly:

- **`record`** for immutable events and commands.
- **`sealed interface`** for closed event hierarchies.
- **Pattern matching for `switch`** to apply events safely.
- `Instant`, `UUID`, and `Map` from the standard library for metadata and in-memory examples.

---

## 5) Example domain: Bank Account

We will implement:

- Command side aggregate with invariants.
- In-memory event store with optimistic concurrency.
- Projection for read side.

> Note: The code is intentionally compact for learning. In production, persist events in a durable store and publish them reliably (for example using an outbox pattern).

---

## 6) Domain events (Java 21)

```java
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

sealed interface AccountEvent permits AccountOpened, MoneyDeposited, MoneyWithdrawn {}

record AccountOpened(UUID accountId, String owner, Instant occurredAt) implements AccountEvent {}
record MoneyDeposited(UUID accountId, BigDecimal amount, Instant occurredAt) implements AccountEvent {}
record MoneyWithdrawn(UUID accountId, BigDecimal amount, Instant occurredAt) implements AccountEvent {}
```

Why this shape:

- Events are immutable.
- Domain history is explicit.
- Sealed hierarchy prevents unknown event types at compile time.

---

## 7) Commands

```java
import java.math.BigDecimal;
import java.util.UUID;

sealed interface AccountCommand permits OpenAccount, DepositMoney, WithdrawMoney {}

record OpenAccount(UUID accountId, String owner) implements AccountCommand {}
record DepositMoney(UUID accountId, BigDecimal amount) implements AccountCommand {}
record WithdrawMoney(UUID accountId, BigDecimal amount) implements AccountCommand {}
```

Commands represent intent; they are not facts. Facts are events.

---

## 8) Aggregate (command-side consistency)

The aggregate enforces business rules (for example, no negative balance).

```java
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

final class BankAccountAggregate {
    private UUID accountId;
    private String owner;
    private BigDecimal balance = BigDecimal.ZERO;
    private boolean opened = false;
    private long version = 0L;

    private final List<AccountEvent> uncommittedEvents = new ArrayList<>();

    static BankAccountAggregate rehydrate(List<AccountEvent> history) {
        var agg = new BankAccountAggregate();
        history.forEach(agg::applyFromHistory);
        return agg;
    }

    long version() { return version; }
    List<AccountEvent> uncommittedEvents() { return List.copyOf(uncommittedEvents); }
    void clearUncommittedEvents() { uncommittedEvents.clear(); }

    void handle(AccountCommand command) {
        switch (command) {
            case OpenAccount c -> {
                if (opened) throw new IllegalStateException("Account already opened");
                if (c.owner() == null || c.owner().isBlank()) {
                    throw new IllegalArgumentException("Owner is required");
                }
                raise(new AccountOpened(c.accountId(), c.owner(), Instant.now()));
            }
            case DepositMoney c -> {
                ensureOpened();
                requirePositive(c.amount(), "Deposit amount must be > 0");
                raise(new MoneyDeposited(c.accountId(), c.amount(), Instant.now()));
            }
            case WithdrawMoney c -> {
                ensureOpened();
                requirePositive(c.amount(), "Withdraw amount must be > 0");
                if (balance.compareTo(c.amount()) < 0) {
                    throw new IllegalStateException("Insufficient funds");
                }
                raise(new MoneyWithdrawn(c.accountId(), c.amount(), Instant.now()));
            }
        }
    }

    private void raise(AccountEvent event) {
        apply(event);
        uncommittedEvents.add(event);
    }

    private void applyFromHistory(AccountEvent event) {
        apply(event);
        version++;
    }

    private void apply(AccountEvent event) {
        switch (event) {
            case AccountOpened e -> {
                accountId = e.accountId();
                owner = e.owner();
                opened = true;
            }
            case MoneyDeposited e -> balance = balance.add(e.amount());
            case MoneyWithdrawn e -> balance = balance.subtract(e.amount());
        }
    }

    private void ensureOpened() {
        if (!opened) throw new IllegalStateException("Account is not opened");
    }

    private static void requirePositive(BigDecimal amount, String message) {
        if (amount == null || amount.signum() <= 0) throw new IllegalArgumentException(message);
    }
}
```

Important point: aggregate state is derived from past events and new decisions produce more events.

---

## 9) Event store with optimistic concurrency

This in-memory event store demonstrates append-only behavior and expected-version checks.

```java
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

final class InMemoryEventStore {
    private final Map<UUID, List<AccountEvent>> streams = new HashMap<>();

    synchronized List<AccountEvent> load(UUID streamId) {
        return List.copyOf(streams.getOrDefault(streamId, List.of()));
    }

    synchronized void append(UUID streamId, long expectedVersion, List<AccountEvent> newEvents) {
        var current = streams.computeIfAbsent(streamId, k -> new ArrayList<>());
        long actualVersion = current.size();
        if (actualVersion != expectedVersion) {
            throw new IllegalStateException(
                "Concurrency conflict. Expected version " + expectedVersion + " but was " + actualVersion
            );
        }
        current.addAll(newEvents);
    }
}
```

This prevents lost updates when two writers act on stale state.

---

## 10) Command handler / application service

```java
import java.util.UUID;

final class AccountCommandService {
    private final InMemoryEventStore eventStore;
    private final AccountProjectionUpdater projectionUpdater;

    AccountCommandService(InMemoryEventStore eventStore, AccountProjectionUpdater projectionUpdater) {
        this.eventStore = eventStore;
        this.projectionUpdater = projectionUpdater;
    }

    void dispatch(UUID accountId, AccountCommand command) {
        var history = eventStore.load(accountId);
        var aggregate = BankAccountAggregate.rehydrate(history);
        long expectedVersion = aggregate.version();

        aggregate.handle(command);
        var newEvents = aggregate.uncommittedEvents();

        eventStore.append(accountId, expectedVersion, newEvents);
        aggregate.clearUncommittedEvents();

        // In production this is usually asynchronous via broker.
        projectionUpdater.accept(newEvents);
    }
}
```

---

## 11) Read model projection (query side)

Projection stores denormalized, query-optimized data.

```java
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

record AccountReadModel(UUID accountId, String owner, BigDecimal balance) {}

final class AccountProjectionUpdater {
    private final Map<UUID, AccountReadModel> readDb = new HashMap<>();

    void accept(List<AccountEvent> events) {
        for (var event : events) {
            switch (event) {
                case AccountOpened e ->
                    readDb.put(e.accountId(), new AccountReadModel(e.accountId(), e.owner(), BigDecimal.ZERO));
                case MoneyDeposited e -> {
                    var current = readDb.get(e.accountId());
                    readDb.put(e.accountId(),
                        new AccountReadModel(current.accountId(), current.owner(), current.balance().add(e.amount())));
                }
                case MoneyWithdrawn e -> {
                    var current = readDb.get(e.accountId());
                    readDb.put(e.accountId(),
                        new AccountReadModel(current.accountId(), current.owner(), current.balance().subtract(e.amount())));
                }
            }
        }
    }

    Optional<AccountReadModel> byId(UUID accountId) {
        return Optional.ofNullable(readDb.get(accountId));
    }
}
```

Read APIs use the projection directly, never the aggregate.

---

## 12) End-to-end usage example

```java
import java.math.BigDecimal;
import java.util.UUID;

public class Demo {
    public static void main(String[] args) {
        var eventStore = new InMemoryEventStore();
        var projection = new AccountProjectionUpdater();
        var commands = new AccountCommandService(eventStore, projection);

        UUID id = UUID.randomUUID();

        commands.dispatch(id, new OpenAccount(id, "James"));
        commands.dispatch(id, new DepositMoney(id, new BigDecimal("1000.00")));
        commands.dispatch(id, new WithdrawMoney(id, new BigDecimal("250.00")));

        var view = projection.byId(id).orElseThrow();
        System.out.println("Owner: " + view.owner());
        System.out.println("Balance: " + view.balance()); // 750.00

        var history = eventStore.load(id);
        System.out.println("Event count: " + history.size()); // 3
    }
}
```

---

## 13) Practical production guidance

### Event design

- Use past tense names (`OrderPlaced`, `PaymentCaptured`).
- Keep events immutable and self-contained enough for consumers.
- Include metadata: event ID, aggregate ID, timestamp, correlation ID, causation ID.

### Versioning and schema evolution

- Prefer backward-compatible event changes.
- Upcast old event formats when replaying.
- Version event types explicitly when breaking changes are unavoidable.

### Idempotency

- Consumers/projections must handle duplicate events safely.
- Track processed event IDs or stream offsets.

### Snapshotting

- For long streams, persist periodic snapshots to reduce replay time.
- Load: latest snapshot + subsequent events.

### Projection rebuilds

- Keep rebuild tooling first-class.
- Be able to drop and rebuild read models from the event store.

### Observability

- Monitor projection lag and dead-letter queues.
- Propagate correlation IDs across command handling and event processing.

---

## 14) When to use (and when not to)

### Good fit

- Complex domain rules and audit requirements.
- Many read shapes with high query volume.
- Need for temporal analysis and historical reconstruction.

### Avoid or defer

- Simple CRUD with minimal invariants.
- Teams without operational maturity for async/event-driven systems.
- Very small apps where complexity outweighs value.

---

## 15) CQRS vs Event Sourcing relationship

- You can use **CQRS without Event Sourcing** (for example write DB + read replicas/projections).
- You can use **Event Sourcing without full CQRS** (events as source of truth but simple read path).
- In microservices, they are often combined for maximum flexibility and traceability.

---

## 16) Suggested next steps

1. Start with one bounded context (not the whole platform).
2. Define 3-5 core commands and events.
3. Add one read projection for your most important query.
4. Implement optimistic concurrency and idempotent projection handling.
5. Add replay and projection rebuild scripts before scaling out.

This incremental path reduces risk while introducing CQRS and Event Sourcing in a controlled way.
