# AWS IAM — Questions & Answers

This file records questions and answers from the IAM learning session.

---

## Q1: List IAM concepts

**Question:** List IAM concepts

**Answer:**

AWS Identity and Access Management (IAM) is the service that controls **who** can access AWS resources and **what** they can do. Core concepts:

### Identity (who)

| Concept | Description |
|---------|-------------|
| **Root user** | The account owner created when you sign up. Has full access to everything. Avoid using it for day-to-day work. |
| **IAM user** | A named identity with long-term credentials (password, access keys). Best for humans or legacy apps. |
| **IAM group** | A collection of users. Used to attach permissions to multiple users at once (e.g. `Developers`, `Admins`). Groups cannot be nested and cannot be granted permissions directly to other groups. |
| **IAM role** | An identity with temporary credentials. Assumed by users, applications, or AWS services. Preferred over users for apps and cross-account access. |
| **Service-linked role** | A special role linked to an AWS service (e.g. Lambda, ECS). The service creates and often manages it. |
| **Identity Center (SSO)** | Successor to IAM for workforce access. Central sign-in to multiple AWS accounts and apps (SAML/OIDC). |

### Credentials (how they prove identity)

| Concept | Description |
|---------|-------------|
| **Password** | Console sign-in for IAM users. |
| **Access keys** | Access Key ID + Secret Access Key for programmatic API/CLI access. Long-term; rotate regularly. |
| **Multi-factor authentication (MFA)** | Extra factor (TOTP, hardware key, SMS) required at sign-in. Strongly recommended for root and privileged users. |
| **Temporary security credentials** | Short-lived keys from STS when assuming a role or using federated access. Expire automatically. |
| **Session token** | Part of temporary credentials; used with SigV4 signing. |

### Authorization (what they can do)

| Concept | Description |
|---------|-------------|
| **Policy** | JSON document defining **Allow** or **Deny** for actions on resources under conditions. |
| **Identity-based policy** | Attached to a user, group, or role. Defines what that identity can do. |
| **Resource-based policy** | Attached to a resource (e.g. S3 bucket, KMS key, Lambda). Defines who can access that resource. |
| **Permissions boundary** | Maximum permissions an identity can have. Does not grant access by itself. |
| **Service control policy (SCP)** | Applied at AWS Organizations level. Sets guardrails for accounts in the org. |
| **Session policy** | Passed when assuming a role; further restricts the session. |
| **Inline policy** | Embedded directly on one user, group, or role. |
| **Managed policy** | Standalone reusable policy. **AWS managed** (by AWS) or **customer managed** (by you). |

### Policy structure (how policies are written)

| Element | Purpose |
|---------|---------|
| **Version** | Policy language version (always `"2012-10-17"`). |
| **Statement** | Array of permission blocks. |
| **Effect** | `Allow` or `Deny`. **Explicit Deny always wins.** |
| **Action** | API operations (e.g. `s3:GetObject`, `ec2:RunInstances`). |
| **Resource** | ARN(s) the statement applies to. |
| **Principal** | Who the policy applies to (mainly in resource-based policies). |
| **Condition** | Optional constraints (IP, MFA present, tags, time, etc.). |

### Access evaluation

| Concept | Description |
|---------|-------------|
| **Default deny** | Everything is denied unless explicitly allowed. |
| **Explicit deny** | Overrides any allow. |
| **Least privilege** | Grant only the minimum permissions needed. |
| **Policy evaluation logic** | AWS evaluates all applicable policies; order is: explicit deny → SCPs → permissions boundaries → session policies → identity and resource policies. |

### Federation & external identities

| Concept | Description |
|---------|-------------|
| **SAML 2.0 federation** | Enterprise IdP (e.g. Active Directory, Okta) authenticates users; AWS trusts assertions and issues temporary credentials. |
| **OIDC / Web identity** | Mobile/web apps use Cognito or other OIDC providers. |
| **IAM Roles Anywhere** | On-premises or non-AWS workloads use X.509 certificates to assume roles. |
| **Trust policy** | Resource-based policy on a role defining **who can assume** it (principals, conditions). |

