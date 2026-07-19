# EC2 app server: IAM role + instance in a public subnet running a simple web page.

# Role the EC2 instance can assume.
resource "aws_iam_role" "ec2" {
  name = "${local.name_prefix}-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

# Allow the instance to read the assets bucket and fetch DB credentials.
resource "aws_iam_role_policy" "ec2_s3_secrets" {
  name = "${local.name_prefix}-ec2-app-policy"
  role = aws_iam_role.ec2.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "ReadAssetsBucket"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:ListBucket",
        ]
        Resource = [
          module.assets_bucket.arn,
          "${module.assets_bucket.arn}/*",
        ]
      },
      {
        Sid      = "ReadDbSecret"
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = [aws_secretsmanager_secret.db.arn]
      },
    ]
  })
}

# Attach the role to the instance via an instance profile.
resource "aws_iam_instance_profile" "ec2" {
  name = "${local.name_prefix}-ec2-profile"
  role = aws_iam_role.ec2.name
}

# Public web server — installs httpd on first boot via user_data.
resource "aws_instance" "app" {
  ami                    = data.aws_ami.amazon_linux.id
  instance_type          = var.ec2_instance_type
  subnet_id              = module.vpc.public_subnet_ids[0]
  vpc_security_group_ids = [module.sg_ec2.id]
  iam_instance_profile   = aws_iam_instance_profile.ec2.name

  user_data = <<-EOF
    #!/bin/bash
    dnf -y update
    dnf -y install httpd
    systemctl enable --now httpd
    echo "<h1>${local.name_prefix}</h1><p>Managed by Terraform</p>" > /var/www/html/index.html
  EOF

  tags = {
    Name = "${local.name_prefix}-app"
  }
}

# App log group (placeholder for application / agent logs).
resource "aws_cloudwatch_log_group" "app" {
  name              = "/${local.name_prefix}/app"
  retention_in_days = 14
}
