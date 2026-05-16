# Sample RAG Q&A (for testing retrieval quality)

## Q: How do we deploy services?

**Expected sources:** `runbooks/deploy-services.md`, `golden-paths/deploy-app.md`

**Answer shape:** GitOps via Argo CD; merge to main → image PR → staging → canary prod; rollback via Git revert or `argocd app rollback`.

---

## Q: How do Kafka retries work here?

**Expected sources:** `runbooks/kafka-retries.md`, `golden-paths/kafka-integration.md`

**Answer shape:** 3 retries with exponential backoff, then DLQ; idempotency via business key storage.

---

## Q: Which service owns payments?

**Expected sources:** Backstage `catalog-info.yaml`, service README

**Answer:** `payment-service`, team `payments-team`, system `payments`.
