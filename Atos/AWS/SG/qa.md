# AWS Security Groups — Questions & Answers

This file records questions and answers from the Security Groups learning session.

---

## Q1: List all AWS Security Group concepts

**Question:** List all AWS Security Group concepts?

**Answer:**

An AWS **Security Group (SG)** is a **stateful virtual firewall** that controls inbound and outbound traffic for resources associated with it (EC2, ENIs, RDS, ELB, Lambda in VPC, etc.). Core concepts:

### What a Security Group is

| Concept | Description |
|---------|-------------|
| **Security Group** | Named set of allow rules applied at the **ENI / instance** level (not subnet). Acts as a virtual firewall. |
| **Stateful** | If you allow inbound traffic, the **response** is automatically allowed out (and vice versa). You do not need a matching return rule. |
| **Allow-only** | Security Groups only support **Allow**. There is no Deny rule. Anything not allowed is implicitly denied. |
| **Default deny** | If no rule matches, traffic is dropped. |
| **VPC-scoped** | Every Security Group belongs to exactly one VPC. |

### Association & scope

| Concept | Description |
|---------|-------------|
| **ENI association** | Rules apply to the network interface(s) the SG is attached to. |
| **Multiple SGs per ENI** | An ENI can have several Security Groups; **effective rules = union** of all attached SGs. |
| **Instance / resource association** | EC2, RDS, ALB/NLB, ElastiCache, EFS mount targets, VPC Lambda, etc. use SGs. |
| **Default Security Group** | Created with every VPC. Allows all traffic **from itself** (same SG) and all outbound. Often left unused in production. |
| **Custom Security Group** | Groups you create for app tiers (e.g. `web`, `app`, `db`). Preferred over the default SG. |

### Rules

| Concept | Description |
|---------|-------------|
| **Inbound (ingress) rules** | What traffic is allowed **into** the associated resource. |
| **Outbound (egress) rules** | What traffic is allowed **out**. New custom SGs often allow all outbound by default (`0.0.0.0/0` and `::/0`). |
| **Protocol** | TCP, UDP, ICMP, ICMPv6, or “All” (`-1`). |
| **Port / port range** | Single port (e.g. `443`) or range (e.g. `1024–65535`). ICMP uses type/code instead of ports. |
| **Source / destination** | Who can talk to you (ingress) or where you can talk (egress). |
| **Description** | Optional text on a rule (highly recommended for ops clarity). |
| **Rule ID** | Unique identifier for each rule (useful for APIs and Terraform). |

### Sources and destinations (who/what)

| Source / destination type | Description |
|---------------------------|-------------|
| **CIDR block (IPv4/IPv6)** | e.g. `10.0.0.0/16`, `0.0.0.0/0`, `::/0`. |
| **Another Security Group** | Reference by SG ID. Allows traffic from resources that have that SG attached (same VPC, or peered / shared with care). |
| **Self-reference** | Rule that allows traffic from the **same** Security Group (common for cluster members talking to each other). |
| **Prefix list** | Managed list of CIDRs (e.g. S3 gateway prefix list, or customer-managed prefix lists). |
| **Anywhere / specific IP** | `0.0.0.0/0` = internet (or all IPv4); prefer least privilege. |

### Behavior & evaluation

| Concept | Description |
|---------|-------------|
| **Implicit deny** | No matching allow → traffic blocked. |
| **Union of rules** | All attached SGs’ rules are combined; any matching allow is enough. |
| **Connection tracking** | Because SGs are stateful, established/related return traffic is tracked and allowed. |
| **No ordering / priority** | Unlike NACLs, rules are not numbered; there is no “first match wins.” |
| **Evaluation at ENI** | Checked when traffic hits the interface, after routing decisions. |

### Lifecycle & management

