###############################################
# showcase.tf
#
# A single-file Terraform showcase.
#
# Goal:
# - Demonstrate the main Terraform syntax and concepts
# - Keep the file readable
# - Use comments to explain what each section does
#
# Notes:
# - Some examples are "practical runnable examples"
# - Some are "commented reference examples" because a single file
#   cannot realistically execute every Terraform concept at once
# - Provider-specific nested block examples (for dynamic blocks, etc.)
#   are shown in comments where needed
###############################################

###############################################
# TERRAFORM BLOCK
#
# Configures Terraform itself:
# - required Terraform version
# - required providers
# - backend (commented example)
###############################################
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    local = {
      source  = "hashicorp/local"
      version = "~> 2.5"
    }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.6"
    }

    null = {
      source  = "hashicorp/null"
      version = "~> 3.2"
    }

    http = {
      source  = "hashicorp/http"
      version = "~> 3.4"
    }
  }

  # Backend example:
  # A backend stores Terraform state remotely.
  # Only ONE backend block is allowed in a root module.
  #
  # backend "s3" {
  #   bucket         = "my-terraform-state-bucket"
  #   key            = "demo/showcase.tfstate"
  #   region         = "eu-west-2"
  #   dynamodb_table = "terraform-locks"
  #   encrypt        = true
  # }
}

###############################################
# PROVIDER BLOCKS
#
# Providers connect Terraform to external systems.
# Some providers need config; others do not.
###############################################
provider "local" {
  # local provider usually does not need configuration
}

provider "random" {
  # random provider usually does not need configuration
}

provider "null" {
  # null provider usually does not need configuration
}

provider "http" {
  # http provider usually does not need configuration
}

# Provider alias example:
# Useful when you need multiple differently configured provider instances.
provider "local" {
  alias = "secondary"
}

###############################################
# VARIABLES
#
# Input variables make configurations reusable.
# Showcases:
# - type constraints
# - default values
# - nullable
# - sensitive
# - validation
###############################################
variable "project_name" {
  description = "Project name used in generated file names and outputs"
  type        = string
  default     = "terraform-showcase"

  validation {
    condition     = length(var.project_name) >= 3
    error_message = "project_name must be at least 3 characters long."
  }
}

variable "environment" {
  description = "Deployment environment"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "test", "uat", "prod"], var.environment)
    error_message = "environment must be one of: dev, test, uat, prod."
  }
}

variable "enabled" {
  description = "Toggle creation of optional resources"
  type        = bool
  default     = true
}

variable "owners" {
  description = "Set of owners"
  type        = set(string)
  default     = ["alice", "bob"]
}

variable "settings" {
  description = "Example complex object variable"
  type = object({
    retries       = number
    enable_feature = bool
    tags          = map(string)
  })

  default = {
    retries        = 3
    enable_feature = true
    tags = {
      team  = "platform"
      stack = "terraform"
    }
  }
}

variable "optional_note" {
  description = "Optional nullable value"
  type        = string
  default     = null
  nullable    = true
}

variable "secret_token" {
  description = "Sensitive value example"
  type        = string
  default     = "change-me"
  sensitive   = true
}

###############################################
# LOCALS
#
# Locals help compute reusable values.
# Showcases:
# - string interpolation
# - conditional expressions
# - for expressions
# - merge
# - try / can
# - formatting
###############################################
locals {
  # Basic string interpolation
  prefix = "${var.project_name}-${var.environment}"

  # Conditional expression
  feature_status = var.settings.enable_feature ? "enabled" : "disabled"

  # Merge maps
  common_tags = merge(
    var.settings.tags,
    {
      environment = var.environment
      project     = var.project_name
      managed_by  = "terraform"
    }
  )

  # Convert a set into a stable sorted list
  owners_sorted = sort(tolist(var.owners))

  # for expression -> transform list
  owner_emails = [for owner in local.owners_sorted : "${owner}@example.com"]

  # for expression -> build map
  owner_index = {
    for idx, owner in local.owners_sorted :
    owner => idx
  }

  # try() lets you safely fall back
  note = try(var.optional_note, "no-note-provided")

  # can() checks whether an expression can be evaluated safely
  note_is_set = can(length(var.optional_note)) && var.optional_note != null

  # heredoc string
  long_text = <<-EOT
    This text was generated by Terraform.
    Project      : ${var.project_name}
    Environment  : ${var.environment}
    Feature flag : ${local.feature_status}
  EOT

  # Build a structured object for encoding later
  manifest = {
    metadata = {
      name        = local.prefix
      owners      = local.owners_sorted
      owner_index = local.owner_index
    }
    spec = {
      retries        = var.settings.retries
      feature_status = local.feature_status
      tags           = local.common_tags
      note           = local.note
    }
  }

  # jsonencode example
  manifest_json = jsonencode(local.manifest)

  # yamlencode example
  manifest_yaml = yamlencode(local.manifest)

  # Regex and replace examples
  sanitized_prefix = replace(lower(local.prefix), "/[^a-z0-9-]/", "-")

  # Numeric expression example
  doubled_retries = var.settings.retries * 2

  # Distinct / compact example
  sample_values = compact(["a", "", "b", null, "b"])
  distinct_vals = distinct(local.sample_values)
}

