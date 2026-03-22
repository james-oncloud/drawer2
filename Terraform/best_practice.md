Here’s a comprehensive practical list of Terraform best practices, grouped by theme.

## 1. Keep Terraform code readable and consistent

Use `terraform fmt` and follow HashiCorp’s configuration style guide so the codebase has one canonical format and is easier to review and maintain. Prefer clear naming, logical file separation for human readability, and short, focused modules. Terraform treats all files in a module as one document, so splitting files should improve maintainability rather than change behavior. ([HashiCorp Developer][1])

Use meaningful names for resources, variables, outputs, and locals. Keep names consistent across modules. Avoid clever abbreviations unless they are standard in your organization. Prefer explicitness over terseness. The style guide specifically recommends conventions like singular nouns for resource names and placing `count`/`for_each` first in blocks, then arguments, then `lifecycle`, then nested blocks. ([HashiCorp Developer][1])

Comment the “why”, not the obvious “what”. Terraform code should largely explain itself through structure and naming; comments are most useful for business rules, unusual provider behavior, migration notes, and non-obvious dependencies. This aligns with HashiCorp’s emphasis on a style guide and maintainable configuration structure. ([HashiCorp Developer][1])

## 2. Pin and manage versions deliberately

Always declare your required Terraform version and required provider versions. This improves reproducibility and prevents breakage from unplanned upgrades. Terraform’s provider requirements are meant to make installs predictable and explicit. ([HashiCorp Developer][2])

Upgrade intentionally, not accidentally. Review changelogs, test upgrades in lower environments, and treat major provider upgrades like code changes that need validation and rollout planning. This follows HashiCorp’s recommended lifecycle and versioning practices. ([HashiCorp Developer][1])

Commit the dependency lock file when appropriate so provider selections are reproducible across machines and CI. This is part of predictable workflow hygiene implied by Terraform’s provider requirement and installation model. ([HashiCorp Developer][2])

## 3. Use remote state, never rely on local state for teams

Store state remotely for team use. HashiCorp recommends remote state storage because state contains the mapping between real infrastructure and configuration, and remote backends support collaboration better than local `terraform.tfstate`. HCP Terraform is explicitly recommended for versioning, encryption, and secure sharing. ([HashiCorp Developer][3])

Use state locking wherever supported. Locking prevents concurrent writers from corrupting state, and Terraform automatically locks state for write operations when the backend supports it. Disabling locking is not recommended. ([HashiCorp Developer][4])

Separate state by environment and scope. Do not put unrelated systems into one giant state file. Smaller state boundaries reduce blast radius, speed up plans, and make access control simpler. HashiCorp’s recommended-practices workflow centers on organizing infrastructure and workspaces thoughtfully. ([HashiCorp Developer][5])

Avoid manual state editing unless absolutely necessary. State is critical internal metadata; unsafe editing can desynchronize Terraform from reality. Prefer normal Terraform workflows, imports, moves, and carefully planned refactors. This follows the central role of state described in the official docs. ([HashiCorp Developer][3])

## 4. Be careful with workspaces

Do not use workspaces as a substitute for strong environment design. HashiCorp notes that workspaces are separate state instances for one configuration, but they are not a complete isolation model for every use case. They work best when the infrastructure shape is similar across environments. ([HashiCorp Developer][6])

Prefer separate directories, repos, or root modules when environments need materially different configuration, permissions, pipelines, or release cadences. Use workspaces only where they simplify a genuinely similar deployment model. This is a practical inference from Terraform’s workspace model and HashiCorp’s broader workflow recommendations. ([HashiCorp Developer][5])

## 5. Design modules carefully

Create reusable modules for repeated patterns, but do not over-modularize. A module should represent a meaningful unit of infrastructure, not every tiny resource. HashiCorp’s recommended practices explicitly encourage creating modules as teams mature. ([HashiCorp Developer][7])

Keep module interfaces small and stable. Expose only the variables and outputs consumers genuinely need. Too many inputs usually means the abstraction is weak or leaky. This aligns with the style guide’s emphasis on module composition and maintainability. ([HashiCorp Developer][1])

Prefer passing structured inputs with explicit types where helpful. Use Terraform’s type system to make module contracts clearer and catch errors earlier. ([HashiCorp Developer][8])

Document every module: purpose, required inputs, optional inputs, outputs, providers, assumptions, and examples. Treat internal modules like products for other engineers. This is consistent with HashiCorp’s focus on shared knowledge and standardized practices. ([HashiCorp Developer][7])

Version shared modules. Consumers should be able to upgrade intentionally instead of pulling moving targets. This follows the official versioning guidance in the style and workflow docs. ([HashiCorp Developer][1])

## 6. Keep root modules thin

Use the root module mainly to wire together reusable modules, provider configuration, backend configuration, and environment-specific values. Put reusable logic in child modules, not repeated in many roots. This matches HashiCorp’s recommended progression toward modular IaC. ([HashiCorp Developer][7])

