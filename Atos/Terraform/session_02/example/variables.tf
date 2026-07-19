# Root-module inputs — override via -var, .tfvars, or TF_VAR_* env vars.

variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "eu-west-2"
}

variable "project_name" {
  description = "Short project name used in resource naming"
  type        = string
  default     = "demoapp"
}

variable "environment" {
  description = "Environment name (e.g. dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidrs" {
  description = "Public subnet CIDRs (one per AZ)"
  type        = list(string)
  default     = ["10.0.0.0/24", "10.0.1.0/24"]
}

variable "private_subnet_cidrs" {
  description = "Private subnet CIDRs (one per AZ)"
  type        = list(string)
  default     = ["10.0.10.0/24", "10.0.11.0/24"]
}

variable "enable_nat_gateway" {
  description = "Create a NAT gateway (costs money; disable for cheaper labs)"
  type        = bool
  default     = true
}

variable "allowed_ssh_cidr" {
  description = "CIDR allowed to SSH to the EC2 instance (restrict in real use)"
  type        = string
  default     = "0.0.0.0/0"
}

variable "ec2_instance_type" {
  description = "EC2 instance type for the app server"
  type        = string
  default     = "t3.micro"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "db_name" {
  description = "Initial database name"
  type        = string
  default     = "appdb"
}

variable "db_username" {
  description = "Master username for RDS"
  type        = string
  default     = "appadmin"
}
