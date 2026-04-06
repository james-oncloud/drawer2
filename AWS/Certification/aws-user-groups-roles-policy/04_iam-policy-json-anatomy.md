# Complete anatomy of an IAM JSON policy

This describes **standard IAM JSON policy documents** (identity-based policies, resource-based policies, and **trust policies** for roles). Element **order does not matter** inside a policy or statement. Official reference: [IAM JSON policy element reference](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html).

---

## 1. Document shape (top level)

A policy is a JSON object with up to three top-level keys:

| Element | Required? | Purpose |
|--------|------------|---------|
| **`Version`** | Yes | Policy language version. Use **`"2012-10-17"`** (current). Legacy: `"2008-10-17"`. |
| **`Id`** | No | Optional identifier for the policy document (string). Not used in all policy types the same way; common in some resource policies. |
| **`Statement`** | Yes | One object **or** an **array** of statement objects. |

**Mutual exclusivity (per statement, not across the whole file):** In a **single** statement you cannot mix **`Action` / `NotAction`**, **`Principal` / `NotPrincipal`**, or **`Resource` / `NotResource`**. Choose one from each pair for that statement.

---

## 2. Statement object (the unit of meaning)

Each item under `Statement` can include:

| Element | Where it appears | Purpose |
|--------|------------------|---------|
| **`Sid`** | Optional | Statement ID: short string to label the statement (helps reading, automation, and some AWS consoles). |
| **`Effect`** | **Required** | **`Allow`** or **`Deny`**. Explicit **`Deny`** wins over **`Allow`** in evaluation. |
| **`Principal`** | Resource-based policies; **trust policies** | Who the statement applies to (accounts, ARNs, services, federated identities). **Not** used in identity-based policies. |
| **`NotPrincipal`** | Same as Principal | Inverse: applies to everyone *except* the listed principals. Mutually exclusive with `Principal`. |
| **`Action`** | Almost all policy types | API actions to allow or deny, e.g. `s3:GetObject`, `ec2:*`. String or array of strings. |
| **`NotAction`** | Optional alternative to Action | Allow/deny everything *except* these actions (advanced; often paired with broad `Resource`). Mutually exclusive with `Action`. |
| **`Resource`** | Identity-based and many resource policies | ARNs (or patterns) of resources the actions apply to. |
| **`NotResource`** | Optional alternative to Resource | Inverse matching for resources. Mutually exclusive with `Resource`. |
| **`Condition`** | Optional | Extra Boolean tests using operators and **context keys** (see §5). All conditions in a statement must evaluate to true (**logical AND** across the condition block for that statement). |

**Trust policy (role) specialization:** A trust policy is a small JSON policy attached to a **role**. Its statements usually **`Allow`** **`sts:AssumeRole`**, **`sts:AssumeRoleWithSAML`**, **`sts:AssumeRoleWithWebIdentity`**, or **`sts:TagSession`** (and related) with a **`Principal`** (and optional **`Condition`**). It does **not** use **`Resource`** in the usual identity sense; “who may assume” is expressed via **`Principal`** + **`Action`** (+ **`Condition`**).

---

## 3. `Principal` and `NotPrincipal` (who)

Used in **resource-based policies** (S3, KMS, SNS, SQS, Lambda resource policy, etc.) and **trust policies**. Identity-based user/group/role **permission** policies **do not** include `Principal` (the identity *is* the subject).

`Principal` is an object with **one or more** of these keys (depending on scenario):

| Key | Meaning |
|-----|--------|
| **`AWS`** | AWS account ID (`"123456789012"`), IAM user/role/root ARN, `*` (use with extreme care), or an array of these. |
| **`Service`** | AWS service principal, e.g. `"ec2.amazonaws.com"`, `"lambda.amazonaws.com"` (string or array). |
| **`Federated`** | For web identity / Cognito: e.g. `"cognito-identity.amazonaws.com"`. For SAML: the provider ARN may appear in trust policies depending on setup. |
| **`CanonicalUser`** | Used in **Amazon S3** resource policies for certain ownership cases (not IAM ARNs). |

**`NotPrincipal`** uses the same structure but means “every principal except these.”

---

## 4. `Action`, `Resource`, and wildcards

- **`Action`** values are typically `service:Action` (e.g. `iam:PassRole`, `s3:GetObject`). You may use **wildcards** such as `s3:Get*`, `ec2:*`, or `*` (very broad).
- **`Resource`** values are **ARNs** or ARN patterns, or `"*"` when the action and service semantics allow a global resource. Some actions are **not resource-level** (e.g. some `iam:List*`); documentation lists whether `Resource` must be `"*"`.

**`NotAction` / `NotResource`:** Useful for “allow everything except …” patterns; requires care so you do not accidentally grant overly broad access.

---

## 5. `Condition` block (configuration options)

Structure:

```json
"Condition": {
  "<condition-operator>": {
    "<condition-key>": "<value-or-list>"
  }
}
```

You can include **multiple** operator objects inside `Condition`; **all** must pass (**AND**). The same operator block can include **multiple** context keys; those are also **AND** unless documented otherwise for set operators.

### 5.1 Condition operators (families)

