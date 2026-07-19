# Security group module: SG + separate ingress/egress rules (for_each over lists).

resource "aws_security_group" "this" {
  name        = var.name
  description = var.description
  vpc_id      = var.vpc_id

  tags = merge(var.tags, { Name = var.name })
}

# One ingress rule resource per entry in var.ingress_rules.
resource "aws_security_group_rule" "ingress" {
  for_each = {
    for idx, rule in var.ingress_rules : idx => rule
  }

  type                     = "ingress"
  security_group_id        = aws_security_group.this.id
  description              = each.value.description
  from_port                = each.value.from_port
  to_port                  = each.value.to_port
  protocol                 = each.value.protocol
  cidr_blocks              = length(each.value.cidr_blocks) > 0 ? each.value.cidr_blocks : null
  source_security_group_id = length(each.value.security_groups) == 1 ? each.value.security_groups[0] : null
}

# Defaults to "allow all outbound" unless the caller overrides egress_rules.
resource "aws_security_group_rule" "egress" {
  for_each = {
    for idx, rule in var.egress_rules : idx => rule
  }

  type                     = "egress"
  security_group_id        = aws_security_group.this.id
  description              = each.value.description
  from_port                = each.value.from_port
  to_port                  = each.value.to_port
  protocol                 = each.value.protocol
  cidr_blocks              = length(each.value.cidr_blocks) > 0 ? each.value.cidr_blocks : null
  source_security_group_id = length(each.value.security_groups) == 1 ? each.value.security_groups[0] : null
}