###############################################
# DATA SOURCES
#
# Data sources read information.
# This one fetches a public HTTP endpoint.
###############################################
data "http" "example" {
  url = "https://example.com"
}

###############################################
# RANDOM RESOURCE
#
# Creates a reusable random suffix.
###############################################
resource "random_pet" "suffix" {
  length = 2

  keepers = {
    # If any keeper changes, Terraform will replace the resource
    environment = var.environment
  }
}

###############################################
# NULL RESOURCE
#
# Historically used for side effects / commands.
# Still useful as a teaching example.
#
# Showcases:
# - count
# - triggers
# - provisioner
# - depends_on
###############################################
resource "null_resource" "setup" {
  count = var.enabled ? 1 : 0

  triggers = {
    prefix         = local.prefix
    random_suffix  = random_pet.suffix.id
    feature_status = local.feature_status
  }

  provisioner "local-exec" {
    command = "echo 'Preparing ${self.triggers.prefix}-${self.triggers.random_suffix}'"
  }

  depends_on = [
    random_pet.suffix
  ]
}

###############################################
# LOCAL FILE RESOURCES
#
# Showcases:
# - resource block
# - arguments
# - references
# - provider alias
# - lifecycle
# - precondition / postcondition
###############################################
resource "local_file" "readme" {
  content  = <<-EOT
    Terraform Showcase
    ==================

    Prefix             : ${local.prefix}
    Sanitized Prefix   : ${local.sanitized_prefix}
    Random Suffix      : ${random_pet.suffix.id}
    Feature Status     : ${local.feature_status}
    Owners             : ${join(", ", local.owners_sorted)}
    Owner Emails       : ${join(", ", local.owner_emails)}
    HTTP Status        : ${data.http.example.status_code}
    Optional Note Set? : ${local.note_is_set}
  EOT

  filename = "${path.module}/generated-${local.sanitized_prefix}.txt"

  lifecycle {
    # Prevent accidental deletion of this file
    prevent_destroy = false

    # Ignore content changes from outside Terraform if desired
    ignore_changes = [
      # content
    ]

    precondition {
      condition     = data.http.example.status_code == 200
      error_message = "Expected example.com to return HTTP 200."
    }

    postcondition {
      condition     = length(self.content) > 20
      error_message = "Generated file content was unexpectedly short."
    }
  }

  depends_on = [
    null_resource.setup
  ]
}

resource "local_file" "json_manifest" {
  provider = local.secondary

  content  = local.manifest_json
  filename = "${path.module}/manifest-${local.sanitized_prefix}.json"
}

resource "local_file" "yaml_manifest" {
  content  = local.manifest_yaml
  filename = "${path.module}/manifest-${local.sanitized_prefix}.yaml"
}

###############################################
# FOR_EACH EXAMPLE
#
# Creates one file per owner.
###############################################
resource "local_file" "owner_files" {
  for_each = {
    for owner in local.owners_sorted :
    owner => {
      email = "${owner}@example.com"
      index = local.owner_index[owner]
    }
  }

  filename = "${path.module}/owner-${each.key}.txt"
  content  = <<-EOT
    Owner file
    ----------
    Name  : ${each.key}
    Email : ${each.value.email}
    Index : ${each.value.index}
  EOT
}

###############################################
# TERRAFORM_DATA RESOURCE
#
# Built-in helper resource for plain values / replacement triggers.
# Useful in modern Terraform to model dependencies and derived values.
###############################################
resource "terraform_data" "derived" {
  input = {
    prefix         = local.prefix
    random_suffix  = random_pet.suffix.id
    owners         = local.owners_sorted
    retries        = var.settings.retries
    doubledRetries = local.doubled_retries
  }

  triggers_replace = [
    random_pet.suffix.id,
    var.environment
  ]
}

###############################################
# CHECK BLOCK
#
# Validates assumptions at plan/apply time.
###############################################
check "owner_count_check" {
  assert {
    condition     = length(local.owners_sorted) > 0
    error_message = "At least one owner must be defined."
  }

  assert {
    condition     = var.settings.retries >= 0
    error_message = "Retries must be zero or greater."
  }
}

