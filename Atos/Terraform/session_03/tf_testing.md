



Testing Terraform is typically done at **four different levels**, just like testing application code:

| Level | What is tested | Typical tools |
|-------|----------------|---------------|
| 1. Validation | Syntax and formatting | `terraform fmt`, `terraform validate` |
| 2. Static Analysis | Security, style, best practices | TFLint, Checkov, tfsec |
| 3. Unit Testing | Individual modules | Native Terraform tests (`terraform test`), Terratest |
| 4. Integration Testing | Real infrastructure | Terratest, Kitchen-Terraform |

---

# 1. Syntax Testing

The first level ensures your Terraform code is valid before it is deployed.

## Format Check

```bash
terraform fmt -check
```

Example

Bad formatting

```terraform
resource "aws_s3_bucket" "logs"{
bucket="my-bucket"
}
```

Run

```bash
terraform fmt
```

Result

```terraform
resource "aws_s3_bucket" "logs" {
  bucket = "my-bucket"
}
```

---

## Validate Configuration

```bash
terraform validate
```

Example

Suppose you forgot a required argument.

```terraform
resource "aws_instance" "web" {
}
```

Output

```
Error: Missing required argument

The argument "ami" is required.
```

This catches configuration problems without contacting AWS.

---

# 2. Static Analysis

These tools look for mistakes and security problems.

## TFLint

Detects Terraform mistakes.

Example

```terraform
instance_type = "t2.nanoo"
```

Running

```bash
tflint
```

Output

```
Unknown instance type
```

---

## Checkov

Finds security issues.

Example

```terraform
resource "aws_s3_bucket" "logs" {}
```

Running

```bash
checkov -d .
```

Output

```
Bucket versioning disabled

Bucket encryption missing
```

---

## tfsec

Looks for security vulnerabilities.

Example

```terraform
resource "aws_security_group" "web" {

  ingress {
    from_port   = 22
    to_port     = 22
    cidr_blocks = ["0.0.0.0/0"]
  }

}
```

Output

```
Security group allows SSH from anywhere
```

---

# 3. Unit Testing

Terraform now includes **native testing**.

Suppose you have a module:

```
modules/
    s3/
        main.tf
        variables.tf
```

Create

```
tests/basic.tftest.hcl
```

Example

```hcl
run "bucket_test" {

  command = plan

  variables {
    bucket_name = "example-bucket"
  }

  assert {

    condition = aws_s3_bucket.bucket.bucket == "example-bucket"

    error_message = "Bucket name incorrect"

  }

}
```

Run

```bash
terraform test
```

Output

```
PASS bucket_test
```

No infrastructure needs to be created when only testing plans.

---

# Example Module

Module

```terraform
variable "bucket_name" {}

resource "aws_s3_bucket" "bucket" {
  bucket = var.bucket_name
}
```

Test

```hcl
run "name_test" {

  command = plan

  variables {
    bucket_name = "company-logs"
  }

  assert {
    condition     = aws_s3_bucket.bucket.bucket == "company-logs"
    error_message = "Wrong bucket name"
  }

}
```

---

# 4. Integration Testing

Sometimes you must verify that AWS actually creates the resources.

This usually means

1. Deploy
2. Verify
3. Destroy

A popular framework is **Terratest**.

Example workflow

```
terraform init

terraform apply

Run automated checks

terraform destroy
```

---

# Terratest Example (Go)

```go
terraformOptions := terraform.WithDefaultRetryableErrors(t, &terraform.Options{
    TerraformDir: "../examples/simple",
})

defer terraform.Destroy(t, terraformOptions)

terraform.InitAndApply(t, terraformOptions)

bucket := terraform.Output(t, terraformOptions, "bucket_name")

assert.Equal(t, "company-logs", bucket)
```

Terratest verifies the real infrastructure.

---

# Testing Outputs

Suppose your module has

```terraform
output "bucket_name" {
  value = aws_s3_bucket.bucket.bucket
}
```

Test

```hcl
run "output_test" {

  command = apply

  assert {
    condition = output.bucket_name == "company-logs"

    error_message = "Incorrect output"

  }

}
```

---

# Testing Variables

Suppose

```terraform
variable "environment" {
  type = string
}
```

Resource

```terraform
tags = {
  Environment = var.environment
}
```

Test

```hcl
run "tag_test" {

  command = plan

  variables {
    environment = "prod"
  }

  assert {

    condition =
      aws_instance.web.tags.Environment == "prod"

    error_message = "Wrong environment tag"

  }

}
```

---

# Testing Count

Module

```terraform
resource "aws_instance" "web" {
  count = var.instance_count
}
```

Test

```hcl
run "count_test" {

  command = plan

  variables {
    instance_count = 3
  }

  assert {

    condition =
      length(aws_instance.web) == 3

    error_message = "Wrong instance count"

  }

}
```

---

# Testing Conditional Resources

Terraform

```terraform
resource "aws_s3_bucket" "logs" {
  count = var.enable_logging ? 1 : 0
}
```

Test

```hcl
run "logging_enabled" {

  command = plan

  variables {
    enable_logging = true
  }

  assert {
    condition     = length(aws_s3_bucket.logs) == 1
    error_message = "Logging bucket missing"
  }

}
```

---

# Testing Locals

```terraform
locals {
  bucket = "${var.project}-logs"
}
```

Test

```hcl
run "local_test" {

  command = plan

  variables {
    project = "sales"
  }

  assert {
    condition     = local.bucket == "sales-logs"
    error_message = "Local incorrect"
  }

}
```

---

# Testing Module Outputs

Suppose your root module calls another module.

```terraform
module "storage" {
  source = "../modules/storage"
}
```

Output

```terraform
output "bucket_name" {
  value = module.storage.bucket_name
}
```

Test

```hcl
run "module_output" {

  command = apply

  assert {
    condition = output.bucket_name == "company-logs"

    error_message = "Unexpected output"

  }

}
```

---

# CI/CD Pipeline Example

A common pipeline runs tests in this order:

```text
Checkout Code
      │
      ▼
terraform fmt -check
      │
      ▼
terraform init
      │
      ▼
terraform validate
      │
      ▼
tflint
      │
      ▼
checkov
      │
      ▼
terraform test
      │
      ▼
terraform plan
      │
      ▼
Manual Approval
      │
      ▼
terraform apply
```

This sequence catches formatting issues, configuration errors, security problems, module logic errors, and finally verifies the deployment plan before any infrastructure is created.

# Terraform Testing Best Practices

- Use `terraform fmt -check` on every commit.
- Run `terraform validate` before creating a plan.
- Use TFLint to catch provider-specific mistakes.
- Scan with Checkov or tfsec for security and compliance issues.
- Write `terraform test` cases for reusable modules.
- Keep tests small and focused on one behavior.
- Prefer `plan`-based tests where possible because they are faster and cheaper.
- Reserve `apply`-based tests for scenarios that require real infrastructure verification.
- Always destroy test infrastructure after integration tests to avoid unnecessary costs.
- Run all validation, linting, security checks, and tests automatically in your CI/CD pipeline.

Following this layered approach gives fast feedback during development while still providing confidence that your Terraform modules behave correctly when deployed to real cloud environments.