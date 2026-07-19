# Using `count` Only for Identical Resources

`count` is a Terraform **meta-argument** that tells Terraform to create multiple instances from one resource or module block.

```hcl
resource "aws_instance" "worker" {
  count = 3

  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"
}
```

Terraform creates three instances:

```text
aws_instance.worker[0]
aws_instance.worker[1]
aws_instance.worker[2]
```

Each instance is identified by its **numeric position**, called its index. HashiCorp recommends `count` when resources are identical or almost identical; use `for_each` when instances need stable names or substantially different configuration. ([HashiCorp Developer][1])

---

## 1. The basic idea

Suppose you need three identical EC2 worker instances.

Without `count`:

```hcl
resource "aws_instance" "worker_1" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"
}

resource "aws_instance" "worker_2" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"
}

resource "aws_instance" "worker_3" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"
}
```

This repeats the same configuration.

With `count`:

```hcl
resource "aws_instance" "worker" {
  count = 3

  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"
}
```

This is shorter and easier to maintain.

Changing:

```hcl
instance_type = "t3.small"
```

updates all three instances consistently.

---

# 2. What “identical resources” means

It does not necessarily mean every property must be exactly the same.

It means the resources:

* perform the same role;
* use the same general configuration;
* can be distinguished adequately using a numeric index;
* do not require meaningful, stable names in Terraform state.

For example, these worker nodes are nearly identical:

```hcl
resource "aws_instance" "worker" {
  count = 3

  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"

  tags = {
    Name = "worker-${count.index + 1}"
    Role = "background-worker"
  }
}
```

The instances receive different names:

```text
worker-1
worker-2
worker-3
```

But their infrastructure configuration and purpose are the same.

---

# 3. Understanding `count.index`

Inside a block using `count`, Terraform provides:

```hcl
count.index
```

It starts at zero.

For:

```hcl
count = 3
```

the values are:

| Instance | `count.index` |
| -------- | ------------: |
| First    |           `0` |
| Second   |           `1` |
| Third    |           `2` |

Example:

```hcl
resource "aws_instance" "worker" {
  count = 3

  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"

  tags = {
    Name = "worker-${count.index}"
  }
}
```

The names become:

```text
worker-0
worker-1
worker-2
```

To make the human-facing number start from one:

```hcl
tags = {
  Name = "worker-${count.index + 1}"
}
```

This produces:

```text
worker-1
worker-2
worker-3
```

The Terraform addresses still use zero-based indexes:

```text
aws_instance.worker[0]
aws_instance.worker[1]
aws_instance.worker[2]
```

Terraform uses these indexed addresses to track each instance separately. ([HashiCorp Developer][2])

---

# 4. Good use case: identical EC2 workers

Imagine an application needs four stateless background workers behind a queue.

```hcl
variable "worker_count" {
  description = "Number of background worker instances"
  type        = number
  default     = 4
}

resource "aws_instance" "worker" {
  count = var.worker_count

  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"

  subnet_id              = aws_subnet.private[count.index % length(aws_subnet.private)].id
  vpc_security_group_ids = [aws_security_group.worker.id]

  tags = {
    Name        = "worker-${count.index + 1}"
    Role        = "background-worker"
    Environment = var.environment
  }
}
```

This is an appropriate use of `count` because:

* every instance has the same role;
* every instance uses the same AMI;
* every instance uses the same instance type;
* each instance uses the same security group;
* workers are treated as members of a pool;
* one worker is not conceptually more important than another.

The subnet expression distributes instances across available private subnets:

```hcl
count.index % length(aws_subnet.private)
```

For three subnets and five workers:

| Worker index | Calculation | Subnet index |
| -----------: | ----------: | -----------: |
|            0 |     `0 % 3` |            0 |
|            1 |     `1 % 3` |            1 |
|            2 |     `2 % 3` |            2 |
|            3 |     `3 % 3` |            0 |
|            4 |     `4 % 3` |            1 |

Although the subnets differ, the difference is derived mechanically from the index. The workers still have the same role.

---

# 5. Good use case: optional resource

`count` is frequently used to conditionally create either zero or one instance.

```hcl
variable "enable_bastion" {
  description = "Whether to create a bastion host"
  type        = bool
  default     = false
}

resource "aws_instance" "bastion" {
  count = var.enable_bastion ? 1 : 0

  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"

  tags = {
    Name = "bastion"
  }
}
```

When:

```hcl
enable_bastion = true
```

Terraform evaluates:

```hcl
count = 1
```

and creates:

```text
aws_instance.bastion[0]
```

When:

```hcl
enable_bastion = false
```

Terraform evaluates:

```hcl
count = 0
```

and creates nothing.

This is a common and reasonable use of `count`.

However, references must now include an index:

```hcl
output "bastion_public_ip" {
  value = var.enable_bastion ? aws_instance.bastion[0].public_ip : null
}
```

