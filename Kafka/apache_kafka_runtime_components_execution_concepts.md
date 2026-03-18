# Apache Kafka: Runtime Components, Execution, and Core Concepts

This document explains Apache Kafka from three practical viewpoints:
- what runs at runtime (components),
- how data flows through the system (execution),
- and the key concepts you need to design, operate, and troubleshoot Kafka systems.

## 1) Runtime Components

### 1.1 Brokers

A **broker** is a Kafka server process. A Kafka cluster is a set of brokers.

Main responsibilities:
- Accept produce requests from clients.
- Serve fetch requests to consumers.
- Persist records to local disk (append-only log files).
- Replicate partitions to other brokers.
- Participate in cluster metadata management (through controllers).

At runtime, each broker hosts many partition replicas and handles network I/O, request processing, and background maintenance tasks (log cleanup, segment rolling, replication fetches, etc.).

### 1.2 KRaft Controller Quorum (modern Kafka)

In modern Kafka, cluster metadata is managed by **KRaft** (Kafka Raft) instead of ZooKeeper.

Runtime roles:
- **Controller quorum nodes** maintain metadata using a Raft log.
- One active controller coordinates metadata changes (topic creation, partition movement, leader elections).
- Brokers receive and apply metadata updates from the controller.

This metadata plane is separate from normal data plane I/O (produce/fetch), but both planes must stay healthy for a stable cluster.

### 1.3 Topics, Partitions, and Replicas

- A **topic** is a named logical stream.
- A topic is split into **partitions** for parallelism and scalability.
- Each partition has multiple **replicas** (based on replication factor), distributed across brokers.

Replica roles:
- **Leader replica**: handles all reads and writes for that partition.
- **Follower replicas**: replicate data from the leader.

Only the leader serves client traffic; followers keep up through replication fetch cycles.

### 1.4 Producers

A **producer** client publishes records to Kafka.

Runtime behavior includes:
- Serializing keys/values.
- Choosing a target partition (explicit partition, key-based hashing, or sticky partitioning for better batching).
- Batching records per partition.
- Compressing batches.
- Sending produce requests and handling retries/acks.

### 1.5 Consumers and Consumer Groups

A **consumer** reads records from partitions. A **consumer group** is a coordinated set of consumers sharing work.

Runtime behavior:
- Group membership and rebalancing assign partitions to members.
- Each assigned partition is consumed by at most one member in the same group at a time.
- Consumers track offsets (positions) and commit them for recovery.

### 1.6 Internal Networking and Request Handling

Kafka brokers use a request pipeline:
- Network threads receive requests.
- I/O threads/processors handle produce/fetch/group/metadata APIs.
- Background threads manage replication and log cleanup.

Performance tuning often targets this runtime pipeline: batch sizes, linger time, fetch sizes, compression, and thread utilization.

## 2) Execution Flow (How Kafka Runs)

### 2.1 Write Path: Producer -> Broker -> Replication

1. Producer sends a record batch to the partition leader.
2. Leader appends records to its local log segment.
3. Followers fetch and append the same records.
4. Based on `acks` and ISR state, broker sends success/failure response.

Durability controls:
- `acks=0`: fire-and-forget (lowest latency, weakest durability).
- `acks=1`: leader ack after local write.
- `acks=all` (or `-1`): leader waits for all in-sync replicas (stronger durability).

### 2.2 Replication and ISR (In-Sync Replicas)

Kafka tracks an **ISR** set per partition:
- Replicas in ISR are caught up enough to be considered in-sync.
- If a follower lags too much, it can leave ISR.
- Leader election generally prefers ISR members to minimize data loss risk.

`min.insync.replicas` + `acks=all` is a key production durability pattern.

### 2.3 Read Path: Consumer <- Broker

1. Consumer fetches from partition leaders.
2. Broker returns batches from the requested offset onward.
3. Consumer processes records and advances position.
4. Consumer commits offsets (auto or manual).

Kafka serves reads from disk-backed logs with OS page cache optimization, enabling high throughput.

### 2.4 Group Coordination and Rebalancing

Within a consumer group:
- A coordinator broker tracks members.
- Consumers send heartbeats.
- Membership changes (join/leave/crash) trigger rebalance.
- Partitions are reassigned to active members.

Rebalances are correctness-critical but can pause progress briefly, so stable membership and cooperative assignors are important at scale.

### 2.5 Retention and Log Cleanup

Kafka is a log system, not a queue that deletes immediately after consume.

Cleanup modes:
- **Delete** retention: remove old segments by time/size.
- **Compaction**: keep latest value per key (plus tombstone behavior), useful for changelog/state topics.

This decouples read position from data lifetime.

## 3) Core Concepts You Must Know

### 3.1 Record, Key, Value, Headers, Timestamp

A Kafka record typically has:
- key (optional, critical for partitioning/order),
- value (payload),
- headers (metadata),
- timestamp (event/append time),
- offset (assigned by broker within a partition).

### 3.2 Ordering Guarantees

Kafka guarantees order **within a partition**, not across all partitions of a topic.

Implication:
- If per-entity ordering matters, use a stable key so all records for that entity map to the same partition.

### 3.3 Offsets and Delivery Semantics

Offsets define consumption progress.

Common semantics:
- **At-most-once**: commit before processing (possible loss).
- **At-least-once**: process then commit (possible duplicates).
- **Exactly-once** (EOS): transactional/idempotent patterns to avoid duplicates in end-to-end pipelines.

### 3.4 Idempotent Producers and Transactions

- **Idempotent producer** avoids duplicates caused by retries.
- **Transactional producer** can atomically write to multiple partitions and coordinate with consumed offsets in stream processing patterns.

These features increase correctness, with added operational/config complexity.

### 3.5 Throughput vs Latency Trade-offs

Kafka tuning is trade-off driven:
- Larger batches + compression -> higher throughput, often higher latency.
- Smaller batches + low linger -> lower latency, lower throughput efficiency.
- More partitions -> more parallelism, but higher metadata and coordination overhead.

### 3.6 Fault Tolerance and Availability

Availability depends on:
- replication factor,
- ISR health,
- leader election behavior,
- broker/controller quorum health.

A durable setup usually combines:
- replication factor >= 3,
- `acks=all`,
- appropriate `min.insync.replicas`,
- resilient controller quorum and broker placement.

## 4) Mental Model (One-Minute Version)

Kafka is a distributed, replicated, append-only log system:
- Producers append records to partition leaders.
- Leaders replicate to followers.
- Consumers read by offset at their own pace.
- Retention/compaction controls data lifecycle independently of consumption.

Everything else (groups, rebalances, transactions, compaction) is built around making this model scalable, durable, and operationally safe.

## 5) Practical Checklist for Real Systems

- Choose partition key strategy first (drives ordering and load distribution).
- Set replication and durability policy (`acks`, `min.insync.replicas`) intentionally.
- Monitor consumer lag, rebalance frequency, ISR shrink events, and under-replicated partitions.
- Size topic partitions based on both throughput and long-term operational cost.
- Test failure scenarios (broker down, slow follower, coordinator failover, rolling upgrade).

