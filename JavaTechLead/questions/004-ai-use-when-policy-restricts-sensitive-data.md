# Question

List recommendations to follow in the age of AI where policy restricts sharing sensitive information with AI tools and platforms, and how to use AI in a compliant way in these cases.

## Answer

These are **operational practices** teams commonly follow; they are **not legal advice**. Align with your security, legal, and data-governance owners and your official AI policy.

### Know what “sensitive” means where you work

- **Use your org’s data classification** (public, internal, confidential, regulated, etc.) and **approved-use lists**—do not improvise thresholds.
- **Treat prompts and uploads as disclosures**: if you would not email it outside the company, assume it may be **out of bounds** for a given tool unless policy says otherwise.

### Default safe patterns for coding and delivery

- **No secrets in prompts** — Never paste API keys, tokens, passwords, private keys, connection strings with credentials, or full production configs. Use placeholders (`REDACTED`, `{{SECRET}}`) or describe the *pattern* without values.
- **Synthetic or scrubbed examples** — Replace real customer names, account IDs, emails, addresses, and account-specific business rules with fake data; keep structure and error shapes, not identity.
- **Paraphrase requirements** — Describe behavior (“validate ISO currency codes”) instead of pasting full Jira tickets or legal clauses if those are classified.
- **Split the problem** — Ask about **generic** algorithms, library APIs, Spring patterns, or debugging approaches without attaching proprietary code; or share **minimal** snippets with identifiers stripped.

### Tool and channel choice

- **Use employer-approved AI offerings** — Many orgs provide **enterprise** ChatGPT/Copilot/GitHub Copilot/Cursor with **contracts** that limit training on your data and define data residency; personal or free tiers may be **explicitly prohibited**.
- **Prefer local or VPC-bound tools** when policy requires — On-device models, air-gapped or **self-hosted** assistants, or IDE features that **do not** send buffer contents to the vendor without opt-in.
- **Do not route restricted work through unapproved extensions**—browser plug-ins, random “explain this” sites, and unvetted mobile apps often lack the assurances your policy assumes.

### Human and process guardrails

- **You own the output** — Treat AI suggestions as **untrusted**; review for bugs, license issues, security anti-patterns, and factual errors before merge.
- **No fully automated decisions** for regulated or high-risk outcomes without explicit governance—humans stay accountable.
- **Recordkeeping** — If your org requires it, document **which approved tool** was used for materially assisted work (audit trail), without logging sensitive content.

### Engineering hygiene that reduces “need to paste”

- **Keep tests and interfaces clean** — Well-named types and fixtures make it easier to ask questions using **abstract** descriptions instead of production dumps.
- **Use internal docs and runbooks** — Point colleagues (and yourself) to sanctioned wikis first; AI is a supplement, not a bypass for classified sources.
- **Redaction tooling** — For logs or stack traces, use approved scrubbers before any external or generative tool; never paste raw production logs unless policy allows.

### If you are unsure

- **Ask security / legal** for a one-pager or decision tree: “Can I use tool X with data class Y?”
- **Prefer “no” until clarified** when the downside is **regulatory breach**, **customer contract violation**, or **credential leakage**.

### Short checklist before hitting “send” to an AI product

1. Is this tool **approved** for this data class?  
2. Have I removed **secrets, PII, and customer-identifying** details?  
3. Am I sharing the **minimum** needed to get a useful answer?  
4. Will I **review** the result like I would a junior engineer’s first draft?  

Compliant use usually means: **approved stack**, **minimum necessary context**, **scrubbed inputs**, and **human accountability** for what ships.

## Meta

- Asked: 2026-04-03
