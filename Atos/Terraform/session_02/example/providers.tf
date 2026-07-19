# Configure the AWS provider for this root module.
provider "aws" {
  region = var.aws_region

  # Apply these tags to every AWS resource created by this provider.
  default_tags {
    tags = local.common_tags
  }
}
