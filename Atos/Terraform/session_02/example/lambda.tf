# Lambda API in the VPC: zip the handler, grant IAM, attach to private subnets.

# Package handler.py into a zip that Lambda can upload.
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_file = "${path.module}/lambda/handler.py"
  output_path = "${path.module}/lambda/handler.zip"
}

# Role Lambda assumes at runtime.
resource "aws_iam_role" "lambda" {
  name = "${local.name_prefix}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

# Write logs to CloudWatch.
resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Create ENIs so the function can run inside the VPC.
resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

# App permissions: read DB secret + list/get from the assets bucket.
resource "aws_iam_role_policy" "lambda_app" {
  name = "${local.name_prefix}-lambda-app-policy"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid      = "ReadDbSecret"
        Effect   = "Allow"
        Action   = ["secretsmanager:GetSecretValue"]
        Resource = [aws_secretsmanager_secret.db.arn]
      },
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
    ]
  })
}

# Function runs in private subnets; env vars point at S3 + Secrets Manager.
resource "aws_lambda_function" "api" {
  function_name = "${local.name_prefix}-api"
  role          = aws_iam_role.lambda.arn
  handler       = "handler.handler"
  runtime       = "python3.12"
  timeout       = 10
  memory_size   = 128

  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  vpc_config {
    subnet_ids         = module.vpc.private_subnet_ids
    security_group_ids = [module.sg_lambda.id]
  }

  environment {
    variables = {
      ASSETS_BUCKET = module.assets_bucket.id
      DB_SECRET_ARN = aws_secretsmanager_secret.db.arn
    }
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_iam_role_policy_attachment.lambda_vpc,
    aws_cloudwatch_log_group.lambda,
  ]
}

# Log group for this function (created before the function via depends_on).
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${local.name_prefix}-api"
  retention_in_days = 14
}