Avoid copy-paste roots that drift over time. If several environments are almost identical, capture the common pattern in a module and keep only the differing values at the root. ([HashiCorp Developer][7])

## 7. Validate early and often

Run `terraform validate` in local development and CI. It checks whether the configuration is syntactically valid and internally consistent before you get to planning or applying. ([HashiCorp Developer][9])

Run `terraform fmt -check` and `terraform validate` on every pull request. This catches avoidable issues early and makes reviews focus on infrastructure intent rather than formatting and syntax. ([HashiCorp Developer][9])

Use `terraform test` for module verification where appropriate. HashiCorp provides a native test command and test file syntax specifically to validate shared modules and root modules. ([HashiCorp Developer][10])

Always review the execution plan before apply. Plans are one of Terraform’s core safety mechanisms; they make proposed infrastructure changes explicit and reviewable. Terraform’s workflow and CLI docs center on this plan/apply lifecycle. ([HashiCorp Developer][11])

## 8. Use version control and CI/CD as the default workflow

Keep Terraform code in version control. HashiCorp explicitly recommends using VCS and putting Terraform code in repositories as a foundational practice. ([HashiCorp Developer][7])

Use pull requests for all changes, including small ones. Require plan output, peer review, and policy checks before apply. For teams, direct local applies to shared environments should be minimized or eliminated in favor of controlled pipelines. This follows HashiCorp’s recommended collaborative workflow. ([HashiCorp Developer][5])

Separate plan from apply in CI/CD. A common pattern is to generate a plan for review and only apply after approval. This reduces accidental changes and gives clear auditability. ([HashiCorp Developer][5])

## 9. Treat secrets carefully

Do not hardcode secrets in Terraform code, variables files committed to Git, or outputs. HashiCorp’s recommended practices explicitly call out secret management as a key organizational practice. ([HashiCorp Developer][7])

Mark sensitive values as sensitive where appropriate, but remember that sensitivity mostly affects display behavior and does not erase the need for proper backend security and secret sourcing. The style guide includes sensitive data management as a workflow consideration. ([HashiCorp Developer][1])

Use a proper secrets manager or platform-native secret injection approach. Keep secret values out of source control and restrict who can read state, because state can contain sensitive data. State security is a core reason HashiCorp recommends secure remote backends. ([HashiCorp Developer][3])

## 10. Prefer declarative infrastructure, avoid provisioners

Avoid provisioners unless there is no better option. HashiCorp explicitly warns that Terraform is primarily for immutable infrastructure and strongly recommends purpose-built alternatives for post-apply operations. ([HashiCorp Developer][12])

Prefer cloud-init, image baking, configuration management, or Packer for machine setup instead of `remote-exec` or `local-exec` when possible. HashiCorp’s docs specifically point to Cloud-Init and Packer as better approaches. ([HashiCorp Developer][12])

If you must use a provisioner, isolate it, document why it exists, and understand its failure and idempotency characteristics. Treat it as a last resort, not a normal Terraform pattern. ([HashiCorp Developer][12])

## 11. Minimize drift and out-of-band changes

Do not make manual infrastructure changes behind Terraform’s back unless there is an emergency and you have a reconciliation plan. Terraform state and plans assume the configuration is the source of truth for managed resources. ([HashiCorp Developer][3])

Regularly run plans against important environments to detect drift. Investigate and either codify or remove manual changes. This is a practical consequence of how Terraform state maps configuration to real infrastructure. ([HashiCorp Developer][3])

Import existing infrastructure before managing it with Terraform rather than recreating or informally “assuming” ownership. This keeps state aligned with real resources. ([HashiCorp Developer][3])

## 12. Use variables, locals, and outputs well

Use input variables for values that differ by environment or consumer. Use locals for derived values and repeated expressions inside a module. Use outputs only for values consumers actually need. This makes modules cleaner and more stable. The language docs and style guide support typed, explicit, structured configuration. ([HashiCorp Developer][13])

Prefer explicit types on variables, especially in shared modules. Good types improve usability and prevent surprising coercions. ([HashiCorp Developer][8])

Avoid excessive variable indirection. If readers must jump through many files to understand one value, the design is too abstract. Keep data flow obvious. This is consistent with readability-focused style guidance. ([HashiCorp Developer][1])

## 13. Keep dependencies intentional

Let Terraform infer dependencies from references wherever possible instead of adding `depends_on` everywhere. Overusing explicit dependencies can make plans slower and less understandable. Use `depends_on` only when the dependency is real but not visible in expressions. This is consistent with Terraform’s declarative model and maintainable configuration practices. ([HashiCorp Developer][13])

Avoid broad, artificial ordering between modules unless needed. Terraform is best when it can build an accurate dependency graph from actual data relationships. ([HashiCorp Developer][11])

## 14. Plan your repository and environment structure

Choose a repository strategy deliberately: mono-repo, per-platform repo, or per-service repo. The best choice depends on team ownership, release cadence, and blast radius. HashiCorp’s recommended practices emphasize organizing infrastructure and code ownership as Terraform adoption grows. ([HashiCorp Developer][5])