### Security & governance

| Concept | Description |
|---------|-------------|
| **Access Analyzer** | Finds resources shared with external entities; validates policies. |
| **Credential report** | CSV of all IAM users and credential status (password age, key age, MFA). |
| **Access Advisor** | Shows when services were last used by a user/role (helps right-size permissions). |
| **CloudTrail** | Logs API calls; essential for auditing IAM changes. |
| **Password policy** | Account-wide rules for IAM user passwords (length, complexity, rotation). |
| **Tags on IAM** | Metadata on users, roles, policies for cost/ownership/governance. |

### Common patterns

| Pattern | Use case |
|---------|----------|
| **Role for EC2/Lambda/EKS** | Instance or function assumes a role; no static keys on the server. |
| **Cross-account role** | Account A assumes a role in Account B with a trust policy. |
| **Permission sets (Identity Center)** | Bundle of policies assigned to users/groups per AWS account. |
| **Break-glass / emergency access** | Highly restricted, audited admin role for incidents. |

### Key services that interact with IAM

- **STS (Security Token Service)** — Issues temporary credentials.
- **AWS Organizations** — SCPs and account structure.
- **KMS** — Key policies are resource-based IAM policies.
- **S3, Lambda, SNS, SQS** — Often use resource-based policies.
- **IAM Identity Center** — Workforce SSO across accounts.

### Quick mental model

```
Identity (user / group / role)
    ↓ has credentials (long-term or temporary via STS)
    ↓ attached policies (identity-based)
    ↓ evaluated against resource policies, SCPs, boundaries, conditions
    ↓
Allow or Deny access to AWS API actions on resources
```

---

## Q2: Explain Policy format with examples

**Question:** Explain Policy format with examples

**Answer:**

An IAM policy is a JSON document. Every policy has the same top-level shape:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "OptionalStatementId",
      "Effect": "Allow",
      "Action": "service:Operation",
      "Resource": "arn:aws:service:region:account-id:resource"
    }
  ]
}
```

### Top-level fields

| Field | Required | Description |
|-------|----------|-------------|
| `Version` | Yes | Policy language version. Always use `"2012-10-17"`. |
| `Statement` | Yes | Array of one or more permission blocks. |
| `Id` | No | Optional identifier for the whole policy (common in trust policies). |

### Statement fields

| Field | Required | Description |
|-------|----------|-------------|
| `Sid` | No | Short label for the statement (helps debugging). |
| `Effect` | Yes | `"Allow"` or `"Deny"`. Explicit Deny always wins. |
| `Action` | Usually | API operations allowed/denied (e.g. `s3:GetObject`). Can be a string or array. |
| `NotAction` | Usually | Inverse of Action — everything *except* listed actions. |
| `Resource` | Usually | ARN(s) the statement applies to. Can be a string or array. |
| `NotResource` | Usually | Inverse of Resource. |
| `Principal` | Sometimes | **Who** the policy applies to. Required in resource-based and trust policies; omitted in identity-based policies. |
| `Condition` | No | Optional constraints (IP, MFA, tags, time, etc.). |

> **Rule of thumb:** Identity-based policies (on users/groups/roles) use `Action` + `Resource`. Trust policies and resource-based policies also need `Principal`.

---

### Example 1 — Minimal identity-based policy (S3 read)

Grants read-only access to objects in one bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::my-app-bucket",
        "arn:aws:s3:::my-app-bucket/*"
      ]
    }
  ]
}
```

- `arn:aws:s3:::my-app-bucket` — the bucket itself (needed for `ListBucket`)
- `arn:aws:s3:::my-app-bucket/*` — all objects inside the bucket (needed for `GetObject`)

---

### Example 2 — Wildcards in Action and Resource

