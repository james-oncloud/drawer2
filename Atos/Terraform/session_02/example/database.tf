# RDS Postgres in private subnets — not publicly reachable.

# RDS must span at least two subnets (usually across AZs).
resource "aws_db_subnet_group" "app" {
  name       = "${local.name_prefix}-db-subnets"
  subnet_ids = module.vpc.private_subnet_ids

  tags = {
    Name = "${local.name_prefix}-db-subnets"
  }
}

# Managed Postgres; password comes from random_password in secrets.tf.
resource "aws_db_instance" "app" {
  identifier = "${local.name_prefix}-postgres"

  engine                = "postgres"
  engine_version        = "16"
  instance_class        = var.db_instance_class
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.db_username
  password = random_password.db.result

  db_subnet_group_name   = aws_db_subnet_group.app.name
  vpc_security_group_ids = [module.sg_rds.id]
  publicly_accessible    = false
  multi_az               = false

  backup_retention_period = 7
  skip_final_snapshot     = true # lab-friendly; prefer a final snapshot in prod
  deletion_protection     = false

  tags = {
    Name = "${local.name_prefix}-postgres"
  }
}
