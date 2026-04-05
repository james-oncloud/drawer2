# Study questions — VPC core concepts story (`04_vpc-core-concepts-story.md`)

## User query

> read … `04_vpc-core-concepts-story.md` and create a complete list questions to cover all concepts in the story

### User query (model answers)

> edit … `06_vpc-story-study-questions.md` and add model answers

## How to use this list

Try each question **without** reading the model answer first. **Model answers** below align with the narrative in `04_vpc-core-concepts-story.md` (and standard AWS VPC behavior). They are concise—not every edge case.

---

## Act I — The land and the lots

1. In one sentence, what is a **VPC** relative to a **Region**?
   - **Model answer:** A **VPC** is your own **logically isolated** private network **inside** an AWS **Region**—you choose its address space and internal layout.

2. What does **logical isolation** mean for workloads in different VPCs (at a high level)?
   - **Model answer:** By default, resources in one VPC do not reach another’s private space unless you add explicit connectivity (peering, TGW, VPN, etc.) and routing; their traffic and addressing are separated at the platform level.

3. What is a **CIDR block** in this metaphor, and why must peered VPCs avoid **overlapping** ranges?
   - **Model answer:** The **CIDR** is the “master map” of which **IPv4 addresses** belong to the VPC (or subnet). **Overlapping** ranges would make the same IP mean two different homes—routing cannot decide uniquely, so **peering** (and similar designs) require **non-overlapping** CIDRs.

4. What is a **subnet**, and how does it relate to the VPC CIDR?
   - **Model answer:** A **subnet** is a **non-overlapping slice** of the VPC’s CIDR—an address range carved out for placing resources (e.g. EC2 ENIs) in one **AZ**.

5. Why does **each** subnet belong to **exactly one** Availability Zone?
   - **Model answer:** AWS ties a subnet to a single **AZ** so you know precisely which data-center slice that “neighborhood” lives in; you get resilience by repeating subnets **across AZs**, not by stretching one subnet across several.

6. What pattern does the story suggest if you want resilience when one AZ fails?
   - **Model answer:** Deploy the same **kind of subnet / workload pattern** in **multiple AZs** (e.g. app tier in AZ-a and AZ-b) so a strike in one neighborhood does not take out the whole estate.

7. Can one subnet span multiple AZs? Why or why not?
   - **Model answer:** **No.** A subnet is defined in **one** AZ only; spanning AZs would blur failure isolation and is not how VPC subnetting works.

---

## Act II — Signs at every corner

8. What job do **route tables** perform for packets?
   - **Model answer:** They are the **signposts**: for a **destination CIDR**, they tell the VPC router **which target** to use next (local, IGW, NAT, peering, TGW, endpoint, etc.).

9. What is the **`local`** route conceptually used for?
   - **Model answer:** Traffic whose destination falls **inside the VPC’s own CIDR** stays **inside the VPC fabric**—delivered between subnets without using the IGW for that hop.

10. List **five** different “signposts” (targets) traffic might use to leave or cross boundaries besides `local`.
    - **Model answer:** Any five of: **Internet Gateway**, **NAT Gateway** (or NAT instance), **VPC peering** (`pcx-…`), **Transit Gateway**, **virtual private gateway** (site-to-site VPN), **VPC endpoint** (gateway or interface), **NAT Gateway** path’s eventual IGW for return traffic from internet, etc.

11. What is an **Internet Gateway (IGW)** used for, and is traffic through it typically bidirectional for **public** designs?
    - **Model answer:** The IGW is the VPC’s attachment to the **public internet** for **IPv4/IPv6** patterns that use it; for resources with **public** addressing, it supports **both outbound** and **inbound** initiated from the internet (subject to routes and security).

12. Contrast **NAT Gateway** with **NAT instance** in one line (role, not feature matrix).
    - **Model answer:** Both provide **network address translation** so **private** instances can reach the internet with a **public** source IP; **NAT Gateway** is the managed, highly available service; **NAT instance** is a self-managed EC2 pattern doing a similar job.

13. Who can **start** a TCP session **inbound** through a NAT Gateway to a private instance on the internet side—allowed or not?
    - **Model answer:** **Not allowed** in the usual NAT GW model—NAT is for **outbound-initiated** flows; the internet cannot open arbitrary new sessions **to** your private instance’s IP **through** NAT GW like it can **to a public IP** via IGW.

