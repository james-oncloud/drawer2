# Lesson 01 — Terraform Syntax & Command Patterns

> **Path:** `/Users/jamesking/work/drawer2/Atos/Terraform/tutorial/lesson_01.md`  
> **Companion file:** `../showcase.tf`  
> **Prerequisite:** Terraform installed (`terraform version` → >= 1.5.0)

---

## Learning goals

By the end of this lesson you should be able to:

1. Read basic **HCL** (HashiCorp Configuration Language) syntax
2. Recognise the main **block types** in a `.tf` file
3. Run the core **CLI workflow**: `init` → `plan` → `apply` → `destroy`
4. Understand how Terraform uses **state** to track resources

---

## Part 1 — The mental model

Terraform is **declarative**: you describe *what* you want, not *how* to build it step by step.

```
Your .tf files  →  desired state
terraform.tfstate →  current state (what Terraform already created)
plan              →  diff between the two
apply             →  make reality match your code
```

You already ran this successfully on `showcase.tf` — it created 8 local resources (files, random name, etc.) with **no AWS account required**.

---

## Part 2 — HCL syntax fundamentals

Terraform configuration is built from three building blocks:

| Building block | What it is | Example |
|----------------|------------|---------|
| **Block** | A container with a type, optional labels, and a body | `resource "local_file" "readme" { ... }` |
| **Argument** | `name = value` pair inside a block | `length = 2` |
| **Expression** | A value that can be computed | `"${var.project_name}-${var.environment}"` |

### Block label pattern

Most blocks follow this shape:

```hcl
block_type "LABEL_A" "LABEL_B" {
  argument = value
}
```

| Block type | Label A | Label B | Meaning |
|------------|---------|---------|---------|
| `resource` | provider type | local name | Something Terraform **creates/manages** |
| `data` | provider type | local name | Something Terraform **reads** (already exists) |
| `variable` | variable name | — | **Input** to your module |
| `output` | output name | — | **Output** after apply |
| `provider` | provider name | — | Plugin configuration |
| `terraform` | — | — | Terraform/tooling settings |

**Resource address** (how Terraform refers to things in plans and state):

```
resource_type.local_name
local_file.readme
random_pet.suffix
local_file.owner_files["alice"]   # when using for_each
null_resource.setup[0]            # when using count
```

### Comments

```hcl
# Single-line comment

/*
  Multi-line comment
*/
```

### Strings

```hcl
simple   = "hello"
template = "${var.name}-${var.env}"     # interpolation (legacy style, still valid)
modern   = "${local.prefix}"            # same thing
heredoc  = <<-EOT
  Multi-line text
  with ${var.project_name} embedded
EOT
```

### Types you'll see often

| Type | Example |
|------|---------|
| `string` | `"dev"` |
| `bool` | `true` |
| `number` | `3` |
| `list` | `["alice", "bob"]` |
| `set` | `["alice", "bob"]` (unordered, unique) |
| `map` | `{ team = "platform" }` |
| `object({...})` | structured object with typed fields |
| `null` | absent/optional value |

---

## Part 3 — Block types in `showcase.tf`

Open `../showcase.tf` and read top to bottom. Here is what each section does.

### 1. `terraform` block — configure the tool itself

```hcl
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    local = {
      source  = "hashicorp/local"
      version = "~> 2.5"
    }
  }
}
```

- `required_version` — which Terraform CLI versions are allowed
- `required_providers` — which plugins to download (`init` reads this)
- `~> 2.5` means “2.5.x but not 3.0” (pessimistic constraint)
- `backend` (commented in showcase) — where state is stored (local file by default)

### 2. `provider` blocks — connect to external systems

```hcl
provider "local" {}
provider "local" {
  alias = "secondary"
}
```

Providers are plugins. `local` manages files on disk; `random` generates random values; `http` fetches URLs. The `alias` lets you use a second configured instance:

```hcl
resource "local_file" "json_manifest" {
  provider = local.secondary
  ...
}
```

### 3. `variable` blocks — inputs

```hcl
variable "project_name" {
  type        = string
  default     = "terraform-showcase"

  validation {
    condition     = length(var.project_name) >= 3
    error_message = "project_name must be at least 3 characters long."
  }
}
```

**Reference variables** with `var.<name>`:

```hcl
var.project_name    # → "terraform-showcase"
var.environment     # → "dev"
var.settings.tags   # → nested access into objects
```

Override at apply time:

```bash
terraform apply -var="environment=test"
```

Or use a `terraform.tfvars` file (not in showcase, but common in real projects).

### 4. `locals` block — internal computed values

```hcl
locals {
  prefix = "${var.project_name}-${var.environment}"
  feature_status = var.settings.enable_feature ? "enabled" : "disabled"
}
```

