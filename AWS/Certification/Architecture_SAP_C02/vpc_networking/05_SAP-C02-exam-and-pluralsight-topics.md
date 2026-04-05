# AWS Certified Solutions Architect – Professional (SAP-C02): topics list

## User query

> List course by course topics for AWS Certified Solutions Architect -- Professional (SAP-C02)

## Part A — Official exam blueprint (what SAP-C02 actually tests)

Primary reference: [AWS Certified Solutions Architect - Professional (SAP-C02) — exam guide](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-professional-02/solutions-architect-professional-02.html).

The exam has **75** scored/scorable items that contribute to your result (**65** affect the score in the current guide text), plus **unscored** items. **Pass** is **750** on a **1000** scale. Format: **multiple choice** and **multiple response**. Duration **180** minutes.

### Content domains (scored weightings)

| Domain | Weight | Tasks (summary) |
|--------|--------|-----------------|
| **1. Design Solutions for Organizational Complexity** | **26%** | **1.1** Network connectivity · **1.2** Security controls · **1.3** Reliable / resilient architectures · **1.4** Multi-account environment · **1.5** Cost optimization & visibility |
| **2. Design for New Solutions** | **29%** | **2.1** Deployment strategy · **2.2** Business continuity · **2.3** Security controls · **2.4** Reliability · **2.5** Performance · **2.6** Cost optimization |
| **3. Continuous Improvement for Existing Solutions** | **25%** | **3.1** Operational excellence · **3.2** Security · **3.3** Performance · **3.4** Reliability · **3.5** Cost optimizations |
| **4. Accelerate Workload Migration and Modernization** | **20%** | **4.1** Select workloads to migrate · **4.2** Optimal migration approach · **4.3** New architecture for existing workloads · **4.4** Modernization & enhancements |

Detail for each task (knowledge / skills lists): [Domain 1](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-professional-02/solutions-architect-professional-02-domain1.html), [Domain 2](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-professional-02/solutions-architect-professional-02-domain2.html), [Domain 3](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-professional-02/solutions-architect-professional-02-domain3.html), [Domain 4](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-professional-02/solutions-architect-professional-02-domain4.html).

### Emerging (pretest) topics in the guide

Examples called out in the guide: **Amazon Bedrock Guardrails**, **AgentCore Identity**, **Step Functions** for human-in-the-loop AI workflows. These may appear as **pretest** (non-scoring) items.

### Supporting AWS docs

