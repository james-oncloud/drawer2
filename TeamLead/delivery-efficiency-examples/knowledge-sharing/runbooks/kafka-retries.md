# Runbook: Kafka Retries and DLQ

**Owner:** Payments team  
**Service:** payment-service consumers

## How retries work here

1. Consumer processes message
2. On transient failure: retry 3× with backoff (1s, 4s, 16s)
3. On persistent failure: publish to `payment.refund.requested.v1.dlq`
4. Idempotency: `refund_id` stored in Redis (24h TTL)

## Alerts

- `KafkaConsumerLag` — scale consumers or fix slow handler
- `kafka_dlq_publish_total` — inspect DLQ, fix root cause, replay

## Inspect DLQ

```bash
kafka-console-consumer --bootstrap-server $BROKER \
  --topic payment.refund.requested.v1.dlq --from-beginning --max-messages 10
```

## Replay (after fix)

Use platform replay tool — **do not** manually commit offsets without runbook approval.

```bash
platform-cli kafka replay \
  --topic payment.refund.requested.v1.dlq \
  --target payment.refund.requested.v1 \
  --filter 'error_code != PERMANENT'
```

## RAG-friendly FAQ

**Q: Which service owns payment refunds?**  
A: `payment-service` (Backstage: payment-service)

**Q: How do Kafka retries work here?**  
A: 3 retries then DLQ; see sections above.
