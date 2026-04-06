# How IAM fits together: a story

## The building and the badges

Imagine **AWS** as a huge office tower. Every floor is a **service** (S3, EC2, Lambda, and so on). Every door is an **API** — a specific thing you can do, like “open this filing cabinet” or “start this machine.”

Nobody wanders the building unnamed. Everyone who shows up is a **principal** — they have a name tag that says *who* is asking. But a name tag is not enough. Each door also asks: *Are you allowed?* That second question is **authorization**. Proving the name tag is real (password, key, MFA, SSO) was **authentication** — the lobby security check before you ever reach a floor.

---

## Chapter 1: New hire on a named badge

**River** joins a company called Northwind. IT creates an **IAM user** for River. That user is a durable identity: it can have a **console password** for clicking in the browser and **access keys** for scripts. Think of it as an employee badge that stays in the drawer until River uses it.

River’s badge does not list every door in the tower. Instead, the company writes rules: “River may visit these floors, these rooms.” Those rules are **policies** — JSON documents that say which **actions** on which **resources** are **Allow** or **Deny**. A single permission is one allowed combination: an action on a resource (often scoped by **conditions** like time of day or “MFA must be present”).

If the security team says “nobody may exceed this clearance,” they can wrap River in a **permissions boundary**. Even if someone attaches a generous policy by mistake, the boundary is a ceiling River cannot rise above.

---

## Chapter 2: The department, not a person

River is placed in the **Developers** **group**. A **group** is not a person and never swipes a card itself. It is only a basket that holds many users. Policies attached to the group apply to everyone inside. That way, when Northwind hires another developer, they drop the new person into the same group and inherit the same baseline rules — without copying policies by hand.

Groups do not nest: you cannot put “Team A” inside “Team B” like Russian dolls. You use more groups or more policies if you need finer structure.

---

## Chapter 3: The visitor’s jacket — roles and temporary trust

Late one night, a **Lambda function** must read a file in S3. Lambda is not a human with a password. Giving long-lived keys to code is risky. So AWS uses an **IAM role**.

A role is like a **visitor jacket** hanging by the lobby. The jacket has no password of its own. Someone or something **assumes** the role — puts the jacket on — and receives **temporary** credentials from **STS** (Security Token Service). When the session ends, the jacket goes back on the hook.

Two documents define a role:

1. **Trust policy** — *Who is allowed to pick up this jacket?* Only Lambda from this account? Only a specific user after MFA? Another AWS account’s admin? This is about **trust**, not about which rooms the jacket can open.
2. **Permission policies** — *Once the jacket is on, which floors are allowed?* Same JSON vocabulary as for users and groups.

An **EC2 instance profile** is the mechanical hook: it attaches a role to a server so the instance can wear the jacket without human intervention.

---

## Chapter 4: Two kinds of “house rules”

Policies can live in two families.

**Identity-based policies** are pinned to a user, group, or role: “This principal may do these things.”

**Resource-based policies** are pinned to a resource — classic example: an **S3 bucket policy**. The bucket itself says, “These principals may read me.” That matters a lot for **cross-account** access: the other account’s identity might be allowed on the bucket policy even when you do not manage their IAM user.

When AWS evaluates a request, it looks at all relevant policies. If anything says **Deny**, that wins. **Explicit deny** beats **allow**. If there is no allow, the default is **implicit deny** — the door stays locked.

---

## Chapter 5: The auditor’s notebook

**CloudTrail** is the building’s logbook: who called which API, when, and often **which role** was assumed. **IAM Access Analyzer** helps find paths where resources might be exposed more widely than intended.

Above the building, **AWS Organizations** can set **service control policies (SCPs)** — org-wide guardrails. They are not the same as IAM policies on a user; they limit what accounts in the org can ever enable. Think of SCPs as city zoning: they constrain the whole campus, while IAM is still the badge system inside each office.

---

## Epilogue: one thread through the story

- **User** — a named employee with long-lived credentials.  
- **Group** — a folder of users sharing baseline policies.  
- **Role** — a temporary jacket: trust policy says who can wear it; permission policies say what the wearer can do.  
- **Policy** — the written rules (identity or resource).  
- **Permission** — the outcome: this principal may perform this action on this resource under these conditions.

River signs in (**authentication**), AWS checks the policies (**authorization**), and the elevator only opens when the story’s rules — and the tower’s — all agree.
