# Setting up a VPC Peering Connection in AWS

A **VPC peering connection** links two VPCs so resources in each can communicate using **private IP addresses**, as if they were on the same network. Traffic stays on the AWS network and does not traverse the public internet (subject to routing and security rules you configure).

## Before you start

1. **Non-overlapping CIDR blocks** — The peered VPCs must not use overlapping IPv4 CIDR ranges. If they overlap, peering is not supported (see examples below).
2. **Same account or cross-account** — You can peer VPCs in the same AWS account or in different accounts (the accepter must accept the request).
3. **Same Region vs cross-Region** — Peering works within a Region and between Regions (**inter-Region VPC peering**). Cross-Region peering has its own quotas and pricing; latency and data transfer charges apply across Region boundaries.
4. **Peering is not transitive** — If VPC A peers with B and B peers with C, **A cannot reach C** through B unless you add separate peering or another connectivity pattern (e.g. Transit Gateway).

### CIDR examples: non-overlapping vs overlapping

Two CIDR blocks **overlap** if some IP address could belong to **both** ranges. AWS VPC peering requires **no overlap**: each private IP in one VPC must be unambiguously outside the other VPC’s CIDR.

**Non-overlapping (OK to peer)** — Ranges are disjoint:

| VPC | IPv4 CIDR | Comment |
|-----|-----------|---------|
| Production | `10.0.0.0/16` | Covers `10.0.0.0`–`10.0.255.255` |
| Staging | `10.1.0.0/16` | Covers `10.1.0.0`–`10.1.255.255` — no addresses in common with production |

| VPC | IPv4 CIDR | Comment |
|-----|-----------|---------|
| App | `10.0.0.0/16` | RFC 1918 `10/8` space |
| Data | `172.31.0.0/16` | Different major private range — still non-overlapping |

| VPC | IPv4 CIDR | Comment |
|-----|-----------|---------|
| VPC East | `10.0.0.0/25` | `10.0.0.0`–`10.0.0.127` |
| VPC West | `10.0.0.128/25` | `10.0.0.128`–`10.0.0.255` — **no** IPs in common with East (contrast with overlapping row below) |

**Overlapping (cannot peer)** — One range sits inside the other, or they share a slice of address space:

| VPC A | VPC B | Why it fails |
|-------|--------|----------------|
| `10.0.0.0/16` | `10.0.0.0/24` | The `/24` is **inside** the `/16`; those addresses exist in both definitions |
| `10.0.0.0/16` | `10.0.0.0/16` | **Identical** ranges |
| `10.0.0.0/24` | `10.0.0.128/25` | `10.0.0.128/25` is `10.0.0.128`–`10.0.0.255`, which lies **inside** `10.0.0.0/24` (`10.0.0.0`–`10.0.0.255`) |
| `10.0.0.0/26` | `10.0.0.32/27` | The `/27` (`10.0.0.32`–`10.0.0.63`) lies **inside** the `/26` (`10.0.0.0`–`10.0.0.63`), so many IPs are ambiguous |

The same **numeric “half / full” idea** trips people up: `10.0.0.0/24` **overlaps** with `10.0.0.128/25` (the `/25` is *inside* the `/24`), but **two** `/25` halves of that `/24` do **not** overlap each other (see East/West table above).

## Console: create and accept a peering connection

### 1. Create the peering request

1. Open the [VPC console](https://console.aws.amazon.com/vpc/).
2. In the left menu, choose **Peering connections** → **Create peering connection**.
3. **Name** — Optional tag for identification.
4. **Select local VPC** — Choose the requester VPC (this is *your* VPC when you initiate the request).
5. **Select another VPC to peer with**:
   - **My account** — Choose the accepter VPC in the same account.
   - **Another account** — Enter the account ID and the VPC ID (or use a resource share, if applicable).
6. For cross-Region peering, select the **Region** of the other VPC.
7. Choose **Create peering connection**.

The connection starts in **pending-acceptance** until the owning side accepts it (same-account requests in your account may auto-accept depending on how you configure; often you still accept explicitly for clarity).

### 2. Accept the peering connection (if required)

1. Sign in to the **accepter** account (if different from the requester).
2. **VPC** → **Peering connections** → select the **pending** connection → **Actions** → **Accept request**.

After acceptance, status should show **active**.

## Route tables: traffic will not flow without routes

Peering only provides **logical connectivity**. You must add routes so subnets know to send peer CIDR traffic through the peering connection.

1. **VPC** → **Route tables** — edit the route tables associated with subnets that should reach the peer VPC.
2. **Edit routes** → **Add route**:
   - **Destination**: the **CIDR block of the peer VPC** (or a more specific prefix if you only want part of it).
   - **Target**: **pcx-xxxxxxxx** (your peering connection ID).
3. Repeat on **both sides**: the requester VPC route tables need routes to the accepter CIDR, and the accepter needs routes back to the requester CIDR.

Without symmetric routes, return traffic can fail even when one direction is configured.

## Security: security groups and network ACLs

- **Security groups** — By default, instances only allow traffic defined in their security group rules. Add inbound/outbound rules that reference **the peer VPC CIDR** or peer security groups where supported (same-Region same-account peering allows referencing peer SGs in many setups; verify current regional/feature support in the [VPC documentation](https://docs.aws.amazon.com/vpc/latest/peering/)).
- **Network ACLs** — If NACLs are restrictive, allow the peer CIDR on the subnets involved.

DNS and application firewalls must also permit the traffic you need.

## DNS resolution (optional but common)

To resolve **private DNS hostnames** of instances in the peer VPC to **private IP addresses**, enable **DNS resolution** for the peering connection (requester and/or accepter settings in the peering connection details), depending on which direction needs to resolve the other VPC’s private hosted zones / EC2 DNS names. Requirements differ slightly for **same-Region** vs **cross-Region** peering; use the console’s peering options and the official “DNS” section in the VPC Peering guide for your scenario.

## Verify connectivity

1. Launch or use an instance in each VPC on subnets whose route tables include the peering routes.
2. From one instance, **ping** or **curl** the **private IP** of a resource in the peer VPC (after opening security groups/NACLs).
3. Use **VPC Reachability Analyzer** (Network Manager) if you need a guided check of path and blocking rules.

## Quick reference checklist

| Step | Action |
|------|--------|
| 1 | Confirm CIDR ranges do not overlap |
| 2 | Create peering connection; accept if pending |
| 3 | Add routes in **both** VPCs (peer CIDR → `pcx-...`) |
| 4 | Open security groups / NACLs for required ports and peer CIDR |
| 5 | Enable DNS options on the peering connection if private hostname resolution is required |
| 6 | Test with private IPs |

## Further reading

- [VPC Peering](https://docs.aws.amazon.com/vpc/latest/peering/) — AWS documentation (concepts, limitations, and walkthroughs).

For repeatable infrastructure, you can define peering with **AWS CloudFormation**, **Terraform**, or the **AWS CLI** (`create-vpc-peering-connection`, `accept-vpc-peering-connection`, and route table APIs); the same logical steps (create/accept, routes, security) apply.
