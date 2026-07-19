# Values callers use after creating the VPC (subnet IDs, NAT id, etc.).

output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.this.id
}

output "cidr_block" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.this.cidr_block
}

output "public_subnet_ids" {
  description = "IDs of public subnets"
  value       = [for s in aws_subnet.public : s.id]
}

output "private_subnet_ids" {
  description = "IDs of private subnets"
  value       = [for s in aws_subnet.private : s.id]
}

output "nat_gateway_id" {
  description = "ID of the NAT gateway (null if disabled)"
  value       = try(aws_nat_gateway.this[0].id, null)
}
