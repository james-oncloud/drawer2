# Values exported after apply — useful for scripts, CI, or other stacks.

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = module.vpc.private_subnet_ids
}

output "ec2_instance_id" {
  description = "App EC2 instance ID"
  value       = aws_instance.app.id
}

output "ec2_public_ip" {
  description = "App EC2 public IP"
  value       = aws_instance.app.public_ip
}

output "assets_bucket_name" {
  description = "Assets S3 bucket name"
  value       = module.assets_bucket.id
}

output "logs_bucket_name" {
  description = "Logs S3 bucket name"
  value       = module.logs_bucket.id
}

output "rds_endpoint" {
  description = "RDS Postgres endpoint"
  value       = aws_db_instance.app.address
}

output "db_secret_arn" {
  description = "Secrets Manager ARN for DB credentials"
  value       = aws_secretsmanager_secret.db.arn
}

output "lambda_function_name" {
  description = "Lambda function name"
  value       = aws_lambda_function.api.function_name
}

output "lambda_function_arn" {
  description = "Lambda function ARN"
  value       = aws_lambda_function.api.arn
}