Without `count`, the reference would have been:

```hcl
aws_instance.bastion.public_ip
```

Adding `count` changes the resource from one object into a collection of objects.

---

# 6. Good use case: identical Secrets Manager containers

Suppose you need three temporary secret containers that have the same configuration and differ only by a generated number.

```hcl
resource "aws_secretsmanager_secret" "worker_token" {
  count = 3

  name                    = "dev/worker/token-${count.index + 1}"
  description             = "Authentication token for a worker"
  recovery_window_in_days = 7

  tags = {
    Application = "worker-service"
    ManagedBy   = "Terraform"
  }
}
```

Terraform creates:

```text
dev/worker/token-1
dev/worker/token-2
dev/worker/token-3
```

This can be acceptable when the secrets are genuinely interchangeable numbered members.

It is less appropriate when each secret has a meaningful identity, such as:

```text
database
payment-provider
email-service
```

Those should normally use `for_each`.

---

# 7. Referencing resources created with `count`

## Reference one instance

```hcl
aws_instance.worker[0].id
```

This returns the ID of the first worker.

## Reference all instances

Use a `for` expression:

```hcl
output "worker_ids" {
  value = [
    for worker in aws_instance.worker :
    worker.id
  ]
}
```

Or use a splat expression:

```hcl
output "worker_ids" {
  value = aws_instance.worker[*].id
}
```

Example result:

```text
[
  "i-0123456789abcdef0",
  "i-0123456789abcdef1",
  "i-0123456789abcdef2"
]
```

## Use each instance in another counted resource

```hcl
resource "aws_eip" "worker" {
  count = var.worker_count

  instance = aws_instance.worker[count.index].id
}
```

This establishes a positional relationship:

```text
aws_eip.worker[0] → aws_instance.worker[0]
aws_eip.worker[1] → aws_instance.worker[1]
aws_eip.worker[2] → aws_instance.worker[2]
```

This works, but it couples the two resources by index. That is safe only when both collections always have the same ordering and length.

---

# 8. The main problem: indexes are identities

Terraform does not identify counted resources by their AWS name tag.

It identifies them by their Terraform address:

```text
aws_instance.worker[0]
aws_instance.worker[1]
aws_instance.worker[2]
```

This is the central limitation of `count`.

Consider:

```hcl
variable "server_names" {
  type = list(string)

  default = [
    "api",
    "worker",
    "scheduler"
  ]
}

resource "aws_instance" "server" {
  count = length(var.server_names)

  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"

  tags = {
    Name = var.server_names[count.index]
  }
}
```

Terraform creates:

| Terraform address        | Name        |
| ------------------------ | ----------- |
| `aws_instance.server[0]` | `api`       |
| `aws_instance.server[1]` | `worker`    |
| `aws_instance.server[2]` | `scheduler` |

At first, this looks fine.

Now remove `worker` from the middle:

```hcl
default = [
  "api",
  "scheduler"
]
```

Terraform now sees:

| Address | Previous value | New value        |
| ------- | -------------- | ---------------- |
| `[0]`   | `api`          | `api`            |
| `[1]`   | `worker`       | `scheduler`      |
| `[2]`   | `scheduler`    | no longer exists |

Terraform may therefore plan to:

1. modify `[1]` from `worker` into `scheduler`;
2. destroy `[2]`.

Conceptually, you wanted only to remove `worker`, but the positional identities changed.

Depending on which resource arguments changed and whether those arguments require replacement, this can cause unnecessary updates or resource replacements.

---

# 9. Why `for_each` is safer for named resources

The same servers can be represented using a set:

```hcl
variable "server_names" {
  type = set(string)

  default = [
    "api",
    "worker",
    "scheduler"
  ]
}

resource "aws_instance" "server" {
  for_each = var.server_names

  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"

  tags = {
    Name = each.key
  }
}
```

The addresses are now:

```text
aws_instance.server["api"]
aws_instance.server["worker"]
aws_instance.server["scheduler"]
```

Remove:

```text
worker
```

Terraform can clearly determine that only this instance should be destroyed:

```text
aws_instance.server["worker"]
```

The other instances keep their stable addresses:

```text
aws_instance.server["api"]
aws_instance.server["scheduler"]
```

HashiCorp describes `for_each` as suitable for multiple similar objects where each instance is associated with a map key or set member. ([HashiCorp Developer][3])

---

# 10. Bad use of `count`: servers with different roles

This is technically valid:

```hcl
variable "servers" {
  type = list(object({
    name          = string
    instance_type = string
  }))

  default = [
    {
      name          = "api"
      instance_type = "t3.small"
    },
    {
      name          = "worker"
      instance_type = "t3.medium"
    },
    {
      name          = "scheduler"
      instance_type = "t3.micro"
    }
  ]
}

resource "aws_instance" "server" {
  count = length(var.servers)

  ami           = data.aws_ami.amazon_linux.id
  instance_type = var.servers[count.index].instance_type

  tags = {
    Name = var.servers[count.index].name
  }
}
```