**Reference locals** with `local.<name>`. Unlike variables, locals are not set from outside — they are derived inside the module.

Common patterns in showcase:

| Pattern | Example |
|---------|---------|
| Conditional | `condition ? true_val : false_val` |
| `for` expression | `[for o in local.owners_sorted : "${o}@example.com"]` |
| `merge` | combine maps |
| `try` | safe fallback if value might be null |
| `jsonencode` / `yamlencode` | serialize structures |

### 5. `data` blocks — read-only lookups

```hcl
data "http" "example" {
  url = "https://example.com"
}
```

Data sources **do not create** infrastructure. They fetch existing information. Reference with:

```hcl
data.http.example.status_code   # → 200
```

### 6. `resource` blocks — managed infrastructure

```hcl
resource "local_file" "readme" {
  content  = "..."
  filename = "${path.module}/generated-${local.sanitized_prefix}.txt"
}
```

Reference **attributes** with `resource_type.name.attribute`:

```hcl
random_pet.suffix.id              # → "special-tapir" (after apply)
local_file.readme.filename
```

#### Meta-arguments (special resource keywords)

These are not provider-specific — they control Terraform behaviour:

| Meta-argument | Purpose | Example in showcase |
|---------------|---------|---------------------|
| `count` | Create N instances (0 or 1 = optional) | `count = var.enabled ? 1 : 0` |
| `for_each` | Create one instance per map/set key | `local_file.owner_files` |
| `depends_on` | Force ordering when Terraform can't infer it | readme waits for `null_resource.setup` |
| `provider` | Use an aliased provider | `provider = local.secondary` |
| `lifecycle` | Custom create/update/destroy behaviour | preconditions, postconditions |

**`count` vs `for_each`:**

```hcl
# count → indexed: resource.name[0], resource.name[1]
resource "null_resource" "setup" {
  count = var.enabled ? 1 : 0
}

# for_each → keyed: resource.name["alice"], resource.name["bob"]
resource "local_file" "owner_files" {
  for_each = { alice = {...}, bob = {...} }
  filename = "owner-${each.key}.txt"
  content  = each.value.email
}
```

Prefer `for_each` when stable string keys matter (safer refactors).

### 7. `output` blocks — values after apply

```hcl
output "summary" {
  value = {
    project       = var.project_name
    random_suffix = random_pet.suffix.id
  }
}
```

After apply you saw:

```
summary = {
  "random_suffix" = "special-tapir"
  ...
}
```

Sensitive outputs are redacted: `secret_token_echo = <sensitive>`.

### 8. `check` block — assertions at plan/apply time

```hcl
check "owner_count_check" {
  assert {
    condition     = length(local.owners_sorted) > 0
    error_message = "At least one owner must be defined."
  }
}
```

Fails the run if the condition is false.

---

## Part 4 — Reference cheat sheet

How to refer to things:

| Prefix | Meaning | Example |
|--------|---------|---------|
| `var.` | Input variable | `var.environment` |
| `local.` | Local value | `local.prefix` |
| `data.` | Data source attribute | `data.http.example.status_code` |
| `resource_type.name.` | Resource attribute | `random_pet.suffix.id` |
| `path.module` | Directory containing this `.tf` file | file paths |
| `path.root` | Root module directory | |
| `terraform.workspace` | Current workspace name | default = `default` |

---

## Part 5 — CLI command patterns

All commands run from the directory containing your `.tf` files:

```bash
cd /Users/jamesking/work/drawer2/Atos/Terraform
```

### Essential workflow

```bash
terraform init      # 1. Download providers, set up backend
terraform fmt       # 2. Format .tf files (optional but recommended)
terraform validate  # 3. Check syntax and internal consistency
terraform plan      # 4. Preview changes (dry run)
terraform apply     # 5. Create/update resources
terraform destroy   # 6. Tear everything down
```

### What each command does

| Command | Creates infra? | When to use |
|---------|----------------|-------------|
| `init` | No | First time, or after changing providers/backend/modules |
| `fmt` | No | Keep code style consistent |
| `validate` | No | CI / before plan — catches syntax errors |
| `plan` | No | Review what would change |
| `apply` | **Yes** | Actually make changes |
| `destroy` | **Yes** (removes) | Clean up all managed resources |

### Useful flags

```bash
terraform apply -auto-approve          # skip "yes" prompt
terraform plan -out=tfplan             # save plan to file
terraform apply tfplan                 # apply exact saved plan
terraform apply -var="environment=uat" # override a variable
terraform console                      # interactive expression evaluator
terraform show                         # inspect current state
terraform state list                   # list resources in state
```

### Plan output symbols

| Symbol | Meaning |
|--------|---------|
| `+` | create |
| `~` | update in-place |
| `-/+` | destroy and recreate |
| `-` | destroy |

