# AWS VPC core concepts

## User query

> List all AWS VPC core concepts

## Notes / answer

Amazon VPC (Virtual Private Cloud) — logically isolated section of AWS where you define IP space, subnets, routing, and gateways.

### Addressing & layout

- **VPC** — Container for your private network in a Region; has a **primary IPv4 CIDR** (optional **secondary** CIDRs, **IPv6**).
- **CIDR block** — IP range for the VPC or subnet (see `02_cidr-blocks-aws.md`).
- **Subnet** — Slice of the VPC CIDR in **one Availability Zone**; public or private by routing/design, not by name alone.
- **Availability Zone (AZ)** — Subnets are AZ-scoped; resilience = resources across multiple subnets/AZs.

### Routing & connectivity edge

- **Route table** — Rules: destination CIDR → target (local, IGW, NAT, peering, TGW, VGW, etc.); subnets associate with route tables.
- **Internet Gateway (IGW)** — Horizontally scaled attachment for **public** IPv4/IPv6 egress/ingress to the internet; one per VPC for public routing patterns.
- **NAT Gateway / NAT instance** — Outbound-only (typical NAT GW pattern) internet for private subnets; no inbound initiated from internet.
- **Egress-only Internet Gateway** — IPv6 outbound-only from VPC.
- **VPC endpoints (Interface / Gateway)** — Private connectivity to **AWS services** (API Gateway, S3 via gateway endpoint, etc.) without traversing public internet.
- **Virtual private gateway / Customer gateway** — **Site-to-site VPN** attachment to VPC.
- **Transit Gateway (TGW)** — Hub to connect many VPCs and on-premises (not “inside” one VPC but central to VPC networking).
- **VPC peering** — Private connectivity between two VPCs (non-transitive); overlapping CIDRs invalid.

### DNS & naming

- **Route 53 Resolver** — DNS resolution in hybrid/VPC contexts.
- **DHCP option sets** — Legacy custom DNS/domain for VPC (many workloads use **Amazon-provided DNS**).
- **VPC attributes** — e.g. **enableDnsHostnames**, **enableDnsSupport** for instance public DNS and resolver behavior.

### Security layers

- **Security group** — Stateful **firewall** for ENIs; allow rules (implicit deny); can reference other SGs.
- **Network ACL (NACL)** — Stateless **subnet**-level allow/deny; optional coarse control vs SGs.
- **Elastic Network Interface (ENI)** — Virtual NIC; **private IP(s)** attach here; SGs bind to ENI.

### Identity of objects on the network

- **Elastic IP (EIP)** — Static public IPv4 associated with an ENI (or NAT GW) in a VPC.
- **Private IP / secondary private IPs** — RFC1918 addressing in VPC CIDR.
- **Public subnet vs private subnet** — Convention: public subnet has route **0.0.0.0/0 → IGW** (and instances get public IPs if designed that way); private does not use IGW for instance traffic (often **0.0.0.0/0 → NAT GW** for outbound only).

### Flow & operations

- **VPC Flow Logs** — IP traffic capture to S3/CloudWatch for audit and troubleshooting.
- **Reachability Analyzer** — Path analysis between source and destination in the network.

### Cross-VPC / extension (often exam-relevant)

- **PrivateLink (interface VPC endpoints)** — Service exposed from another account/VPC via **NLB** + endpoint service.
- **AWS Network Firewall** — Managed firewall VPC appliance traffic filtering.

### Related files in this folder

- `01_vpc-peering-setup.md`, `02_cidr-blocks-aws.md`, `04_vpc-core-concepts-story.md` (same concepts as a narrative)
