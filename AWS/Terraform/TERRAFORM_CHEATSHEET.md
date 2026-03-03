# Complete Terraform Cheat Sheet (AWS Focus)

## Quick Start

```bash
terraform version
terraform init
terraform fmt -recursive
terraform validate
terraform plan -out=tfplan
terraform apply tfplan
terraform destroy
```

## Terraform File Basics

- `main.tf` - resources and data sources
- `providers.tf` - provider and Terraform settings
- `variables.tf` - input variable definitions
- `outputs.tf` - output values
- `terraform.tfvars` / `*.auto.tfvars` - variable values
- `backend.tf` - remote backend config

## Core CLI Commands

### Init / Upgrade

```bash
terraform init
terraform init -upgrade
terraform init -reconfigure
```

### Formatting / Validation

```bash
terraform fmt
terraform fmt -recursive
terraform validate
```

### Plan / Apply

```bash
terraform plan
terraform plan -out=tfplan
terraform apply
terraform apply -auto-approve
terraform apply tfplan
```

### Destroy

```bash
terraform destroy
terraform destroy -target=aws_s3_bucket.example
```

### Inspect

```bash
terraform show
terraform show -json
terraform output
terraform output vpc_id
terraform state list
terraform state show aws_instance.web
```

### Console / Graph

```bash
terraform console
terraform graph | dot -Tpng > graph.png
```

### Refresh (read-only)

```bash
terraform plan -refresh-only
terraform apply -refresh-only
```

## Terraform Block (Recommended)

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
```

## AWS Provider

```hcl
provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "my-project"
      Environment = var.environment
      ManagedBy   = "Terraform"
    }
  }
}
```

### AWS Authentication Options

- Environment variables (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`)
- AWS named profile (`AWS_PROFILE`)
- IAM role (EC2/ECS/EKS/Lambda)
- SSO via AWS CLI v2 profile

## Variables

```hcl
variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"
}

variable "instance_count" {
  type    = number
  default = 2
}

variable "subnet_ids" {
  type = list(string)
}
```

### tfvars Usage

```bash
terraform plan -var="environment=prod"
terraform plan -var-file="prod.tfvars"
```

## Outputs

```hcl
output "alb_dns_name" {
  value       = aws_lb.app.dns_name
  description = "Public DNS for ALB"
}
```

## Resource Patterns

### count

```hcl
resource "aws_instance" "web" {
  count         = var.instance_count
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"
}
```

### for_each

```hcl
resource "aws_security_group" "svc" {
  for_each = toset(["api", "worker"])
  name     = "${each.key}-sg"
  vpc_id   = aws_vpc.main.id
}
```

### Dynamic block

```hcl
dynamic "ingress" {
  for_each = var.ingress_rules
  content {
    from_port   = ingress.value.from
    to_port     = ingress.value.to
    protocol    = ingress.value.protocol
    cidr_blocks = ingress.value.cidr_blocks
  }
}
```

## Data Sources (Read Existing AWS Resources)

```hcl
data "aws_caller_identity" "current" {}

data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}
```

## Locals

```hcl
locals {
  name_prefix = "${var.project}-${var.environment}"
  common_tags = {
    Project     = var.project
    Environment = var.environment
  }
}
```

## Dependencies

- Implicit via references (`vpc_id = aws_vpc.main.id`)
- Explicit when needed:

```hcl
depends_on = [aws_iam_role_policy_attachment.app]
```

## Lifecycle Meta-Arguments

```hcl
lifecycle {
  prevent_destroy       = true
  create_before_destroy = true
  ignore_changes        = [tags["LastPatched"]]
}
```

## Remote State (S3 + DynamoDB Locking)

```hcl
terraform {
  backend "s3" {
    bucket         = "my-tf-state-bucket"
    key            = "envs/dev/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
```

```bash
terraform init -reconfigure
```

## Workspaces

```bash
terraform workspace list
terraform workspace new dev
terraform workspace new prod
terraform workspace select dev
terraform workspace show
```

Use workspace in naming:

```hcl
name = "app-${terraform.workspace}"
```

## Modules

```hcl
module "network" {
  source      = "./modules/network"
  environment = var.environment
  cidr_block  = "10.10.0.0/16"
}
```

### Registry module

