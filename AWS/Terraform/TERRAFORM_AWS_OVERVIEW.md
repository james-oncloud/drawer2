# Terraform with AWS: Overview, Setup, and Usage

Terraform lets you define AWS infrastructure as code (IaC): VPCs, EC2, RDS, IAM, S3, and more, in `.tf` files.
You run Terraform to compare your desired configuration with real AWS state, then create, update, or delete resources safely.

## 1) Core Terraform Concepts

- **Provider**: Plugin for a platform (`hashicorp/aws` for AWS).
- **Resources**: AWS objects you want (`aws_s3_bucket`, `aws_instance`, etc.).
- **State**: Terraform's record of managed resources (`terraform.tfstate`).
- **Plan**: Preview of changes (`terraform plan`).
- **Apply**: Executes changes (`terraform apply`).
- **Modules**: Reusable Terraform building blocks.

## 2) Prerequisites

- AWS account with appropriate IAM permissions
- Terraform CLI installed
- AWS CLI installed (`aws configure`) or environment variables set:
  - `AWS_ACCESS_KEY_ID`
  - `AWS_SECRET_ACCESS_KEY`
  - `AWS_REGION`

Recommended:
- Use an IAM role or short-lived credentials (instead of long-lived keys)
- Pin Terraform and provider versions in configuration

## 3) Minimal AWS Terraform Example

Create `main.tf`:

```hcl
terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  type    = string
  default = "us-east-1"
}

resource "aws_s3_bucket" "example" {
  bucket = "my-unique-terraform-demo-bucket-123456"
}

output "bucket_name" {
  value = aws_s3_bucket.example.bucket
}
```

## 4) Typical Workflow

From your Terraform folder:

1. `terraform init`
   - Downloads provider plugins and initializes the working directory.
2. `terraform fmt` and `terraform validate`
   - Formats and validates configuration.
3. `terraform plan`
   - Shows exactly what will change.
4. `terraform apply`
   - Creates or updates infrastructure.
5. `terraform destroy` (when needed)
   - Removes managed resources.

## 5) State Best Practices for AWS

For teams, avoid local-only state. Use remote state:

- **S3 backend** for state storage
- **DynamoDB table** for state locking (prevents concurrent apply issues)

Example backend block:

```hcl
terraform {
  backend "s3" {
    bucket         = "my-terraform-state-bucket"
    key            = "envs/dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
```

Then run:

```bash
terraform init -reconfigure
```

## 6) Recommended Project Structure

- `main.tf` - core resources
- `variables.tf` - input variables
- `outputs.tf` - outputs
- `providers.tf` - provider configuration
- `terraform.tfvars` or `*.tfvars` - environment values
- `modules/` - reusable modules (network, compute, db, etc.)
- `environments/` - separate stacks (dev/stage/prod)

## 7) Common AWS + Terraform Tips

- Use separate AWS accounts or workspaces per environment.
- Tag all resources (`Environment`, `Owner`, `Project`).
- Use `data` sources to reference existing AWS resources.
- Use `terraform import` when migrating existing infrastructure.
- Run checks in CI: `fmt`, `validate`, and `plan`.
- Never commit secrets or `.tfstate` files to git.
