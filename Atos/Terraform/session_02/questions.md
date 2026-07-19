# Questions

Questions asked during this session.

1. [What type of instructions does Terraform support?](#1-what-type-of-instructions-does-terraform-support) — Jul 11, 2026
2. [What are the built in functions in Terraform?](#2-what-are-the-built-in-functions-in-terraform) — Jul 11, 2026
3. [What are the general format/patterns for 'resource' instructions?](#3-what-are-the-general-formatpatterns-for-resource-instructions) — Jul 11, 2026
4. [List most common resource names from AWS Provider](#4-list-most-common-resource-names-from-aws-provider) — Jul 11, 2026
5. [How does Terraform support modular script files?](#5-how-does-terraform-support-modular-script-files) — Jul 12, 2026
6. [What are the most common 'terraform' commands with examples?](#6-what-are-the-most-common-terraform-commands-with-examples) — Jul 12, 2026

---

## 1. What type of instructions does Terraform support?

*Asked: Saturday, Jul 11, 2026*

### Answer

Terraform configuration is written in **HCL** (HashiCorp Configuration Language). It is built from three building blocks:

| Building block | What it is | Example |
|----------------|------------|---------|
| **Block** | A container with a type, optional labels, and a body | `resource "local_file" "readme" { ... }` |
| **Argument** | A `name = value` pair inside a block | `length = 2` |
| **Expression** | A value that can be computed | `"${var.project_name}-${var.environment}"` |

#### Top-level block types (the main “instructions”)

These are the primary block types you write in `.tf` files:

| Block type | Purpose |
|------------|---------|
| `terraform` | Tooling settings (version, providers, backend) |
| `provider` | Plugin configuration for a cloud/API |
| `variable` | **Inputs** to your module |
| `locals` | **Computed** values used within the module |
| `data` | **Read** existing resources (no create/destroy) |
| `resource` | **Create and manage** infrastructure |
| `output` | **Export** values after apply |
| `module` | Call another Terraform module |
| `check` | Assertions that fail plan/apply if a condition is false |

#### Meta-arguments (special instructions on `resource` / `data`)

These control Terraform behavior rather than provider-specific settings:

| Meta-argument | Purpose |
|---------------|---------|
| `count` | Create N instances (indexed: `name[0]`) |
| `for_each` | Create one instance per map/set key (`name["key"]`) |
| `depends_on` | Force ordering when Terraform cannot infer it |
| `provider` | Use an aliased provider |
| `lifecycle` | Custom create/update/destroy behavior (e.g. `prevent_destroy`, pre/postconditions) |

#### Other language features

- **Functions** — `length()`, `merge()`, `jsonencode()`, etc.
- **Provisioners** — run scripts on create/destroy (e.g. `local-exec`, `remote-exec`)
- **Dynamic blocks** — generate repeated nested blocks from a collection
- **Import / moved blocks** — adopt existing resources or refactor addresses without recreation

#### Mental model

Terraform is **declarative**: you describe the desired end state, not step-by-step commands. The CLI (`init`, `plan`, `apply`, `destroy`) compares your `.tf` files to state and reconciles reality.

```
Your .tf files     →  desired state
terraform.tfstate  →  current state
plan               →  diff between the two
apply              →  make reality match your code
```

---

## 2. What are the built in functions in Terraform?

*Asked: Saturday, Jul 11, 2026*

### Answer

Terraform includes **built-in functions** you call inside expressions. Syntax:

```hcl
function_name(arg1, arg2, ...)
```

You **cannot define your own functions** in `.tf` files — only providers can expose extra functions (e.g. `provider::terraform::encode_tfvars`). Experiment interactively with `terraform console`.

Functions are grouped by category:

#### Numeric

| Function | Purpose |
|----------|---------|
| `ceil`, `floor` | Round up / down to nearest integer |
| `min`, `max` | Smallest / largest of a set of numbers |
| `log`, `pow` | Logarithm, exponentiation |
| `parseint` | Parse string as integer in a given base |
| `signum` | Returns `-1`, `0`, or `1` for the sign |

#### String

| Function | Purpose |
|----------|---------|
| `lower`, `upper`, `title` | Change case |
| `trim`, `trimspace`, `trimprefix`, `trimsuffix`, `chomp` | Remove whitespace or characters |
| `replace`, `split`, `join` | Find/replace, split, concatenate |
| `format`, `formatlist` | Printf-style formatting |
| `regex`, `regexall` | Regular expression matching |
| `substr`, `indent`, `strrev` | Substring, indent lines, reverse |
| `startswith`, `endswith`, `strcontains` | String prefix/suffix/containment checks |
| `templatestring` | Render a string as a template |

#### Collections

| Function | Purpose |
|----------|---------|
| `length` | Size of list, map, set, or string |
| `contains` | Check if collection contains a value |
| `keys`, `values`, `lookup` | Work with maps |
| `merge` | Combine maps or objects |
| `concat`, `flatten`, `distinct`, `compact` | Combine or clean lists |
| `element`, `index`, `slice`, `chunklist` | Access or partition lists |
| `zipmap`, `transpose`, `matchkeys` | Build or reshape collections |
| `sort`, `reverse`, `range` | Order or generate sequences |
| `setunion`, `setintersection`, `setsubtract`, `setproduct` | Set operations |
| `coalesce`, `coalescelist` | First non-null / non-empty value |
| `alltrue`, `anytrue`, `one`, `sum` | Aggregate checks or totals |

#### Encoding

| Function | Purpose |
|----------|---------|
| `jsonencode`, `jsondecode` | JSON serialize / parse |
| `yamlencode`, `yamldecode` | YAML serialize / parse |
| `base64encode`, `base64decode`, `base64gzip` | Base64 and gzip encoding |
| `textencodebase64`, `textdecodebase64` | Base64 with character encoding |
| `csvdecode` | Parse CSV into a list of maps |
| `urlencode` | URL-encode a string |

#### Filesystem

| Function | Purpose |
|----------|---------|
| `file`, `filebase64` | Read file contents (plain or base64) |
| `fileexists`, `fileset` | Check existence or glob files |
| `templatefile` | Read and render a template file |
| `abspath`, `basename`, `dirname`, `pathexpand` | Path manipulation |

#### Date and time

| Function | Purpose |
|----------|---------|
| `timestamp` | Current UTC time (RFC 3339) |
| `plantimestamp` | UTC time when plan was created |
| `formatdate` | Format a timestamp |
| `timeadd`, `timecmp` | Add duration or compare timestamps |

#### Hash and crypto

| Function | Purpose |
|----------|---------|
| `md5`, `sha1`, `sha256`, `sha512` | Hash a string |
| `base64sha256`, `base64sha512` | Hash and base64-encode |
| `filemd5`, `filesha1`, `filesha256`, `filesha512`, `filebase64sha256`, `filebase64sha512` | Hash file contents |
| `bcrypt`, `rsadecrypt` | Password hashing, RSA decryption |
| `uuid`, `uuidv5` | Generate UUIDs |

#### IP network

| Function | Purpose |
|----------|---------|
| `cidrhost` | Host IP within a CIDR prefix |
| `cidrnetmask` | CIDR prefix → subnet mask |
| `cidrsubnet`, `cidrsubnets` | Calculate subnet ranges |

#### Type conversion and safety

| Function | Purpose |
|----------|---------|
| `try` | Return first expression that does not error |
| `can` | Returns `true` if expression evaluates without error |
| `tobool`, `tolist`, `tomap`, `tonumber`, `toset`, `tostring` | Type conversion |
| `type` | Returns the type of a value |
| `sensitive`, `nonsensitive`, `issensitive` | Mark or inspect sensitive values |
| `ephemeralasnull` | Convert ephemeral value to `null` |

#### Terraform-specific (provider-defined)

| Function | Purpose |
|----------|---------|
| `provider::terraform::encode_tfvars` | Object → `.tfvars` string |
| `provider::terraform::decode_tfvars` | `.tfvars` string → object |
| `provider::terraform::encode_expr` | Value → Terraform expression syntax |

#### Special path values (not functions, but commonly used with them)

| Value | Purpose |
|-------|---------|
| `path.module` | Directory of the current module |
| `path.root` | Root module directory |
| `path.cwd` | Current working directory |
| `terraform.workspace` | Current workspace name |

#### Most-used in practice

From `showcase.tf` and typical configs, these appear most often:

```hcl
length(var.project_name)
merge(local.tags, var.extra_tags)
jsonencode(local.manifest)
try(var.optional_note, "default")
can(length(var.optional_note))
coalesce(var.env, "dev")
format("%s-%s", var.project, var.environment)
templatefile("${path.module}/app.tftpl", { name = var.name })
```

Full reference: [HashiCorp — Built-in Functions](https://developer.hashicorp.com/terraform/language/functions)

---

## 3. What are the general format/patterns for 'resource' instructions?

*Asked: Saturday, Jul 11, 2026*

### Answer

A `resource` block tells Terraform to **create, update, and destroy** something via a provider.

#### Basic format

```hcl
resource "PROVIDER_TYPE" "LOCAL_NAME" {
  # meta-arguments (optional, Terraform-level)
  # provider arguments (required/optional per provider docs)
  # nested blocks (optional, provider-specific)
}
```

| Part | Meaning | Example |
|------|---------|---------|
| `PROVIDER_TYPE` | Resource type from the provider | `aws_s3_bucket`, `local_file` |
| `LOCAL_NAME` | Your label within this module | `readme`, `app_bucket` |
| Body | Arguments and nested blocks | `content = "..."` |

**Resource address** (how Terraform refers to it in state, plans, and references):

```
resource_type.local_name
local_file.readme
random_pet.suffix
```

Reference an **attribute** after apply:

```hcl
random_pet.suffix.id
local_file.readme.filename
```

#### Recommended block ordering (HashiCorp style guide)

1. `count` or `for_each` (if used)
2. Provider arguments
3. `lifecycle` (if used)
4. Other nested blocks (`provisioner`, provider-specific blocks)

#### Pattern 1 — Single resource (most common)

```hcl
resource "local_file" "readme" {
  content  = "Hello"
  filename = "${path.module}/readme.txt"
}
```

Dependencies are usually **implicit** — if you reference another resource in an argument, Terraform orders them automatically:

```hcl
filename = "${path.module}/generated-${random_pet.suffix.id}.txt"
```

#### Pattern 2 — Optional resource with `count`

Creates 0 or N indexed instances:

```hcl
resource "null_resource" "setup" {
  count = var.enabled ? 1 : 0

  triggers = {
    prefix = local.prefix
  }
}

# Reference: null_resource.setup[0]
```

Use `count.index` inside the block when you need the index.

#### Pattern 3 — One resource per item with `for_each`

Creates one instance per map key or set element (preferred when keys are stable strings):

```hcl
resource "local_file" "owner_files" {
  for_each = {
    for owner in local.owners_sorted :
    owner => { email = "${owner}@example.com" }
  }

  filename = "${path.module}/owner-${each.key}.txt"
  content  = each.value.email
}

# Reference: local_file.owner_files["alice"]
```

| | `count` | `for_each` |
|---|---------|------------|
| Address | `name[0]`, `name[1]` | `name["key"]` |
| Iterator | `count.index` | `each.key`, `each.value` |
| Best for | Optional on/off, numeric index | Stable string keys, maps/sets |

Prefer `for_each` when stable keys matter — safer refactors than `count`.

#### Meta-arguments (Terraform-level, not provider-specific)

| Meta-argument | Purpose |
|---------------|---------|
| `count` | Create N instances |
| `for_each` | Create one per map/set key |
| `depends_on` | Force ordering when no visible reference exists |
| `provider` | Use an aliased provider |
| `lifecycle` | Control create/update/destroy behavior |

```hcl
resource "local_file" "json_manifest" {
  provider = local.secondary   # aliased provider

  content  = local.manifest_json
  filename = "${path.module}/manifest.json"

  depends_on = [
    null_resource.setup          # explicit dependency only when needed
  ]

  lifecycle {
    create_before_destroy = true
    prevent_destroy       = false
    ignore_changes        = [tags]

    precondition {
      condition     = data.http.example.status_code == 200
      error_message = "Expected HTTP 200."
    }

    postcondition {
      condition     = length(self.content) > 20
      error_message = "File content too short."
    }
  }
}
```

**`depends_on` rule:** use only when the dependency is real but not visible in expressions. Prefer implicit references.

#### Nested blocks

Provider-specific nested blocks go in the body (e.g. `ingress { }` on a security group). Common Terraform-level nested blocks:

| Nested block | Purpose |
|--------------|---------|
| `lifecycle { }` | `prevent_destroy`, `ignore_changes`, pre/postconditions |
| `provisioner "local-exec" { }` | Run commands at create/destroy time |
| `dynamic "block_name" { }` | Generate repeated nested blocks from a collection |

```hcl
resource "null_resource" "setup" {
  count = var.enabled ? 1 : 0

  provisioner "local-exec" {
    command = "echo 'Preparing ${self.triggers.prefix}'"
  }
}
```

Use `self` inside provisioners and lifecycle conditions to refer to the resource's own attributes.

#### Dynamic blocks (repeated nested blocks)

```hcl
dynamic "ingress" {
  for_each = var.allowed_ports
  content {
    from_port = ingress.value
    to_port   = ingress.value
  }
}
```

#### Quick reference

```hcl
# Single
resource "TYPE" "name" { arg = value }

# Optional (count)
resource "TYPE" "name" { count = condition ? 1 : 0 }

# Collection (for_each)
resource "TYPE" "name" {
  for_each = var.items
  name     = each.key
}

# References
TYPE.name.attribute           # single
TYPE.name[0].attribute        # count
TYPE.name["key"].attribute    # for_each
```

---

## 4. List most common resource names from AWS Provider

*Asked: Saturday, Jul 11, 2026*

### Answer

The AWS provider defines **1000+** resource types. In practice, most Terraform AWS configs use a smaller set grouped by service.

> **Note:** Resource **type** names (e.g. `aws_instance`) are fixed by the provider. The second label (e.g. `"web_server"`) is your local name — use descriptive singular nouns like `app`, `main_vpc`, `web_sg`.

#### Networking (VPC foundation)

| Resource type | AWS service | Typical use |
|---------------|-------------|-------------|
| `aws_vpc` | VPC | Private network |
| `aws_subnet` | Subnet | Public/private subnets per AZ |
| `aws_internet_gateway` | IGW | Internet access for public subnets |
| `aws_nat_gateway` | NAT Gateway | Outbound internet from private subnets |
| `aws_eip` | Elastic IP | Static public IP (often for NAT) |
| `aws_route_table` | Route table | Routing rules |
| `aws_route_table_association` | Route table | Attach subnet to route table |
| `aws_route` | Route | Individual route entry |
| `aws_security_group` | Security group | Instance/LB firewall rules |
| `aws_security_group_rule` | Security group | Individual ingress/egress rule |
| `aws_vpc_endpoint` | VPC endpoint | Private access to AWS services |
| `aws_network_acl` | NACL | Subnet-level network ACL |

#### Compute (EC2)

| Resource type | AWS service | Typical use |
|---------------|-------------|-------------|
| `aws_instance` | EC2 | Virtual machines |
| `aws_launch_template` | EC2 | Reusable instance launch config |
| `aws_autoscaling_group` | Auto Scaling | Scale EC2 fleet |
| `aws_key_pair` | EC2 | SSH key |
| `aws_ebs_volume` | EBS | Block storage |
| `aws_volume_attachment` | EBS | Attach volume to instance |

#### Storage (S3)

| Resource type | AWS service | Typical use |
|---------------|-------------|-------------|
| `aws_s3_bucket` | S3 | Object storage bucket |
| `aws_s3_object` | S3 | Individual object/file |
| `aws_s3_bucket_policy` | S3 | Bucket IAM policy |
| `aws_s3_bucket_versioning` | S3 | Enable versioning |
| `aws_s3_bucket_public_access_block` | S3 | Block public access |
| `aws_s3_bucket_server_side_encryption_configuration` | S3 | Encryption settings |

> Modern AWS provider splits S3 settings into separate resources (versioning, encryption, lifecycle) rather than one monolithic bucket block.

#### Load balancing

| Resource type | AWS service | Typical use |
|---------------|-------------|-------------|
| `aws_lb` | ALB / NLB | Application or network load balancer |
| `aws_lb_target_group` | ELB | Backend targets |
| `aws_lb_listener` | ELB | Listener (port/protocol) |
| `aws_lb_listener_rule` | ALB | Routing rules |

#### Database (RDS / Aurora)

| Resource type | AWS service | Typical use |
|---------------|-------------|-------------|
| `aws_db_instance` | RDS | Managed relational DB |
| `aws_rds_cluster` | Aurora | Aurora cluster |
| `aws_rds_cluster_instance` | Aurora | Aurora cluster member |
| `aws_db_subnet_group` | RDS | Subnets for DB |
| `aws_db_parameter_group` | RDS | DB engine parameters |

#### IAM & security

| Resource type | AWS service | Typical use |
|---------------|-------------|-------------|
| `aws_iam_role` | IAM | Role for services/users |
| `aws_iam_policy` | IAM | Standalone policy document |
| `aws_iam_role_policy` | IAM | Inline policy on a role |
| `aws_iam_role_policy_attachment` | IAM | Attach managed policy to role |
| `aws_iam_user` | IAM | Human or service user |
| `aws_iam_instance_profile` | IAM | Attach role to EC2 |
| `aws_kms_key` | KMS | Encryption keys |
| `aws_secretsmanager_secret` | Secrets Manager | Stored secrets |
| `aws_ssm_parameter` | SSM | Config parameters |

#### DNS (Route 53)

| Resource type | AWS service | Typical use |
|---------------|-------------|-------------|
| `aws_route53_zone` | Route 53 | Hosted zone |
| `aws_route53_record` | Route 53 | DNS record (A, CNAME, etc.) |

#### Containers & orchestration

| Resource type | AWS service | Typical use |
|---------------|-------------|-------------|
| `aws_eks_cluster` | EKS | Kubernetes cluster |
| `aws_eks_node_group` | EKS | Managed worker nodes |
| `aws_ecs_cluster` | ECS | Container cluster |
| `aws_ecs_service` | ECS | Running service |
| `aws_ecs_task_definition` | ECS | Container task spec |

#### Serverless & messaging

| Resource type | AWS service | Typical use |
|---------------|-------------|-------------|
| `aws_lambda_function` | Lambda | Serverless function |
| `aws_lambda_permission` | Lambda | Invoke permissions |
| `aws_sqs_queue` | SQS | Message queue |
| `aws_sns_topic` | SNS | Pub/sub notifications |
| `aws_sns_topic_subscription` | SNS | Topic subscriber |
| `aws_dynamodb_table` | DynamoDB | NoSQL table |
| `aws_apigatewayv2_api` | API Gateway | HTTP/WebSocket API |

#### Observability & certificates

| Resource type | AWS service | Typical use |
|---------------|-------------|-------------|
| `aws_cloudwatch_log_group` | CloudWatch | Log group |
| `aws_cloudwatch_metric_alarm` | CloudWatch | Alert on metrics |
| `aws_acm_certificate` | ACM | TLS certificate |
| `aws_wafv2_web_acl` | WAF | Web application firewall |

#### Top 10 you'll see in almost every AWS project

1. `aws_vpc`
2. `aws_subnet`
3. `aws_security_group`
4. `aws_instance`
5. `aws_s3_bucket`
6. `aws_iam_role`
7. `aws_iam_role_policy_attachment`
8. `aws_lb` + `aws_lb_target_group` + `aws_lb_listener`
9. `aws_route53_record`
10. `aws_db_instance`

#### Example from this repo

```hcl
provider "aws" {
  region = "eu-west-2"
}

resource "aws_s3_bucket" "example" {
  bucket = "my-app-bucket"
}

resource "aws_instance" "app" {
  ami           = "ami-123"
  instance_type = "t2.micro"
}
```

Full resource index: [Terraform Registry — hashicorp/aws](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)

---

## 5. How does Terraform support modular script files?

*Asked: Sunday, Jul 12, 2026*

### Answer

Terraform modularizes configuration with **modules** — directories of `.tf` files you call with a `module` block.

#### 1. Split files in one module (no imports)

Every `.tf` file in a directory is loaded and merged into **one module**. You can split by concern freely:

```
main.tf
variables.tf
outputs.tf
providers.tf
```

There is no `import` / `include`. Same directory = same module.

#### 2. Reuse with child modules

Package reusable config in its own folder and call it:

```hcl
module "network" {
  source = "./modules/vpc"

  cidr_block = "10.0.0.0/16"
  env        = var.environment
}

# Use outputs from the child module
resource "aws_instance" "app" {
  subnet_id = module.network.private_subnet_id
  # ...
}
```

**Interface:**

- **Inputs** → `variable` blocks in the child
- **Outputs** → `output` blocks in the child (`module.NAME.output_name`)

#### 3. Where modules can come from (`source`)

| Source | Example |
|--------|---------|
| Local path | `source = "./modules/vpc"` |
| Terraform Registry | `source = "terraform-aws-modules/vpc/aws"` |
| Git | `source = "git::https://github.com/org/repo.git//modules/vpc"` |
| HTTP / S3 / GCS | Archive URL or object store |

#### 4. Mental model

```
Root module (where you run terraform)
 ├── resources, variables, outputs
 └── module "x" { source = "..." }  →  child module
                                      └── can call more modules
```

So: **multiple `.tf` files** organize one module; **`module` blocks** compose reusable modules across directories (or remote sources).

---

## 6. What are the most common 'terraform' commands with examples?

*Asked: Sunday, Jul 12, 2026*

### Answer

Terraform is driven by **CLI commands**. You run them in the directory that contains your root module (the `.tf` files).

#### Core workflow (use these every day)

| Command | Purpose |
|---------|---------|
| `terraform init` | Download providers/modules, set up backend |
| `terraform plan` | Preview changes (diff of desired vs state) |
| `terraform apply` | Create/update infrastructure |
| `terraform destroy` | Tear down managed resources |
| `terraform fmt` | Format `.tf` files |
| `terraform validate` | Check syntax and config validity |

#### Typical day-to-day sequence

```bash
cd my-project

terraform init                 # first time (or after new providers/modules)
terraform fmt -recursive       # tidy formatting
terraform validate             # catch errors early
terraform plan                 # review what will change
terraform apply                # apply after review
# or: terraform apply -auto-approve
```

#### Command examples

**`init` — prepare the working directory**

```bash
terraform init
terraform init -upgrade          # upgrade providers/modules to newer allowed versions
terraform init -reconfigure      # re-init backend (e.g. after backend config change)
```

**`plan` — show the execution plan**

```bash
terraform plan
terraform plan -out=tfplan       # save plan for apply
terraform plan -var="env=dev"
terraform plan -var-file="prod.tfvars"
terraform plan -target=aws_s3_bucket.app   # limit to one resource (use sparingly)
```

**`apply` — make reality match config**

```bash
terraform apply
terraform apply tfplan           # apply a saved plan (no re-prompt)
terraform apply -auto-approve
terraform apply -var-file="prod.tfvars"
```

**`destroy` — remove managed resources**

```bash
terraform destroy
terraform destroy -auto-approve
terraform destroy -target=aws_instance.app
```

**`fmt` / `validate` — hygiene**

```bash
terraform fmt
terraform fmt -recursive
terraform fmt -check             # CI: fail if files need formatting
terraform validate
```

#### State & inspection

| Command | Purpose |
|---------|---------|
| `terraform show` | Show state or a saved plan |
| `terraform state list` | List resource addresses in state |
| `terraform state show ADDR` | Show one resource from state |
| `terraform output` | Print root module outputs |
| `terraform console` | Interactive expression evaluator |

```bash
terraform show
terraform show tfplan
terraform state list
terraform state show aws_instance.app
terraform output
terraform output public_ip
terraform console              # then type: length(var.project_name)
```

#### Useful extras

| Command | Purpose |
|---------|---------|
| `terraform refresh` / `apply -refresh-only` | Sync state with real infrastructure |
| `terraform import` | Bring an existing cloud resource under Terraform |
| `terraform graph` | Dependency graph (DOT format) |
| `terraform providers` | Show required providers |
| `terraform version` | CLI + provider versions |
| `terraform workspace` | Isolate state per environment (dev/stage/prod) |

```bash
terraform apply -refresh-only
terraform import aws_s3_bucket.app my-existing-bucket
terraform providers
terraform version

terraform workspace list
terraform workspace new staging
terraform workspace select staging
```

#### Mental model

```
init      →  download plugins, connect backend
plan      →  "what would change?"
apply     →  "make it so"
destroy   →  "remove what we manage"
state/*   →  inspect / repair the inventory Terraform tracks
```

Most work is: **`init` → `plan` → `apply`**. Use `fmt`/`validate` before plan, and `state`/`output`/`show` when debugging.

Full reference: [HashiCorp — Terraform CLI Commands](https://developer.hashicorp.com/terraform/cli/commands)
