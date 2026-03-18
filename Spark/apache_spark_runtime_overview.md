# How Apache Spark Works

Apache Spark is a **distributed data processing engine** designed to run large-scale workloads fast by parallelizing work across many machines and keeping as much as possible in memory.

## Core Idea

Spark takes your high-level code (SQL, DataFrame, Python/Scala/Java/R APIs), builds an execution plan, splits it into many small tasks, and runs those tasks in parallel on a cluster.

---

## Runtime Components (Who Does What)

- `Driver`
  - Runs your application's main process.
  - Creates SparkSession/SparkContext.
  - Builds the logical and physical execution plan.
  - Schedules tasks and tracks job progress.

- `Cluster Manager` (resource allocator)
  - Decides where resources come from.
  - Could be Spark Standalone, YARN, Kubernetes, or Mesos.
  - Launches executor processes.

- `Executors`
  - JVM processes on worker nodes.
  - Execute tasks sent by driver.
  - Store cached data and shuffle data.
  - Report status/results back to driver.

- `Worker Nodes`
  - Machines hosting executors.

- `SparkSession` / `SparkContext`
  - Main entry point in user code.
  - Interface between your code and Spark runtime.

---

## Execution Model (How Work Runs)

### 1) Lazy Transformations
Operations like `select`, `filter`, `join`, `map` are **lazy**: Spark does not run them immediately.  
It records them as a lineage/DAG.

### 2) Action Triggers Execution
An action like `count`, `collect`, `write`, `show` triggers execution.

### 3) DAG -> Stages -> Tasks
- Spark builds a **DAG** (directed acyclic graph) of operations.
- Splits into **stages** at shuffle boundaries.
- Each stage contains many **tasks** (usually one task per partition).
- Tasks run in parallel on executors.

### 4) Shuffle
If data must be redistributed (e.g., `groupBy`, `join` on keys), Spark performs a **shuffle**:
- Writes intermediate data,
- Moves data across network,
- Reads/merges on target executors.
This is often the most expensive part.

---

## Key Concepts You Should Know

- `Partition`
  - Small chunk of dataset; unit of parallelism.
  - More partitions = more parallel tasks (to a point).

- `RDD`
  - Low-level resilient distributed dataset API (functional transformations).

- `DataFrame / Dataset`
  - Higher-level structured APIs.
  - Usually preferred: better optimizer support, simpler code.

- `Lineage`
  - Spark remembers how data was derived.
  - Enables fault recovery by recomputing lost partitions.

- `Cache / Persist`
  - Keep reused intermediate data in memory (or memory+disk).
  - Improves iterative workloads and repeated queries.

- `Narrow vs Wide transformations`
  - Narrow: no shuffle needed (`map`, `filter`).
  - Wide: requires shuffle (`groupBy`, `distinct`, many joins).

---

## Spark SQL Optimization Internals

For DataFrame/SQL workloads Spark uses:

- `Catalyst Optimizer`
  - Rule- and cost-based query optimization.
  - Reorders and simplifies plans.

- `Tungsten`
  - Runtime engine optimizations:
  - Better memory management,
  - CPU-efficient execution,
  - Code generation (`whole-stage codegen`).

- `Adaptive Query Execution (AQE)`
  - Re-optimizes plans at runtime using actual stats.
  - Can change join strategy, coalesce partitions, reduce skew impact.

---

## Fault Tolerance

- If an executor fails, tasks are retried elsewhere.
- Lost partitions are recomputed from lineage.
- Shuffle files may be regenerated if needed.
- In streaming, checkpointing/state mechanisms provide recovery.

---

## End-to-End Example (Mental Model)

1. You write: read data -> filter -> join -> groupBy -> write.
2. Spark builds a logical plan.
3. Optimizer rewrites it.
4. Physical plan is chosen.
5. Plan is split into stages around shuffle points.
6. Tasks are scheduled per partition on executors.
7. Results are written out or returned to driver.