14. What role does an **egress-only internet gateway** play for **IPv6**?
    - **Model answer:** It allows **IPv6** traffic to **exit** to the internet **without** allowing **unsolicited inbound** IPv6 from the internet (outbound-only public path for IPv6).

15. What problem do **VPC endpoints** (gateway vs interface) solve vs going out the IGW to AWS APIs?
    - **Model answer:** They send traffic to **AWS services** (API planes) **without** traversing the **public internet**—private “corridors” from your VPC to AWS.

16. Name **two** AWS services the story names as examples reachable via private “corridors” to the API plane.
    - **Model answer:** **Amazon S3** and **Amazon DynamoDB** (among others via endpoint types).

17. What is **VPC peering**, and how many VPCs does one peering connection link?
    - **Model answer:** **Private L3 connectivity** between **exactly two** VPCs (same or cross-account / cross-Region per AWS rules).

18. Explain **non-transitive** peering in plain English (the “friend of a friend” idea).
    - **Model answer:** If VPC A peers with B and B peers with C, **A cannot use B as a router to reach C** unless you add separate connectivity (e.g. another peering or a hub); there is **no automatic chain**.

19. Why won’t AWS let you peer two VPCs with **overlapping** IPv4 CIDRs?
    - **Model answer:** The same IP would exist in both networks—routing and ownership of destinations become **ambiguous**; peering requires **disjoint** address space.

20. Where does **Transit Gateway** “live” relative to a single VPC’s boundary, and what problem does it solve vs many peerings?
    - **Model answer:** TGW is a **regional hub** **outside** the idea of “inside one VPC’s fence”—it connects **many** VPCs (and often on-prem) with one place to manage **routing**, avoiding a **full mesh** of pairwise peerings.

21. What connectivity pattern involves **virtual private gateway** and **customer gateway**?
    - **Model answer:** **Site-to-site VPN** from your VPC (VGW on AWS side) to on-premises or another network (CGW represents your side).

---

## Act III — Names and whispers

22. When is **Route 53 Resolver** especially relevant in the story?
    - **Model answer:** When you need **DNS resolution** that spans **VPC and hybrid/corporate** environments—forwarding or rules between on-prem and AWS name spaces.

23. What is a **hybrid DNS** scenario in your own words?
    - **Model answer:** **Split-brain** name resolution: some names live in **Route 53** or AWS Resolver, others in **on-prem DNS**; you **stitch** them so instances in the VPC can resolve corp names (and sometimes the reverse).

24. What are **DHCP option sets** used for in a VPC DNS story?
    - **Model answer:** Historically, associating **DHCP-style options** with the VPC—such as **DNS servers** and **domain name**—so instances know where to resolve names (many designs rely on **Amazon-provided DNS** instead of heavy custom options).

25. What do people often use instead of heavy custom DHCP DNS options today?
    - **Model answer:** **Amazon-provided DNS** (the VPC DNS resolver at the **VPC+2** address) plus Resolver rules/endpoints as needed.

26. What do **enableDnsSupport** and **enableDnsHostnames** (VPC attributes) influence?
    - **Model answer:** **DnsSupport** turns on the **Amazon DNS resolver** for the VPC; **DnsHostnames** allows **public DNS hostnames** for instances (e.g. public IPv4 DNS names) when paired with public IP behavior—operators expect sensible **resolution** and **naming** behavior when these are on.

---

## Act IV — Bouncers and door frames

27. What is an **ENI**, and where do **private IPs** actually attach?
    - **Model answer:** An **elastic network interface**—a **virtual NIC**; **private (and secondary private) IPs** attach to the **ENI**, not “directly” to the instance abstraction without an ENI.

28. What are **secondary private IPs** used for (conceptually)?
    - **Model answer:** Extra **private addresses** on the same ENI for **multi-service**, **VIP-style**, or **container/host networking** patterns without adding another ENI (story-level).

29. Are **security groups** stateful or stateless?
    - **Model answer:** **Stateful**—return traffic for an allowed flow is typically permitted in relation to that connection.

30. Do security groups use **allow** lists, **deny** lists, or both as their primary model?
    - **Model answer:** **Allow** rules only, with **implicit deny** for anything not explicitly allowed.

31. What is the **implicit** behavior if no SG rule matches?
    - **Model answer:** **Deny**—traffic is **not** allowed.

32. Where in the path do **network ACLs** apply (subnet boundary vs ENI)?
    - **Model answer:** At the **subnet** boundary—for **all** ENIs in that subnet, entering or leaving the subnet.