| Concept | Description |
|---------|-------------|
| **Create / update / delete** | Via Console, CLI, API, CloudFormation, Terraform, etc. |
| **Rule changes apply immediately** | Updating rules takes effect without restarting instances. |
| **Cannot delete if in use** | Must detach from all ENIs/resources (and remove references from other SGs) first. |
| **Tags** | Key/value metadata for ownership, environment, cost, automation. |
| **Name tag** | Common convention; the SG also has a **Group Name** set at create time (not always changeable the same way). |
| **Quota / limits** | Soft limits on SGs per VPC, SGs per ENI, and rules per SG (can often be raised). |

### Related networking concepts (often contrasted)

| Concept | How it differs from Security Groups |
|---------|-------------------------------------|
| **Network ACL (NACL)** | Subnet-level, **stateless**, supports Allow **and** Deny, numbered rules with order. |
| **Route tables** | Decide **where** traffic goes; SGs decide **whether** it is allowed. |
| **VPC endpoints / PrivateLink** | Private connectivity to AWS/services; often paired with SGs on endpoint ENIs. |
| **AWS WAF / Shield** | Application/DDoS protection at the edge — not a replacement for SGs. |
| **Firewall Manager / Network Firewall** | Org-wide or deeper packet inspection; complements SGs. |

### Design patterns & best practices

| Concept | Description |
|---------|-------------|
| **Least privilege** | Open only required ports and sources; avoid `0.0.0.0/0` on SSH/RDP/DB ports. |
| **Tiered SGs** | Separate SGs per tier (web → app → db) and reference SGs instead of wide CIDRs. |
| **SG-to-SG references** | Prefer referencing another SG over hard-coding private IPs/CIDRs when possible. |
| **Separate management access** | Dedicated SG or rules for bastion / SSM; prefer **SSM Session Manager** over open SSH. |
| **Egress control** | Tighten outbound rules when you need to limit data exfiltration or outbound attack surface. |
| **Immutable naming** | Clear names (`prod-web-sg`) and rule descriptions documenting why a port is open. |

### Mental model

```
Internet / peer / VPC traffic
        │
        ▼
   Route table (where?)
        │
        ▼
   NACL at subnet (stateless allow/deny)
        │
        ▼
   Security Group at ENI (stateful allow-only)
        │
        ▼
   Instance / service
```

Security Groups answer: **“Is this connection allowed to/from this resource?”**  
They do **not** replace IAM (who can call AWS APIs) or NACLs (subnet-level controls).

---

## Q2: List typical AWS Security Group usecases

**Question:** List typical AWS Security Group usecases

**Answer:**

Security Groups are used whenever you need to control **network traffic to/from a resource’s ENI**. Typical use cases group by architecture pattern and resource type.

---

### Multi-tier applications (most common)

| Use case | Typical SG design | Example rules |
|----------|-------------------|---------------|
| **Public web tier** | `web-sg` on ALB or public EC2 | Inbound `80`/`443` from `0.0.0.0/0` (or CloudFront / known IPs) |
| **App / API tier** | `app-sg` on EC2/ECS/EKS nodes | Inbound `8080`/`8443` **from `web-sg` only** (not the internet) |
| **Database tier** | `db-sg` on RDS/Aurora | Inbound `5432`/`3306` **from `app-sg` only** |
| **Cache tier** | `cache-sg` on ElastiCache | Inbound `6379`/`11211` from `app-sg` |
| **Internal microservices** | Per-service SGs | Service A SG allows inbound only from Service B SG on the app port |

**Pattern:** Internet → load balancer SG → app SG → data SG. Prefer **SG-to-SG references** over broad CIDRs between tiers.

---

### Load balancers & edge entry

| Use case | Typical setup |
|----------|---------------|
| **Internet-facing ALB/NLB** | Listener ports open from internet (or known CDN/WAF IPs); targets only accept traffic **from the LB SG** |
| **Internal ALB/NLB** | Inbound only from VPC CIDR or specific app SGs |
| **ALB → EC2 / ASG targets** | Target SG allows app port from ALB SG; ALB SG allows 443 from clients |
| **NLB → targets** | Same idea; note NLB preserves client IP in some modes — still use least privilege on target SG |
| **API Gateway (HTTP API / private)** | VPC Link / private integration: SG on ENIs allows traffic from API Gateway–related sources as documented |

