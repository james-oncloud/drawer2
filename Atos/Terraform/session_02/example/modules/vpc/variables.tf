# Inputs for the VPC module.

variable "name" {
  description = "Name prefix for VPC resources"
  type        = string
}

variable "cidr_block" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "azs" {
  description = "Availability zones for subnets (at least 2 for RDS)"
  type        = list(string)
}

variable "public_subnet_cidrs" {
  description = "CIDR blocks for public subnets (one per AZ)"
  type        = list(string)
}

variable "private_subnet_cidrs" {
  description = "CIDR blocks for private subnets (one per AZ)"
  type        = list(string)
}

variable "enable_nat_gateway" {
  description = "Create a single NAT gateway for private subnet egress"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags applied to all VPC resources"
  type        = map(string)
  default     = {}
}
