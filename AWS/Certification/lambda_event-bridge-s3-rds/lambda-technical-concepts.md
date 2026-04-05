# AWS Lambda — Technical Concepts

This note covers core Lambda ideas that matter when you run compute in response to **S3 object events** (often delivered via **EventBridge**), process data, write results to **S3** and **RDS**, and emit follow-up events.

## Execution model

- **Function**: Your packaged code plus configuration (runtime, memory, timeout, IAM role, environment variables).
- **Invocation**: Each trigger call can run a new concurrent execution; Lambda scales by creating more execution environments until you hit account concurrency limits or a configured **reserved concurrency** on the function.
- **Execution environment**: A sandbox (OS + runtime) reused across invocations when possible; **cold start** when a new environment is provisioned; **warm start** when an existing one is reused.

## Triggers and the event object

- The **event** shape depends on the integration (e.g. S3 via EventBridge, direct invoke, API Gateway). Your handler must parse the correct fields (bucket, key, event name, etc.).
- **Asynchronous** invokes (many AWS integrations) retry on failure with backoff; configure a **dead-letter queue (DLQ)** or **failure destination** for exhausted retries.

## Networking and RDS

- By default, Lambda runs in an AWS-managed network that reaches the public internet and many AWS APIs but **not** private VPC resources.
- To reach **RDS in a private subnet**, attach the function to **VPC subnets** and **security groups**: the function needs outbound rules that allow traffic to the RDS security group on the DB port; RDS must allow inbound from the Lambda security group.
- **Elastic network interfaces (ENIs)** in your VPC can affect **cold start** and **scaling**; use appropriately sized subnets and be aware of IP capacity.

## IAM and permissions

- The function’s **execution role** needs:
  - **Read** from the input S3 prefix (and **write** to the output prefix if applicable).
  - **Secrets Manager** or **SSM Parameter Store** access if credentials or connection strings are stored there (preferred over hard-coding).
  - **RDS** is reached over the network; IAM database authentication is optional depending on engine and how you connect.
- Principle of least privilege: scope S3 actions and ARNs to the buckets/prefixes you actually use.

## Configuration levers

- **Memory**: Also proportionally increases **CPU**; tune for CPU-bound vs memory-bound work.
- **Timeout**: Set high enough for download, transform, DB writes, and upload; align with **EventBridge** expectations and **RDS** connection time.
- **Ephemeral storage (`/tmp`)**: Useful for large intermediate files; separate from memory limits.
- **Environment variables**: For non-secret config; use encryption or secrets services for credentials.

## Idempotency and reliability

- The same S3 object or EventBridge delivery may be processed **more than once**; design writes (especially to RDS) to be **idempotent** or use deduplication keys / natural keys.
- For partial failures (e.g. S3 OK but DB fails), consider **compensating actions**, **transaction boundaries**, or **outbox** patterns depending on consistency needs.

## Observability

- **CloudWatch Logs**: Automatic log group per function; structured logging aids correlation with `requestId`.
- **Metrics**: Invocations, errors, duration, throttles; **X-Ray** optional for distributed traces across S3, EventBridge, RDS.

## In this pipeline’s role

Lambda is the **orchestration and compute** step: it reacts to the notification, loads input from S3, applies business logic, persists to RDS, stores artifacts or summaries back to S3, and can **publish a completion (or failure) event** to EventBridge for downstream subscribers.

---

*Last updated: 2026-04-05*
