# AWS EC2 concepts (overview)

Structured list of EC2-related concepts for certification and operations.

## Core compute
- **Instance** — Virtual server in AWS.
- **Amazon Machine Image (AMI)** — Template: root volume, launch permissions, block device mapping.
- **Instance type** — vCPU, memory, network, storage profile (families: general purpose, compute optimized, memory optimized, storage optimized, accelerated computing, etc.).
- **Launch template / Launch configuration** — Reusable launch parameters (often with Auto Scaling).
- **User data** — Bootstrap at launch (e.g. cloud-init on Linux).
- **Instance Metadata Service (IMDS)** — Metadata for the instance (v1/v2).
- **Placement** — Region, Availability Zone, host/rack implications.

## Instance lifecycle
- **Run / Stop / Start** — Stop often preserves EBS-backed root; billing differs when stopped.
- **Reboot** — Guest OS restart; same underlying host.
- **Terminate** — Ends instance; EBS `DeleteOnTermination` controls root volume.
- **Hibernate** — Memory to disk, faster resume (supported types/OS/config).
- **Instance retirement** — Maintenance events affecting underlying hardware.

## Purchasing & cost
- **On-Demand** — Pay per use, no long-term commitment.
- **Reserved Instances (RI)** — 1–3 year commitment; Standard vs Convertible.
- **Savings Plans** — Commitment to compute spend (e.g. Compute, EC2 Instance).
- **Spot Instances** — Discounted spare capacity; can be interrupted.
- **Spot Fleet / EC2 Fleet** — Manage Spot (and optionally On-Demand) capacity.
- **Dedicated Instances** — Hardware isolation model (per AWS definitions).
- **Dedicated Hosts** — Physical server visibility for licensing/compliance.
- **Capacity Reservations** — Reserve capacity in an AZ without full RI-style attribute lock-in.

## Storage
- **EBS volumes** — Durable network block storage (gp2/gp3, io1/io2, st1, sc1, etc.).
- **EBS snapshots** — Incremental backups; basis for AMIs and restore.
- **Instance store** — Local ephemeral storage; data loss on stop/terminate depending on type.
- **Root volume** — Boot from EBS or instance store (AMI-dependent).

## Networking
- **VPC, subnets, route tables** — Connectivity and isolation.
- **Elastic Network Interface (ENI)** — Virtual NIC; multiple ENIs per instance (limits by type).
- **Private IP / Public IP / Elastic IP (EIP)** — Addressing and static public IPv4.
- **Security groups** — Stateful firewall at ENI level.
- **Network ACLs** — Stateless subnet filters.
- **Source/destination check** — Relevant for NAT/router-style roles.
- **Enhanced networking** — e.g. **ENA** (SR-IOV).
- **Placement groups** — **Cluster**, **Spread**, **Partition** — latency, fault isolation, topology.

## Identity & access
- **IAM roles for EC2** — Temporary credentials via instance profile.
- **Key pairs** — SSH (Linux) / Windows password decrypt; not a substitute for IAM.
- **Session Manager** — Shell access without SSH keys/bastion (with SSM agent + IAM).

## Scaling & resilience
- **Auto Scaling groups** — Desired/min/max across AZs.
- **Elastic Load Balancing** — **ALB**, **NLB**, **GWLB**, **CLB** — distribute to targets.
- **Health checks** — ELB + Auto Scaling; grace periods.

## Monitoring & operations
- **Amazon CloudWatch** — Metrics, alarms, logs agent.
- **Status checks** — System vs instance.
- **Systems Manager** — Patch Manager, Run Command, Parameter Store, Inventory.
- **EC2 Image Builder** — AMI build/test pipelines.

## Migration
- **VM Import/Export** — Bring/export VM images.
- **Application Migration Service (MGN)** — Lift-and-shift replication.

## Platform & compliance
- **Tenancy** — Default vs dedicated (per AWS docs).
- **Nitro System** — Underlying platform for many modern instance families.

## Common exam patterns
- **Bastion host** — Jump box in a public subnet.
- **NAT instance vs NAT Gateway** — Outbound internet from private subnets (Gateway is managed).
