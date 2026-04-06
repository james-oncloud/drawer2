# IAM concepts: users, groups, roles, policies, and permissions

## Identity & access model

- **Principal** — An entity that can request actions in AWS (user, role, federated user, application).
- **Authentication** — Proving who the principal is (password, access keys, MFA, federation, IAM Identity Center).
- **Authorization** — Deciding whether a principal may perform an action (evaluated via policies).
- **Resource** — An AWS object APIs act on (S3 bucket, EC2 instance, IAM user, etc.).
- **Action** — API operation, often written `service:Action` (e.g. `s3:GetObject`).
- **Request context** — Who is calling, from where, time, whether MFA was used — used in policy evaluation and conditions.

## IAM User

- **IAM user** — Long-lived identity for a person or app; has credentials (console password, access keys, possibly MFA).
- **User ARN** — Amazon Resource Name uniquely identifying the user.
- **Access key (access key ID + secret)** — Programmatic credentials; rotate and avoid embedding in code.
- **Console password** — For AWS Management Console sign-in.
- **MFA (multi-factor authentication)** — Extra factor on top of password or API access.
- **Permissions boundary** — Maximum permissions a user (or role) can have; policies cannot exceed it.
- **Tags** — Key/value metadata on users for cost allocation and organization.

## IAM Group

- **IAM group** — Container for users; not a principal itself (you cannot log in “as a group”).
- **Group membership** — Users inherit policies attached to groups (union of permissions).
- **No nesting** — Groups cannot contain other groups.
- **Use case** — Organize permissions by job function (e.g. Developers, Admins).

## IAM Role

- **IAM role** — Identity with **no long-lived passwords or access keys**; assumed via **STS** for temporary credentials.
- **Trust policy (assume role policy)** — JSON policy on the role defining **which principals** can assume the role.
- **Permission policy** — What the role can do **after** assumption (same JSON structure as user/group policies).
- **Assuming a role** — Exchange for temporary security credentials (access key, secret, session token).
- **Role session** — Time-bounded session when someone/something uses the role.
- **Service role** — Role an AWS service assumes to act on your behalf (e.g. Lambda execution role).
- **Service-linked role** — Predefined role type for specific AWS services; often created/managed by the service.
- **Cross-account role** — Trust policy allows another account’s principals to assume the role.
- **Federation / IdP roles** — Roles for SAML 2.0, OIDC, or custom identity providers.
- **Instance profile** — Attaches an IAM role to EC2 (or other resources) so they get temporary credentials.

## Policies (authorization documents)

- **Policy** — JSON document listing allowed/denied **Effect**, **Action**, **Resource**, optional **Condition**.
- **Identity-based policy** — Attached to IAM user, group, or role (what **they** can do).
- **Resource-based policy** — Attached to a resource (S3 bucket policy, KMS key policy, etc.); can allow principals from same or other accounts.
- **Permissions boundaries** — Special policy limiting max permissions (not a full “grant” by itself in the same way).
- **AWS managed policy** — Maintained by AWS; good for common job functions; updates may change behavior.
- **Customer managed policy** — Your reusable policy in your account; you control versions.
- **Inline policy** — Embedded directly on a single user, group, or role; no separate ARN; harder to reuse.
- **Policy version** — Customer managed policies support versioning (default version is what applies).
- **Policy size limits** — IAM enforces size limits per policy and per entity (know for exams).

## Policy document elements

- **Version** — Policy language version (usually `2012-10-17`).
- **Statement** — Block with Sid (optional), Effect, Principal (resource policies), Action/NotAction, Resource/NotResource, Condition.
- **Effect** — `Allow` or `Deny` (explicit **Deny** wins over Allow).
- **Principal** — Who the resource policy applies to (AWS account, IAM user/role ARN, federated user, service).
- **Condition** — Optional tests (IP, MFA present, time, tag, source VPC, etc.).
- **Condition operators** — e.g. `StringEquals`, `IpAddress`, `DateGreaterThan`.

## Policy evaluation (high level)

- **Explicit deny** — Overrides everything.
- **Allow** — Must exist via applicable identity + resource policies (where relevant); no allow → implicit deny.
- **NotAction**, **NotResource** — Inverted matching (advanced patterns).
- **Multiple policies** — Combined; boundaries cap what identity policies can grant.

## Permissions & related terms

- **Permission** — Allowed effect on an action/resource (often summarized as what a policy grants).
- **Least privilege** — Grant only what is needed.
- **Privilege escalation** — Attacker chaining permissions to gain higher access (IAM design reviews matter).

## Credentials & sessions

- **Temporary security credentials** — From STS AssumeRole, federation, EC2 instance metadata, etc.
- **STS (AWS Security Token Service)** — Issues temporary credentials; central to roles and federation.
- **Session duration** — How long assumed-role credentials are valid (within service limits).

## Federation & enterprise identity

- **IAM Identity Center (SSO)** — Central workforce access to accounts and apps; permission sets map to roles.
- **SAML federation** — Enterprise IdP → AWS roles.
- **Web identity / OIDC** — e.g. Cognito, login with Amazon/Google for mobile/web apps.

## Organizational patterns

- **AWS Organizations** — Multi-account structure; SCPs (not IAM policies) constrain what member accounts can do.
- **SCP (Service Control Policy)** — Organization-level guardrails; different from IAM (affects member accounts’ maximum permissions).

## Auditing & access analysis

- **CloudTrail** — API calls and who assumed which role (audit trail).
- **IAM Access Analyzer** — Identifies external access to resources; unused permissions findings.
- **Credential reports** — User credential status and rotation.

## Common exam distinctions

- **User vs role** — Users have long-lived credentials; roles are assumed for temporary credentials.
- **Group vs role** — Groups organize users; roles are assumed by users/services/federated identities.
- **Identity policy vs resource policy** — Who is “inside” the account vs policy on the bucket/key/etc.
- **Trust policy** — Only on roles; defines **who can assume**; separate from permission policies.

---

*Study tip: Know evaluation order (explicit Deny), when resource policies are required (e.g. cross-account S3), and the difference between SCPs and IAM policies.*