AWS documents many operators; they fall into families such as:

- **String:** e.g. `StringEquals`, `StringNotEquals`, `StringEqualsIgnoreCase`, `StringLike`, `StringNotLike`
- **Numeric:** e.g. `NumericEquals`, `NumericNotEquals`, `NumericLessThan`, `NumericGreaterThanEquals`, …
- **Date:** e.g. `DateEquals`, `DateLessThan`, …
- **Boolean:** `Bool`
- **Binary:** `BinaryEquals`
- **IP address:** `IpAddress`, `NotIpAddress` (values often use CIDR notation)
- **ARN:** `ArnEquals`, `ArnLike`, `ArnNotEquals`, `ArnNotLike`
- **Existence / null:** `Null` (test whether a context key is present or absent)

Full list and behavior: [IAM condition operators](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_condition_operators.html).

### 5.2 Context keys (what you compare)

- **Global keys** often start with **`aws:`** — e.g. `aws:CurrentTime`, `aws:SourceIp`, `aws:PrincipalArn`, `aws:PrincipalAccount`, `aws:PrincipalOrgID`, `aws:MultiFactorAuthPresent`, `aws:MultiFactorAuthAge`, `aws:userid`, `aws:username`, `aws:SourceVpc`, `aws:SourceVpce`, `aws:RequestTag/tag-key`, `aws:ResourceTag/tag-key`, `aws:TagKeys`, …  
  Reference: [AWS global condition context keys](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_condition-keys.html).

- **Service-specific keys** use a **service prefix** (e.g. `ec2:InstanceType`, `s3:x-amz-server-side-encryption`, `kms:EncryptionContext:aws:userid`). See each service’s IAM documentation.

- **Tag-based keys** often use forms like **`aws:PrincipalTag/tag-key`**, **`aws:RequestTag/tag-key`**, **`aws:ResourceTag/tag-key`**.

### 5.3 Multivalued context keys and set operators

When a key can have multiple values in the request, you may need **set operators** such as `ForAllValuesStringEquals`, `ForAnyValueStringEquals`, etc., so the policy behaves as intended. See: [Multivalued context keys](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_condition-single-vs-multi-valued-context-keys.html).

---

## 6. Policy variables (dynamic values in the policy)

Strings in **`Resource`**, **`Condition`**, and sometimes other fields can include **policy variables** that AWS resolves at request time, e.g.:

- `${aws:username}`
- `${aws:PrincipalTag/tag-key}`
- `${aws:PrincipalAccount}`

Details and rules: [IAM policy variables](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_variables.html).

---

## 7. Policy type: what differs

| Policy kind | Attached to | `Principal`? | Typical `Resource` |
|-------------|-------------|--------------|--------------------|
| Identity-based (user/group/role) | IAM identity | No | Yes (or `NotResource`) |
| Resource-based (e.g. S3 bucket) | Resource | Yes / `NotPrincipal` | Often bucket/object ARNs |
| Trust policy | IAM role | Yes (who may assume) | N/A in the identity-policy sense; uses `Action` = STS assume APIs |

**Permissions boundary** uses the **same JSON grammar** as identity policies but is attached as a **boundary** (caps maximum permissions), not as a normal “grant-only” attachment.

---

## 8. Size and validation (practical limits)

- IAM enforces **maximum sizes** for managed policies, inline policies, and total policies per entity. Quotas change over time; use **[IAM quotas](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_iam-quotas.html)** for current numbers.
- The console and APIs can run **policy validation** (syntax); **IAM Access Analyzer** can add recommendations for overly broad access. See: [Policy validation](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_policy-validator.html).

---

## 9. Related but different: SCP JSON

**Service control policies** in AWS Organizations use JSON that **looks similar** but has **organization-level rules** (no direct grants to principals in the same way as IAM). Do not assume every element or wildcard behaves like an identity policy. See: [SCP syntax](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_policies_scps_syntax.html).

---

## 10. Minimal skeletons (for mental model)

**Identity-based allow (one statement):**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Example",
      "Effect": "Allow",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::example-bucket/*"
    }
  ]
}
```

**Trust policy (who can assume):**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "AWS": "arn:aws:iam::123456789012:root" },
      "Action": "sts:AssumeRole",
      "Condition": {
        "Bool": { "aws:MultiFactorAuthPresent": "true" }
      }
    }
  ]
}
```

**Resource-based (bucket policy fragment):**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "AWS": "arn:aws:iam::999999999999:role/SomeRole" },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::example-bucket/*"
    }
  ]
}
```

---

## Checklist: “all configuration options” at a glance

**Document:** `Version`, optional `Id`, `Statement`.

**Per statement:** `Sid`, `Effect` (**Allow** | **Deny**), and then the mutually exclusive pairs **`Action` | `NotAction`**, **`Resource` | `NotResource`**, **`Principal` | `NotPrincipal`** (only where allowed), plus optional **`Condition`** built from **operators** × **context keys** × **values**, optional **policy variables**, and support for **multivalued** keys via **set operators** where needed.

For authoritative, up-to-date element names and edge cases, always align with the [IAM JSON policy element reference](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html).
