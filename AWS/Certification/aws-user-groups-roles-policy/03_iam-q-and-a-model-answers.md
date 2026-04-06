# IAM: questions and model answers

*Aligned to concepts in `01_iam-users-groups-roles-policies-concepts.md`.*

---

## 1. Identity and access model

**Q1. What is a principal in AWS IAM?**  
**A.** A principal is an IAM entity that can sign requests and be named in policies—typically an IAM user, IAM role, federated user, or an application using an assumed role. AWS uses the principal’s identity when deciding whether to allow an action.

**Q2. What is the difference between authentication and authorization?**  
**A.** Authentication proves *who* the caller is (password, access keys, MFA, federation, IAM Identity Center). Authorization decides *whether* that identity may perform a specific action on a resource, evaluated using IAM policies (and sometimes resource policies).

**Q3. What is an AWS resource in IAM terms?**  
**A.** A resource is an AWS object that API operations act on—for example an S3 bucket, an EC2 instance, a KMS key, or an IAM user. Policies attach actions to specific resource ARNs (or patterns).

**Q4. How is an “action” usually written in IAM policies?**  
**A.** As `service:Action`, for example `s3:GetObject` or `ec2:RunInstances`. It identifies a specific API operation.

**Q5. What is the request context?**  
**A.** The set of facts AWS knows about a request when evaluating policies: which principal is calling, source IP, time, whether MFA was used, tags, VPC, and similar attributes. Conditions in policies can match on these fields.

---

## 2. IAM user

**Q6. What is an IAM user?**  
**A.** A long-lived identity for a person or application in an AWS account. It can have a console password, access keys, optional MFA, and tags.

**Q7. What is a user ARN used for?**  
**A.** The Amazon Resource Name uniquely identifies the user across AWS. It appears in policies, CloudTrail logs, and resource policies when you need to refer to that user precisely.

**Q8. What are IAM access keys?**  
**A.** A pair consisting of an access key ID and a secret access key used for programmatic (API/CLI/SDK) authentication. They are long-lived and should be rotated; avoid embedding them in code or repositories.

**Q9. What is the console password for?**  
**A.** It allows sign-in to the AWS Management Console in the browser, separate from programmatic access keys.

**Q10. What does MFA add?**  
**A.** A second factor (device or app) so that knowing only the password or stealing only one factor is not enough. Policies can require MFA via conditions (e.g. `aws:MultiFactorAuthPresent`).

**Q11. What is a permissions boundary?**  
**A.** A managed policy attached to a user or role that sets the *maximum* permissions that identity-based policies can grant. Effective permissions are the intersection of identity policies and the boundary; boundaries help prevent accidental over-permissioning.

**Q12. Why tag IAM users?**  
**A.** Tags are key/value metadata for organization, cost allocation, automation, and attribute-based access control when policies use tag conditions.

---

## 3. IAM group

**Q13. What is an IAM group?**  
**A.** A container that holds IAM users. It is not a principal—you cannot authenticate “as a group.”

**Q14. How do users get permissions from groups?**  
**A.** Policies attached to the group apply to every member. A user’s effective permissions include the union of policies from groups they belong to, plus policies attached directly to the user.

**Q15. Can groups be nested?**  
**A.** No. A group cannot contain another group. Use additional groups or policies for more structure.

**Q16. What is a typical use case for groups?**  
**A.** Grouping users by job function (e.g. Developers, Billing) so you attach job-role policies once to the group instead of to each user.

---

## 4. IAM role

**Q17. What is an IAM role?**  
**A.** An IAM identity that has no long-lived password or access keys of its own. Principals *assume* the role to receive temporary credentials from STS.

**Q18. What is a trust policy?**  
**A.** A JSON policy attached only to a role that defines *which principals* may assume the role (e.g. a specific user, a service, another account). It does not grant API permissions to resources by itself.

**Q19. What is a permission policy on a role?**  
**A.** One or more policies (managed or inline) that define what the role may do *after* it is assumed—same statement structure as for users and groups.

**Q20. What does “assume role” mean?**  
**A.** A principal calls STS (e.g. `AssumeRole`) and, if allowed by the trust policy, receives temporary security credentials (access key ID, secret key, session token) scoped to that role.

**Q21. What is a role session?**  
**A.** The time-bounded period during which temporary credentials issued for a role are valid, from assumption until expiry (within maximum session duration limits).

