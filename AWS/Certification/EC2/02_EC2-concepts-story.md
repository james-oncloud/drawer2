# EC2 concepts in story form

A single narrative that walks through the ideas in `01_EC2-concepts-overview.md` — how they show up in practice, in order of a plausible “build and run” journey.

---

## 1. The city and the plot of land

Imagine **AWS** as a continent. You pick a **Region** because that is where your users and compliance live. Inside it, **Availability Zones** are isolated data centers; you never treat one AZ as a single point of failure if you care about uptime.

You draw a **VPC** — your private network. You split it into **subnets** (public for things that must talk to the internet, private for apps and data). **Route tables** decide whether traffic stays local, goes to the internet, or flows through a NAT path. You are sketching **placement** before a single server exists.

---

## 2. The blueprint: AMI and instance type

You need a **virtual server** — an **EC2 instance**. You do not start from nothing: you start from an **AMI**, a frozen recipe that says what the **root volume** looks like and what disks attach. The AMI is the “golden image” story.

Then you choose an **instance type** — the size of the engine: **vCPU**, **memory**, **network**, and whether you need **accelerated computing** or **storage-optimized** traits. That choice is the difference between “this feels snappy” and “this job never finishes.”

---

## 3. Launch: user data, IMDS, and the Nitro stage

When the instance boots, **user data** runs your first‑day script — install agents, join a domain, pull config. The **Instance Metadata Service (IMDS)** lets the app ask “who am I, which AZ am I in?” without hardcoding. On modern hardware, the **Nitro System** is the invisible stage under the instance: better performance and security isolation than older virtualization stories.

---

## 4. Paying for the show: On‑Demand, Spot, RIs, Savings Plans

**On‑Demand** is the full‑price ticket: flexible, no commitment. When you know you will run steady workloads for years, **Reserved Instances** or **Savings Plans** become the season pass — predictable cost in exchange for commitment.

**Spot Instances** are standby seats: cheap, but the show can end when the venue needs the capacity back. **Spot Fleet** or **EC2 Fleet** is the producer who mixes Spot and On‑Demand so the show goes on even when some Spot seats vanish.

If you must prove **license** or **compliance** on a specific physical host, **Dedicated Hosts** enter the story. **Dedicated Instances** and **tenancy** choices are about isolation models. **Capacity Reservations** are “hold this many seats in this AZ” without locking every attribute the way a long RI might.

---

## 5. Storage: EBS, snapshots, and instance store

The **EBS volume** is the backpack that survives the trip: **gp3** for general work, **io2** when you need sustained IOPS promises. **EBS snapshots** are time‑travel snapshots — incremental, the usual path to **backup**, **clone**, and **new AMIs**.

**Instance store** is the scratch pad taped to the seat: blazing fast, but **ephemeral** — treat it as cache, not the only copy of the crown jewels.

---

## 6. Networking: ENI, IPs, SGs, NACLs, placement groups

Each instance connects through an **Elastic Network Interface (ENI)** — a virtual NIC. **Private IPs** identify it inside the VPC; **public IPs** or an **Elastic IP** connect it to the internet when you need a stable or public face.

**Security groups** are **stateful** bouncers at the door: “this port from that source.” **Network ACLs** are **stateless** subnet‑level rules — a second line of defense.

**Enhanced networking (ENA)** is the high‑speed highway between the instance and the network.

When you need **low latency** between a few siblings (hpc‑style), **cluster placement groups** put them close. When you need **blast‑radius isolation**, **spread** placement groups separate them. **Partition** groups help very large fleets avoid correlated failure domains.

**Source/destination checks** matter when an instance acts like a **router** or **NAT instance**; the old “NAT instance” pattern is the DIY cousin of the managed **NAT Gateway**.

---

## 7. How people get in: IAM, keys, Session Manager

**IAM roles** attached via an **instance profile** give the app **temporary credentials** — no long‑lived secrets baked into the disk. **Key pairs** are for **SSH** or **Windows** initial access — useful, but not a replacement for IAM.

**Session Manager** is the quiet hero: shell access **without** opening SSH to the world, when the **SSM agent** and IAM allow it — often replacing the **bastion host** in a public subnet.

---

## 8. Scaling and resilience: ASG, load balancers, health

One instance is a solo act. **Auto Scaling groups** keep a **desired** count across **AZs**, with **min** and **max** bounds. **Elastic Load Balancing** — **ALB** for HTTP routing, **NLB** for TCP/UDP, **GWLB** for inline inspection, **CLB** legacy — spreads traffic across **targets**.

**Health checks** and **grace periods** decide whether a new instance is “ready for the stage” or should be replaced.

---

## 9. Life between shows: stop, start, reboot, terminate, hibernate

**Stop** — the lights go down; **EBS** often keeps the data; you stop paying for the instance hour (except storage). **Start** brings it back. **Reboot** is the OS restart without a new host lottery.

**Terminate** ends the story; **DeleteOnTermination** on EBS decides whether the **root volume** disappears with it.

**Hibernate** saves RAM to disk so wake‑up feels like a nap, not a cold boot — when supported.

**Instance retirement** is AWS’s letter: “we must move this hardware”; you plan **migration** or **replacement**.

---

## 10. Watching the show: CloudWatch, status checks, Systems Manager

**CloudWatch** watches **CPU**, **network**, **disk**, and custom metrics; **alarms** wake you when something breaks character. **Status checks** split **system** (hypervisor) vs **instance** (guest) problems.

**Systems Manager** runs **Patch Manager**, **Run Command**, **Parameter Store**, **Inventory** — operations without logging into every box.

**EC2 Image Builder** automates **AMI** pipelines: build, test, share — so your “golden image” story stays consistent.

---

## 11. Migration: bringing the old world

**VM Import/Export** and **Application Migration Service (MGN)** are the moving trucks: lift a **VM** or **replicate** a datacenter workload into the same AMI/instance vocabulary you use for new builds.

---

## Epilogue

In one arc: you **place** workloads in a **Region** and **VPC**, **launch** from an **AMI** with the right **type** and **user data**, **pay** with the right **purchase model**, **attach** **EBS** and maybe **instance store**, **connect** via **ENIs** and **security groups**, **authenticate** with **IAM** and optionally **Session Manager**, **scale** with **ASG** and **ELB**, **observe** with **CloudWatch**, **operate** with **SSM**, and **evolve** the image with **Image Builder** or **migrate** with **MGN** — while **lifecycle** and **retirement** remind you that infrastructure is never a static fairy tale.