A common pattern is shared modules in one place and separate root modules per environment or workload. Keep ownership boundaries clear so teams know who can change what. ([HashiCorp Developer][7])

Do not mix too many unrelated environments, business domains, or privilege boundaries in one root module. Smaller, intentional boundaries are easier to secure and operate. ([HashiCorp Developer][5])

## 15. Make plans safer in production

Apply changes to production through reviewed, auditable pipelines. Reduce or eliminate ad hoc local production applies. This fits HashiCorp’s collaborative workflow recommendations. ([HashiCorp Developer][5])

Use least privilege for CI/CD runners and Terraform identities. The credentials used by Terraform should only manage the intended scope. This is a security best practice supported by the importance of secure state and controlled workflows in the official guidance. ([HashiCorp Developer][3])

Break risky infrastructure changes into smaller steps when needed. Terraform will show a full plan, but safe rollout design is still your responsibility. This is an operational inference from Terraform’s plan/apply workflow. ([HashiCorp Developer][11])

## 16. Standardize policy and governance for teams

Define organizational conventions for naming, tagging, module use, environment layout, and review requirements. HashiCorp explicitly recommends setting guidelines and sharing knowledge as Terraform usage grows. ([HashiCorp Developer][7])

Use policy checks where your platform supports them, especially for security, cost, region restrictions, and tagging requirements. HashiCorp’s recommended collaborative workflow includes governance as part of scaling Terraform usage. ([HashiCorp Developer][5])

## 17. Troubleshoot methodically

When Terraform behaves unexpectedly, start with `terraform fmt`, `terraform validate`, and plan output. HashiCorp’s troubleshooting workflow highlights formatting, validation, and logging as core debugging steps. ([HashiCorp Developer][14])

Enable logging only when needed and handle logs carefully, because they may expose sensitive details. Use logs to understand provider behavior or graph issues, not as a default mode of operation. This follows the official troubleshooting guidance and sensitive-data considerations. ([HashiCorp Developer][14])

## 18. A compact “gold standard” checklist

A strong Terraform setup usually looks like this:

* code in Git
* remote encrypted state
* state locking enabled
* pinned Terraform and provider versions
* reusable, versioned modules
* thin root modules
* no hardcoded secrets
* `fmt`, `validate`, `plan` in CI
* reviewed applies only
* provisioners avoided
* clear environment boundaries
* documented module contracts
* regular drift detection
* shared team conventions

These points are strongly supported across HashiCorp’s style guide, state documentation, CLI docs, and recommended-practices workflow. ([HashiCorp Developer][1])

One caveat: “all best practices” is not a closed official master list from HashiCorp, so the list above is the most complete practical synthesis from the current official docs rather than a single canonical page. ([HashiCorp Developer][15])

I can also turn this into a Terraform code review checklist or a team standards document.

[1]: https://developer.hashicorp.com/terraform/language/style?utm_source=chatgpt.com "Style Guide - Configuration Language | Terraform"
[2]: https://developer.hashicorp.com/terraform/language/providers/requirements?utm_source=chatgpt.com "Provider Requirements - Configuration Language | Terraform"
[3]: https://developer.hashicorp.com/terraform/language/state?utm_source=chatgpt.com "State | Terraform"
[4]: https://developer.hashicorp.com/terraform/language/state/locking?utm_source=chatgpt.com "State: Locking | Terraform"
[5]: https://developer.hashicorp.com/terraform/cloud-docs/recommended-practices?utm_source=chatgpt.com "Learn Terraform recommended practices"
[6]: https://developer.hashicorp.com/terraform/language/state/workspaces?utm_source=chatgpt.com "State: Workspaces | Terraform"
[7]: https://developer.hashicorp.com/terraform/cloud-docs/recommended-practices/part3.2?utm_source=chatgpt.com "Part 3.2: Move from semi-automation to infrastructure as code"
[8]: https://developer.hashicorp.com/terraform/language/expressions/types?utm_source=chatgpt.com "Types and Values - Configuration Language | Terraform"
[9]: https://developer.hashicorp.com/terraform/cli/commands/validate?utm_source=chatgpt.com "terraform validate command reference"
[10]: https://developer.hashicorp.com/terraform/cli/commands/test?utm_source=chatgpt.com "terraform test command reference"
[11]: https://developer.hashicorp.com/terraform/docs?utm_source=chatgpt.com "Terraform Documentation"
[12]: https://developer.hashicorp.com/terraform/language/provisioners?utm_source=chatgpt.com "Perform post-apply operations using provisioners | Terraform"
[13]: https://developer.hashicorp.com/terraform/language?utm_source=chatgpt.com "Overview - Configuration Language | Terraform"
[14]: https://developer.hashicorp.com/terraform/tutorials/configuration-language/troubleshooting-workflow?utm_source=chatgpt.com "Troubleshoot Terraform"
[15]: https://developer.hashicorp.com/terraform?utm_source=chatgpt.com "Terraform"