33. Are NACLs stateless or stateless, and why does **rule order** matter?
    - **Model answer:** **Stateless**—they do not automatically “remember” a session; you must allow **return** traffic explicitly if you filter tightly. **First matching rule** wins (lowest rule number), so **order** determines allow vs deny.

34. Why might an architect use **both** NACL and security group together?
    - **Model answer:** **NACL** for **coarse**, subnet-wide guardrails (or explicit deny patterns); **SG** for **fine-grained**, **instance/ENI**-aware **allow** rules—**defense in depth**.

35. What is an **Elastic IP (EIP)** attached to, according to the story?
    - **Model answer:** A **static public IPv4** associated with an **ENI** (or used by **NAT Gateway** for its public identity).

36. Does the story mention EIP on NAT—if so, in what role?
    - **Model answer:** Yes—the NAT Gateway’s **public** identity used when **private** instances’ traffic is **source-NAT’d** to the internet.

37. Is “public subnet” vs “private subnet” decided **only** by the subnet’s name tag?
    - **Model answer:** **No**—it is a **routing (and design) story**: whether **0.0.0.0/0** goes to an **IGW** and whether instances get **public** IPs, not the **name** of the subnet.

38. For a **public** internet pattern, where does **`0.0.0.0/0`** usually point?
    - **Model answer:** The **Internet Gateway** (for IPv4 internet egress from that subnet’s route table).

39. For a **private** subnet needing **outbound-only** internet, where does **`0.0.0.0/0`** usually point instead of the IGW?
    - **Model answer:** A **NAT Gateway** (or NAT instance); instance traffic does **not** use the IGW directly for default route in the classic pattern.

40. Can an instance have both **private** and **public** IPv4 on the same ENI in a public-subnet design?
    - **Model answer:** **Yes**—common pattern: **private** primary plus **public** or **EIP** for internet-facing access on the same ENI in a **public** subnet.

---

## Act IV½ — The couriers (inbound / outbound routing)

41. For traffic to an IP inside the **VPC CIDR**, which route type typically keeps packets internal—no IGW?
    - **Model answer:** The **`local`** route for the VPC CIDR in the route table—traffic stays inside the VPC.

42. How do **peering**, **Transit Gateway**, and **VPN** paths relate to the IGW when configured correctly?
    - **Model answer:** They use **dedicated routes** (e.g. pcx-, TGW attachment, VGW) to **other CIDRs**; traffic **does not need** the **IGW** unless you misroute or also send internet-bound traffic.

43. How does traffic to **S3/DynamoDB** via **VPC endpoints** differ from going through an IGW?
    - **Model answer:** It goes **privately** to the **AWS service** backbone/API—**not** out the **public internet** path; the **IGW** is **not** involved for that destination.

44. Walk through **outbound** internet from a **public** subnet: from ENI to IGW—what must the **route table** and **SG** generally allow?
    - **Model answer:** **Route:** default **`0.0.0.0/0` → IGW**; **ENI** usually has **public** IP/EIP; **SG:** **allow** outbound to the destination (and **inbound return** is handled statefully for allowed egress flows); **NACL** must permit subnet hop if not wide open.

45. Why can **return** traffic work with security groups when the flow **started inside**?
    - **Model answer:** Security groups are **stateful**—they track allowed **connections** and allow **return** traffic associated with that flow (within the connection semantics).

46. Describe **outbound** internet from a **private** subnet: path **instance → NAT → ? → internet**.
    - **Model answer:** **instance → NAT Gateway → IGW → internet** (NAT uses a public IP/EIP; reply comes **IGW → NAT → instance**).

47. What address does the internet see as **source** for private-subnet egress via NAT?
    - **Model answer:** The NAT Gateway’s **public** address (**Elastic IP**), not the instance’s **private** IP.

48. When the reply comes back, what entity “untangles” the mapping back to the private instance?
    - **Model answer:** The **NAT Gateway** reverses the **connection tracking / mapping** and forwards to the correct **private** IP.

49. Why can’t a random internet client **initiate** a connection **directly** to your instance’s **private IP** through **standard NAT Gateway**?
    - **Model answer:** NAT GW does **not** publish **DNAT** for your private hosts to the internet; it only translates **outbound-initiated** flows. There is **no** stable **public→private** mapping for arbitrary inbound like an **IGW + public IP** path.