---

### Administrative & operator access

| Use case | Typical setup |
|----------|---------------|
| **Bastion / jump host** | Bastion SG: SSH/RDP from office/VPN CIDR only; private instances allow SSH **from bastion SG** |
| **SSM Session Manager (preferred)** | Often **no inbound SSH**; instances need outbound HTTPS to SSM endpoints (or VPC endpoints + endpoint SGs) |
| **VPN / Client VPN** | Private SGs allow admin ports from VPN CIDR / Client VPN SG |
| **Jump for DB admins** | DBA SG or bastion can reach `db-sg` on 5432; app SG still separate |

---

### Databases & data stores

| Use case | Typical setup |
|----------|---------------|
| **RDS / Aurora private** | No public access; inbound only from app/migration SGs |
| **RDS publicly accessible (avoid in prod)** | If required: restrict source to known IPs, never `0.0.0.0/0` on DB ports |
| **ElastiCache / MemoryDB** | Inbound from app SG only; usually no public access |
| **Redshift / OpenSearch** | Client SG → cluster SG on service port; often also restrict to VPN/office |
| **EFS mount targets** | NFS `2049` from instance/ECS task SGs that mount the filesystem |
| **Amazon MQ / MSK** | Broker SG allows broker ports from producer/consumer SGs |

---

### Containers & serverless in VPC

| Use case | Typical setup |
|----------|---------------|
| **ECS / Fargate tasks** | Task ENI SGs: inbound from ALB SG; outbound for dependencies (DB, HTTPS APIs) |
| **EKS worker nodes / pods** | Node SG + (often) per-pod security groups via security groups for pods; control kubelet, node↔node, and app ports carefully |
| **Lambda in VPC** | Lambda ENI SGs: usually **no inbound**; outbound to RDS/ElastiCache/VPC endpoints; may need HTTPS egress or interface endpoints |
| **Batch / Glue (VPC)** | Job ENI SGs allow outbound to data sources and required AWS endpoints |

---

### Hybrid, VPC connectivity & shared services

| Use case | Typical setup |
|----------|---------------|
| **On-prem via VPN / Direct Connect** | Allow app ports from on-prem CIDRs (or transit gateway attached CIDRs) into specific SGs |
| **VPC peering / Transit Gateway** | Reference peer CIDRs (or careful design); SG references across peered VPCs have limits — often use CIDRs |
| **Shared services VPC** | Central DNS, AD, monitoring: allow only required ports from spoke VPC CIDRs/SGs |
| **Interface VPC endpoints (PrivateLink)** | Endpoint SG allows HTTPS `443` from workload SGs; workloads use private AWS API access |
| **PrivateLink consumer / provider** | Consumer SG → NLB/endpoint service; provider controls who can connect via endpoint service + SGs |

---

### Outbound / egress control

| Use case | Typical setup |
|----------|---------------|
| **Default “allow all outbound”** | Convenient for apps needing many external APIs; common starting point |
| **Locked-down egress** | Only HTTPS to internet, or only specific CIDRs/prefix lists (e.g. S3 gateway prefix list) |
| **Patch / package updates** | Outbound `80`/`443` to repos, or via proxy/NAT with SG + proxy allowlists |
| **Deny-by-absence exfiltration control** | Remove `0.0.0.0/0` egress; allow only DB SG, VPC endpoints, approved destinations |

---

### High availability, clustering & self-reference

| Use case | Typical setup |
|----------|---------------|
| **Cluster members talk to each other** | Self-referencing rule: allow cluster ports **from the same SG** (Kafka, Consul, Elasticsearch nodes, etc.) |
| **ASG / identical fleet** | One SG on all instances; self-ref for health/cluster traffic |
| **Multi-AZ RDS / replicas** | AWS manages some control-plane traffic; your `db-sg` still gates client access |