###############################################
# OUTPUTS
#
# Showcases:
# - plain output
# - sensitive output
# - structured output
###############################################
output "summary" {
  description = "Human-friendly summary"
  value = {
    project        = var.project_name
    environment    = var.environment
    prefix         = local.prefix
    sanitized      = local.sanitized_prefix
    random_suffix  = random_pet.suffix.id
    feature_status = local.feature_status
    generated_file = local_file.readme.filename
  }
}

output "owner_emails" {
  description = "Derived owner email addresses"
  value       = local.owner_emails
}

output "secret_token_echo" {
  description = "Sensitive output example"
  value       = var.secret_token
  sensitive   = true
}

###############################################
# COMMENTED REFERENCE EXAMPLES
#
# These are included to showcase additional Terraform syntax and concepts
# that do not fit cleanly into a single runnable file.
###############################################

###############################################
# MODULE BLOCK
#
# Reuse another Terraform module.
###############################################
# module "network" {
#   source = "./modules/network"
#
#   project_name = var.project_name
#   environment  = var.environment
# }

###############################################
# IMPORT BLOCK
#
# Declarative import of existing infrastructure into state.
# Requires a matching resource block and a real external object.
###############################################
# import {
#   to = aws_s3_bucket.example
#   id = "my-existing-bucket"
# }

###############################################
# MOVED BLOCK
#
# Used when refactoring resource addresses so Terraform moves state
# instead of destroying/recreating objects.
###############################################
# moved {
#   from = null_resource.old_name
#   to   = null_resource.setup
# }

###############################################
# REMOVED BLOCK
#
# Used when removing an object from Terraform state management in a
# controlled way.
###############################################
# removed {
#   from = aws_instance.legacy
#   lifecycle {
#     destroy = false
#   }
# }

###############################################
# DYNAMIC BLOCK EXAMPLE
#
# dynamic blocks generate repeated nested blocks.
# They only make sense on resource types that actually support nested
# blocks of that name.
#
# Example shape only:
###############################################
# resource "some_provider_resource" "example" {
#   name = "demo"
#
#   dynamic "rule" {
#     for_each = var.rules
#     iterator = rule_item
#
#     content {
#       name   = rule_item.value.name
#       action = rule_item.value.action
#     }
#   }
# }

###############################################
# COUNT VS FOR_EACH
#
# count:
# - best for "N copies" indexed numerically
#
# for_each:
# - best for maps/sets where stable keys matter
###############################################

###############################################
# DEPENDS_ON
#
# Explicit dependency when Terraform cannot infer it automatically.
###############################################

###############################################
# LIFECYCLE META-ARGUMENTS
#
# Common lifecycle options:
# - create_before_destroy
# - prevent_destroy
# - ignore_changes
# - replace_triggered_by
###############################################
# resource "some_resource" "example" {
#   name = "demo"
#
#   lifecycle {
#     create_before_destroy = true
#     prevent_destroy       = false
#     ignore_changes        = [tags]
#     replace_triggered_by  = [terraform_data.derived]
#   }
# }

###############################################
# FUNCTIONS YOU SHOULD KNOW
#
# String:
# - lower, upper, trimspace, replace, format, join, split
#
# Collections:
# - length, contains, keys, values, merge, zipmap, flatten, distinct
#
# Safety:
# - try, can, coalesce, lookup
#
# Encoding:
# - jsonencode, jsondecode, yamlencode, yamldecode
#
# Files/Templates:
# - file, templatefile
#
# Numeric:
# - min, max, floor, ceil
###############################################

###############################################
# EXPRESSIONS YOU SHOULD KNOW
#
# - references: var.x, local.x, resource.type.name.attr
# - conditional: condition ? true_val : false_val
# - for expressions
# - splat expressions
# - indexing: list[0], map["key"]
###############################################

###############################################
# FILE/TEMPLATE EXAMPLE
#
# This requires an external template file, so it is shown as reference:
###############################################
# locals {
#   rendered = templatefile("${path.module}/templates/app.tftpl", {
#     project = var.project_name
#     env     = var.environment
#   })
# }

###############################################
# PATH VALUES
#
# Useful built-ins:
# - path.module
# - path.root
# - path.cwd
###############################################

###############################################
# WORKSPACES
#
# Access current workspace with:
# terraform.workspace
###############################################
# locals {
#   workspace_name = terraform.workspace
# }

###############################################
# TERRAFORM CONSOLE
#
# Useful command:
# terraform console
#
# Lets you evaluate expressions interactively.
###############################################

###############################################
# TYPICAL COMMANDS
#
# terraform init
# terraform fmt
# terraform validate
# terraform plan
# terraform apply
# terraform destroy
###############################################