50. For **inbound** from the internet to a **public EIP**, trace the packet: **Internet → ? → subnet → ENI**.
    - **Model answer:** **Internet → IGW → (VPC routing) → subnet → ENI** (security/NACL evaluated along the path).

51. What two filtering layers does the story mention **before/at** the ENI for inbound (in order of metaphor)?
    - **Model answer:** **NACL** at the **subnet edge**, then **security group** at the **ENI** (“stateless gates” then “stateful bouncers”).

52. Why must **NACL rules** often be thought about in **both directions** for a flow?
    - **Model answer:** NACLs are **stateless**—**egress** and **ingress** through the subnet boundary are evaluated **separately**; return packets need **matching permits** unless rules are broad.

53. If an instance has **no public IP** and only uses NAT for egress, how can you still get **admin** or **app** traffic in from the internet (name **three** patterns)?
    - **Model answer:** Any three of: **bastion/jump host** or **public** subnet relay; **ALB/NLB** with listeners in **public** subnets; **VPN** or **Direct Connect**; **PrivateLink** consumer; **SSM Session Manager** (no inbound SSH port to internet); **reverse proxy** in public tier.

54. How does an **ALB/NLB** in **public** subnets reach **targets** in **private** subnets?
    - **Model answer:** The load balancer has **ENIs in public subnets** facing clients; **AWS routes** from LB **ENIs** to **target** private IPs **inside** the VPC—targets stay **private** while the LB is the **public façade** (with correct SGs on LB and targets).

55. Which two resources both need appropriate **security groups** in an internet → LB → private target path?
    - **Model answer:** The **load balancer** (client → LB) and the **targets** (LB → instances/tasks), **both**.

56. Summarize the “moral”: **private subnet outbound** vs **public subnet outbound** internet—one sentence each.
    - **Model answer:** **Private:** outbound internet is typically **NAT → IGW**, not direct instance→IGW. **Public:** with a **public** IP on the ENI, outbound/inbound internet often uses **IGW** directly for **`0.0.0.0/0`** internet routes.

57. **Security group** vs **NACL**: which “remembers” related return traffic for a session?
    - **Model answer:** **Security group** (stateful). **NACL** does not “remember” in that sense.

58. Name **two** tools the story calls **historian** and **detective** for packet path debugging.
    - **Model answer:** **VPC Flow Logs** (historian) and **Reachability Analyzer** (detective).

---

## Act V — Remembering and debugging

59. What do **VPC Flow Logs** record, and what are they useful for?
    - **Model answer:** **IP traffic** **accepted/rejected/all** traversing **ENIs, subnets, or VPC**—useful for **audit**, **security**, and **forensics** of connectivity.

60. Where can Flow Log records be delivered (conceptually—think observability sinks)?
    - **Model answer:** Typically **Amazon CloudWatch Logs**, **S3**, or **Kinesis Data Firehose** (per AWS feature set when you configure the Flow Log).

61. What does **Reachability Analyzer** analyze without requiring live packet injection?
    - **Model answer:** A **model** of **paths** through **VPC routing**, **security groups**, **NACLs**, and **attachments** to explain **whether** (and sometimes **why**) traffic **can** or **cannot** reach from source to destination.

62. Name **three** things the story lists that commonly break connectivity (“plot twists”) when Flow Logs say REJECT or traffic disappears.
    - **Model answer:** Any three of: **wrong subnet route table association**; **missing or lower-precedence route** (e.g. no peering/NAT/IGW route); **IGW not attached** or NAT/public IP missing; **SG or NACL deny**; **asymmetric NACLs**; **wrong AZ/subnet** for target.

---

## Act VI — Guests and heavy armor

63. What is **PrivateLink** in the story’s metaphor?
    - **Model answer:** A **dedicated VIP tunnel** into **someone else’s service** without merging your **address plans**—private access to a provider’s service.

64. Consumer side: what kind of **VPC endpoint** is typically involved?
    - **Model answer:** **Interface VPC endpoint** (connects to an **endpoint service**).

65. Provider side: the story ties the service to which load balancer type backing an **endpoint service**?
    - **Model answer:** **Network Load Balancer (NLB)**.

66. Can PrivateLink expose a service in **another account’s** VPC without merging CIDR plans?
    - **Model answer:** **Yes**—the **consumer VPC** attaches an **interface endpoint** to the provider’s **endpoint service** (NLB-backed); this is **private service access** across accounts **without** treating both networks as one flat L3 domain—you still validate **routing, DNS, and** possible **CIDR overlap** issues for your design.