But this is generally poor design because the resources are not really identical:

* they have different names;
* they have different instance sizes;
* they have different roles;
* their identity comes from the list element, not the position.

A map with `for_each` is clearer and safer:

```hcl
variable "servers" {
  type = map(object({
    instance_type = string
    role          = string
  }))

  default = {
    api = {
      instance_type = "t3.small"
      role          = "http-api"
    }

    worker = {
      instance_type = "t3.medium"
      role          = "queue-worker"
    }

    scheduler = {
      instance_type = "t3.micro"
      role          = "job-scheduler"
    }
  }
}

resource "aws_instance" "server" {
  for_each = var.servers

  ami           = data.aws_ami.amazon_linux.id
  instance_type = each.value.instance_type

  tags = {
    Name = each.key
    Role = each.value.role
  }
}
```

The identity is explicit:

```text
aws_instance.server["api"]
aws_instance.server["worker"]
aws_instance.server["scheduler"]
```

---

# 11. `count` versus `for_each`

| Question                                         | Use `count` |     Use `for_each` |
| ------------------------------------------------ | ----------: | -----------------: |
| Do you need exactly N interchangeable instances? |         Yes |           Possibly |
| Are differences derived only from a number?      |         Yes |           Possibly |
| Does each resource have a meaningful name?       |  Usually no |                Yes |
| Could items be removed from the middle?          |       Risky |              Safer |
| Do instances need stable identities?             |          No |                Yes |
| Are input values stored in a list?               |       Often | Convert to map/set |
| Are resources differently configured?            |       Avoid |             Prefer |
| Do you need optional zero-or-one creation?       |      Common |      Also possible |

A useful rule is:

> Use `count` when you care about **how many** resources exist. Use `for_each` when you care about **which** resources exist.

---

# 12. Identical versus individually managed

## Appropriate for `count`

```text
worker-1
worker-2
worker-3
```

All are:

* queue workers;
* same instance type;
* same networking;
* same IAM role;
* interchangeable.

## Better for `for_each`

```text
api
scheduler
reporting
```

Each has:

* a distinct responsibility;
* a meaningful name;
* potentially different configuration;
* an identity that must remain stable.

---

# 13. Changing the count value

Start with:

```hcl
count = 3
```

Terraform tracks:

```text
worker[0]
worker[1]
worker[2]
```

Increase it:

```hcl
count = 5
```

Terraform keeps the existing instances and creates:

```text
worker[3]
worker[4]
```

Decrease it:

```hcl
count = 2
```

Terraform removes instances from the end:

```text
worker[2]
worker[3]
worker[4]
```

This is predictable when all resources are interchangeable.

It becomes problematic when `[2]`, `[3]`, or `[4]` represent meaningful named resources.

---

# 14. `count` must be known during planning

Terraform must know the value of `count` before it begins creating resources, because it needs to construct the instance addresses during the plan phase. Therefore, `count` cannot depend on a value that remains unknown until apply. ([HashiCorp Developer][4])

Valid:

```hcl
variable "worker_count" {
  type    = number
  default = 3
}

resource "aws_instance" "worker" {
  count = var.worker_count

  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"
}
```

Potentially invalid:

```hcl
resource "aws_instance" "worker" {
  count = aws_autoscaling_group.workers.desired_capacity

  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"
}
```

If `desired_capacity` is unknown until AWS creates or reads the resource, Terraform cannot determine how many instance addresses to plan.

---

# 15. Using `count` with modules

`count` can also create multiple instances of a module.

```hcl
module "worker" {
  count = 3

  source = "./modules/ec2-worker"

  name          = "worker-${count.index + 1}"
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.private[count.index].id
}
```

Module addresses become:

```text
module.worker[0]
module.worker[1]
module.worker[2]
```

Outputs must include the index:

```hcl
module.worker[0].instance_id
```

Or collect all outputs:

```hcl
output "worker_instance_ids" {
  value = module.worker[*].instance_id
}
```

Terraform supports `count` on module blocks for creating identical or similar module instances. ([HashiCorp Developer][5])

---

# 16. Common mistakes

## Mistake 1: treating `count.index` as a stable business identity

```hcl
tags = {
  Customer = var.customers[count.index]
}
```

If customers are added, removed, or reordered, the index-to-customer relationship changes.

Prefer:

```hcl
for_each = var.customers

tags = {
  Customer = each.key
}
```

---

## Mistake 2: using parallel lists

```hcl
variable "names" {
  default = ["api", "worker"]
}

variable "instance_types" {
  default = ["t3.small", "t3.medium"]
}

resource "aws_instance" "server" {
  count = length(var.names)

  instance_type = var.instance_types[count.index]

  tags = {
    Name = var.names[count.index]
  }
}
```