**Q22. What is a service role?**  
**A.** A role that an AWS service assumes to perform actions on your behalf—for example a Lambda execution role so Lambda can call other AWS APIs.

**Q23. What is a service-linked role?**  
**A.** A predefined role type that a service may create or manage for integrations; it trusts only that service and often has AWS-defined policies for that service’s needs.

**Q24. What is a cross-account role?**  
**A.** A role whose trust policy allows principals in another AWS account to assume it, enabling secure cross-account access without sharing long-lived keys.

**Q25. What are federation / IdP roles?**  
**A.** Roles assumed by users from external identity systems—commonly SAML 2.0 enterprise IdPs or OIDC web identity providers—after exchanging assertions or tokens with STS.

**Q26. What is an instance profile?**  
**A.** A container that attaches an IAM role to an EC2 instance (or is used with other services) so the instance can obtain temporary credentials without stored access keys.

---

## 5. Policies (authorization documents)

**Q27. At a high level, what is an IAM policy?**  
**A.** A JSON document with one or more statements that specify Effect (Allow/Deny), Action(s), Resource(s), optional Principal (in resource policies), and optional Conditions.

**Q28. What is an identity-based policy?**  
**A.** A policy attached to an IAM user, group, or role that grants or denies what *that identity* can do.

**Q29. What is a resource-based policy?**  
**A.** A policy attached to a resource (e.g. S3 bucket, KMS key, SNS topic) that specifies which principals can access it. It can allow principals in the same or another account.

**Q30. How do permissions boundaries differ from normal identity policies?**  
**A.** Boundaries cap maximum permissions; they do not by themselves grant access the way an Allow in an identity policy does. Effective permissions respect both the boundary and other identity policies.

**Q31. What is an AWS managed policy?**  
**A.** A policy created and maintained by AWS (e.g. `ReadOnlyAccess`). It is easy to attach and updated by AWS—updates can change effective permissions.

**Q32. What is a customer managed policy?**  
**A.** A policy you create in your account, reusable across multiple principals, with versioning and a stable ARN.

**Q33. What is an inline policy?**  
**A.** A policy embedded directly on a single user, group, or role. It does not have its own ARN as a standalone object and is harder to reuse across many entities.

**Q34. What is policy versioning?**  
**A.** Customer managed policies can have multiple versions; one is marked as the default version, which is the one that actually applies.

**Q35. Why do policy size limits matter?**  
**A.** IAM enforces maximum sizes for policies and for the total policies attached to an entity; large or duplicated inline policies can hit limits—another reason to prefer reusable customer managed policies.

---

## 6. Policy document elements

**Q36. What is the `Version` field in a policy?**  
**A.** The policy language version; for IAM policies it is typically `2012-10-17`.

**Q37. What is a statement (`Statement`)?**  
**A.** A block that can include Sid (optional ID), Effect, Principal (resource policies), Action/NotAction, Resource/NotResource, and Condition.

**Q38. What are Allow and Deny in the Effect field?**  
**A.** Allow permits matching actions (subject to other policies). Deny explicitly forbids them; an explicit Deny overrides Allow.

**Q39. When do you use `Principal`?**  
**A.** In resource-based policies (and trust policies) to specify which accounts, users, roles, or services the statement applies to. Identity-based policies do not use `Principal` in the same way.

**Q40. What is a `Condition` block?**  
**A.** Optional tests that must pass for the statement to apply, such as IP range, time window, MFA present, resource tags, or source VPC.

**Q41. What are condition operators?**  
**A.** Keys like `StringEquals`, `IpAddress`, `DateGreaterThan`, paired with condition keys (e.g. `aws:SourceIp`, `aws:CurrentTime`) to express constraints.

**Q42. What are `NotAction` and `NotResource`?**  
**A.** Advanced constructs that match everything *except* listed actions or resources, often used with broad Allow statements plus tight exclusions.

---

## 7. Policy evaluation

**Q43. What wins: Allow or explicit Deny?**  
**A.** Explicit Deny always wins over Allow.

**Q44. What is implicit deny?**  
**A.** If no applicable policy allows an action, access is denied by default even without a Deny statement.

**Q45. How are multiple policies combined?**  
**A.** All applicable identity-based policies (and resource-based policies where used) are evaluated together; explicit Deny in any stops the request. Permissions boundaries further limit what identity policies can grant.

---

## 8. Permissions and security practice

**Q46. What is a “permission” in everyday IAM language?**  
**A.** The effective ability for a principal to perform an allowed action on a resource under the evaluated policies—often described as what remains after all Allows, Denies, and boundaries apply.