67. What is **AWS Network Firewall** for compared to **only** security groups and route tables?
    - **Model answer:** A **managed, centralized** **stateful** **Layer 3–7** **firewall** appliance **in the VPC** for inspection and policy beyond what **SG/NACL + routes** alone provide at scale/complexity.

68. When might you **thread** traffic through Network Firewall (design intent)?
    - **Model answer:** When you need **uniform** **egress/ingress inspection**, **IPS/IDS-style** controls, **domain/pattern** filtering, or **central** policy **per VPC or shared** architecture—often with **route table** steering **via** firewall **endpoints**.

---

## Cross-cutting and scenario questions

69. Two VPCs **A** and **B** are peered; **B** is peered with **C**, but **A** is **not** peered with **C**. Can **A** reach **C** via **B**? Why?
    - **Model answer:** **No**—**peering is not transitive**; B does not act as a general **router** between A and C unless you build that (e.g. **TGW** or separate peerings).

70. You added a **peering route** on one side but not the other—what breaks?
    - **Model answer:** **Asymmetric routing**—return traffic has **no route** (or wrong path) on the missing side; the flow **fails** even if one direction works briefly.

71. You want **HTTPS** from the internet to an app whose tasks **must** stay in **private** subnets only—sketch the minimal public-facing components.
    - **Model answer:** **Internet-facing ALB** (or NLB) **ENIs in public subnets**, **route 0.0.0.0/0 → IGW** on those subnets, **targets** are **private** IPs in **private** subnets **registered** with the LB; **SG** on LB allows **443** from clients, **SG** on targets allows **traffic only from LB** SG.

72. Outbound patches work through NAT, but **inbound SSH** from the internet to the same instance never works—what explains this if there is no bastion or VPN?
    - **Model answer:** The instance is **only private**—**NAT** does **not** expose **inbound** SSH from the internet; without **public IP**, **bastion**, **VPN**, **Session Manager**, etc., there is **no path** for internet-initiated SSH.

73. Why might **symmetric** NACL rules matter for a **stateless** filter at the subnet edge?
    - **Model answer:** Because **egress** and **ingress** are checked **independently**—**return** packets must hit an **allow** rule on the **inbound** NACL path too; **asymmetric** denies cause **silent** **drops**.

74. Compare **interface endpoint** vs **gateway endpoint** for **who** initiates and **which** services are classic examples (story-level, not exhaustive list required).
    - **Model answer:** **Gateway endpoint**—**route-table** target to **S3 / DynamoDB** (AWS-defined); **traffic stays** on AWS backbone. **Interface endpoint**—**ENI** in subnets, **private IP**, PrivateLink-style access to **many services** (and other accounts’ services); **charges** and **DNS** patterns differ—story names **S3/DynamoDB** for private corridors (gateway fits those two classically).

75. An operator says “DNS works in us-east-1 but hostnames look wrong for EC2”—which VPC **attribute** pair might you verify first?
    - **Model answer:** **`enableDnsHostnames`** and **`enableDnsSupport`**—with **DnsHostnames** off, **public** **DNS names** for instances may not behave as expected even when basic resolution works.

---

## Checklist — concepts to ensure you touched

Use this as a **coverage** checklist against your answers:

| Act / area | Concepts |
|------------|----------|
| I | VPC, Region, CIDR, subnet, AZ, multi-AZ pattern |
| II | Route table, local, IGW, NAT, egress-only IPv6, endpoints, peering (non-transitive, overlap), TGW, VPN (VGW/CGW) |
| III | Route 53 Resolver, hybrid DNS, DHCP options, Amazon DNS, DNS VPC attributes |
| IV | ENI, private/secondary IP, SG (stateful, allow, implicit deny), NACL (stateless, subnet), EIP, public vs private subnet routes |
| IV½ | Eastbound: local, endpoint, public→IGW, private→NAT→IGW; Westbound: public in, no NAT-initiated in, LB path; SG vs NACL; Flow Logs & Reachability tie-in |
| V | VPC Flow Logs, Reachability Analyzer |
| VI | PrivateLink (interface, NLB), Network Firewall |

---

### Related files

- Story: `04_vpc-core-concepts-story.md`
- Checklist (non-story): `03_aws-vpc-core-concepts.md`
- CIDR: `02_cidr-blocks-aws.md`
- Peering steps: `01_vpc-peering-setup.md`
