# Prompt: Kafka Consumer / Producer

```
Implement Kafka {{CONSUMER_OR_PRODUCER}} for topic {{TOPIC_NAME}}.

Follow org golden path: docs/golden-paths/kafka-integration.md

Requirements:
- Consumer group: {{GROUP_ID}}
- Deserialization: Avro via Schema Registry (subject: {{SUBJECT}})
- Idempotency key: {{FIELD}}
- Retry: exponential backoff, max {{MAX_RETRIES}}, then DLQ {{DLQ_TOPIC}}
- Metrics: kafka_consumer_lag, processing_duration_seconds, dlq_publish_total
- Tracing: propagate traceparent from headers

Deliver:
1. Spring @KafkaListener or reactive equivalent
2. Unit tests with embedded/mock broker patterns
3. Testcontainers integration test
4. Runbook snippet for lag and DLQ alerts
```
