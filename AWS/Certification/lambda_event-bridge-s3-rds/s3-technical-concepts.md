# Amazon S3 — Technical Concepts

S3 is **object storage**: you store **objects** (files + metadata) in **buckets**. In your architecture it is both the **ingestion landing zone** and a natural place for **outputs** (processed files, reports, error blobs).

## Buckets, keys, and prefixes

- **Bucket**: Globally unique name; lives in one **Region**; holds unlimited objects.
- **Key**: The object’s identifier within the bucket (often looks like a path: `incoming/2026/04/job-123.csv`).
- **Prefix**: A logical folder; useful for lifecycle rules, permissions, and EventBridge/Lambda filtering.

## Data consistency and durability

- **Durability**: Extremely high for standard storage; built for eleven nines object durability over a year (design assumption for exam and architecture discussions).
- **Read-after-write consistency**: New object **PUT**s are readable immediately; overwrites and deletes have nuances for some read patterns—design idempotent consumers for pipeline workloads.

## Eventing for “auto-land” workflows

- When objects arrive (`PutObject`, multipart complete, cross-region replication completion, etc.), you can trigger processing via:
  - **S3 Event Notifications**, or
  - **Amazon EventBridge** (S3 as event source on the default bus).
- Events include **bucket**, **key**, **size**, **etag**, **event name**, and principal info—enough for Lambda to **open and process** the object.

## Security and access

- **Bucket policies** (resource-based) and **IAM identities** (user/role policies) together enforce who can read/write.
- **Block Public Access**: Keep enabled unless you have a deliberate public asset pattern.
- **Encryption**:
  - **SSE-S3** (AWS-managed keys)
  - **SSE-KMS** (CMKs; adds IAM/KMS permissions and throttling awareness)
  - **DSSE** / client-side options for stricter models
- **VPC endpoints** (Gateway endpoint for S3) are common in private-network designs so Lambda in a VPC can reach S3 without public internet paths.

## Performance and large objects

- **Multipart upload** for large files; completion can be the event you process.
- **Transfer acceleration** for wide-area uploads (optional).
- For huge datasets, consider whether **S3 Select** or splitting work across many smaller objects improves parallelism.

## Storage classes and lifecycle

- **Standard**, **Intelligent-Tiering**, **IA**, **Glacier** tiers trade cost vs retrieval latency.
- **Lifecycle rules** transition or expire prefixes (e.g. delete raw uploads after N days once curated in RDS and outputs are verified).

## Versioning and integrity

- **Versioning** protects against accidental overwrites and supports recoverability; events may include versionId.
- **Checksums** (SDK-supported algorithms) help validate end-to-end integrity.

## Lambda interaction patterns

- Lambda uses **IAM** and typically the **AWS SDK** to `GetObject` / `PutObject` (or streaming APIs).
- Keep **least privilege** on input/output prefixes; separate **quarantine** prefixes for suspicious files if you scan or validate.

## In this pipeline’s role

- **Input path**: Users or upstream systems land files; **EventBridge** notifies Lambda.
- **Output path**: Lambda writes transformed data, manifests, or error details; **RDS** holds structured/queryable results while S3 holds blobs and bulk artifacts.

---

*Last updated: 2026-04-05*