- [Technologies and concepts](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-professional-02/sap-technologies-concepts.html) (topic buckets: compute, database, HA, migration, networking, security, serverless, storage, etc.)
- [In-scope services](https://docs.aws.amazon.com/aws-certification/latest/solutions-architect-professional-02/sap-02-in-scope-services.html)

---

## Part B — Pluralsight path: course-by-course topics

Source: [AWS Certified Solutions Architect -- Professional (SAP-C02) path](https://www.pluralsight.com/paths/aws-certified-solutions-architect-professional-sap-c02) (~**15** courses, **1** lab, ~**48** hours advertised). Below, **modules** and **clip titles** are taken from each course’s public table of contents (April 2026).

### Updated SAP-C02 series (rolling release)

#### 1. AWS Certified Solutions Architect - Professional (SAP-C02): **Certification Essentials**

- **Author:** David Blocher · **Level:** Advanced · **~12m**
- **Topics:** Exam format · Prerequisites · Exam guide walk-through · Scheduling the exam

#### 2. AWS Certified Solutions Architect - Professional (SAP-C02): **Design Solutions for Organizational Complexity**

- **Author:** Craig Arcuri · **~4h 15m** · Aligns to **exam Domain 1**
- **Network Connectivity Strategies in AWS:** VPC peering · Peering demo · Transit Gateway · TGW demo · Remote / on-prem to VPC · Direct Connect · VPC / on-prem configurations · Multi-Region · Flow logs & troubleshooting · VPC endpoints · Service endpoint demo
- **Enterprise Security Posture:** Cross-account access · Cross-account S3 demo · Cross-account policy evaluation · Third-party IdP federation · Data at rest & in transit · Centralized security events · IAM Access Analyzer demo · IAM Identity Center · STS & LDAP
- **Disaster Recovery & Resilience:** RTO/RPO · Auto-recovery · Backup & recovery options · Scaling options · AMI backup demo · AWS Backup demo
- **Multi-account (Organizations):** Organizations overview · SCPs · Orgs/OU/SCP demo · SCP allow/deny patterns · Control Tower · Landing zone demo · Multi-account events · StackSets & Service Catalog
- **Cost optimization tools:** Cost tooling overview · Cost Anomaly Detection demo · Cost allocation · EC2 purchase/billing options
- **Exam tips:** Network mind map · Organizations mind map · Scenario studies (2 parts)

#### 3. AWS Certified Solutions Architect - Professional (SAP-C02): **Design for New Solutions**

- **Author:** Craig Arcuri · **~6h 16m** · Aligns to **exam Domain 2**
- **Modern Data Management:** New data on AWS · Advanced S3 · Exposing S3 data · ETL · OpenSearch · DynamoDB · DynamoDB access patterns demo · RDS · Backups · Aurora · Redshift · Streams
- **Classic Compute:** EC2 · AMIs · Custom AMI demo · EBS · Systems Manager · Elastic Beanstalk · Elasticity & HA · Unhealthy ASG troubleshooting demo · Securing connections to data
- **Containers:** Containers on AWS · Fargate · Fargate cluster demo · Isolating workloads · Container access to data · ECS compute types
- **Serverless / event-driven:** Serverless concepts · Managing serverless · Lambda · Event-driven design · CloudTrail-trigger demo · SQS · SNS in CloudFormation demo · Event sources · Step Functions · X-Ray · APIs · API Gateway Lambda proxy demo
- **IoT:** IoT Core · Device Management · Ingest/process IoT data · Other IoT services
- **Managed services:** Managed services overview · Rekognition · Textract · Lex · Connect · Dev pipelines · CodePipeline feature demo · AppStream 2.0 · WorkSpaces · MediaConvert · Managed Blockchain · AI managed services overview
- **Global & multi-account:** Hybrid data/apps · On-prem access security · CDN · CloudFront HTTPS demo · Governance across accounts · Advanced Route 53 · Cross-VPC DB access demo · Multi-Region backup · S3 replication demo
- **Security for new solutions:** Least privilege IAM · Secrets · Secrets in CDK demo · Cognito · Macie & sensitive data · Identity federation · Encrypt at rest · EC2→DynamoDB IaC demo · Encrypt in transit · Certificates · WAF · DDoS (Shield/Front/WAF) · Advanced VPC security · Inspector · Security Hub
- **New-solution cost:** Compute Optimizer · Reserved capacity · Org tagging · Tag standards demo · Data transfer costs · Cost monitoring
- **Exam tips:** Mind maps · Scenario studies (2 parts)

#### 4. AWS Certified Solutions Architect - Professional (SAP-C02): **Continuous Improvement for Existing Solutions**

- **Author:** Craig Arcuri · **~4h 45m** · Aligns to **exam Domain 3**
- **Operational excellence:** OpEx intro · X-Ray monitoring/logging · Alerting & auto-remediation · DR validation & tests · CodeBuild/CodeDeploy/CodePipeline · CloudFormation & CDK · SSM State Manager demo · Automation opportunities · EC2 recovery with Lambda/EventBridge demo · Failure injection / resiliency tests
- **Security improvement:** Multi-layer security · Data sensitivity & compliance · Secrets & config · IAM over-permissiveness auditing · Security monitoring & remediation · Patch management · Backup & secure recovery · Auditing & traceability · AWS Config timelines demo
- **Performance:** Performance optimization · Global services for latency · Performance monitoring tools · SLAs & KPIs · Bottlenecks · Rightsizing · Emerging services for performance
- **Reliability:** Reliability in AWS · Global infrastructure · Data replication · Scaling & LB · HA design · Retry logic demo · DR patterns & tools · Service quotas · Service Quotas CLI demo · Eliminate SPOFs · Well-Architected SPOF demo
- **Cost:** Cost optimization overview · Cost-conscious components · Spot/RI/Savings Plans · Networking & data transfer costs · Unused/underutilized resources · Resource cleanup demo · Allocation & tagging · Billing/usage monitoring · Cost and Usage Reports (CUR)
- **Exam tips:** Scenario studies (2 parts)

#### 5. AWS Certified Solutions Architect - Professional (SAP-C02): **Accelerate Workload Migration and Modernization**

- **Author:** Craig Arcuri · **~3h 4m** · Aligns to **exam Domain 4**
- **Select workloads:** Migration essentials · Assessment factors · 7Rs strategies · Application Discovery Service · Migration Evaluator · Migration Hub · Prioritization · App Runner demo
- **Optimal approach:** Migration approach overview · Rehost with MGN · App transfer mechanisms · Database transfer mechanisms · Data transfer services · Security in migration tools · Governance models · MGN rehost demo
- **New architecture for existing workloads:** Rearchitect intro · Compute platforms · Container hosting · Serverless compute · Storage · Databases · Reliability & security in new designs · Containerize legacy on ECS Fargate demo
- **Modernization & enhancements:** Well-Architected · Decoupling · Application integration · Serverless · Container modernization · Purpose-built databases · Analytics & ML enhancements · S3+Lambda+SNS demo
- **Exam prep:** Mind maps · Scenario studies (2 parts)

#### 6. **Lab:** Operate and Validate Amazon RDS Multi-AZ and Read Replica Transitions

- **~45m** · Hands-on on RDS **Multi-AZ** and **read replica** operations (matches themes in Domains 2–4 around databases & reliability).

### Legacy SAP-C02 series (David Blocher) — still on the same path

These are the **older modular** videos; Pluralsight notes some may be **due for refresh**, but they still cover the cert. Use each course page’s **Table of contents** on Pluralsight for the exact clip list.

| Course (short name) | Approx. runtime | Typical focus |
|---------------------|-----------------|---------------|
| **Introduction** | ~19m | Path / cert overview |
| **Data Stores** | ~6h 11m | Databases, storage, data architecture |
| **Networking** | ~6h 38m | VPC, hybrid, connectivity, edge |
| **Security** | ~3h 8m | Identity, protection, compliance patterns |
| **Migrations** | ~1h 54m | Migration patterns & AWS migration tooling |
| **Architecting to Scale** | ~3h 28m | Scale, performance, large designs |
| **Business Continuity** | ~1h 27m | Backup, DR, availability |
| **Deployment and Operations Management** | ~3h 27m | CI/CD, operations, automation |
| **Cost Management** | ~1h 41m | FinOps, billing, optimization |
| **Good Luck!** | ~5m | Exam-day tips |

---

## Part C — Quick map: Pluralsight “new” courses → exam domains

| Pluralsight course (new series) | Primary exam domain(s) |
|--------------------------------|------------------------|
| Certification Essentials | Orientation & logistics (all domains at high level) |
| Design Solutions for Organizational Complexity | Domain 1 |
| Design for New Solutions | Domain 2 |
| Continuous Improvement for Existing Solutions | Domain 3 |
| Accelerate Workload Migration and Modernization | Domain 4 |
| RDS Multi-AZ lab | Domains 2–4 (data reliability / ops) |

---

*Pluralsight specifics (authors, durations) reflect the public path page; AWS percentages and task IDs reflect the English exam guide linked above and can change—always re-check the official guide before you schedule.*
