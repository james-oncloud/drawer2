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

## Working out the number of addresses (IPv4)

An IPv4 address is **32 bits**. The prefix **`/n`** fixes the first **`n`** bits for the **network**; the remaining bits identify **hosts** inside that block.

**Step 1 — Count host bits**

`host bits = 32 − n`

**Step 2 — Count IP addresses in the block**

Each host bit can be 0 or 1, so the number of distinct addresses is **`2` raised to the power of the host bits**:

`addresses in block = 2^(32 − n)`

(You may see the same thing written as **2^host bits**.)

**Worked examples**

| Prefix | Host bits `(32 − n)` | Calculation | Addresses in block |
|--------|----------------------|-------------|-------------------|
| `/32` | 0 | 2^0 | 1 |
| `/28` | 4 | 2^4 | 16 |
| `/24` | 8 | 2^8 | 256 |
| `/20` | 12 | 2^12 | 4,096 |
| `/16` | 16 | 2^16 | 65,536 |

Sanity check: **`/24`** leaves **8** host bits (one full octet varies), so **2^8 = 256**—in **`10.0.0.0/24`**, the last octet runs **0–255**.

**“Usable hosts” vs total**

- In **classic IPv4** teaching, some subtract **2** from the block size (**network** and **broadcast** addresses). That matches old LAN rules; it is **not** the whole story on AWS.
- In **AWS subnets**, start from **`2^(32 − n)`** for the subnet’s **total** addresses, then account for **[reserved addresses](https://docs.aws.amazon.com/vpc/latest/userguide/subnet-cidr-reservation.html)** (see below). For a typical IPv4 subnet, AWS reserves **five** addresses in that range, so a rough capacity estimate is **`2^(32 − n) − 5` assignable private IPs**—check the official table for your case (including small subnets and special prefixes).

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

In each **subnet**, AWS reserves some IPs; **do not** assign these to your own static use. After you compute **`2^(32 − n)`** (see above), subtract what AWS holds back. The exact rules are documented in [Subnet CIDR reservations](https://docs.aws.amazon.com/vpc/latest/userguide/subnet-cidr-reservation.html); in practice:

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
