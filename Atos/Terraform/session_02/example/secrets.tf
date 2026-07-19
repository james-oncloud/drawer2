# DB credentials: generate a password, create a Secrets Manager secret, store JSON values.

# Generate a strong DB password that Terraform can feed into Secrets Manager + RDS.
resource "random_password" "db" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# Create the Secrets Manager *container* (metadata/name only — no value yet).
resource "aws_secretsmanager_secret" "db" {
  name                    = "${local.name_prefix}/db/credentials"
  description             = "RDS master credentials for ${local.name_prefix}"
  recovery_window_in_days = 0 # immediate delete — fine for labs; use 7–30 in prod
}

# Store the actual secret *value* (JSON credentials) in that container.
# secret_id links this version to the secret above (also creates the dependency).
resource "aws_secretsmanager_secret_version" "db" {
  secret_id = aws_secretsmanager_secret.db.id
  secret_string = jsonencode({
    username = var.db_username
    password = random_password.db.result
    engine   = "postgres"
    host     = aws_db_instance.app.address # wait for RDS, then store its endpoint
    port     = aws_db_instance.app.port
    dbname   = var.db_name
  })
}
