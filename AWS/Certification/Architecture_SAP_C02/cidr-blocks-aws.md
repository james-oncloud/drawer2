# CIDR blocks in AWS

**CIDR** (Classless Inter-Domain Routing) is how you write an **IPv4 network**: a **starting address** plus a **prefix length** that defines how many bits are fixed for the network portion. In AWS, **VPCs** and **subnets** are created from CIDR blocks; routes, security groups, and connectivity rules all reason about those ranges.

## Notation: `x.x.x.x/n`

- **`10.0.0.0/16`** — The `/16` means the **first 16 bits** identify the network; the rest can be used for hosts inside that block.
- Larger **`n`** → **smaller** network (fewer host addresses). Smaller **`n`** → **larger** network.

| Prefix | Addresses in block* | Typical use in AWS |
|--------|--------------------|--------------------|
| `/16` | 65,536 | One VPC (common default size) |
| `/20` | 4,096 | Medium VPC or large subnet layout |
| `/24` | 256 | Common **subnet** size |
| `/28` | 16 | Small subnet (very few usable IPs after AWS reservations) |

\*Total IPv4 addresses in the CIDR math sense; **usable for EC2 ENIs** in a subnet is lower because AWS reserves addresses (see below).

## Quick intuition

- **`10.0.0.0/24`** is all addresses from **`10.0.0.0`** through **`10.0.0.255`** (256 addresses).
- **`10.0.0.0/25`** is **`10.0.0.0`–`10.0.0.127`** (128 addresses).
- **`10.0.0.128/25`** is **`10.0.0.128`–`10.0.0.255`** (the other half of that `/24`).

Two blocks **overlap** if at least one IP could belong to both—problematic when peering VPCs or merging networks. Blocks are **disjoint** if they share no IPs—safe for separate VPCs you want to connect later.

## Private IPv4 ranges (RFC 1918)

For **private** addressing inside a VPC, these ranges are standard:

| Range | CIDR | Notes |
|-------|------|--------|
| 10.0.0.0 – 10.255.255.255 | `10.0.0.0/8` | Very large; often carved into `/16` VPCs like `10.0.0.0/16`, `10.1.0.0/16` |
| 172.16.0.0 – 172.31.255.255 | `172.16.0.0/12` | Includes **`172.31.0.0/16`**, the **default VPC** CIDR in many accounts |
| 192.168.0.0 – 192.168.255.255 | `192.168.0.0/16` | Common in home/lab networks; watch overlap with on‑prem if extending hybrid networks |

**Public** IPv4 addresses on instances (e.g. Elastic IPs) are separate from the **VPC CIDR**—they are assigned in addition to private addressing when you use internet-facing setups.

## VPC CIDR vs subnet CIDR

- **VPC CIDR** — The overall address space for the VPC. You can attach **secondary CIDR blocks** to grow or segment addressing.
- **Subnet CIDR** — A **non-overlapping** slice **inside** the VPC CIDR (each subnet lives in one Availability Zone).

Every resource with a private IP (e.g. an ENI) gets an address from **some subnet’s** CIDR. Route tables send traffic **to** a CIDR (local, peering, transit gateway, internet gateway, etc.).

## AWS reservations in a subnet

In each **subnet**, AWS reserves some IPs; **do not** assign these to your own static use. The exact rules are documented in [Subnet CIDR reservations](https://docs.aws.amazon.com/vpc/latest/userguide/subnet-cidr-reservation.html); in practice:

- The **network** address, **VPC router**, **DNS**, **future use**, and **broadcast** (for IPv4) concepts mean a **`/24` does not give you 256 assignable endpoints**—plan capacity with margin, especially on small prefix sizes like `/28` or `/27`.

## Choosing sizes on AWS

- Prefer **`/16` per VPC** (or deliberate smaller designs) and **`/24` subnets** as a common starting pattern; adjust for ENI density, Lambda in VPC, containers, and future growth.
- **`/28` and smaller** subnets run out of **usable** IPs quickly; validate against service requirements.
- When connecting VPCs (peering, Transit Gateway, VPN, Direct Connect), **ensure CIDRs do not overlap** on the paths that must route uniquely.

## IPv6

AWS VPCs can also use **IPv6 CIDRs** (often `/56` from Amazon’s GUA space). IPv6 addressing follows different consumption and reservation patterns; see [IPv6 in Amazon VPC](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-migrate-ipv6.html) when you need dual-stack or IPv6-only designs.

## Further reading

- [VPC and subnet sizing](https://docs.aws.amazon.com/vpc/latest/userguide/vpc-cidr-blocks.html) — official AWS documentation for VPC CIDR constraints and sizing.
- [RFC 1918](https://www.rfc-editor.org/rfc/rfc1918) — private address allocation.