---

### Platform & managed service attachments

| Use case | Why an SG is attached |
|----------|----------------------|
| **Elastic Load Balancing** | Controls client → LB and (with target SGs) LB → targets |
| **RDS, ElastiCache, Redshift, OpenSearch** | Client connectivity control |
| **WorkSpaces / AppStream** | Streaming and directory connectivity |
| **EMR / SageMaker / MWAA** | Cluster/notebook ENIs need controlled ingress/egress |
| **Directory Service (AD Connector / Managed AD)** | Domain join and LDAP/Kerberos ports from instance SGs |

---

### Security hardening patterns (use-case driven)

| Goal | SG approach |
|------|-------------|
| **Minimize blast radius** | Separate SG per tier/service; never share one “allow everything” SG |
| **Break-glass admin** | Temporary rule or temporary SG association; remove after incident |
| **Compliance (PCI, etc.)** | No public DB; documented rule descriptions; restrict sources to known CIDRs/SGs |
| **Blue/green or migration** | Temporarily allow both old and new app SGs into `db-sg`, then remove old |

---

### Mental model by traffic path

```
Users / partners
    → edge SG (ALB / NLB / bastion)
        → app SG
            → data SG (RDS, cache, queue brokers)
                → optional: VPC endpoint SGs for private AWS APIs
```

**IAM** controls who can change SGs or call AWS APIs.  
**Security Groups** control which **network connections** are allowed once resources are running.

---

## Q3: Compare SG vs IAM

**Question:** Compare SG vs IAM

**Answer:**

**IAM** and **Security Groups** both enforce “who/what is allowed,” but they operate at **different layers**. Confusing them is common; they are complementary, not alternatives.

| Dimension | **IAM** | **Security Group (SG)** |
|-----------|---------|-------------------------|
| **What it is** | Identity & API authorization service | Stateful virtual firewall for VPC resources |
| **Question it answers** | *Can this principal call this AWS API / access this AWS resource?* | *Can this network packet reach / leave this ENI?* |
| **Layer** | **Control plane / AWS APIs** (+ some data-plane auth like S3, DynamoDB) | **Network data plane** (TCP/UDP/ICMP inside the VPC) |
| **Applies to** | Users, roles, groups, federated identities, service principals | ENIs attached to EC2, RDS, ALB, Lambda-in-VPC, etc. |
| **Unit of control** | Actions on ARNs (`ec2:AuthorizeSecurityGroupIngress`, `s3:GetObject`) | Protocols, ports, CIDRs / other SGs / prefix lists |
| **Allow / Deny** | Allow and **explicit Deny** (Deny wins) | **Allow only**; no Deny rules; implicit deny otherwise |
| **State** | Stateless evaluation of policies per request | **Stateful** connections (return traffic automatic) |
| **Default** | Implicit deny unless allowed | Implicit deny unless a rule matches |
| **Scope** | Account / org (global IAM; some regional resources) | **One VPC**; rules apply per associated ENI |
| **Credentials** | Yes — passwords, keys, STS, MFA | No — pure network filtering |
| **Changes who can manage infra** | Yes (e.g. who can create/edit SGs) | No — only filters traffic once resources exist |
| **Typical artifact** | JSON policy documents | Ingress/egress rule sets |

---

### Side-by-side examples