Problems include:

* lists can have different lengths;
* relationships are implicit;
* ordering becomes important;
* inserting an item can shift indexes.

Prefer a map of objects:

```hcl
variable "servers" {
  type = map(object({
    instance_type = string
  }))

  default = {
    api = {
      instance_type = "t3.small"
    }

    worker = {
      instance_type = "t3.medium"
    }
  }
}
```

---

## Mistake 3: assuming tags establish Terraform identity

This:

```hcl
tags = {
  Name = "api"
}
```

does not make the state address:

```text
aws_instance.server["api"]
```

With `count`, it remains:

```text
aws_instance.server[0]
```

Tags are AWS metadata. Terraform state identity comes from the resource address.

---

## Mistake 4: converting an existing resource to `count` carelessly

Before:

```hcl
resource "aws_instance" "server" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"
}
```

Address:

```text
aws_instance.server
```

After:

```hcl
resource "aws_instance" "server" {
  count = 1

  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"
}
```

New address:

```text
aws_instance.server[0]
```

Terraform may interpret this as an address change. A `moved` block can document the refactoring:

```hcl
moved {
  from = aws_instance.server
  to   = aws_instance.server[0]
}
```

HashiCorp recommends using configuration-driven moves to tell Terraform that a changed address represents the same underlying object rather than a new one. ([HashiCorp Developer][6])

---

# 17. Practical decision examples

## Example A: five identical queue workers

```hcl
count = 5
```

**Use `count`.**

They form an interchangeable pool.

---

## Example B: one optional NAT gateway

```hcl
count = var.create_nat_gateway ? 1 : 0
```

**Use `count`.**

This is a straightforward zero-or-one condition.

---

## Example C: one subnet per availability zone

```hcl
availability_zones = [
  "eu-west-2a",
  "eu-west-2b",
  "eu-west-2c"
]
```

`count` can work:

```hcl
resource "aws_subnet" "private" {
  count = length(var.availability_zones)

  availability_zone = var.availability_zones[count.index]
}
```

But `for_each` is usually more robust:

```hcl
resource "aws_subnet" "private" {
  for_each = toset(var.availability_zones)

  availability_zone = each.key
}
```

Addresses become meaningful:

```text
aws_subnet.private["eu-west-2a"]
aws_subnet.private["eu-west-2b"]
aws_subnet.private["eu-west-2c"]
```

---

## Example D: database, payment and email secrets

```text
database
payment
email
```

**Use `for_each`.**

They have distinct identities and probably distinct policies, owners or values.

---

## Example E: ten identical test buckets

```text
test-bucket-1
test-bucket-2
...
test-bucket-10
```

`count` may be appropriate if they are genuinely disposable and interchangeable.

---

# 18. Recommended rule

Use `count` when all three statements are true:

1. The resources have the same role and almost the same configuration.
2. Differences can be safely derived from `count.index`.
3. Replacing or deleting the highest-numbered instances is acceptable when the count decreases.

Use `for_each` when any of these are true:

* each resource has a meaningful name;
* individual resources have different settings;
* collection items may be inserted, removed or reordered;
* resource identity must remain stable;
* you need to refer to resources using names rather than indexes.

## Final comparison

```hcl
# Count answers: “How many workers?”
resource "aws_instance" "worker" {
  count = 3
}
```

```hcl
# for_each answers: “Which services?”
resource "aws_instance" "service" {
  for_each = {
    api       = "t3.small"
    worker    = "t3.medium"
    scheduler = "t3.micro"
  }
}
```

The main best practice is therefore not that `count` can only create byte-for-byte identical resources. It is that `count` should represent a **quantity of interchangeable instances**, while `for_each` should represent a **collection of independently identifiable instances**.

[1]: https://developer.hashicorp.com/terraform/language/meta-arguments/count?utm_source=chatgpt.com "count meta-argument reference | Terraform - HashiCorp Developer"
[2]: https://developer.hashicorp.com/terraform/cli/state/resource-addressing?utm_source=chatgpt.com "Resource address reference | Terraform"
[3]: https://developer.hashicorp.com/terraform/language/meta-arguments/for_each?utm_source=chatgpt.com "for_each meta-argument reference | Terraform - HashiCorp Developer"
[4]: https://developer.hashicorp.com/terraform/language/expressions/references?utm_source=chatgpt.com "References to Named Values - Terraform - HashiCorp Developer"
[5]: https://developer.hashicorp.com/terraform/language/block/module?utm_source=chatgpt.com "module block reference | Terraform - HashiCorp Developer"
[6]: https://developer.hashicorp.com/terraform/language/modules/develop/refactoring?utm_source=chatgpt.com "Refactor modules | Terraform"
