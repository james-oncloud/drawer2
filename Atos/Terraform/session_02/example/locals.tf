# Shared lookups and computed values used across the root module.

# Pick AZs in the current region (we use the first two below).
data "aws_availability_zones" "available" {
  state = "available"
}

# Latest Amazon Linux 2023 AMI for the EC2 app server.
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Short random suffix so S3 bucket names are globally unique.
resource "random_id" "suffix" {
  byte_length = 4
}

locals {
  name_prefix = "${var.project_name}-${var.environment}"
  azs         = slice(data.aws_availability_zones.available.names, 0, 2)

  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }

  # Globally unique bucket name
  assets_bucket_name = "${local.name_prefix}-assets-${random_id.suffix.hex}"
  logs_bucket_name   = "${local.name_prefix}-logs-${random_id.suffix.hex}"
}
