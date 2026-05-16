# Prompt: Terraform Module

```
Create a reusable Terraform module for: {{RESOURCE_TYPE}}

Inputs:
{{LIST_REQUIRED_VARIABLES}}

Outputs:
{{LIST_REQUIRED_OUTPUTS}}

Standards:
- AWS provider ~> 5.x
- Tags: team, service, environment, cost-center from var.tags
- State: remote S3 backend (document in README comment block)
- No hardcoded account IDs or regions
- Enable encryption by default
- Example in examples/complete/ with minimal wiring

Include:
- variables.tf, outputs.tf, main.tf, versions.tf
- Pre-commit hook hints: terraform fmt, tflint, checkov suppressions documented
```