Allow all read actions on any S3 bucket in the account:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3ReadOnly",
      "Effect": "Allow",
      "Action": [
        "s3:Get*",
        "s3:List*"
      ],
      "Resource": "*"
    }
  ]
}
```

| Wildcard | Meaning |
|----------|---------|
| `s3:Get*` | All actions starting with `Get` (e.g. `GetObject`, `GetBucketLocation`) |
| `s3:List*` | All actions starting with `List` |
| `*` (Resource) | All resources (use sparingly — violates least privilege) |

---

### Example 3 — Multiple statements in one policy

Each statement is evaluated independently:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowEC2Describe",
      "Effect": "Allow",
      "Action": "ec2:Describe*",
      "Resource": "*"
    },
    {
      "Sid": "AllowRunInstancesInSubnet",
      "Effect": "Allow",
      "Action": "ec2:RunInstances",
      "Resource": [
        "arn:aws:ec2:eu-west-1:123456789012:subnet/subnet-abc123",
        "arn:aws:ec2:eu-west-1:123456789012:instance/*",
        "arn:aws:ec2:eu-west-1::image/ami-*",
        "arn:aws:ec2:eu-west-1:123456789012:volume/*",
        "arn:aws:ec2:eu-west-1:123456789012:network-interface/*",
        "arn:aws:ec2:eu-west-1:123456789012:security-group/*"
      ]
    },
    {
      "Sid": "DenyTerminateProduction",
      "Effect": "Deny",
      "Action": "ec2:TerminateInstances",
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "ec2:ResourceTag/Environment": "production"
        }
      }
    }
  ]
}
```

This pattern combines broad read access, scoped write access, and an explicit Deny that overrides any Allow.

---

### Example 4 — Conditions

Restrict access by IP, MFA, or tags:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "RequireMFAForSensitiveActions",
      "Effect": "Allow",
      "Action": [
        "iam:DeleteUser",
        "iam:DeleteRole",
        "iam:CreateAccessKey"
      ],
      "Resource": "*",
      "Condition": {
        "Bool": {
          "aws:MultiFactorAuthPresent": "true"
        }
      }
    },
    {
      "Sid": "RestrictToOfficeIP",
      "Effect": "Allow",
      "Action": "s3:*",
      "Resource": "arn:aws:s3:::confidential-data/*",
      "Condition": {
        "IpAddress": {
          "aws:SourceIp": [
            "203.0.113.0/24",
            "198.51.100.50/32"
          ]
        }
      }
    }
  ]
}
```

Common condition operators:

| Operator | Example use |
|----------|-------------|
| `StringEquals` | Exact match on tag or header |
| `StringLike` | Wildcard match (`app-*`) |
| `ArnEquals` / `ArnLike` | Match principal or resource ARN |
| `IpAddress` | Restrict by source IP |
| `Bool` | True/false checks (MFA present) |
| `DateGreaterThan` / `DateLessThan` | Time-bound access |
| `ForAllValues:StringEquals` | All values in a multi-value key must match |

---

### Example 5 — Trust policy (who can assume a role)

Attached to a **role**, not a user. Defines which principals can call `sts:AssumeRole`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::111111111111:root"
      },
      "Action": "sts:AssumeRole",
      "Condition": {
        "StringEquals": {
          "sts:ExternalId": "unique-external-id-12345"
        }
      }
    }
  ]
}
```

Other common `Principal` forms:

```json
"Principal": { "Service": "lambda.amazonaws.com" }
```

```json
"Principal": { "AWS": "arn:aws:iam::111111111111:role/MyAppRole" }
```

```json
"Principal": { "Federated": "arn:aws:iam::111111111111:saml-provider/MyCorp" }
```

```json
"Principal": "*"
```

(`Principal: *` allows anyone — only use with tight Conditions.)

---

### Example 6 — Resource-based policy (S3 bucket policy)

