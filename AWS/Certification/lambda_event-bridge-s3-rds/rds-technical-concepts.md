# Amazon RDS — Technical Concepts

Amazon **Relational Database Service (RDS)** manages **relational engines** (PostgreSQL, MySQL/MariaDB, Oracle, SQL Server, Db2) with backups, patching, and failover options. In your pipeline, RDS is the **system of record** for structured outcomes, metrics, or lineage while **S3** holds files.

## Instances, engines, and connectivity

- **DB instance**: A managed server running your chosen engine and version.
- **Endpoint**: Hostname + port your app uses; in private architectures the instance often has **no public accessibility**.
- **Networking**: RDS lives in **subnets**; **security groups** control who may connect. Lambda must share **VPC routing** and **allowed security group rules** with RDS.

## Connection handling from Lambda

- Open a **new connection per invocation** only if cheap and volume is low; otherwise use **RDS Proxy** for **connection pooling**, faster failover handling, and IAM auth integration (depending on engine).
- Set **timeouts**, **pool limits**, and **SSL/TLS** as required by policy.
- Store secrets in **Secrets Manager** (rotation optional) and cache the ARN in environment variables—not plaintext passwords in code.

## Schemas and transactional design

- Use **transactions** where multiple rows/tables must commit together.
- For ingest pipelines, common patterns include:
  - **Staging tables** then merge to “golden” tables.
  - **Natural keys** or **job IDs** for **idempotent** upserts when S3/EventBridge may duplicate delivery.
  - **Status tables** (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`) correlated with S3 keys.

## Backup, recovery, and maintenance

- **Automated backups** and **point-in-time recovery (PITR)** within the retention window.
- **Snapshots** for long-lived copy/restore and cross-region DR.
- **Maintenance windows** for minor upgrades; major version upgrades need planning.

## Read scaling and replicas

- **Read replicas** offload read traffic; **promotion** turns a replica into a standalone primary for DR scenarios.
- Aurora (family related to RDS-style operations) separates storage and compute; still relevant conceptually for pooled storage and replicas—choose engine based on requirements.

## Performance Insights and monitoring

- **Performance Insights** shows DB load and top SQL.
- **CloudWatch metrics**: CPU, memory, connections, IOPS, lag for replicas—alert on connection exhaustion when many Lambdas scale out.

## Multi-AZ and failover

- **Multi-AZ** synchronous standby for **high availability**; failovers are automated; apps should use **DNS endpoint** and reconnect on failure.

## Security

- **Encryption at rest** (KMS) and **in transit** (TLS).
- **IAM database authentication** (where supported) reduces long-lived password sprawl.
- **Subnet isolation** and **least-privilege security groups** are baseline.

## Cost levers

- **Instance class**, **storage** type/size, **IOPS**, backups beyond free allocation, and **cross-AZ** traffic—important when Lambda triggers burst large write loads.

## In this pipeline’s role

After Lambda reads the **S3 object**, it parses/transforms and **writes durable structured data** to RDS (and may write artifacts back to S3). Downstream analytics or APIs can query RDS while EventBridge carries **completion** signals for orchestration or monitoring.

---

*Last updated: 2026-04-05*