```hcl
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"
  name    = "main"
  cidr    = "10.0.0.0/16"
}
```

## State Commands (Advanced)

```bash
terraform state list
terraform state show module.network.aws_vpc.main
terraform state mv old.address new.address
terraform state rm aws_s3_bucket.legacy
```

## Import Existing Infrastructure

```bash
terraform import aws_s3_bucket.logs my-existing-bucket-name
terraform import aws_instance.web i-0123456789abcdef0
```

Also useful in config:

```hcl
import {
  to = aws_s3_bucket.logs
  id = "my-existing-bucket-name"
}
```

## Refactoring Without Recreation

Use `moved` blocks when renaming resource addresses:

```hcl
moved {
  from = aws_instance.app
  to   = aws_instance.web
}
```

## Useful Functions

- String: `lower()`, `upper()`, `replace()`, `format()`, `join()`, `split()`
- Collections: `length()`, `contains()`, `keys()`, `values()`, `merge()`, `flatten()`
- Type conversion: `toset()`, `tolist()`, `tomap()`, `tonumber()`
- Flow: `coalesce()`, `try()`, `can()`, ternary `condition ? a : b`
- Files/templates: `file()`, `templatefile()`, `jsonencode()`, `yamldecode()`

## Common AWS Resources (Quick Reference)

- Networking: `aws_vpc`, `aws_subnet`, `aws_route_table`, `aws_internet_gateway`, `aws_nat_gateway`
- Security: `aws_security_group`, `aws_iam_role`, `aws_iam_policy`, `aws_kms_key`
- Compute: `aws_instance`, `aws_launch_template`, `aws_autoscaling_group`, `aws_ecs_cluster`
- Storage: `aws_s3_bucket`, `aws_ebs_volume`, `aws_efs_file_system`
- Database: `aws_db_instance`, `aws_rds_cluster`, `aws_dynamodb_table`
- Delivery: `aws_lb`, `aws_lb_target_group`, `aws_cloudfront_distribution`
- Observability: `aws_cloudwatch_log_group`, `aws_cloudwatch_metric_alarm`

## Targeting (Use Carefully)

```bash
terraform plan -target=aws_instance.web
terraform apply -target=module.network
```

Prefer full plans/applies for normal operations.

## Provisioners (Last Resort)

```hcl
provisioner "local-exec" {
  command = "echo ${self.id}"
}
```

Avoid provisioners when possible; prefer native cloud-init, user data, or config management.

## Security Best Practices

- Never commit secrets, `terraform.tfstate`, or `.tfvars` with credentials.
- Use secret managers (AWS Secrets Manager/SSM Parameter Store).
- Use least-privilege IAM permissions.
- Enable bucket encryption and access logging for state bucket.
- Turn on DynamoDB state locking.

## CI/CD Best Practice Flow

```bash
terraform fmt -check -recursive
terraform init -backend=false
terraform validate
terraform plan -out=tfplan
```

Apply should be gated (manual approval for production).

## .gitignore (Terraform)

```gitignore
.terraform/
*.tfstate
*.tfstate.*
crash.log
crash.*.log
*.tfvars
*.tfvars.json
.terraform.lock.hcl
```

If you use provider lock file for reproducibility, commit `.terraform.lock.hcl`.

## Troubleshooting

### Provider/plugin issues

```bash
rm -rf .terraform
terraform init -upgrade
```

### State lock stuck

```bash
terraform force-unlock LOCK_ID
```

### Debug logging

```bash
TF_LOG=DEBUG terraform plan
TF_LOG=TRACE terraform apply
```

### Drift detection

```bash
terraform plan -refresh-only
```

## Recommended Workflow (Team)

1. Pull latest code.
2. Select correct workspace or environment folder.
3. `terraform init`.
4. `terraform fmt -recursive` and `terraform validate`.
5. `terraform plan -out=tfplan`.
6. Review plan carefully.
7. `terraform apply tfplan`.
8. Confirm resources in AWS console and monitor logs/alarms.

## Handy One-Liners

```bash
# List resources in state
terraform state list

# Show one resource from state
terraform state show aws_s3_bucket.logs

# Output as JSON for scripts
terraform output -json

# Open interactive expression console
terraform console
```

---

Use this cheat sheet as a practical reference while building and operating AWS infrastructure with Terraform.