| Scenario | IAM decides | SG decides |
|----------|-------------|------------|
| Developer opens port 22 on an instance | Is the user allowed `ec2:AuthorizeSecurityGroupIngress`? | After the rule exists: can `203.0.113.10` actually SSH to the instance? |
| App on EC2 reads an S3 object | Instance **role** allowed `s3:GetObject` on that bucket? | Can the instance reach S3 over the network (route, NAT/endpoint, **egress** SG / endpoint SG)? |
| Browser hits a website on ALB | Usually N/A (public HTTP isn’t an IAM call) | ALB SG allows `443` from client; target SG allows traffic from ALB SG |
| Lambda writes to DynamoDB | Lambda **execution role** has `dynamodb:PutItem`? | If Lambda is **not** in a VPC: no SG involved. If **in VPC**: SG must allow path to DynamoDB (often via VPC endpoint) |
| DBA connects to RDS with a SQL client | Optional: IAM DB auth (`rds-db:connect`). Often just DB username/password | `db-sg` must allow the client’s IP or bastion/app SG on `5432`/`3306` |
| Terraform creates a Security Group | Caller needs IAM permission for EC2 SG APIs | The SG it creates then filters traffic for attached resources |

---

### How they work together (defense in depth)

```
Human / CI / app identity
        │
        ▼
   ┌─────────┐
   │   IAM   │  ← May I call AWS APIs? May this role access S3/DynamoDB?
   └────┬────┘
        │ (APIs succeed → resources exist / are invoked)
        ▼
   VPC network path
        │
        ▼
   ┌─────────┐
   │   SG    │  ← May this TCP/UDP flow hit the ENI?
   └────┬────┘
        │
        ▼
   Application / DB protocol auth (DB user, app tokens, etc.)
```

You usually need **both**:

| Goal | Use |
|------|-----|
| Stop unauthorized people from changing firewalls or launching instances | **IAM** |
| Stop the internet from reaching your database port | **Security Group** |
| Stop an EC2 role from deleting production S3 buckets | **IAM** |
| Stop app servers from talking directly to the internet on all ports | **SG egress** (and/or NACL, firewall) |
| Allow only the web tier to reach the app tier on port 8080 | **SG** |
| Allow only the CI role to deploy to prod | **IAM** |

---

### Common misconceptions

| Misconception | Reality |
|---------------|---------|
| “IAM replaces Security Groups” | No — IAM does not filter VPC packet flows between instances. |
| “An SG can grant S3 permissions” | No — S3 object access is IAM (and bucket policy). SG only affects network reachability. |
| “If IAM allows `ec2:Connect`, SSH will work” | IAM may allow using EC2 Instance Connect / SSM APIs; **SSH still needs network path + SG rules** (SSM often needs egress/endpoints instead of inbound 22). |
| “Closing IAM stops all traffic to my ALB” | Unrelated for public HTTP clients. Use SG (and WAF, etc.) for that. |
| “Default SG is about IAM defaults” | Default **Security Group** is a VPC network object; default IAM deny is a separate idea. |

---

### Quick chooser

| If you care about… | Choose |
|--------------------|--------|
| Who can call AWS APIs / assume roles / read S3 | **IAM** |
| Which IPs/ports can reach an instance, RDS, or ALB | **Security Group** |
| Both “can this role use the API” and “can packets flow” | **Both** |

**One-liner:** IAM = **identity & API permissions**; Security Group = **network firewall for VPC resources**.

---


**ENI** = **Elastic Network Interface** — the virtual network card AWS attaches to resources in a VPC.

| Aspect | Detail |
|--------|--------|
| **What it is** | A virtual NIC with a private IP (optional public/Elastic IP), MAC address, and one or more Security Groups |
| **Where it shows up** | EC2 instances, RDS, ALB/NLB nodes, Lambda-in-VPC, ECS/Fargate tasks, VPC endpoints, etc. |
| **Why SGs mention it** | Security Group rules apply to the **ENI**, not to the subnet or “the instance” as an abstract object |

An EC2 instance always has a **primary ENI** (`eth0`). You can attach **secondary ENIs** for extra IPs, multi-homing, or moving a network identity between instances.

**Mental model:** traffic hits the ENI → Security Group on that ENI allows or drops it → OS/app sees the packet.

I'm in Ask mode, so this isn’t appended to `qa.md`. Switch to Agent mode if you want it saved.