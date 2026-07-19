**Terraform: Up & Running (3rd Edition)** by Yevgeniy Brikman emphasizes not just Terraform syntax, but building infrastructure that is **reusable, maintainable, testable, secure, and scalable**. Below is a distilled list of the key best practices presented throughout the book.

---

# 1. Organize Infrastructure into Modules ⭐⭐⭐⭐⭐

The book repeatedly emphasizes that **modules are the fundamental building block** of a Terraform codebase.

**Avoid**

```
main.tf
(2,000 lines)
```

**Prefer**

```
live/
    dev/
    stage/
    prod/

modules/
    vpc/
    ec2/
    rds/
    iam/
```

Benefits:

* Reuse
* Easier testing
* Clear ownership
* Less duplication

---

# 2. Keep Live Infrastructure Separate from Modules ⭐⭐⭐⭐⭐

One of the most important recommendations.

```
live/
    dev/
    prod/

modules/
    networking/
    database/
    webserver/
```

Modules contain reusable code.

Live contains:

* environment-specific values
* state
* backend configuration

---

# 3. DRY (Don't Repeat Yourself)

Never duplicate infrastructure.

Instead of:

```
dev-vpc.tf
prod-vpc.tf
stage-vpc.tf
```

Create

```
modules/vpc
```

and reuse it.

---

# 4. Store State Remotely ⭐⭐⭐⭐⭐

Never keep important state locally.

Use

* S3
* Azure Storage
* GCS

Example

```hcl
terraform {
  backend "s3" {
    bucket = "terraform-state"
    key    = "prod/vpc.tfstate"
    region = "eu-west-2"
  }
}
```

Benefits

* team collaboration
* recovery
* versioning

---

# 5. Enable State Locking

Avoid two engineers applying simultaneously.

Use

* DynamoDB (older approach)
* Native S3 locking (newer versions)

---

# 6. Never Edit State Manually

Avoid:

```
terraform.tfstate
```

Use

```
terraform state mv

terraform state rm

terraform import
```

---

# 7. Keep Resources Small

Instead of

```
network.tf
```

containing

* VPC
* EC2
* RDS
* IAM
* ALB

Split them into

```
vpc.tf
iam.tf
ec2.tf
outputs.tf
variables.tf
```

---

# 8. Use Variables

Don't hardcode

```
ami = "ami-12345"
```

Instead

```hcl
variable "ami_id" {}

ami = var.ami_id
```

---

# 9. Validate Variables

Example

```hcl
variable "environment" {

  validation {

    condition = contains(
      ["dev","stage","prod"],
      var.environment
    )

    error_message = "Invalid environment."
  }
}
```

---

# 10. Use Outputs

Expose only useful values.

Example

```hcl
output "vpc_id" {
  value = aws_vpc.main.id
}
```

---

# 11. Prefer Data Sources over Hardcoding

Instead of

```
ami = "ami-12345"
```

Use

```hcl
data "aws_ami" "amazon_linux" {

}
```

Terraform discovers the latest AMI automatically.

---

# 12. Use `for_each` Instead of Copy/Paste

Bad

```hcl
resource "aws_iam_user" "alice" {}
resource "aws_iam_user" "bob" {}
resource "aws_iam_user" "john" {}
```

Better

```hcl
for_each = toset([
    "alice",
    "bob",
    "john"
])
```

---

# 13. Use `count` Only for Identical Resources

Book recommendation

Use

```
count
```

when resources differ only by number.

Use

```
for_each
```

when resources have identities.

---

# 14. Use Locals

Instead of repeating

```
"${var.environment}-sales-api"
```

20 times

```hcl
locals {

  app_name = "${var.environment}-sales-api"

}
```

---

# 15. Tag Everything

Every AWS resource should have tags.

Example

```hcl
tags = {

    Environment = "dev"
    ManagedBy   = "Terraform"
    Owner       = "Platform"

}
```

---

# 16. Use `terraform fmt`

Every commit should be formatted.

```
terraform fmt
```

---

# 17. Validate Before Applying

Run

```
terraform validate
```

before

```
terraform apply
```

---

# 18. Always Review Plans ⭐⭐⭐⭐⭐

Never

```
terraform apply
```

blindly.

Always

```
terraform plan
```

Review:

* creates
* destroys
* updates

---

# 19. Save Plans

Production

```
terraform plan -out=tfplan

terraform apply tfplan
```

Ensures the applied plan is exactly the one reviewed.

---

# 20. Use Version Constraints

Don't rely on latest providers.

```hcl
required_providers {

aws = {

version = "~> 6.0"

}

}
```

---

# 21. Pin Terraform Version

```hcl
terraform {

required_version = ">=1.10"

}
```

Avoids surprises.

---

# 22. Keep Secrets out of Code ⭐⭐⭐⭐⭐

Never

```hcl
password = "Password123"
```

Instead

* AWS Secrets Manager
* SSM Parameter Store
* Vault
* Environment variables

---

# 23. Don't Commit Secrets

Ignore

```
terraform.tfvars
```

Ignore

```
terraform.tfstate
```

---

# 24. Prefer `jsonencode()`

Instead of writing JSON manually

```json
{
 "Version":"2012..."
}
```

Use

```hcl
jsonencode({
})
```

---

# 25. Minimize Explicit `depends_on`

Terraform already understands dependencies.

Use

```hcl
subnet_id = aws_subnet.public.id
```

instead of

```hcl
depends_on = [...]
```

Only use `depends_on` when Terraform cannot infer the relationship.

---

# 26. Use Workspaces Sparingly

The book generally recommends **separate directories/accounts for long-lived environments** (`dev`, `stage`, `prod`) rather than relying on Terraform workspaces for environment isolation.

---

# 27. Separate Environments

```
live/

    dev/

    stage/

    prod/
```

Rather than

```
terraform workspace select prod
```

for everything.

---

# 28. Use Least-Privilege IAM

Terraform itself should have only the permissions it requires.

Resources should also receive minimal IAM permissions.

---

# 29. Test Infrastructure

Infrastructure should be tested just like software.

The book discusses tools like:

* Terratest
* Go testing
* Automated CI pipelines

---

# 30. Treat Infrastructure as Software ⭐⭐⭐⭐⭐

This is the central philosophy of the book:

* Source control everything.
* Review changes through pull requests.
* Use automated testing.
* Apply consistent coding standards.
* Version your modules.
* Build reusable abstractions.
* Use CI/CD for deployment.
* Avoid manual changes in the cloud.

---

# Top 10 Best Practices to Master First

If you're learning Terraform, focus on these first:

1. **Use modules** for reusable infrastructure.
2. **Separate `live/` from `modules/`.**
3. **Store state remotely** with locking.
4. **Always review `terraform plan` before `apply`.**
5. **Never hardcode secrets**; use Secrets Manager or similar.
6. **Use variables, outputs, and locals** to keep configurations clean.
7. **Use `for_each` instead of duplicating resources.**
8. **Pin Terraform and provider versions** to ensure reproducible builds.
9. **Format (`terraform fmt`) and validate (`terraform validate`)** your code before applying.
10. **Treat infrastructure as software** by using version control, code reviews, automated testing, and CI/CD.

These practices form the foundation for writing Terraform configurations that remain maintainable as your infrastructure grows from a few resources to large, multi-environment deployments.
