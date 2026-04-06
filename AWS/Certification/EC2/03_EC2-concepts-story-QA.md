# Questions and model answers — `02_EC2-concepts-story.md`

Study questions aligned to each section of the story. Answers are concise “model” responses for certification-style recall.

---

## §1 — The city and the plot of land (Region, AZ, VPC, subnets, routing)

**Q1.** In the story, why do you pick a Region first?  
**A.** Regions place workloads close to users, meet data residency/compliance, and determine which services and pricing apply. Workloads are usually designed with regional boundaries in mind.

**Q2.** What role do Availability Zones play, and why does the story warn against a single AZ?  
**A.** AZs are physically separate locations within a Region. Using multiple AZs avoids a single data-center failure taking down the whole application; it is a core resilience pattern.

**Q3.** What is a VPC in this narrative?  
**A.** Your private, isolated network in AWS where you define IP ranges, subnets, and routing — the “plot of land” before any EC2 instance is launched.

**Q4.** Why are subnets split into public vs private?  
**A.** Public subnets expose resources that must reach or be reached from the internet (e.g. load balancers); private subnets hide application and data tiers and force outbound traffic through controlled paths (e.g. NAT).

**Q5.** What do route tables decide?  
**A.** Where packets go: local VPC traffic, to an internet gateway, to a NAT gateway/instance, to VPC endpoints, peering, Transit Gateway, etc.

**Q6.** The story says you sketch “placement” before a server exists — what does that mean?  
**A.** You decide Region, VPC layout, subnet design, and routing so that when instances launch, they land in the right network and failure/isolation context.

---

## §2 — The blueprint: AMI and instance type

**Q7.** What is an AMI?  
**A.** A template for launching an instance: root volume layout, block device mapping, and permissions. It is the “golden image” or recipe.

**Q8.** What does the AMI define about the root volume?  
**A.** What the boot disk contains (OS and layout) and how volumes attach; the instance boots from the root volume defined by the AMI (EBS or instance-store backed per AMI type).

**Q9.** What does “instance type” control?  
**A.** vCPU, memory, network performance, and family traits (e.g. compute-optimized, memory-optimized, accelerated, storage-optimized).

**Q10.** When would you choose accelerated computing or storage-optimized families?  
**A.** Accelerated: GPUs/FPGAs for ML, graphics, HPC. Storage-optimized: high sequential I/O for data warehouses, NoSQL, analytics workloads.

---

## §3 — Launch: user data, IMDS, Nitro

**Q11.** What is user data used for at launch?  
**A.** Bootstrap scripts (e.g. cloud-init): install packages, configure agents, join directories, fetch config — first-day automation.

**Q12.** What problem does IMDS solve?  
**A.** Lets code discover instance metadata (instance id, AZ, instance type, etc.) at runtime without hardcoding, so the same image behaves correctly everywhere.

**Q13.** What is IMDSv2 and why is it emphasized in practice?  
**A.** Session-oriented metadata access that reduces SSRF-style abuse; prefer v2 over v1 where supported.

**Q14.** What is the Nitro System in one sentence?  
**A.** AWS’s modern hypervisor/network/storage stack that offloads more to dedicated hardware, improving performance, security, and feature set for many instance types.

---

## §4 — Paying for the show (purchase models)

**Q15.** What characterizes On-Demand?  
**A.** No commitment; pay for capacity while it runs; highest flexibility, typically highest steady-state cost vs commitments.

**Q16.** What do Reserved Instances and Savings Plans trade for lower cost?  
**A.** A commitment (term and spend or instance attributes) in exchange for discounted rates compared to On-Demand.

**Q17.** How do Spot Instances differ from On-Demand?  
**A.** You bid/use spare capacity at steep discounts; AWS can reclaim capacity with a short notice — workloads must tolerate interruption.

**Q18.** What is Spot Fleet / EC2 Fleet for?  
**A.** Provisioning and maintaining a mix of Spot and optionally On-Demand (and instance types) to meet capacity targets while coping with Spot loss.

**Q19.** When do Dedicated Hosts appear in the story?  
**A.** When you need visibility into physical sockets/cores for licensing (e.g. bring-your-own-license) or compliance that maps to a specific host.

**Q20.** What is the difference in intent between Dedicated Instances and Dedicated Hosts?  
**A.** Dedicated Instances isolate instances on hardware dedicated to your account but without the same socket/core visibility as Dedicated Hosts; Dedicated Hosts give per-host allocation for licensing and placement control.

