# How to Set Up Terraform Using VS Code (AWS)

This guide walks through setting up Terraform in VS Code for AWS development on macOS, then running your first Terraform workflow.

## 1) Install Prerequisites

## Install Homebrew (if needed)

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

## Install Terraform CLI

```bash
brew tap hashicorp/tap
brew install hashicorp/tap/terraform
terraform version
```

## Install AWS CLI

```bash
brew install awscli
aws --version
```

## Install Git (if needed)

```bash
brew install git
git --version
```

## 2) Configure AWS Credentials

Use one of these methods:

- AWS profile via `aws configure`
- AWS SSO via `aws configure sso`
- IAM role credentials in cloud environments

Basic profile setup:

```bash
aws configure
```

You will provide:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (for example `us-east-1`)
- Output format (for example `json`)

Test access:

```bash
aws sts get-caller-identity
```

Optional profile usage:

```bash
export AWS_PROFILE=default
```

## 3) Install VS Code and Extensions

Install VS Code from Microsoft, then add these extensions:

- **HashiCorp Terraform** (`hashicorp.terraform`)  
  Syntax highlighting, validation, formatting, and language features.
- **AWS Toolkit** (`amazonwebservices.aws-toolkit-vscode`)  
  AWS account integration and basic AWS interactions.
- **EditorConfig** (optional)  
  Keeps formatting consistent across environments.

## 4) Recommended VS Code Settings

Open Command Palette -> **Preferences: Open Settings (JSON)** and add:

```json
{
  "editor.formatOnSave": true,
  "[terraform]": {
    "editor.defaultFormatter": "hashicorp.terraform"
  },
  "[terraform-vars]": {
    "editor.defaultFormatter": "hashicorp.terraform"
  },
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true
}
```

This ensures `.tf` and `.tfvars` files auto-format on save.

## 5) Create a Terraform Project in VS Code

In VS Code terminal:

```bash
mkdir terraform-aws-demo
cd terraform-aws-demo
touch main.tf variables.tf outputs.tf providers.tf .gitignore
```

Suggested `.gitignore`:

```gitignore
.terraform/
*.tfstate
*.tfstate.*
crash.log
crash.*.log
*.tfvars
*.tfvars.json
```

If your team pins provider versions, commit `.terraform.lock.hcl`.

## 6) Add Minimal Working Terraform Config

`providers.tf`:

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
```

`variables.tf`:

```hcl
variable "aws_region" {
  type    = string
  default = "us-east-1"
}
```

`main.tf`:

```hcl
resource "aws_s3_bucket" "demo" {
  bucket = "replace-with-unique-bucket-name-12345"
}
```

`outputs.tf`:

```hcl
output "bucket_name" {
  value = aws_s3_bucket.demo.bucket
}
```

## 7) Run Terraform in VS Code Terminal

From the project folder:

```bash
terraform init
terraform fmt -recursive
terraform validate
terraform plan
terraform apply
```

When done testing:

```bash
terraform destroy
```

## 8) Optional: Use tfvars per Environment

Create `dev.tfvars`:

```hcl
aws_region = "us-east-1"
```

Run with:

```bash
terraform plan -var-file="dev.tfvars"
terraform apply -var-file="dev.tfvars"
```

## 9) Optional: Configure Remote State (Team Setup)

For collaboration, store state remotely in S3 with DynamoDB locking.

`backend.tf`:

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

Then initialize:

```bash
terraform init -reconfigure
```

## 10) Quality and Safety Checklist

- Run before commit:
  - `terraform fmt -recursive`
  - `terraform validate`
  - `terraform plan`
- Never commit credentials or state files.
- Use least-privilege IAM permissions.
- Review plan output before every apply.

## 11) Common VS Code + Terraform Troubleshooting

- **Terraform not found in terminal**  
  Restart VS Code after install and verify with `terraform version`.

- **Extension not formatting `.tf` files**  
  Re-check formatter settings and ensure HashiCorp extension is enabled.

- **AWS auth errors**  
  Verify with `aws sts get-caller-identity` and check `AWS_PROFILE`.

- **Provider/plugin issues**  
  Run:
  ```bash
  rm -rf .terraform
  terraform init -upgrade
  ```

## 12) Daily Workflow in VS Code

1. Open folder in VS Code.
2. Pull latest changes from Git.
3. Confirm AWS profile/region.
4. Run `terraform init` (if first run or provider changes).
5. Edit `.tf` files.
6. Run `terraform fmt`, `validate`, and `plan`.
7. Apply approved changes with `terraform apply`.

---

Your VS Code environment is now ready for Terraform-based AWS infrastructure development.
