# Golden Path: Kafka Integration

## Topic naming

```
<payment|order|inventory>.<entity>.<event|command>.v<major>
```

Example: `payment.refund.requested.v1`

## Producer

- Avro + Schema Registry
- Idempotency: business key in message key
- Headers: `traceparent`, `correlation-id`, `source-service`

## Consumer

- Consumer group: `<service-name>.<topic-simple-name>`
- Manual ack after successful processing
- Retry: 3 attempts exponential backoff → DLQ `<topic>.dlq`
- Store processed IDs in Redis/DB for at-least-once safety

## Observability

| Metric | Alert threshold |
|--------|-----------------|
| `kafka_consumer_lag` | > 10k for 10m |
| `kafka_dlq_publish_total` | > 0 sustained 5m |
| `processing_duration_seconds` p99 | > 2s |

## Prompt

Use `ai-practices/prompt-library/kafka-consumer.prompt.md` for AI-assisted implementation.