Attached to the **resource** (the bucket), not an IAM identity:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowAccountBRead",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::222222222222:role/DataConsumerRole"
      },
      "Action": [
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::shared-datasets",
        "arn:aws:s3:::shared-datasets/*"
      ]
    }
  ]
}
```

Cross-account access often uses **both**:
1. Resource-based policy on the bucket (allows Account B's role)
2. Identity-based policy on Account B's role (allows `s3:GetObject` on that bucket)

Both sides must allow the action.

---

### Example 7 — NotAction / NotResource (deny-by-exception)

Allow everything EC2-related except terminating instances:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "NotAction": "ec2:TerminateInstances",
      "Resource": "*"
    }
  ]
}
```

Or allow all S3 actions except delete:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "s3:*",
      "NotResource": "arn:aws:s3:::audit-logs/*"
    }
  ]
}
```

Use `NotAction` / `NotResource` carefully — they can accidentally grant broader access than intended.

---

### Example 8 — AWS managed policy (reference)

AWS publishes ready-made policies. `ReadOnlyAccess` is a large managed policy; a small excerpt:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "acm:DescribeCertificate",
        "acm:ListCertificates",
        "acm:GetCertificate"
      ],
      "Resource": "*"
    }
  ]
}
```

Customer-managed policies follow the exact same JSON format — you own and version them.

---

### ARN format reminder

```
arn:aws:service:region:account-id:resource-type/resource-id
```

Examples:

| Resource | ARN |
|----------|-----|
| S3 bucket | `arn:aws:s3:::my-bucket` |
| S3 object | `arn:aws:s3:::my-bucket/path/to/file.txt` |
| IAM role | `arn:aws:iam::123456789012:role/MyRole` |
| EC2 instance | `arn:aws:ec2:eu-west-1:123456789012:instance/i-0abc123` |
| Lambda function | `arn:aws:lambda:eu-west-1:123456789012:function:my-fn` |

Some services (S3, IAM, CloudFront) use a global ARN with no region: `arn:aws:s3:::...`

---

### Evaluation checklist

When reading or writing a policy, ask:

1. **Who** is this attached to? (user, role, bucket, KMS key)
2. **Effect** — Allow or Deny?
3. **Action** — which API calls?
4. **Resource** — which ARNs?
5. **Principal** — needed for trust/resource policies?
6. **Condition** — any extra constraints?
7. Is there an **explicit Deny** that overrides an Allow elsewhere?

```
Request → Explicit Deny? → SCP allows? → Boundary allows? → Identity + Resource policies allow? → Allow / Deny
```

---

## Q3: List typical use cases for allowing users and services to access AWS services?

**Question:** List typical usecases for allowing users and services to access AWS services?

**Answer:**

IAM access patterns fall into two broad groups: **humans** (developers, admins, analysts) and **workloads** (EC2, Lambda, CI/CD, other AWS services). Below are the most common real-world use cases.

---

### Human users — workforce access

| Use case | Typical IAM approach | Example permissions |
|----------|---------------------|---------------------|
| **Developer day-to-day work** | IAM user or (preferred) Identity Center user → role per account | Deploy to dev/staging, read logs, manage non-prod EC2/RDS |
| **Read-only troubleshooting** | Role with `ViewOnlyAccess` or custom read policy | `ec2:Describe*`, `cloudwatch:GetMetricData`, `logs:FilterLogEvents` |
| **Database administrator** | Scoped role with MFA | `rds:*` on specific DB instances; Deny `rds:Delete*` on production |
| **Security / audit team** | Read-only + security tooling roles | CloudTrail, Config, GuardDuty, Access Analyzer — no write |
| **Billing & cost management** | `Billing` or `CostExplorerReadOnly` policies | View invoices, budgets, Cost Explorer — no infrastructure changes |
| **Break-glass / emergency admin** | Highly restricted role, MFA + approval, short session | Full admin only during incidents; CloudTrail alerts on use |
| **Contractor / temporary access** | Identity Center permission set with expiry | Time-limited access to one account/project |
| **Console vs CLI users** | Same identity; password for console, access keys only if needed | Prefer SSO + `aws sso login` over long-lived keys |