Your first plan showed `Plan: 8 to add, 0 to change, 0 to destroy` — all creates.

### Apply output you already saw

```
random_pet.suffix: Creating...
random_pet.suffix: Creation complete after 0s [id=special-tapir]
null_resource.setup[0] (local-exec): Preparing terraform-showcase-dev-special-tapir
local_file.readme: Creating...
Apply complete! Resources: 8 added, 0 changed, 0 destroyed.
```

### Destroy output you already saw

```
Plan: 0 to add, 0 to change, 8 to destroy
Destroy complete! Resources: 8 destroyed.
```

---

## Part 6 — State and files on disk

After `init` + `apply`, your directory contains:

| File / folder | Purpose | Commit to Git? |
|---------------|---------|----------------|
| `.terraform/` | Downloaded providers | No (gitignore) |
| `.terraform.lock.hcl` | Pinned provider versions | **Yes** |
| `terraform.tfstate` | Current resource mapping | Careful — often remote in teams |
| `terraform.tfstate.backup` | Previous state snapshot | No |
| `generated-*.txt`, `manifest-*`, `owner-*.txt` | Resources created by `local_file` | Usually no |

State is how Terraform knows `random_pet.suffix` is `special-tapir` on the next run.

---

## Part 7 — Dependency graph (from your apply)

Terraform figured out this order automatically:

```
data.http.example ──────────────────────────┐
random_pet.suffix ──┬──► null_resource.setup ──► local_file.readme
                    ├──► terraform_data.derived
                    └──► (referenced in readme content)
local_file.json_manifest  (parallel)
local_file.yaml_manifest  (parallel)
local_file.owner_files    (parallel, one per owner)
```

Most dependencies come from **references** in expressions. `depends_on` is only needed when there is no visible reference (showcase uses it between `readme` and `setup`).

---

## Part 8 — Hands-on exercises

### Exercise 1: Read the code

In `showcase.tf`, find and answer:

1. What is `local.prefix` when defaults are used? → `terraform-showcase-dev`
2. How many `local_file` resources are created? → 5 (readme + json + yaml + 2 owners)
3. What triggers replacement of `random_pet.suffix`? → change to `var.environment` (the `keepers` block)

### Exercise 2: Run the workflow

```bash
cd /Users/jamesking/work/drawer2/Atos/Terraform
terraform init
terraform plan
terraform apply
ls -la *.txt *.json *.yaml 2>/dev/null
terraform output summary
terraform destroy
```

### Exercise 3: Change a variable

```bash
terraform apply -var="environment=test"
```

Observe: filenames change to `*-test*`, plan may replace `random_pet.suffix`.

### Exercise 4: Use the console

```bash
terraform console
```

Then type:

```hcl
local.prefix
var.owners
[for o in var.owners : "${o}@example.com"]
```

Type `exit` to quit.

### Exercise 5: Break and fix validation

```bash
terraform apply -var="project_name=ab"
```

Should fail validation (`length >= 3`). Fix by using a longer name.

---

## Part 9 — Syntax patterns to remember

### Pattern: optional resource with `count`

```hcl
resource "null_resource" "setup" {
  count = var.enabled ? 1 : 0
}
# Address: null_resource.setup[0]
```

### Pattern: one resource per item with `for_each`

```hcl
resource "local_file" "owner_files" {
  for_each = { for o in local.owners_sorted : o => { email = "${o}@example.com" } }
  filename = "owner-${each.key}.txt"
}
# Address: local_file.owner_files["alice"]
```

### Pattern: preconditions (fail early)

```hcl
lifecycle {
  precondition {
    condition     = data.http.example.status_code == 200
    error_message = "Expected example.com to return HTTP 200."
  }
}
```

### Pattern: sensitive values

```hcl
variable "secret_token" {
  sensitive = true
}
# Shown as <sensitive> in CLI output
```

---

## Part 10 — What's next

| Lesson | Topic |
|--------|-------|
| **Lesson 02** | Modules — splitting code into reusable pieces |
| **Lesson 03** | State, backends, and workspaces |
| **Lesson 04** | AWS provider + LocalStack (optional) |
| **Lesson 05** | `terraform test`, CI patterns |

---

## Quick reference card

```bash
# Daily workflow
terraform init → terraform fmt → terraform validate → terraform plan → terraform apply

# References
var.xxx          # input
local.xxx        # computed
data.type.name   # read-only
type.name.attr   # managed resource

# Block types
terraform {}     # tooling
provider {}      # plugin config
variable {}      # input
locals {}        # computed
data {}          # read
resource {}      # manage
output {}        # export
```

---

*Based on `showcase.tf` in the parent directory. You successfully ran `init`, `plan`, `apply`, and `destroy` — random suffix `special-tapir`.*
