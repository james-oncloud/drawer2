Tags are one of the simplest but most important best practices in Terraform. The idea is to **attach metadata to every resource** you create so that people and AWS services can identify, organize, secure, and manage them.

Think of a tag like a label on a filing cabinet.

Instead of seeing:

```text
i-08a7f3421ab9cd123
```

you see:

```text
Name = sales-api
Environment = prod
Owner = platform-team
CostCentre = finance
ManagedBy = Terraform
```

Now anyone can immediately understand what the resource is for.

---

# What is a tag?

A tag is simply a **key/value pair**.

Example:

```hcl
tags = {
  Name        = "sales-api"
  Environment = "dev"
  Owner       = "James"
}
```

AWS stores these alongside the resource.

---

# Why are tags important?

## 1. Find resources

Instead of searching hundreds of EC2 instances:

```
EC2 Console

sales-api
payments-api
reporting-api
batch-worker
```

You can filter by

```
Environment = prod
```

or

```
Application = sales-api
```

---

## 2. Cost allocation

Suppose your AWS bill is £15,000/month.

Without tags:

```
£15,000

???
```

Nobody knows what generated the cost.

With tags:

```
Application = Sales API
£3,200

Application = Payments
£5,800

Application = Analytics
£2,100
```

AWS Cost Explorer can break costs down using tags.

---

## 3. Ownership

Suppose an EC2 instance is consuming lots of CPU.

Who owns it?

Without tags:

```
Nobody knows.
```

With tags:

```
Owner = Platform Team
```

or

```
Owner = James
```

Problem solved.

---

## 4. Automation

You can automate actions using tags.

Example:

Every night stop all development servers.

AWS can search for

```
Environment = dev
```

and stop only those.

Production remains running.

---

## 5. Security

IAM policies can use tags.

For example,

Developers may only modify resources tagged

```
Environment = dev
```

They cannot touch

```
Environment = prod
```

---

# Example in Terraform

```hcl
resource "aws_instance" "web" {

  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"

  tags = {

    Name        = "sales-api"
    Environment = "dev"
    Owner       = "Platform Team"
    ManagedBy   = "Terraform"

  }
}
```

---

# Common tags

Most companies define a standard set of tags.

Example:

| Tag             | Example       |
| --------------- | ------------- |
| Name            | sales-api     |
| Environment     | dev           |
| Application     | sales-api     |
| Owner           | platform-team |
| CostCentre      | finance       |
| Project         | migration     |
| ManagedBy       | Terraform     |
| Department      | Engineering   |
| BusinessUnit    | Retail        |
| Confidentiality | Internal      |

---

# Using variables

Instead of hardcoding:

```hcl
tags = {

  Environment = "dev"

}
```

Use variables:

```hcl
variable "environment" {
  type = string
}
```

```hcl
tags = {

  Environment = var.environment

}
```

Now the same code works for

```
dev

test

stage

prod
```

---

# Provider default tags (recommended)

Rather than repeating tags on every resource, the AWS provider supports **default tags**.

```hcl
provider "aws" {

  region = "eu-west-2"

  default_tags {

    tags = {

      ManagedBy  = "Terraform"
      Project    = "Terraform Learning"
      Environment = var.environment

    }

  }

}
```

Every AWS resource automatically receives these tags.

Then individual resources can add their own:

```hcl
resource "aws_s3_bucket" "logs" {

  bucket = "company-logs"

  tags = {

    Name = "Logging Bucket"

  }

}
```

The bucket ends up with all the default tags plus its own `Name` tag.

---

# Book recommendation

*Terraform: Up & Running* encourages tagging **every resource** consistently. In practice, teams often enforce a standard tag set across all infrastructure. A common baseline is:

* `ManagedBy = Terraform`
* `Environment = dev|test|stage|prod`
* `Application = <application name>`
* `Owner = <team or individual>`
* `CostCentre = <billing code>`

Using provider-level `default_tags` is a clean way to enforce these common tags while keeping individual resource definitions concise.