**Best practice:** Use **IAM Identity Center (SSO)** for humans; avoid long-lived access keys on IAM users.

---

### AWS compute — applications running on AWS

| Use case | Typical IAM approach | Why roles, not keys |
|----------|---------------------|---------------------|
| **EC2 app reads/writes S3** | Instance profile → IAM role | App gets temporary creds via instance metadata — no keys on disk |
| **Lambda calls DynamoDB / S3 / SNS** | Execution role on the function | AWS injects creds automatically per invocation |
| **ECS / Fargate task** | Task role (+ optional task execution role for ECR/logs) | Containers assume role at runtime |
| **EKS pod workload** | IRSA (IAM Roles for Service Accounts) or Pod Identity | Fine-grained per-pod/per-service permissions |
| **Elastic Beanstalk / Elastic Container Service** | Service-linked + custom task/instance roles | Platform-managed + app-specific policies |
| **Batch / Glue / EMR jobs** | Job role | Job accesses data lake (S3), catalog (Glue), secrets |

**Pattern:** `{Service}Role` attached to the resource; policy grants least privilege to downstream services (S3, SQS, Secrets Manager, etc.).

---

### Service-to-service (within one account)

| Use case | How access is granted |
|----------|----------------------|
| **Lambda triggered by S3** | S3 needs permission to invoke Lambda (resource policy on function); Lambda role needs S3 read |
| **EventBridge → Lambda / Step Functions** | Target resource policy allows `events.amazonaws.com` to invoke |
| **API Gateway → Lambda / DynamoDB** | Integration role or Lambda resource policy |
| **CloudWatch Logs subscription → Lambda / Kinesis** | Lambda/Kinesis resource policy trusts logs service |
| **SNS → SQS / Lambda** | Queue/function policy allows SNS principal |
| **Step Functions orchestration** | State machine role can invoke Lambda, ECS, DynamoDB, etc. |
| **CodePipeline deploys to ECS/EKS/CloudFormation** | Pipeline service role with deploy permissions |

**Pattern:** Often **two policies** — caller's identity policy + callee's resource policy (where the service supports it).

---

### Cross-account access

| Use case | Typical setup |
|----------|---------------|
| **Shared services account** | Logging, DNS, CI/CD, ECR in account A; workload accounts assume roles in A |
| **Central data lake** | Data account owns S3; consumer accounts' roles get `s3:GetObject` via bucket policy + identity policy |
| **Audit / security read-only** | Security account assumes `OrganizationAccountAccessRole` or custom audit role in member accounts |
| **Partner / vendor access** | Role in your account with `ExternalId` condition; vendor assumes role from their account |
| **Multi-account landing zone** | Identity Center permission sets map users → roles in dev/staging/prod accounts |
| **Cross-account KMS decrypt** | CMK key policy allows foreign account/role; caller role has `kms:Decrypt` |

**Pattern:** Role in target account + **trust policy** (who can assume) + **identity policy** on caller + sometimes **resource policy** on shared resource.

---

### CI/CD & automation

| Use case | Typical IAM approach |
|----------|---------------------|
| **GitHub Actions / GitLab CI → AWS** | OIDC federation → role (no static keys in repo) |
| **CodeBuild / CodePipeline** | Service role per pipeline; scoped to ECR push, CloudFormation deploy, S3 artifact bucket |
| **Terraform / OpenTofu runner** | Role with broad infra permissions in target account; state bucket + DynamoDB lock table access |
| **Ansible / deployment bastion** | Assumed role with time-bound session; CloudTrail audit |
| **Automated testing** | Ephemeral role in test account; create/destroy resources, no prod access |

**Best practice:** **OIDC** (`token.actions.githubusercontent.com`) instead of access keys in CI secrets.