**Q21.** What are Capacity Reservations?  
**A.** Reserving capacity in an AZ for your account so launches succeed even when the Region is tight — billing model differs from pure On-Demand; often paired with or compared to RIs/Savings Plans in cost planning.

**Q22.** What does “tenancy” refer to?  
**A.** Whether instances run on shared hardware (default) or dedicated hardware models (Dedicated Instances/Hosts), affecting isolation and sometimes licensing.

---

## §5 — Storage: EBS, snapshots, instance store

**Q23.** Why is EBS described as the “backpack that survives the trip”?  
**A.** EBS persists independently of the instance lifecycle (unless you delete it); data survives stop/start for EBS-backed instances.

**Q24.** When might you pick gp3 vs io2 in the story’s terms?  
**A.** gp3: general-purpose SSD, cost-effective baseline IOPS. io2 (or io1): sustained, provisioned IOPS for latency-sensitive databases and SLAs.

**Q25.** What are EBS snapshots used for?  
**A.** Incremental backups, cloning volumes, building new AMIs, disaster recovery, and migration copies.

**Q26.** Why is instance store “ephemeral” in the story?  
**A.** Data lives on physically attached disks; it does not survive stop/terminate the way EBS does (treat as high-performance temporary/cache unless you have a specific replication pattern).

**Q27.** Can the root volume be instance store?  
**A.** Yes, for AMIs built that way; then boot and root durability follow instance-store rules, not EBS stop/start persistence.

---

## §6 — Networking: ENI, IPs, SGs, NACLs, placement, NAT

**Q28.** What is an ENI?  
**A.** A virtual network card: private IP, attachment to subnets, security group membership — instances connect to the VPC through ENIs.

**Q29.** Private vs public IP vs Elastic IP?  
**A.** Private: VPC-internal. Public: internet-routable (may change on stop/start unless Elastic IP). Elastic IP: static public IPv4 you associate with an instance/ENI for stable inbound/outbound addressing.

**Q30.** Why are security groups called “stateful”?  
**A.** Return traffic for allowed outbound/inbound is automatically permitted related to the established flow (within the SG rules’ scope).

**Q31.** Why are NACLs “stateless”?  
**A.** Each direction is evaluated separately; you must explicitly allow return traffic if your design relies on NACLs for that path.

**Q32.** What is enhanced networking (ENA)?  
**A.** Higher packet-per-second and lower latency using SR-IOV-style data paths between instance and network.

**Q33.** Cluster vs spread vs partition placement groups — when?  
**A.** Cluster: low latency between a small set of instances (same AZ). Spread: hard isolation across underlying hardware for small groups. Partition: large parallel workloads with fault isolation by partition.

**Q34.** When do source/destination checks matter?  
**A.** When an instance forwards traffic (router/NAT/proxy); the check must allow forwarding if the instance is not the final destination.

**Q35.** NAT instance vs NAT Gateway?  
**A.** NAT instance is a self-managed EC2 box doing NAT; NAT Gateway is managed, highly available, scales with AWS — preferred for most new designs.

---

## §7 — IAM, keys, Session Manager, bastion

**Q36.** Why attach an IAM role via instance profile?  
**A.** Applications get temporary AWS credentials from STS — no long-lived access keys on disk — least-privilege and rotation-friendly.

**Q37.** What are key pairs for?  
**A.** Linux SSH authentication or retrieving Windows admin password; initial human access — not a substitute for IAM API permissions.

**Q38.** What does Session Manager provide?  
**A.** Interactive shell or commands through Systems Manager without opening inbound SSH/RDP to the world, when the SSM agent and IAM policies allow.

**Q39.** How can Session Manager relate to a bastion host?  
**A.** It often replaces the bastion pattern: no jump box in a public subnet required for operator access if SSM endpoints and IAM are configured.

---

## §8 — Scaling: ASG, ELB, health

**Q40.** What does an Auto Scaling group maintain?  
**A.** Desired capacity between min and max across one or more AZs, replacing unhealthy instances and scaling on signals/policies.

**Q41.** ALB vs NLB vs GWLB vs CLB — quick mapping?  
**A.** ALB: HTTP(S) layer 7 routing. NLB: TCP/UDP ultra-low latency layer 4. GWLB: transparently insert network appliances. CLB: legacy layer 4/7 combined (older workloads).

