# Inputs for the S3 bucket module.

variable "bucket_name" {
  description = "Globally unique S3 bucket name"
  type        = string
}

variable "force_destroy" {
  description = "Allow Terraform to delete the bucket even if it contains objects"
  type        = bool
  default     = false
}

variable "versioning_enabled" {
  description = "Enable S3 versioning"
  type        = bool
  default     = true
}

variable "tags" {
  description = "Tags applied to the bucket"
  type        = map(string)
  default     = {}
}
