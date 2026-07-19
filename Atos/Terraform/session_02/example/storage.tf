# S3 buckets via the reusable s3_bucket module.

# App assets (versioned). force_destroy eases lab teardown.
module "assets_bucket" {
  source = "./modules/s3_bucket"

  bucket_name        = local.assets_bucket_name
  force_destroy      = true # convenient for lab/demo teardown
  versioning_enabled = true
  tags               = local.common_tags
}

# Separate bucket for logs (no versioning needed for this demo).
module "logs_bucket" {
  source = "./modules/s3_bucket"

  bucket_name        = local.logs_bucket_name
  force_destroy      = true
  versioning_enabled = false
  tags               = local.common_tags
}
