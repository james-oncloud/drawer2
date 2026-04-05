# Amazon EventBridge — Technical Concepts

EventBridge is an **event bus** for routing events between AWS services and custom applications. In your design it both **carries S3 notifications** (when configured) and **signals completion** after Lambda finishes processing.

## Core vocabulary

- **Event bus**: A named pipeline for events; the default bus exists per account/region; you can create **custom** buses for isolation or multi-tenant patterns.
- **Event**: A JSON envelope with **source**, **detail-type**, **detail** (payload), **resources**, and metadata (`time`, `region`, `account`, `id`).
- **Rule**: Matches incoming events (pattern) and **routes** them to one or more **targets** (Lambda, SQS, Step Functions, buses, API destinations, etc.).

## EventBridge vs “direct” S3 notifications

- **S3 Event Notifications** can send to SNS, SQS, or Lambda **directly**.
- **S3 event notification integration with EventBridge** sends S3 events onto the **default event bus** as `aws.s3` events, giving you **filtering**, **fan-out**, **archive/replay** (with appropriate setup), and a consistent event model alongside **custom** application events.

Patterns you care about for object landing:

- Filter on **bucket name**, **object key prefix/suffix**, and **event name** (e.g. `Object Created`).
- Route matching events to your **processor Lambda**.

## Rules and patterns

- **Event pattern** matching is **declarative** (structure-based), not arbitrary code.
- A single rule can target **multiple targets** (parallel fan-out).
- **Input transformer** can reshape the event before it reaches the target (reduce payload size, map fields).

## Targets and delivery

- **Lambda target**: EventBridge invokes the function **asynchronously** (retries on errors depending on configuration); align with Lambda **DLQ**/destinations for poison messages.
- **Dead-letter and replay**: For operational resilience, pair rules with **DLQs** or monitoring where the integration supports it; **event archive and replay** helps recover from logical errors after fixes.

## Custom completion events

After processing, Lambda (via SDK `PutEvents`) publishes a **custom** event, for example:

- **Source**: `myapp.processor` (reverse-DNS style is conventional).
- **Detail-type**: e.g. `ProcessingCompleted` or `ProcessingFailed`.
- **Detail**: JSON with `jobId`, `bucket`, `key`, row counts, output URIs, error codes—whatever downstream consumers need.

Consumers can subscribe with **separate rules** without changing the producer’s core logic beyond the event contract.

## Permissions and security

- **Resource-based policies** on custom buses; rules live on a bus and need permission to invoke targets.
- Lambda **resource policy** must allow `events.amazonaws.com` to invoke the function when used as a target.
- For `PutEvents`, the caller needs `events:PutEvents` on the bus.

## Ordering, duplicates, and latency

- EventBridge does **not** guarantee strict global ordering across events.
- At-least-once semantics are typical; **deduplicate** in Lambda using stable identifiers if needed.
- End-to-end latency is usually low but not hard real-time; tune timeouts and retries accordingly.

## In this pipeline’s role

1. **Inbound**: S3 object-created events (on the default bus) match a rule and **invoke Lambda**.
2. **Outbound**: Lambda **emits** completion (or failure) events so dashboards, workflows, or other services react without polling S3.

---

*Last updated: 2026-04-05*