**Q42.** What do health checks and grace periods do?  
**A.** ELB/ASG verify the app is ready; grace period delays marking new instances unhealthy during slow bootstraps so they are not killed prematurely.

---

## §9 — Lifecycle: stop, start, reboot, terminate, hibernate, retirement

**Q43.** What happens to billing when you stop an EBS-backed instance?  
**A.** You stop paying instance hours; you still pay for attached EBS storage and any Elastic IPs if applicable.

**Q44.** Does reboot change the underlying host?  
**A.** Typically no — it is an OS restart on the same instance reservation pattern; unlike stop/start which can move to new underlying hardware.

**Q45.** What does terminate do to the instance and volumes?  
**A.** Instance ends; EBS volumes delete if `DeleteOnTermination` is true (common for root); others persist if configured.

**Q46.** What is hibernate?  
**A.** RAM is written to disk (EBS); faster resume than cold boot — useful for long init times; requires supported OS/instance/volume setup.

**Q47.** What is instance retirement?  
**A.** AWS must retire underlying hardware; you migrate (e.g. stop/start, AMI rebalance) or follow AWS guidance before the deadline.

---

## §10 — Operations: CloudWatch, status checks, SSM, Image Builder

**Q48.** What might CloudWatch monitor for EC2?  
**A.** CPU, network I/O, disk I/O, status check failures, plus custom metrics and logs via agent.

**Q49.** System status vs instance status check?  
**A.** System: hypervisor/host/infrastructure. Instance: guest OS/kernel reachability — helps triage “AWS side” vs “OS/app side.”

**Q50.** Name Systems Manager capabilities mentioned in the story.  
**A.** Patch Manager, Run Command, Parameter Store, Inventory — central operations without SSH to every node.

**Q51.** What is EC2 Image Builder for?  
**A.** Automated pipelines to build, test, and distribute AMIs so golden images stay patched and consistent.

---

## §11 — Migration: VM Import/Export, MGN

**Q52.** What is VM Import/Export?  
**A.** Import on-premises VM images into EC2 (and export in some cases) — bridges virtualization formats to AWS.

**Q53.** What is Application Migration Service (MGN)?  
**A.** Agent-based block-level replication for lift-and-shift: cut over to EC2 when the replica is ready.

---

## Epilogue — integrated scenarios

**Q54.** In one paragraph, narrate the “happy path” from the epilogue.  
**A.** Choose Region and design VPC/subnets/routes; launch EC2 from an AMI with the right instance type and user data; select purchase model (On-Demand, Spot, RI/Savings Plans, etc.); attach EBS (and instance store if needed); connect via ENIs, SGs, and IPs; grant access via IAM roles and Session Manager; scale with ASG behind ELB; monitor with CloudWatch; operate with Systems Manager; refresh AMIs with Image Builder; migrate legacy VMs with MGN or import; respect lifecycle events and retirement.

**Q55.** You need the cheapest batch compute that can survive losing nodes — which story elements apply?  
**A.** Spot Instances and/or Spot Fleet with retry-friendly work; ASG to replace nodes; multiple AZs if the batch control plane requires it; no reliance on instance store for critical state.

**Q56.** You must keep a static public IP for inbound HTTPS to one instance — what concepts?  
**A.** Elastic IP associated with the instance’s ENI; security groups for 443; often an ALB in front instead of exposing the instance directly for production.

**Q57.** Private subnets need outbound software updates — what pattern?  
**A.** NAT Gateway (or legacy NAT instance) in a public subnet, route from private subnets, plus VPC endpoints for AWS APIs to avoid unnecessary internet paths.

**Q58.** Why might you still use a launch template with ASG?  
**A.** Reusable, versioned launch parameters (AMI id, instance type, SGs, user data, IAM profile) so scaling events stay consistent and auditable.

**Q59.** Where does the story put “placement” that is not just VPC design?  
**A.** Placement groups (cluster/spread/partition) for latency or fault isolation; Capacity Reservations and Dedicated Hosts for capacity/licensing; AZ choice for HA.

**Q60.** What is the main security lesson from IAM vs key pairs?  
**A.** Prefer IAM roles for AWS API access from the instance; use key pairs for OS login where needed, and prefer Session Manager to reduce open network attack surface.

---

*End of question set. Add drill variants by rephrasing “why” questions as “compare X vs Y” and by writing your own two-sentence scenario stems.*
