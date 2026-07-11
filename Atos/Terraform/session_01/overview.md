## What is Terraform?

**Terraform** (by HashiCorp) is an **Infrastructure as Code (IaC)** tool used to define, provision, and manage infrastructure (servers, databases, networks, etc.) using code instead of manual setup.

---

## Core Idea (1-liner)

You **declare what you want**, and Terraform figures out **how to create/update it**.

---

## How Terraform Works (Step-by-Step)

### 1. Write Configuration (Desired State)

You define infrastructure using **HCL (HashiCorp Configuration Language)**:

```hcl
resource "aws_s3_bucket" "example" {
  bucket = "my-app-bucket"
}
```

👉 This says: *“I want an S3 bucket with this name.”*

---

### 2. Initialize (`terraform init`)

* Downloads required **providers** (e.g. AWS, Azure, GCP)
* Sets up working directory

---

### 3. Plan (`terraform plan`)

Terraform compares:

* **Current state** (what exists)
* **Desired state** (your code)

Then generates an **execution plan**:

```
+ create aws_s3_bucket.example
```

👉 Shows exactly what will change (no surprises)

---

### 4. Apply (`terraform apply`)

* Executes the plan
* Creates/updates/deletes resources

👉 Now real infrastructure is provisioned

---

### 5. State Management (`terraform.tfstate`)

Terraform stores a **state file**:

* Maps your code → real resources
* Tracks IDs, dependencies, metadata

👉 This is how Terraform knows what already exists

---

## Key Concepts

### 1. Providers

Plugins that connect Terraform to services:

* AWS
* Azure
* Kubernetes

```hcl
provider "aws" {
  region = "eu-west-2"
}
```

---

### 2. Resources

The actual infrastructure components:

```hcl
resource "aws_instance" "app" {
  ami           = "ami-123"
  instance_type = "t2.micro"
}
```

---

### 3. State

* Single source of truth
* Stored locally or remotely (e.g. S3 + DynamoDB for locking)

---

### 4. Execution Plan

* Shows **diff** between current and desired state
* Safe preview before applying

---

### 5. Idempotency

Running Terraform multiple times:

👉 Same config → same result (no duplicates)

---

### 6. Dependency Graph

Terraform automatically builds a graph:

```
VPC → Subnet → EC2
```

👉 Ensures correct creation order

---

## Example Flow (End-to-End)

```bash
terraform init     # setup
terraform plan     # preview changes
terraform apply    # create infra
terraform destroy  # tear down
```

---

## How Terraform Decides What to Do

Internally:

1. Parse your `.tf` files
2. Load current state
3. Build dependency graph
4. Compute diff
5. Execute in correct order (parallel where possible)

---

## Why Terraform is Powerful

* **Cloud agnostic** (AWS, Azure, GCP)
* **Version-controlled infrastructure**
* **Reusable modules**
* **Safe changes (plan before apply)**
* **Automation friendly (CI/CD)**

---

## Simple Mental Model

Think of Terraform like:

> “Git for infrastructure”

* `.tf files` → desired state (like code)
* `terraform plan` → diff
* `terraform apply` → commit changes

---

## Common Architecture Pattern (Real World)

* Store code in Git
* Use remote state (S3)
* Run Terraform via CI/CD (GitHub Actions / Jenkins)
* Use modules for reuse (e.g. VPC module)

---

## Limitations (Important)

* State file must be managed carefully
* Not ideal for **real-time changes**
* Debugging can be tricky for complex graphs

---

If you want, I can give you a **production-grade Terraform project structure (modules + environments + AWS setup)** tailored to your Java/Scala backend systems.