**Q47. What is least privilege?**  
**A.** Granting only the minimum actions and resources required for a task, reducing blast radius if credentials leak.

**Q48. What is privilege escalation in IAM terms?**  
**A.** An attacker (or misconfiguration) chaining permissions—e.g. `iam:PassRole` plus `lambda:CreateFunction`—to gain broader access than intended. IAM design reviews aim to block such paths.

---

## 9. Credentials and sessions

**Q49. What are temporary security credentials?**  
**A.** Short-lived credentials (access key ID, secret, session token) from STS after AssumeRole, federation, or instance metadata—preferred over long-lived keys for roles and workloads.

**Q50. What does STS do?**  
**A.** AWS Security Token Service issues temporary credentials and is central to role assumption and federated sign-in.

**Q51. What is session duration?**  
**A.** The validity period of temporary credentials for a role session, configurable up to a maximum allowed for that role or API.

---

## 10. Federation and enterprise identity

**Q52. What is IAM Identity Center (formerly AWS SSO)?**  
**A.** A service for centralized workforce access to AWS accounts and cloud applications; permission sets provision IAM roles in accounts for assigned users and groups.

**Q53. How does SAML federation typically work with IAM?**  
**A.** Users authenticate to a corporate IdP; they receive assertions that map to IAM roles in AWS via STS, without long-lived IAM users for each person.

**Q54. What is web identity / OIDC in this context?**  
**A.** Mobile or web apps exchange tokens from providers (often via Amazon Cognito) for AWS temporary credentials mapped to IAM roles.

---

## 11. AWS Organizations and SCPs

**Q55. What is AWS Organizations?**  
**A.** A way to group AWS accounts into an organization for consolidated billing, policies, and structure.

**Q56. What is an SCP?**  
**A.** A service control policy attached to organization roots, OUs, or accounts that sets maximum permissions for member accounts. SCPs are not IAM policies; they constrain what the account’s IAM *can ever* allow.

**Q57. How is an SCP different from an IAM identity policy?**  
**A.** SCPs never grant permissions by themselves—they act as guardrails. IAM policies inside the account still must Allow actions, but SCPs can Deny or limit the space of possible Allows across the org.

---

## 12. Auditing and analysis

**Q58. What does CloudTrail provide for IAM?**  
**A.** A record of API calls (who did what, when, from which role or user), including `AssumeRole` events for auditing access.

**Q59. What is IAM Access Analyzer?**  
**A.** A tool that helps find unintended external access to resources and can report unused access or overly broad permissions depending on features used.

**Q60. What is a credential report?**  
**A.** A downloadable report listing IAM users and credential status (password last used, access key ages, MFA status) to support rotation and compliance reviews.

---

## 13. Common distinctions (exam-style)

**Q61. IAM user vs IAM role—core difference?**  
**A.** Users have their own long-lived credentials (password, access keys). Roles are assumed for temporary credentials and have trust policies defining who can assume them.

**Q62. IAM group vs IAM role?**  
**A.** Groups batch IAM users and attach policies to them; you cannot log in as a group. Roles are assumed by users, services, or federated identities and provide temporary credentials.

**Q63. Identity-based policy vs resource-based policy?**  
**A.** Identity policies attach to users/groups/roles and say what those identities can do. Resource policies attach to resources and can grant access to principals (including other accounts), critical for services like S3 cross-account.

**Q64. Trust policy vs permission policy on a role?**  
**A.** The trust policy only answers *who may assume the role*. Permission policies answer *what the role may do* after assumption. Both are required for a working role.

**Q65. When are resource policies especially important?**  
**A.** For cross-account access to resources like S3 buckets, KMS keys, and SNS/SQS, where the resource must trust the other account’s principal in addition to identity policies.

---

## Quick self-check (short answers)

| Topic | One-line model answer |
|--------|------------------------|
| Principal | Entity making a request (user, assumed role, federated identity). |
| Authentication vs authorization | Who you are vs what you may do. |
| Explicit deny | Overrides any allow. |
| Implicit deny | Default when no allow applies. |
| Permissions boundary | Caps maximum permissions for user/role. |
| STS | Issues temporary credentials. |
| Trust policy | Who can assume a role. |
| Instance profile | Binds IAM role to EC2 for temp creds. |
| SCP | Org-level permission ceiling, not a grant. |

---

*End of set. Add scenario drills in a separate file if you want case-study questions.*