---

### Data & storage access

| Use case | Access pattern |
|----------|----------------|
| **App uploads/downloads user files** | Role: `s3:PutObject`, `s3:GetObject` on `bucket/uploads/${aws:username}/*` with prefix condition |
| **Analytics on S3 data lake** | Athena/Glue role: read specific prefixes; Lake Formation for column/row-level security |
| **Backup / replication** | AWS Backup service role; S3 replication role with read source / write destination |
| **CloudFront serves private S3** | OAI/OAC on distribution; bucket policy allows CloudFront principal only |
| **RDS / Aurora access from app** | App role does **not** need RDS API — uses DB auth; optional `rds-db:connect` for IAM database auth |
| **Secrets in Secrets Manager / SSM** | Compute role: `secretsmanager:GetSecretValue` on specific secret ARNs |

---

### Security, monitoring & compliance

| Use case | Access needed |
|----------|---------------|
| **CloudTrail log delivery** | Trail role / S3 bucket policy for `cloudtrail.amazonaws.com` |
| **Config recorder** | Service-linked role records resource changes |
| **GuardDuty / Security Hub** | Service-linked roles; admin roles for human triage |
| **VPC Flow Logs → S3 / CloudWatch** | Delivery role or log group permissions |
| **Cross-account centralized logging** | Member accounts' CloudWatch Logs subscription filter → central account Kinesis/Firehose |

---

### Federation & hybrid / on-premises

| Use case | Approach |
|----------|----------|
| **Corporate SSO (Okta, Entra ID, AD)** | SAML or OIDC → Identity Center or IAM federation → AWS roles |
| **Mobile / web app users** | Cognito User Pool + identity pool → temporary AWS creds for limited S3/DynamoDB access |
| **On-prem servers need AWS APIs** | IAM Roles Anywhere (X.509 certs) or long-lived keys (discouraged) |
| **VPN / Direct Connect workloads** | Same as on-prem — roles with IP or VPC endpoint conditions |

---

### Common permission "bundles" by persona

| Persona | Often needs access to |
|---------|----------------------|
| **Frontend developer** | S3 (static assets), CloudFront, maybe Lambda/API Gateway in dev |
| **Backend developer** | Lambda/ECS, DynamoDB/RDS, SQS/SNS, Secrets Manager, CloudWatch Logs |
| **Platform / DevOps** | EKS/ECS, IAM (limited), CloudFormation/Terraform state, ECR, networking |
| **Data engineer** | Glue, Athena, S3 data lake, EMR, Redshift, Lake Formation |
| **SRE / on-call** | CloudWatch, Logs, X-Ray, read-only infra, maybe SSM Session Manager to EC2 (no SSH keys) |

---

### Decision guide — which identity type?

```
Human in browser/CLI?
  → Identity Center (SSO) user → Permission set → Role in account
  → Avoid IAM users with access keys unless legacy requirement

Code running on AWS (EC2/Lambda/ECS/EKS)?
  → IAM role attached to the resource (instance profile, execution role, task role, IRSA)

External system (GitHub, partner account, on-prem)?
  → IAM role with trust policy (OIDC, SAML, AWS principal + ExternalId, Roles Anywhere)

Another AWS service calling your resource?
  → Resource-based policy on Lambda/S3/KMS/SQS granting that service principal
```

---

### Anti-patterns to avoid

| Anti-pattern | Better approach |
|--------------|-----------------|
| Root user for daily tasks | SSO + roles; lock root behind MFA, use only for account-level tasks |
| Long-lived access keys on EC2/Lambda | Instance profile / execution role |
| One shared "admin" IAM user for the team | Individual identities via Identity Center |
| `AdministratorAccess` for developers | Scoped roles per environment (dev vs prod) |
| Hard-coded keys in GitHub/GitLab | OIDC federation to IAM role |
| `Resource: "*"` everywhere | Scope to specific ARNs and use conditions |

---
