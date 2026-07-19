# Networking: VPC + security groups that wire EC2, Lambda, and RDS together.

# Create VPC, subnets, IGW, optional NAT, and route tables.
module "vpc" {
  source = "./modules/vpc"

  name                 = "${local.name_prefix}-vpc"
  cidr_block           = var.vpc_cidr
  azs                  = local.azs
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  enable_nat_gateway   = var.enable_nat_gateway
  tags                 = local.common_tags
}

# EC2: allow SSH (from your CIDR) and HTTP from the internet.
module "sg_ec2" {
  source = "./modules/security_group"

  name        = "${local.name_prefix}-ec2-sg"
  description = "App EC2 instance"
  vpc_id      = module.vpc.vpc_id

  ingress_rules = [
    {
      description = "SSH"
      from_port   = 22
      to_port     = 22
      protocol    = "tcp"
      cidr_blocks = [var.allowed_ssh_cidr]
    },
    {
      description = "HTTP"
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    },
  ]

  tags = local.common_tags
}

# Lambda in the VPC: default egress is enough for Secrets Manager + RDS via NAT.
module "sg_lambda" {
  source = "./modules/security_group"

  name        = "${local.name_prefix}-lambda-sg"
  description = "Lambda functions in the VPC"
  vpc_id      = module.vpc.vpc_id

  # Default egress (all outbound) is enough for Secrets Manager + RDS via NAT/VPC endpoints
  tags = local.common_tags
}

# RDS: Postgres only from EC2 and Lambda security groups (not the public internet).
module "sg_rds" {
  source = "./modules/security_group"

  name        = "${local.name_prefix}-rds-sg"
  description = "RDS Postgres — allow from EC2 and Lambda"
  vpc_id      = module.vpc.vpc_id

  ingress_rules = [
    {
      description     = "Postgres from EC2"
      from_port       = 5432
      to_port         = 5432
      protocol        = "tcp"
      security_groups = [module.sg_ec2.id]
    },
    {
      description     = "Postgres from Lambda"
      from_port       = 5432
      to_port         = 5432
      protocol        = "tcp"
      security_groups = [module.sg_lambda.id]
    },
  ]

  tags = local.common_tags
}
